import React, { useState, useEffect } from "react";

export function SaveIndicator() {
  const [isShowing, setIsShowing] = useState(false);
  const [message, setMessage] = useState("✓ Saved");
  const [isError, setIsError] = useState(false);

  // Listen for custom save events
  useEffect(() => {
    const handleSave = (e: CustomEvent) => {
      setMessage(e.detail.message || "✓ Saved");
      setIsError(e.detail.isError || false);
      setIsShowing(true);
      const timeout = setTimeout(() => {
        setIsShowing(false);
        if (e.detail.isError) {
          setIsError(false);
          setMessage("✓ Saved");
        }
      }, e.detail.isError ? 3000 : 1500);
      return () => clearTimeout(timeout);
    };

    window.addEventListener("save-event" as any, handleSave);
    return () => window.removeEventListener("save-event" as any, handleSave);
  }, []);

  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold transition-opacity z-50 ${
        isShowing ? "opacity-100" : "opacity-0 pointer-events-none"
      } ${
        isError
          ? "bg-destructive text-destructive-foreground"
          : "bg-accent-green text-white"
      }`}
    >
      {message}
    </div>
  );
}
