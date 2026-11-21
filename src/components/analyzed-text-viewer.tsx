"use client";

import { useMemo, useState } from "react";
import {
  LuCheck,
  LuCopy,
  LuFileWarning,
  LuLink2,
  LuMessageSquare,
  LuSmartphone,
} from "react-icons/lu";

type ArtifactType = "file" | "link" | "nominal";

interface TextSegment {
  text: string;
  type: ArtifactType | null;
}

const ARTIFACT_REGEX =
  /(https?:\/\/[^\s]+|(?:bit\.ly|tinyurl\.com|s\.id|wa\.me)\/[^\s]+|[a-zA-Z0-9_.-]+\.(?:apk|exe|bat|scr|msi|zip)\b|Rp\s?[\d.,]+)/gi;

function classifyArtifact(value: string): ArtifactType {
  if (/\.(apk|exe|bat|scr|msi|zip)$/i.test(value)) return "file";
  if (/^(https?:\/\/|bit\.ly|tinyurl\.com|s\.id|wa\.me)/i.test(value))
    return "link";
  return "nominal";
}

export function AnalyzedTextViewer({
  text,
  isDocument = false,
}: {
  text: string;
  isDocument?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const { segments, artifacts } = useMemo(() => {
    const resultSegments: TextSegment[] = [];
    const uniqueArtifacts = new Map<string, ArtifactType>();

    let lastIndex = 0;
    for (const match of text.matchAll(ARTIFACT_REGEX)) {
      const matchedText = match[0];
      const startIndex = match.index ?? 0;

      if (startIndex > lastIndex) {
        resultSegments.push({
          text: text.slice(lastIndex, startIndex),
          type: null,
        });
      }

      const type = classifyArtifact(matchedText);
      resultSegments.push({ text: matchedText, type });
      uniqueArtifacts.set(matchedText, type);

      lastIndex = startIndex + matchedText.length;
    }

    if (lastIndex < text.length) {
      resultSegments.push({
        text: text.slice(lastIndex),
        type: null,
      });
    }

    return {
      segments: resultSegments,
      artifacts: Array.from(uniqueArtifacts.entries()).map(([value, type]) => ({
        value,
        type,
      })),
    };
  }, [text]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-4 rounded-2xl border bg-muted/25 p-4 sm:p-5">
      {/* Baris Info Sumber */}
      <div className="flex items-center justify-between text-muted-foreground text-xs">
        <div className="inline-flex items-center gap-1.5">
          {isDocument ? (
            <LuFileWarning className="h-3.5 w-3.5" />
          ) : (
            <LuSmartphone className="h-3.5 w-3.5" />
          )}
          <span>{isDocument ? "Ekstraksi Teks Dokumen" : "Pesan Masuk"}</span>
          <span>·</span>
          <span className="tabular-nums">{text.length} karakter</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-muted-foreground text-xs transition-colors hover:bg-background hover:text-foreground"
        >
          {copied ? (
            <>
              <LuCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-600">Tersalin</span>
            </>
          ) : (
            <>
              <LuCopy className="h-3.5 w-3.5" />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>

      {/* Chat Bubble Style (untuk pesan) / Document Sheet (untuk dokumen) */}
      <div
        className={
          isDocument
            ? "whitespace-pre-wrap rounded-xl border bg-background p-4 text-foreground text-sm leading-7"
            : "relative whitespace-pre-wrap rounded-2xl rounded-tl-sm border bg-background px-4 py-3.5 text-foreground text-sm leading-7 shadow-2xs"
        }
      >
        {segments.map((seg, idx) => {
          if (!seg.type) return <span key={idx}>{seg.text}</span>;

          if (seg.type === "file") {
            return (
              <mark
                key={idx}
                className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 font-mono font-semibold text-[13px] text-destructive"
              >
                {seg.text}
              </mark>
            );
          }

          if (seg.type === "link") {
            return (
              <mark
                key={idx}
                className="mx-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 font-medium font-mono text-[13px] text-amber-800 underline decoration-amber-500/50 underline-offset-4 dark:text-amber-300"
              >
                {seg.text}
              </mark>
            );
          }

          return (
            <mark
              key={idx}
              className="mx-0.5 rounded bg-primary/10 px-1.5 py-0.5 font-medium text-foreground"
            >
              {seg.text}
            </mark>
          );
        })}
      </div>

      {/* Ringkasan Entitas yang Ditemukan di Dalam Teks */}
      {artifacts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-muted-foreground text-xs">
            Entitas terdeteksi:
          </span>
          {artifacts.map((item) => (
            <span
              key={item.value}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs ${
                item.type === "file"
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : item.type === "link"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                    : "border-border bg-background text-foreground"
              }`}
            >
              {item.type === "file" ? (
                <LuFileWarning className="h-3 w-3 shrink-0" />
              ) : item.type === "link" ? (
                <LuLink2 className="h-3 w-3 shrink-0" />
              ) : (
                <LuMessageSquare className="h-3 w-3 shrink-0" />
              )}
              <span className="max-w-[240px] truncate">{item.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
