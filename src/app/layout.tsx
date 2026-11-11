import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Prestige & classic cars, Sydney`, template: `%s | ${site.name}` },
  description: site.tagline,
  openGraph: { siteName: site.name, type: "website", locale: "en_AU" },
};

export const viewport: Viewport = { themeColor: "#0b0b0c" };

const dealerJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: site.name,
  url: site.url,
  telephone: site.phone.display,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.showroom.street,
    addressLocality: site.showroom.suburb,
    addressRegion: site.showroom.state,
    postalCode: site.showroom.postcode,
    addressCountry: "AU",
  },
  openingHours: "Mo-Su 09:00-17:30",
  sameAs: [site.social.instagram, site.social.facebook],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU">
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-ink">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">{children}</main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dealerJsonLd) }}
        />
      </body>
    </html>
  );
}
