import React, { useState } from "react";
import GasDashboard from "./components/GasDashboard";
import LoadingScreen from "./components/LoadingScreen";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";

function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <ThemeProvider>
      <LanguageProvider>
        {!loadingComplete ? (
          <LoadingScreen onComplete={() => setLoadingComplete(true)} />
        ) : (
          <GasDashboard />
        )}
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;