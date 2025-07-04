import { navigate, renderRoute } from "./router.js";
// @ts-ignore
import { connectWallet, submitScores, fetchScoresFromBlockchain, getLatestTournamentID} from "./contract.js";
//import './styles.css';

declare global {
  interface Window {
    pNames: string[];
    scores: number[];
    ranks: number[];
    playerScores: Map<string, number>;
    renderSubmit: () => void;
  }
}

const app = document.getElementById("app");

export async function renderHome() {
  if (!app) return;

  const tournamentID = await fetchDBTournamentID();
  console.log(`TournamentID: ${tournamentID}`);
  if (tournamentID <= 0) {
    const latestID = await getLatestTournamentID();
    console.log(`Latest ID: ${latestID}`);
    if (latestID !== null) {
      const newID = latestID + 1;
      setDBTournamentId(newID);
    } else {
      console.error("Failed to set tournament ID: latestID is null");
    }
  }

  if (window.location.pathname === "/play") {
    renderPlay();
    return;
  } else if (window.location.pathname === "/scores") {
    renderScores();
    return;
  }
  app.innerHTML = `

    <div class="flex flex-col items-center gap-4 mt-10">
      <p class="text-white text-2xl">PLAY: Starts the game</p>
      <button id="play-btn" class="bg-blue-500 text-white px-4 py-2 rounded">PLAY</button>
      <p class="text-white text-2xl">SCORES: View previous tournament's scores</p>
      <button id="scores-btn" class="bg-green-500 text-white px-4 py-2 rounded">SCORES</button>
    </div>
  `;

  document.getElementById("play-btn")?.addEventListener("click", () => navigate("/play"));
  document.getElementById("scores-btn")?.addEventListener("click", () => navigate("/scores"));
}

export async function setDBTournamentId(tournamentId: number): Promise<void> {
  try {
      const response = await fetch('https://localhost:3001/set-tournament-id', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tournament_id: tournamentId }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          console.error('Error setting tournament ID:', errorData.error);
          return;
      }

      const data = await response.json();
      console.log(data.message); // Tournament ID set to X
  } catch (error) {
      console.error('Network or server error:', error);
  }
}

async function loadGamePage() {
  try {
    const response = await fetch("/public/pong_gameAll.html");
    if (!response.ok) {
      throw new Error(`Failed to load: ${response.status}`);
    }
    const gameContent = await response.text();
    let gameContainer = document.getElementById("game-container");

    if (!gameContainer) {
      gameContainer = document.createElement("div");
      gameContainer.id = "game-container";
      gameContainer.className = "h-full w-full max-w-[100vw] max-h-[100vh] flex flex-col items-center justify-center scale-[min(1,100vw/1280,100vh/720)] pb-4";
      document.getElementById("app")?.appendChild(gameContainer); // Append to #app if that's your main root
    }

    gameContainer.innerHTML = `
      <div class="w-[1280px] h-[720px] relative">
        ${gameContent}
      </div>
    `;
/*
    const scripts = [
      "/dist/game/js/pong_game.js",
      "/dist/game/js/tournament_signup.js",
      "/dist/game/js/tournament_match.js"
    ];

    if (!window.hasLoadedGameScripts) {
      window.hasLoadedGameScripts = false;

      // Wait for all scripts to load
      await Promise.all(
        scripts.map(
          (src) =>
            new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = src;
              script.defer = true;
              script.onload = () => {
                console.log(`${src} loaded`);
                resolve(true);
              };
              script.onerror = () => {
                console.error(`Failed to load ${src}`);
                reject(new Error(`Failed to load ${src}`));
              };
              document.body.appendChild(script);
            })
        )
      );

      window.hasLoadedGameScripts = true;
    }
*/
    // Now it's safe to call
    if (!window.gameRunning && typeof window.showGameOptions === "function") {
      window.showGameOptions();
    }

  } catch (error) {
    console.error("Error loading game:", error);
  }
}

/*async function loadGamePage() {
  try {
    const response = await fetch("/public/pong_gameAll.html");
    if (!response.ok) {
      throw new Error(`Failed to load: ${response.status}`);
    }
    const gameContent = await response.text();
    const gameContainer = document.getElementById("game-container");

    if (!gameContainer) {
      console.error("No element with ID 'game-container' found.");
      return;
    }

    gameContainer.innerHTML = `
      <div class="w-[1280px] h-[720px] relative">
        ${gameContent}
      </div>
    `;

    const scripts = [
      "/dist/game/js/pong_game.js",
      "/dist/game/js/tournament_signup.js",
      "/dist/game/js/tournament_match.js"
    ];

    // Check if scripts have been loaded before using sessionStorage
    if (sessionStorage.getItem("gameScriptsLoaded") !== "true") {
      // Scripts have not been loaded before, so load them
      await Promise.all(
        scripts.map(
          (src) =>
            new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = src;
              script.defer = true;
              script.onload = () => {
                console.log(`${src} loaded`);
                resolve(true);
              };console.log
              script.onerror = () => {
                console.error(`Failed to load ${src}`);
                reject(new Error(`Failed to load ${src}`));
              };
              document.body.appendChild(script);
            })
        )
      );

      // Mark that the scripts are loaded in sessionStorage
      sessionStorage.setItem("gameScriptsLoaded", "true");
    }

    // Now it's safe to call
    if (!window.gameRunning && typeof window.showGameOptions === "function") {
      window.showGameOptions();
    }

  } catch (error) {
    console.error("Error loading game:", error);
  }
}*/




// Dynamically load each script and append it to the document

function stopGame() {
  window.gameRunning = false;
  if (window.gameLoopId !== null) {
    console.log("StopGame function called");
    cancelAnimationFrame(window.gameLoopId); // Stop the game loop
    window.gameLoopId = null; // Reset the game loop ID
    console.log("Game loop stopped.");
  }
}

export function renderPlay() {
  window.ranks = [];
  window.pNames = [];
  window.scores = [];
  window.playerScores = new Map();
  if (!app) return;
  app.innerHTML = `
    <h1>Play Game</h1>
    <div class="h-screen flex mb-4 gap-4 mt-10">
        <button id="home-btn" class="bg-blue-500 text-white px-4 py-2 mx-2 rounded">HOME</button>
        <button id="scores-btn" class="bg-green-500 text-white px-4 py-2 mx-2 rounded">SCORES</button>
    </div>
    <div id="game-container" class="h-full w-full max-w-[100vw] max-h-[100vh] flex flex-col items-center justify-center scale-[min(1,100vw/1280,100vh/720)] pb-4"></div>
`;

  loadGamePage(); // Fetch and load the game content
  document.getElementById("home-btn")?.addEventListener("click", () => {
    stopGame();
    navigate("/")
  });
  document.getElementById("scores-btn")?.addEventListener("click", () => {
    stopGame();
    navigate("/scores")
  });
}

export async function renderScores() {
  if (!app) return;
  app.innerHTML = `
    <div class="p-4">
      <div class="flex justify-between gap-4 mb-10">
        <button id="play-btn" class="bg-blue-500 text-white px-4 py-2 rounded">PLAY</button>
        <button id="home-btn" class="bg-green-500 text-white px-4 py-2 rounded">HOME</button>
      </div>
      <h1 class="text-white text-2xl font-bold mb-4">Tournament Scores</h1>
      <p id="loading" class="text-red-700">Fetching latest scores...</p>
      <table id="scoresTable" class="w-full border-collapse border border-gray-300 hidden">
        <thead>
          <tr class="bg-gray-200">
            <th class="border border-gray-300 px-4 py-2">Rank</th>
            <th class="border border-gray-300 px-4 py-2">Alias</th>
            <th class="border border-gray-300 px-4 py-2">Score</th>
          </tr>
        </thead>
        <tbody id="scoresBody"></tbody>
      </table>
    </div>
  `;
  
  const tournamentID = await fetchDBTournamentID();
  const scores = await getScores(tournamentID);
  
  if (scores.length === 0) {
    app.innerHTML += `<p>No scores found for this tournament.</p>`;
    return;
  }

  // Now, render the scores
  const scoresBody = document.getElementById("scoresBody");
  if (scoresBody) {
    // Always clear first
    scoresBody.innerHTML = "";
  
    // Then populate
    scoresBody.innerHTML = scores
      .map(({ rank, alias, score }) => `
        <tr>
          <td class="border border-gray-300 text-white p-2">${rank}</td>
          <td class="border border-gray-300 text-white p-2">${alias}</td>
          <td class="border border-gray-300 text-white p-2">${score}</td>
        </tr>
      `)
      .join("");
  }
  
  
  // Hide the loading text and display the table
  document.getElementById("loading")?.classList.add("hidden");
  document.getElementById("scoresTable")?.classList.remove("hidden");
  
  document.getElementById("play-btn")?.addEventListener("click", () => navigate("/play"));
  document.getElementById("home-btn")?.addEventListener("click", () => navigate("/"));
}

async function getScores(tournamentID: number) {
  try {
    const prevID: number = tournamentID - 1;
    const scores = await fetchScoresFromBlockchain(prevID);
    return scores;
  } catch (error) {
    console.error("Error fetching scores:", error);
    return [];
  }
}


//post-game submit score screen
export async function renderSubmit() {
  if (!app) return;
  const tournamentID = await fetchDBTournamentID();
  //const tournamentID = 2;
  app.innerHTML = `
    <div class="flex flex-col items-center gap-4 mt-10">
      <h1 class="text-white text-2xl">Submit Score</h1>
      <div class="flex flex-col items-center space-y-4">
        <button id="connect-btn" class="px-4 py-2 bg-blue-500 text-white rounded">Connect Wallet</button>
        <p id="wallet-address" class="text-gray-600"></p>
      </div>
      <button id="home-btn" class="bg-blue-500 text-white px-4 py-2 rounded">HOME</button>
      <button id="scores-btn" class="bg-green-500 text-white px-4 py-2 rounded">SCORES</button>
    </div>
    <div id="statusMessage"></div>
    <button id="submit-btn" class="bg-purple-500 text-white px-4 py-2 rounded hidden">Submit Scores</button>
  `;
  console.log("Ranks:", window.ranks);
  console.log("Player Names:", window.pNames);
  console.log("Scores:", window.scores);

  const connectBtn = document.getElementById("connect-btn")!;
  const submitBtn = document.getElementById("submit-btn")! as HTMLButtonElement;
  const walletAddressElem = document.getElementById("wallet-address")!;

  connectBtn.addEventListener("click", async () => {
    if (connectBtn.textContent === "Disconnect") {
      // Handle disconnect
      walletAddressElem.textContent = "";
      connectBtn.textContent = "Connect Wallet";
      submitBtn.classList.add("hidden");
      return;
    }

    // Handle connect
    const address = await connectWallet();
    if (address) {
      walletAddressElem.textContent = `Connected: ${address}`;
      connectBtn.textContent = "Disconnect";
      submitBtn.classList.remove("hidden");
    }
  });    
  document.getElementById("home-btn")?.addEventListener("click", () => navigate("/"));
  document.getElementById("scores-btn")?.addEventListener("click", () => navigate("/scores"));
  /*const data = contract.interface.encodeFunctionData("submitScores", [
    123, window.ranks, window.pNames, window.scores
]);
console.log("🛠️ Encoded TX Data:", data);*/
submitBtn.addEventListener("click", async () => {
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";
  submitBtn.classList.add("opacity-50", "cursor-not-allowed");

  try {
    await submitScores(tournamentID, window.ranks, window.pNames, window.scores);

    // If successful, hide the button
    submitBtn.classList.add("hidden");
    document.getElementById("statusMessage")!.innerHTML =
      `<p class="text-green-500 mt-4">✅ Score submitted successfully!</p>`;
  } catch (err) {
    console.error("Error submitting scores:", err);
    document.getElementById("statusMessage")!.innerHTML =
      `<p class="text-red-500 mt-4">❌ Failed to submit scores. Please try again.</p>`;

    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Scores";
    submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
  }
});

}
window.renderSubmit = renderSubmit;

export async function fetchDBTournamentID(): Promise<number> {
  // Replace with actual logic to fetch from your DB
   try{
     const response = await fetch("/tournament-id");
     if (!response.ok)
     {
       throw new Error(`Failed to fetch tournament ID: ${response.status}`);
     }
     const data = await response.json();
     return data.tournament_id;
   }
   catch (error) {
     console.error("Error fetching tournament ID:", error);
     return -1; // Fallback to a default ID
   }
}


renderHome();

