import { useEffect, useRef, useState } from "react";

interface VideoPreloaderProps {
    videoUrl: string;
    onStart: (blobUrl: string) => void;
}

const COL = "#6AD2CA";

export default function VideoPreloader({ videoUrl, onStart }: VideoPreloaderProps) {
    const [progress, setProgress] = useState(0);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Keep a ref so the cleanup doesn't revoke a URL that was already handed off
    const handedOff = useRef(false);
    const objectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function preload() {
            try {
                const response = await fetch(videoUrl);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const contentLength = response.headers.get("Content-Length");
                const total = contentLength ? parseInt(contentLength, 10) : 0;

                const reader = response.body!.getReader();
                const chunks: Uint8Array[] = [];
                let received = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (cancelled) {
                        reader.cancel();
                        return;
                    }
                    chunks.push(value);
                    received += value.length;
                    if (total > 0) {
                        // Cap at 99 until Blob is fully assembled
                        setProgress(Math.min(99, Math.round((received / total) * 100)));
                    }
                }

                if (cancelled) return;

                const blob = new Blob(chunks, { type: "video/mp4" });
                const url = URL.createObjectURL(blob);
                objectUrlRef.current = url;
                setProgress(100);
                setBlobUrl(url);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Erreur inconnue");
                }
            }
        }

        preload();

        return () => {
            cancelled = true;
            // Revoke only if we never handed the URL off to the parent
            if (!handedOff.current && objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, [videoUrl]);

    function handleStart() {
        if (!blobUrl) return;
        handedOff.current = true;
        onStart(blobUrl);
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
            {/* Logo ORA */}
            <img
                src="/media/hud/png-elements/hq/Logo%20vert.png"
                alt="ORA"
                style={{ width: 72, height: 72, marginBottom: 28, opacity: 0.92 }}
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                }}
            />

            <div
                style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    color: COL,
                    marginBottom: 6,
                }}
            >
                ORA
            </div>
            <div
                style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginBottom: 52,
                }}
            >
                Chargement de la simulation
            </div>

            {error ? (
                <div
                    style={{
                        color: "#FF8A84",
                        fontSize: 13,
                        maxWidth: 320,
                        textAlign: "center",
                        lineHeight: 1.6,
                        padding: "0 24px",
                    }}
                >
                    Impossible de charger la vidéo :<br />
                    <span style={{ opacity: 0.7 }}>{error}</span>
                </div>
            ) : (
                <>
                    {/* Barre de progression */}
                    <div
                        style={{
                            width: 260,
                            height: 2,
                            background: "rgba(106,210,202,0.1)",
                            borderRadius: 2,
                            marginBottom: 14,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${progress}%`,
                                background: COL,
                                borderRadius: 2,
                                transition: "width 0.15s linear",
                                boxShadow: "0 0 6px rgba(106,210,202,0.5)",
                            }}
                        />
                    </div>

                    {/* Pourcentage */}
                    <div
                        style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.35)",
                            letterSpacing: "0.1em",
                            marginBottom: 48,
                            minHeight: 18,
                        }}
                    >
                        {progress < 100 ? `${progress} %` : "Prêt"}
                    </div>

                    {/* Bouton — visible uniquement quand le chargement est terminé */}
                    {progress === 100 && blobUrl && (
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
