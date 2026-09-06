"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useInView } from "framer-motion";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";
import ExperienceCard from "./ExperienceCard";
import type { ExperienceCardData } from "./ExperienceCard";

const experiences: ExperienceCardData[] = [
  {
    role: "PKM - Pemanfaatan Artificial Intelligence",
    company: "Universitas Pamulang - MTs Al-Hamidiyah",
    period: "2024",
    location: "Tangerang, Indonesia",
    highlightsLeft: [
      "Merancang dan menyampaikan materi edukasi mengenai dasar-dasar Artificial Intelligence kepada siswa",
      "Medemontrasikan penggunaan AI untuk membantu siswa dalam pembelajaran di era sekarang.",
    ],
    highlightsRight: [
      "Memberi pemahaman dalam penggunaan AI secara bijak, termasuk dampak positif dan risiko penggunaannya.",
      "evaluasi pemahaman siswa melalui sesi diskusi dan praktik langsung untuk memastikan materi dapat diterapkan secara efektif.",
    ],
  },
  {
    role: "Internet Of Things Developer",
    company: "Universitas Pamulang",
    period: "2025 - 2026",
    location: "Tangerang, Indonesia",
    highlightsLeft: [
      "Mengembangkan sistem tracking kendaraan berbasis Internet of Things menggunakan ESP32 dan modul GPS.",
      "Mengimplementasikan algoritma parsing data GPS untuk mengolah data lokasi secara real-time.",
    ],
    highlightsRight: [
      "Mengintegrasikan perangkat IoT dengan sistem berbasis web untuk monitoring data.",
      "Mengelola dan menyimpan data lokasi ke dalam database untuk analisis lebih lanjut.",
    ],
  },
  {
    role: "Data Entry",
    company: "Data Calon Pemilu",
    period: "2024",
    location: "Tangerang, Indonesia",
    highlightsLeft: [
      "Melakukan input dan pengelolaan data calon pemilu secara akurat dan terstruktur ke dalam database.",
      "Memverifikasi dan memvalidasi data untuk memastikan tidak terjadi duplikasi atau kesalahan informasi.",
    ],
    highlightsRight: [
      "Mengorganisir data berdasarkan kategori wilayah dan kebutuhan administrasi.",
      "Bekerja sama dengan tim untuk memastikan kelengkapan dan konsistensi data yang digunakan dalam proses pemilu.",
    ],
  },
  {
    role: "UMKM",
    company: "Usaha Keluarga",
    period: "2025 - Sekarang",
    location: "Tangerang, Indonesia",
    highlightsLeft: [
      "Mengelola operasional usaha keluarga mulai dari produksi hingga distribusi produk.",
      "Melayani pelanggan secara langsung serta menjaga kepuasan dan hubungan baik dengan konsumen.",
    ],
    highlightsRight: [
      "Mengatur pencatatan keuangan sederhana seperti pemasukan, pengeluaran, dan stok barang.",
      "Mengembangkan strategi penjualan, termasuk promosi melalui media sosial untuk meningkatkan omzet.",
    ],
  },
];

const NAVBAR_OFFSET = 96;
const DESKTOP_QUERY = "(min-width: 1024px)";

// Sama pola dengan `revealTransition` di About section: fade + slide up.
const cardTransition = (delay = 0) => ({
  duration: 0.5,
  delay,
  ease: [0.25, 0.1, 0.25, 1] as const,
});

// Transisi instan dipakai saat elemen masuk viewport dari ARAH BAWAH
// (scroll naik) -- tidak ada animasi, langsung tampil penuh.
const instantTransition = { duration: 0 };

/**
 * Melacak arah scroll halaman secara global: "down" | "up".
 * Dipakai supaya reveal animation cuma jalan saat user scroll ke bawah
 * memasuki section ini, bukan saat scroll naik dari section setelahnya.
 */
function useScrollDirection() {
  const directionRef = useRef<"down" | "up">("down");
  const lastYRef = useRef(0);

  useEffect(() => {
    lastYRef.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastYRef.current) {
        directionRef.current = "down";
      } else if (y < lastYRef.current) {
        directionRef.current = "up";
      }
      lastYRef.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return directionRef;
}

/**
 * Wrapper reveal-on-scroll yang directional-aware:
 * - Masuk viewport saat scroll ke bawah -> animasi fade+slide-up normal.
 * - Masuk viewport saat scroll ke atas  -> langsung tampil, tanpa animasi.
 * - Keluar viewport -> reset, supaya next time masuk dari atas bisa animasi lagi.
 */
function RevealOnScroll({
  children,
  delay = 0,
  directionRef,
  amount = "some",
  margin,
  className,
}: {
  children: ReactNode;
  delay?: number;
  directionRef: React.MutableRefObject<"down" | "up">;
  amount?: "some" | "all" | number;
  margin?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    amount,
    margin: margin as any,
  });

  const [visible, setVisible] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    if (isInView) {
      // Tentukan mode saat elemen MASUK viewport, berdasarkan arah scroll
      // saat itu terjadi.
      setShouldAnimate(directionRef.current === "down");
      setVisible(true);
    } else {
      // Reset supaya entrance berikutnya (dari atas) bisa animasi lagi.
      setVisible(false);
    }
  }, [isInView, directionRef]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={shouldAnimate ? cardTransition(delay) : instantTransition}>
      {children}
    </motion.div>
  );
}

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const endMarkerRef = useRef<HTMLDivElement>(null);

  const sectionTopRef = useRef(0);
  const markerTopRef = useRef(0);
  const titleHeightRef = useRef(0);
  const releasedRef = useRef(false);
  const rafId = useRef<number | null>(null);

  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  const scrollDirectionRef = useScrollDirection();

  const [pinStyle, setPinStyle] = useState<React.CSSProperties>({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const measure = useCallback(() => {
    const section = sectionRef.current;
    const marker = endMarkerRef.current;
    const title = titleRef.current;
    if (!section || !marker || !title) return;
    sectionTopRef.current =
      section.getBoundingClientRect().top + window.scrollY;
    markerTopRef.current = marker.getBoundingClientRect().top + window.scrollY;
    titleHeightRef.current = title.offsetHeight;
  }, []);

  const updatePin = useCallback(() => {
    const scrollY = window.scrollY;
    const sectionTop = sectionTopRef.current - scrollY;
    const markerTop = markerTopRef.current - scrollY;
    const titleHeight = titleHeightRef.current;

    setPinStyle((prev) => {
      let next: React.CSSProperties;

      if (sectionTop > NAVBAR_OFFSET) {
        next = { position: "absolute", top: 0, left: 0, right: 0 };
      } else if (
        !releasedRef.current &&
        markerTop > NAVBAR_OFFSET + titleHeight
      ) {
        next = { position: "fixed", top: NAVBAR_OFFSET, left: 0, right: 0 };
      } else {
        const top = markerTopRef.current - sectionTopRef.current - titleHeight;
        next = { position: "absolute", top, left: 0, right: 0 };
      }

      return prev.position === next.position && prev.top === next.top
        ? prev
        : next;
    });
  }, []);

  const onScroll = useCallback(() => {
    if (rafId.current != null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      updatePin();
    });
  }, [updatePin]);

  useEffect(() => {
    if (!isDesktop) return;

    measure();
    updatePin();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [isDesktop, measure, updatePin, onScroll]);

  // ---- MOBILE/TABLET (<1024px): kartu biasa + fade/slide-in per kartu saat masuk viewport ----
  if (!isDesktop) {
    return (
      <section id="experience" className="relative bg-black ">
        <div className="max-w-3xl mx-auto px-4 mt-16 pb-8">
          <RevealOnScroll directionRef={scrollDirectionRef} amount="some">
            <span className="text-[#f7c200] text-xs tracking-widest font-mono uppercase [text-shadow:0_0_5px_#FF6600,0_0_15px_#FF6600,0_0_20px_rgba(247,194,0,0.6),0_0_35px_rgba(247,194,0,0.4)]">
              Journey
            </span>
            <h2 className="text-white text-3xl font-black mt-2 [font-family:'Poppins',sans-serif]">
              Experience
            </h2>
          </RevealOnScroll>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-16 flex flex-col gap-5">
          {experiences.map((exp) => (
            <RevealOnScroll
              key={exp.role}
              directionRef={scrollDirectionRef}
              amount="some"
              margin="0px 0px -100px 0px">
              <ExperienceCard {...exp} />
            </RevealOnScroll>
          ))}
        </div>
      </section>
    );
  }

  // ---- DESKTOP (>=1024px): pakai ScrollStack seperti sebelumnya ----
  return (
    <section id="experience" ref={sectionRef} className="relative bg-black">
      <div style={pinStyle} className="z-0 bg-black">
        <div
          ref={titleRef}
          className="max-w-3xl mx-auto px-4 md:px-10 mt-5 pb-20">
          <RevealOnScroll directionRef={scrollDirectionRef} amount="some">
            <span className="text-[#f7c200] text-xs tracking-widest font-mono uppercase [text-shadow:0_0_5px_#FF6600,0_0_15px_#FF6600,0_0_20px_rgba(247,194,0,0.6),0_0_35px_rgba(247,194,0,0.4)]">
              Journey
            </span>
            <h2 className="text-white text-3xl sm:text-4xl font-black mt-2 [font-family:'Poppins',sans-serif]">
              Experience
            </h2>
          </RevealOnScroll>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-30">
        <ScrollStack
          useWindowScroll={true}
          itemDistance={100}
          itemStackDistance={20}
          stackPosition="180px"
          scaleEndPosition="5%"
          baseScale={0.88}>
          {experiences.map((exp) => (
            <ScrollStackItem key={exp.role}>
              <ExperienceCard {...exp} />
            </ScrollStackItem>
          ))}
          <div ref={endMarkerRef} className="h-px w-full" />
        </ScrollStack>
      </div>
    </section>
  );
}
