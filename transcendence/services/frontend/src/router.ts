import { renderHome, renderScores, renderPlay } from "./main.js";


const app = document.getElementById("app");

export function navigate(path: string) {
  history.pushState({}, "", path);

  if (window.gameRunning) {
    window.gameRunning = false;
    if (window.gameLoopId !== null) {
      cancelAnimationFrame(window.gameLoopId);
      window.gameLoopId = null;
    }
  }

  renderRoute();
}

export function renderRoute() {
  if (!app) return;

  switch (window.location.pathname) {
    case "/play":
      renderPlay();
      break;

    case "/scores":
      renderScores();
      break;

    default:
      renderHome();
      break;
  }
}

window.onpopstate = () => {
  if (window.gameRunning) {
    window.gameRunning = false;
    if (window.gameLoopId !== null) {
      cancelAnimationFrame(window.gameLoopId);
    }
  }

  renderRoute();
};