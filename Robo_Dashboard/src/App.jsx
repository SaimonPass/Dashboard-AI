import React, { useEffect, useState } from "react";
import HomePage from "./HomePage.jsx";
import MonitoringDashboard from "./MonitoringDashboard.jsx";
import LoadingScreen from "./LoadingScreen.jsx";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loadingExit, setLoadingExit] = useState(false);

  const [activeScreen, setActiveScreen] = useState("home");

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setLoadingExit(true);
    }, 4200);

    const finishTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <>
      {loading && <LoadingScreen exit={loadingExit} />}

      <div
        className={`app-content ${
          loading ? "app-content-hidden" : "app-content-visible"
        }`}
      >
        {activeScreen === "home" && (
          <HomePage
            onDashboard={() => setActiveScreen("dashboard")}
          />
        )}

        {activeScreen === "dashboard" && (
          <MonitoringDashboard
            onHome={() => setActiveScreen("home")}
          />
        )}
      </div>
    </>
  );
}