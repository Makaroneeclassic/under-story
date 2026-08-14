'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

function HallCard({ num, phase, phaseSub, title, concept, desc, imgSrc, treeSrc, alt, delay, rotateClass, containerClass }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    let observer;
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        if (!observer) {
          observer = new IntersectionObserver(
            ([entry]) => {
              setIsRevealed(entry.isIntersecting);
            },
            {
              rootMargin: "-25% 0px -25% 0px", // triggers when card is in the middle 50% of viewport
              threshold: 0.1,
            }
          );
          if (cardRef.current) {
            observer.observe(cardRef.current);
          }
        }
      } else {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        setIsRevealed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`flex flex-col items-center reveal ${containerClass || ""}`}
      style={{ transitionDelay: delay }}
    >
      {/* Sequence Phase Tag */}
      {phase && (
        <div className="text-center mb-6">
          <span className="font-label-caps text-xs text-[#9C8B72] tracking-[0.2em] uppercase block">
            {phase}
          </span>
          {phaseSub && (
            <span className="font-serif text-xs md:text-sm italic text-[#665340] block mt-1">
              {phaseSub}
            </span>
          )}
        </div>
      )}

      <div className="relative w-full max-w-[320px] md:max-w-none aspect-square mb-8 group p-2 cursor-pointer">
        {/* Circular Container with venue photo */}
        <div className="w-full h-full rounded-full overflow-hidden relative border border-[#9C8B72] shadow-sm">
          {/* Base Venue Image */}
          <Image
            className="w-full h-full object-cover grayscale-[0.05] md:group-hover:scale-105 transition-transform duration-700"
            alt={alt}
            src={imgSrc}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        {/* Realistic Botanical Canopy Cover (Full circular dense crown, No numbers) */}
        {treeSrc && (
          <div
            className={`absolute inset-0 transition-opacity duration-700 pointer-events-none z-10 scale-[1.18] origin-center ${rotateClass || ""} md:group-hover:opacity-0 ${
              isRevealed ? "opacity-0" : "opacity-100"
            }`}
          >
            <Image
              className="w-full h-full object-contain drop-shadow-lg"
              alt={`${title} Canopy Cover`}
              src={treeSrc}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        )}
      </div>

      <div className="text-center max-w-xs">
        {/* Number Badge */}
        <div className="w-8 h-8 rounded-full border border-[#9C8B72] flex items-center justify-center mx-auto mb-3 text-[#665340] font-serif text-sm">
          {num}
        </div>
        <h3 className="font-serif text-xl md:text-2xl text-[#000000] tracking-widest uppercase mb-1">
          {title}
        </h3>
        {concept && (
          <span className="font-label-caps text-xs text-[#9C8B72] tracking-[0.18em] uppercase block mb-3">
            {concept}
          </span>
        )}
        <div className="w-8 h-[1px] bg-[#9C8B72]/50 mx-auto mb-3"></div>
        <p className="font-serif italic text-sm text-[#4A4742] leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

const heroSlides = [
  "/pic/01.webp",
  "/pic/03.webp",
  "/pic/09.webp"
];

export default function Home() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    eventMonth: "ตุลาคม 2026",
    phone: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.phone) {
      setErrorMessage("กรุณากรอกชื่อและเบอร์โทรติดต่อ");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          eventMonth: formData.eventMonth || "ไม่ระบุ",
          phone: formData.phone,
          notes: "ลงทะเบียนผ่านแบบฟอร์มหน้าเว็บไซต์ Understory",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(data.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
      }
    } catch (err) {
      console.error("Lead submission error:", err);
      // Fallback to success for smooth UX
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, observerOptions);

    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((el) => observer.observe(el));

    return () => {
      reveals.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* TopAppBar */}
      <header className="docked full-width top-0 sticky z-50 bg-[#F1F0EB]/90 backdrop-blur-md border-b border-[#9C8B72]/20 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 transition-all duration-300">
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-8">
            <a
              className="font-label-caps text-label-caps text-[#000000] font-bold border-b-2 border-[#665340] py-1 tracking-widest"
              href="#venue"
            >
              THE VENUE
            </a>
            <a
              className="font-label-caps text-label-caps text-[#4A4742] hover:text-[#000000] transition-colors tracking-widest py-1"
              href="#halls"
            >
              HALLS
            </a>
            <a
              className="font-label-caps text-label-caps text-[#4A4742] hover:text-[#000000] transition-colors tracking-widest py-1"
              href="#floor-plans"
            >
              FLOOR PLANS
            </a>
            <Link
              className="font-label-caps text-label-caps text-[#4A4742] hover:text-[#000000] transition-colors tracking-widest py-1"
              href="/gallery"
            >
              GALLERY
            </Link>
          </nav>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <a href="#" className="flex items-center">
            <Image
              src="/logo_understory_authentic.png"
              alt="Understory Logo"
              width={160}
              height={70}
              className="h-10 md:h-11 w-auto object-contain"
              priority
            />
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:block font-label-caps text-label-caps text-[#4A4742] hover:text-[#000000] transition-colors mr-4 cursor-pointer">
            PRESS KIT
          </button>
          <a
            href="#contact"
            className="bg-[#000000] text-[#F1F0EB] hover:bg-[#665340] py-2.5 px-6 rounded-md font-label-caps text-label-caps tracking-widest transition-all duration-300 cursor-pointer shadow-sm"
          >
            BOOK A VISIT
          </a>
        </div>
      </header>

      {/* Navigation Drawer (Side) */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        id="side-drawer"
        onClick={(e) => {
          if (e.target.id === "side-drawer") toggleDrawer();
        }}
      >
        <aside
          className={`fixed inset-y-0 left-0 z-[60] flex flex-col bg-[#F1F0EB] text-[#000000] h-full w-80 shadow-2xl transition-transform duration-500 border-r border-[#9C8B72]/30 ${
            isDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6 flex justify-between items-center border-b border-[#9C8B72]/20">
            <Image
              src="/logo_understory_authentic.png"
              alt="Understory Logo"
              width={140}
              height={60}
              className="h-9 w-auto object-contain"
            />
            <button
              className="material-symbols-outlined text-[#665340] hover:text-black cursor-pointer p-1"
              onClick={toggleDrawer}
              aria-label="Close drawer"
            >
              close
            </button>
          </div>
          <nav className="flex-1 py-8">
            <div className="space-y-1">
              <a
                className="bg-[#E7E3DA] text-[#000000] font-medium mx-3 flex items-center gap-4 px-4 py-3.5 rounded-md font-body-md"
                href="#venue"
                onClick={toggleDrawer}
              >
                <span className="material-symbols-outlined text-[#665340]">architecture</span>
                The Venue
              </a>
              <a
                className="text-[#4A4742] hover:text-[#000000] hover:bg-[#EAE8E1] transition-all mx-3 flex items-center gap-4 px-4 py-3.5 rounded-md font-body-md"
                href="#halls"
                onClick={toggleDrawer}
              >
                <span className="material-symbols-outlined text-[#665340]">account_balance</span>
                Halls
              </a>
              <a
                className="text-[#4A4742] hover:text-[#000000] hover:bg-[#EAE8E1] transition-all mx-3 flex items-center gap-4 px-4 py-3.5 rounded-md font-body-md"
                href="#contact"
                onClick={toggleDrawer}
              >
                <span className="material-symbols-outlined text-[#665340]">mail</span>
                Contact
              </a>
            </div>
          </nav>
          <div className="p-8 border-t border-[#9C8B72]/20">
            <p className="font-label-caps text-label-caps text-[#9C8B72] tracking-widest">
              ESTABLISHED 2024
            </p>
          </div>
        </aside>
      </div>

      <main id="venue">
        {/* Hero Section */}
        <section className="relative h-[820px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {heroSlides.map((slideSrc, index) => (
              <div
                key={slideSrc}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <Image
                  className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                    currentSlide === index ? "scale-105" : "scale-100"
                  }`}
                  alt={`Cinematic architectural view of Understory wedding venue - Slide ${index + 1}`}
                  src={slideSrc}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-black/35 z-20"></div>
          </div>

          {/* Slide Navigation Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === index ? "bg-[#F1F0EB] scale-125 shadow-md" : "bg-[#F1F0EB]/40 hover:bg-[#F1F0EB]/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="relative z-30 flex flex-col items-center justify-center text-[#F1F0EB] reveal active px-4 max-w-4xl">
            <Image
              src="/logo_understory_authentic_white.png"
              alt="Understory Logo"
              width={580}
              height={270}
              className="h-32 sm:h-40 md:h-48 w-auto object-contain drop-shadow-xl"
              priority
            />
          </div>
        </section>

        {/* Intro Text Section / Philosophy */}
        <section id="philosophy" className="px-margin-mobile md:px-margin-desktop py-section-gap text-center bg-[#ECEAE3]">
          <div className="max-w-4xl mx-auto reveal">
            <p className="font-label-caps text-label-caps text-[#9C8B72] mb-6 tracking-[0.25em] ">
              OUR PHILOSOPHY
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-[#000000] mb-8 leading-tight font-normal">
              A sanctuary of light and architectural silence, crafted for timeless union.
            </h2>
            <div className="w-20 h-[1.5px] bg-[#9C8B72] mx-auto mb-8"></div>
            <p className="font-body-md text-base md:text-lg text-[#3A3833] max-w-2xl mx-auto leading-relaxed">
              Understory is more than a venue; it is an architectural journey. Inspired by the quiet layers of the forest and the enduring strength of limestone, every space is designed to frame your most significant moments.
            </p>
          </div>
        </section>

        {/* Section 2: 'The Foundation' - Narrative & Halls */}
        <section id="halls" className="px-margin-mobile md:px-margin-desktop py-section-gap overflow-hidden bg-[#F1F0EB]">
          <div className="max-w-4xl mx-auto text-center mb-20 reveal">
            <span className="font-label-caps text-label-caps text-[#9C8B72] tracking-[0.25em] mb-4 block">
              CURATED SPACES
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-[#000000] mb-6 font-normal tracking-wide uppercase">
              THE FOUNDATION
            </h2>
            <p className="font-body-md text-base md:text-lg text-[#3A3833] max-w-3xl mx-auto leading-relaxed">
              Inspired by the way communities once gathered under expansive canopies for life&apos;s most meaningful occasions, the venue is shaped around three signature circular spaces that represent three majestic trees. Together, they establish a sequence of experiences—from arrival and gathering to ceremony and celebration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
            {/* 1. Linden Hall */}
            <HallCard
              num="1"
              phase="ARRIVAL & GATHERING"
              phaseSub="The welcome begins here"
              title="LINDEN HALL"
              concept="WELCOME LOVE"
              desc="Arrival and gathering set the tone for the day."
              imgSrc="/pic/04.webp"
              treeSrc="/tree_canopy_full_circle_v3.webp"
              rotateClass="rotate-0"
              alt="Linden Hall - Arrival and Gathering"
              delay="100ms"
            />

            {/* 2. Willow Hall */}
            <HallCard
              num="2"
              phase="CEREMONY"
              phaseSub="The heart of your promise"
              title="WILLOW HALL"
              concept="FOREVER LOVE"
              desc="The ceremony takes place at the heart of it all."
              imgSrc="/pic/02.webp"
              treeSrc="/tree_canopy_full_circle_v3.webp"
              rotateClass="rotate-[115deg]"
              alt="Willow Hall - The Ceremony Space"
              delay="300ms"
              containerClass="md:mt-12"
            />

            {/* 3. Mistle Hall */}
            <HallCard
              num="3"
              phase="CELEBRATION"
              phaseSub="Where love comes together"
              title="MISTLE HALL"
              concept="CELEBRATE LOVE"
              desc="Celebration, connection and memories to last."
              imgSrc="/pic/08.webp"
              treeSrc="/tree_canopy_full_circle_v3.webp"
              rotateClass="rotate-[230deg]"
              alt="Mistle Hall - The Celebration Space"
              delay="500ms"
            />
          </div>
        </section>

        {/* Section 3: Floor Plans with Aerial Architectural Background */}
        <section id="floor-plans" className="relative py-section-gap px-margin-mobile md:px-margin-desktop overflow-hidden border-t border-[#9C8B72]/30">
          {/* Background Aerial Photo 5-2 */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/pic/5-2.webp"
              alt="Understory Aerial Architecture"
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority
            />
            {/* Soft Warm Semi-transparent Veil so photo is visible and floorplan lines are sharp */}
            <div className="absolute inset-0 bg-[#F1F0EB]/65"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto reveal">
            <div className="w-full relative aspect-[1024/703] drop-shadow-sm">
              <Image
                src="/floorplan_transparent_brand.webp"
                alt="Understory Floor Plans and Capacity Specifications"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            </div>
          </div>
        </section>

        {/* Lead Form: Inquiries & Reservations */}
        <section id="contact" className="py-section-gap px-margin-mobile md:px-margin-desktop border-t border-[#9C8B72]/30 bg-[#F1F0EB]">
          <div className="max-w-3xl mx-auto reveal">
            <div className="text-center mb-12">
              <span className="font-label-caps text-label-caps text-[#9C8B72] tracking-[0.25em] mb-4 block">
                INQUIRIES & RESERVATIONS
              </span>
              <h2 className="font-serif text-3xl md:text-5xl text-[#000000] mb-4 font-normal">
                Begin your story today.
              </h2>
              <p className="font-body-md text-base text-[#4A4742] max-w-xl mx-auto">
                กรอกข้อมูลเพื่อให้ทีมงาน Understory ติดต่อกลับเพื่อนำเสนอรายละเอียดแพ็กเกจ
                <br />
                และนัดหมายเข้าชมสถานที่
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-[#E7E3DA] border border-[#665340]/40 p-8 sm:p-12 text-center rounded-lg shadow-sm animate-fade-in">
                <span className="material-symbols-outlined text-4xl text-[#665340] mb-3 block">
                  check_circle
                </span>
                <h3 className="font-serif text-2xl md:text-3xl text-[#000000] mb-2">
                  ขอบคุณสำหรับข้อมูล
                </h3>
                <p className="font-body-md text-sm text-[#4A4742] max-w-md mx-auto mb-6">
                  ทีมงาน Event Curator ได้รับข้อมูลของท่านเรียบร้อยแล้ว และจะติดต่อกลับผ่านเบอร์โทรศัพท์ที่ระบุไว้โดยเร็วที่สุด
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ firstName: "", lastName: "", eventMonth: "", phone: "" });
                  }}
                  className="font-label-caps text-xs text-[#665340] underline hover:text-black tracking-widest cursor-pointer"
                >
                  ส่งข้อมูลเพิ่มเติม
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="bg-[#ECEAE3]/80 p-8 sm:p-12 rounded-lg border border-[#9C8B72]/30 shadow-ambient space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* 1. ชื่อ */}
                  <div>
                    <label className="font-label-caps text-xs text-[#9C8B72] tracking-[0.15em] block uppercase mb-2">
                      ชื่อ <span className="text-[#665340]">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="ระบุชื่อจริง"
                      className="w-full bg-[#F1F0EB] border border-[#9C8B72]/50 focus:border-[#665340] rounded-md px-4 py-3 font-body-md text-sm text-[#000000] outline-none transition-all placeholder:text-[#9C8B72]/60"
                    />
                  </div>

                  {/* 2. นามสกุล */}
                  <div>
                    <label className="font-label-caps text-xs text-[#9C8B72] tracking-[0.15em] block uppercase mb-2">
                      นามสกุล
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="ระบุนามสกุล"
                      className="w-full bg-[#F1F0EB] border border-[#9C8B72]/50 focus:border-[#665340] rounded-md px-4 py-3 font-body-md text-sm text-[#000000] outline-none transition-all placeholder:text-[#9C8B72]/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* 3. ช่วงเดือนที่ต้องการจัดงาน */}
                  <div>
                    <label className="font-label-caps text-xs text-[#9C8B72] tracking-[0.15em] block uppercase mb-2">
                      ช่วงเดือนที่ต้องการจัดงาน
                    </label>
                    <select
                      name="eventMonth"
                      value={formData.eventMonth}
                      onChange={handleInputChange}
                      className="w-full bg-[#F1F0EB] border border-[#9C8B72]/50 focus:border-[#665340] rounded-md px-4 py-3 font-body-md text-sm text-[#000000] outline-none transition-all cursor-pointer"
                    >
                      <option value="">-- เลือกช่วงเดือนจัดงาน --</option>
                      <option value="มกราคม">มกราคม (January)</option>
                      <option value="กุมภาพันธ์">กุมภาพันธ์ (February)</option>
                      <option value="มีนาคม">มีนาคม (March)</option>
                      <option value="เมษายน">เมษายน (April)</option>
                      <option value="พฤษภาคม">พฤษภาคม (May)</option>
                      <option value="มิถุนายน">มิถุนายน (June)</option>
                      <option value="กรกฎาคม">กรกฎาคม (July)</option>
                      <option value="สิงหาคม">สิงหาคม (August)</option>
                      <option value="กันยายน">กันยายน (September)</option>
                      <option value="ตุลาคม">ตุลาคม (October)</option>
                      <option value="พฤศจิกายน">พฤศจิกายน (November)</option>
                      <option value="ธันวาคม">ธันวาคม (December)</option>
                      <option value="ยังไม่ระบุ / กำลังดูฤกษ์">ยังไม่ระบุ / กำลังดูฤกษ์</option>
                    </select>
                  </div>

                  {/* 4. เบอร์โทรติดต่อ */}
                  <div>
                    <label className="font-label-caps text-xs text-[#9C8B72] tracking-[0.15em] block uppercase mb-2">
                      เบอร์โทรติดต่อ <span className="text-[#665340]">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="เช่น 081-234-5678"
                      className="w-full bg-[#F1F0EB] border border-[#9C8B72]/50 focus:border-[#665340] rounded-md px-4 py-3 font-body-md text-sm text-[#000000] outline-none transition-all placeholder:text-[#9C8B72]/60"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-100/90 border border-red-300 text-red-800 text-xs rounded-md text-center">
                    {errorMessage}
                  </div>
                )}

                <div className="pt-4 text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-[#000000] text-[#F1F0EB] hover:bg-[#665340] px-12 py-4 rounded-md font-label-caps text-label-caps tracking-widest transition-all duration-300 cursor-pointer shadow-sm active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mx-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        กำลังส่งข้อมูล...
                      </>
                    ) : (
                      "SEND INQUIRY (ส่งข้อมูลติดต่อ)"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-8 bg-[#ECEAE3] border-t border-[#9C8B72]/30">
        <div className="flex flex-col items-center md:items-start gap-3">
          <Image
            src="/logo_understory_authentic.png"
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
            href="#"
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
    </>
  );
}

