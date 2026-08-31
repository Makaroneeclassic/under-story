import { Cormorant_Garamond, Libre_Caslon_Text, DM_Sans, Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";
import TrackingScripts from "@/components/TrackingScripts";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const libreCaslonText = Libre_Caslon_Text({
  variable: "--font-libre-caslon-text",
  subsets: ["latin"],
  weight: ["400"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const notoSerifThai = Noto_Serif_Thai({
  variable: "--font-noto-serif-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Understory | Architectural Wedding Venue",
  description: "Under the witness tree, where your story begins. Understory is more than a venue; it is an architectural journey. Inspired by the quiet layers of the forest and the enduring strength of limestone, every space is designed to frame your most significant moments.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="th"
      className={`${cormorantGaramond.variable} ${libreCaslonText.variable} ${dmSans.variable} ${notoSansThai.variable} ${notoSerifThai.variable} scroll-smooth`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-background text-on-surface font-body-md selection:bg-secondary/30 antialiased">
        <TrackingScripts />
        {children}
      </body>
    </html>
  );
}

