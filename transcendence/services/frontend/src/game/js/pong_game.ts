//convert this entire file to typescript
// @ts-check

console.log("GAME SCRIPT")
        let ball: { x: any; y: any; velocityX: any; speed: any; velocityY: any; radius: any; color: any; }, player1: { name?: any; y: any; height: any; score: any; x: any; width: any; color: any; }, player2: { name: any; y: any; height: any; score: any; x: any; width: any; color: any; }, playerAI: { y: any; height: any; score: any; x: any; width: any; color: any; };
        
        let players = [], currentRound = 0, tournamentMode = false;  // Declare for tournament
        //const canvasTournament = document.getElementById('pongGameCanvasTournament');
        let ctxTournament;
    
       	const canvasAI = document.getElementById('pongGameCanvasAI');
		const canvasPP = document.getElementById('pongGameCanvasPP');
		
		let activeCanvas: HTMLElement | null;
		let ctx: CanvasRenderingContext2D;
        
        let wPressed = false;
        let sPressed = false;
        let ArrowUpPressed = false;
        let ArrowDownPressed = false; 

        let gameOver = false;
        let isPaused = false;
		window.gameRunning = false;
        let readyKickoff = false;      
        let winner = '';

		let isPlayerAI = false;
		let lastUpdateTime = 0;
		let updateInterval = 1000;  // AI "sees" the ball every 1 second
		let predictedY = 200;  // Initialize with the center position
	    
	// Function to show game options
	window.showGameOptions = function() {
	console.log("Showing game options");  // Debugging log
	window.gameRunning = true;
	document.body.style.overflow = '';
  	document.getElementById('gameContainerPP')?.classList.remove('overflow-hidden');
	document.getElementById('gameContainerAI')?.classList.remove('overflow-hidden');
	document.getElementById('gameOptions')!.style.display = 'flex';
	document.getElementById('tourOptions')!.style.display = 'none';		
	document.getElementById('gameContainerAI')!.style.display = 'none';
	document.getElementById('gameContainerPP')!.style.display = 'none';
	document.getElementById('tournamentContainer')!.style.display = 'none';
	document.getElementById('tournamentOverModal')!.style.display = 'none';
	tournamentMode = false;	
	}

	function setActiveCanvas(canvasId: string) {
		activeCanvas = document.getElementById(canvasId);  // Assign the active canvas
		if (activeCanvas) {
			const context = (activeCanvas as HTMLCanvasElement).getContext('2d');
			if (!context) {
				throw new Error("Failed to get 2D context");
			}
			ctx = context;  // Set the context for the active canvas
		} else {
			throw new Error("Active canvas is null");
		}
		(activeCanvas as HTMLCanvasElement).width = 800;  // Set width
		(activeCanvas as HTMLCanvasElement).height = 400; // Set height
	}

	function showGameOverModalAI() {
		const gameOverModal = document.querySelector('.game-over-modalAI') as HTMLElement;
		if (!gameOverModal) {
			throw new Error("Game Over Modal not found");
		}
		gameOverModal.style.display = 'block'; 
		const winnerName = document.getElementById('winner-name-ai');
		if (winnerName) {
			winnerName.textContent = winner;
		} else {
			console.error("Winner name element not found");
		}
	}
	
	function showGameOverModalPP() {
		const gameOverModal = document.querySelector('.game-over-modalPP') as HTMLElement;
		if (!gameOverModal) {
			throw new Error("Game Over Modal not found");
		}
		gameOverModal.style.display = 'block'; 
		const winnerName = document.getElementById('winner-name-pp') as HTMLElement;
		if (!winnerName) {
			throw new Error("Winner name element not found");
		}
		winnerName.textContent = winner;
	}

	function showGameOverModalTournament(): void {
		const gameOverModalTournament = document.getElementById('gameOverModalTournament') as HTMLElement;
		const winnerNamePpt = document.getElementById('winner-name-ppt') as HTMLElement;
	
		if (gameOverModalTournament && winnerNamePpt) {
			gameOverModalTournament.style.display = 'block';
			winnerNamePpt.textContent = winner; // Assuming winner is a globally declared variable
		} else {
			console.error('Element(s) not found');
		}
	}
	

	function setPlayerNames(p1: string | null, p2: string | null) {
		const player1Name = document.getElementById('player1Name') as HTMLElement;
		const player2Name = document.getElementById('player2Name') as HTMLElement;
		if (!player1Name || !player2Name) {
			throw new Error("Player name elements not found");
		}
		player1Name.textContent = p1;
		player2Name.textContent = p2;
	}

    // Function to start Player vs Player game
	window.startPlayerVsPlayer = function(p1: string, p2: string) {
		console.log("Starting Player vs Player game");  // Debugging log
		document.body.style.overflow = 'hidden';
//		const canvasPP = document.getElementById('pongGameCanvasPP');
  		document.getElementById('gameContainerPP')?.classList.add('overflow-hidden');
		const gameOptions = document.getElementById('gameOptions') as HTMLElement;
		const gameContainerPP = document.getElementById('gameContainerPP') as HTMLElement;

		if (!gameOptions || !gameContainerPP) {
			throw new Error("Game Options or Game Container not found");
		}
		gameOptions.style.display = 'none';
		gameContainerPP.style.display = 'flex';
		setActiveCanvas('pongGameCanvasPP');  // Use the Player vs Player canvas

		ctx = (activeCanvas as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
		if (!ctx) {
			throw new Error("Failed to get 2D context");
		}           
		const gameOverModalPP = document.getElementById('gameOverModalPP') as HTMLElement;
		if (!gameOverModalPP) {
			throw new Error("Game Over Modal not found");
		}
		gameOverModalPP.style.display = 'none';
		const gameOverModal = document.querySelector('.game-over-modalPP') as HTMLElement;
		if (!gameOverModal) {
			throw new Error("Game Over Modal not found");
		}                
		gameOverModal.style.display = 'none'; // Hide modal

		wPressed = false;
		sPressed = false;
		ArrowUpPressed = false;
		ArrowDownPressed = false; 
		isPlayerAI = false;
		
		gameOver = false;
		isPaused = false;
		readyKickoff = false;      
		winner = '';
		window.gameLoopId = null;

		ball = {
			x: (activeCanvas as HTMLCanvasElement).width / 2,
			y: (activeCanvas as HTMLCanvasElement).height / 2,
			radius: 10,
			velocityX: 5,
			velocityY: 5,
			speed: 5,
			color: "#FFF"
		};

		player1 = {
			name: "Player 1",
			x: (activeCanvas as HTMLCanvasElement).width - 15,
			y: ((activeCanvas as HTMLCanvasElement).height - 100) / 2,
			width: 15,
			height: 100,
			score: 0,
			color: "#FFF"
		};
	
		player2 = {
			name: "Player 2",
			x: 0,
			y: ((activeCanvas as HTMLCanvasElement).height - 100) / 2,
			width: 15,
			height: 100,
			score: 0,
			color: "#FFF"
		};

		// You can replace these with dynamic names, e.g., from a form or input field
		if (tournamentMode) {
			player2.name = p2;
			player1.name = p1;
			setPlayerNames(p1, p2);
			} else {
			setPlayerNames('Player1', 'Player2');
			const matchLabel = document.getElementById("matchLabel") as HTMLElement;
			if (!matchLabel) {
				throw new Error("Match label element not found");
			}
			matchLabel.textContent = `Practice Match`;					
			}
		
		console.log("Initializing", player1.name, "vs", player2.name, "game");
		document.addEventListener('keydown', keyDownHandler);
		document.addEventListener('keyup', keyUpHandler);
		console.log((document.getElementById("matchLabel") as HTMLElement).textContent);
		//console.log(ball, player1, player2, playerAI);  // Debug to check their state before update
		countdownToStart(3);
	}

    // Function to start Player vs AI game
    window.startPlayerVsAI = function() {
		document.body.style.overflow = 'hidden';
//		const canvasAI = document.getElementById('pongGameCanvasAI');
		document.getElementById('gameContainerAI')?.classList.add('overflow-hidden');
		const gameOptions = document.getElementById('gameOptions') as HTMLElement;
		const gameContainerAI = document.getElementById('gameContainerAI') as HTMLElement;
		if (!gameOptions || !gameContainerAI) {
			throw new Error("Game Options or Game Container not found");
		}
		gameOptions.style.display = 'none';
		gameContainerAI.style.display = 'flex';
		setActiveCanvas('pongGameCanvasAI');  // Use the Player vs AI canvas
		if (!activeCanvas) {
			throw new Error("Active canvas is null");
		}
		if (!activeCanvas) {
			throw new Error("Active canvas is null");
		}
		const context = (activeCanvas as HTMLCanvasElement).getContext('2d');
		if (!context) {
			throw new Error("Failed to get 2D context");
		}
		ctx = context;
		const gameOverModalAI = document.getElementById('gameOverModalAI') as HTMLElement;
		if (!gameOverModalAI) {
			throw new Error("Game Over Modal not found");
		}
		gameOverModalAI.style.display = 'none';
		console.log("Initializing Player vs AI game");
		const gameOverModal = document.querySelector('.game-over-modalAI') as HTMLElement;
		if (!gameOverModal) {
			throw new Error("Game Over Modal not found");
		}                
		gameOverModal.style.display = 'none'; // Hide modal

		wPressed = false;
		sPressed = false;
		ArrowUpPressed = false;
		ArrowDownPressed = false; 
		isPlayerAI = true;

		gameOver = false;
		isPaused = false;
		readyKickoff = false;      
		winner = '';
		window.gameLoopId = null;

		lastUpdateTime = 0;
		updateInterval = 1000;  // AI "sees" the ball every 1 second
		predictedY = (activeCanvas as HTMLCanvasElement).height / 2;

		ball = {
			x: (activeCanvas as HTMLCanvasElement).width / 2,
			y: (activeCanvas as HTMLCanvasElement).height / 2,
			radius: 10,
			velocityX: 5,
			velocityY: 5,
			speed: 5,
			color: "#FFF"
		};

		playerAI = {
			x: 0,
			y: ((activeCanvas as HTMLCanvasElement).height - 100) / 2,
			width: 15,
			height: 100,
			score: 0,
			color: "#FFF"
		};

		player1 = {
			x: (activeCanvas as HTMLCanvasElement).width - 15,
			y: ((activeCanvas as HTMLCanvasElement).height - 100) / 2,
			width: 15,
			height: 100,
			score: 0,
			color: "#FFF"
		};

		document.addEventListener('keydown', keyDownHandler);
		document.addEventListener('keyup', keyUpHandler);

		countdownToStart(3);
		}
//
    function keyDownHandler(event: { key: any; }) {
      switch(event.key) {
	case 'p':
	    isPaused =!isPaused;  // Toggle pause state
	    break; 
        case 'w':
           wPressed = true;
           break;
        case 's':
            sPressed = true;
            break;
		case 'ArrowUp':
			ArrowUpPressed = true;
			break;
		case 'ArrowDown': 
			ArrowDownPressed = true;
			break;
     }
   }

    function keyUpHandler(event: { key: any; }) {
      switch(event.key) {
        case 'w':
            wPressed = false;
            break;
        case 's':
            sPressed = false;
            break;
		case 'ArrowUp':
			ArrowUpPressed = false;
			break;
		case 'ArrowDown': 
			ArrowDownPressed = false;	
	    	break;
      }
    }
//
    function drawRect(x: number, y: number, width: number, height: any, color: string) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, width, height);
    }
//
    function drawCircle(x: any, y: any, radius: any, color: any) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI*2, false);
	ctx.closePath();
	ctx.fill();
    }
//
    function drawText(text: any, x: number, y: number, color = '#FFF') {
	ctx.fillStyle = color;
	ctx.font = '50px Arial';
	ctx.fillText(text, x, y);
    }
//
    function kickOff() {
	//console.log("Kickoff! Ball position:", ball.x, ball.y);
	ball.x = (activeCanvas as HTMLCanvasElement).width / 2;
	ball.y = (activeCanvas as HTMLCanvasElement).height / 2;
	player1.y = (activeCanvas as HTMLCanvasElement).height / 2 - player1.height / 2;
	if (isPlayerAI) {
        playerAI.y = (activeCanvas as HTMLCanvasElement).height / 2 - 100 / 2;
        } else {
        player2.y = (activeCanvas as HTMLCanvasElement).height / 2 - 100 / 2;
        } 		
	ball.velocityX = -ball.velocityX;
	ball.speed = 5;
        ball.velocityX = ball.velocityX > 0 ? ball.speed : -ball.speed;
        ball.velocityY = ball.velocityY > 0 ? ball.speed : -ball.speed;		

	// Stop the ball's movement and pause the game
	isPaused = true;
	readyKickoff = true;
	// Use setTimeout to resume the game after 1 second (1000 milliseconds)
	setTimeout(() => {
		isPaused = false;
		readyKickoff = false;  // Unpause the game after 1 second
	}, 1000);  // 1000 milliseconds = 1 second
    }
//
function isContact(ball: { y: number; radius: number; x: number; }, paddle: { y: any; height: any; x: any; width: any; }) {
    // Define the ball's bounds
    let ballTop = ball.y - ball.radius;
    let ballBottom = ball.y + ball.radius;
    let ballLeft = ball.x - ball.radius;
    let ballRight = ball.x + ball.radius;

    // Define the paddle's bounds
    let paddleTop = paddle.y;
    let paddleBottom = paddle.y + paddle.height;
    let paddleLeft = paddle.x;
    let paddleRight = paddle.x + paddle.width;

    // Check for collision
    return ballRight > paddleLeft && ballBottom > paddleTop &&
           ballLeft < paddleRight && ballTop < paddleBottom;
}
//
	function bounceAngle(b: { y: number; x: number; velocityX: number; speed: number; velocityY: number; }, p: { y: number; height: number; }) {
		let contactPt = b.y - (p.y + p.height / 2);
		contactPt = contactPt / (p.height / 2); // normalise it -1 to 1
		let angleShift = (Math.PI / 4) * contactPt;	// convert to -45deg to 45 deg
		let direction = (b.x < (activeCanvas as HTMLCanvasElement).width / 2) ? 1 : -1;
		b.velocityX = direction * b.speed * Math.cos(angleShift);
		b.velocityY = b.speed * Math.sin(angleShift);

		// Ensure there is always some vertical movement
		if (Math.abs(b.velocityY) < 1) {
			b.velocityY = b.velocityY < 0 ? -1 : 1;
		}
		// Ensure there is always some horizontal movement
		if (Math.abs(b.velocityX) < 1) {
			b.velocityX = b.velocityX < 0 ? -1 : 1;			
		}
	}

	function countdownToStart(seconds: number) {
		if(seconds > 0) {
		if (!window.gameRunning) {
			console.log("Game stopped during countdown");
			return;
		}
//		console.log(`Countdown: ${seconds}`);
		ctx.clearRect(0, 0, (activeCanvas as HTMLCanvasElement).width, (activeCanvas as HTMLCanvasElement).height);
		ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; 
		ctx.fillRect(0, 0, (activeCanvas as HTMLCanvasElement).width, (activeCanvas as HTMLCanvasElement).height);

		ctx.fillStyle = "#FFF"; 
		ctx.font = "30px Arial";
		ctx.textAlign = "center";
		ctx.fillText(`Starting: ${seconds}`, (activeCanvas as HTMLCanvasElement).width/2, (activeCanvas as HTMLCanvasElement).height/2);	          
		setTimeout(function() {
		console.log(`Countdown: ${seconds}`);  // Debug             
		countdownToStart(seconds - 1);
		}, 1000);
		}  else {              
			if (!window.gameRunning) {
				console.log("Game stopped during countdown");
				return;
			}
			console.log("Starting game loop");  // Debug to check their state before update
			gameLoop();  // Start the game loop
		}
	}

	function emitScores() {
		const sortedEntries = Array.from(window.playerScores.entries())
			.sort((a, b) => b[1] - a[1]); // Sort scores descending
	
		// Store rankings, names, and scores in window
		window.ranks = [];
		window.pNames = [];
		window.scores = [];
	
		sortedEntries.forEach((entry, index) => {
			window.ranks.push(index + 1);  // Rank starts from 1
			window.pNames.push(entry[0]);  // Player names
			window.scores.push(entry[1]);  // Scores
		});
	
		console.log("Scores stored in window:", window.ranks, window.pNames, window.scores);
	}
	

	function update() {
		// how to do this only at every second - requiremnt
		// AI tracking the ball
		let currentTime = performance.now();
		if (currentTime - lastUpdateTime > updateInterval) {
		     predictedY = predictBallPosition(ball);
		     lastUpdateTime = currentTime;
		}
		let paddleSpeed = 8;
		let aiBuffer = 30;


		if (ArrowUpPressed && player1.y > 0) player1.y -= paddleSpeed;
		if (ArrowDownPressed && (player1.y + player1.height) < (activeCanvas as HTMLCanvasElement).height) player1.y += paddleSpeed;
			
		if (isPlayerAI) {			
			if ((Math.abs(predictedY - (playerAI.y + playerAI.height / 2)) > aiBuffer) && ball.velocityX < 0)
			{
			    let playerAIDirection = predictedY < playerAI.y + playerAI.height / 2 ? -1 : 1;
			    playerAI.y += playerAIDirection * 20;  // Adjust the speed to make it smoother
			}

			// Ensure the AI paddle stays within the canvas boundaries
			playerAI.y = Math.max(Math.min(playerAI.y, (activeCanvas as HTMLCanvasElement).height - playerAI.height), 0);
		} else {
		if (wPressed && player2.y > 0) player2.y -= paddleSpeed;
		if (sPressed && (player2.y + player2.height) < (activeCanvas as HTMLCanvasElement).height) player2.y += paddleSpeed;
		}
		// keep the ball moving
		ball.x += ball.velocityX; 
		ball.y += ball.velocityY;

		// rebounce off the top or bottom of canvas
		if(ball.y - ball.radius < 0 || ball.y + ball.radius > (activeCanvas as HTMLCanvasElement).height) {
		    ball.velocityY = -ball.velocityY;
		    if (Math.abs(ball.velocityY) < 1) {
			ball.velocityY = ball.velocityY < 0 ? -1 : 1;
		    }
		}

		let player = player1;
		if (isPlayerAI) {
			player = (ball.x < (activeCanvas as HTMLCanvasElement).width / 2) ? playerAI : player1;
		} else {
			player = (ball.x < (activeCanvas as HTMLCanvasElement).width / 2) ? player2 : player1;
		}

		if(isContact(ball, player)) {
	    	    ball.speed += 0.5; // Increase speed with every paddle hit
		    bounceAngle(ball, player);
		}

		if(ball.x - ball.radius < 0) {
		    player1.score++;
		    kickOff();
		} else if(ball.x + ball.radius > (activeCanvas as HTMLCanvasElement).width) {
		    if (isPlayerAI) {	
		    playerAI.score++;
		    } else {
		    player2.score++;}
		    kickOff();
		}
		
		if (isPlayerAI) {
		if(playerAI.score === 5 || player1.score === 5) {
		    gameOver = true;
		    winner = playerAI.score === 5 ? 'Player AI' : 'Player 1';
		    console.log("WinnerAI:", winner);  // Debugging to see what the winner is
		}} else {
		if(player2.score === 1 || player1.score === 1) {
		    gameOver = true;
		    winner = player2.score === 1 ? player2.name : player1.name;
			window.playerScores.set(player1.name, (window.playerScores.get(player1.name) || 0) + player1.score);
			window.playerScores.set(player2.name, (window.playerScores.get(player2.name) || 0) + player2.score);
		    console.log("WinnerPP:", winner);  // Debugging to see what the winner is
		}}
		if (gameOver === true) {
			emitScores();
		}
	}
	
//
	function predictBallPosition(ball: { x: number; velocityX: number; y: number; velocityY: number; }) {
		let timeToReachAI = ball.x / Math.abs(ball.velocityX);
		let predictedY = ball.y + ball.velocityY * timeToReachAI;
		while (predictedY < 0 || predictedY > (activeCanvas as HTMLCanvasElement).height) {
			if (predictedY < 0) {
			    predictedY = -predictedY;
			} else if (predictedY > (activeCanvas as HTMLCanvasElement).height) {
			    predictedY = 2 * (activeCanvas as HTMLCanvasElement).height - predictedY;
			}
		}
		return predictedY;
	}
//
	function render() {
		
		drawRect(0, 0, (activeCanvas as HTMLCanvasElement).width, (activeCanvas as HTMLCanvasElement).height, '#000'); // outer-perimeter	
		drawRect((activeCanvas as HTMLCanvasElement).width/2 - 2, 0, 4, (activeCanvas as HTMLCanvasElement).height, '#FFF'); // centre-line
		drawCircle(ball.x, ball.y, ball.radius, ball.color);
		drawRect(player1.x, player1.y, player1.width, player1.height, player1.color);
		if (isPlayerAI) {
		drawRect(playerAI.x, playerAI.y, playerAI.width, playerAI.height, playerAI.color);
		drawText(playerAI.score, (activeCanvas as HTMLCanvasElement).width / 4, 40);
		} else { 
		drawRect(player2.x, player2.y, player2.width, player2.height, player2.color);
		drawText(player2.score, (activeCanvas as HTMLCanvasElement).width / 4, 40);
		}
		drawText(player1.score, 3 * (activeCanvas as HTMLCanvasElement).width / 4, 40);
	}

	function gameLoop() {
		console.log("Game loop running");  // Debugging log
		if (!window.gameRunning) {
			console.log("Game loop stopped");
			return;
		}
		if(!gameOver && !isPaused) {
			update();
			render();
		} else if (isPaused) {
			render();
			if (readyKickoff) {
			ctx.fillStyle = "#FFF"; 
			ctx.font = "30px Arial";
			ctx.textAlign = "center";
			ctx.fillText(`Get Ready!`, (activeCanvas as HTMLCanvasElement).width/2 + 22, (activeCanvas as HTMLCanvasElement).height/2 - 40);
			} 
		  } else {
			ctx.fillStyle = "#FFF"; 
			ctx.font = "30px Arial";
			ctx.textAlign = "center";
			ctx.fillText(`Game Paused!`, (activeCanvas as HTMLCanvasElement).width/2 + 15, (activeCanvas as HTMLCanvasElement).height/2 - 40);
		}	
		if (gameOver) {
			console.log("Winner:", winner);  // Debugging to see what the winner is
			if (tournamentMode) {
			showGameOverModalTournament();
			console.log(`Winner of this match is ${winner}`);
			window.winners.push(winner);
			window.matchIndex++;
			console.log(window.winners, window.matchIndex);
			}
			else if (isPlayerAI) {
				document.getElementById('gameContainerAI')?.classList.remove('overflow-hidden');
				showGameOverModalAI();
			} else {
				document.getElementById('gameContainerPP')?.classList.remove('overflow-hidden');
				showGameOverModalPP();
			}
			if (window.gameLoopId !== null) {
				cancelAnimationFrame(window.gameLoopId); // Stop the existing game loop
			}
			document.body.style.overflow = 'auto';
			return;
		}
		window.gameLoopId = requestAnimationFrame(gameLoop);
	}

//window.showGameOptions();
