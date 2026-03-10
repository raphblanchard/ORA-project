// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";

interface VrHudAframeDescente2Props {
  videoSrc: string;
}

const ASSET_BASE = "/media/hud-descente2";
const HUD_RADIUS = 2.35;
const HUD_DROP = -0.3;

const toHudPosition = (yawDeg: number, y: number, radius = HUD_RADIUS) => {
  const yawRad = (yawDeg * Math.PI) / 180;
  return `${Math.sin(yawRad) * radius} ${y + HUD_DROP} ${-Math.cos(yawRad) * radius}`;
};

export default function VrHudAframeDescente2({ videoSrc }: VrHudAframeDescente2Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
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

      <a-scene
        vr-mode-ui="enabled: true"
        loading-screen="enabled: false"
        device-orientation-permission-ui="enabled: false"
        renderer="colorManagement: true; physicallyCorrectLights: false"
        style={{ position: "absolute", inset: 0 }}
      >
        <a-assets>
          <video
            id="bg-video-af-descente2"
            ref={videoRef}
            src={videoSrc}
            crossOrigin="anonymous"
            autoPlay
            loop
            muted
            playsInline
          />
          <img id="d2-compass" src={`${ASSET_BASE}/compass.png`} crossOrigin="anonymous" />
          <img id="d2-clock" src={`${ASSET_BASE}/clock.png`} crossOrigin="anonymous" />
          <img id="d2-altitude" src={`${ASSET_BASE}/Altitude.png`} crossOrigin="anonymous" />
          <img id="d2-speed" src={`${ASSET_BASE}/speed.png`} crossOrigin="anonymous" />
          <img id="d2-bpm" src={`${ASSET_BASE}/BPM.png`} crossOrigin="anonymous" />
        </a-assets>

        <a-videosphere src="#bg-video-af-descente2" rotation="0 -90 0" />

        <a-camera id="af-camera-descente2" position="0 1.6 0" look-controls="pointerLockEnabled: false">
          <a-entity id="af-hud-descente2">
            <a-image
              id="af-d2-compass"
              src="#d2-compass"
              material="shader: flat; transparent: true; alphaTest: 0.02"
              position={toHudPosition(-30, 0.42)}
              rotation={`0 30 0`}
              width="0.40"
              height="0.40"
            />

            <a-image
              id="af-d2-clock"
              src="#d2-clock"
              material="shader: flat; transparent: true; alphaTest: 0.02"
              position={toHudPosition(30, 0.38)}
              rotation={`0 -30 0`}
              width="0.60"
              height="0.17"
            />

            <a-image
              id="af-d2-altitude"
              src="#d2-altitude"
              material="shader: flat; transparent: true; alphaTest: 0.02"
              position={toHudPosition(-33, -0.58)}
              rotation={`0 33 0`}
              width="0.84"
              height="0.24"
            />

            <a-image
              id="af-d2-speed"
              src="#d2-speed"
              material="shader: flat; transparent: true; alphaTest: 0.02"
              position={toHudPosition(0, -0.65)}
              rotation="0 0 0"
              width="0.81"
              height="0.26"
            />

            <a-image
              id="af-d2-bpm"
              src="#d2-bpm"
              material="shader: flat; transparent: true; alphaTest: 0.02"
              position={toHudPosition(33, -0.58)}
              rotation={`0 -33 0`}
              width="0.84"
              height="0.24"
            />
          </a-entity>
        </a-camera>
      </a-scene>
    </div>
  );
}
