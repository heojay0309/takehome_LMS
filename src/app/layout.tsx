import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { clerkThemeVariables } from "@/lib/clerk-appearance";
import { themeInitScript } from "@/lib/theme";
import type { Metadata } from "next";
import { Hanken_Grotesk, Quicksand } from "next/font/google";
import "./globals.css";

const bodyFont = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const headingFont = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BetterU LMS",
  description: "Browse courses, track progress, and learn at your pace.",
  icons: {
    icon: {
      url: "https://cdn.prod.website-files.com/60bec73c3161d258cff8900b/65f4edf00a019f1d7867c5e8_betterulogo-white%201.png",
      type: "image/png",
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${headingFont.variable} h-full font-sans antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <ClerkProvider appearance={{ cssLayerName: "clerk", variables: clerkThemeVariables }}>{children}</ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
