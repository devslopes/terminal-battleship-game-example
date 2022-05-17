const rs = require('readline-sync');

const alphabet = 'abcdefghij'.toUpperCase();
let grid = []
let ships = [];
let playerStrikes = [];
let shipsRemaining;

const resetGame = () => {
  console.clear()
  grid = []
  ships = []
  playerStrikes = []
  shipsRemaining = 0
}

const createGrid = (size) => {
  let r;
  let c = 0;	
	for (r = 0; r < size; r++) {
		grid[r] = [];
		for (c = 0; c < size; c++) {
			grid[r][c] = `${alphabet[r]}${c + 1}`;
		}
	}
};

const generateShips = () => {
  const flatGrid = grid.flat(); 
  const index = () => Math.floor(Math.random() * flatGrid.length);
  if (ships.length < 2) {
    const cord = flatGrid[index()];
    ships.includes(cord) ? generateShips() : ships.push(cord);
    generateShips();
  }
  else shipsRemaining = 2;
}

const playerStrike = () => {
  isGameOver();
  let strike = rs.question(' Enter a location to strike ie \'A2\'... ');
  strike = strike.toUpperCase();
  if (!grid.flat().includes(strike)) {
    console.log('That is not a valid location. Please try again.');
    playerStrike();
  }
  checkPreviousStrikes(strike);
  playerStrikes.push(strike);
  checkForHit(strike);
  }

const checkPreviousStrikes = (strike) => {
  if (!playerStrikes.includes(strike)) return;
  console.log('You have already picked this location. Miss!');
  playerStrike();
}

const checkForHit = (strike) => {
  console.log('ships', ships);
  if (ships.includes(strike)) {
    shipsRemaining--
    if (shipsRemaining === 1) {
        console.log(`Hit! You have sunk a battleship. ${shipsRemaining} ship remaining.`);
        playerStrike();
    }
  }
  console.log('You have missed!');
  playerStrike();
}

const isGameOver = () => {
  if (shipsRemaining === 0) {
    console.log('Hit! You have destroyed all battleships.');
    if (rs.keyInYN(' Would you like to play again? ')) {
      startGame();
    }
    console.log('Goodbye!');
    process.exit();
  }
}

const startGame = () => {
  resetGame();
  rs.keyIn(' Press any key to start game... ')
  createGrid(3);
  generateShips();
  playerStrike();
}

startGame();