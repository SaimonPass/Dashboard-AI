import React from "react";

export default function ThinkingNeuron({ loading = false }) {
  return (
    <div className={`thinking-neuron-wrap ${loading ? "thinking-neuron-loading" : ""}`}>
      <div className="neuron-bg-glow" />

      <svg
        className="thinking-neuron-svg"
        viewBox="0 0 720 520"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="nodeGradient" cx="35%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="28%" stopColor="#cbd5ff" stopOpacity="1" />
            <stop offset="62%" stopColor="#7c3aed" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b0764" stopOpacity="1" />
          </radialGradient>

          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#818cf8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
          </linearGradient>

          <filter id="softGlow">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Back orbit curves */}
        <path
          className="neuron-orbit orbit-one"
          d="M162 270 C190 125, 520 98, 570 250 C625 420, 258 470, 162 270Z"
        />
        <path
          className="neuron-orbit orbit-two"
          d="M130 285 C245 150, 495 130, 592 285 C470 396, 260 420, 130 285Z"
        />
        <path
          className="neuron-orbit orbit-three"
          d="M245 120 C415 86, 550 180, 490 330 C410 450, 210 378, 245 120Z"
        />

        {/* Neural lines */}
        <g className="neuron-lines" filter="url(#softGlow)">
          <path d="M185 230 C255 175, 310 190, 365 238" />
          <path d="M365 238 C440 180, 505 198, 562 260" />
          <path d="M365 238 C325 310, 255 340, 178 322" />
          <path d="M365 238 C425 306, 495 335, 585 315" />
          <path d="M255 175 C310 120, 405 112, 468 162" />
          <path d="M255 340 C350 410, 462 395, 525 330" />
          <path d="M185 230 C160 275, 160 305, 178 322" />
          <path d="M562 260 C590 278, 600 298, 585 315" />
        </g>

        {/* Moving signal pulses */}
        <g className="signal-pulses">
          <circle className="signal signal-one" r="5" />
          <circle className="signal signal-two" r="4" />
          <circle className="signal signal-three" r="4.5" />
          <circle className="signal signal-four" r="3.8" />
        </g>

        {/* Nodes */}
        <g filter="url(#nodeGlow)">
          <circle className="neuron-node main-node" cx="365" cy="238" r="74" />

          <circle className="neuron-node node-a" cx="185" cy="230" r="22" />
          <circle className="neuron-node node-b" cx="255" cy="175" r="28" />
          <circle className="neuron-node node-c" cx="468" cy="162" r="24" />
          <circle className="neuron-node node-d" cx="562" cy="260" r="26" />
          <circle className="neuron-node node-e" cx="585" cy="315" r="18" />
          <circle className="neuron-node node-f" cx="525" cy="330" r="25" />
          <circle className="neuron-node node-g" cx="255" cy="340" r="24" />
          <circle className="neuron-node node-h" cx="178" cy="322" r="18" />
        </g>

        {/* small thinking dots */}
        <g className="thinking-dots">
          <circle cx="118" cy="160" r="3" />
          <circle cx="642" cy="156" r="3" />
          <circle cx="92" cy="350" r="3" />
          <circle cx="648" cy="382" r="3" />
          <circle cx="388" cy="62" r="2.6" />
          <circle cx="410" cy="448" r="2.8" />
        </g>
      </svg>
    </div>
  );
}