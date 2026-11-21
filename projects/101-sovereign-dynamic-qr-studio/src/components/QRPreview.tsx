"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@ui-sdk/react/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@ui-sdk/react/tooltip";
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initQR() {
      if (typeof window === "undefined") return;

      const QRCodeStyling = (await import("qr-code-styling")).default;

      // Construct gradient or solid options
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
        width: 320,
        height: 320,
        type: "svg",
        data: data || "https://opensourcesoftware.org",
        margin: 10,
        qrOptions: {
          typeNumber: 0,
          mode: "Byte",
          errorCorrectionLevel: "Q", // High error correction to allow center logos
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: options.logoSize || 0.35,
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
      const fileName = slug ? `qrshield-${slug}` : "qrshield-code";
      await qrCodeInstanceRef.current.download({
        name: fileName,
        extension,
      });
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

  return (
    <div className="flex flex-col items-center">
      {/* Outer Card with Frame Support */}
      <div
        className="p-6 rounded-3xl bg-white shadow-2xl transition-all border-4 flex flex-col items-center relative overflow-hidden"
        style={{
          borderColor: options.frameColor || "#0284c7",
          maxWidth: "370px",
        }}
      >
        {/* Frame Top Header */}
        {options.frameText && options.frameText.trim().length > 0 && (
          <div
            className="w-full text-center py-2 px-4 rounded-xl text-white font-black text-sm tracking-widest uppercase mb-4 shadow-sm"
            style={{
              backgroundColor: options.frameColor || "#0284c7",
            }}
          >
            {options.frameText}
          </div>
        )}

        {/* QR Canvas Render */}
        <div
          ref={containerRef}
          className="rounded-2xl overflow-hidden flex items-center justify-center p-2 bg-white"
        />

        {/* Frame Bottom Tag */}
        <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1 text-slate-600 font-semibold truncate max-w-[200px]">
            {isDynamic ? "⚡ Sovereign Dynamic" : "🔒 Serverless Static"}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
            100% Free
          </span>
        </div>
      </div>

      {/* Action Buttons using @ui-sdk/react Button and Tooltip */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center w-full max-w-sm">
        <Tooltip>
          <TooltipTrigger
            onClick={() => handleDownload("png")}
            disabled={downloading}
            className="flex-1 min-w-[130px] py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PNG
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg shadow-xl">
            High-Resolution 300 DPI for screens, menus & cards
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            onClick={() => handleDownload("svg")}
            disabled={downloading}
            className="flex-1 min-w-[130px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs border border-slate-700 shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            Vector SVG
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg shadow-xl">
            Infinitely scalable vector file for commercial vinyl & print shops
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Target Link & Copy Bar */}
      <div className="mt-4 w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400 font-mono truncate px-1" title={data}>
          {data}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            onClick={handleCopyLink}
            aria-label="Copy Target Link"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          {isDynamic && (
            <a
              href={data}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors inline-flex items-center justify-center"
              title="Test Redirect"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
