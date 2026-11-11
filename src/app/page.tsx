import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { InstagramFeed } from "@/components/instagram-feed";
import { SiteLoader } from "@/components/site-loader";
import { Testimonials } from "@/components/testimonials";

export default function HomePage() {
  return (
    <>
      <SiteLoader />
      <Hero />

      <Suspense fallback={null}>
        <InstagramFeed />
      </Suspense>

      <Testimonials />
    </>
  );
}
