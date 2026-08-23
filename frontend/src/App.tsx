import React from "react";
import { LandingPage } from "./components/landingPage";

export default function App() {
  const handleGetStarted = () => {
    // Placeholder handler until the Auth Modal / Router is implemented
    console.log("GET STARTED clicked");
  };

  return <LandingPage onGetStarted={handleGetStarted} />;
}
