import { createContext, useContext, useState } from "react";

const AiLoadingContext = createContext({
  aiLoading: false,
  setAiLoading: () => {},
});

// Provider — lifts aiLoading state to the app level so all pages can check it
export function AiLoadingProvider({ children }) {
  const [aiLoading, setAiLoading] = useState(false);
  return (
    <AiLoadingContext.Provider value={{ aiLoading, setAiLoading }}>
      {children}
    </AiLoadingContext.Provider>
  );
}

// eslint-disable-next-line react/only-export-components
export function useAiLoading() {
  return useContext(AiLoadingContext);
}
