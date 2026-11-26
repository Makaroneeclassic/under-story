"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Order matters: photos are laid out in rows of 2, 3, 2 ... (see buildRows).
// w/h are the real pixel sizes so each photo keeps its own shape.
const galleryItems = [
  { id: 1, label: "MISTLE HALL", category: "MISTLE HALL", src: "/pic/08.webp", w: 2560, h: 1706, alt: "Mistle Hall table setting under the open skylight" },
  { id: 5, label: "ARRIVAL", category: "AERIAL & ARCHITECTURE", src: "/pic/01.webp", w: 1706, h: 2560, alt: "Bridal bouquet against the curved stone walls" },
  { id: 6, label: "LINDEN HALL", category: "LINDEN HALL", src: "/pic/03.webp", w: 1706, h: 2560, alt: "Textured stone wall with foliage shadows" },
  { id: 2, label: "LINDEN HALL", category: "LINDEN HALL", src: "/pic/04.webp", w: 2560, h: 1706, alt: "Linden Hall courtyard with trees" },
  { id: 7, label: "MISTLE HALL", category: "MISTLE HALL", src: "/pic/09.webp", w: 1706, h: 2560, alt: "Mistle Hall evening details" },
  { id: 3, label: "WILLOW HALL", category: "WILLOW HALL", src: "/pic/02.webp", w: 2560, h: 1706, alt: "Willow Hall curved canopy and reflecting pool" },
  { id: 4, label: "AERIAL", category: "AERIAL & ARCHITECTURE", src: "/pic/5-2.webp", w: 1448, h: 1086, alt: "Aerial view of the circular pavilions" },
];

const categories = ["ALL", "MISTLE HALL", "LINDEN HALL", "WILLOW HALL", "AERIAL & ARCHITECTURE"];

// Split into rows of alternating 2 and 3 photos; a single leftover joins the previous row.
function buildRows(items) {
  const rows = [];
  let i = 0;
  let size = 2;
  while (i < items.length) {
    const remaining = items.length - i;
    const take = remaining - size === 1 ? remaining : Math.min(size, remaining);
    rows.push(items.slice(i, i + take));
    i += take;
    size = size === 2 ? 3 : 2;
  }
  return rows;
}

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filteredItems =
    selectedCategory === "ALL"
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);
  const rows = buildRows(filteredItems);

  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % filteredItems.length);
  };
  const prevLightbox = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev + 1) % filteredItems.length);
      if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  let runningIndex = 0;

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-[#F1F0EB] text-[#000000] selection:bg-[#9C8B72]/30">
        {/* Title + filter */}
        <section className="px-margin-mobile md:px-margin-desktop pt-16 md:pt-24 pb-10 md:pb-14 max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <h1 className="font-serif text-4xl md:text-6xl font-normal leading-none">Gallery</h1>
          <nav className="flex flex-wrap gap-x-6 gap-y-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`font-label-caps text-[11px] tracking-[0.18em] pb-1 border-b transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "text-[#000000] border-[#665340]"
                    : "text-[#9C8B72] border-transparent hover:text-[#000000]"
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </section>

        {/* Editorial rows: photos in a row share one height and keep their own shape */}
        <section className="px-margin-mobile md:px-margin-desktop pb-24 md:pb-32 max-w-[1440px] mx-auto space-y-10 md:space-y-16">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex flex-col md:flex-row gap-10 md:gap-6 lg:gap-10">
              {row.map((item) => {
                const index = runningIndex++;
                return (
                  <figure
                    key={item.id}
                    className="md:[flex:var(--ar)_1_0%] min-w-0"
                    style={{ "--ar": item.w / item.h }}
                  >
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      className="block w-full overflow-hidden bg-[#E7E3DA] cursor-zoom-in"
                      aria-label={`View ${item.label} photo`}
                    >
                      <Image
                        src={item.src}
                        alt={item.alt}
                        width={item.w}
                        height={item.h}
                        className="w-full h-auto transition-transform duration-[1200ms] ease-out hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 60vw"
                      />
                    </button>
                    <figcaption className="mt-3 font-label-caps text-[10px] tracking-[0.22em] text-[#9C8B72]">
                      {item.label}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          ))}
        </section>

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-[100] bg-[#0F0E0C]/95 flex items-center justify-center p-4 md:p-12 select-none"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 md:top-8 md:right-8 text-white/70 hover:text-white p-2 cursor-pointer"
              aria-label="Close"
              title="ปิด (Esc)"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={prevLightbox}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-3 cursor-pointer"
              aria-label="Previous photo"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextLightbox}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-3 cursor-pointer"
              aria-label="Next photo"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <figure className="relative w-full max-w-6xl flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-full h-[78vh]">
                <Image
                  src={filteredItems[lightboxIndex].src}
                  alt={filteredItems[lightboxIndex].alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
              <figcaption className="mt-4 font-label-caps text-[10px] tracking-[0.22em] text-white/60">
                {filteredItems[lightboxIndex].label} · {lightboxIndex + 1} / {filteredItems.length}
              </figcaption>
            </figure>
          </div>
        )}

        {/* CTA */}
        <section className="bg-[#ECEAE3] py-20 px-margin-mobile md:px-margin-desktop text-center border-t border-[#9C8B72]/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-[#000000] mb-6 font-normal">
              Experience Understory Firsthand
            </h2>
            <p className="font-body-md text-base text-[#4A4742] mb-8 leading-relaxed">
              Walk beneath the expansive canopies and witness the serene play of shadow and light across each hall.
            </p>
            <Link
              href="/#contact"
              className="inline-block bg-[#000000] text-[#F1F0EB] hover:bg-[#665340] py-3.5 px-8 rounded-md font-label-caps text-label-caps tracking-widest transition-colors duration-300"
            >
              BOOK A PRIVATE VISIT
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
