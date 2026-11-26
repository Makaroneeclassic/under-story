import Image from "next/image";
import Link from "next/link";

const linkClass = "font-body-md text-sm text-[#4A4742] hover:text-[#000000] transition-colors";

export default function SiteFooter() {
  return (
    <footer className="w-full py-16 px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-8 bg-[#ECEAE3] border-t border-[#9C8B72]/30">
      <div className="flex flex-col items-center md:items-start gap-3">
        <Link href="/">
          <Image
            src="/logo_understory_authentic.webp"
            alt="Understory Logo"
            width={150}
            height={65}
            className="h-10 w-auto object-contain"
          />
        </Link>
        <p className="font-body-md text-sm text-[#4A4742]">© 2026 Understory. All rights reserved.</p>
      </div>
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-8">
        <Link className={linkClass} href="/gallery">
          Gallery
        </Link>
        <Link className={linkClass} href="/blog">
          Blog
        </Link>
        <a
          className={linkClass}
          href="https://www.instagram.com/understory.venue/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
        <a
          className={linkClass}
          href="https://www.facebook.com/profile.php?id=61593297895519"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
      </div>
    </footer>
  );
}
