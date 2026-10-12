import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import { ToastProvider } from "@/components/ui/feedback";
import { StoreProvider } from "@/state/store";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CRESCO | Act alone inside the rules", template: "%s · CRESCO" },
  description:
    "CRESCO gives families, financial operators and automated strategies bounded autonomy, with one exact exception without widening standing authority.",
  applicationName: "Cresco",
  appleWebApp: { capable: true, title: "Cresco", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#e8ebee",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only z-[70] rounded-[12px] bg-blue px-4 py-2 font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
