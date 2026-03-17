import { useEffect, useRef, useState } from "react";

interface VideoPreloaderProps {
    videoUrl: string;
    onStart: () => void;
}

const COL = "#6AD2CA";

export default function VideoPreloader({ videoUrl, onStart }: VideoPreloaderProps) {
    const [progress, setProgress] = useState(0);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handedOff = useRef(false);

    useEffect(() => {
        // Crée le <video id="bg-video-af"> directement dans le DOM
        // VrHudAframe le retrouvera par ID sans re-télécharger
        const video = document.createElement("video");
        video.id = "bg-video-af";
        video.src = videoUrl;
        video.preload = "auto";
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";
        video.style.display = "none";
        document.body.appendChild(video);

        let rafId: number;

        function tick() {
            if (video.duration > 0 && video.buffered.length > 0) {
                const pct = Math.round(
                    (video.buffered.end(video.buffered.length - 1) / video.duration) * 100
                );
                setProgress(Math.min(99, pct));
            }
            rafId = requestAnimationFrame(tick);
        }

        function onCanPlayThrough() {
            cancelAnimationFrame(rafId);
            setProgress(100);
            setReady(true);
        }

        function onError() {
            cancelAnimationFrame(rafId);
            const err = video.error;
            setError(err ? `Code ${err.code}` : "Erreur de chargement");
        }

        video.addEventListener("canplaythrough", onCanPlayThrough, { once: true });
        video.addEventListener("error", onError, { once: true });
        rafId = requestAnimationFrame(tick);
        video.load();

        return () => {
            cancelAnimationFrame(rafId);
            video.removeEventListener("canplaythrough", onCanPlayThrough);
            video.removeEventListener("error", onError);
            // Ne pas supprimer l'élément s'il a déjà été passé à VrHudAframe
            if (!handedOff.current) {
                video.src = "";
                document.body.removeChild(video);
            }
        };
    }, [videoUrl]);

    function handleStart() {
        handedOff.current = true;
        onStart();
    }

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "#050d10",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                color: "#fff",
            }}
        >
            <img
                src="/media/hud/png-elements/hq/Logo%20vert.png"
                alt="ORA"
                style={{ width: 72, height: 72, marginBottom: 28, opacity: 0.92 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />

            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.18em", color: COL, marginBottom: 6 }}>
                ORA
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 52 }}>
                Chargement de la simulation
            </div>

            {error ? (
                <div style={{ color: "#FF8A84", fontSize: 13, maxWidth: 320, textAlign: "center", lineHeight: 1.6, padding: "0 24px" }}>
                    Impossible de charger la vidéo :<br />
                    <span style={{ opacity: 0.7 }}>{error}</span>
                </div>
            ) : (
                <>
                    <div style={{ width: 260, height: 2, background: "rgba(106,210,202,0.1)", borderRadius: 2, marginBottom: 14, overflow: "hidden" }}>
                        <div style={{
                            height: "100%",
                            width: `${progress}%`,
                            background: COL,
                            borderRadius: 2,
                            transition: "width 0.3s linear",
                            boxShadow: "0 0 6px rgba(106,210,202,0.5)",
                        }} />
                    </div>

                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginBottom: 48, minHeight: 18 }}>
                        {progress < 100 ? `${progress} %` : "Prêt"}
                    </div>

                    {ready && (
                        <button
                            onClick={handleStart}
                            style={{
                                padding: "14px 44px",
                                borderRadius: 12,
                                background: "transparent",
                                color: COL,
                                fontWeight: 700,
                                fontSize: 13,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                border: `1.5px solid ${COL}`,
                                cursor: "pointer",
                                boxShadow: "0 0 28px rgba(106,210,202,0.15)",
                                transition: "background 0.15s ease, box-shadow 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(106,210,202,0.08)";
                                e.currentTarget.style.boxShadow = "0 0 36px rgba(106,210,202,0.28)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.boxShadow = "0 0 28px rgba(106,210,202,0.15)";
                            }}
                        >
                            Démarrer la simulation ORA
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
