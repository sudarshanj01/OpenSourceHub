'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, Shield, Server, FileText } from 'lucide-react';

export default function QuickstartTabs() {
  const [activeTab, setActiveTab] = useState<'postgres' | 'mysql' | 'iam'>('postgres');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const installCmd = "curl -sSL https://get.vaultengine.io | sudo bash";

  const postgresConfig = `# Add to /etc/postgresql/<version>/main/postgresql.conf:
wal_level = replica
archive_mode = on
archive_command = 'vaultengine archive-wal %p %f'
archive_timeout = 60`;

  const mysqlConfig = `# Add to /etc/mysql/my.cnf [mysqld] section:
server-id = 1
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
binlog_row_image = FULL
gtid_mode = ON
enforce_gtid_consistency = ON`;

  const iamPolicyJson = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VaultEngineS3Access",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:PutObject",
        "s3:GetObject",
        "s3:AbortMultipartUpload",
        "s3:ListBucketMultipartUploads"
      ],
      "Resource": [
        "arn:aws:s3:::vaultengine-*",
        "arn:aws:s3:::vaultengine-*/*"
      ]
    }
  ]
}`;

  return (
    <div id="quickstart" className="w-full max-w-5xl mx-auto my-20 px-4">
      <div className="shimmer-card p-6 sm:p-10 relative overflow-hidden">
        <div className="accent-border-top" />

        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Terminal className="w-3.5 h-3.5" />
            Zero-Friction Deployment
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Deploy in Under 60 Seconds
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            No complex YAML templates, no manual cron scripts. Single static binary with automated EC2 IAM discovery.
          </p>
        </div>

        {/* 1-Line Universal Installer */}
        <div className="bg-zinc-900/90 rounded-2xl p-6 border border-zinc-800 mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              1-Line Standalone Shell Installer
            </span>
            <span className="text-xs text-emerald-400 font-mono">Linux x86_64 / arm64</span>
          </div>
          <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 font-mono text-sm overflow-x-auto gap-4">
            <span className="text-indigo-300 select-all">$ {installCmd}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(installCmd, 'install')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex-shrink-0"
            >
              {copied === 'install' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Engine Tabs */}
        <div className="flex border-b border-zinc-800 mb-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('postgres')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'postgres'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            PostgreSQL Configuration
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mysql')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'mysql'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            MySQL / MariaDB Configuration
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('iam')}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'iam'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            AWS IAM Policy (Zero-Secret)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'postgres' && (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-zinc-400">
              VaultEngine hooks into PostgreSQL native WAL archiving. Add these lines to enable continuous transaction streaming with a guaranteed 60-second maximum RPO under zero traffic:
            </p>
            <div className="relative">
              <pre className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
                {postgresConfig}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(postgresConfig, 'pg')}
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs"
              >
                {copied === 'pg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Then reload PostgreSQL: <code className="text-indigo-400 font-mono">sudo systemctl reload postgresql</code>
            </p>
          </div>
        )}

        {activeTab === 'mysql' && (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-zinc-400">
              Enable binary logging and Global Transaction Identifiers (GTID) in your MySQL configuration for consistent transaction replication directly to S3:
            </p>
            <div className="relative">
              <pre className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
                {mysqlConfig}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(mysqlConfig, 'my')}
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs"
              >
                {copied === 'my' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Then restart MySQL: <code className="text-indigo-400 font-mono">sudo systemctl restart mysql</code>
            </p>
          </div>
        )}

        {activeTab === 'iam' && (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-zinc-400">
              Attach this minimal least-privilege IAM policy to your EC2 Instance Role. VaultEngine queries temporary STS tokens via IMDSv2—no static secret keys ever stored:
            </p>
            <div className="relative">
              <pre className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto max-h-64">
                {iamPolicyJson}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(iamPolicyJson, 'iam')}
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs"
              >
                {copied === 'iam' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
