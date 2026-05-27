import React, { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import {
  Bot,
  BookOpen,
  Cpu,
  Gauge,
  Grid2X2,
  MapPinned,
  Navigation,
  Radio,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import AiAssistantAnimation from "./AiAssistantAnimation.jsx";

function StatusPill({ text, color = "bg-emerald-500" }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/75 px-3 py-1 text-[11px] font-semibold text-zinc-600 shadow-sm">
      <span
        className={`h-2 w-2 rounded-full ${color}`}
        style={{ animation: "pulseDot 1.6s ease-in-out infinite" }}
      />
      {text}
    </div>
  );
}

function IconButton({ children, active = false, onClick, title }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`grid h-11 w-11 place-items-center rounded-full border shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition hover:scale-105 ${
        active
          ? "border-zinc-950 bg-zinc-950 text-white"
          : "border-white/70 bg-white/75 text-zinc-700 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function ModePill({ icon: Icon, label, active = false }) {
  return (
    <button
      className={`flex items-center gap-2 rounded-full px-7 py-3 text-xs font-bold transition ${
        active
          ? "bg-zinc-950 text-white shadow-xl"
          : "bg-white/10 text-zinc-500 hover:bg-white/20"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function RoverModel() {
  const roverRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (roverRef.current) {
      roverRef.current.rotation.y = Math.sin(t * 0.35) * 0.12;
      roverRef.current.position.y = Math.sin(t * 1.2) * 0.025;
    }
  });

  const wheels = useMemo(() => {
    const items = [];
    const xPositions = [-1.55, -0.55, 0.55, 1.55];

    xPositions.forEach((x) => {
      items.push([x, -0.72, 0.82]);
      items.push([x, -0.72, -0.82]);
    });

    return items;
  }, []);

  return (
    <group ref={roverRef} rotation={[0.12, -0.55, 0]}>
      {/* Main base body */}
      <RoundedBox args={[4.2, 0.55, 1.9]} radius={0.18} smoothness={8}>
        <meshStandardMaterial
          color="#a8a8a2"
          roughness={0.35}
          metalness={0.45}
        />
      </RoundedBox>

      {/* Top plate */}
      <RoundedBox
        args={[3.7, 0.16, 1.65]}
        radius={0.12}
        smoothness={8}
        position={[0, 0.55, 0]}
      >
        <meshStandardMaterial
          color="#cfd2d1"
          roughness={0.28}
          metalness={0.5}
        />
      </RoundedBox>

      {/* Middle shelf */}
      <RoundedBox
        args={[3.2, 0.12, 1.45]}
        radius={0.1}
        smoothness={8}
        position={[0, 1.25, 0]}
      >
        <meshStandardMaterial
          color="#e4e5e2"
          roughness={0.32}
          metalness={0.45}
        />
      </RoundedBox>

      {/* Top shelf */}
      <RoundedBox
        args={[2.8, 0.12, 1.28]}
        radius={0.1}
        smoothness={8}
        position={[0, 1.93, 0]}
      >
        <meshStandardMaterial
          color="#eeeeeb"
          roughness={0.3}
          metalness={0.45}
        />
      </RoundedBox>

      {/* Top round sensor */}
      <mesh position={[0, 2.13, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.2, 64]} />
        <meshStandardMaterial
          color="#7b8384"
          roughness={0.24}
          metalness={0.65}
        />
      </mesh>

      {/* Shelf rods */}
      {[-1.35, 1.35].map((x) =>
        [-0.48, 0.48].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 1.25, z]}>
            <cylinderGeometry args={[0.055, 0.055, 1.4, 24]} />
            <meshStandardMaterial
              color="#d9dcdb"
              roughness={0.25}
              metalness={0.75}
            />
          </mesh>
        ))
      )}

      {/* Left and right tracks */}
      <RoundedBox
        args={[4.55, 0.78, 0.32]}
        radius={0.18}
        smoothness={8}
        position={[0, -0.7, 1.06]}
      >
        <meshStandardMaterial color="#101010" roughness={0.42} metalness={0.2} />
      </RoundedBox>

      <RoundedBox
        args={[4.55, 0.78, 0.32]}
        radius={0.18}
        smoothness={8}
        position={[0, -0.7, -1.06]}
      >
        <meshStandardMaterial color="#101010" roughness={0.42} metalness={0.2} />
      </RoundedBox>

      {/* Small wheels */}
      {wheels.map(([x, y, z], index) => (
        <mesh
          key={index}
          position={[x, y, z]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.24, 0.24, 0.15, 48]} />
          <meshStandardMaterial
            color="#303030"
            roughness={0.38}
            metalness={0.4}
          />
        </mesh>
      ))}

      {/* Copper motors */}
      <mesh position={[-0.9, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 1.35, 48]} />
        <meshStandardMaterial
          color="#d29a74"
          roughness={0.34}
          metalness={0.5}
        />
      </mesh>

      <mesh position={[0.9, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 1.35, 48]} />
        <meshStandardMaterial
          color="#d29a74"
          roughness={0.34}
          metalness={0.5}
        />
      </mesh>

      {/* Main axle */}
      <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 2.8, 48]} />
        <meshStandardMaterial
          color="#b8c0d4"
          roughness={0.25}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

function RoverCanvas() {
  return (
    <div className="rover-canvas-wrap h-full w-full">
      <Canvas
        camera={{ position: [4.5, 3.2, 5.6], fov: 38 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.background = null;
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 6, 6]} intensity={2.4} />
          <pointLight position={[-4, 3, 5]} intensity={1.6} color="#60a5fa" />
          <pointLight position={[4, -2, 3]} intensity={1.1} color="#22d3ee" />

          <RoverModel />

          <ContactShadows
            position={[0, -1.22, 0]}
            opacity={0.45}
            scale={7}
            blur={2.4}
            far={4}
          />

          <Environment preset="city" />

          <OrbitControls
            enableZoom
            enablePan={false}
            rotateSpeed={0.75}
            minDistance={4.2}
            maxDistance={8.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function HomeCard({ title, value, sub }) {
  return (
    <div className="panel h-full overflow-hidden rounded-[30px] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wide text-zinc-400">
            {title}
          </p>
          <h3 className="mt-2 text-4xl font-black tracking-[-0.06em] text-zinc-950">
            {value}
          </h3>
        </div>

        <span className="text-xl text-zinc-400">↗</span>
      </div>

      <p className="mt-10 text-xs font-medium text-zinc-400">{sub}</p>
    </div>
  );
}

function HomeDashboard() {
  return (
    <section className="relative z-10 grid h-[calc(100vh-104px)] grid-rows-[minmax(0,1fr)_190px] gap-5 px-20 pb-6">
      <div className="relative grid min-h-0 grid-cols-[0.85fr_1.5fr_0.85fr] items-center gap-6">
        <div className="pl-10">
          <h2 className="text-5xl font-black leading-[0.92] tracking-[-0.07em] text-zinc-950">
            Office
            <br />
            Navigation
          </h2>
          <p className="mt-6 max-w-[300px] text-sm leading-relaxed text-zinc-400">
            Indoor Mapping • Desk-to-Desk Mobility
            <br />
            Human-Aware Obstacle Avoidance
          </p>
        </div>

        <div className="relative h-full min-h-[420px]">
          <div className="absolute left-1/2 top-[52%] h-[190px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/12 blur-sm" />

          <div className="absolute inset-0">
            <RoverCanvas />
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-semibold text-zinc-400 shadow-lg backdrop-blur-xl">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
            Click + drag to rotate freely in all axes
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-black tracking-[-0.06em] text-zinc-950">
            SAMP ROBO
          </h2>
          <p className="mt-5 max-w-[260px] text-lg leading-relaxed text-zinc-400">
            Autonomous indoor support for smart office spaces
          </p>
        </div>
      </div>

      <div className="grid min-h-0 grid-cols-3 gap-5">
        <HomeCard
          title="Navigation Range"
          value="25m"
          sub="Indoor waypoint coverage"
        />
        <HomeCard
          title="Assist Speed"
          value="1.2 m/s"
          sub="Safe office movement"
        />
        <HomeCard
          title="Runtime"
          value="6 hours"
          sub="Low-power indoor mode"
        />
      </div>
    </section>
  );
}

function MissionPreviewPage() {
  return (
    <section className="relative z-10 h-[calc(100vh-104px)] px-20 pb-6">
      <div className="panel h-full overflow-hidden rounded-[30px] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-zinc-950 text-white shadow-lg">
              <MapPinned className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-black tracking-[-0.04em] text-zinc-950">
                Mission & Navigation
              </h2>
              <p className="text-xs font-medium text-zinc-400">
                Route planning, waypoint tracking and autonomous navigation
              </p>
            </div>
          </div>

          <StatusPill color="bg-amber-400" text="AUTONOMY ACTIVE" />
        </div>

        <div className="grid h-[calc(100%-72px)] grid-cols-[1.2fr_0.8fr] gap-5">
          <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/65 p-5">
            <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:44px_44px]" />

            <div className="relative z-10 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-zinc-950">
                  Live Route Map
                </h3>
                <p className="text-xs text-zinc-400">
                  Office Zone A → Lab Desk 02
                </p>
              </div>

              <div className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white">
                AUTO MODE
              </div>
            </div>

            <div className="relative z-10 h-[calc(100%-70px)] overflow-hidden rounded-[24px] bg-white/10">
              <svg className="h-full w-full" viewBox="0 0 900 460">
                <rect
                  x="80"
                  y="70"
                  width="170"
                  height="80"
                  rx="18"
                  fill="rgba(255,255,255,0.18)"
                />
                <rect
                  x="360"
                  y="95"
                  width="140"
                  height="70"
                  rx="18"
                  fill="rgba(255,255,255,0.18)"
                />
                <rect
                  x="620"
                  y="75"
                  width="180"
                  height="90"
                  rx="18"
                  fill="rgba(255,255,255,0.18)"
                />

                <rect
                  x="120"
                  y="300"
                  width="190"
                  height="90"
                  rx="20"
                  fill="rgba(255,255,255,0.18)"
                />
                <rect
                  x="430"
                  y="285"
                  width="150"
                  height="80"
                  rx="18"
                  fill="rgba(255,255,255,0.18)"
                />
                <rect
                  x="680"
                  y="290"
                  width="130"
                  height="80"
                  rx="18"
                  fill="rgba(255,255,255,0.18)"
                />

                <path
                  d="M90 380 C180 250, 280 330, 365 210 S570 120, 760 255"
                  fill="none"
                  stroke="rgba(255,255,255,0.88)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="18 18"
                />

                <circle cx="90" cy="380" r="18" fill="#22c55e" />
                <circle cx="365" cy="210" r="16" fill="#f59e0b" />
                <circle cx="760" cy="255" r="18" fill="#ef4444" />
              </svg>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-5">
            <div className="rounded-[26px] border border-white/80 bg-white/65 p-5">
              <h3 className="mb-4 text-base font-black text-zinc-950">
                Navigation Status
              </h3>

              <div className="space-y-3">
                <NavMetric label="Current Mode" value="Autonomous" />
                <NavMetric label="Current Heading" value="72° NE" />
                <NavMetric label="Distance Left" value="18.5 m" />
                <NavMetric label="ETA" value="02:14" />
              </div>
            </div>

            <div className="rounded-[26px] border border-white/80 bg-white/65 p-5">
              <h3 className="mb-4 text-base font-black text-zinc-950">
                Waypoint Queue
              </h3>

              <div className="space-y-3">
                <WaypointItem title="WP-01" status="Completed" />
                <WaypointItem title="WP-02" status="Current" active />
                <WaypointItem title="WP-03" status="Pending" />
                <WaypointItem title="Docking Point" status="Pending" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NavMetric({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/70 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="text-lg font-black tracking-[-0.04em] text-zinc-950">
        {value}
      </p>
    </div>
  );
}

function WaypointItem({ title, status, active = false }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/70 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`h-3 w-3 rounded-full ${
            active
              ? "bg-amber-400"
              : status === "Completed"
              ? "bg-emerald-500"
              : "bg-zinc-300"
          }`}
        />
        <p className="text-sm font-black text-zinc-950">{title}</p>
      </div>

      <span className="rounded-full bg-zinc-950 px-3 py-1 text-[10px] font-black text-white">
        {status}
      </span>
    </div>
  );
}

function AssistantHomePage() {
  return (
    <section className="relative z-10 h-[calc(100vh-104px)] px-20 pb-6">
      <AiAssistantAnimation />
    </section>
  );
}

export default function HomePage({ onDashboard }) {
  const [activePanel, setActivePanel] = useState("home");

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#eef0ef] text-zinc-950">
      <section className="clean-grid relative h-screen w-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.86),rgba(255,255,255,0.34)_38%,rgba(0,0,0,0.035)_100%)]" />

        <header className="relative z-20 flex h-[104px] items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-black tracking-[0.18em]">SAMP ROBO</h1>
            <p className="mt-1 text-xs font-semibold text-zinc-400">
              AI Feed • LiDAR Scan • Real-Time Rover Info
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/75 bg-white/70 p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
            <ModePill icon={Radio} label="Office Mode" active />
            <ModePill icon={BookOpen} label="Learning Mode" />
            <ModePill icon={Cpu} label="Sample Mode" />
          </div>

          <div className="flex items-center gap-4">
            <IconButton>
              <Settings className="h-4 w-4" />
            </IconButton>

            <button className="grid h-12 w-12 place-items-center rounded-full bg-red-400 text-[9px] font-black leading-tight text-white shadow-xl">
              SAMP
              <br />
              ROBO
            </button>
          </div>
        </header>

        <aside className="absolute left-8 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-4">
          <IconButton
            title="3D Rover Home"
            active={activePanel === "home"}
            onClick={() => setActivePanel("home")}
          >
            <Grid2X2 className="h-4 w-4" />
          </IconButton>

          <IconButton title="AI + LiDAR Dashboard" onClick={onDashboard}>
            <Radio className="h-4 w-4" />
          </IconButton>

          <IconButton
            title="Mission & Navigation"
            active={activePanel === "mission"}
            onClick={() => setActivePanel("mission")}
          >
            <Navigation className="h-4 w-4" />
          </IconButton>

          <IconButton
            title="AI Assistant Core"
            active={activePanel === "assistant"}
            onClick={() => setActivePanel("assistant")}
          >
            <Bot className="h-4 w-4" />
          </IconButton>
        </aside>

        <aside className="absolute right-8 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-4">
          <IconButton title="Menu">
            <Search className="h-4 w-4" />
          </IconButton>

          <IconButton title="User">
            <UserRound className="h-4 w-4" />
          </IconButton>
        </aside>

        {activePanel === "home" && <HomeDashboard />}
        {activePanel === "mission" && <MissionPreviewPage />}
        {activePanel === "assistant" && <AssistantHomePage />}
      </section>
    </main>
  );
}