"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "THE VENUE", href: "/", match: (p) => p === "/" },
  { label: "HALLS", href: "/#halls" },
  { label: "FLOOR PLANS", href: "/#floor-plans" },
  { label: "GALLERY", href: "/gallery", match: (p) => p.startsWith("/gallery") },
  { label: "BLOG", href: "/blog", match: (p) => p.startsWith("/blog") },
];

const baseLink = "font-label-caps text-label-caps tracking-widest py-1 transition-colors";
const activeLink = "text-[#000000] font-bold border-b-2 border-[#665340]";
const idleLink = "text-[#4A4742] hover:text-[#000000]";

export default function SiteHeader() {
  const pathname = usePathname() || "/";

  return (
    <header className="sticky top-0 z-50 bg-[#F1F0EB]/90 backdrop-blur-md border-b border-[#9C8B72]/20 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4">
      <nav className="hidden md:flex gap-8">
        {NAV_ITEMS.map((item) => {
          const isActive = item.match ? item.match(pathname) : false;
          const className = `${baseLink} ${isActive ? activeLink : idleLink}`;
          return (
            <Link key={item.label} href={item.href} className={className}>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo_understory_authentic.webp"
            alt="Understory Logo"
            width={160}
            height={70}
            className="h-10 md:h-11 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      <Link
        href="/#contact"
        className="ml-auto bg-[#000000] text-[#F1F0EB] hover:bg-[#665340] py-2.5 px-6 rounded-md font-label-caps text-label-caps tracking-widest transition-colors duration-300"
      >
        BOOK A VISIT
      </Link>
    </header>
  );
}
