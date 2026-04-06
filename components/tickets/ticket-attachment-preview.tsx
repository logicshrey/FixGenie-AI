export function TicketAttachmentPreview({
  imageDataUrl,
  title,
}: {
  imageDataUrl?: string | null;
  title: string;
}) {
  if (!imageDataUrl) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
        Attached image
      </h2>
      <img
        src={imageDataUrl}
        alt={`Attachment for ${title}`}
        className="max-h-80 rounded-md border border-border object-contain"
      />
    </div>
  );
}
