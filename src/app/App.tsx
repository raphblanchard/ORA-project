import { useEffect, useState } from "react";
import VrHudAframe from "./components/VrHudAframe";
import VideoPreloader from "./components/VideoPreloader";

const VIDEO_URL = "/api/video";

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

export default function App() {
  const [page, setPage] = useState<Page>("infos");
  const [videoReady, setVideoReady] = useState(false);

  const preset = PRESETS[page];
  const isFirstReference = page === "infos";

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

  // Écran de préchargement — affiché jusqu'à ce que l'utilisateur clique "Démarrer"
  if (!videoReady) {
    return <VideoPreloader videoUrl={VIDEO_URL} onStart={() => setVideoReady(true)} />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#fcfcfc]">
      <div className="mx-auto flex min-h-screen max-w-[1920px] items-center justify-center p-4">
        <div className="relative h-[min(100vh-32px,916px)] w-full max-w-[1628px]">
          <VrHudAframe
            alertType={preset.alertType}
            altitude={preset.altitude}
            bpm={preset.bpm}
            durationText={preset.durationText}
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
