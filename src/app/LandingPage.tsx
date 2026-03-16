import React, { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "motion/react";
import { Link } from "react-router";

const displayFont = '"Outfit", ui-sans-serif, system-ui, sans-serif';
const bodyFont = '"Inter", ui-sans-serif, system-ui, sans-serif';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const numFrames = 160;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const landingOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.53, 0.62], [0, 0, 1, 1, 0.5]);
  // Animation s'arrête à la frame 97 (scroll ≈ 0.53), clamped après
  const currentFrameIndex = useTransform(scrollYProgress, [0.2, 0.53], [1, 97]);
  const landingPointer = useTransform(scrollYProgress, (pos) => (pos > 0.2 ? "none" : "auto"));
  const buttonPointer = useTransform(scrollYProgress, (pos) => (pos > 0.84 ? "auto" : "none"));
  const buttonOpacity = useTransform(scrollYProgress, [0.84, 0.93], [0, 1]);

  // Transition blur + noir démarre à la frame 97 (~scroll 0.53)
const canvasBlur = useTransform(scrollYProgress, [0.53, 0.65], [0, 20]);
  const canvasFilter = useTransform(canvasBlur, (blur) => `blur(${blur}px)`);
  const darkOverlayOpacity = useTransform(scrollYProgress, [0.53, 0.62], [0, 1]);
  // Casque apparaît une fois le fond blanc complet, stop zone 0.72→0.84
  const casqueEclatOpacity = useTransform(scrollYProgress, [0.53, 0.72], [0, 1]);

  const [isHelmetHovered, setIsHelmetHovered] = useState(false);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loaded = 0;

    for (let i = 1; i <= numFrames; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, "0");
      img.src = `/media/frames/frame_${paddedIndex}.png`;
      img.onload = () => {
        loaded += 1;
        setImagesLoaded(loaded);
      };
      loadedImages.push(img);
    }

    setImages(loadedImages);
  }, []);

  const allReady = imagesLoaded === numFrames;

  useEffect(() => {
    if (!canvasRef.current || !allReady) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const drawFrame = (latestIndex: number) => {
      const frameIndex = Math.min(Math.max(Math.floor(latestIndex), 1), numFrames);
      const img = images[frameIndex - 1];
      if (!img || !img.complete) return;

      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

      const canvas = canvasRef.current!;
      const canvasAspect = canvas.width / canvas.height;
      const imgAspect = img.width / img.height;

      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let x = 0;
      let y = 0;

      if (imgAspect > canvasAspect) {
        drawHeight = canvas.width / imgAspect;
        y = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgAspect;
        x = (canvas.width - drawWidth) / 2;
      }

      ctx.drawImage(img, x, y, drawWidth, drawHeight);
    };

    drawFrame(1);
    const unsubscribe = currentFrameIndex.on("change", drawFrame);
    return () => unsubscribe();
  }, [allReady, currentFrameIndex, images]);

  return (
    <div
      className="min-h-screen bg-[#fcfcfc] text-[#0f0f11] selection:bg-[#ff5a00]/20"
      style={{ fontFamily: bodyFont }}
    >
      {!allReady && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fcfcfc]">
          <div className="mb-4 h-1 w-64 overflow-hidden rounded-full bg-[#0f0f11]/10">
            <div
              className="h-full bg-[#ff5a00] transition-all duration-300 ease-out"
              style={{ width: `${(imagesLoaded / numFrames) * 100}%` }}
            />
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#0f0f11]/50">
            Chargement des assets 3D...
          </p>
        </div>
      )}

      <div ref={containerRef} className="relative w-full" style={{ height: "800vh" }}>
        <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
          <motion.div
            style={{ opacity: landingOpacity, pointerEvents: landingPointer as any }}
            className="absolute inset-0 z-20 flex items-center justify-center"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ fontFamily: displayFont, fontSize: "42vw", lineHeight: 0.8, color: "#ffffff", textShadow: "0 0 80px rgba(0,0,0,0.25), 0 0 200px rgba(0,0,0,0.15)" }}
              className="absolute z-0 select-none font-black tracking-tighter"
            >
              ORA
            </motion.h1>

            <motion.div
              className="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 cursor-crosshair rounded-[50%]"
              style={{ width: "30vw", height: "60vh" }}
              onHoverStart={() => setIsHelmetHovered(true)}
              onHoverEnd={() => setIsHelmetHovered(false)}
            />

            <motion.img
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: isHelmetHovered ? 0.15 : 1,
                scale: isHelmetHovered ? 1.05 : 1,
                y: 0,
                transition: {
                  duration: isHelmetHovered ? 0.2 : 0.4,
                  delay: isHelmetHovered ? 0 : 0,
                  ease: [0.16, 1, 0.3, 1],
                },
              }}
              src="/media/side elements/casque.png"
              alt="Casque ORA"
              className="absolute z-10 h-full w-full object-contain pointer-events-none"
            />

            {/* Logos Decathlon × Simond */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
              className="absolute left-1/2 z-50 -translate-x-1/2 grid items-center"
              style={{ top: "calc(50% - 22vw)", gridTemplateColumns: "1fr auto 1fr", width: "36vw" }}
            >
              <img src="/media/side elements/decath.svg" alt="Decathlon" className="h-5 w-auto justify-self-end" />
              <span className="px-8 text-sm font-light" style={{ color: "#DD4543" }}>×</span>
              <img src="/media/side elements/simond.svg" alt="Simond" className="h-5 w-auto justify-self-start" />
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="absolute bottom-10 left-1/2 z-50 -translate-x-1/2 flex flex-col items-center gap-1"
            >
              {[0, 1].map((i) => (
                <motion.svg
                  key={i}
                  width="20"
                  height="12"
                  viewBox="0 0 20 12"
                  fill="none"
                  animate={{ y: [0, 5, 0], opacity: [0.9, 0.3, 0.9] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                >
                  <path
                    d="M1 1L10 10L19 1"
                    stroke="#E8321A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              ))}
            </motion.div>
          </motion.div>

          <motion.canvas
            style={{ opacity: canvasOpacity, filter: canvasFilter as any }}
            ref={canvasRef}
            width={1920}
            height={1080}
            className="absolute z-10 h-full w-full object-contain pointer-events-none"
          />

          {/* Dark overlay */}
          <motion.div
            style={{ opacity: darkOverlayOpacity }}
            className="absolute inset-0 z-20 bg-[#fcfcfc] pointer-events-none"
          />

          {/* Casque éclaté sans fond */}
          <motion.img
            style={{ opacity: casqueEclatOpacity }}
            src="/media/side elements/casque-eclat-ssfond.png"
            alt="Casque ORA éclaté"
            className="absolute z-30 h-full w-full object-contain pointer-events-none"
          />

          {/* Boutons / CTA */}
          <motion.div
            style={{ opacity: buttonOpacity, pointerEvents: buttonPointer as any }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6"
          >
            <h2
              className="mb-8 text-center text-5xl font-bold text-white md:text-7xl"
              style={{ fontFamily: displayFont, textShadow: "0 2px 12px rgba(0,0,0,0.25), 0 0 30px rgba(0,0,0,0.15)" }}
            >
              Prêt pour l&apos;immersion ?
            </h2>
            <Link
              to="/vr"
              className="group relative rounded-full border border-white/30 bg-white/20 px-10 py-5 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/30 md:text-xl"
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_1.5s_infinite]" />
              </div>
              Lancer l&apos;expérience VR
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
