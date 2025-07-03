// global.d.ts
interface Window {
    ethereum: any;
    pNames: string[];
    scores: number[];
    ranks: number[];
    rankCounter: number;
    playerScores: Map<string, number>;
    matchIndex: number;
    winners: string[];
    tournamentMatches: string[][];
    gameLoopId: number | null;
    gameRunning: boolean;
    hasLoadedGameScripts?: boolean;
//    sessionStorage: Storage;
    renderSubmit: () => void;
    showGameOptions: () => void;
    startPlayerVsPlayer: (p1: string, p2: string) => void;
    startPlayerVsAI: () => void;
    startTournament: () => void;
    updateTournamentBracket: () => void;
    startNextMatch: () => void;
    getPlayerName: (playerCount: number) => void;
    finalisePlayer: () => void;
  }
