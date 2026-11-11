import "server-only";
import { cacheLife, cacheTag } from "next/cache";

export type InstagramPost = {
  id: string;
  permalink: string;
  image: string;
  caption: string;
  isVideo: boolean;
};

type ApiMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
};

const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink";

export const instagramConfigured = () => Boolean(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_USER_ID);

/**
 * Latest posts from the dealership's own account via Meta's Graph API. Needs INSTAGRAM_ACCESS_TOKEN (a system-user
 * token from the "Meridian Website feed" Meta app, which does not expire) and INSTAGRAM_USER_ID (the account's numeric
 * id, shown under its name on the app's "Generate access tokens" screen). These tokens only work on graph.facebook.com.
 * Cached for an hour: Instagram's image URLs are signed and expire, so this must not be cached for long.
 * Returns [] when unconfigured or when Instagram is unreachable, so the page never breaks on it.
 */
export async function getInstagramPosts(limit = 4): Promise<InstagramPost[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("instagram");

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  if (!token || !userId) return [];

  try {
    const url = new URL(`https://graph.facebook.com/v21.0/${userId}/media`);
    url.searchParams.set("fields", FIELDS);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", token);
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      console.error(`[instagram] ${res.status} ${await res.text()}`);
      return [];
    }
    const { data } = (await res.json()) as { data: ApiMedia[] };
    return data.flatMap((m) => {
      const image = m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url;
      if (!image) return [];
      return [{ id: m.id, permalink: m.permalink, image, caption: m.caption ?? "", isVideo: m.media_type === "VIDEO" }];
    });
  } catch (err) {
    console.error("[instagram]", err);
    return [];
  }
}
