'use client';

import React, { useState } from 'react';
import { History, AlertTriangle, CheckCircle2, RotateCcw, Clock, Database, ArrowRight } from 'lucide-react';

interface TimelineEvent {
  second: number;
  timeString: string;
  title: string;
  description: string;
  type: 'base' | 'wal' | 'disaster' | 'safe';
}

const EVENTS: TimelineEvent[] = [
  {
    second: 0,
    timeString: '14:00:00 UTC',
    title: 'Physical Hot Base Snapshot',
    description: 'VaultEngine captures non-blocking baseline snapshot and streams to S3 (base_20261121_140000).',
    type: 'base',
  },
  {
    second: 15,
    timeString: '14:15:30 UTC',
    title: 'Customer Orders Batch',
    description: '3,840 transaction rows committed. WAL segment 00000001000000000000001A archived to S3.',
    type: 'wal',
  },
  {
    second: 28,
    timeString: '14:28:10 UTC',
    title: 'Payment Gateway Webhooks',
    description: 'Continuous WAL streaming actively preserving live transactions with < 3s RPO.',
    type: 'wal',
  },
  {
    second: 32,
    timeString: '14:32:04 UTC',
    title: 'Optimal Recovery Point',
    description: 'Last clean transaction committed prior to engineering operational error.',
    type: 'safe',
  },
  {
    second: 33,
    timeString: '14:32:05 UTC',
    title: 'FATAL: Accidental DROP TABLE users;',
    description: 'Junior developer executed uncontained migration script on production database.',
    type: 'disaster',
  },
];

export default function PitrSimulator() {
  const [sliderPos, setSliderPos] = useState<number>(32); // defaults to 14:32:04 safe recovery point

  // Find nearest event or interpolate state
  const isBeforeDisaster = sliderPos <= 32;
  const targetTime = sliderPos <= 32 
    ? `14:${sliderPos < 10 ? '0' : ''}${sliderPos}:00 UTC`
    : `14:32:05 UTC (Disaster Active)`;

  return (
    <div id="simulator" className="w-full max-w-5xl mx-auto my-20 px-4">
      <div className="shimmer-card p-6 sm:p-10 relative overflow-hidden">
        <div className="accent-border-top" />

        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <History className="w-3.5 h-3.5" />
            Interactive Time-Travel Engine
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Simulate Point-in-Time Recovery
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Drag the recovery scrubber below to any exact second. Watch how VaultEngine rolls back human catastrophes with zero data loss.
          </p>
        </div>

        {/* Timeline Visual Track */}
        <div className="bg-zinc-900/90 rounded-2xl p-6 sm:p-8 border border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                Live Transaction Log Stream
              </span>
            </div>
            <div className="text-xs font-mono text-zinc-500">
              S3 Storage: <span className="text-emerald-400 font-semibold">Continuous WAL Active</span>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="relative my-8">
            <input
              type="range"
              min="0"
              max="35"
              step="1"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 relative z-10"
            />

            {/* Marker pins */}
            <div className="flex justify-between text-xs font-mono mt-3 text-zinc-400">
              <span className="text-indigo-400">14:00:00 (Base)</span>
              <span>14:15:30</span>
              <span>14:28:10</span>
              <span className="text-emerald-400 font-bold">14:32:04 (Safe)</span>
              <span className="text-rose-400 font-bold">14:32:05 (DROP)</span>
            </div>
          </div>

          {/* Dynamic Recovery Status Box */}
          <div className={`mt-8 p-5 sm:p-6 rounded-xl border transition-all ${
            isBeforeDisaster
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                {isBeforeDisaster ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-wider">
                      {isBeforeDisaster ? 'Clean Point-in-Time Restore' : 'Disaster State Triggered'}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700">
                      {sliderPos === 32 ? '14:32:04 UTC' : targetTime}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                    {isBeforeDisaster
                      ? `Replaying Base Snapshot (14:00:00) + ${sliderPos} streamed WAL segments from Amazon S3. Table 'users' 100% preserved!`
                      : "Unfiltered drop transaction reached. Database table 'users' lost. Drag slider left to 14:32:04 to recover!"}
                  </p>
                </div>
              </div>

              {isBeforeDisaster ? (
                <button
                  type="button"
                  onClick={() => setSliderPos(32)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Staged For Restore
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSliderPos(32)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Rollback to 14:32:04
                </button>
              )}
            </div>

            {/* Generated CLI Command Preview */}
            <div className="mt-4 pt-4 border-t border-zinc-800/80 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between text-zinc-400 gap-2">
              <span className="text-zinc-500">CLI Command Executed:</span>
              <span className="text-indigo-300 bg-zinc-900/90 px-3 py-1.5 rounded border border-zinc-800">
                vaultengine restore --to &quot;2026-11-21 14:32:04 UTC&quot; --into /var/lib/postgresql/restored
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
