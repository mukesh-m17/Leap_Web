import React from "react";
import GasDashboard from "./components/GasDashboard";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <GasDashboard />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;