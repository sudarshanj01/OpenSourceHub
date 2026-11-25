use anyhow::{Context, Result};
use chrono::Utc;
use colored::*;
use hmac::{Hmac, Mac};
use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::time::Duration;

type HmacSha256 = Hmac<Sha256>;

const IMDS_TOKEN_URL: &str = "http://169.254.169.254/latest/api/token";
const IMDS_IAM_URL: &str = "http://169.254.169.254/latest/meta-data/iam/security-credentials/";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AwsCredentials {
    #[serde(rename = "AccessKeyId")]
    pub access_key_id: String,
    #[serde(rename = "SecretAccessKey")]
    pub secret_access_key: String,
    #[serde(rename = "Token")]
    pub session_token: Option<String>,
}

pub async fn check_imds_v2() -> bool {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_millis(1500))
        .build();

    if let Ok(client) = client {
        let res = client
            .put(IMDS_TOKEN_URL)
            .header("X-aws-ec2-metadata-token-ttl-seconds", "21600")
            .send()
            .await;

        if let Ok(resp) = res {
            return resp.status().is_success();
        }
    }
    false
}

pub async fn get_imds_credentials() -> Result<AwsCredentials> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .build()?;

    let token = client
        .put(IMDS_TOKEN_URL)
        .header("X-aws-ec2-metadata-token-ttl-seconds", "21600")
        .send()
        .await
        .context("Failed to connect to EC2 IMDSv2. Are you on an AWS EC2 instance?")?
        .text()
        .await?;

    let role_name = client
        .get(IMDS_IAM_URL)
        .header("X-aws-ec2-metadata-token", &token)
        .send()
        .await?
        .text()
        .await?;

    let role_name = role_name.trim();
    if role_name.is_empty() {
        anyhow::bail!("No IAM role attached to this EC2 instance. Attach an IAM role with S3 permissions.");
    }

    let creds_url = format!("{}{}", IMDS_IAM_URL, role_name);
    let creds_json = client
        .get(&creds_url)
        .header("X-aws-ec2-metadata-token", &token)
        .send()
        .await?
        .json::<AwsCredentials>()
        .await?;

    Ok(creds_json)
}

pub async fn resolve_credentials(use_iam: bool) -> Result<AwsCredentials> {
    if use_iam {
        if let Ok(creds) = get_imds_credentials().await {
            return Ok(creds);
        }
    }

    let access_key = std::env::var("AWS_ACCESS_KEY_ID")
        .or_else(|_| std::env::var("S3_ACCESS_KEY"))
        .context("No AWS IAM role detected and AWS_ACCESS_KEY_ID environment variable is missing")?;
    let secret_key = std::env::var("AWS_SECRET_ACCESS_KEY")
        .or_else(|_| std::env::var("S3_SECRET_KEY"))
        .context("AWS_SECRET_ACCESS_KEY environment variable is missing")?;
    let session_token = std::env::var("AWS_SESSION_TOKEN").ok();

    Ok(AwsCredentials {
        access_key_id: access_key,
        secret_access_key: secret_key,
        session_token,
    })
}

/// S3 Client with SigV4 Signing (supports AWS S3 virtual-hosted & custom path-style endpoints like MinIO)
pub struct S3Client {
    pub bucket: String,
    pub region: String,
    pub endpoint: Option<String>,
    pub creds: AwsCredentials,
    client: reqwest::Client,
}

impl S3Client {
    pub async fn new(
        bucket: String,
        region: String,
        endpoint: Option<String>,
        use_iam: bool,
    ) -> Result<Self> {
        let creds = resolve_credentials(use_iam).await?;
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(300))
            .build()?;

        Ok(Self {
            bucket,
            region,
            endpoint,
            creds,
            client,
        })
    }

    pub fn s3_host(&self) -> String {
        if let Some(ref ep) = self.endpoint {
            ep.trim_start_matches("https://")
                .trim_start_matches("http://")
                .trim_end_matches('/')
                .to_string()
        } else {
            format!("{}.s3.{}.amazonaws.com", self.bucket, self.region)
        }
    }

    pub fn canonical_uri(&self, key: &str) -> String {
        let clean = key.trim_start_matches('/');
        if self.endpoint.is_some() {
            if clean.is_empty() {
                format!("/{}", self.bucket)
            } else {
                format!("/{}/{}", self.bucket, clean)
            }
        } else if clean.is_empty() {
            "/".to_string()
        } else {
            format!("/{}", clean)
        }
    }

    pub fn s3_url(&self, key: &str) -> String {
        let clean_key = key.trim_start_matches('/');
        if let Some(ref ep) = self.endpoint {
            let base = ep.trim_end_matches('/');
            if clean_key.is_empty() {
                format!("{}/{}", base, self.bucket)
            } else {
                format!("{}/{}/{}", base, self.bucket, clean_key)
            }
        } else if clean_key.is_empty() {
            format!("https://{}.s3.{}.amazonaws.com/", self.bucket, self.region)
        } else {
            format!("https://{}.s3.{}.amazonaws.com/{}", self.bucket, self.region, clean_key)
        }
    }

    pub async fn ensure_bucket(&self) -> Result<()> {
        let url = self.s3_url("");
        let canonical_uri = self.canonical_uri("");
        let payload_hash = hex::encode(Sha256::digest(b""));

        let headers = self.build_signed_headers("HEAD", &canonical_uri, "", &payload_hash, None)?;
        let res = self.client.head(&url).headers(headers).send().await?;
        if res.status().is_success() {
            return Ok(());
        }

        let put_headers = self.build_signed_headers("PUT", &canonical_uri, "", &payload_hash, None)?;
        let put_res = self.client.put(&url).headers(put_headers).send().await?;
        if !put_res.status().is_success() && put_res.status().as_u16() != 409 {
            let status = put_res.status();
            let body = put_res.text().await.unwrap_or_default();
            anyhow::bail!("S3 CreateBucket failed ({}): {}", status, body);
        }
        Ok(())
    }

    pub async fn put_object(&self, key: &str, data: Vec<u8>, content_type: &str) -> Result<String> {
        let url = self.s3_url(key);
        let canonical_uri = self.canonical_uri(key);
        let payload_hash = hex::encode(Sha256::digest(&data));

        let headers = self.build_signed_headers(
            "PUT",
            &canonical_uri,
            "",
            &payload_hash,
            Some(content_type),
        )?;

        let res = self
            .client
            .put(&url)
            .headers(headers)
            .body(data)
            .send()
            .await?;

        if !res.status().is_success() {
            let status = res.status();
            let body = res.text().await.unwrap_or_default();
            anyhow::bail!("S3 PutObject failed ({}): {}", status, body);
        }

        Ok(payload_hash)
    }

    pub async fn get_object(&self, key: &str) -> Result<Vec<u8>> {
        let url = self.s3_url(key);
        let canonical_uri = self.canonical_uri(key);
        let payload_hash = hex::encode(Sha256::digest(b""));

        let headers = self.build_signed_headers("GET", &canonical_uri, "", &payload_hash, None)?;
        let res = self.client.get(&url).headers(headers).send().await?;
        if !res.status().is_success() {
            anyhow::bail!(
                "S3 GetObject failed ({}): {}",
                res.status(),
                res.text().await.unwrap_or_default()
            );
        }

        Ok(res.bytes().await?.to_vec())
    }

    pub async fn list_objects(&self, prefix: &str) -> Result<Vec<String>> {
        let encoded_prefix = url_encode_query(prefix.trim_start_matches('/'));
        // Parameters in canonical query string must be sorted alphabetically by name
        let canonical_query = format!("list-type=2&prefix={}", encoded_prefix);
        let url = format!("{}?{}", self.s3_url(""), canonical_query);
        let canonical_uri = self.canonical_uri("");
        let payload_hash = hex::encode(Sha256::digest(b""));

        let headers = self.build_signed_headers(
            "GET",
            &canonical_uri,
            &canonical_query,
            &payload_hash,
            None,
        )?;

        let res = self.client.get(&url).headers(headers).send().await?;
        if !res.status().is_success() {
            anyhow::bail!(
                "S3 ListObjectsV2 failed ({}): {}",
                res.status(),
                res.text().await.unwrap_or_default()
            );
        }

        let xml = res.text().await?;
        Ok(parse_list_objects_xml(&xml))
    }

    fn build_signed_headers(
        &self,
        method: &str,
        canonical_uri: &str,
        canonical_query: &str,
        payload_hash: &str,
        content_type: Option<&str>,
    ) -> Result<HeaderMap> {
        let now = Utc::now();
        let amz_date = now.format("%Y%m%dT%H%M%SZ").to_string();
        let date_stamp = now.format("%Y%m%d").to_string();
        let host = self.s3_host();

        let mut headers = HeaderMap::new();
        headers.insert(reqwest::header::HOST, HeaderValue::from_str(&host)?);
        headers.insert(
            HeaderName::from_static("x-amz-date"),
            HeaderValue::from_str(&amz_date)?,
        );
        headers.insert(
            HeaderName::from_static("x-amz-content-sha256"),
            HeaderValue::from_str(payload_hash)?,
        );

        if let Some(ct) = content_type {
            headers.insert(reqwest::header::CONTENT_TYPE, HeaderValue::from_str(ct)?);
        }

        if let Some(ref token) = self.creds.session_token {
            headers.insert(
                HeaderName::from_static("x-amz-security-token"),
                HeaderValue::from_str(token)?,
            );
        }

        let auth = self.sign_request(
            method,
            canonical_uri,
            canonical_query,
            &headers,
            payload_hash,
            &amz_date,
            &date_stamp,
        )?;
        headers.insert(reqwest::header::AUTHORIZATION, HeaderValue::from_str(&auth)?);
        Ok(headers)
    }

    #[allow(clippy::too_many_arguments)]
    fn sign_request(
        &self,
        method: &str,
        canonical_uri: &str,
        canonical_query: &str,
        headers: &HeaderMap,
        payload_hash: &str,
        amz_date: &str,
        date_stamp: &str,
    ) -> Result<String> {
        let mut signed_headers_vec: Vec<String> = headers
            .keys()
            .map(|k| k.as_str().to_lowercase())
            .collect();
        signed_headers_vec.sort();
        let signed_headers = signed_headers_vec.join(";");

        let mut canonical_headers = String::new();
        for h in &signed_headers_vec {
            if let Some(val) = headers.get(h) {
                canonical_headers.push_str(&format!("{}:{}\n", h, val.to_str()?.trim()));
            }
        }

        let canonical_request = format!(
            "{}\n{}\n{}\n{}\n{}\n{}",
            method, canonical_uri, canonical_query, canonical_headers, signed_headers, payload_hash
        );

        let canonical_request_hash = hex::encode(Sha256::digest(canonical_request.as_bytes()));
        let credential_scope = format!("{}/{}/s3/aws4_request", date_stamp, self.region);
        let string_to_sign = format!(
            "AWS4-HMAC-SHA256\n{}\n{}\n{}",
            amz_date, credential_scope, canonical_request_hash
        );

        let k_secret = format!("AWS4{}", self.creds.secret_access_key);
        let k_date = hmac_sha256(k_secret.as_bytes(), date_stamp.as_bytes())?;
        let k_region = hmac_sha256(&k_date, self.region.as_bytes())?;
        let k_service = hmac_sha256(&k_region, b"s3")?;
        let k_signing = hmac_sha256(&k_service, b"aws4_request")?;
        let signature = hex::encode(hmac_sha256(&k_signing, string_to_sign.as_bytes())?);

        Ok(format!(
            "AWS4-HMAC-SHA256 Credential={}/{}, SignedHeaders={}, Signature={}",
            self.creds.access_key_id, credential_scope, signed_headers, signature
        ))
    }
}

pub fn parse_list_objects_xml(xml: &str) -> Vec<String> {
    let mut keys = Vec::new();
    let mut rest = xml;
    while let Some(start) = rest.find("<Key>") {
        let after_start = &rest[start + 5..];
        if let Some(end) = after_start.find("</Key>") {
            keys.push(after_start[..end].to_string());
            rest = &after_start[end + 6..];
        } else {
            break;
        }
    }
    keys
}

fn url_encode_query(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    for b in input.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(b as char);
            }
            _ => out.push_str(&format!("%{:02X}", b)),
        }
    }
    out
}

fn hmac_sha256(key: &[u8], data: &[u8]) -> Result<Vec<u8>> {
    let mut mac = HmacSha256::new_from_slice(key).map_err(|e| anyhow::anyhow!("{}", e))?;
    mac.update(data);
    Ok(mac.finalize().into_bytes().to_vec())
}

pub async fn run_doctor() -> Result<()> {
    println!("{}", "=== Running VaultEngine S3 & IAM Diagnostics ===".bold().cyan());

    println!("1. Checking EC2 IMDSv2 token endpoint...");
    let imds = check_imds_v2().await;
    if imds {
        println!("   {} IMDSv2 reachable and responding.", "[PASS]".green());
        if let Ok(creds) = get_imds_credentials().await {
            println!(
                "   {} IAM credentials acquired via EC2 profile (Key ID: ...{})",
                "[PASS]".green(),
                &creds.access_key_id[creds.access_key_id.len().saturating_sub(4)..]
            );
        } else {
            println!("   {} IMDSv2 reached, but no IAM role attached.", "[WARN]".yellow());
        }
    } else {
        println!("   {} Not running on EC2 or IMDSv2 unavailable (will use env vars).", "[INFO]".yellow());
    }

    println!("\n2. Checking AWS environment variables...");
    if std::env::var("AWS_ACCESS_KEY_ID").is_ok() {
        println!("   {} Found AWS_ACCESS_KEY_ID in environment.", "[PASS]".green());
    } else {
        println!("   {} No AWS_ACCESS_KEY_ID in environment (OK if using EC2 IAM Role).", "[INFO]".yellow());
    }

    println!("\n{} Diagnostics complete.", "[DONE]".green().bold());
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn mock_client(endpoint: Option<&str>) -> S3Client {
        S3Client {
            bucket: "my-vault-bucket".to_string(),
            region: "us-east-1".to_string(),
            endpoint: endpoint.map(|s| s.to_string()),
            creds: AwsCredentials {
                access_key_id: "AKIAIOSFODNN7EXAMPLE".to_string(),
                secret_access_key: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY".to_string(),
                session_token: None,
            },
            client: reqwest::Client::new(),
        }
    }

    #[test]
    fn test_canonical_uri_and_url_aws() {
        let c = mock_client(None);
        assert_eq!(c.s3_host(), "my-vault-bucket.s3.us-east-1.amazonaws.com");
        assert_eq!(c.canonical_uri("wal/0001.gz"), "/wal/0001.gz");
        assert_eq!(
            c.s3_url("wal/0001.gz"),
            "https://my-vault-bucket.s3.us-east-1.amazonaws.com/wal/0001.gz"
        );
    }

    #[test]
    fn test_canonical_uri_and_url_minio_path_style() {
        let c = mock_client(Some("http://127.0.0.1:9000"));
        assert_eq!(c.s3_host(), "127.0.0.1:9000");
        assert_eq!(c.canonical_uri("wal/0001.gz"), "/my-vault-bucket/wal/0001.gz");
        assert_eq!(c.canonical_uri(""), "/my-vault-bucket");
        assert_eq!(
            c.s3_url("wal/0001.gz"),
            "http://127.0.0.1:9000/my-vault-bucket/wal/0001.gz"
        );
    }

    #[test]
    fn test_parse_list_objects_xml() {
        let xml = r#"<ListBucketResult><Contents><Key>vault/snapshots/base_1.tar.gz</Key></Contents><Contents><Key>vault/wal/0001.gz</Key></Contents></ListBucketResult>"#;
        let keys = parse_list_objects_xml(xml);
        assert_eq!(
            keys,
            vec!["vault/snapshots/base_1.tar.gz", "vault/wal/0001.gz"]
        );
    }
}
