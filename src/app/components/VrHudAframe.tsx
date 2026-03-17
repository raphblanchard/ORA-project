// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   PROPS
───────────────────────────────────────────── */
interface VrHudAframeProps {
    alertType: "breathing" | "return";
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
    alertType,
    altitude,
    bpm,
    durationText,
    isFirstReference,
    onToggleReference,
    timeText,
    tempAmb,
    tempObj,
}: VrHudAframeProps) {
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

    /* ── lecture vidéo ── */
    /* Retrouve le <video id="bg-video-af"> injecté par VideoPreloader et le joue */
    useEffect(() => {
        const v = document.getElementById("bg-video-af") as HTMLVideoElement | null;
        if (!v) return;
        videoRef.current = v;
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
        setActiveAlert("none");
        setBreathPhase("inhale");
        setLogoSrc("/media/hud/png-elements/hq/Logo vert.png");
        let breathingTimer: number | null = null;

        const triggerTimer = window.setTimeout(() => {
            if (alertType === "breathing") {
                setLogoSrc("/media/hud/png-elements/hq/Logo jaune.png");
                setActiveAlert("breathing");
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
            else {
                setLogoSrc("/media/hud/png-elements/hq/Logo rouge.png");
                setActiveAlert("return");
            }
        }, 10000);

        return () => {
            window.clearTimeout(triggerTimer);
            if (breathingTimer !== null) {
                window.clearInterval(breathingTimer);
            }
        };
    }, [alertType]);

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

                {/* ── Vidéo 360° ── */}
                <a-videosphere src="#bg-video-af" rotation="0 -90 0" />

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

                        {/* ══════ BOUTON EXIT VR (visible uniquement en mode immersif) ══════ */}
                        {isVrMode && (
                            <a-entity
                                id="af-exit-vr-button"
                                class="af-clickable"
                                geometry="primitive: plane; width: 0.34; height: 0.34"
                                material="color: #10242c; opacity: 0.38; shader: flat"
                                position="0.42 -0.98 0.02"
                            >
                                <a-text
                                    value="✕"
                                    color="#FF8A84"
                                    align="center"
                                    baseline="center"
                                    width="1.5"
                                    position="0 0 0.01"
                                />
                            </a-entity>
                        )}

                        {activeAlert === "breathing" && (
                            <a-entity id="af-breathing-alert" position="0 -0.05 0.03">
                                <a-circle
                                    radius="0.27"
                                    material="shader: flat; color: #F3D35B; opacity: 0.08"
                                />
                                <a-ring
                                    radius-inner="0.19"
                                    radius-outer="0.205"
                                    theta-start="-54"
                                    theta-length="144"
                                    material="shader: flat; color: #63D471; opacity: 0.95"
                                />
                                <a-ring
                                    radius-inner="0.19"
                                    radius-outer="0.205"
                                    theta-start="90"
                                    theta-length="216"
                                    material="shader: flat; color: #5DADE2; opacity: 0.95"
                                />
                                <a-entity
                                    animation={`property: rotation; from: 0 0 0; to: 0 0 -360; dur: ${BREATH_CYCLE_MS}; loop: true; easing: linear`}
                                >
                                    <a-box
                                        width="0.012"
                                        height="0.22"
                                        depth="0.01"
                                        position="0 0.11 0.01"
                                        material="shader: flat; color: #FFF7DA; opacity: 0.95"
                                    />
                                </a-entity>
                                <a-circle
                                    radius="0.022"
                                    material="shader: flat; color: #FFF7DA; opacity: 0.95"
                                />
                                <a-text
                                    value="Alerte respiration"
                                    color="#F9E7A5"
                                    align="center"
                                    width="2.2"
                                    position="0 -0.42 0.01"
                                />
                                <a-text
                                    value={breathInstruction}
                                    color="#FFF7DA"
                                    align="center"
                                    width="2.6"
                                    position="0 -0.53 0.01"
                                />
                            </a-entity>
                        )}

                        {activeAlert === "return" && (
                            <a-entity id="af-return-alert" position="0 -0.1 0.03">
                                <a-text
                                    value="Alerte retour"
                                    color="#FF8A84"
                                    align="center"
                                    width="2.3"
                                    position="0 0.1 0.02"
                                />
                                <a-text
                                    value="Rentrez."
                                    color="#FFF1F1"
                                    align="center"
                                    width="2.4"
                                    position="0 -0.02 0.02"
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
