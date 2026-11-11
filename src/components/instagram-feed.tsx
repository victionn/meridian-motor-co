import Image from "next/image";
import { site } from "@/content/site";
import { getInstagramPosts, instagramConfigured } from "@/lib/instagram";
import { InstagramEmbeds } from "./instagram-embeds";

const handle = `@${new URL(site.social.instagram).pathname.replaceAll("/", "")}`;

/**
 * Recent Instagram posts: live tiles from the API when a token is set, otherwise the hand-picked posts in
 * site.social.instagramPosts as official embeds. Renders nothing in production if neither is available.
 */
export async function InstagramFeed() {
  const posts = await getInstagramPosts(4);
  const picked = posts.length === 0 ? site.social.instagramPosts : [];
  const devHint = posts.length === 0 && picked.length === 0 && process.env.NODE_ENV !== "production";
  if (posts.length === 0 && picked.length === 0 && !devHint) return null;

  return (
    // White band: Instagram's embed cards are white and can't be themed, so the section matches them.
    <section className="bg-paper text-ink">
      <div className="edge-x py-16 sm:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="heading">Latest from social media</h2>
        </div>
        <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-ink underline-offset-4 hover:underline">
          Follow {handle} →
        </a>
      </div>

      {picked.length > 0 ? (
        <InstagramEmbeds urls={picked} />
      ) : devHint ? (
        <p className="rounded-2xl border border-dashed border-ink/20 p-8 text-sm text-ink/60">
          {instagramConfigured()
            ? "Instagram returned no posts — check the server log for the API error."
            : "Set INSTAGRAM_ACCESS_TOKEN in .env.local to show the latest posts here. (This note only appears in development.)"}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {posts.map((post) => (
            <li key={post.id}>
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-2xl bg-panel text-paper"
              >
                <Image
                  src={post.image}
                  alt={post.caption ? post.caption.slice(0, 120) : `Instagram post by ${handle}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {post.isVideo && (
                  <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-widest">
                    Video
                  </span>
                )}
                {post.caption && (
                  <span className="absolute inset-x-0 bottom-0 line-clamp-3 bg-linear-to-t from-ink/90 to-transparent p-4 pt-10 text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {post.caption}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
      </div>
    </section>
  );
}
