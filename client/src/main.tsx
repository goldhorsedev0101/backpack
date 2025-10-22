import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";

// Force scroll to top on page load/refresh
window.scrollTo(0, 0);

// Disable browser's scroll restoration to allow manual control
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Force scroll on page show (handles back/forward cache)
window.addEventListener('pageshow', () => {
  window.scrollTo(0, 0);
});

// Force scroll on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
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
