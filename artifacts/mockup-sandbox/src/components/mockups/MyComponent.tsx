import React, { useState, useEffect, useRef } from "react";
import Project1Goodies from "./Project1Goodies";
import Project2Anniversary from "./Project2Anniversary";

export default function MainApp() {
  // Check URL param ?app=anniversary or ?app=goodies
  const [activeApp, setActiveApp] = useState<"goodies" | "anniversary">(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("app") === "anniversary") return "anniversary";
      return "goodies";
    } catch {
      return "goodies";
    }
  });

  const switchApp = (mode: "goodies" | "anniversary") => {
    setActiveApp(mode);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("app", mode);
      window.history.pushState({}, "", url.toString());
    } catch (e) {
      console.log("Could not update URL", e);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Top Floating App Switcher Navigation Bar */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-full border border-amber-400/40 shadow-2xl">
        <button
          onClick={() => switchApp("goodies")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
            activeApp === "goodies"
              ? "bg-amber-500 text-rose-950 shadow-md"
              : "text-amber-200 hover:bg-amber-400/20"
          }`}
        >
          <span>📦</span>
          <span>Project 1: Care Package</span>
        </button>

        <button
          onClick={() => switchApp("anniversary")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
            activeApp === "anniversary"
              ? "bg-amber-500 text-rose-950 shadow-md"
              : "text-amber-200 hover:bg-amber-400/20"
          }`}
        >
          <span>💍</span>
          <span>Project 2: Engagement Anniversary</span>
        </button>
      </div>

      {/* Render Selected App */}
      <div className="pt-10">
        {activeApp === "goodies" ? <Project1Goodies /> : <Project2Anniversary />}
      </div>
    </div>
  );
}
