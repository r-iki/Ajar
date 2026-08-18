type VideoPlayerProps = {
  url: string;
};

function toEmbedUrl(url: string) {
  const watchPrefix = "https://www.youtube.com/watch?v=";

  if (url.startsWith(watchPrefix)) {
    const videoId = url.slice(watchPrefix.length).split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return url;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  return (
    <div className="aspect-video overflow-hidden rounded-xl border bg-muted/20">
      <iframe
        src={toEmbedUrl(url)}
        className="h-full w-full"
        title="Lesson video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
