import {
  useEffect,
  useRef,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { Component, Vector, Component1, Component2, Component3, ComponentWeather } from "../imports/Frame1-2-247";
import VrHud from "./components/VrHud";

const SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const TX_CHAR = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

type Page = "home" | "infos" | "ascension" | "test";

const haversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function App() {
  const hudVideoSrc = "/media/hud-background.mp4";
  const [page, setPage] = useState<Page>("infos");
  const [btStatus, setBtStatus] = useState("BT: non connecte");
  const [sessionActive, setSessionActive] = useState(false);
  const [testSessionActive, setTestSessionActive] = useState(false);
  const [isVrMode, setIsVrMode] = useState(false);
  const [bpm, setBpm] = useState<string>("0");
  const [tempAmb, setTempAmb] = useState<string>("--");
  const [tempObj, setTempObj] = useState<string>("--");
  const [speed, setSpeed] = useState<string>("0");
  const [maxSpeed, setMaxSpeed] = useState<number>(0);
  const [avgSpeed, setAvgSpeed] = useState<number>(0);
  const [timeText, setTimeText] = useState<string>("--:--");
  const [batteryText, setBatteryText] = useState<string>("--");
  const [homeStatus, setHomeStatus] = useState("Maison: non definie");
  const [homeModalOpen, setHomeModalOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 46.8, lon: 2.2 });
  const [homePos, setHomePos] = useState<{ lat: number; lon: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lon: number } | null>(null);
  const [altitude, setAltitude] = useState<string>("0");
  const [testAltitude, setTestAltitude] = useState(1200);
  const [testTempAmb, setTestTempAmb] = useState(-5);
  const [testTempObj, setTestTempObj] = useState(32.5);
  const [testBpm, setTestBpm] = useState(90);
  const [testBattery, setTestBattery] = useState(80);
  const [testHour, setTestHour] = useState(10);
  const [testMinute, setTestMinute] = useState(15);
  const [testMapCenter] = useState({ lat: 45.832, lon: 6.865 });
  const lastAltitudeFetchRef = useRef(0);
  const lastGpsRef = useRef<{ lat: number; lon: number; t: number } | null>(null);
  const totalDistanceRef = useRef(0);
  const totalTimeRef = useRef(0);
  const sessionActiveRef = useRef(false);
  const holdTimeoutRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);
  const suppressNextClickRef = useRef(false);
  const isAscensionPage = page === "ascension";
  const isTestPage = page === "test";
  const isWeatherPage = isAscensionPage || isTestPage;
  const activeSession = isTestPage ? testSessionActive : sessionActive;
  const altitudeDisplay = isTestPage ? String(testAltitude) : altitude;
  const tempAmbDisplay = isTestPage ? testTempAmb.toFixed(1) : tempAmb;
  const tempObjDisplay = isTestPage ? testTempObj.toFixed(1) : tempObj;
  const bpmDisplay = isTestPage ? String(testBpm) : bpm;
  const timeDisplay = isTestPage
    ? `${String(testHour).padStart(2, "0")}:${String(testMinute).padStart(2, "0")}`
    : timeText;
  const batteryDisplay = isTestPage ? String(testBattery) : batteryText;

  const mapSrc = useMemo(() => {
    const d = 0.08;
    const minLon = mapCenter.lon - d;
    const minLat = mapCenter.lat - d;
    const maxLon = mapCenter.lon + d;
    const maxLat = mapCenter.lat + d;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${mapCenter.lat}%2C${mapCenter.lon}`;
  }, [mapCenter]);

  const hudMapSrc = useMemo(() => {
    if (isTestPage) {
      const d = 0.01;
      const minLon = testMapCenter.lon - d;
      const minLat = testMapCenter.lat - d;
      const maxLon = testMapCenter.lon + d;
      const maxLat = testMapCenter.lat + d;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik`;
    }
    const center = currentPos ?? mapCenter;
    const d = 0.01;
    const minLon = center.lon - d;
    const minLat = center.lat - d;
    const maxLon = center.lon + d;
    const maxLat = center.lat + d;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik`;
  }, [currentPos, isTestPage, mapCenter, testMapCenter.lat, testMapCenter.lon]);

  const setHomePosition = (lat: number, lon: number, source: string) => {
    setHomePos({ lat, lon });
    setMapCenter({ lat, lon });
    setHomeStatus(`Maison: definie (${source}) ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
  };

  const getPosition = () =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      });
    });

  const resolveAltitude = async (lat: number, lon: number, geoAltitude?: number | null) => {
    if (typeof geoAltitude === "number" && Number.isFinite(geoAltitude)) {
      return Math.round(geoAltitude);
    }
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`
      );
      if (res.ok) {
        const data = await res.json();
        if (typeof data.elevation === "number" && Number.isFinite(data.elevation)) {
          return Math.round(data.elevation);
        }
      }
    } catch { }

    try {
      const res = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`);
      if (res.ok) {
        const data = await res.json();
        const elevation = data?.results?.[0]?.elevation;
        if (typeof elevation === "number" && Number.isFinite(elevation)) {
          return Math.round(elevation);
        }
      }
    } catch { }
    return null;
  };

  const resetSessionMetrics = () => {
    setBpm("0");
    setSpeed("0");
    setMaxSpeed(0);
    setAvgSpeed(0);
    setAltitude("-");
    lastGpsRef.current = null;
    totalDistanceRef.current = 0;
    totalTimeRef.current = 0;
    lastAltitudeFetchRef.current = 0;
  };

  const startSession = () => {
    sessionActiveRef.current = true;
    resetSessionMetrics();
    setSessionActive(true);
    getPosition()
      .then(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCurrentPos({ lat, lon });
        const elevation = await resolveAltitude(lat, lon, pos.coords.altitude);
        if (typeof elevation === "number") setAltitude(String(elevation));
      })
      .catch(() => { });
  };

  const stopSession = () => {
    sessionActiveRef.current = false;
    setSessionActive(false);
    resetSessionMetrics();
  };

  const startDisplaySession = () => {
    if (isTestPage) {
      setTestAltitude(3000);
      setTestHour(17);
      setTestMinute(0);
      setTestSessionActive(true);
      return;
    }
    startSession();
  };

  const stopDisplaySession = () => {
    setIsVrMode(false);
    if (isTestPage) {
      setTestSessionActive(false);
      return;
    }
    stopSession();
  };

  const startVrSession = () => {
    setIsVrMode(true);
    startDisplaySession();
  };

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const bumpInt = (
    setter: Dispatch<SetStateAction<number>>,
    delta: number,
    min: number,
    max: number
  ) => {
    setter((prev) => clamp(prev + delta, min, max));
  };

  const bumpFloat = (
    setter: Dispatch<SetStateAction<number>>,
    delta: number,
    min: number,
    max: number,
    decimals: number
  ) => {
    setter((prev) => {
      const next = clamp(prev + delta, min, max);
      return Number(next.toFixed(decimals));
    });
  };

  const bumpTestTime = (deltaMinutes: number) => {
    setTestMinute((prevMinute) => {
      let nextMinute = prevMinute + deltaMinutes;
      let hourDelta = 0;

      while (nextMinute >= 60) {
        nextMinute -= 60;
        hourDelta += 1;
      }
      while (nextMinute < 0) {
        nextMinute += 60;
        hourDelta -= 1;
      }

      if (hourDelta !== 0) {
        setTestHour((prevHour) => {
          const nextHour = prevHour + hourDelta;
          return ((nextHour % 24) + 24) % 24;
        });
      }

      return nextMinute;
    });
  };

  const clearHoldTimers = () => {
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const startHold = (action: () => void) => {
    clearHoldTimers();
    suppressNextClickRef.current = false;
    holdTimeoutRef.current = window.setTimeout(() => {
      suppressNextClickRef.current = true;
      action();
      holdIntervalRef.current = window.setInterval(action, 90);
    }, 300);
  };

  const onRepeatMouseDown = (e: ReactMouseEvent<HTMLButtonElement>, action: () => void) => {
    e.preventDefault();
    startHold(action);
  };

  const onRepeatTouchStart = (e: ReactTouchEvent<HTMLButtonElement>, action: () => void) => {
    e.preventDefault();
    startHold(action);
  };

  const onRepeatClick = (e: ReactMouseEvent<HTMLButtonElement>, action: () => void) => {
    if (suppressNextClickRef.current) {
      e.preventDefault();
      suppressNextClickRef.current = false;
      return;
    }
    action();
  };

  const controlBtnClass =
    "w-8 h-6 rounded border border-white/60 bg-black/45 text-white text-xs leading-none";
  const controlPairClass =
    "absolute z-50 -translate-x-1/2 -translate-y-1/2 flex h-14 w-8 flex-col items-center justify-between";

  const connectBLE = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "ESP32_BPM_BLE" }],
        optionalServices: [SERVICE],
      });
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService(SERVICE);
      const tx = await service?.getCharacteristic(TX_CHAR);
      await tx?.startNotifications();
      if (tx) {
        tx.oncharacteristicvaluechanged = (e: Event) => {
          const target = e.target as BluetoothRemoteGATTCharacteristic;
          if (!target?.value) return;
          const raw = new TextDecoder().decode(target.value).trim();
          if (!raw) return;

          try {
            const parsed = JSON.parse(raw);
            const bpmValue = parsed?.bpm ?? parsed?.bpm_i;
            const tAmbValue = parsed?.t_amb;
            const tObjValue = parsed?.t_obj;

            if (typeof tAmbValue === "number" && Number.isFinite(tAmbValue)) {
              setTempAmb(tAmbValue.toFixed(1));
            }
            if (typeof tObjValue === "number" && Number.isFinite(tObjValue)) {
              setTempObj(tObjValue.toFixed(1));
            }

            if (sessionActiveRef.current && typeof bpmValue === "number" && Number.isFinite(bpmValue)) {
              setBpm(String(Math.round(bpmValue)));
            }

            return;
          } catch { }

          const match = raw.match(/\b(\d{2,3})\b/);
          if (sessionActiveRef.current && match) setBpm(match[1]);
        };
      }
      setBtStatus(`BT: connecte (${device.name || "ESP32"})`);
    } catch {
      setBtStatus("BT: erreur de connexion");
    }
  };

  const defineHomeCurrent = async () => {
    try {
      const pos = await getPosition();
      setHomePosition(pos.coords.latitude, pos.coords.longitude, "position actuelle");
    } catch {
      setHomeStatus("Maison: erreur de geolocalisation");
    }
  };

  const centerOnMe = async () => {
    try {
      const pos = await getPosition();
      setMapCenter({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    } catch { }
  };

  const defineHomeAddress = async () => {
    const q = address.trim();
    if (!q) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`
      );
      if (!res.ok) return;
      const rows = await res.json();
      if (!rows?.length) return;
      const lat = Number(rows[0].lat);
      const lon = Number(rows[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
      setHomePosition(lat, lon, "adresse");
    } catch { }
  };

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

  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number; addEventListener?: (type: string, listener: () => void) => void }> };
    if (!nav.getBattery) return;
    let alive = true;
    nav.getBattery()
      .then((battery) => {
        const updateBattery = () => {
          if (!alive) return;
          setBatteryText(String(Math.round((battery.level ?? 0) * 100)));
        };
        updateBattery();
        battery.addEventListener?.("levelchange", updateBattery);
      })
      .catch(() => { });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (isTestPage) return;
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const t = pos.timestamp;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCurrentPos({ lat, lon });

        if (!sessionActiveRef.current) return;

        if (typeof pos.coords.speed === "number" && Number.isFinite(pos.coords.speed) && pos.coords.speed >= 0) {
          const kmh = pos.coords.speed * 3.6;
          const current = kmh < 1 ? 0 : Math.round(kmh);
          setSpeed(String(current));
          setMaxSpeed((prev) => (current > prev ? current : prev));
        } else if (lastGpsRef.current) {
          const dtSec = (t - lastGpsRef.current.t) / 1000;
          if (dtSec > 0.2) {
            const dMeters = haversineMeters(lastGpsRef.current.lat, lastGpsRef.current.lon, lat, lon);
            const kmh = (dMeters / dtSec) * 3.6;
            const current = dMeters < 0.5 || kmh < 0.5 ? 0 : Math.round(kmh);
            setSpeed(String(current));
            setMaxSpeed((prev) => (current > prev ? current : prev));
          }
        } else {
          setSpeed("0");
        }

        if (lastGpsRef.current) {
          const dtSec = (t - lastGpsRef.current.t) / 1000;
          if (dtSec > 0.5 && dtSec < 15) {
            const dMeters = haversineMeters(lastGpsRef.current.lat, lastGpsRef.current.lon, lat, lon);
            totalDistanceRef.current += dMeters;
            totalTimeRef.current += dtSec;
            const avgKmh = (totalDistanceRef.current / totalTimeRef.current) * 3.6;
            setAvgSpeed(avgKmh < 1 ? 0 : Math.round(avgKmh));
          }
        }
        lastGpsRef.current = { lat, lon, t };

        const now = Date.now();
        if (now - lastAltitudeFetchRef.current < 5000) return;
        lastAltitudeFetchRef.current = now;
        const elevation = await resolveAltitude(lat, lon, pos.coords.altitude);
        if (typeof elevation === "number") setAltitude(String(elevation));
      },
      () => { },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTestPage]);

  useEffect(() => {
    if (!sessionActive || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCurrentPos({ lat, lon });

        if (typeof pos.coords.speed === "number" && Number.isFinite(pos.coords.speed) && pos.coords.speed >= 0) {
          const kmh = pos.coords.speed * 3.6;
          const current = kmh < 1 ? 0 : Math.round(kmh);
          setSpeed(String(current));
          setMaxSpeed((prev) => (current > prev ? current : prev));
        }

        const elevation = await resolveAltitude(lat, lon, pos.coords.altitude);
        if (typeof elevation === "number") setAltitude(String(elevation));
      },
      () => { },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [sessionActive]);

  useEffect(() => {
    if (!sessionActive || !currentPos) return;
    let cancelled = false;
    resolveAltitude(currentPos.lat, currentPos.lon, null).then((elevation) => {
      if (!cancelled && typeof elevation === "number") {
        setAltitude(String(elevation));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sessionActive, currentPos]);

  useEffect(() => {
    return () => {
      clearHoldTimers();
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-sky-300 via-blue-200 to-blue-100">
      <div className="max-w-[1920px] mx-auto p-4">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setPage("home")}
            className={`px-4 py-2 rounded-md border ${page === "home" ? "bg-slate-900 text-white" : "bg-white"}`}
          >
            Home
          </button>
          <button
            onClick={() => setPage("infos")}
            className={`px-4 py-2 rounded-md border ${page === "infos" ? "bg-slate-900 text-white" : "bg-white"}`}
          >
            Descente
          </button>
          <button
            onClick={() => setPage("ascension")}
            className={`px-4 py-2 rounded-md border ${page === "ascension" ? "bg-slate-900 text-white" : "bg-white"}`}
          >
            Ascension
          </button>
          <button
            onClick={() => setPage("test")}
            className={`px-4 py-2 rounded-md border ${page === "test" ? "bg-slate-900 text-white" : "bg-white"}`}
          >
            Test
          </button>
        </div>

        {page === "home" && (
          <div className="bg-white rounded-xl p-4 border max-w-xl">
            <h2 className="text-xl font-semibold mb-3">Preparation</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={connectBLE} className="px-4 py-2 rounded-md border bg-white">
                Connecter en BT
              </button>
              <button onClick={() => setHomeModalOpen(true)} className="px-4 py-2 rounded-md border bg-white">
                Definir maison
              </button>
            </div>
            <div className="text-sm mb-1">{btStatus}</div>
            <div className="text-sm">{homeStatus}</div>
          </div>
        )}

        {(page === "infos" || page === "ascension" || page === "test") && (
          <div className="relative w-full h-[calc(100vh-88px)] max-w-[1920px]">
            {isVrMode && activeSession ? (
              <VrHud
                altitude={altitudeDisplay}
                bpm={bpmDisplay}
                timeText={timeDisplay}
                tempAmb={tempAmbDisplay}
                tempObj={tempObjDisplay}
                videoSrc={hudVideoSrc}
              />
            ) : (
              <div className="absolute inset-0 m-auto aspect-[1628/916] w-full h-auto max-h-full">
                {activeSession && (
                  <video
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                  >
                    <source src={hudVideoSrc} type="video/mp4" />
                  </video>
                )}
                <div className="absolute" style={{ left: "2.92%", top: "5.97%" }}>
                  <Component className="!static !w-[169px] !h-[169px]" mapSrc={hudMapSrc} />
                </div>
                <div className="absolute z-50" style={{ right: "0%", top: "0px" }}>
                  <Component3 className="!static !w-[298px] !h-[94px]" timeText={timeDisplay} batteryText={batteryDisplay} />
                </div>
                <div className="absolute" style={{ left: "0.08%", top: "80.2%" }}>
                  <Vector className="!static !w-[430px] !h-[191px]" altitudeText={altitudeDisplay} />
                </div>
                <div className="absolute" style={{ left: "37.32%", top: "80.2%" }}>
                  {isWeatherPage ? (
                    <ComponentWeather className="!static !w-[412px] !h-[191px]" ambText={tempAmbDisplay} corpText={tempObjDisplay} />
                  ) : (
                    <Component1
                      className="!static !w-[412px] !h-[191px]"
                      speedText={speed}
                      maxSpeedText={String(maxSpeed)}
                      avgSpeedText={String(avgSpeed)}
                    />
                  )}
                </div>
                <div className="absolute" style={{ left: "73.49%", top: "80.2%" }}>
                  <Component2 className="!static !w-[430px] !h-[191px]" bpmText={bpmDisplay} />
                </div>
                {!activeSession && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center gap-6">
                    <button
                      onClick={startDisplaySession}
                      className="px-8 py-4 rounded-xl border-2 border-white/70 bg-[#5F93AB]/70 text-white text-2xl font-extrabold backdrop-blur-sm"
                    >
                      Start 2D
                    </button>
                    <button
                      onClick={startVrSession}
                      className="px-8 py-4 rounded-xl border-2 border-cyan-400/90 bg-cyan-900/80 text-white text-2xl font-extrabold backdrop-blur-sm shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                    >
                      Start VR 360
                    </button>
                  </div>
                )}
                {activeSession && (
                  <button
                    onClick={stopDisplaySession}
                    className="absolute z-50 right-3 top-28 px-3 py-1.5 rounded-md border border-white/70 bg-black/35 text-white text-xs font-semibold"
                  >
                    Stop
                  </button>
                )}
                {isTestPage && (
                  <>
                    <div className={controlPairClass} style={{ left: "20.5%", top: "92.4%" }}>
                      <button
                        onMouseDown={(e) => onRepeatMouseDown(e, () => bumpInt(setTestAltitude, 10, -500, 9000))}
                        onMouseUp={clearHoldTimers}
                        onMouseLeave={clearHoldTimers}
                        onTouchStart={(e) => onRepeatTouchStart(e, () => bumpInt(setTestAltitude, 10, -500, 9000))}
                        onTouchEnd={clearHoldTimers}
                        onTouchCancel={clearHoldTimers}
                        onClick={(e) => onRepeatClick(e, () => bumpInt(setTestAltitude, 10, -500, 9000))}
                        className={controlBtnClass}
                      >
                        ▲
                      </button>
                      <button
                        onMouseDown={(e) => onRepeatMouseDown(e, () => bumpInt(setTestAltitude, -10, -500, 9000))}
                        onMouseUp={clearHoldTimers}
                        onMouseLeave={clearHoldTimers}
                        onTouchStart={(e) => onRepeatTouchStart(e, () => bumpInt(setTestAltitude, -10, -500, 9000))}
                        onTouchEnd={clearHoldTimers}
                        onTouchCancel={clearHoldTimers}
                        onClick={(e) => onRepeatClick(e, () => bumpInt(setTestAltitude, -10, -500, 9000))}
                        className={controlBtnClass}
                      >
                        ▼
                      </button>
                    </div>

                    <div className={controlPairClass} style={{ left: "46.8%", top: "95%" }}>
                      <button
                        onMouseDown={(e) => onRepeatMouseDown(e, () => bumpFloat(setTestTempAmb, 0.5, -40, 60, 1))}
                        onMouseUp={clearHoldTimers}
                        onMouseLeave={clearHoldTimers}
                        onTouchStart={(e) => onRepeatTouchStart(e, () => bumpFloat(setTestTempAmb, 0.5, -40, 60, 1))}
                        onTouchEnd={clearHoldTimers}
                        onTouchCancel={clearHoldTimers}
                        onClick={(e) => onRepeatClick(e, () => bumpFloat(setTestTempAmb, 0.5, -40, 60, 1))}
                        className={controlBtnClass}
                      >
                        ▲
                      </button>
                      <button
                        onMouseDown={(e) => onRepeatMouseDown(e, () => bumpFloat(setTestTempAmb, -0.5, -40, 60, 1))}
                        onMouseUp={clearHoldTimers}
                        onMouseLeave={clearHoldTimers}
                        onTouchStart={(e) => onRepeatTouchStart(e, () => bumpFloat(setTestTempAmb, -0.5, -40, 60, 1))}
                        onTouchEnd={clearHoldTimers}
                        onTouchCancel={clearHoldTimers}
                        onClick={(e) => onRepeatClick(e, () => bumpFloat(setTestTempAmb, -0.5, -40, 60, 1))}
                        className={controlBtnClass}
                      >
                        ▼
                      </button>
                    </div>
                    <div className={controlPairClass} style={{ left: "52.1%", top: "95%" }}>
                      <button
                        onMouseDown={(e) => onRepeatMouseDown(e, () => bumpFloat(setTestTempObj, 0.1, 20, 45, 1))}
                        onMouseUp={clearHoldTimers}
                        onMouseLeave={clearHoldTimers}
                        onTouchStart={(e) => onRepeatTouchStart(e, () => bumpFloat(setTestTempObj, 0.1, 20, 45, 1))}
                        onTouchEnd={clearHoldTimers}
                        onTouchCancel={clearHoldTimers}
                        onClick={(e) => onRepeatClick(e, () => bumpFloat(setTestTempObj, 0.1, 20, 45, 1))}
                        className={controlBtnClass}
                      >
                        ▲
                      </button>
                      <button
                        onMouseDown={(e) => onRepeatMouseDown(e, () => bumpFloat(setTestTempObj, -0.1, 20, 45, 1))}
                        onMouseUp={clearHoldTimers}
                        onMouseLeave={clearHoldTimers}
                        onTouchStart={(e) => onRepeatTouchStart(e, () => bumpFloat(setTestTempObj, -0.1, 20, 45, 1))}
                        onTouchEnd={clearHoldTimers}
                        onTouchCancel={clearHoldTimers}
                        onClick={(e) => onRepeatClick(e, () => bumpFloat(setTestTempObj, -0.1, 20, 45, 1))}
                        className={controlBtnClass}
                      >
                        ▼
                      </button>
                    </div>

                    <div className={controlPairClass} style={{ left: "88.8%", top: "92.4%" }}>
                      <button
                        onMouseDown={(e) => onRepeatMouseDown(e, () => bumpInt(setTestBpm, 1, 30, 220))}
                        onMouseUp={clearHoldTimers}
                        onMouseLeave={clearHoldTimers}
                        onTouchStart={(e) => onRepeatTouchStart(e, () => bumpInt(setTestBpm, 1, 30, 220))}
                        onTouchEnd={clearHoldTimers}
                        onTouchCancel={clearHoldTimers}
                        onClick={(e) => onRepeatClick(e, () => bumpInt(setTestBpm, 1, 30, 220))}
                        className={controlBtnClass}
                      >
                        ▲
                      </button>
                      <button
                        onMouseDown={(e) => onRepeatMouseDown(e, () => bumpInt(setTestBpm, -1, 30, 220))}
                        onMouseUp={clearHoldTimers}
                        onMouseLeave={clearHoldTimers}
                        onTouchStart={(e) => onRepeatTouchStart(e, () => bumpInt(setTestBpm, -1, 30, 220))}
                        onTouchEnd={clearHoldTimers}
                        onTouchCancel={clearHoldTimers}
                        onClick={(e) => onRepeatClick(e, () => bumpInt(setTestBpm, -1, 30, 220))}
                        className={controlBtnClass}
                      >
                        ▼
                      </button>
                    </div>

                    <div className={controlPairClass} style={{ left: "81.8%", top: "4.0%" }}>
                      <button
                        onMouseDown={(e) => onRepeatMouseDown(e, () => bumpTestTime(1))}
                        onMouseUp={clearHoldTimers}
                        onMouseLeave={clearHoldTimers}
                        onTouchStart={(e) => onRepeatTouchStart(e, () => bumpTestTime(1))}
                        onTouchEnd={clearHoldTimers}
                        onTouchCancel={clearHoldTimers}
                        onClick={(e) => onRepeatClick(e, () => bumpTestTime(1))}
                        className={controlBtnClass}
                      >
                        ▲
                      </button>
                      <button
                        onMouseDown={(e) => onRepeatMouseDown(e, () => bumpTestTime(-1))}
                        onMouseUp={clearHoldTimers}
                        onMouseLeave={clearHoldTimers}
                        onTouchStart={(e) => onRepeatTouchStart(e, () => bumpTestTime(-1))}
                        onTouchEnd={clearHoldTimers}
                        onTouchCancel={clearHoldTimers}
                        onClick={(e) => onRepeatClick(e, () => bumpTestTime(-1))}
                        className={controlBtnClass}
                      >
                        ▼
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {homeModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 p-4 flex items-center justify-center">
          <div className="w-full max-w-3xl bg-white rounded-xl border p-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setHomeModalOpen(false)} className="w-10 h-10 rounded-full border bg-white">
                ←
              </button>
              <h3 className="text-lg font-semibold">Definir maison</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <button onClick={defineHomeCurrent} className="px-4 py-2 rounded-md border bg-white">
                Maison = ma position
              </button>
              <button onClick={centerOnMe} className="px-4 py-2 rounded-md border bg-white">
                Centrer carte sur moi
              </button>
            </div>
            <div className="flex gap-2 mb-2">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 border rounded-md px-3 py-2"
                placeholder="Entrer une adresse"
              />
              <button onClick={defineHomeAddress} className="px-4 py-2 rounded-md border bg-white">
                Valider adresse
              </button>
            </div>
            <iframe title="map" src={mapSrc} className="h-[320px] w-full border rounded-xl" />
            {homePos && (
              <div className="text-xs text-slate-600 mt-2">
                Maison: {homePos.lat.toFixed(5)}, {homePos.lon.toFixed(5)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
