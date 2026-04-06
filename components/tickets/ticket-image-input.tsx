'use client';

import { useEffect, useState } from 'react';

export function TicketImageInput() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor="image">
        Attachment image (optional)
      </label>
      <input
        id="image"
        name="image"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <p className="text-xs text-muted-foreground">
        Upload a JPG, PNG, or WebP image up to 2 MB to help technicians understand the issue faster.
      </p>
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Ticket attachment preview"
          className="max-h-56 rounded-md border border-border object-contain"
        />
      )}
    </div>
  );
}
