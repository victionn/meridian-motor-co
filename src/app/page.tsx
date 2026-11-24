import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { InstagramFeed } from "@/components/instagram-feed";
import { IntroBand } from "@/components/intro-band";
import { ShowroomPreview } from "@/components/showroom-preview";
import { SiteLoader } from "@/components/site-loader";
import { Testimonials } from "@/components/testimonials";
import { TextReveal } from "@/components/text-reveal";

export default function HomePage() {
  return (
    <>
      <SiteLoader />
      <Hero />
      {/* Everything under the banner loads in as you scroll (the loader is the banner's own entrance). */}
      <TextReveal>
        <IntroBand />

        <Suspense fallback={null}>
          <ShowroomPreview />
        </Suspense>

        <Suspense fallback={null}>
          <InstagramFeed />
        </Suspense>

        <Testimonials />
      </TextReveal>
    </>
  );
}
