import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BatteryCharging,
  Bot,
  Camera,
  Cpu,
  Gauge,
  Grid2X2,
  HardDrive,
  MapPinned,
  Navigation,
  Radio,
  ScanLine,
  Settings,
  Thermometer,
  UserRound,
  Video,
  Wifi,
} from "lucide-react";
import AiAssistantAnimation from "./AiAssistantAnimation.jsx";

const YOLO_STREAM_URL = "http://localhost:8000/video_feed";
const YOLO_STATS_URL = "http://localhost:8000/stats";

const roverStats = [
  {
    label: "Battery",
    value: "74%",
    status: "Stable",
    icon: BatteryCharging,
  },
  {
    label: "Speed",
    value: "1.2 m/s",
    status: "Assist",
    icon: Gauge,
  },
  {
    label: "CPU Load",
    value: "61%",
    status: "AI Active",
    icon: Cpu,
  },
  {
    label: "Motor Temp",
    value: "46°C",
    status: "Normal",
    icon: Thermometer,
  },
  {
    label: "Signal",
    value: "92%",
    status: "Online",
    icon: Wifi,
  },
  {
    label: "Storage",
    value: "38GB",
    status: "Logging",
    icon: HardDrive,
  },
];



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

function PanelHeader({ icon: Icon, title, sub, action }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-950 text-white shadow-lg">
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-base font-black tracking-[-0.04em] text-zinc-950">
            {title}
          </h2>
          <p className="text-[11px] font-medium text-zinc-400">{sub}</p>
        </div>
      </div>

      {action}
    </div>
  );
}

function useYoloStats() {
  const [stats, setStats] = useState({
    fps: 0,
    status: "offline",
    person_count: 0,
    object_count: 0,
    id_card_count: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const response = await fetch(YOLO_STATS_URL);
        const data = await response.json();

        if (mounted) {
          setStats(data);
        }
      } catch {
        if (mounted) {
          setStats((previous) => ({
            ...previous,
            status: "offline",
          }));
        }
      }
    }

    fetchStats();
    const timer = setInterval(fetchStats, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return stats;
}

function AIFeedPanel({ expanded }) {
  const stats = useYoloStats();
  const isRunning = stats.status === "running";

  return (
    <section className="panel flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] p-5">
      <PanelHeader
        icon={Camera}
        title="AI Feed Monitoring"
        sub="Live YOLOv8 object detection camera feed"
        action={
          <StatusPill
            color={isRunning ? "bg-emerald-500" : "bg-red-500"}
            text={isRunning ? `${stats.fps || 0} FPS` : "OFFLINE"}
          />
        }
      />

      <div className={`flex min-h-0 flex-1 gap-4 ${expanded ? "flex-row" : "flex-col"}`}>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[24px] border border-zinc-200/70 bg-black">
          <img
            src={YOLO_STREAM_URL}
            alt="SAMP ROBO YOLO AI Feed"
            className="h-full w-full bg-black object-contain"
          />

          {!isRunning && (
            <div className="absolute inset-0 grid place-items-center bg-zinc-950 text-center text-white">
              <div>
                <Camera className="mx-auto mb-3 h-12 w-12 text-zinc-500" />
                <p className="text-base font-black">YOLO Feed Not Connected</p>
                <p className="mt-2 text-xs text-zinc-400">
                  Run{" "}
                  <span className="font-bold text-white">python3 main.py</span>{" "}
                  in Pose_Estimation
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Expected stream: {YOLO_STREAM_URL}
                </p>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white">
            <Video className="h-4 w-4 text-emerald-300" />
            CAM-01 / YOLOv8 Stream
          </div>

          <div className="absolute right-4 top-4 rounded-full bg-red-500 px-4 py-1.5 text-[10px] font-black text-white shadow-lg">
            LIVE
          </div>
        </div>

        <div className={`grid shrink-0 gap-3 ${expanded ? "w-[160px] grid-cols-1 grid-rows-3" : "grid-cols-3"}`}>
          <MetricBox label="Persons" value={stats.person_count ?? 0} />
          <MetricBox label="Objects" value={stats.object_count ?? 0} />
          <MetricBox
            label="FPS"
            value={stats.fps ? Number(stats.fps).toFixed(1) : "0.0"}
          />
        </div>
      </div>
    </section>
  );
}

function MetricBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/65 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black tracking-[-0.05em] text-zinc-950">
        {value}
      </p>
    </div>
  );
}

function LidarPanel() {
  const points = useMemo(() => {
    return Array.from({ length: 78 }).map((_, index) => {
      const angle = (index / 78) * Math.PI * 2;
      const radius = 23 + ((index * 17) % 74);

      return {
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius * 0.72,
        size: 2 + (index % 4),
      };
    });
  }, []);

  return (
    <section className="panel flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] p-5">
      <PanelHeader
        icon={ScanLine}
        title="LiDAR Monitoring"
        sub="360° point cloud scan and obstacle mapping"
        action={<StatusPill color="bg-blue-500" text="360° SCAN" />}
      />

      <div className="lidar-scene relative min-h-0 flex-1 overflow-hidden rounded-[24px] border border-zinc-200/70 bg-[#101416]">
        <div className="lidar-background" />
        <div className="lidar-glow" />

        <div className="lidar-ring lidar-ring-1" />
        <div className="lidar-ring lidar-ring-2" />
        <div className="lidar-ring lidar-ring-3" />
        <div className="lidar-ring lidar-ring-4" />

        <div className="lidar-sweep" />
        <div className="lidar-center-dot" />

        {points.map((point, index) => (
          <span
            key={index}
            className="lidar-point"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: `${point.size}px`,
              height: `${point.size}px`,
              animation: `pulseDot ${
                1.4 + (index % 5) * 0.22
              }s ease-in-out infinite`,
            }}
          />
        ))}

        <svg
          className="lidar-paths"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M12 66 C24 43, 35 44, 47 52 S69 72, 88 39"
            fill="none"
            stroke="rgba(52,211,153,0.95)"
            strokeWidth="0.9"
            strokeDasharray="4 4"
            style={{ animation: "moveTrack 4s linear infinite" }}
          />

          <path
            d="M18 78 C32 65, 47 68, 61 57 S76 46, 91 55"
            fill="none"
            stroke="rgba(96,165,250,0.9)"
            strokeWidth="0.8"
            strokeDasharray="3 3"
            style={{ animation: "moveTrack 5s linear infinite" }}
          />
        </svg>

        <div className="lidar-metrics grid grid-cols-3 gap-3 text-center">
          <DarkMetric label="Range" value="12.8m" />
          <DarkMetric label="Points" value="42k/s" />
          <DarkMetric label="Obstacles" value="07" />
        </div>
      </div>
    </section>
  );
}

function DarkMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
      <p className="text-[10px] font-semibold text-white/45">{label}</p>
      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}

function RoverRealtimePanel() {
  return (
    <section className="panel flex h-full w-full flex-col overflow-hidden rounded-[30px] px-5 py-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-white shadow-lg">
            <Activity className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <div>
            <h2 className="text-[16px] font-black leading-none tracking-[-0.04em] text-zinc-950">
              Rover Real-Time Info
            </h2>
            <p className="mt-1 text-[11px] font-medium leading-none text-zinc-500">
              Telemetry, compute, power, motor and communication status
            </p>
          </div>
        </div>

        <StatusPill text="LIVE STREAM" />
      </div>

      <div className="grid flex-1 grid-cols-6 gap-4">
        {roverStats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-white/60 bg-gradient-to-br from-white/90 to-white/50 p-3.5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-black/5 transition-transform group-hover:scale-150" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                  <Icon className="h-3.5 w-3.5 text-zinc-700" />
                </div>
                <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-sm">
                  {item.status}
                </span>
              </div>

              <div className="relative z-10 mt-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {item.label}
                </p>
                <p className="mt-0.5 text-2xl font-black tracking-[-0.04em] text-zinc-900">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}



function MissionNavigationPage() {
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
                Route planning, waypoint tracking, heading, ETA and autonomous
                navigation status
              </p>
            </div>
          </div>

          <StatusPill color="bg-amber-400" text="AUTONOMY ACTIVE" />
        </div>

        <div className="grid h-[calc(100%-72px)] grid-cols-[1.25fr_0.75fr] gap-5">
          <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/65 p-5">
            <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(0,0,0,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.08)_1px,transparent_1px)] [background-size:44px_44px]" />

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

            <div className="relative z-10 h-[calc(100%-70px)] overflow-hidden rounded-[24px] bg-white/60">
              <svg className="h-full w-full" viewBox="0 0 900 460">
                <rect
                  x="80"
                  y="70"
                  width="170"
                  height="80"
                  rx="18"
                  fill="#d4d4d8"
                />
                <rect
                  x="360"
                  y="95"
                  width="140"
                  height="70"
                  rx="18"
                  fill="#d4d4d8"
                />
                <rect
                  x="620"
                  y="75"
                  width="180"
                  height="90"
                  rx="18"
                  fill="#d4d4d8"
                />
                <rect
                  x="120"
                  y="300"
                  width="190"
                  height="90"
                  rx="20"
                  fill="#d4d4d8"
                />
                <rect
                  x="430"
                  y="285"
                  width="150"
                  height="80"
                  rx="18"
                  fill="#d4d4d8"
                />
                <rect
                  x="680"
                  y="290"
                  width="130"
                  height="80"
                  rx="18"
                  fill="#d4d4d8"
                />

                <path
                  d="M90 380 C180 250, 280 330, 365 210 S570 120, 760 255"
                  fill="none"
                  stroke="#18181b"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="18 18"
                />

                <circle cx="90" cy="380" r="18" fill="#22c55e" />
                <circle cx="365" cy="210" r="16" fill="#f59e0b" />
                <circle cx="760" cy="255" r="18" fill="#ef4444" />

                <text
                  x="65"
                  y="425"
                  fontSize="24"
                  fontWeight="800"
                  fill="#18181b"
                >
                  Start
                </text>
                <text
                  x="320"
                  y="190"
                  fontSize="24"
                  fontWeight="800"
                  fill="#18181b"
                >
                  Waypoint
                </text>
                <text
                  x="730"
                  y="305"
                  fontSize="24"
                  fontWeight="800"
                  fill="#18181b"
                >
                  Target
                </text>
              </svg>
            </div>
          </div>

          <div className="grid grid-rows-[1fr_1fr] gap-5">
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

function AiAssistantPage() {
  return (
    <section className="relative z-10 h-[calc(100vh-104px)] px-20 pb-6">
      <AiAssistantAnimation />
    </section>
  );
}

function MonitoringContent({ expandedView }) {
  if (expandedView === "ai") {
    return (
      <section className="relative z-10 flex h-[calc(100vh-104px)] flex-col px-20 pb-6">
        <div className="min-h-0 w-full flex-1">
          <AIFeedPanel expanded />
        </div>
      </section>
    );
  }

  if (expandedView === "lidar") {
    return (
      <section className="relative z-10 grid h-[calc(100vh-104px)] grid-rows-[minmax(0,1fr)_145px] gap-5 px-20 pb-6">
        <div className="min-h-0 w-full">
          <LidarPanel />
        </div>
        <RoverRealtimePanel />
      </section>
    );
  }

  return (
    <section className="relative z-10 grid h-[calc(100vh-104px)] grid-rows-[minmax(0,1fr)_145px] gap-5 px-20 pb-6">
      <div className="grid min-h-0 grid-cols-2 gap-5">
        <AIFeedPanel expanded={false} />
        <LidarPanel />
      </div>

      <RoverRealtimePanel />
    </section>
  );
}

export default function MonitoringDashboard({ onHome }) {
  const [activePanel, setActivePanel] = useState("monitoring");
  const [expandedView, setExpandedView] = useState("split");

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

          <div className="flex items-center gap-3 rounded-full border border-white/75 bg-white/70 px-4 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
            <StatusPill text="ROVER ONLINE" />
            <div className="h-6 w-px bg-zinc-300/70" />
            <button
              onClick={() => setExpandedView((p) => (p === "ai" ? "split" : "ai"))}
              className={`text-xs font-bold transition-colors ${
                expandedView === "ai"
                  ? "text-blue-500"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              AI FEED
            </button>
            <div className="h-6 w-px bg-zinc-300/70" />
            <button
              onClick={() => setExpandedView((p) => (p === "lidar" ? "split" : "lidar"))}
              className={`text-xs font-bold transition-colors ${
                expandedView === "lidar"
                  ? "text-blue-500"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              LiDAR 360°
            </button>
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
          <IconButton title="3D Rover Home" onClick={onHome}>
            <Grid2X2 className="h-4 w-4" />
          </IconButton>

          <IconButton
            title="AI + LiDAR Dashboard"
            active={activePanel === "monitoring"}
            onClick={() => setActivePanel("monitoring")}
          >
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
          <IconButton title="User">
            <UserRound className="h-4 w-4" />
          </IconButton>
        </aside>

        {activePanel === "monitoring" && <MonitoringContent expandedView={expandedView} />}
        {activePanel === "mission" && <MissionNavigationPage />}
        {activePanel === "assistant" && <AiAssistantPage />}
      </section>
    </main>
  );
}