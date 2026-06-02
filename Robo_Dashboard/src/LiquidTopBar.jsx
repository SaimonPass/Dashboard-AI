import React, { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Mic, Radio } from "lucide-react";

export default function LiquidTopBar({
  activePanel,
  setActivePanel,
  variant = "home",
}) {
  const barRef = useRef(null);
  const buttonRefs = useRef({});
  const [activeStyle, setActiveStyle] = useState({
    left: 6,
    width: 150,
  });

  const items = useMemo(() => {
    return [
      {
        key: variant === "dashboard" ? "monitoring" : "home",
        label: "Office Mode",
        icon: Radio,
      },
      {
        key: "mission",
        label: "Learning Mode",
        icon: BookOpen,
      },
      {
        key: variant === "dashboard" ? "assistant" : "voice",
        label: "Voice Assistant",
        icon: Mic,
      },
    ];
  }, [variant]);

  useEffect(() => {
    const activeButton = buttonRefs.current[activePanel];
    const bar = barRef.current;

    if (!activeButton || !bar) return;

    const buttonRect = activeButton.getBoundingClientRect();
    const barRect = bar.getBoundingClientRect();

    setActiveStyle({
      left: buttonRect.left - barRect.left,
      width: buttonRect.width,
    });
  }, [activePanel, items]);

  return (
    <div ref={barRef} className="real-liquid-glass-bar">
      <div
        className="real-liquid-active-wrap"
        style={{
          width: `${activeStyle.width}px`,
          transform: `translateX(${activeStyle.left}px)`,
        }}
      >
        <div className="real-liquid-active-main" />
      </div>

      <div className="real-liquid-buttons">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.key;

          return (
            <button
              key={item.key}
              ref={(element) => {
                buttonRefs.current[item.key] = element;
              }}
              type="button"
              onClick={() => setActivePanel(item.key)}
              className={`real-liquid-button ${
                isActive ? "real-liquid-button-active" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}