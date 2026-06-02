import React from "react";

export default function LoadingScreen({ exit = false }) {
  return (
    <main
      className={`loading-screen fixed inset-0 z-[9999] overflow-hidden bg-[#02050b] ${
        exit ? "loading-screen-exit" : ""
      }`}
    >
      <div className="premium-loader-bg" />
      <div className="premium-loader-stars" />

      <div className="premium-loader-center">
        <div className="premium-orb-scene">
          <div className="premium-orb-glow" />

          <div className="premium-orbit premium-orbit-main" />
          <div className="premium-orbit premium-orbit-soft premium-orbit-soft-one" />
          <div className="premium-orbit premium-orbit-soft premium-orbit-soft-two" />

          <div className="premium-ring premium-ring-back" />

          <div className="premium-planet">
            <div className="premium-planet-top-light" />
            <div className="premium-planet-shine" />
            <div className="premium-planet-small-shine" />
          </div>

          <div className="premium-ring premium-ring-front" />
        </div>
      </div>
    </main>
  );
} 