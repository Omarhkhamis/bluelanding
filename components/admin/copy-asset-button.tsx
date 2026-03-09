"use client";

export function CopyAssetButton({ url }: { url: string }) {
  return (
    <button
      type="button"
      className="admin-button-muted"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
      }}
    >
      Copy URL
    </button>
  );
}
