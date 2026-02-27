export const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    let videoId: string | null = null;

    // youtu.be/<id>
    if (parsedUrl.hostname === "youtu.be") {
      videoId = parsedUrl.pathname.slice(1);
    }

    // youtube.com/*
    if (parsedUrl.hostname.includes("youtube.com")) {
      videoId =
        parsedUrl.searchParams.get("v") ||
        parsedUrl.pathname.split("/embed/")[1] ||
        parsedUrl.pathname.split("/shorts/")[1];
    }

    if (!videoId) return null;

    // Clean video ID (remove extra path parts)
    videoId = videoId.split("/")[0];

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
};