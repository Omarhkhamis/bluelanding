"use client";

import { useId, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FolderOpen, Upload, X } from "lucide-react";

type MediaAsset = {
  id: number;
  url: string;
  mimeType: string;
  originalName: string;
  altText: string;
};

type MediaUrlFieldProps = {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  mediaType?: "image" | "video" | "all";
};

export function MediaUrlField({
  name,
  label,
  defaultValue = "",
  placeholder,
  mediaType = "image"
}: MediaUrlFieldProps) {
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();
  const isVideoField = mediaType === "video";
  const acceptedMimeTypes =
    mediaType === "video" ? "video/*" : mediaType === "all" ? "image/*,video/*" : "image/*";
  const mediaLabel =
    mediaType === "video" ? "video" : mediaType === "all" ? "media" : "image";
  const siteKey = searchParams.get("site") || "hollywood-smile";
  const mediaEndpoint = `/api/admin/media?site=${encodeURIComponent(siteKey)}`;
  const filteredAssets = assets.filter((asset) => {
    if (mediaType === "video") {
      return asset.mimeType.startsWith("video/");
    }

    if (mediaType === "all") {
      return asset.mimeType.startsWith("image/") || asset.mimeType.startsWith("video/");
    }

    return asset.mimeType.startsWith("image/");
  });

  const loadAssets = async () => {
    setIsLoadingAssets(true);

    try {
      const response = await fetch(mediaEndpoint, { cache: "no-store" });
      const payload = await response.json();
      setAssets(Array.isArray(payload.assets) ? payload.assets : []);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  return (
    <div className="admin-field">
      <label htmlFor={inputId}>{label}</label>

      <div className="admin-input-with-tools">
        <input
          id={inputId}
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="admin-input"
          placeholder={placeholder}
        />

        <button
          type="button"
          className="admin-tool-button"
          onClick={() => fileInputRef.current?.click()}
          aria-label={`Upload ${label}`}
          title={`Upload ${mediaLabel}`}
        >
          <Upload className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="admin-tool-button"
          onClick={async () => {
            setIsLibraryOpen(true);
            await loadAssets();
          }}
          aria-label={`Open media library for ${label}`}
          title="Browse library"
        >
          <FolderOpen className="h-4 w-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedMimeTypes}
        className="admin-hidden-file"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }

          setIsUploading(true);
          const body = new FormData();
          body.append("file", file);
          body.append("site", siteKey);

          try {
            const response = await fetch(mediaEndpoint, {
              method: "POST",
              body
            });
            const payload = await response.json();

            if (payload.url) {
              setValue(payload.url);
              await loadAssets();
            }
          } finally {
            setIsUploading(false);
            event.target.value = "";
          }
        }}
      />

      {isUploading ? <div className="admin-muted">Uploading {mediaLabel}...</div> : null}

      {isLibraryOpen ? (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Media library"
          onClick={() => setIsLibraryOpen(false)}
        >
          <div className="admin-media-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <div className="admin-eyebrow">Media library</div>
                <h2>Choose {mediaLabel}</h2>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsLibraryOpen(false)}
                aria-label="Close media library"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="admin-media-modal-body">
              {isLoadingAssets ? (
                <div className="admin-muted">Loading {mediaLabel}s...</div>
              ) : (
                <div className="admin-media-grid">
                  {filteredAssets.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        className="admin-media-choice"
                        onClick={() => {
                          setValue(asset.url);
                          setIsLibraryOpen(false);
                        }}
                      >
                        {isVideoField || asset.mimeType.startsWith("video/") ? (
                          <video
                            src={asset.url}
                            className="admin-media-preview"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={asset.url}
                            alt={asset.altText || asset.originalName}
                            className="admin-media-preview"
                          />
                        )}
                        <span className="admin-media-choice-name">{asset.originalName}</span>
                        <span className="admin-media-choice-url">{asset.url}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
