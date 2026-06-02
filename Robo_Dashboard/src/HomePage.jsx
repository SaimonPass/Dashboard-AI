import React, { Suspense, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Bot,
  Briefcase,
  Grid2X2,
  Mic,
  Navigation,
  Radio,
  Search,
  Settings,
  Wifi,
} from "lucide-react";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import AiAssistantAnimation from "./AiAssistantAnimation.jsx";

/* ================================
   TOP BAR
================================ */

function LiquidTopBar({ activeMode, setActiveMode }) {
  const modes = [
    {
      id: "office",
      label: "Office Mode",
      icon: <Wifi className="h-4 w-4" />,
    },
    {
      id: "learning",
      label: "Learning Mode",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      id: "voice",
      label: "Voice Assistant",
      icon: <Mic className="h-4 w-4" />,
    },
  ];

  const activeIndex = modes.findIndex((mode) => mode.id === activeMode);

  return (
    <div className="real-liquid-glass-bar">
      <div
        className="real-liquid-active-wrap"
        style={{
          width: "154px",
          transform: `translateX(${activeIndex * 162 + 6}px)`,
        }}
      >
        <div className="real-liquid-active-main" />
      </div>

      <div className="real-liquid-buttons">
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setActiveMode(mode.id)}
            className={`real-liquid-button ${
              activeMode === mode.id ? "real-liquid-button-active" : ""
            }`}
          >
            {mode.icon}
            <span>{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================
   SHARED BUTTONS
================================ */

function IconButton({ children, active = false, onClick, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`grid h-12 w-12 place-items-center rounded-full border transition-all duration-300 hover:scale-105 ${
        active
          ? "border-cyan-300/55 bg-cyan-400/20 text-white shadow-[0_0_30px_rgba(0,229,255,0.24)]"
          : "border-white/15 bg-white/[0.07] text-white/70 hover:border-cyan-300/35 hover:bg-cyan-400/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function HeaderButton({ children, title }) {
  return (
    <button
      type="button"
      title={title}
      className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white/75 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-white"
    >
      {children}
    </button>
  );
}

function SideRail({ activeMode, setActiveMode, onDashboard }) {
  return (
    <nav className="fixed left-8 top-1/2 z-[999] flex -translate-y-1/2 flex-col gap-4">
      <IconButton
        title="Office Mode"
        active={activeMode === "office"}
        onClick={() => setActiveMode("office")}
      >
        <Grid2X2 className="h-4 w-4" />
      </IconButton>

      <IconButton title="AI + LiDAR Dashboard" onClick={onDashboard}>
        <Radio className="h-4 w-4" />
      </IconButton>

      <IconButton
        title="Learning Mode"
        active={activeMode === "learning"}
        onClick={() => setActiveMode("learning")}
      >
        <Navigation className="h-4 w-4" />
      </IconButton>

      <IconButton
        title="Voice Assistant"
        active={activeMode === "voice"}
        onClick={() => setActiveMode("voice")}
      >
        <Briefcase className="h-4 w-4" />
      </IconButton>
    </nav>
  );
}

function InfoCard({ title, value, description }) {
  return (
    <div className="panel relative overflow-hidden rounded-[28px] p-6">
      <div className="absolute right-5 top-5 text-white/35">↗</div>

      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-white/35">
        {title}
      </p>

      <h3 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">
        {value}
      </h3>

      <p className="absolute bottom-6 left-6 text-sm font-medium text-white/45">
        {description}
      </p>
    </div>
  );
}

/* ================================
   ROVER MODEL
================================ */

function RealRoverModel({ onModelLoaded }) {
  const groupRef = useRef(null);
  const [modelObject, setModelObject] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loader = new GLTFLoader();

    loader.load(
      "/models/rover.gltf",
      (gltf) => {
        if (cancelled) return;

        try {
          const model = gltf.scene.clone(true);

          model.traverse((child) => {
            if (child.isMesh) {
              child.visible = true;
              child.castShadow = true;
              child.receiveShadow = true;
              child.frustumCulled = false;

              if (child.material) {
                child.material = child.material.clone();
                child.material.transparent = false;
                child.material.opacity = 1;
                child.material.side = THREE.DoubleSide;
                child.material.depthWrite = true;
                child.material.depthTest = true;
                child.material.needsUpdate = true;
              }
            }
          });

          const box = new THREE.Box3().setFromObject(model);
          const center = new THREE.Vector3();
          const size = new THREE.Vector3();

          box.getCenter(center);
          box.getSize(size);

          const maxAxis = Math.max(size.x, size.y, size.z);

          if (!Number.isFinite(maxAxis) || maxAxis <= 0) {
            throw new Error("Invalid rover model bounds");
          }

          model.position.x -= center.x;
          model.position.y -= center.y;
          model.position.z -= center.z;

          /*
            Bigger rover size.
            This increases visual size without making the camera too close.
          */
          const safeScale = 5.15 / maxAxis;

          const wrapper = new THREE.Group();
          wrapper.add(model);
          wrapper.scale.setScalar(safeScale);
          wrapper.position.set(0, 0.02, 0);
          wrapper.rotation.set(0.04, 0.22, 0);

          console.log("ROVER GLTF LOADED:", {
            center: center.toArray(),
            size: size.toArray(),
            safeScale,
          });

          setModelObject(wrapper);
          onModelLoaded?.();
        } catch (error) {
          console.error("ROVER PREP FAILED:", error);
        }
      },
      undefined,
      (error) => {
        console.error("ROVER GLTF LOAD FAILED:", error);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [onModelLoaded]);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 1.1) * 0.018;

    groupRef.current.rotation.y += 0.0009;
  });

  if (!modelObject) return null;

  return (
    <group ref={groupRef}>
      <primitive object={modelObject} />
    </group>
  );
}

function RoverScene({ setRealModelLoaded }) {
  return (
    <>
      <ambientLight intensity={3.6} />

      <directionalLight position={[6, 8, 7]} intensity={5.0} castShadow />
      <directionalLight position={[-6, 5, -5]} intensity={3.0} />

      <pointLight position={[-4, 3, 5]} intensity={2.8} color="#67e8f9" />
      <pointLight position={[5, -2, 4]} intensity={2.0} color="#8b5cf6" />

      <Suspense fallback={null}>
        <RealRoverModel onModelLoaded={() => setRealModelLoaded(true)} />
      </Suspense>

      <Environment preset="city" />

      <ContactShadows
        position={[0, -1.35, 0]}
        opacity={0.16}
        scale={11}
        blur={4}
        far={7}
      />

      <OrbitControls
        makeDefault
        enableZoom
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.58}
        zoomSpeed={0.28}
        autoRotate
        autoRotateSpeed={0.07}
        target={[0, 0, 0]}
        minDistance={8.6}
        maxDistance={18}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />
    </>
  );
}

function RoverViewer() {
  const [, setRealModelLoaded] = useState(false);

  return (
    <div
      className="rover-viewer-fixed"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "560px",
        overflow: "visible",
        pointerEvents: "auto",
        zIndex: 80,
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [6.1, 3.25, 12.4],
          fov: 36,
          near: 0.1,
          far: 2500,
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          width: "100%",
          height: "100%",
          background: "transparent",
          display: "block",
        }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(0x000000, 0);
          camera.lookAt(0, 0, 0);
        }}
      >
        <RoverScene setRealModelLoaded={setRealModelLoaded} />
      </Canvas>
    </div>
  );
}

/* ================================
   POINT CLOUD COMPONENT
================================ */

function PointCloudMap() {
  const scanLines = [
    "M-120 520 C120 390, 410 265, 760 100 C920 25, 1080 0, 1220 -30",
    "M-150 610 C140 470, 430 340, 805 175 C970 105, 1120 72, 1280 40",
    "M-100 705 C160 590, 470 455, 870 280 C1030 210, 1160 180, 1320 150",
    "M60 720 C310 580, 575 455, 910 325 C1060 265, 1210 240, 1390 220",
    "M-180 455 C110 330, 380 210, 700 70 C880 -5, 1080 -45, 1280 -80",
    "M220 795 C450 670, 710 520, 1040 385 C1190 320, 1320 295, 1480 278",
  ];

  const verticals = [
    [120, 415, 130, "#16ff55"],
    [205, 360, 170, "#00eaff"],
    [330, 330, 210, "#6d5cff"],
    [460, 300, 250, "#1cff61"],
    [590, 265, 185, "#00eaff"],
    [710, 230, 260, "#6d5cff"],
    [845, 205, 300, "#13ff57"],
    [1010, 250, 190, "#00eaff"],
    [1150, 210, 230, "#6d5cff"],
    [1280, 180, 280, "#21ff53"],
    [760, 535, 160, "#00eaff"],
    [940, 470, 180, "#16ff55"],
  ];

  const dots = Array.from({ length: 220 }, (_, i) => {
    const x = (i * 73) % 1400;
    const y = 110 + ((i * 47) % 650);
    const size = i % 11 === 0 ? 3.3 : i % 5 === 0 ? 2.35 : 1.35;
    const colors = ["#00eaff", "#1dff5a", "#3b82f6", "#8b5cf6"];
    return [x, y, size, colors[i % colors.length], i];
  });

  return (
    <div className="learning-pointcloud-scene">
      <div className="pc-aurora-bg" />
      <div className="pc-perspective-grid" />
      <div className="pc-particle-noise" />

      <svg
        className="pc-full-svg"
        viewBox="0 0 1400 760"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="cyanGreen" x1="0" x2="1">
            <stop offset="0%" stopColor="#00eaff" />
            <stop offset="50%" stopColor="#1dff5a" />
            <stop offset="100%" stopColor="#00eaff" />
          </linearGradient>

          <linearGradient id="blueViolet" x1="0" x2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#00eaff" />
          </linearGradient>
        </defs>

        <g className="pc-depth-plane" filter="url(#neonGlow)">
          <path
            d="M-80 610 L820 180 L1510 420 L460 840 Z"
            fill="rgba(0, 238, 255, 0.035)"
            stroke="rgba(0, 238, 255, 0.15)"
            strokeWidth="2"
          />

          {Array.from({ length: 18 }, (_, i) => (
            <path
              key={`depth-a-${i}`}
              d={`M${-80 + i * 70} ${610 - i * 23} L${460 + i * 70} ${
                840 - i * 23
              }`}
              stroke="rgba(34, 211, 238, 0.15)"
              strokeWidth="1"
              strokeDasharray="2 14"
            />
          ))}

          {Array.from({ length: 14 }, (_, i) => (
            <path
              key={`depth-b-${i}`}
              d={`M${-80 + i * 120} ${610} L${820 + i * 55} ${180}`}
              stroke="rgba(29, 255, 90, 0.11)"
              strokeWidth="1"
              strokeDasharray="2 16"
            />
          ))}
        </g>

        <g className="pc-main-lines" filter="url(#neonGlow)">
          {scanLines.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={i % 2 === 0 ? "url(#cyanGreen)" : "url(#blueViolet)"}
              strokeWidth={i % 2 === 0 ? 8 : 5}
              strokeLinecap="round"
              strokeDasharray={i % 2 === 0 ? "10 22" : "16 26"}
              opacity={i % 2 === 0 ? 0.9 : 0.72}
            />
          ))}
        </g>

        <g className="pc-verticals" filter="url(#neonGlow)">
          {verticals.map(([x, y, h, color], i) => (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x + 34}
              y2={y - h}
              stroke={color}
              strokeWidth="5"
              strokeDasharray="5 12"
              strokeLinecap="round"
              opacity="0.86"
            />
          ))}
        </g>

        <g className="pc-point-dots" filter="url(#neonGlow)">
          {dots.map(([x, y, r, color, i]) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill={color}
              opacity={i % 3 === 0 ? 0.95 : 0.58}
            />
          ))}
        </g>

        <g className="pc-sweep-beam" filter="url(#neonGlow)">
          <path
            d="M-80 675 L1420 145"
            stroke="#9dff4f"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="10 18"
            opacity="0.65"
          />
          <circle cx="210" cy="572" r="8" fill="#00ffa3" />
          <circle cx="1170" cy="234" r="10" fill="#24ff45" />
        </g>
      </svg>
    </div>
  );
}

/* ================================
   VOICE ASSISTANT PAGE
================================ */

function VoiceAssistantPanel() {
  return (
    <section className="absolute left-[88px] right-[72px] top-[112px] bottom-[34px] z-20">
      <AiAssistantAnimation />
    </section>
  );
}

/* ================================
   LEARNING PAGE
================================ */

function LearningPanel() {
  return (
    <section className="learning-edge-page">
      <PointCloudMap />

      <div className="learning-page-gradient" />

      <div className="learning-top-left">
        <h2>Learning Mode</h2>
        <p>Real-time LiDAR point cloud mapping and autonomous navigation.</p>
      </div>

      <div className="learning-map-title-floating">
        <h3>Point Cloud Mapping</h3>
        <p>LiDAR generated 3D indoor navigation map</p>
      </div>

      <div className="learning-top-status">
        <span />
        AUTONOMY ACTIVE
      </div>

      <div className="learning-map-mode-floating">3D MAP MODE</div>

      <div className="learning-bottom-hud-clean">
        <div>
          <span>MODE</span>
          <strong>Autonomous</strong>
        </div>

        <div>
          <span>HEADING</span>
          <strong>72° NE</strong>
        </div>

        <div>
          <span>DISTANCE</span>
          <strong>18.5 m</strong>
        </div>

        <div>
          <span>ETA</span>
          <strong>02:14</strong>
        </div>

        <div>
          <span>POINTS</span>
          <strong>42k/s</strong>
        </div>

        <div>
          <span>STATUS</span>
          <strong>SLAM Active</strong>
        </div>
      </div>
    </section>
  );
}

/* ================================
   OFFICE HOME
================================ */

function OfficeHome() {
  return (
    <>
      <section className="absolute left-[98px] top-[42%] z-20 -translate-y-1/2">
        <h2 className="text-5xl font-black leading-[0.92] tracking-[-0.07em] text-white">
          Office
          <br />
          Navigation
        </h2>

        <p className="mt-6 max-w-[300px] text-sm leading-6 text-white/48">
          Indoor Mapping • Desk-to-Desk Mobility
          <br />
          Human-Aware Obstacle Avoidance
        </p>
      </section>

      <section className="absolute right-[160px] top-[44%] z-20 -translate-y-1/2">
        <h2 className="text-4xl font-black tracking-[-0.06em] text-white">
          SAMP ROBO
        </h2>

        <p className="mt-6 max-w-[260px] text-lg leading-8 text-white/45">
          Autonomous indoor support for smart office spaces
        </p>
      </section>

      <section
        className="absolute left-1/2 top-[41%] z-30 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "min(1080px, 66vw)",
          height: "min(680px, 64vh)",
          overflow: "visible",
          pointerEvents: "auto",
        }}
      >
        <RoverViewer />
      </section>

      <div className="absolute left-1/2 top-[73%] z-40 -translate-x-1/2 rounded-full border border-white/10 bg-white/[0.08] px-5 py-2 text-xs font-bold text-white/60 backdrop-blur-xl">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
        Drag to rotate • Scroll to zoom
      </div>

      <section className="absolute bottom-8 left-[88px] right-[72px] z-20 grid h-[160px] grid-cols-3 gap-6">
        <InfoCard
          title="Navigation Range"
          value="25m"
          description="Indoor waypoint coverage"
        />

        <InfoCard
          title="Assist Speed"
          value="1.2 m/s"
          description="Safe office movement"
        />

        <InfoCard
          title="Runtime"
          value="6 hours"
          description="Low-power indoor mode"
        />
      </section>
    </>
  );
}

/* ================================
   MAIN HOMEPAGE
================================ */

export default function HomePage({ onDashboard }) {
  const [activeMode, setActiveMode] = React.useState("office");

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#030812] text-white obelisk-theme">
      <section className="clean-grid relative h-screen w-screen overflow-hidden">
        <div className="obelisk-background pointer-events-none absolute inset-0" />

        <header className="absolute left-0 right-0 top-0 z-50 flex h-24 items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-black tracking-[0.18em] text-white">
              SAMP ROBO
            </h1>

            <p className="mt-1 text-xs font-semibold text-white/45">
              AI Feed • LiDAR Scan • Real-Time Rover Info
            </p>
          </div>

          <div className="absolute left-1/2 top-7 -translate-x-1/2">
            <LiquidTopBar
              activeMode={activeMode}
              setActiveMode={setActiveMode}
            />
          </div>

          <div className="flex items-center gap-4">
            <HeaderButton title="Settings">
              <Settings className="h-4 w-4" />
            </HeaderButton>

            <button
              type="button"
              className="grid h-12 w-12 place-items-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-[9px] font-black leading-tight text-white shadow-xl"
            >
              SAMP
              <br />
              ROBO
            </button>
          </div>
        </header>

        <SideRail
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          onDashboard={onDashboard}
        />

        {activeMode === "office" && <OfficeHome />}
        {activeMode === "learning" && <LearningPanel />}
        {activeMode === "voice" && <VoiceAssistantPanel />}

        <button
          type="button"
          className="absolute right-8 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white/75 backdrop-blur-xl transition-all hover:scale-105 hover:text-white"
        >
          <Search className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="absolute right-8 top-[calc(50%+64px)] z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white/75 backdrop-blur-xl transition-all hover:scale-105 hover:text-white"
        >
          <Bot className="h-4 w-4" />
        </button>
      </section>
    </main>
  );
}