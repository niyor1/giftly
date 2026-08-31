import { useEffect, useState } from "react";
import { X, CheckCircle, Copy } from "lucide-react";

const toastConfig = {
  success: { icon: CheckCircle, bg: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" },
  info: { icon: Copy, bg: "bg-sky-500/20 border-sky-500/30 text-sky-400" },
};

export default function Toast({ message, type = "success", onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  const { icon: Icon, bg } = toastConfig[type] || toastConfig.info;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 inset-x-4 sm:bottom-6 sm:right-6 sm:left-auto sm:w-auto z-[100] flex items-center gap-3 rounded-xl border px-5 py-4 text-sm font-medium shadow-2xl transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${bg}`}
    >
      <Icon size={18} className="flex-shrink-0" />
      <span>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onDismiss, 300);
        }}
        className="ml-2 rounded-full p-1 hover:bg-white/10"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
