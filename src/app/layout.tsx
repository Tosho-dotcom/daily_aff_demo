import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource-variable/nunito";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";
import { APP } from "@/lib/config";

export const metadata: Metadata = {
  title: `${APP.name} — Daily affirmations`,
  description: `${APP.tagline} Kind, uplifting words to help you feel calmer, stronger and more motivated every day.`,
  applicationName: APP.name,
  appleWebApp: { capable: true, title: APP.name, statusBarStyle: "default" },
  formatDetection: { telephone: false },
  openGraph: {
    title: `${APP.name} — Daily affirmations`,
    description: APP.tagline,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FBEFF1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div className="bg" aria-hidden="true">
          <span className="blob b1" />
          <span className="blob b2" />
          <span className="blob b3" />
        </div>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
