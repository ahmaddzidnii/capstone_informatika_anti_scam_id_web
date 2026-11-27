"use client";

import * as React from "react";
import { LuFileText, LuImage, LuUpload, LuX } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export interface FileDropzoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
  onBlur?: () => void;
  accept?: string;
  disabled?: boolean;
  isInvalid?: boolean;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  variant?: "default" | "compact";
  className?: string;
}

export function FileDropzone({
  value,
  onChange,
  onBlur,
  accept = ".pdf,.jpg,.jpeg,.png",
  disabled = false,
  isInvalid = false,
  id,
  name,
  title = "Tarik & lepas file di sini, atau cari file",
  description = "Hanya PDF, JPG, PNG | Maksimal 5 MB",
  variant = "default",
  className,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sinkronkan reset native input jika value dikosongkan dari luar (misal form.reset())
  React.useEffect(() => {
    if (!value && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [value]);

  const handleSelect = (file: File | undefined) => {
    if (!file) return;
    onChange(file);
    onBlur?.();
  };

  const handleClear = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isCompact = variant === "compact";
  const isImage = value?.type.startsWith("image/");

  return (
    // biome-ignore lint/a11y/useSemanticElements: dropzone container with nested remove button
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-invalid={isInvalid}
      onKeyDown={(e) => {
        if (
          e.target === e.currentTarget &&
          (e.key === "Enter" || e.key === " ")
        ) {
          e.preventDefault();
          if (!disabled) fileInputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        handleSelect(e.dataTransfer.files?.[0]);
      }}
      onClick={() => {
        if (!disabled) fileInputRef.current?.click();
      }}
      className={cn(
        "cursor-pointer rounded-xl border-2 border-dashed text-center transition-colors",
        isCompact ? "p-4" : "p-10",
        isInvalid
          ? "border-destructive bg-destructive/5"
          : isDragging
            ? "border-primary bg-muted/70"
            : "border-muted-foreground/30 hover:border-foreground/50 hover:bg-muted/30",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <input
        ref={fileInputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleSelect(e.target.files?.[0])}
      />

      {!value ? (
        <div
          className={cn(
            "flex flex-col items-center",
            isCompact ? "space-y-1.5" : "space-y-3",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center rounded-lg border bg-background",
              isCompact ? "h-9 w-9" : "h-12 w-12",
            )}
          >
            <LuUpload
              className={cn(
                "text-foreground",
                isCompact ? "h-4 w-4" : "h-6 w-6",
              )}
            />
          </div>
          <div className="space-y-0.5">
            <p
              className={cn(
                "font-semibold",
                isCompact ? "text-xs" : "text-base",
              )}
            >
              {title}
            </p>
            <p className="text-muted-foreground text-xs">{description}</p>
          </div>
        </div>
      ) : (
        // biome-ignore lint/a11y/noStaticElementInteractions: prevent bubbling to file picker
        <div
          role="presentation"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "mx-auto flex items-center justify-between gap-3 rounded-lg border bg-background text-left",
            isCompact ? "w-full p-2.5" : "max-w-md p-3",
            isInvalid && "border-destructive/50",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-md",
                isCompact ? "h-8 w-8" : "h-10 w-10",
                isInvalid
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-foreground",
              )}
            >
              {isImage ? (
                <LuImage className={isCompact ? "h-4 w-4" : "h-5 w-5"} />
              ) : (
                <LuFileText className={isCompact ? "h-4 w-4" : "h-5 w-5"} />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-sm">{value.name}</p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {formatFileSize(value.size)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            onClick={handleClear}
            aria-label="Hapus file"
            className="shrink-0"
          >
            <LuX className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
