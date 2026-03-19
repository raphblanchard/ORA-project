// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   PROPS
───────────────────────────────────────────── */
interface VrHudAframeProps {
    alertMode: "none" | "breathing" | "return";
    altitude: string;
    bpm: string;
    durationText: string;
    isFirstReference: boolean;
    onToggleReference: () => void;
    timeText: string;
    tempAmb: string;
    tempObj: string;
}

/* ─────────────────────────────────────────────
   COMPOSANT VR HUD A-FRAME
   Le HUD est rendu en entités A-Frame 3D
   attachées à la caméra → visible en mode immersif VR
───────────────────────────────────────────── */
export default function VrHudAframe({
    alertMode,
    altitude,
    bpm,
    durationText,
    isFirstReference,
    onToggleReference,
    timeText,
    tempAmb,
    tempObj,
}: VrHudAframeProps) {
    const DESCENTE_VIDEO_YAW = -180;
    const ASCENSION_VIDEO_YAW = -45;
    const videoRef = useRef<HTMLVideoElement>(null);
    const sceneRef = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVrMode, setIsVrMode] = useState(false);
    const [activeAlert, setActiveAlert] = useState<"none" | "breathing" | "return">("none");
    const [breathPhase, setBreathPhase] = useState<"inhale" | "exhale">("inhale");
    const [logoSrc, setLogoSrc] = useState("/media/hud/png-elements/hq/Logo vert.png");
    const INITIAL_CAMERA_YAW = 270;
    const BREATH_INHALE_MS = 4000;
    const BREATH_EXHALE_MS = 6000;
    const BREATH_CYCLE_MS = BREATH_INHALE_MS + BREATH_EXHALE_MS;

    /* ── couleur HUD ── */
    const COL = "#6AD2CA";
    const breathInstruction = breathPhase === "inhale" ? "Inspirez lentement" : "Expirez";

    /* ── lecture vidéo initiale (descente) ── */
    useEffect(() => {
        const v = document.getElementById("bg-video-af") as HTMLVideoElement | null;
        if (!v) return;
        videoRef.current = v;
        v.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
    }, []);

    /* ── switch vidéosphère selon la scène ── */
    useEffect(() => {
        const vsDescente  = document.querySelector("#af-vs-descente");
        const vsAscension = document.querySelector("#af-vs-ascension");
        const vidDescente  = document.getElementById("bg-video-af")        as HTMLVideoElement | null;
        const vidAscension = document.getElementById("bg-video-ascension") as HTMLVideoElement | null;

        if (isFirstReference) {
            vsDescente?.setAttribute("visible",  "true");
            vsAscension?.setAttribute("visible", "false");
            vidDescente?.play().catch(() => {});
            vidAscension?.pause();
        } else {
            vsDescente?.setAttribute("visible",  "false");
            vsAscension?.setAttribute("visible", "true");
            vidAscension?.play().catch(() => {});
            vidDescente?.pause();
        }
    }, [isFirstReference]);

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

    /* ── animation d'ouverture : montage initial + chaque changement de scène ── */
    useEffect(() => {
        const STAT_SELS = [
            "#af-stat-time",
            "#af-stat-altitude",
            "#af-stat-duration",
            "#af-stat-bpm",
            "#af-stat-temp",
            "#af-stat-meteo",
        ];

        const lineL = document.querySelector("#af-line-left");
        const lineR = document.querySelector("#af-line-right");

        /* 1. Reset instantané */
        if (lineL) {
            lineL.removeAttribute("animation");
            lineL.removeAttribute("animation__scale");
            lineL.removeAttribute("animation__pos");
            lineL.setAttribute("material", "shader: flat; transparent: true; opacity: 0");
            lineL.setAttribute("scale", "0.04 1 1");
            lineL.setAttribute("position", "-0.3 0.05 0"); // part du centre
        }
        if (lineR) {
            lineR.removeAttribute("animation");
            lineR.removeAttribute("animation__scale");
            lineR.removeAttribute("animation__pos");
            lineR.setAttribute("material", "shader: flat; transparent: true; opacity: 0");
            lineR.setAttribute("scale", "0.04 1 1");
            lineR.setAttribute("position", "0.3 0.05 0"); // part du centre
        }
        STAT_SELS.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) {
                el.removeAttribute("animation");
                el.removeAttribute("animation__pulse");
                el.setAttribute("scale", "0 0 0");
            }
        });

        /* 2. Animation après délai */
        const timer = setTimeout(() => {
            /* Lignes : se déploient depuis le logo vers l'extérieur */
            if (lineL) {
                lineL.setAttribute("animation", {
                    property: "material.opacity", from: 0, to: 1,
                    dur: 700, easing: "easeOutQuad",
                });
                lineL.setAttribute("animation__scale", {
                    property: "scale", from: "0.04 1 1", to: "1 1 1",
                    dur: 950, easing: "easeOutCubic",
                });
                lineL.setAttribute("animation__pos", {
                    property: "position", from: "-0.3 0.05 0", to: "-1.5 0.05 0",
                    dur: 950, easing: "easeOutCubic",
                });
            }
            if (lineR) {
                lineR.setAttribute("animation", {
                    property: "material.opacity", from: 0, to: 1,
                    dur: 700, delay: 60, easing: "easeOutQuad",
                });
                lineR.setAttribute("animation__scale", {
                    property: "scale", from: "0.04 1 1", to: "1 1 1",
                    dur: 950, delay: 60, easing: "easeOutCubic",
                });
                lineR.setAttribute("animation__pos", {
                    property: "position", from: "0.3 0.05 0", to: "1.5 0.05 0",
                    dur: 950, delay: 60, easing: "easeOutCubic",
                });
            }

            /* Stats : pop-in échelonné (scale propage aux enfants a-image + a-text) */
            STAT_SELS.forEach((sel, i) => {
                const el = document.querySelector(sel);
                if (el) {
                    el.setAttribute("animation", {
                        property: "scale", from: "0 0 0", to: "1 1 1",
                        dur: 380, delay: 450 + i * 120, easing: "easeOutBack",
                    });
                }
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [isFirstReference]);

    /* ── pulsation logo ── */
    useEffect(() => {
        const timer = setTimeout(() => {
            const logo = document.querySelector("#af-logo");
            if (logo) {
                logo.setAttribute("animation", {
                    property: "scale",
                    from: "0.42 0.42 0.42",
                    to: "0.47 0.47 0.47",
                    dur: 2000,
                    dir: "alternate",
                    loop: true,
                    easing: "easeInOutSine",
                });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const sceneEl = sceneRef.current;
        if (!sceneEl) return;

        const enterVr = () => {
            if (typeof sceneEl.enterVR === "function") {
                sceneEl.enterVR().catch?.(() => { });
            }
        };

        if (sceneEl.hasLoaded) {
            enterVr();
            return;
        }

        sceneEl.addEventListener("loaded", enterVr, { once: true });
        return () => {
            sceneEl.removeEventListener("loaded", enterVr);
        };
    }, []);

    useEffect(() => {
        const sceneEl = sceneRef.current;
        if (!sceneEl) return;

        const handleEnterVr = () => setIsVrMode(true);
        const handleExitVr = () => setIsVrMode(false);

        sceneEl.addEventListener("enter-vr", handleEnterVr);
        sceneEl.addEventListener("exit-vr", handleExitVr);

        return () => {
            sceneEl.removeEventListener("enter-vr", handleEnterVr);
            sceneEl.removeEventListener("exit-vr", handleExitVr);
        };
    }, []);

    useEffect(() => {
        let breathingTimer: number | null = null;

        if (alertMode === "none") {
            setActiveAlert("none");
            setBreathPhase("inhale");
            setLogoSrc("/media/hud/png-elements/hq/Logo vert.png");
            return;
        }

        if (alertMode === "breathing") {
            setLogoSrc("/media/hud/png-elements/hq/Logo jaune.png");
            setActiveAlert("breathing");
            setBreathPhase("inhale");

            const totalCycles = 5;
            let completedCycles = 0;

            const runBreathingPhase = (phase: "inhale" | "exhale") => {
                setBreathPhase(phase);
                breathingTimer = window.setTimeout(() => {
                    if (phase === "inhale") {
                        runBreathingPhase("exhale");
                        return;
                    }
                    completedCycles += 1;
                    if (completedCycles >= totalCycles) {
                        setActiveAlert("none");
                        return;
                    }
                    runBreathingPhase("inhale");
                }, phase === "inhale" ? BREATH_INHALE_MS : BREATH_EXHALE_MS);
            };

            runBreathingPhase("inhale");
        }

        if (alertMode === "return") {
            setLogoSrc("/media/hud/png-elements/hq/Logo rouge.png");
            setActiveAlert("return");
        }

        return () => {
            if (breathingTimer !== null) window.clearTimeout(breathingTimer);
        };
    }, [alertMode]);

    /* ── mise en évidence alerte : rouge + pulse sur la stat responsable ── */
    useEffect(() => {
        if (activeAlert === "none") {
            const bpmText = document.querySelector("#af-bpm");
            if (bpmText) bpmText.setAttribute("color", COL);
            const altText = document.querySelector("#af-altitude");
            if (altText) altText.setAttribute("color", COL);
            const durText = document.querySelector("#af-duration");
            if (durText) durText.setAttribute("color", COL);

            ["#af-stat-bpm", "#af-stat-altitude", "#af-stat-duration"].forEach(sel => {
                const el = document.querySelector(sel);
                if (!el) return;
                el.removeAttribute("animation__pulse");
                el.setAttribute("scale", "1 1 1");
            });
            return;
        }

        const textId = activeAlert === "breathing" ? "#af-bpm" : "#af-altitude";
        const statId = activeAlert === "breathing" ? "#af-stat-bpm" : "#af-stat-altitude";

        setTimeout(() => {
            const textEl = document.querySelector(textId);
            const alertColor = activeAlert === "breathing" ? "#F7D716" : "#FF3B30";
            if (textEl) textEl.setAttribute("color", alertColor);

            // Pour l'alerte retour : durée aussi en rouge + pulse
            if (activeAlert === "return") {
                const durText = document.querySelector("#af-duration");
                if (durText) durText.setAttribute("color", "#FF3B30");

                const durStat = document.querySelector("#af-stat-duration");
                if (durStat) {
                    durStat.setAttribute("animation__pulse", {
                        property: "scale",
                        from: "1 1 1",
                        to: "1.15 1.15 1.15",
                        dur: 750,
                        dir: "alternate",
                        loop: true,
                        easing: "easeInOutSine",
                    });
                }
            }

            const statEl = document.querySelector(statId);
            if (statEl) {
                statEl.setAttribute("animation__pulse", {
                    property: "scale",
                    from: "1 1 1",
                    to: "1.15 1.15 1.15",
                    dur: 750,
                    dir: "alternate",
                    loop: true,
                    easing: "easeInOutSine",
                });
            }
        }, 350);
    }, [activeAlert]);

    useEffect(() => {
        const buttonEl = document.querySelector("#af-nav-button");
        if (!buttonEl) return;

        const handleClick = () => {
            onToggleReference();
        };

        buttonEl.addEventListener("click", handleClick);
        return () => {
            buttonEl.removeEventListener("click", handleClick);
        };
    }, [onToggleReference]);

    useEffect(() => {
        const buttonEl = document.querySelector("#af-exit-vr-button");
        if (!buttonEl) return;

        const handleClick = () => {
            const sceneEl = sceneRef.current;
            if (sceneEl && typeof sceneEl.exitVR === "function") {
                sceneEl.exitVR();
            }
        };

        buttonEl.addEventListener("click", handleClick);
        return () => {
            buttonEl.removeEventListener("click", handleClick);
        };
    }, [isVrMode]);

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

            {!isVrMode && (
                <button
                    type="button"
                    onClick={onToggleReference}
                    style={{
                        position: "absolute",
                        left: "50%",
                        bottom: "64px",
                        zIndex: 1000,
                        width: "56px",
                        height: "56px",
                        transform: "translateX(-50%)",
                        borderRadius: "999px",
                        border: "2px solid rgba(217,243,240,0.7)",
                        background: "rgba(16,36,44,0.72)",
                        color: "#d9f3f0",
                        fontSize: "28px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 0 18px rgba(106,210,202,0.25)",
                        backdropFilter: "blur(8px)",
                    }}
                    aria-label="Changer de situation"
                >
                    {isFirstReference ? ">" : "<"}
                </button>
            )}

            {/* ══════════════════════════════════════════════
          SCÈNE A-FRAME — Tout le HUD est en entités 3D
      ══════════════════════════════════════════════ */}
            <a-scene
                ref={sceneRef}
                vr-mode-ui="enabled: true"
                loading-screen="enabled: false"
                device-orientation-permission-ui="enabled: false"
                style={{ position: "absolute", inset: 0, zIndex: 1 }}
            >
                {/* ── Assets ── */}
                {/* <video id="bg-video-af"> est injecté par VideoPreloader — pas besoin de le re-déclarer */}
                <a-assets>
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

                {/* ── Vidéos 360° — une par scène ── */}
                <a-videosphere id="af-vs-descente"  src="#bg-video-af"        rotation={`0 ${DESCENTE_VIDEO_YAW} 0`} />
                <a-videosphere id="af-vs-ascension" src="#bg-video-ascension"  rotation={`0 ${ASCENSION_VIDEO_YAW} 0`} visible="false" />

                {/* ── Caméra + HUD enfant ── */}
                <a-entity id="af-camera-rig" rotation={`0 ${INITIAL_CAMERA_YAW} 0`}>
                    <a-entity
                        id="af-right-controller"
                        laser-controls="hand: right"
                        raycaster="objects: .af-clickable; origin: 0 0 -0.08"
                        cursor="rayOrigin: entity"
                        line="color: #6AD2CA; opacity: 0.9"
                    />
                    <a-camera
                        id="af-camera"
                        position="0 1.6 0"
                        look-controls="pointerLockEnabled: false"
                        raycaster={!isVrMode ? "objects: .af-clickable" : undefined}
                        cursor={!isVrMode ? "rayOrigin: mouse" : undefined}
                    >
                    {/*
            HUD CONTENEUR
            Position: centré horizontalement, légèrement au-dessus du centre, 4.1m devant
          */}
                        <a-entity id="af-hud" position="0 0.15 -4.1">

                        {/* ══════ LOGO CENTRAL ══════ */}
                        <a-image
                            id="af-logo"
                            src={logoSrc}
                            material="shader: flat; transparent: true"
                            position="0 0.45 0"
                            width="0.44"
                            height="0.44"
                            scale="0.44 0.44 0.44"
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
                                width="0.11"
                                height="0.11"
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
                                width="0.10"
                                height="0.10"
                            />
                            <a-text
                                id="af-altitude"
                                value={`${altitude}m`}
                                position="-0.10 0 0"
                                color={COL}
                                font="kelsonsans"
                                width="3.5"
                                align="left"
                                baseline="center"
                            />
                        </a-entity>

                        {/* Durée / nuit — bas gauche */}
                        <a-entity id="af-stat-duration" material="opacity: 0" position="-2.50 -0.55 0.01">
                            <a-image
                                src="#af-img-nuit"
                                material="shader: flat; transparent: true"
                                position="-0.15 0 0"
                                width="0.11"
                                height="0.11"
                            />
                            <a-text
                                id="af-duration"
                                value={durationText}
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
                                width="0.11"
                                height="0.11"
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
                                width="0.11"
                                height="0.11"
                            />
                            <a-text
                                id="af-temp-obj"
                                value={`${tempObj}°C`}
                                position="0.10 0 0"
                                color={COL}
                                font="kelsonsans"
                                width="3.5"
                                align="left"
                                baseline="center"
                            />
                        </a-entity>

                        {/* Temp extérieure / météo — bas droite */}
                        <a-entity id="af-stat-meteo" material="opacity: 0" position="2.50 -0.55 0.01">
                            <a-image
                                src="#af-img-meteo"
                                material="shader: flat; transparent: true"
                                position="0 0 0"
                                width="0.11"
                                height="0.11"
                            />
                            <a-text
                                id="af-temp-amb"
                                value={`${tempAmb}°C`}
                                position="0.10 0 0"
                                color={COL}
                                font="kelsonsans"
                                width="3.5"
                                align="left"
                                baseline="center"
                            />
                        </a-entity>

                        <a-entity
                            id="af-nav-button"
                            class="af-clickable"
                            geometry="primitive: plane; width: 0.34; height: 0.34"
                            material="color: #10242c; opacity: 0.38; shader: flat"
                            position="0 -0.98 0.02"
                        >
                            <a-text
                                value={isFirstReference ? ">" : "<"}
                                color="#d9f3f0"
                                align="center"
                                baseline="center"
                                width="1.5"
                                position="0 0 0.01"
                            />
                        </a-entity>

                        {/* ══════ BOUTON EXIT VR — haut gauche, visible en mode immersif ══════ */}
                        {isVrMode && (
                            <a-entity
                                id="af-exit-vr-button"
                                class="af-clickable"
                                geometry="primitive: plane; width: 0.36; height: 0.20"
                                material="color: #10242c; opacity: 0.5; shader: flat"
                                position="-2.8 0.65 0.02"
                            >
                                <a-text
                                    value="X EXIT"
                                    color="#FF8A84"
                                    align="center"
                                    baseline="center"
                                    font="kelsonsans"
                                    width="2.2"
                                    position="0 0 0.01"
                                />
                            </a-entity>
                        )}

                        {activeAlert === "breathing" && (
                            <a-entity id="af-breathing-alert">
                                {/* Label — juste au-dessus du BPM (x=0.50, y=0.20) */}
                                <a-text
                                    value="BPM CRITIQUE"
                                    color="#F7D716"
                                    align="left"
                                    width="2.2"
                                    position="0.42 0.36 0.03"
                                />
                                {/* Guide respiration — en bas centre */}
                                <a-entity position="0 -0.50 0.03">
                                    <a-ring
                                        radius-inner="0.14"
                                        radius-outer="0.152"
                                        theta-start="-54"
                                        theta-length="144"
                                        material="shader: flat; color: #63D471; opacity: 0.9"
                                    />
                                    <a-ring
                                        radius-inner="0.14"
                                        radius-outer="0.152"
                                        theta-start="90"
                                        theta-length="216"
                                        material="shader: flat; color: #5DADE2; opacity: 0.9"
                                    />
                                    <a-entity
                                        animation={`property: rotation; from: 0 0 0; to: 0 0 -360; dur: ${BREATH_CYCLE_MS}; loop: true; easing: linear`}
                                    >
                                        <a-box
                                            width="0.009"
                                            height="0.16"
                                            depth="0.01"
                                            position="0 0.08 0.01"
                                            material="shader: flat; color: #FFF7DA; opacity: 0.95"
                                        />
                                    </a-entity>
                                    <a-circle
                                        radius="0.016"
                                        material="shader: flat; color: #FFF7DA; opacity: 0.95"
                                    />
                                    <a-text
                                        value={breathInstruction}
                                        color="#FFF7DA"
                                        align="center"
                                        width="2.0"
                                        position="0 -0.24 0.01"
                                    />
                                </a-entity>
                            </a-entity>
                        )}

                        {activeAlert === "return" && (
                            <a-entity id="af-return-alert">
                                {/* Label — juste au-dessus de l'altitude (x=-1.50, y=-0.10) */}
                                <a-text
                                    value="ALTITUDE CRITIQUE"
                                    color="#FF3B30"
                                    align="left"
                                    width="2.2"
                                    position="-1.60 0.06 0.03"
                                />
                                <a-text
                                    value="Rentrez avant la nuit."
                                    color="rgba(255,241,241,0.7)"
                                    align="center"
                                    width="2.4"
                                    position="0 -0.50 0.03"
                                />
                            </a-entity>
                        )}

                        </a-entity>
                    </a-camera>
                </a-entity>
            </a-scene>
        </div>
    );
}
