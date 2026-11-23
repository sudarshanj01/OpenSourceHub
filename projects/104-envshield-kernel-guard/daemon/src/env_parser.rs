/// Parses .env formatted plaintext into key-value pairs
pub fn parse_env_content(content: &str) -> Vec<(String, String)> {
    let mut vars = Vec::new();

    for line in content.lines() {
        let trimmed = line.trim();

        // Skip comments and empty lines
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        // Strip optional 'export '
        let clean_line = if let Some(stripped) = trimmed.strip_prefix("export ") {
            stripped.trim()
        } else {
            trimmed
        };

        if let Some(eq_idx) = clean_line.find('=') {
            let key = clean_line[..eq_idx].trim().to_string();
            let mut val = clean_line[eq_idx + 1..].trim().to_string();

            // Strip surrounding quotes
            if (val.starts_with('"') && val.ends_with('"'))
                || (val.starts_with('\'') && val.ends_with('\''))
            {
                if val.len() >= 2 {
                    val = val[1..val.len() - 1].to_string();
                }
            }

            if !key.is_empty() {
                vars.push((key, val));
            }
        }
    }

    vars
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_env() {
        let text = r#"
# Comment
PORT=3000
DATABASE_URL="postgres://user:pass@localhost:5432/db"
export API_KEY='sk_test_12345'
EMPTY=
"#;
        let vars = parse_env_content(text);
        assert_eq!(vars.len(), 4);
        assert_eq!(vars[0], ("PORT".to_string(), "3000".to_string()));
        assert_eq!(
            vars[1],
            (
                "DATABASE_URL".to_string(),
                "postgres://user:pass@localhost:5432/db".to_string()
            )
        );
        assert_eq!(vars[2], ("API_KEY".to_string(), "sk_test_12345".to_string()));
        assert_eq!(vars[3], ("EMPTY".to_string(), "".to_string()));
    }
}
