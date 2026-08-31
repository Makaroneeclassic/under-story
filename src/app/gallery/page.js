"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const galleryItems = [
  {
    id: 1,
    title: "Mistle Hall - Open Sky Skylight",
    category: "MISTLE HALL",
    src: "/pic/08.webp",
    aspect: "aspect-[4/5]",
    description: "Expansive circular hall where the ceiling opens directly to the sky and tree canopies.",
  },
  {
    id: 2,
    title: "Linden Hall - Arched Grandeur",
    category: "LINDEN HALL",
    src: "/pic/04.webp",
    aspect: "aspect-[4/5]",
    description: "Towering limestone columns bathed in diffused natural daylight, framing sacred unions.",
  },
  {
    id: 3,
    title: "Willow Hall - Textured Curves",
    category: "WILLOW HALL",
    src: "/pic/02.webp",
    aspect: "aspect-[4/3]",
    description: "An intimate sanctuary of organic curves, soft shadows, and warm architectural stone.",
  },
  {
    id: 4,
    title: "Canopy & Aerial Harmony",
    category: "AERIAL & ARCHITECTURE",
    src: "/pic/5-2.webp",
    aspect: "aspect-[16/10]",
    description: "Bird's-eye architectural view of the interlocking circular pavilions nestled in nature.",
  },
  {
    id: 5,
    title: "The Entrance Promenade",
    category: "AERIAL & ARCHITECTURE",
    src: "/pic/01.webp",
    aspect: "aspect-[4/5]",
    description: "Clean monolithic walkways guided by lush organic foliage leading guests into serenity.",
  },
  {
    id: 6,
    title: "Courtyard & Atmospheric Light",
    category: "LINDEN HALL",
    src: "/pic/03.webp",
    aspect: "aspect-[4/3]",
    description: "Golden hour illumination reflecting across hand-carved stone walls and serene courtyards.",
  },
  {
    id: 7,
    title: "Evening Union Setup",
    category: "MISTLE HALL",
    src: "/pic/09.webp",
    aspect: "aspect-[4/5]",
    description: "Nightfall ambiance with ambient warm uplighting bringing the architectural curves to life.",
  },
];

const categories = ["ALL", "MISTLE HALL", "LINDEN HALL", "WILLOW HALL", "AERIAL & ARCHITECTURE"];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filteredItems =
    selectedCategory === "ALL"
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevLightbox = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  // Keyboard navigation
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

  return (
    <main className="min-h-screen bg-[#F1F0EB] text-[#000000] selection:bg-[#9C8B72]/30">
      {/* Top Navigation Bar */}
      <header className="docked full-width top-0 sticky z-50 bg-[#F1F0EB]/95 backdrop-blur-md border-b border-[#9C8B72]/20 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 transition-all duration-300">
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-8">
            <Link
              className="font-label-caps text-label-caps text-[#4A4742] hover:text-[#000000] transition-colors tracking-widest"
              href="/"
            >
              THE VENUE
            </Link>
            <Link
              className="font-label-caps text-label-caps text-[#4A4742] hover:text-[#000000] transition-colors tracking-widest"
              href="/#halls"
            >
              HALLS
            </Link>
            <Link
              className="font-label-caps text-label-caps text-[#4A4742] hover:text-[#000000] transition-colors tracking-widest"
              href="/#floor-plans"
            >
              FLOOR PLANS
            </Link>
            <Link
              className="font-label-caps text-label-caps text-[#000000] font-bold border-b-2 border-[#665340] py-1 tracking-widest"
              href="/gallery"
            >
              GALLERY
            </Link>
          </nav>
        </div>

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

        <div className="flex items-center gap-4">
          <a
            href="/presskit/understory-booklet.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download="UnderStory-Booklet.pdf"
            className="hidden md:block font-label-caps text-label-caps text-[#4A4742] hover:text-[#000000] transition-colors mr-4 cursor-pointer"
          >
            PRESS KIT
          </a>
          <Link
            href="/#contact"
            className="bg-[#000000] text-[#F1F0EB] hover:bg-[#665340] py-2.5 px-6 rounded-md font-label-caps text-label-caps tracking-widest transition-all duration-300 cursor-pointer shadow-sm text-center"
          >
            BOOK A VISIT
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <section className="pt-20 pb-12 px-margin-mobile md:px-margin-desktop text-center max-w-4xl mx-auto">
        <span className="font-label-caps text-label-caps text-[#9C8B72] tracking-[0.3em] mb-4 block uppercase">
          VISUAL ARCHIVE
        </span>
        <h1 className="font-serif text-4xl md:text-6xl text-[#000000] mb-6 font-normal tracking-wide">
          The Architecture of Union
        </h1>
        <p className="font-body-md text-base md:text-lg text-[#4A4742] max-w-2xl mx-auto leading-relaxed">
          A visual chronicle of natural light, limestone curves, and serene celebrations framed under expansive tree canopies.
        </p>
      </section>

      {/* Filter Tabs */}
      <section className="px-margin-mobile md:px-margin-desktop mb-12">
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 max-w-4xl mx-auto border-b border-[#9C8B72]/25 pb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full font-label-caps text-xs md:text-sm tracking-[0.15em] transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#665340] text-[#F1F0EB] shadow-sm"
                  : "bg-[#ECEAE3] text-[#4A4742] hover:bg-[#9C8B72]/20 hover:text-[#000000]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="px-margin-mobile md:px-margin-desktop pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group cursor-pointer flex flex-col bg-[#ECEAE3] rounded-xl overflow-hidden border border-[#9C8B72]/30 hover:border-[#665340] transition-all duration-500 hover:shadow-xl"
            >
              <div className={`relative w-full ${item.aspect} overflow-hidden bg-[#E7E3DA]`}>
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <span className="text-[#F1F0EB] font-label-caps text-xs tracking-widest uppercase flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                    VIEW FULL PHOTO
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <span className="font-label-caps text-xs text-[#9C8B72] tracking-[0.2em] uppercase block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-xl text-[#000000] mb-2 font-medium">
                    {item.title}
                  </h3>
                  <p className="font-body-md text-sm text-[#4A4742] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 transition-opacity duration-300 select-none"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white hover:text-[#D4C3A3] p-2.5 z-[110] cursor-pointer bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-full shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 flex items-center gap-1.5"
            aria-label="Close lightbox"
            title="ปิด (Esc)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-[10px] font-mono tracking-wider text-white/80 pr-1 hidden sm:inline">ESC</span>
          </button>

          {/* Prev button */}
          <button
            onClick={prevLightbox}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-[#D4C3A3] p-3.5 z-[110] cursor-pointer bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-full shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 group"
            aria-label="Previous photo"
            title="รูปก่อนหน้า (ลูกศรซ้าย)"
          >
            <svg className="w-6 h-6 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button */}
          <button
            onClick={nextLightbox}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-[#D4C3A3] p-3.5 z-[110] cursor-pointer bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-full shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 group"
            aria-label="Next photo"
            title="รูปถัดไป (ลูกศรขวา)"
          >
            <svg className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image & Caption container */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[65vh] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={filteredItems[lightboxIndex].src}
                alt={filteredItems[lightboxIndex].title}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <div className="mt-4 text-center text-[#F1F0EB] max-w-2xl px-4">
              <span className="font-label-caps text-xs text-[#9C8B72] tracking-[0.25em] block mb-1">
                {filteredItems[lightboxIndex].category} · {lightboxIndex + 1} / {filteredItems.length}
              </span>
              <h4 className="font-serif text-2xl mb-1">{filteredItems[lightboxIndex].title}</h4>
              <p className="font-body-md text-sm text-[#E7E3DA]/80">
                {filteredItems[lightboxIndex].description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Bottom Section */}
      <section className="bg-[#ECEAE3] py-20 px-margin-mobile md:px-margin-desktop text-center border-t border-[#9C8B72]/30">
        <div className="max-w-3xl mx-auto">
          <span className="font-label-caps text-label-caps text-[#9C8B72] tracking-[0.25em] mb-3 block">
            VISIT IN PERSON
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#000000] mb-6 font-normal">
            Experience Understory Firsthand
          </h2>
          <p className="font-body-md text-base text-[#4A4742] mb-8 leading-relaxed">
            Walk beneath the expansive canopies and witness the serene play of shadow and light across each hall.
          </p>
          <Link
            href="/#contact"
            className="inline-block bg-[#000000] text-[#F1F0EB] hover:bg-[#665340] py-3.5 px-8 rounded-md font-label-caps text-label-caps tracking-widest transition-all duration-300 shadow-sm"
          >
            BOOK A PRIVATE VISIT
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-16 px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-8 bg-[#F1F0EB] border-t border-[#9C8B72]/30">
        <div className="flex flex-col items-center md:items-start gap-3">
          <Image
            src="/logo_understory_authentic.webp"
            alt="Understory Logo"
            width={150}
            height={65}
            className="h-10 w-auto object-contain"
          />
          <p className="font-body-md text-sm text-[#4A4742]">
            © 2026 Understory. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-8">
          <a
            className="font-body-md text-sm text-[#4A4742] hover:text-[#000000] transition-colors cursor-pointer"
            href="/presskit/understory-booklet.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download="UnderStory-Booklet.pdf"
          >
            Press Kit
          </a>
          <a
            className="font-body-md text-sm text-[#4A4742] hover:text-[#000000] transition-colors"
            href="https://www.instagram.com/understory.venue/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            className="font-body-md text-sm text-[#4A4742] hover:text-[#000000] transition-colors"
            href="https://www.facebook.com/profile.php?id=61593297895519"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
        </div>
      </footer>
    </main>
  );
}
