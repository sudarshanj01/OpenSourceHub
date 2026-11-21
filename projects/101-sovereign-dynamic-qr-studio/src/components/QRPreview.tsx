"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Sparkles, Check, Copy, ExternalLink, ShieldCheck } from "lucide-react";

export interface QRStyleOptions {
  dotType: "square" | "dots" | "rounded" | "extra-rounded" | "classy" | "classy-rounded";
  cornerSquareType: "square" | "extra-rounded" | "dot";
  cornerDotType: "square" | "dot";
  dotsColor: string;
  gradientEnabled: boolean;
  gradientType: "linear" | "radial";
  gradientStart: string;
  gradientEnd: string;
  gradientRotation: number;
  bgColor: string;
  logoUrl?: string;
  logoSize?: number;
  frameEnabled?: boolean;
  frameText?: string;
  frameColor?: string;
}

interface QRPreviewProps {
  data: string;
  options: QRStyleOptions;
  title?: string;
  slug?: string;
  isDynamic?: boolean;
}

export function QRPreview({ data, options, title, slug, isDynamic }: QRPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeInstanceRef = useRef<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initQR() {
      if (typeof window === "undefined") return;

      const QRCodeStyling = (await import("qr-code-styling")).default;

      const dotsOptions: any = {
        type: options.dotType || "rounded",
      };

      if (options.gradientEnabled) {
        dotsOptions.gradient = {
          type: options.gradientType || "linear",
          rotation: (options.gradientRotation || 45) * (Math.PI / 180),
          colorStops: [
            { offset: 0, color: options.gradientStart || "#0284c7" },
            { offset: 1, color: options.gradientEnd || "#06b6d4" },
          ],
        };
      } else {
        dotsOptions.color = options.dotsColor || "#0284c7";
      }

      const qrConfig: any = {
        width: 300,
        height: 300,
        type: "svg",
        data: data || "https://example.com",
        margin: 8,
        qrOptions: {
          typeNumber: 0,
          mode: "Byte",
          errorCorrectionLevel: "Q",
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: options.logoSize || 0.32,
          margin: 4,
          crossOrigin: "anonymous",
        },
        dotsOptions,
        backgroundOptions: {
          color: options.bgColor || "#ffffff",
        },
        cornersSquareOptions: {
          type: options.cornerSquareType || "extra-rounded",
          color: options.gradientEnabled ? options.gradientStart : options.dotsColor || "#0284c7",
        },
        cornersDotOptions: {
          type: options.cornerDotType || "dot",
          color: options.gradientEnabled ? options.gradientEnd : options.dotsColor || "#0284c7",
        },
      };

      if (options.logoUrl && options.logoUrl.trim().length > 0) {
        qrConfig.image = options.logoUrl.trim();
      }

      if (!qrCodeInstanceRef.current) {
        qrCodeInstanceRef.current = new QRCodeStyling(qrConfig);
        if (containerRef.current && isMounted) {
          containerRef.current.innerHTML = "";
          qrCodeInstanceRef.current.append(containerRef.current);
        }
      } else {
        qrCodeInstanceRef.current.update(qrConfig);
      }
    }

    initQR();

    return () => {
      isMounted = false;
    };
  }, [data, options]);

  const handleDownload = async (extension: "png" | "svg") => {
    if (!qrCodeInstanceRef.current) return;
    setDownloading(true);
    try {
      const fileName = slug ? `qr-${slug}` : "qr-code";
      await qrCodeInstanceRef.current.download({
        name: fileName,
        extension,
      });
      setDownloadSuccess(extension);
      setTimeout(() => setDownloadSuccess(null), 2500);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (!data) return;
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showFrame = options.frameEnabled && options.frameText && options.frameText.trim().length > 0;
  const frameColor = options.frameColor || "#0284c7";

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Physical Stand / Card Mockup */}
      <div
        className="w-full p-6 rounded-3xl bg-white shadow-2xl transition-all duration-300 flex flex-col items-center relative overflow-hidden"
        style={{
          border: showFrame ? `4px solid ${frameColor}` : "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px -5px rgba(2, 132, 199, 0.15)",
        }}
      >
        {/* Frame Top Header */}
        {showFrame && (
          <div
            className="w-full text-center py-2 px-3 rounded-xl text-white font-extrabold text-xs tracking-widest uppercase mb-4 shadow-sm"
            style={{
              backgroundColor: frameColor,
            }}
          >
            {options.frameText}
          </div>
        )}

        {/* QR Code Canvas */}
        <div
          ref={containerRef}
          className="rounded-2xl overflow-hidden flex items-center justify-center p-2 bg-white min-h-[300px] min-w-[300px]"
        />

        {/* Frame Bottom Tag */}
        <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px] truncate max-w-[190px]">
            <span
              className={`w-2 h-2 rounded-full ${
                isDynamic ? "bg-sky-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
            {isDynamic ? "Dynamic Redirect" : "Offline Static"}
          </span>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Never Expires
          </span>
        </div>
      </div>

      {/* Export Action Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3 w-full">
        <button
          type="button"
          onClick={() => handleDownload("png")}
          disabled={downloading}
          className="py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
        >
          {downloadSuccess === "png" ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleDownload("svg")}
          disabled={downloading}
          className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
        >
          {downloadSuccess === "svg" ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Vector Saved!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Vector SVG</span>
            </>
          )}
        </button>
      </div>

      {/* Target Link & Copy Bar */}
      <div className="mt-4 w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-inner">
        <span className="text-xs text-slate-400 font-mono truncate px-1 flex-1" title={data}>
          {data}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy Link"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Copy link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {isDynamic && (
            <a
              href={data}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors inline-flex items-center justify-center"
              title="Test redirect in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
