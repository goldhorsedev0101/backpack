import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";

// Disable browser's scroll restoration to allow manual control
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Add global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent the default browser behavior (like showing console error)
  event.preventDefault();
});

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

createRoot(document.getElementById("root")!).render(<App />);
