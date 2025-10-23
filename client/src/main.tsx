import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";

// Disable browser's scroll restoration FIRST - before anything else
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Immediate scroll to top - runs before any DOM rendering
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

// Force scroll on page show (handles back/forward cache)
window.addEventListener('pageshow', (event) => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});

// Force scroll on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});

// Force scroll after everything loads
window.addEventListener('load', () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});

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
