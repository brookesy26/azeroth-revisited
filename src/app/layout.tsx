import type { Metadata } from "next";
import { SiteShell } from "@/components/organisms/site-shell";
import { StoreProvider } from "@/store/provider";
import "./globals.css";
import "./site-enhancements.css";
const origin =
  process.env.NEXT_PUBLIC_SITE_URL || "https://azeroth-revisited.pages.dev";
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: "Azeroth Revisited — WoW Forever guides",
    template: "%s | Azeroth Revisited",
  },
  description:
    "WoW Forever news, class talents and guides for returning Vanilla players and people coming from Retail.",
  openGraph: {
    type: "website",
    images: [
      {
        url: "/images/blackrock.webp",
        width: 1600,
        height: 900,
        alt: "Classic Warcraft Blackrock Depths artwork",
      },
    ],
    siteName: "Azeroth Revisited",
    title: "Azeroth Revisited",
    description: "Your way back to Azeroth: WoW Forever guides and news.",
  },
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body className="site">
        <StoreProvider>
          <SiteShell>{children}</SiteShell>
        </StoreProvider>
      </body>
    </html>
  );
}
