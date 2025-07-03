//@ts-check

function startTournamentSequence(playerNames: string[]) {
    console.log('Tournament Sequence started:', playerNames);
    // Reset variables
    window.matchIndex = 0;
    window.winners = [];
    window.tournamentMatches = [];
    tournamentMode = true;
    
    // Check if playerNames is 4 or 8
    if (playerNames.length !== 4 && playerNames.length !== 8) {
        console.error("The tournament can only start with 4 or 8 players.");
        return;
    }
    window.rankCounter = playerNames.length;

    // Generate initial matchups for the first round
    for (let i = 0; i < playerNames.length; i += 2) {
        window.tournamentMatches.push([playerNames[i], playerNames[i + 1]]);
    }

    // Show tournament bracket diagram (simple text version, you can enhance it with actual HTML and CSS)
    window.updateTournamentBracket();

    // Display "Start Match" button to begin the first match
    const nextMatchButton = document.getElementById("nextMatchButton");
    if (!nextMatchButton) {
        console.error("Next Match button not found in the DOM.");
        return;
    }
    nextMatchButton.style.display = "block";
}

window.updateTournamentBracket = function() {
    console.log('Updating Tournament Bracket');
    const gameContainerPP = document.getElementById("gameContainerPP");
    const gameOverModalTournament = document.getElementById("gameOverModalTournament");
    if (!gameContainerPP || !gameOverModalTournament) {
        console.error("Game container or game over modal not found in the DOM.");
        return;
    }
    gameContainerPP.style.display = "none";
    gameOverModalTournament.style.display = "none";
    let bracket = "";
    const nextMatchButton = document.getElementById("nextMatchButton");
    const matchLabel = document.getElementById("matchLabel");
    if (!matchLabel || !nextMatchButton) {
        console.error("Match label or next match button not found in the DOM.");
        return;
    }
    
    if (window.tournamentMatches.length === 4) {
//        document.getElementById(`winner-qf${matchIndex}`).textContent = `${winner}`;
        // Create matches for Quarter Finals
        bracket = "<div class='quarter-finals'><h3>Quarter Finals</h3>";
        window.tournamentMatches.forEach((match, index) => {
        bracket += `
            <div class='match-box'>
                <div class='match-title'>Match ${index + 1}: <br>${match[0]} vs ${match[1]}</div>
                <div class='winner-placeholder'>Winner: <span id='winner-qf${index + 1}'></span></div>
            </div>
        `;
    });
        bracket += "</div>"; // Close quarter-finals
    
    // Create Semi-Finals section
        bracket += "<div class='semi-finals'><h3>Semi Finals</h3>";
        bracket += `
            <br><br>
            <div class='match-box'>
                <div class='match-title'>Semi-Final 1: <br>Winner Match 1 vs Winner Match 2</div>
                <div class='winner-placeholder'>Winner: <span id='winnerSemi1'></span></div>
            </div>
            <br><br><br><br>            
            <div class='match-box'>
                <div class='match-title'>Semi-Final 2: <br>Winner Match 3 vs Winner Match 4</div>
                <div class='winner-placeholder'>Winner: <span id='winnerSemi2'></span></div>
            </div>
        `;
        bracket += "</div>"; // Close semi-finals
        
    // Create Final section        
        bracket += "<div class='final'><h3>Final</h3>";
        bracket += `
            <br><br><br><br><br><br><br>
            <div class='match-box'>
                <div class='match-title'>Winner Semi-Final 1<br>vs<br>Winner Semi-Final 2</div>
                <div class='winner-placeholder'>Winner: <span id='winnerFinal'></span></div>
            </div>
        `;
        bracket += "</div>"; // Close final
        
        if (window.matchIndex < 4) {
            nextMatchButton.innerText = `Start Match ${window.matchIndex + 1}`;
            matchLabel.textContent = `Quarter-Final Match ${window.matchIndex + 1}`;
            console.log(matchLabel.textContent);
        } else {
            nextMatchButton.innerText = `Proceed to Semi-Finals`;          
        }
    }   
    else if (window.tournamentMatches.length === 2) {
        bracket = "<div class='semi-finals'><h3>Semi Finals</h3>";
    
        // Create matches for Semi-Finala
        window.tournamentMatches.forEach((match, index) => {
            bracket += `
                <div class='match-box'>
                    <div class='match-title'>Semi-Final ${index + 1}: <br>${match[0]} vs ${match[1]}</div>
                    <div class='winner-placeholder'>Winner: <span id='winner-sf${index + 1}'></span></div>
                </div>
            `;
        });
        
        bracket += "</div>"; // Close semi-finals
        
        // Create Final sections
            bracket += "<div class='final'><h3>Final</h3>";
            bracket += `
                <br>
                <div class='match-box'>
                    <div class='match-title'>Winner Semi-Final 1<br>vs<br>Winner Semi-Final 2</div>
                    <div class='winner-placeholder'>Winner: <span id='winnerFinal'></span></div>
                </div>
            `;
            bracket += "</div>"; // Close final

            if (window.matchIndex < 2) {
                nextMatchButton.innerText = `Start Semi-Final ${window.matchIndex + 1}`;
                matchLabel.textContent = `Semi-Final ${window.matchIndex + 1}`;
                console.log(matchLabel.textContent);
                } else {
                nextMatchButton.innerText = `Proceed to Final`;           
                }            
    }   else if (window.tournamentMatches.length === 1) {
        bracket = "<div class='final'><h3>Final</h3>";
        
        // Create matches for Final
        window.tournamentMatches.forEach((match, index) => {
            bracket += `
                <div class='match-box'>
                    <div class='match-title'>${match[0]} vs ${match[1]}</div>
                    <div class='winner-placeholder'>Winner: <span id='winner-gf${index + 1}'></span></div>
                </div>
            `;
        });
            bracket += "</div>"; // Close final 
            
            if (window.matchIndex < 1) {
                nextMatchButton.innerText = `Start Final!`;
                matchLabel.textContent = `Grand Final!`;
                console.log(matchLabel.textContent);
                } else {
                nextMatchButton.innerText = `Exit Tournament`;           
                }       
    }
    const tournamentBracket = document.getElementById("tournamentBracket");
    const tournamentContainer = document.getElementById("tournamentContainer");
    if (!tournamentBracket || !tournamentContainer) {
        console.error("Tournament bracket or container not found in the DOM.");
        return;
    }
    tournamentBracket.innerHTML = bracket;
    tournamentContainer.style.display = "block";
}

// Start the next match in the tournament
window.startNextMatch = function() {
    if (window.matchIndex < window.tournamentMatches.length) {
        let match = window.tournamentMatches[window.matchIndex];
        let ply1 = match[0];
        let ply2 = match[1];
        // Call PvP mode, passing the current players
        startPvP(ply1, ply2);
    } else if (window.winners.length > 1) {
        // print current round winners before moving to next round
        
        // Move to the next round with winners
        window.tournamentMatches = [];
        for (let i = 0; i < window.winners.length; i += 2) {
            window.tournamentMatches.push([window.winners[i], window.winners[i + 1]]);
        }
        window.winners = [];
        window.matchIndex = 0;
        window.updateTournamentBracket();
        const nextMatchButton = document.getElementById("nextMatchButton");
        if (!nextMatchButton) {
            console.error("Next Match button not found in the DOM.");
            return;
        }
        nextMatchButton.style.display = "block";
    } else {
        // Tournament over, we have a winner
        const winner_name = document.getElementById("winner-name-tour");
        if (!winner_name) {
            console.error("Winner name element not found in the DOM.");
            return;
        }
        winner_name.innerText = window.winners[0];
        showTournamentOverModal();
    }
}

function showTournamentOverModal() {
        const tournamentOverModal = document.querySelector('.tournament-over-modal') as HTMLElement;
        if (!tournamentOverModal) {
            console.error("Tournament over modal not found in the DOM.");
            return;
        }
        tournamentOverModal.style.display = 'block'; 
        const winnerName = document.getElementById('winner-name-tour') as HTMLElement;
        if (!winnerName) {
            console.error("Winner name element not found in the DOM.");
            return;
        }
        winnerName.textContent = winner;
        tournamentMode = false;
        window.renderSubmit();
    }

async function startPvP(ply1: string, ply2: string) {
    // This function should start a PvP match between the two players
    console.log(`Starting match between ${ply1} and ${ply2}`);
    const tournamentContainer = document.getElementById("tournamentContainer");
    if (!tournamentContainer) {
        console.error("Tournament container not found in the DOM.");
        return;
    }
    tournamentContainer.style.display = "none";  
    window.startPlayerVsPlayer(ply1, ply2)
}
