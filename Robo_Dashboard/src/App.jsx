import React, { useEffect, useState } from "react";
import HomePage from "./HomePage.jsx";
import MonitoringDashboard from "./MonitoringDashboard.jsx";
import LoadingScreen from "./LoadingScreen.jsx";

export default function App() {
  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4500);

    const removeTimer = setTimeout(() => {
      setLoading(false);
    }, 5200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {loading && <LoadingScreen fadeOut={fadeOut} />}

      <div className={`app-content ${loading ? "app-content-hidden" : "app-content-visible"}`}>
        {page === "dashboard" ? (
          <MonitoringDashboard onHome={() => setPage("home")} />
        ) : (
          <HomePage onDashboard={() => setPage("dashboard")} />
        )}
      </div>
    </>
  );
}