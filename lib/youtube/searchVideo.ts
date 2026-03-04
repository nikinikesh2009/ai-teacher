/**
 * YouTube Data API v3 search service.
 * Returns the first video ID for a given query.
 */

const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export async function searchVideo(query: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    maxResults: "1",
    type: "video",
    key: apiKey,
  });

  const res = await fetch(`${SEARCH_URL}?${params.toString()}`);
  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string };
    }>;
  };

  const videoId = data?.items?.[0]?.id?.videoId;
  return typeof videoId === "string" ? videoId : null;
}
