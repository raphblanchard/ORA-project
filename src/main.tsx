
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import App from "./app/App.tsx";
import LandingPage from "./app/LandingPage.tsx";
import "aframe";
import "./styles/index.css";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ position: "relative", width: "100%", minHeight: "100vh" }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/vr" element={<App />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AnimatedRoutes />
  </BrowserRouter>
);
