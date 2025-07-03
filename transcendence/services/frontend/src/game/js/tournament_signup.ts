	//@ts-check
	
	console.log("tournament_signup.js loaded");
// This file handles the tournament signup process, including player name input and tournament options
	
	window.startTournament = function() {
		const gameOptions = document.getElementById('gameOptions');
		const playerNameForm = document.getElementById('playerNameForm');
		const tourOptions = document.getElementById('tourOptions');
		if (!gameOptions || !playerNameForm || !tourOptions) {
			console.error("One or more required elements are missing in the DOM.");
			return;
		}
		gameOptions.style.display = 'none';
		playerNameForm.style.display = 'none';
		tourOptions.style.display = 'block';
	}

	window.getPlayerName = function(playerCount: number) {
	    // Hide tournament options and show the player name form
		const tourOptions = document.getElementById('tourOptions');
		const playerNameForm = document.getElementById('playerNameForm');
		const form = document.getElementById('playerForm');
		if (!tourOptions || !playerNameForm || !form) {
			console.error("One or more required elements are missing in the DOM.");
			return;
		}
		tourOptions.style.display = 'none';
	    playerNameForm.style.display = 'block';
	
	    
	    // Clear any existing input fields
	    form.innerHTML = '';
	    
	    // Dynamically create input fields for the number of players
	    for (let i = 1; i <= playerCount; i++) {
		const div = document.createElement('div');
		div.classList.add('form-row');

		const label = document.createElement('label');
		label.htmlFor = `player${i}`;
		label.textContent = `Player ${i}:`;

		const input = document.createElement('input');
		input.type = 'text';
		input.placeholder = `Enter Player ${i} Name`;
		input.id = `player${i}`;
		input.name = `player${i}`;

		div.appendChild(label);
		div.appendChild(input);
		form.appendChild(div);
	    }
	}

	window.finalisePlayer = function() {
	    const form = document.getElementById('playerForm');
		if (!form) {
			console.error("Player form not found in the DOM.");
			return;
		}
	    const playerNames: string[] = [];
	    
	    
	    // Collect all the player names by iterating over form elements
	    // Only consider input elements (ignore other elements like <br>, <label>)
	    const inputs = form.querySelectorAll('input');
	    
	    inputs.forEach(input => {
		if (input.value.trim() !== '' && input.value.length <= 12) {  // Ensure that the name is not an empty string
		    playerNames.push(input.value.trim());
		    
		}
	    });
	    
	    // Check if we have all the player names
	    if (playerNames.length === inputs.length) {
		console.log('Starting tournament with players:', playerNames);
		// Call the function to start the tournament with the collected player names
		const playerNameForm = document.getElementById('playerNameForm');
		if (!playerNameForm) {
			console.error("Player name form not found in the DOM.");
			return;
		}
		playerNameForm.style.display = 'none';
		startTournamentSequence(playerNames);
	    } else {
		alert('Names should be between 1 and 12 characters long!');
	    }
	}

/*window.getPlayerName = getPlayerName;
window.finalisePlayer = finalisePlayer;
window.startTournament = startTournament;*/
