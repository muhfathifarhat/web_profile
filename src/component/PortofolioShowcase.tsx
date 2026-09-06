import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import type { IconType } from "react-icons";
import {
  SiReact,
  SiJavascript,
  SiTypescript,
  SiTailwindcss,
  SiPython,
  SiMysql,
  SiPandas,
} from "react-icons/si";
import {
  FileSpreadsheet,
  BarChart3,
  PieChart,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  projects,
  certificates,
  type ProjectItem,
  type CertificateItem,
} from "./PortofolioData";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TechItem {
  name: string;
  icon: IconType;
  color: string;
}

const techStack: TechItem[] = [
  { name: "React.Js", icon: SiReact, color: "#61DAFB" },
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38BDF8" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "Excel", icon: FileSpreadsheet, color: "#217346" },
  { name: "Power BI", icon: BarChart3, color: "#F2C811" },
  { name: "SQL", icon: SiMysql, color: "#4479A1" },
  { name: "Tableau", icon: PieChart, color: "#E97627" },
  { name: "Pandas", icon: SiPandas, color: "#150458" },
];

type TabType = "projects" | "certificates" | "techstack";

// Transisi normal (fade + slide-up) dipakai saat elemen masuk viewport
// dari ARAH ATAS (scroll ke bawah).
const revealTransition = (delay = 0) => ({
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
 * memasuki elemen, bukan saat scroll naik dari section setelahnya.
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
  amount = 0.3,
  margin,
  className,
}: {
  children: React.ReactNode;
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
      setShouldAnimate(directionRef.current === "down");
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isInView, directionRef]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={shouldAnimate ? revealTransition(delay) : instantTransition}>
      {children}
    </motion.div>
  );
}

/**
 * Thumbnail sertifikat untuk grid -- render halaman pertama PDF saja.
 * Dipisah jadi komponen sendiri supaya tiap card independen memuat
 * dokumennya dan tidak saling menunggu.
 *
 * PERBAIKAN: sebelumnya container pakai `aspect-[4/3]` tetap sementara
 * lebar <Page> fixed (400), sehingga sertifikat berorientasi potret bisa
 * terpotong di atas/bawah. Sekarang lebar <Page> mengikuti lebar container
 * (ResizeObserver) dan gambar di-render dengan object-fit: contain lewat
 * wrapper flex, jadi seluruh halaman PDF selalu terlihat utuh.
 */
function CertThumbnail({ pdf, title }: { pdf: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  // Ukur ukuran container segera saat mount (bukan menunggu ResizeObserver
  // pertama kali fire), supaya tidak ada jeda di mana height terbaca 0
  // -- itu bisa membuat perhitungan displayWidth di bawah jadi 0 dan
  // sertifikat tidak terlihat sama sekali (tampak "blank/putih").
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setContainerSize({ width: rect.width, height: rect.height });
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width <= 0 || height <= 0) continue;
        // Guard: hanya update kalau perubahan ukuran cukup berarti
        // (>0.5px), supaya tidak ikut memicu re-render bolak-balik.
        setContainerSize((prev) =>
          Math.abs(prev.width - width) < 0.5 &&
          Math.abs(prev.height - height) < 0.5
            ? prev
            : { width, height },
        );
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // PERBAIKAN: kalau tidak ada path PDF yang valid, jangan render <Document>
  // sama sekali -- tampilkan placeholder yang jelas, bukan kotak putih kosong.
  const hasPdf = typeof pdf === "string" && pdf.trim().length > 0;

  // Guard: hanya batasi lebar berdasarkan tinggi container KALAU tinggi
  // sudah benar-benar terukur (> 0). Selama belum terukur, pakai lebar
  // container apa adanya supaya tidak pernah menghasilkan displayWidth 0.
  const displayWidth =
    aspectRatio && containerSize.height > 0
      ? Math.max(
          1,
          Math.min(containerSize.width, containerSize.height * aspectRatio),
        )
      : containerSize.width || 400;

  if (!hasPdf || failed) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center bg-[#E3E3E3]/60">
        <span className="text-gray-400 text-xs text-center px-3">
          {title || "Sertifikat tidak tersedia"}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden">
      <Document
        file={pdf}
        onLoadError={() => setFailed(true)}
        loading={
          <div className="w-full h-full flex items-center justify-center bg-[#E3E3E3]/80">
            <span className="text-gray-400 text-xs">Memuat...</span>
          </div>
        }
        error={
          <div className="w-full h-full flex items-center justify-center bg-[#E3E3E3]/80">
            <span className="text-gray-400 text-xs">Gagal memuat</span>
          </div>
        }
        className="flex items-center justify-center">
        <Page
          pageNumber={1}
          width={displayWidth}
          onLoadSuccess={(page) => {
            const ratio = page.width / page.height;
            // PERBAIKAN BUG UTAMA: jangan update state kalau rasio baru
            // hampir sama dengan yang lama. Tanpa guard ini, perubahan
            // desimal sekecil apa pun pada rasio (akibat pembulatan saat
            // <Page> di-render ulang dengan lebar baru) memicu setState
            // lagi -> render ulang -> lebar berubah lagi -> onLoadSuccess
            // terpanggil lagi -> loop tanpa henti ("Maximum update depth
            // exceeded"), yang membuat React menghentikan render paksa
            // sehingga kanvas PDF tidak sempat selesai digambar (blank).
            setAspectRatio((prev) =>
              prev !== null && Math.abs(prev - ratio) < 0.005 ? prev : ratio,
            );
          }}
          onLoadError={() => setFailed(true)}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          loading={null}
        />
      </Document>
    </div>
  );
}

export default function PortfolioShowcase() {
  const [activeTab, setActiveTab] = useState<TabType>("projects");
  const [showAllCerts, setShowAllCerts] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null,
  );
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateItem | null>(null);
  // Index sertifikat yang sedang di-hover -- dipakai untuk efek "spotlight":
  // card yang di-hover tetap normal, card lain memudar (bukan grayscale).
  const [hoveredCert, setHoveredCert] = useState<number | null>(null);

  // Halaman PDF sertifikat yang sedang aktif di modal detail.
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfNumPages, setPdfNumPages] = useState(0);

  // PERBAIKAN: menghitung lebar viewer PDF secara manual (logika
  // object-fit: contain) alih-alih mengandalkan CSS aspect-ratio.
  // CSS aspect-ratio TIDAK otomatis menyusutkan lebar saat tinggi dibatasi
  // max-height -- akibatnya lebar tetap penuh tapi tinggi PDF terpotong
  // overflow-hidden (ini penyebab bug "masih terpotong" sebelumnya).
  // Solusinya: ukur lebar container yang tersedia DAN batas tinggi maksimum
  // (75% tinggi layar) lewat JS, lalu hitung lebar tampil PDF supaya
  // tinggi hasil render tidak pernah melebihi batas -- persis seperti
  // gambar yang di-"contain" di dalam box, tidak pernah terpotong.
  const certViewerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(640);
  const [maxHeightPx, setMaxHeightPx] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight * 0.75 : 800,
  );
  const [pdfAspectRatio, setPdfAspectRatio] = useState<number | null>(null);

  const scrollDirectionRef = useScrollDirection();

  // Dengarkan event dari StatsCards (card Portofolio/Sertifikat) untuk
  // otomatis membuka tab yang sesuai saat user diarahkan ke section ini.
  useEffect(() => {
    const handleSetTab = (e: Event) => {
      const tab = (e as CustomEvent<TabType>).detail;
      if (tab === "projects" || tab === "certificates" || tab === "techstack") {
        setActiveTab(tab);
      }
    };
    window.addEventListener("portfolio:setTab", handleSetTab);
    return () => window.removeEventListener("portfolio:setTab", handleSetTab);
  }, []);

  const CERTS_LIMIT = 6;
  const visibleCertificates = showAllCerts
    ? certificates
    : certificates.slice(0, CERTS_LIMIT);
  const hasMoreCerts = certificates.length > CERTS_LIMIT;

  // Embla Carousel: loop dimatikan, dragFree dinyalakan supaya slider
  // bisa di-drag bebas (tidak snap kaku ke tiap item) tapi tetap berhenti di ujung.
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: true,
    align: "start",
    containScroll: "trimSnaps",
  });

  // Dipakai untuk membedakan "klik" vs "drag" supaya link project
  // tidak ke-trigger saat user lagi menggeser slider.
  const isDragging = useRef(false);
  const dragStartProgress = useRef(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onPointerDown = () => {
      dragStartProgress.current = emblaApi.scrollProgress();
      isDragging.current = false;
    };

    const onPointerUp = () => {
      const moved =
        Math.abs(emblaApi.scrollProgress() - dragStartProgress.current) > 0.002;
      isDragging.current = moved;
    };

    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);

    return () => {
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi]);

  // Kunci scroll body saat modal detail project/certificate sedang terbuka
  useEffect(() => {
    document.body.style.overflow =
      selectedProject || selectedCertificate ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProject, selectedCertificate]);

  // Reset halaman PDF & rasio aspek tiap kali sertifikat yang dibuka berganti.
  useEffect(() => {
    setPdfPage(1);
    setPdfNumPages(0);
    setPdfAspectRatio(null);
  }, [selectedCertificate]);

  // Ukur lebar container viewer sertifikat secara responsif.
  useEffect(() => {
    if (!selectedCertificate || !certViewerRef.current) return;
    const el = certViewerRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setAvailableWidth(Math.floor(entry.contentRect.width));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [selectedCertificate]);

  // Ukur batas tinggi maksimum (75% tinggi layar) dan update saat window
  // di-resize, supaya perhitungan lebar PDF selalu akurat mengikuti
  // ukuran layar terkini.
  useEffect(() => {
    if (!selectedCertificate) return;
    const updateMaxHeight = () => setMaxHeightPx(window.innerHeight * 0.75);
    updateMaxHeight();
    window.addEventListener("resize", updateMaxHeight);
    return () => window.removeEventListener("resize", updateMaxHeight);
  }, [selectedCertificate]);

  // Lebar tampil PDF yang sesungguhnya (logika "contain"):
  // - Kalau PDF potret, tinggi hasil render (width/aspectRatio) bisa
  //   melebihi maxHeightPx -> maka lebar dibatasi oleh maxHeightPx * aspectRatio.
  // - Kalau PDF landscape/persegi, availableWidth (lebar container) yang
  //   jadi batasnya.
  // Hasilnya: PDF SELALU utuh terlihat pas di dalam box, di halaman mana
  // pun (setiap ganti halaman, aspectRatio dihitung ulang lewat onLoadSuccess
  // pada <Page>, sehingga halaman dengan orientasi berbeda tetap pas).
  const certDisplayWidth =
    pdfAspectRatio && maxHeightPx > 0
      ? Math.max(
          1,
          Math.min(availableWidth || 640, maxHeightPx * pdfAspectRatio),
        )
      : availableWidth || 640;

  // Navigasi halaman PDF pakai tombol panah keyboard saat modal terbuka.
  useEffect(() => {
    if (!selectedCertificate?.pdf) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setPdfPage((p) => Math.min(pdfNumPages, p + 1));
      } else if (e.key === "ArrowLeft") {
        setPdfPage((p) => Math.max(1, p - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedCertificate, pdfNumPages]);

  const handleCardClick = useCallback((project: ProjectItem) => {
    if (isDragging.current) return;
    if (!project.title) return; // kartu "Coming Soon" tidak perlu buka modal
    setSelectedProject(project);
  }, []);

  const tabs: { id: TabType; label: string }[] = [
    { id: "projects", label: "Projects" },
    { id: "certificates", label: "Certificates" },
    { id: "techstack", label: "Tech Stack" },
  ];

  return (
    <section
      id="portofolio"
      className="relative w-full min-h-screen text-black px-4 md:px-10 lg:px-20 py-20 bg-black">
      {/* Title */}
      <RevealOnScroll
        directionRef={scrollDirectionRef}
        className="text-center mb-10">
        <h2 className="text-4xl md:text-6xl mb-3 font-black text-white [font-family:'Poppins',sans-serif]">
          Portofolio Showcase
        </h2>
        <p className="text-sm md:text-base text-[#f7c200] font-mono [text-shadow:0_0_5px_#FF6600,0_0_15px_#FF6600,0_0_20px_rgba(247,194,0,0.3),0_0_35px_rgba(247,194,0,0.1)]">
          Explore my projects, certifications, and tech stack.
        </p>
      </RevealOnScroll>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex justify-center mb-12">
        <div className="flex bg-[#292929]/60 backdrop-blur-md rounded-full border border-white/10 p-1.5 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-black"
                  : "text-white hover:text-gray-400"
              }`}>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#c4c4c4] rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "projects" && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto">
            <div
              ref={emblaRef}
              className="overflow-x-hidden overflow-y-visible cursor-grab active:cursor-grabbing select-none py-10 -my-10">
              <div className="flex gap-6 px-[calc(50%-150px)] md:px-1">
                {projects.map((project, i) => (
                  <motion.div
                    key={i}
                    onClick={() => handleCardClick(project)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleCardClick(project);
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{
                      y: -8,
                      transition: { duration: 0.25, ease: "easeOut" },
                    }}
                    whileTap={{ scale: 0.98 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.4,
                      delay: Math.min(i, 5) * 0.05,
                      ease: "easeOut",
                    }}
                    className="w-[85vw] max-w-[320px] sm:w-[300px] md:w-[360px] rounded-2xl overflow-hidden border border-white/10 bg-[#2d2d2d99] backdrop-blur-md flex flex-col text-left cursor-pointer transition-shadow duration-300 hover:shadow-[0_18px_30px_-12px_rgba(247,194,0,0.35)] flex-shrink-0">
                    <div className="w-full h-48 flex items-center justify-center p-3">
                      <div className="w-full h-full rounded-lg overflow-hidden border border-white/10 shadow-inner">
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-md"></div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      {project.title ? (
                        <>
                          <h3
                            className="text-lg font-bold [font-family:'Poppins',sans-serif] text-white overflow-hidden"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                            }}>
                            {project.title}
                          </h3>

                          {project.subtitle && (
                            <span className="text-[#f7c200] text-xs font-mono uppercase tracking-wide mb-2">
                              {project.subtitle}
                            </span>
                          )}

                          <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2 mt-2">
                            {project.description}
                          </p>

                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2.5 py-1 bg-white/5 rounded-full border border-white/30 text-xs text-gray-400 font-mono">
                                  {tag}
                                </span>
                              ))}
                              {project.tags.length > 3 && (
                                <span className="px-2.5 py-1 bg-white/10 rounded-full text-xs text-gray-400 font-mono">
                                  +{project.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-gray-400 text-sm font-mono">
                            Coming Soon...
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "certificates" && (
          <motion.div
            key="certificates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto">
            <div
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6"
              onMouseLeave={() => setHoveredCert(null)}>
              {visibleCertificates.map((cert, i) => (
                <motion.button
                  key={`${cert.title}-${i}`}
                  onClick={() => setSelectedCertificate(cert)}
                  onMouseEnter={() => setHoveredCert(i)}
                  onMouseLeave={() => setHoveredCert(null)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.25, ease: "easeOut" },
                  }}
                  whileTap={{ scale: 0.98 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    duration: 0.5,
                    delay: (i % CERTS_LIMIT) * 0.1,
                    ease: "easeOut",
                  }}
                  className="group rounded-2xl overflow-hidden border border-black/5 bg-white cursor-pointer transition-shadow duration-300">
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-white flex items-center justify-center">
                    <CertThumbnail pdf={cert.pdf} title={cert.title} />

                    <div
                      className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-300 ease-out ${
                        hoveredCert !== null && hoveredCert !== i
                          ? "opacity-70"
                          : "opacity-0"
                      }`}
                    />

                    <div className="absolute inset-x-0 bottom-0 h-2/3 flex items-end justify-center p-2 sm:p-4 bg-gradient-to-t from-black/80 via-black/45 via-40% to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 ease-out">
                      <p className="text-white text-[11px] sm:text-sm font-semibold leading-snug line-clamp-2 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                        {cert.title}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {hasMoreCerts && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setShowAllCerts((prev) => !prev)}
                  className="px-6 py-2.5 rounded-full bg-[#E3E3E3]/80 backdrop-blur-md text-sm font-medium text-gray-700 hover:bg-black hover:text-white transition-colors duration-200">
                  {showAllCerts
                    ? "Show Less"
                    : `Show More (${certificates.length - CERTS_LIMIT})`}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "techstack" && (
          <motion.div
            key="techstack"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-x-8 sm:gap-x-16 gap-y-10 justify-items-center max-w-4xl mx-auto">
            {techStack.map((tech, i) => {
              const Icon = tech.icon;
              return (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{
                    y: -6,
                    transition: { duration: 0.2, ease: "easeOut" },
                  }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                  className="flex flex-col items-center justify-center gap-4 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#1c1c1c] border border-white/15 shadow-lg transition-shadow duration-300 hover:shadow-[0_18px_30px_-12px_rgba(247,194,0,0.35)]">
                  <Icon size={40} color={tech.color} />
                  <span className="text-[#ffffffa4] text-xs sm:text-sm font-mono text-center px-2">
                    {tech.name}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal detail project */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
              <button
                onClick={() => setSelectedProject(null)}
                aria-label="Tutup"
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-black shadow-md ring-1 ring-black/5 transition-colors duration-200">
                <X size={16} strokeWidth={2.5} />
              </button>

              <div className="w-full h-56 bg-[#E3E3E3] flex items-center justify-center">
                {selectedProject.image ? (
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">No Image</span>
                )}
              </div>

              <div className="p-6 text-left">
                <h3
                  className={`font-bold text-black leading-snug mb-1 ${
                    selectedProject.title.length > 40 ? "text-lg" : "text-2xl"
                  }`}>
                  {selectedProject.title}
                </h3>
                {selectedProject.subtitle && (
                  <p className="text-xs font-mono uppercase tracking-wide text-gray-500 mb-3">
                    {selectedProject.subtitle}
                  </p>
                )}
                <p className="text-gray-600 text-sm leading-relaxed mb-5">
                  {selectedProject.description}
                </p>

                {selectedProject.tags && selectedProject.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-black/5 rounded-full text-xs text-gray-600 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Tombol aksi: Visit Project (utama) + Repository (sekunder/outline).
                    Ditaruh dalam satu wrapper flex-col dengan gap supaya rapi
                    apa pun kombinasi field yang tersedia (link saja, repo saja,
                    atau keduanya). Repository diletakkan DI BAWAH Visit Project;
                    tinggal tukar urutan dua blok ini kalau mau di ATAS. */}
                {(selectedProject.link || selectedProject.repo) && (
                  <div className="flex flex-col gap-3">
                    {selectedProject.link && (
                      <a
                        href={selectedProject.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full text-center px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-black/80 transition-colors duration-200">
                        Visit Project
                      </a>
                    )}

                    {selectedProject.repo && (
                      <a
                        href={selectedProject.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full text-center px-6 py-3 rounded-full border border-black/15 text-black text-sm font-medium hover:bg-black/5 transition-colors duration-200">
                        Repository
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal detail certificate -- render PDF langsung, dengan navigasi halaman.
          PERBAIKAN TERBARU: tombol panah kiri/kanan sekarang di-posisikan
          absolute relatif terhadap `certViewerRef` (jendela/window viewer
          penuh), BUKAN lagi relatif terhadap div "inner" selebar
          certDisplayWidth. Dengan begitu tombol selalu menempel di tepi
          kiri/kanan jendela modal, berapa pun lebar PDF-nya (potret,
          persegi, atau landscape sempit), alih-alih mengambang dekat tepi
          kertas seperti sebelumnya.

          Untuk memastikan ikon panah benar-benar presisi di tengah
          lingkaran tombol, dipakai `grid place-items-center` (bukan
          flex items-center + justify-center) dan class `shrink-0` pada
          ikon supaya SVG tidak pernah mengalami distorsi/pergeseran
          sub-pixel akibat flex-basis. */}
      <AnimatePresence>
        {selectedCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedCertificate(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
              <button
                onClick={() => setSelectedCertificate(null)}
                aria-label="Tutup"
                className="absolute top-3 right-3 z-20 w-8 h-8 grid place-items-center rounded-full bg-white/90 hover:bg-white text-black shadow-md ring-1 ring-black/5 transition-colors duration-200">
                <X size={16} strokeWidth={2.5} className="shrink-0" />
              </button>

              <div
                ref={certViewerRef}
                className="relative w-full bg-[#E3E3E3] flex items-center justify-center overflow-hidden mx-auto"
                style={{ maxHeight: "75vh" }}>
                {/* Wrapper "inner" hanya membungkus dokumen PDF itu sendiri
                    (lebar = certDisplayWidth), supaya kertas selalu
                    ter-center secara horizontal di dalam jendela abu-abu. */}
                <div
                  className="relative flex items-center justify-center"
                  style={{ width: certDisplayWidth }}>
                  <Document
                    file={selectedCertificate.pdf}
                    onLoadSuccess={({ numPages }) => setPdfNumPages(numPages)}
                    loading={
                      <span className="text-gray-500 text-sm py-20">
                        Memuat sertifikat...
                      </span>
                    }
                    error={
                      <span className="text-gray-500 text-sm py-20">
                        Gagal memuat PDF
                      </span>
                    }
                    className="flex items-center justify-center w-full">
                    <Page
                      pageNumber={pdfPage}
                      width={certDisplayWidth}
                      onLoadSuccess={(page) => {
                        const ratio = page.width / page.height;
                        // Guard sama seperti di CertThumbnail: cegah infinite
                        // loop setState akibat perubahan rasio yang sangat
                        // kecil (pembulatan) tiap kali <Page> re-render dengan
                        // lebar baru.
                        setPdfAspectRatio((prev) =>
                          prev !== null && Math.abs(prev - ratio) < 0.005
                            ? prev
                            : ratio,
                        );
                      }}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                    />
                  </Document>
                </div>

                {/* Tombol navigasi & indikator halaman kini jadi children
                    LANGSUNG dari `certViewerRef` (jendela penuh), bukan dari
                    div "inner" -- sehingga left-4 / right-4 diukur dari tepi
                    jendela viewer, bukan dari tepi kertas PDF. */}
                {pdfNumPages > 1 && (
                  <>
                    <button
                      onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
                      disabled={pdfPage <= 1}
                      aria-label="Halaman sebelumnya"
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md ring-1 ring-black/5 text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft
                        size={18}
                        strokeWidth={2.5}
                        className="shrink-0"
                      />
                    </button>
                    <button
                      onClick={() =>
                        setPdfPage((p) => Math.min(pdfNumPages, p + 1))
                      }
                      disabled={pdfPage >= pdfNumPages}
                      aria-label="Halaman berikutnya"
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md ring-1 ring-black/5 text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight
                        size={18}
                        strokeWidth={2.5}
                        className="shrink-0"
                      />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-mono tabular-nums shadow-md">
                      {pdfPage} / {pdfNumPages}
                    </div>
                  </>
                )}
              </div>

              {selectedCertificate.link && (
                <div className="p-6">
                  <a
                    href={selectedCertificate.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full text-center px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-black/80 transition-colors duration-200">
                    Verify Certificate
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
