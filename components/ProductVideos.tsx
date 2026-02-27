import { getYouTubeEmbedUrl } from "@/lib/getYoutubeEmbedUrl";

export default function ProductVideos({ urls }: { urls?: string[] }) {
  const embeds = (urls ?? [])
    .map(getYouTubeEmbedUrl)
    .filter(Boolean) as string[];

  if (embeds.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      {embeds.map((url, i) => (
        <div
          key={i}
          className="relative w-full aspect-video rounded-xl overflow-hidden
            border border-slate-200 bg-black shadow-sm"
        >
          <iframe
            src={url}
            title={`Product video ${i + 1}`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ))}
    </div>
  );
}