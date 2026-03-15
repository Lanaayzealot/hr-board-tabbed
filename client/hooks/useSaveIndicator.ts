import { useState, useCallback } from "react";

export function useSaveIndicator() {
  const [isShowing, setIsShowing] = useState(false);
  const [message, setMessage] = useState("✓ Saved");
  const [isError, setIsError] = useState(false);

  const showSave = useCallback((msg = "✓ Saved") => {
    setMessage(msg);
    setIsError(false);
    setIsShowing(true);
    setTimeout(() => setIsShowing(false), 1500);
  }, []);

  const showError = useCallback((msg = "✕ Error") => {
    setMessage(msg);
    setIsError(true);
    setIsShowing(true);
    setTimeout(() => {
      setIsShowing(false);
      setIsError(false);
      setMessage("✓ Saved");
    }, 3000);
  }, []);

  return { isShowing, message, isError, showSave, showError };
}
