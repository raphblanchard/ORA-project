import { useEffect, useState } from "react";
import VrHudAframe from "./components/VrHudAframe";

type Page = "infos" | "ascension";

type ReferencePreset = {
  alertType: "breathing" | "return";
  altitude: string;
  ambText: string;
  avgSpeed: string;
  batteryText: string;
  bpm: string;
  corpText: string;
  mapCenter: { lat: number; lon: number };
  maxSpeed: string;
  speed: string;
  title: string;
  videoSrc: string;
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
    bpm: "128",
    corpText: "33.1",
    mapCenter: { lat: 45.8789, lon: 6.8874 },
    maxSpeed: "71",
    speed: "56",
    videoSrc: "/media/hud-background.mp4",
    weatherMode: false,
  },
  ascension: {
    alertType: "return",
    title: "Ascension",
    altitude: "1870",
    ambText: "-11.0",
    avgSpeed: "0",
    batteryText: "82",
    bpm: "142",
    corpText: "31.8",
    mapCenter: { lat: 45.832, lon: 6.865 },
    maxSpeed: "0",
    speed: "0",
    videoSrc: "/media/hud-background.mp4",
    weatherMode: true,
  },
};

export default function App() {
  const [page, setPage] = useState<Page>("infos");
  const [timeText, setTimeText] = useState("--:--");

  const preset = PRESETS[page];
  const isFirstReference = page === "infos";

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setTimeText(`${hh}:${mm}`);
    };

    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const toggleReference = () => {
    setPage((currentPage) => (currentPage === "ascension" ? "infos" : "ascension"));
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-sky-300 via-blue-200 to-blue-100">
      <div className="mx-auto flex min-h-screen max-w-[1920px] items-center justify-center p-4">
        <div className="relative h-[min(100vh-32px,916px)] w-full max-w-[1628px]">
          <VrHudAframe
            alertType={preset.alertType}
            altitude={preset.altitude}
            bpm={preset.bpm}
            isFirstReference={isFirstReference}
            onToggleReference={toggleReference}
            timeText={timeText}
            tempAmb={preset.ambText}
            tempObj={preset.corpText}
            videoSrc={preset.videoSrc}
          />
        </div>
      </div>
    </div>
  );
}
