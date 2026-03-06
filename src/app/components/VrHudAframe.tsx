// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   PROPS
───────────────────────────────────────────── */
interface VrHudAframeProps {
    altitude: string;
    bpm: string;
    timeText: string;
    tempAmb: string;
    tempObj: string;
    videoSrc: string;
}

/* ─────────────────────────────────────────────
   COMPOSANT VR HUD A-FRAME
   Le HUD est rendu en entités A-Frame 3D
   attachées à la caméra → visible en mode immersif VR
───────────────────────────────────────────── */
export default function VrHudAframe({
    altitude,
    bpm,
    timeText,
    tempAmb,
    tempObj,
    videoSrc,
}: VrHudAframeProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    /* ── couleur HUD ── */
    const COL = "#6AD2CA";

    /* ── lecture vidéo ── */
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
    }, []);

    /* ── mise à jour dynamique des <a-text> par setAttribute ── */
    useEffect(() => {
        const el = document.querySelector("#af-time");
        if (el) el.setAttribute("value", timeText);
    }, [timeText]);

    useEffect(() => {
        const el = document.querySelector("#af-altitude");
        if (el) el.setAttribute("value", `${altitude}m`);
    }, [altitude]);

    useEffect(() => {
        const el = document.querySelector("#af-bpm");
        if (el) el.setAttribute("value", `${bpm}bpm`);
    }, [bpm]);

    useEffect(() => {
        const el = document.querySelector("#af-temp-obj");
        if (el) el.setAttribute("value", `${tempObj}°C`);
    }, [tempObj]);

    useEffect(() => {
        const el = document.querySelector("#af-temp-amb");
        if (el) el.setAttribute("value", `${tempAmb}°C`);
    }, [tempAmb]);

    /* ── animation d'apparition des lignes ── */
    useEffect(() => {
        // Petit délai pour laisser A-Frame s'initialiser
        const timer = setTimeout(() => {
            const lineL = document.querySelector("#af-line-left");
            const lineR = document.querySelector("#af-line-right");

            if (lineL) {
                lineL.setAttribute("animation", {
                    property: "material.opacity",
                    from: 0,
                    to: 1,
                    dur: 900,
                    easing: "easeInOutQuad",
                });
            }
            if (lineR) {
                lineR.setAttribute("animation", {
                    property: "material.opacity",
                    from: 0,
                    to: 1,
                    dur: 900,
                    delay: 100,
                    easing: "easeInOutQuad",
                });
            }

            // Apparition échelonnée des stats
            const stats = [
                "#af-stat-time",
                "#af-stat-altitude",
                "#af-stat-duration",
                "#af-stat-bpm",
                "#af-stat-temp",
                "#af-stat-meteo",
            ];
            stats.forEach((sel, i) => {
                const el = document.querySelector(sel);
                if (el) {
                    el.setAttribute("animation", {
                        property: "material.opacity",
                        from: 0,
                        to: 1,
                        dur: 500,
                        delay: 400 + i * 150,
                        easing: "easeInOutQuad",
                    });
                }
            });
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    /* ── pulsation logo ── */
    useEffect(() => {
        const timer = setTimeout(() => {
            const logo = document.querySelector("#af-logo");
            if (logo) {
                logo.setAttribute("animation", {
                    property: "scale",
                    from: "0.28 0.28 0.28",
                    to: "0.32 0.32 0.32",
                    dur: 2000,
                    dir: "alternate",
                    loop: true,
                    easing: "easeInOutSine",
                });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, []);

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

            {/* ══════════════════════════════════════════════
          SCÈNE A-FRAME — Tout le HUD est en entités 3D
      ══════════════════════════════════════════════ */}
            <a-scene
                vr-mode-ui="enabled: true"
                loading-screen="enabled: false"
                device-orientation-permission-ui="enabled: false"
                style={{ position: "absolute", inset: 0 }}
            >
                {/* ── Assets ── */}
                <a-assets>
                    <video
                        id="bg-video-af"
                        ref={videoRef}
                        src={videoSrc}
                        crossOrigin="anonymous"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    <img id="af-img-logo" src="/media/hud/png-elements/hq/Logo%20vert.png" crossOrigin="anonymous" />
                    <img id="af-img-line-l" src="/media/hud/png-elements/hq/Line%20gauche.png" crossOrigin="anonymous" />
                    <img id="af-img-line-r" src="/media/hud/png-elements/hq/Line%20droite.png" crossOrigin="anonymous" />
                    <img id="af-img-alti" src="/media/hud/png-elements/hq/Alti.png" crossOrigin="anonymous" />
                    <img id="af-img-heure" src="/media/hud/png-elements/hq/Heure.png" crossOrigin="anonymous" />
                    <img id="af-img-bpm" src="/media/hud/png-elements/hq/BPM.png" crossOrigin="anonymous" />
                    <img id="af-img-temp" src="/media/hud/png-elements/hq/Temp%20corps.png" crossOrigin="anonymous" />
                    <img id="af-img-meteo" src="/media/hud/png-elements/hq/Meteo.png" crossOrigin="anonymous" />
                    <img id="af-img-nuit" src="/media/hud/png-elements/hq/Nuit.png" crossOrigin="anonymous" />
                </a-assets>

                {/* ── Vidéo 360° ── */}
                <a-videosphere src="#bg-video-af" rotation="0 -90 0" />

                {/* ── Caméra + HUD enfant ── */}
                <a-camera
                    id="af-camera"
                    position="0 1.6 0"
                    look-controls="pointerLockEnabled: false"
                >
                    {/* 
            HUD CONTENEUR
            Position: centré horizontalement, légèrement au-dessus du centre, 2.5m devant 
          */}
                    <a-entity id="af-hud" position="0 0.15 -2.5">

                        {/* ══════ LOGO CENTRAL ══════ */}
                        <a-image
                            id="af-logo"
                            src="#af-img-logo"
                            material="shader: flat; transparent: true"
                            position="0 0.45 0"
                            width="0.3"
                            height="0.3"
                            scale="0.3 0.3 0.3"
                        />

                        {/* ══════ LIGNE GAUCHE ══════ */}
                        <a-image
                            id="af-line-left"
                            src="#af-img-line-l"
                            material="shader: flat; transparent: true; opacity: 0"
                            position="-1.5 0.05 0"
                            width="2.6"
                            height="1.0"
                        />

                        {/* ══════ LIGNE DROITE ══════ */}
                        <a-image
                            id="af-line-right"
                            src="#af-img-line-r"
                            material="shader: flat; transparent: true; opacity: 0"
                            position="1.5 0.05 0"
                            width="2.6"
                            height="1.0"
                        />

                        {/* ══════════════════════════ */}
                        {/*     STATS CÔTÉ GAUCHE     */}
                        {/* ══════════════════════════ */}

                        {/* Heure — en haut de la courbe gauche */}
                        <a-entity id="af-stat-time" material="opacity: 0" position="-0.40 0.20 0.01">
                            <a-image
                                src="#af-img-heure"
                                material="shader: flat; transparent: true"
                                position="-0.15 0 0"
                                width="0.10"
                                height="0.10"
                            />
                            <a-text
                                id="af-time"
                                value={timeText}
                                position="-0.05 0 0"
                                color={COL}
                                font="kelsonsans"
                                width="3.5"
                                align="left"
                                baseline="center"
                            />
                        </a-entity>

                        {/* Altitude — milieu courbe gauche */}
                        <a-entity id="af-stat-altitude" material="opacity: 0" position="-1.50 -0.10 0.01">
                            <a-image
                                src="#af-img-alti"
                                material="shader: flat; transparent: true"
                                position="-0.20 0 0"
                                width="0.08"
                                height="0.12"
                            />
                            <a-text
                                id="af-altitude"
                                value={`${altitude}m`}
                                position="-0.10 0 0"
                                color={COL}
                                font="kelsonsans"
                                width="4.0"
                                align="left"
                                baseline="center"
                            />
                        </a-entity>

                        {/* Durée / nuit — bas gauche */}
                        <a-entity id="af-stat-duration" material="opacity: 0" position="-2.50 -0.30 0.01">
                            <a-image
                                src="#af-img-nuit"
                                material="shader: flat; transparent: true"
                                position="-0.15 0 0"
                                width="0.12"
                                height="0.12"
                            />
                            <a-text
                                value="1H32"
                                position="-0.05 0 0"
                                color={COL}
                                font="kelsonsans"
                                width="3.5"
                                align="left"
                                baseline="center"
                            />
                        </a-entity>

                        {/* ══════════════════════════ */}
                        {/*     STATS CÔTÉ DROIT      */}
                        {/* ══════════════════════════ */}

                        {/* BPM — en haut de la courbe droite */}
                        <a-entity id="af-stat-bpm" material="opacity: 0" position="0.50 0.20 0.01">
                            <a-image
                                src="#af-img-bpm"
                                material="shader: flat; transparent: true"
                                position="0 0 0"
                                width="0.12"
                                height="0.10"
                            />
                            <a-text
                                id="af-bpm"
                                value={`${bpm}bpm`}
                                position="0.10 0 0"
                                color={COL}
                                font="kelsonsans"
                                width="3.5"
                                align="left"
                                baseline="center"
                            />
                        </a-entity>

                        {/* Temp corps — milieu courbe droite */}
                        <a-entity id="af-stat-temp" material="opacity: 0" position="1.50 -0.10 0.01">
                            <a-image
                                src="#af-img-temp"
                                material="shader: flat; transparent: true"
                                position="0 0 0"
                                width="0.06"
                                height="0.14"
                            />
                            <a-text
                                id="af-temp-obj"
                                value={`${tempObj}°C`}
                                position="0.08 0 0"
                                color={COL}
                                font="kelsonsans"
                                width="3.5"
                                align="left"
                                baseline="center"
                            />
                        </a-entity>

                        {/* Temp extérieure / météo — bas droite */}
                        <a-entity id="af-stat-meteo" material="opacity: 0" position="2.50 -0.30 0.01">
                            <a-image
                                src="#af-img-meteo"
                                material="shader: flat; transparent: true"
                                position="0 0 0"
                                width="0.14"
                                height="0.10"
                            />
                            <a-text
                                id="af-temp-amb"
                                value={`${tempAmb}°C`}
                                position="0.12 0 0"
                                color={COL}
                                font="kelsonsans"
                                width="3.5"
                                align="left"
                                baseline="center"
                            />
                        </a-entity>

                    </a-entity>
                </a-camera>
            </a-scene>
        </div>
    );
}
