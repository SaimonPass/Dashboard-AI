import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Battery,
  Bot,
  BrainCircuit,
  Camera,
  Cpu,
  Mic,
  Radio,
  ScanLine,
  Send,
  ShieldAlert,
  Sparkles,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from "lucide-react";

/*
  BASIC ROVER VOICE ASSISTANT IMPLEMENTATION

  What this file does:
  1. Keeps your existing AI orb animation style.
  2. Adds dashboard conversation UI.
  3. Supports browser mic for demo/testing.
  4. Parses basic rover commands locally.
  5. Can send commands to a Jetson-side bridge if you run rover_command_api.py.

  Default Jetson bridge:
  http://localhost:8010

  To change from browser console:
  localStorage.setItem("ROVER_API_BASE", "http://JETSON_IP:8010")
*/

const DEFAULT_API_BASE =
  localStorage.getItem("ROVER_API_BASE") || "http://localhost:8010";

const DEFAULT_MESSAGES = [
  {
    role: "assistant",
    text:
      "Hey sir, Rover voice assistant is online. I can understand basic rover commands like stop, move forward, turn left, turn right, status, and what do you see.",
    time: "Now",
  },
];

const SAMPLE_COMMANDS = [
  "System status",
  "What do you see?",
  "Move forward",
  "Move backward",
  "Turn left",
  "Turn right",
  "Start patrol",
  "Follow person",
  "Emergency stop",
];

const roverStatus = {
  battery: 76,
  camera: "Active",
  lidar: "Scanning",
  yolo: "Active",
  aiCore: "Basic Commands",
  mode: "Local Rover Voice Control",
  detection: "Person detected ahead",
  obstacle: "No critical obstacle",
  ros: "Waiting for Jetson bridge",
};

const MOVEMENT_ACTIONS = new Set([
  "MOVE_FORWARD",
  "MOVE_BACKWARD",
  "TURN_LEFT",
  "TURN_RIGHT",
  "START_PATROL",
  "FOLLOW_PERSON",
]);

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalize(text) {
  return String(text || "").toLowerCase().trim();
}

function parseRoverCommand(input) {
  const text = normalize(input);

  if (!text) {
    return {
      action: "NO_INPUT",
      state: "idle",
      requiresConfirmation: false,
      reply: "Sir, I did not receive any command. Please say that again.",
    };
  }

  if (
    text.includes("emergency") ||
    text.includes("stop") ||
    text.includes("halt") ||
    text.includes("freeze")
  ) {
    return {
      action: "EMERGENCY_STOP",
      state: "emergency",
      requiresConfirmation: false,
      reply: "Emergency stop activated, sir. Rover movement is locked.",
    };
  }

  if (text.includes("confirm") || text === "yes" || text === "okay" || text === "ok") {
    return {
      action: "CONFIRM",
      state: "executing",
      requiresConfirmation: false,
      reply: "Confirmed, sir.",
    };
  }

  if (text.includes("cancel") || text === "no") {
    return {
      action: "CANCEL",
      state: "idle",
      requiresConfirmation: false,
      reply: "Cancelled, sir.",
    };
  }

  if (text.includes("forward") || text.includes("go ahead")) {
    return {
      action: "MOVE_FORWARD",
      state: "waiting",
      requiresConfirmation: true,
      reply: "Should I move forward slowly, sir? Say confirm to continue.",
    };
  }

  if (text.includes("backward") || text.includes("reverse")) {
    return {
      action: "MOVE_BACKWARD",
      state: "waiting",
      requiresConfirmation: true,
      reply: "Should I move backward slowly, sir? Say confirm to continue.",
    };
  }

  if (text.includes("left")) {
    return {
      action: "TURN_LEFT",
      state: "waiting",
      requiresConfirmation: true,
      reply: "Should I turn left carefully, sir? Say confirm to continue.",
    };
  }

  if (text.includes("right")) {
    return {
      action: "TURN_RIGHT",
      state: "waiting",
      requiresConfirmation: true,
      reply: "Should I turn right carefully, sir? Say confirm to continue.",
    };
  }

  if (text.includes("patrol")) {
    return {
      action: "START_PATROL",
      state: "waiting",
      requiresConfirmation: true,
      reply: "Should I start patrol mode, sir? Say confirm to continue.",
    };
  }

  if (text.includes("follow")) {
    return {
      action: "FOLLOW_PERSON",
      state: "waiting",
      requiresConfirmation: true,
      reply: "Should I start person-following mode, sir? Say confirm to continue.",
    };
  }

  if (text.includes("battery") || text.includes("power")) {
    return {
      action: "BATTERY_STATUS",
      state: "speaking",
      requiresConfirmation: false,
      reply: `Battery is currently at ${roverStatus.battery} percent, sir.`,
    };
  }

  if (text.includes("system") || text.includes("status") || text.includes("health")) {
    return {
      action: "SYSTEM_STATUS",
      state: "speaking",
      requiresConfirmation: false,
      reply:
        `System status is good, sir. Camera is ${roverStatus.camera}, LiDAR is ${roverStatus.lidar}, YOLO feed is ${roverStatus.yolo}, and voice control is active.`,
    };
  }

  if (
    text.includes("what do you see") ||
    text.includes("vision") ||
    text.includes("detect") ||
    text.includes("camera")
  ) {
    return {
      action: "VISION_QUERY",
      state: "speaking",
      requiresConfirmation: false,
      reply:
        "Vision query received, sir. In demo mode, I can see one person ahead and no critical obstacle. Connect this with YOLO detections next.",
    };
  }

  if (text.includes("how are you")) {
    return {
      action: "SMALL_TALK",
      state: "speaking",
      requiresConfirmation: false,
      reply:
        "I am doing well, sir. Voice assistant is ready for basic rover commands.",
    };
  }

  if (text.includes("introduce") || text.includes("who are you")) {
    return {
      action: "INTRODUCTION",
      state: "speaking",
      requiresConfirmation: false,
      reply:
        "I am SAMP Robo voice assistant. I can listen, speak, show command status, and help control the rover through safe basic commands.",
    };
  }

  return {
    action: "UNKNOWN",
    state: "speaking",
    requiresConfirmation: false,
    reply:
      "Sorry sir, I did not understand that command. Try stop, move forward, turn left, turn right, system status, or what do you see.",
  };
}

export default function AiAssistantAnimation() {
  const stageRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [input, setInput] = useState("");
  const [assistantState, setAssistantState] = useState("idle");
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [browserSpeechSupported, setBrowserSpeechSupported] = useState(false);
  const [lastAction, setLastAction] = useState("SYSTEM_READY");
  const [pendingAction, setPendingAction] = useState(null);
  const [bridgeStatus, setBridgeStatus] = useState("checking");
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE);

  const stateLabel = useMemo(() => {
    switch (assistantState) {
      case "listening":
        return "LISTENING";
      case "thinking":
        return "THINKING";
      case "speaking":
        return "SPEAKING";
      case "executing":
        return "EXECUTING";
      case "waiting":
        return "WAITING";
      case "emergency":
        return "EMERGENCY";
      default:
        return "READY";
    }
  }, [assistantState]);

  const bridgeLabel = useMemo(() => {
    if (bridgeStatus === "online") return "Jetson Bridge Online";
    if (bridgeStatus === "offline") return "Demo Mode";
    return "Checking Bridge";
  }, [bridgeStatus]);

  useEffect(() => {
    checkBridge();
  }, [apiBase]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    setBrowserSpeechSupported(true);

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setAssistantState("listening");
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setAssistantState("idle");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore cleanup error
      }
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function checkBridge() {
    try {
      const response = await fetch(`${apiBase}/health`, { method: "GET" });
      if (!response.ok) throw new Error("Bridge offline");
      setBridgeStatus("online");
    } catch {
      setBridgeStatus("offline");
    }
  }

  const handleMouseMove = (event) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    stageRef.current.style.setProperty("--mx", x.toFixed(3));
    stageRef.current.style.setProperty("--my", y.toFixed(3));
  };

  const handleMouseLeave = () => {
    if (!stageRef.current) return;

    stageRef.current.style.setProperty("--mx", "0");
    stageRef.current.style.setProperty("--my", "0");
  };

  function speak(text) {
    if (!voiceEnabled) return;
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 0.95;
    utterance.volume = 1;

    utterance.onstart = () => setAssistantState("speaking");
    utterance.onend = () => {
      setAssistantState((prev) => {
        if (prev === "emergency" || prev === "waiting" || prev === "executing") {
          return prev;
        }
        return "idle";
      });
    };

    window.speechSynthesis.speak(utterance);
  }

  function addMessage(role, text) {
    setMessages((prev) => [
      ...prev,
      {
        role,
        text,
        time: getTime(),
      },
    ]);
  }

  async function sendCommandToBridge(commandText, action) {
    if (bridgeStatus !== "online") return null;

    const response = await fetch(`${apiBase}/api/voice-command`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        command: commandText,
        action,
      }),
    });

    if (!response.ok) {
      throw new Error(`Bridge error: ${response.status}`);
    }

    return response.json();
  }

  async function handleSend(customText) {
    const command = customText || input;
    if (!command.trim()) return;

    addMessage("user", command);
    setInput("");
    setAssistantState("thinking");

    setTimeout(async () => {
      const result = parseRoverCommand(command);

      // Emergency must be sent immediately.
      if (result.action === "EMERGENCY_STOP") {
        setPendingAction(null);
        setLastAction("EMERGENCY_STOP");
        setAssistantState("emergency");

        try {
          const bridgeResult = await sendCommandToBridge(command, "EMERGENCY_STOP");
          const reply = bridgeResult?.reply || result.reply;
          addMessage("assistant", reply);
          speak(reply);
        } catch {
          setBridgeStatus("offline");
          addMessage("assistant", result.reply);
          speak(result.reply);
        }

        return;
      }

      // Confirmation executes pending movement command.
      if (result.action === "CONFIRM") {
        if (!pendingAction) {
          const reply = "There is no pending rover action to confirm, sir.";
          setLastAction("NO_PENDING_ACTION");
          setAssistantState("speaking");
          addMessage("assistant", reply);
          speak(reply);
          return;
        }

        const confirmedAction = pendingAction;
        setPendingAction(null);
        setLastAction(confirmedAction);
        setAssistantState("executing");

        const defaultReply = `Confirmed, sir. Executing ${confirmedAction.replaceAll("_", " ").toLowerCase()}.`;

        try {
          const bridgeResult = await sendCommandToBridge(command, confirmedAction);
          const reply = bridgeResult?.reply || defaultReply;
          addMessage("assistant", reply);
          speak(reply);
        } catch {
          setBridgeStatus("offline");
          addMessage("assistant", `${defaultReply} Jetson bridge is offline, so this is dashboard demo mode.`);
          speak(`${defaultReply} Jetson bridge is offline, so this is dashboard demo mode.`);
        }

        return;
      }

      if (result.action === "CANCEL") {
        setPendingAction(null);
        setLastAction("CANCEL");
        setAssistantState("idle");
        addMessage("assistant", result.reply);
        speak(result.reply);
        return;
      }

      if (result.requiresConfirmation && MOVEMENT_ACTIONS.has(result.action)) {
        setPendingAction(result.action);
        setLastAction(`PENDING_${result.action}`);
        setAssistantState("waiting");
        addMessage("assistant", result.reply);
        speak(result.reply);
        return;
      }

      setLastAction(result.action);
      setAssistantState(result.state);

      // Non-movement commands can be sent to Jetson bridge if online.
      try {
        const bridgeResult = await sendCommandToBridge(command, result.action);
        const reply = bridgeResult?.reply || result.reply;
        addMessage("assistant", reply);
        speak(reply);
      } catch {
        if (bridgeStatus === "online") setBridgeStatus("offline");
        addMessage("assistant", result.reply);
        speak(result.reply);
      }
    }, 350);
  }

  function handleMic() {
    if (!browserSpeechSupported || !recognitionRef.current) {
      const msg =
        "Mic recognition is not supported in this browser. You can still type commands and I will respond.";
      addMessage("assistant", msg);
      speak(msg);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setAssistantState("idle");
      return;
    }

    recognitionRef.current.start();
  }

  function handleEmergencyStop() {
    handleSend("Emergency stop");
  }

  function updateApiBase(value) {
    setApiBase(value);
    localStorage.setItem("ROVER_API_BASE", value);
  }

  return (
    <div className="panel relative h-full overflow-hidden rounded-[30px] p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.10),transparent_28%),radial-gradient(circle_at_80%_78%,rgba(124,58,237,0.24),transparent_35%)]" />

      <div className="relative z-10 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-cyan-100 shadow-[0_0_35px_rgba(34,211,238,0.20)]">
            <BrainCircuit className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-black tracking-[-0.04em] text-white">
              AI Assistant Core
            </h2>
            <p className="text-xs font-medium text-white/45">
              Basic local rover command assistant for Jetson deployment
            </p>
          </div>
        </div>

        <div
          className={`rounded-full border px-4 py-1 text-xs font-black shadow-[0_0_28px_rgba(34,211,238,0.16)] ${
            assistantState === "emergency"
              ? "border-red-400/40 bg-red-500/15 text-red-100"
              : assistantState === "listening"
              ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
              : assistantState === "waiting"
              ? "border-amber-300/30 bg-amber-400/10 text-amber-100"
              : "border-cyan-300/25 bg-cyan-400/10 text-cyan-100"
          }`}
        >
          {stateLabel}
        </div>
      </div>

      <div className="relative z-10 grid h-[calc(100%-118px)] grid-cols-[minmax(320px,0.9fr)_minmax(380px,1.1fr)] gap-4 max-xl:h-auto max-xl:grid-cols-1">
        <div
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="grok-ai-stage relative min-h-[420px] overflow-hidden rounded-[26px] border border-white/10 bg-black/30"
        >
          <div className="grok-aurora" />
          <div className="grok-deep-grid" />
          <div className="grok-noise" />
          <div className="grok-stars" />

          <div className="grok-core-wrap">
            <div className="grok-shadow-core" />

            <div className="grok-scan-ring grok-scan-one" />
            <div className="grok-scan-ring grok-scan-two" />
            <div className="grok-scan-ring grok-scan-three" />

            <div className="grok-orbit-system">
              <div className="grok-energy-beam beam-one" />
              <div className="grok-energy-beam beam-two" />
              <div className="grok-energy-beam beam-three" />

              <div className="grok-main-core">
                <div className="grok-core-inner" />
                <div className="grok-core-shine" />
                <div className="grok-core-liquid-reflect" />
              </div>

              <div className="grok-jelly-node node-a"><span /></div>
              <div className="grok-jelly-node node-b"><span /></div>
              <div className="grok-jelly-node node-c"><span /></div>
              <div className="grok-jelly-node node-d"><span /></div>
              <div className="grok-jelly-node node-e"><span /></div>
              <div className="grok-jelly-node node-f"><span /></div>
            </div>

            <div className="grok-core-label">
              <Sparkles className="h-4 w-4" />
              {assistantState === "listening"
                ? "Listening To Command"
                : assistantState === "thinking"
                ? "Parsing Rover Intent"
                : assistantState === "speaking"
                ? "Speaking Response"
                : assistantState === "waiting"
                ? "Waiting Confirmation"
                : assistantState === "emergency"
                ? "Emergency Lock Active"
                : "Basic Command Core Online"}
            </div>
          </div>

          <div className="grok-side-readout left-readout">
            <span>VOICE MATRIX</span>
            <strong>{isListening ? "LISTENING" : "ACTIVE"}</strong>
          </div>

          <div className="grok-side-readout right-readout">
            <span>LAST ACTION</span>
            <strong>{lastAction}</strong>
          </div>

          <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3">
            <MiniReadout icon={Battery} label="Battery" value={`${roverStatus.battery}%`} />
            <MiniReadout icon={bridgeStatus === "online" ? Wifi : WifiOff} label="Bridge" value={bridgeLabel} />
          </div>
        </div>

        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-black/25 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-400/10 text-cyan-100">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Rover Voice Commands
                </h3>
                <p className="text-xs text-white/40">
                  Basic commands: stop, forward, backward, left, right, status
                </p>
              </div>
            </div>

            <button
              onClick={() => setVoiceEnabled((prev) => !prev)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition hover:bg-white/[0.10]"
              title="Toggle dashboard voice output"
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
            <input
              value={apiBase}
              onChange={(event) => updateApiBase(event.target.value)}
              className="min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-xs text-white outline-none placeholder:text-white/30 focus:border-cyan-300/30"
              placeholder="Jetson API URL, example: http://192.168.1.20:8010"
            />
            <button
              onClick={checkBridge}
              className="rounded-2xl border border-cyan-300/15 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-50 transition hover:bg-cyan-400/20"
            >
              Check
            </button>
          </div>

          <div className="flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex flex-col gap-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl border px-4 py-3 ${
                      message.role === "user"
                        ? "rounded-br-md border-cyan-300/20 bg-cyan-500/20 text-cyan-50"
                        : "rounded-bl-md border-white/10 bg-white/[0.07] text-white"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <span className="mt-2 block text-[10px] text-white/35">
                      {message.time}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {SAMPLE_COMMANDS.map((command) => (
              <button
                key={command}
                onClick={() => handleSend(command)}
                className="shrink-0 rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-50 transition hover:bg-cyan-400/20"
              >
                {command}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-[auto_1fr_auto] gap-2 max-sm:grid-cols-1">
            <button
              onClick={handleMic}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                isListening
                  ? "border-emerald-300/30 bg-emerald-400/20 text-emerald-50 shadow-[0_0_30px_rgba(16,185,129,0.18)]"
                  : "border-white/10 bg-white/[0.07] text-white/75 hover:bg-white/[0.10]"
              }`}
            >
              <Mic className="h-4 w-4" />
              {isListening ? "Listening" : "Mic"}
            </button>

            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSend();
              }}
              placeholder="Type command... e.g. move forward"
              className="min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-300/30"
            />

            <button
              onClick={() => handleSend()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>

          {!browserSpeechSupported && (
            <p className="mt-2 text-xs font-medium text-amber-200/80">
              Browser mic recognition may not be supported here. Typed commands will still work. For real rover mic, run the Jetson ROS2 voice node.
            </p>
          )}

          {pendingAction && (
            <p className="mt-2 rounded-2xl border border-amber-300/15 bg-amber-400/10 px-4 py-2 text-xs font-bold text-amber-100">
              Pending action: {pendingAction}. Say or type confirm to execute, or cancel to reject.
            </p>
          )}

          <button
            onClick={handleEmergencyStop}
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-red-300/20 bg-red-500/15 px-4 py-3 text-sm font-black text-red-100 transition hover:bg-red-500/25"
          >
            <ShieldAlert className="h-4 w-4" />
            Emergency Stop
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <AssistantStatus icon={ScanLine} label="LiDAR" value={roverStatus.lidar} />
        <AssistantStatus icon={Radio} label="YOLO Feed" value={roverStatus.yolo} />
        <AssistantStatus icon={Cpu} label="AI Core" value={roverStatus.aiCore} />
      </div>
    </div>
  );
}

function MiniReadout({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-xl">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-cyan-400/10 text-cyan-100">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-wide text-white/35">
          {label}
        </p>
        <p className="text-xs font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function AssistantStatus({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.065] px-4 py-3 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-cyan-400/10 text-cyan-100">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-wide text-white/35">
          {label}
        </p>
        <p className="text-sm font-black text-white">{value}</p>
      </div>
    </div>
  );
}
