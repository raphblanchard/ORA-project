import { useEffect, useRef, useState } from "react";
import VrHudAframe from "./components/VrHudAframe";
import VideoPreloader from "./components/VideoPreloader";

/* Scène 1 (descente) : vidéo ski — servie statiquement */
const VIDEO_DESCENTE_URL = "/media/video/Ski HD.mp4";
/* Scène 2 (ascension) : vidéo montagne 360° */
const VIDEO_ASCENSION_URL = import.meta.env.DEV
  ? "/media/old-hud-background.mp4"
  : "/api/video";

type Page = "infos" | "ascension";

type ReferencePreset = {
  alertType: "breathing" | "return";
  altitude: string;
  ambText: string;
  avgSpeed: string;
  batteryText: string;
  bpm: string;
  corpText: string;
  durationText: string;
  mapCenter: { lat: number; lon: number };
  maxSpeed: string;
  speed: string;
  timeText: string;
  title: string;
  weatherMode: boolean;
};

const PRESETS: Record<Page, ReferencePreset> = {
  infos: {
    alertType: "breathing",
    title: "Descente",
    altitude: "2145",
    ambText: "-6.5",
    avgSpeed: "48",
    batteryText: "82",
    bpm: "176",
    corpText: "33.1",
    durationText: "7H20",
    mapCenter: { lat: 45.8789, lon: 6.8874 },
    maxSpeed: "71",
    speed: "56",
    timeText: "11:25",
    weatherMode: false,
  },
  ascension: {
    alertType: "return",
    title: "Ascension",
    altitude: "2410",
    ambText: "-9.0",
    avgSpeed: "12",
    batteryText: "61",
    bpm: "118",
    corpText: "31.8",
    durationText: "0H35",
    mapCenter: { lat: 45.832, lon: 6.865 },
    maxSpeed: "22",
    speed: "14",
    timeText: "18:10",
    weatherMode: true,
  },
};

/* Seuils déclencheurs */
const BPM_ALERT_THRESHOLD = 175;
const ALTITUDE_ALERT_THRESHOLD = 2410;

/* Formate un nombre de minutes en "XHxx" */
const fmtDuration = (mins: number) =>
  `${Math.floor(mins / 60)}H${String(mins % 60).padStart(2, "0")}`;

export default function App() {
  const [page, setPage] = useState<Page>("infos");
  const [videoReady, setVideoReady] = useState(false);
  const [alertMode, setAlertMode] = useState<"none" | "breathing" | "return">("none");
  const [simKey, setSimKey] = useState(0); // incrémenté à chaque boucle vidéo

  /* Valeurs simulées */
  const [simBpm, setSimBpm] = useState(158);
  const [simAltitude, setSimAltitude] = useState(2388);
  const [simDurationMins, setSimDurationMins] = useState(36);

  const alertFiredRef = useRef(false);
  const preset = PRESETS[page];
  const isFirstReference = page === "infos";

  /* ── Simulation des données + déclenchement alerte par seuil ── */
  useEffect(() => {
    alertFiredRef.current = false;
    setAlertMode("none");

    if (page === "infos") {
      /* Descente : BPM monte de 158 vers 180, alerte à 175 */
      setSimBpm(158);
      const iv = setInterval(() => {
        setSimBpm(prev => {
          const next = Math.min(prev + 1, 182);
          if (next >= BPM_ALERT_THRESHOLD && !alertFiredRef.current) {
            alertFiredRef.current = true;
            setAlertMode("breathing");
          }
          return next;
        });
      }, 1200);
      return () => clearInterval(iv);
    } else {
      /* Ascension : altitude monte de 2388 vers 2415, alerte à 2410 */
      setSimAltitude(2388);
      setSimDurationMins(36);
      const iv = setInterval(() => {
        setSimAltitude(prev => {
          const next = Math.min(prev + 1, 2415);
          if (next >= ALTITUDE_ALERT_THRESHOLD && !alertFiredRef.current) {
            alertFiredRef.current = true;
            setSimDurationMins(35); /* le soleil se couche dans 35 min */
            setAlertMode("return");
          }
          return next;
        });
      }, 1500);
      return () => clearInterval(iv);
    }
  }, [page, simKey]);

  /* ── Détection fin de vidéo → relance vidéo + reset simulation ── */
  useEffect(() => {
    if (!videoReady) return;
    const videoId = page === "infos" ? "bg-video-af" : "bg-video-ascension";
    const video = document.getElementById(videoId) as HTMLVideoElement | null;
    if (!video) return;

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
      setSimKey(k => k + 1);
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [page, videoReady]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setPage("ascension");
      if (event.key === "ArrowLeft") setPage("infos");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleReference = () => {
    setPage((currentPage) => (currentPage === "ascension" ? "infos" : "ascension"));
  };

  if (!videoReady) {
    return (
      <VideoPreloader
        videoUrl={VIDEO_DESCENTE_URL}
        secondaryVideoUrl={VIDEO_ASCENSION_URL}
        onStart={() => setVideoReady(true)}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#fcfcfc]">
      <div className="mx-auto flex min-h-screen max-w-[1920px] items-center justify-center p-4">
        <div className="relative h-[min(100vh-32px,916px)] w-full max-w-[1628px]">
          <VrHudAframe
            alertMode={alertMode}
            altitude={page === "ascension" ? simAltitude.toString() : preset.altitude}
            bpm={page === "infos" ? simBpm.toString() : preset.bpm}
            durationText={page === "ascension" ? fmtDuration(simDurationMins) : preset.durationText}
            isFirstReference={isFirstReference}
            onToggleReference={toggleReference}
            timeText={preset.timeText}
            tempAmb={preset.ambText}
            tempObj={preset.corpText}
          />
        </div>
      </div>
    </div>
  );
}
