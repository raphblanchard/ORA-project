// @ts-nocheck
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { createPortal } from "react-dom";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type HudMode = "normal" | "alerte";

export interface VrHudProps {
  altitude: string;
  bpm: string;
  timeText: string;
  tempAmb: string;
  tempObj: string;
  videoSrc: string;
  /** "normal" (teal) | "alerte" (rouge).  Défaut: "normal" */
  mode?: HudMode;
  /** Afficher les lignes latérales.  Défaut: true */
  showLines?: boolean;
  /** Durée du balayage des lignes (ms).  Défaut: 900 */
  sweepDuration?: number;
}

/* ─────────────────────────────────────────────
   PALETTE
───────────────────────────────────────────── */
const PALETTE = {
  normal: { color: "#6AD2CA", glow: "rgba(106,210,202,0.4)" },
  alerte: { color: "#E53935", glow: "rgba(229,57,53,0.5)" },
};

/* ─────────────────────────────────────────────
   ICÔNES SVG inline
───────────────────────────────────────────── */
const Icon = {
  Clock: ({ c, s = 16 }: { c: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.8" />
      <path d="M12 7v5l3 3" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Arrow: ({ c, s = 16 }: { c: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Heart: ({ c, s = 16 }: { c: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 21C12 21 4 14.5 4 9a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 5.5-8 12-8 12Z" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Thermo: ({ c, s = 16 }: { c: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 14V5M12 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.5 8h1.5M9.5 11h1.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Cloud: ({ c, s = 16 }: { c: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M18 10a6 6 0 0 0-11.8-1.1A4 4 0 1 0 7 18h11a3 3 0 0 0 0-8Z" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Moon: ({ c, s = 16 }: { c: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* ─────────────────────────────────────────────
   STAT ROW
───────────────────────────────────────────── */
function Stat({
  icon,
  value,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, lineHeight: 1 }}>
      {icon}
      <span
        style={{
          color,
          fontFamily: "'Rajdhani', 'Arial Narrow', sans-serif",
          fontWeight: 600,
          fontSize: "clamp(12px, 1.5vw, 20px)",
          letterSpacing: "0.08em",
          textShadow: `0 0 12px ${color}80`,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COURBES SVG avec balayage
   On utilise stroke-dasharray/dashoffset au lieu de clipPath
   pour éviter les bugs de contexte SVG/A-Frame
───────────────────────────────────────────── */
function Curve({
  color,
  visible,
  dur,
  flip = false,
}: {
  color: string;
  visible: boolean;
  dur: number;
  flip?: boolean;
}) {
  // La courbe : path D de l'image "Line gauche.png"
  // Approximation Bézier depuis le bas-gauche vers le haut-droit
  const PATH = "M 12 268 C 90 268, 280 200, 608 16";
  const LENGTH = 680; // longueur approximative du path

  return (
    <svg
      viewBox="0 0 620 280"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        top: 0,
        left: flip ? undefined : 0,
        right: flip ? 0 : undefined,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <defs>
        <filter id={`glow-${flip ? "r" : "l"}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ligne principale avec dash-offset sweep */}
      <path
        d={PATH}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        filter={`url(#glow-${flip ? "r" : "l"})`}
        style={{
          strokeDasharray: LENGTH,
          strokeDashoffset: visible ? 0 : LENGTH,
          transition: `stroke-dashoffset ${dur}ms cubic-bezier(0.4,0,0.2,1)`,
          opacity: visible ? 1 : 0.02,
        }}
      />
      {/* Point terminal bas */}
      <circle
        cx="12"
        cy="268"
        r="4"
        fill={color}
        filter={`url(#glow-${flip ? "r" : "l"})`}
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity ${dur * 0.3}ms ease ${visible ? dur * 0.8 : 0}ms`,
        }}
      />
      {/* Point terminal haut */}
      <circle
        cx="608"
        cy="16"
        r="4"
        fill={color}
        filter={`url(#glow-${flip ? "r" : "l"})`}
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity ${dur * 0.3}ms ease ${visible ? 0 : dur * 0.8}ms`,
        }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   HUD OVERLAY — rendu via Portal, position: fixed
   => entièrement isolé du canvas A-Frame
───────────────────────────────────────────── */
function HudOverlay({
  altitude,
  bpm,
  timeText,
  tempAmb,
  tempObj,
  mode,
  showLines,
  sweepDuration,
  linesVisible,
  logoScale,
}: {
  altitude: string;
  bpm: string;
  timeText: string;
  tempAmb: string;
  tempObj: string;
  mode: HudMode;
  showLines: boolean;
  sweepDuration: number;
  linesVisible: boolean;
  logoScale: number;
}) {
  const { color, glow } = PALETTE[mode];
  const show = showLines && linesVisible;

  // délais d'apparition échelonnés
  const fade = (delay: number) => ({
    opacity: linesVisible ? 1 : 0,
    transition: `opacity ${sweepDuration * 0.5}ms ease ${linesVisible ? delay : 0}ms`,
  } as React.CSSProperties);

  return (
    <div
      aria-label="HUD"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        fontFamily: "sans-serif",
      }}
    >
      {/* ── LOGO CENTRAL ── */}
      <div
        style={{
          position: "absolute",
          top: "7%",
          left: "50%",
          transform: `translateX(-50%) scale(${logoScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          transition: "transform 0.15s",
        }}
      >
        <img
          src="/media/hud/png-elements/hq/Logo%20vert.png"
          alt="ORA"
          style={{
            width: "clamp(40px, 4.5vw, 68px)",
            height: "clamp(40px, 4.5vw, 68px)",
            objectFit: "contain",
            filter:
              mode === "alerte"
                ? `invert(23%) sepia(96%) saturate(2400%) hue-rotate(347deg) brightness(90%) contrast(110%) drop-shadow(0 0 10px ${color})`
                : `drop-shadow(0 0 8px ${color})`,
            transition: "filter 0.5s",
          }}
        />
        {mode === "alerte" && (
          <span
            style={{
              color,
              fontFamily: "'Orbitron', monospace",
              fontWeight: 700,
              fontSize: "clamp(9px, 1vw, 14px)",
              letterSpacing: "0.25em",
              textShadow: `0 0 14px ${color}`,
            }}
          >
            DANGER
          </span>
        )}
      </div>

      {/* ── LIGNES COURBES ── */}
      {/* Côté gauche */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "50%",
          height: "40%",
          pointerEvents: "none",
        }}
      >
        <Curve color={color} visible={show} dur={sweepDuration} flip={false} />
      </div>
      {/* Côté droit (miroir) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "40%",
          pointerEvents: "none",
        }}
      >
        <Curve color={color} visible={show} dur={sweepDuration} flip={true} />
      </div>

      {/* ══ STATS GAUCHE ══ */}

      {/* Heure — quart supérieur gauche, sur la courbe */}
      <div style={{ position: "absolute", top: "13%", left: "28%", ...fade(sweepDuration * 0.5) }}>
        <Stat icon={<Icon.Clock c={color} />} value={timeText} color={color} />
      </div>

      {/* Altitude — milieu courbe gauche */}
      <div style={{ position: "absolute", top: "21%", left: "14%", ...fade(sweepDuration * 0.65) }}>
        <Stat icon={<Icon.Arrow c={color} />} value={`${altitude}m`} color={color} />
      </div>

      {/* Durée / nuit — bas gauche */}
      <div style={{ position: "absolute", top: "31%", left: "2%", ...fade(sweepDuration * 0.8) }}>
        <Stat icon={<Icon.Moon c={color} />} value="1H32" color={color} />
      </div>

      {/* ══ STATS DROITE ══ */}

      {/* BPM — quart supérieur droit */}
      <div style={{ position: "absolute", top: "13%", right: "28%", ...fade(sweepDuration * 0.5) }}>
        <Stat icon={<Icon.Heart c={color} />} value={`${bpm}bpm`} color={color} />
      </div>

      {/* Temp corps — milieu courbe droite */}
      <div style={{ position: "absolute", top: "21%", right: "14%", ...fade(sweepDuration * 0.65) }}>
        <Stat icon={<Icon.Thermo c={color} />} value={`${tempObj}°C`} color={color} />
      </div>

      {/* Temp extérieure — bas droite */}
      <div style={{ position: "absolute", top: "31%", right: "2%", ...fade(sweepDuration * 0.8) }}>
        <Stat icon={<Icon.Cloud c={color} />} value={`${tempAmb}°C`} color={color} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPOSANT PRINCIPAL
───────────────────────────────────────────── */
export default function VrHud({
  altitude,
  bpm,
  timeText,
  tempAmb,
  tempObj,
  videoSrc,
  mode = "normal",
  showLines = true,
  sweepDuration = 900,
}: VrHudProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [linesVisible, setLinesVisible] = useState(false);
  const [logoScale, setLogoScale] = useState(1);

  /* ── lecture vidéo ── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, []);

  /* ── apparition des lignes avec délai ── */
  useEffect(() => {
    const t = setTimeout(() => setLinesVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  /* ── pulsation logo en mode normal ── */
  useEffect(() => {
    if (mode !== "normal") { setLogoScale(1); return; }
    let raf: number;
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (t0 === null) t0 = ts;
      const s = (ts - t0) / 1000;
      setLogoScale(1 + 0.07 * Math.sin(s * 2 * Math.PI * 0.9));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  /* ── pulsation rapide en mode alerte ── */
  useEffect(() => {
    if (mode !== "alerte") return;
    let raf: number;
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (t0 === null) t0 = ts;
      const s = (ts - t0) / 1000;
      setLogoScale(1 + 0.11 * Math.abs(Math.sin(s * Math.PI * 2)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "black",
        overflow: "hidden",
      }}
    >
      {/* CSS font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap');
      `}</style>

      {/* ── Bouton play si autoplay bloqué ── */}
      {!isPlaying && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.85)",
            pointerEvents: "auto",
          }}
        >
          <button
            style={{
              padding: "16px 36px",
              borderRadius: 14,
              background: "#0e7875",
              color: "#fff",
              fontWeight: 700,
              fontSize: 20,
              border: "2px solid #6AD2CA",
              cursor: "pointer",
              boxShadow: "0 0 24px rgba(106,210,202,0.4)",
            }}
            onClick={() => {
              videoRef.current?.play();
              setIsPlaying(true);
            }}
          >
            ▶ Lancer la vidéo VR
          </button>
        </div>
      )}

      {/* ── Scène A-Frame ── */}
      <a-scene
        vr-mode-ui="enabled: true"
        loading-screen="enabled: false"
        device-orientation-permission-ui="enabled: false"
        style={{ position: "absolute", inset: 0 }}
      >
        <a-assets>
          <video
            id="bg-video"
            ref={videoRef}
            src={videoSrc}
            crossOrigin="anonymous"
            autoPlay
            loop
            muted
            playsInline
          />
        </a-assets>
        <a-videosphere src="#bg-video" rotation="0 -90 0" />
        <a-camera
          id="vr-camera"
          position="0 1.6 0"
          look-controls="pointerLockEnabled: false"
        />
      </a-scene>

      {/* ── HUD via Portal → monté sur document.body ── */}
      {createPortal(
        <HudOverlay
          altitude={altitude}
          bpm={bpm}
          timeText={timeText}
          tempAmb={tempAmb}
          tempObj={tempObj}
          mode={mode}
          showLines={showLines}
          sweepDuration={sweepDuration}
          linesVisible={linesVisible}
          logoScale={logoScale}
        />,
        document.body
      )}
    </div>
  );
}
