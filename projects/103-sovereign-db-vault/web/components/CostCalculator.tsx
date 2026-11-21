'use client';

import React, { useState } from 'react';
import { DollarSign, TrendingDown, Server, ShieldCheck, Zap } from 'lucide-react';

export default function CostCalculator() {
  const [storageGb, setStorageGb] = useState<number>(500);
  const [iops, setIops] = useState<number>(3000);
  const [multiAz, setMultiAz] = useState<boolean>(true);
  const [retentionDays, setRetentionDays] = useState<number>(14);

  // Approximate AWS Pricing Models:
  // EC2 m6g.xlarge (4 vCPU, 16GB RAM) ~ $112/mo
  // RDS db.m6g.xlarge (Multi-AZ = 2x) ~ $224/mo (Single AZ), $448/mo (Multi-AZ)
  // EBS gp3: $0.08/GB-mo
  // RDS storage: $0.115/GB-mo (Multi-AZ doubles storage cost to $0.23/GB-mo)
  // S3 standard backup storage: $0.023/GB-mo
  // RDS backup overage: $0.095/GB-mo

  const ec2Compute = 112; // m6g.xlarge
  const rdsCompute = multiAz ? 448 : 224;

  const ec2Storage = storageGb * 0.08;
  const rdsStorage = multiAz ? storageGb * 0.23 : storageGb * 0.115;

  // S3 Backup Storage: Daily incremental changes (~5% churn/day) * retention
  const backupDataGb = storageGb + (storageGb * 0.05 * retentionDays);
  const s3BackupCost = backupDataGb * 0.023;
  // RDS backup: Free up to 1x DB size, then $0.095/GB
  const rdsBackupOverheadGb = Math.max(0, backupDataGb - storageGb);
  const rdsBackupCost = rdsBackupOverheadGb * 0.095;

  // IOPS cost above baseline 3000
  const extraIops = Math.max(0, iops - 3000);
  const iopsCost = extraIops * 0.005;

  const totalRdsMonthly = Math.round(rdsCompute + rdsStorage + rdsBackupCost + iopsCost);
  const totalSovereignMonthly = Math.round(ec2Compute + ec2Storage + s3BackupCost + iopsCost);

  const monthlySavings = Math.max(0, totalRdsMonthly - totalSovereignMonthly);
  const annualSavings = monthlySavings * 12;
  const savingsPercent = Math.round((monthlySavings / totalRdsMonthly) * 100);

  return (
    <div id="calculator" className="w-full max-w-5xl mx-auto my-20 px-4">
      <div className="shimmer-card p-6 sm:p-10 relative overflow-hidden">
        <div className="accent-border-top" />

        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <DollarSign className="w-3.5 h-3.5" />
            ROI & Cost Comparison
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Calculate Your Cloud Database Savings
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            See how much AWS RDS markup you eliminate by pairing standard EC2 compute with VaultEngine continuous S3 archiving.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-zinc-300">Database Storage Footprint</label>
                <span className="text-sm font-mono font-semibold text-indigo-400">{storageGb} GB</span>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={storageGb}
                onChange={(e) => setStorageGb(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>50 GB</span>
                <span>2,500 GB</span>
                <span>5,000 GB (5 TB)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-zinc-300">Provisioned IOPS (gp3 / io2)</label>
                <span className="text-sm font-mono font-semibold text-indigo-400">{iops.toLocaleString()} IOPS</span>
              </div>
              <input
                type="range"
                min="3000"
                max="20000"
                step="500"
                value={iops}
                onChange={(e) => setIops(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>3,000 Baseline</span>
                <span>10,000</span>
                <span>20,000 High-Throughput</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-300">Multi-AZ Redundancy</span>
                  <button
                    type="button"
                    onClick={() => setMultiAz(!multiAz)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      multiAz ? 'bg-indigo-600' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        multiAz ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  {multiAz ? 'RDS doubles compute & storage price.' : 'Single AZ configuration.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-zinc-300">PITR Retention Window</span>
                  <span className="text-xs font-mono text-indigo-400 font-semibold">{retentionDays} Days</span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="35"
                  step="7"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                />
              </div>
            </div>
          </div>

          {/* Results Bento Card */}
          <div className="lg:col-span-5 bg-gradient-to-b from-indigo-950/40 via-zinc-900/90 to-zinc-900 p-6 sm:p-8 rounded-2xl border border-indigo-500/20 shadow-xl">
            <div className="text-xs uppercase font-mono tracking-wider text-indigo-300/80 mb-2">
              Annual Infrastructure Impact
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono">
                ${annualSavings.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-emerald-400 flex items-center">
                <TrendingDown className="w-4 h-4 mr-0.5 inline" /> -{savingsPercent}%
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Saved every single year compared to equivalent AWS RDS infrastructure.
            </p>

            <div className="space-y-3 pt-4 border-t border-zinc-800 text-sm">
              <div className="flex justify-between items-center text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-rose-400" />
                  AWS RDS Monthly Total:
                </span>
                <span className="font-mono text-zinc-300 line-through">${totalRdsMonthly}/mo</span>
              </div>

              <div className="flex justify-between items-center text-zinc-200 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  EC2 + S3 + VaultEngine:
                </span>
                <span className="font-mono text-emerald-400 font-bold">${totalSovereignMonthly}/mo</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Identical continuous PITR, zero RDS markup, 100% data sovereignty.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
