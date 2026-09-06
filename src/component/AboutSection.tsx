import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import StatsCard from "./StatsCard.tsx";
import ActionButtons from "./actionButton";
import { Mail } from "lucide-react";

// Custom SVG icons (lucide-react sudah tidak menyediakan brand logos)
const GithubIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedinIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const threshold = () => window.innerHeight * 0.5;

    const evaluate = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const shouldShow = rect.top <= threshold();

      setShown((prev) => (prev !== shouldShow ? shouldShow : prev));
    };

    const handleScroll = () => {
      if (rafId.current !== null) return; // throttle via rAF
      rafId.current = requestAnimationFrame(() => {
        evaluate();
        rafId.current = null;
      });
    };

    // Evaluasi langsung saat mount (misal reload/refresh sudah dalam posisi scroll di section ini)
    evaluate();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const mobileVisible = shown;
  const desktopVisible = shown;
  const aboutVisible = shown;

  const fadeTransition = (visible: boolean, showDelay = 0) =>
    visible
      ? { duration: 0.8, ease: "easeOut" as const, delay: showDelay }
      : { duration: 0.15, ease: "easeIn" as const, delay: 0 };

  const revealTransition = (visible: boolean) => fadeTransition(visible, 0);

  const slideTransition = (visible: boolean) =>
    visible
      ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay: 0.55 }
      : { duration: 0.15, ease: "easeIn" as const, delay: 0 };

  // Layer 1: grid PERSEGI PANJANG (yang lama, tetap dipertahankan), fade di 4 sisi.
  const PhotoGridBackground = () => (
    <div
      className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-56 sm:w-64 md:w-72 pointer-events-none z-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.09) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.09) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        WebkitMaskImage: `
          linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%),
          linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)
        `,
        WebkitMaskComposite: "source-in",
        maskImage: `
          linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%),
          linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)
        `,
        maskComposite: "intersect",
      }}
    />
  );

  // Glow DESKTOP — posisi pixel fixed, sudah sesuai/teruji baik di layar lebar.
  const PhotoTrapezoidBackground = () => (
    <>
      {/* Outer Glow */}
      <div
        className="absolute top-44 left-72 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] rounded-full pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(
              circle,
              rgba(255, 222, 160, 0.10) 35%,
              rgba(255, 222, 160, 0.06) 55%,
              rgba(255, 222, 160, 0.03) 70%,
              transparent 85%
            )
          `,
          filter: "blur(70px)",
        }}
      />

      {/* Inner Glow */}
      <div
        className="absolute top-72 left-72 -translate-x-1/2 -translate-y-1/2 w-[330px] h-[330px] rounded-full pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(
              circle,
              rgba(255, 245, 220, 0.45) 0%,
              rgba(255, 225, 170, 0.28) 10%,
              rgba(255, 210, 120, 0.12) 20%,
              transparent 75%
            )
          `,
          filter: "blur(35px)",
        }}
      />
    </>
  );

  // Glow MOBILE
  const PhotoTrapezoidBackgroundMobile = () => (
    <>
      {/* Outer Glow */}
      <div
        className="absolute top-[63%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[280px] rounded-full pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(
              circle,
              rgba(255, 222, 160, 0.10) 55%,
              rgba(255, 222, 160, 0.06) 75%,
              rgba(255, 222, 160, 0.03) 90%,
              transparent 85%
            )
          `,
          filter: "blur(60px)",
        }}
      />

      {/* Inner Glow */}
      <div
        className="absolute top-[63%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(
              circle,
              rgba(255, 245, 220, 0.45) 0%,
              rgba(255, 225, 170, 0.28) 10%,
              rgba(255, 210, 120, 0.12) 20%,
              transparent 75%
            )
          `,
          filter: "blur(30px)",
        }}
      />
    </>
  );

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full lg:h-dvh lg:overflow-hidden bg-black text-white px-4 md:px-10 lg:px-20 py-10 lg:py-0">
      <div className="grid grid-cols-1 md:grid-cols-12 h-full gap-8 md:gap-0 items-start">
        {/* FOTO MOBILE */}
        <div className="relative flex md:hidden justify-center items-end h-[40vh] mt-20 pb-5">
          {/* BACKGROUND GRID — versi Mobile (posisi relatif/persentase) */}
          <PhotoTrapezoidBackgroundMobile />
          <PhotoGridBackground />

          <div className="relative z-10">
            <svg width={288} height={388} viewBox="0 0 288 388">
              <defs>
                <mask id="photoMaskMobile">
                  <rect x="0" y="0" width="288" height="248" fill="white" />
                  <circle cx="144" cy="244" r="144" fill="white" />
                </mask>
              </defs>

              <g className="drop-shadow-[0_10px_12px_rgba(255,255,255,0.09)]">
                <motion.circle
                  cx="144"
                  cy="244"
                  r="143.25"
                  fill="none"
                  stroke="rgba(255,255,255,0.09)"
                  strokeWidth="1.5"
                  style={{ transformOrigin: "144px 244px" }}
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
                  animate={
                    mobileVisible
                      ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                      : { opacity: 0, scale: 0.8, filter: "blur(8px)" }
                  }
                  transition={revealTransition(mobileVisible)}
                />
              </g>

              <g
                mask="url(#photoMaskMobile)"
                className="drop-shadow-[0_10px_12px_rgba(0,0,0,0.35)]">
                <motion.g
                  initial={{ y: 36, opacity: 0 }}
                  animate={
                    mobileVisible ? { y: 0, opacity: 1 } : { y: 36, opacity: 0 }
                  }
                  transition={slideTransition(mobileVisible)}>
                  <image
                    href="/assets/profile.png"
                    x="0"
                    y="0"
                    width="288"
                    height="388"
                    preserveAspectRatio="xMidYMin slice"
                  />
                </motion.g>
              </g>
            </svg>
          </div>
        </div>

        {/* KIRI - Foto Desktop */}
        <div className="relative hidden md:flex md:col-span-6 items-center justify-center lg:mt-20">
          {/* BACKGROUND GRID — versi Desktop (posisi pixel fixed) */}
          <PhotoTrapezoidBackground />
          <PhotoGridBackground />

          <div className="relative z-10">
            <svg width={320} height={430} viewBox="0 0 320 430">
              <defs>
                <mask id="photoMaskDesktop">
                  <rect x="0" y="0" width="320" height="274" fill="white" />
                  <circle cx="160" cy="270" r="160" fill="white" />
                </mask>
              </defs>

              <g className="drop-shadow-[0_10px_12px_rgba(255,255,255,0.09)]">
                <motion.circle
                  cx="160"
                  cy="270"
                  r="159.25"
                  fill="none"
                  stroke="rgba(255,255,255,0.09)"
                  strokeWidth="1.5"
                  style={{ transformOrigin: "160px 270px" }}
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
                  animate={
                    desktopVisible
                      ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                      : { opacity: 0, scale: 0.8, filter: "blur(8px)" }
                  }
                  transition={revealTransition(desktopVisible)}
                />
              </g>

              <g
                mask="url(#photoMaskDesktop)"
                className="drop-shadow-[0_10px_12px_rgba(0,0,0,0.35)]">
                <motion.g
                  initial={{ y: 36, opacity: 0 }}
                  animate={
                    desktopVisible
                      ? { y: 0, opacity: 1 }
                      : { y: 36, opacity: 0 }
                  }
                  transition={slideTransition(desktopVisible)}>
                  <image
                    href="/assets/profile.png"
                    x="0"
                    y="0"
                    width="320"
                    height="430"
                    preserveAspectRatio="xMidYMin slice"
                  />
                </motion.g>
              </g>
            </svg>
          </div>
        </div>

        {/* KANAN / BAWAH - Content */}
        <div className="md:col-span-6 flex flex-col items-center md:items-start justify-start px-4 md:px-4 lg:px-8 gap-4">
          <div className="relative w-full max-w-sm lg:max-w-md md:mt-14 lg:mt-20">
            {/* Layer depan */}
            <motion.div
              className="relative overflow-hidden rounded-[15px] bg-[#2d2d2d99] border border-[#f7c200]/20 shadow-lg px-5 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col gap-3 lg:gap-4 items-start justify-start text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={
                aboutVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={revealTransition(aboutVisible)}>
              {/* Outer Glow */}
              <div
                className="absolute -top-32 -right-32 lg:-top-52 lg:-right-52 w-[340px] h-[340px] lg:w-[520px] lg:h-[520px] rounded-full pointer-events-none"
                style={{
                  background: `
                    radial-gradient(
                      circle,
                      rgba(247,194,0, 0.12) 20%,
                      rgba(247,194,0, 0.06) 45%,
                      rgba(247,194,0, 0.02) 70%,
                      transparent 85%
                    )
                  `,
                  filter: "blur(70px)",
                }}
              />

              {/* Inner Glow */}
              <div
                className="absolute -top-20 -right-20 lg:-top-32 lg:-right-32 w-[170px] h-[170px] lg:w-[260px] lg:h-[260px] rounded-full pointer-events-none"
                style={{
                  background: `
                    radial-gradient(
                      circle,
                      rgba(255,245,220,.42) 0%,
                      rgba(255,225,170,.22) 15%,
                      rgba(255,210,120,.08) 60%,
                      transparent 80%
                    )
                  `,
                  filter: "blur(35px)",
                }}
              />

              {/* Konten About */}
              <div className="relative z-10 flex flex-col gap-4 lg:gap-5 items-start text-left w-full min-w-0 pl-2 pr-2">
                {/* Nama */}
                <h3 className="text-3xl sm:text-3xl lg:text-4xl font-black text-left leading-tight [font-family:'Poppins',sans-serif]">
                  <span className="text-white">Muhamad</span> <br />
                  <span className="text-[#8e8e8e]">Fathi Farhat</span>
                </h3>

                {/* Social Links */}
                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com/muhfathifarhat"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-gray-400 transition-all duration-200 hover:text-white hover:border-white/40 [&:hover_svg]:drop-shadow-[0_0_6px_white]">
                    <GithubIcon size={15} />
                  </a>

                  <a
                    href="https://linkedin.com/in/muhamad-fathi-farhat-9882a9410"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-gray-400 transition-all duration-200 hover:text-white hover:border-white/40 [&:hover_svg]:drop-shadow-[0_0_6px_white]">
                    <LinkedinIcon size={15} />
                  </a>

                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=muh.fathifarhat18@gmail.com"
                    aria-label="Gmail"
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-gray-400 transition-all duration-200 hover:text-white hover:border-white/40 [&:hover_svg]:drop-shadow-[0_0_6px_white]">
                    <Mail size={15} strokeWidth={1.75} />
                  </a>
                </div>

                {/* Latar Belakang - dengan garis vertikal putih di kiri */}
                <div className="flex gap-3 lg:gap-4 w-full">
                  <div
                    className="w-px bg-white/70 shrink-0"
                    style={{
                      boxShadow:
                        "0 0 9px 1px rgba(247,194,0, 0.8), 0 0 14px 1px rgba(247,194,0, 0.1)",
                    }}
                  />
                  <div className="flex flex-col gap-2 items-start text-left">
                    <p className="text-[#d4d4d4] font-light font-mono text-xs lg:text-sm leading-relaxed max-w-xs lg:max-w-sm text-left">
                      Lulusan S1 Teknik Informatika Universitas Pamulang dengan
                      antusiasme tinggi untuk berkarier sebagai Data Analyst.
                      Menguasai SQL, Python, Excel, serta perangkat visualisasi
                      seperti Tableau, PowerBI dan Looker.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-1 lg:mt-2">
                  <ActionButtons />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* STATS CARD */}
        <div className="md:pt-10 lg:pt-0 md:col-span-12 bg-black md:mt-12">
          <div className="w-full md:w-11/12 lg:w-4/5 mx-auto">
            <StatsCard />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
