import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { enableAnalytics } from "./services/firebase";
import { AuthProvider } from "./context/AuthContext";
import { PillboxProvider } from "./context/PillboxContext";

enableAnalytics();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <PillboxProvider>
        <App />
      </PillboxProvider>
    </AuthProvider>
  </React.StrictMode>
);
