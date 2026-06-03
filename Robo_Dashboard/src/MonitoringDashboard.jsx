import React from "react";
import {
  BatteryCharging,
  Camera,
  Cpu,
  Database,
  Gauge,
  Grid2X2,
  Navigation,
  Radio,
  Settings,
  Signal,
  Thermometer,
  Zap,
} from "lucide-react";

function StatusDot({ color = "bg-emerald-400" }) {
  return <span className={`h-2 w-2 rounded-full ${color} animate-pulse`} />;
}

function TopBatteryStatus() {
  return (
    <div className="absolute left-1/2 top-5 z-50 -translate-x-1/2">
      <div className="battery-pill monitoring-battery-pill">
        <div className="flex items-center gap-3">
          <BatteryCharging className="h-4 w-4 text-emerald-300" />

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">
              Battery
            </p>
            <p className="text-[11px] font-black text-white">74%</p>
          </div>
        </div>

        <div className="battery-track">
          <div className="battery-fill" />
          <div className="battery-glow" />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <StatusDot />
          <span className="text-[11px] font-black text-white/75">
            ROVER ONLINE
          </span>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <StatusDot color="bg-cyan-400" />
          <span className="text-[11px] font-black text-white/75">
            AI ACTIVE
          </span>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <StatusDot color="bg-violet-400" />
          <span className="text-[11px] font-black text-white/75">
            LiDAR 360°
          </span>
        </div>
      </div>
    </div>
  );
}

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

function SideRail({ onHome }) {
  return (
    <nav className="fixed left-8 top-1/2 z-[999] flex -translate-y-1/2 flex-col gap-4">
      <IconButton title="Home" onClick={onHome}>
        <Grid2X2 className="h-4 w-4" />
      </IconButton>

      <IconButton title="AI + LiDAR Monitoring" active>
        <Radio className="h-4 w-4" />
      </IconButton>

      <IconButton title="Mission Navigation">
        <Navigation className="h-4 w-4" />
      </IconButton>

      <IconButton title="Rover System">
        <Cpu className="h-4 w-4" />
      </IconButton>
    </nav>
  );
}

function HeaderButton({ children, title }) {
  return (
    <button
      type="button"
      title={title}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white/75 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-white"
    >
      {children}
    </button>
  );
}

function OverlayInfoChip({ label, value }) {
  return (
    <div className="monitoring-overlay-chip">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TelemetryMetric({ icon: Icon, label, value, badge }) {
  return (
    <div className="telemetry-chip clean-telemetry-chip">
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <Icon className="h-4 w-4 text-white/30" />

          <span className="rounded-full bg-black/40 px-3 py-1 text-[8px] font-black text-white/80">
            {badge}
          </span>
        </div>

        <div className="mt-3">
          <p className="text-[9px] font-black uppercase tracking-[0.08em] text-white/35">
            {label}
          </p>

          <h3 className="mt-2 text-[24px] font-black leading-none tracking-[-0.05em] text-white">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

function AiFeedPanel() {
  return (
    <section className="dashboard-panel monitoring-card flex min-h-0 flex-col rounded-[28px] p-4">
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-400/10 text-cyan-100">
            <Camera className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-black tracking-[-0.04em] text-white">
              AI Feed Monitoring
            </h2>
            <p className="text-xs font-medium text-white/45">
              Live YOLOv8 object detection camera feed
            </p>
          </div>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-black text-white/65">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-rose-500" />
          OFFLINE
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[22px] border border-white/10 bg-[#03060d]">
        <div className="absolute right-4 top-4 rounded-full bg-rose-500 px-4 py-2 text-[10px] font-black text-white">
          LIVE
        </div>

        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <Camera className="mx-auto h-11 w-11 text-white/25" />

            <h3 className="mt-4 text-sm font-black text-white">
              YOLO Feed Not Connected
            </h3>

            <p className="mt-3 text-xs text-white/45">
              Run <span className="font-black text-white">python3 main.py</span>{" "}
              in Pose_Estimation
            </p>

            <p className="mt-1 text-xs text-white/25">
              Expected stream: http://172.30.4.40:5000/video_feed
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 rounded-full bg-black/45 px-4 py-2 text-xs font-black text-white">
          <span className="mr-2 inline-block h-2 w-3 rounded-sm border border-emerald-400" />
          CAM-01 / YOLOv8 Stream
        </div>

        <div className="absolute bottom-4 right-4 z-20 grid grid-cols-3 gap-3">
          <OverlayInfoChip label="Persons" value="0" />
          <OverlayInfoChip label="Objects" value="0" />
          <OverlayInfoChip label="FPS" value="0.0" />
        </div>
      </div>
    </section>
  );
}

function LidarPanel() {
  return (
    <section className="dashboard-panel monitoring-card flex min-h-0 flex-col rounded-[28px] p-4">
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-400/10 text-cyan-100">
            <Radio className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-black tracking-[-0.04em] text-white">
              LiDAR Monitoring
            </h2>
            <p className="text-xs font-medium text-white/45">
              360° point cloud scan and obstacle mapping
            </p>
          </div>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-black text-white/65">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-violet-500" />
          360° SCAN
        </div>
      </div>

      <div className="lidar-stage lidar-stage-fixed relative min-h-0 flex-1 overflow-hidden rounded-[22px] border border-emerald-400/20 bg-[#03100f]">
        <div className="lidar-bg-glow" />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 900 520"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="radarGlowFixed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#19f5c9" stopOpacity="0.42" />
              <stop offset="48%" stopColor="#0b6b5a" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#020712" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="dashGreenFixed" x1="0" x2="1">
              <stop offset="0%" stopColor="#20e6b0" />
              <stop offset="100%" stopColor="#23ffd0" />
            </linearGradient>

            <linearGradient id="dashBlueFixed" x1="0" x2="1">
              <stop offset="0%" stopColor="#6d8cff" />
              <stop offset="100%" stopColor="#9fb4ff" />
            </linearGradient>
          </defs>

          <rect width="900" height="520" fill="url(#radarGlowFixed)" />

          <g className="lidar-rings-fixed" transform="translate(470 240)">
            <circle r="54" />
            <circle r="104" />
            <circle r="158" />
            <circle r="220" />
          </g>

          <g className="lidar-sweep-fixed" transform="translate(470 240)">
            <line x1="0" y1="0" x2="0" y2="-228" />
            <circle r="11" />
          </g>

          <path
            className="lidar-path-green-fixed"
            d="M95 365 C165 265, 250 260, 335 310 C425 365, 520 360, 595 300 C665 245, 715 205, 790 120"
          />

          <path
            className="lidar-path-blue-fixed"
            d="M155 375 C250 315, 355 295, 465 250 C565 210, 665 205, 805 310"
          />

          <g className="lidar-points-fixed">
            {[
              [100, 105],
              [185, 150],
              [255, 92],
              [360, 135],
              [465, 85],
              [595, 122],
              [720, 105],
              [820, 185],
              [125, 260],
              [245, 320],
              [390, 255],
              [475, 245],
              [620, 275],
              [770, 380],
              [835, 425],
              [485, 430],
              [335, 425],
              [175, 405],
            ].map(([x, y], index) => (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={index % 4 === 0 ? 4.2 : index % 3 === 0 ? 3.2 : 2.4}
              />
            ))}
          </g>
        </svg>

        <div className="absolute bottom-4 left-4 z-20 grid grid-cols-3 gap-3">
          <OverlayInfoChip label="Range" value="12.8m" />
          <OverlayInfoChip label="Points" value="42k/s" />
          <OverlayInfoChip label="Obstacles" value="07" />
        </div>
      </div>
    </section>
  );
}

function TelemetryChart() {
  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-black text-white">Telemetry Stream</h3>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-white/35">
            CPU / TEMP / BATTERY
          </p>
        </div>

        <div className="flex items-center gap-4 text-[8px] font-black text-white/45">
          <span>
            <i className="mr-1 inline-block h-2 w-2 rounded-full bg-white" />
            CPU
          </span>
          <span>
            <i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />
            TEMP
          </span>
          <span>
            <i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
            BAT
          </span>
        </div>
      </div>

      <svg
        className="h-[118px] w-full"
        viewBox="0 0 740 138"
        preserveAspectRatio="none"
      >
        <g opacity="0.18">
          {[25, 52, 79, 106, 132].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="740"
              y2={y}
              stroke="white"
              strokeDasharray="8 10"
            />
          ))}

          {[120, 250, 380, 510, 640].map((x) => (
            <line
              key={x}
              x1={x}
              y1="0"
              x2={x}
              y2="138"
              stroke="white"
              strokeDasharray="8 10"
            />
          ))}
        </g>

        <polyline
          points="0,112 90,106 180,88 260,94 360,68 450,64 540,78 650,70 740,52"
          fill="none"
          stroke="white"
          strokeWidth="3"
        />

        <polyline
          points="0,128 120,120 240,112 360,102 500,99 620,105 740,99"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
        />

        <polyline
          points="0,35 120,41 250,39 370,44 520,46 650,48 740,42"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

function RoverInfoPanel() {
  return (
    <section className="dashboard-panel monitoring-bottom-card flex min-h-0 flex-col rounded-[28px] p-4">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-400/10 text-cyan-100">
            <Zap className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-black tracking-[-0.04em] text-white">
              Rover Real-Time Info
            </h2>
            <p className="mt-1 text-xs font-medium text-white/45">
              Telemetry, compute, power, motor and communication status
            </p>
          </div>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-black text-white/65">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
          LIVE
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[0.78fr_1.22fr] gap-5">
        <div className="grid min-h-0 grid-cols-3 grid-rows-2 gap-4">
          <TelemetryMetric icon={BatteryCharging} label="Battery" value="74%" badge="Stable" />
          <TelemetryMetric icon={Gauge} label="Speed" value="1.2 m/s" badge="Assist" />
          <TelemetryMetric icon={Cpu} label="CPU Load" value="61%" badge="AI Active" />
          <TelemetryMetric icon={Thermometer} label="Motor Temp" value="46°C" badge="Normal" />
          <TelemetryMetric icon={Signal} label="Signal" value="92%" badge="Online" />
          <TelemetryMetric icon={Database} label="Storage" value="38GB" badge="Logging" />
        </div>

        <TelemetryChart />
      </div>
    </section>
  );
}

export default function MonitoringDashboard({ onHome }) {
  return (
    <main className="monitoring-page relative h-screen w-screen overflow-hidden bg-[#030812] text-white obelisk-theme">
      <section className="clean-grid relative h-screen w-screen overflow-hidden">
        <div className="obelisk-background pointer-events-none absolute inset-0" />

        <header className="absolute left-0 right-0 top-0 z-50 flex h-[70px] items-center justify-between px-8">
          <div>
            <h1 className="text-xl font-black tracking-[0.18em] text-white">
              SAMP ROBO
            </h1>
            <p className="mt-1 text-xs font-semibold text-white/45">
              AI Feed • LiDAR Scan • Real-Time Rover Info
            </p>
          </div>

          <TopBatteryStatus />

          <div className="flex items-center gap-4">
            <HeaderButton title="Settings">
              <Settings className="h-4 w-4" />
            </HeaderButton>

            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-[8px] font-black leading-tight text-white shadow-xl"
            >
              SAMP
              <br />
              ROBO
            </button>
          </div>
        </header>

        <SideRail onHome={onHome} />

        <section className="absolute inset-x-0 bottom-0 top-[70px] z-10 px-[88px] pb-4">
          <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_285px] gap-4">
            <div className="grid min-h-0 grid-cols-2 gap-5">
              <AiFeedPanel />
              <LidarPanel />
            </div>

            <RoverInfoPanel />
          </div>
        </section>
      </section>
    </main>
  );
}