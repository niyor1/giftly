import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Force reflow so the fade-in animation replays on every route change
    setVisible(false);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  return (
    <div
      className="animate-fade-in"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease-out",
      }}
    >
      {children}
    </div>
  );
}
