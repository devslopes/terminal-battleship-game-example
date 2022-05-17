const rs = require('readline-sync');

const alphabet = 'abcdefghij'.toUpperCase();
let grid;
let ships;
let shipsRemaining;
let playerStrikes;
let hits;
const battleShips = [
  { name: 'Destroyer', units: 2 },
  { name: 'Submarine', units: 3 },
  { name: 'Cruiser', units: 3 },
  { name: 'Battleship', units: 4 },
  { name: 'Carrier', units: 5 }
];

const resetGame = () => {
  console.clear()
  grid = []
  ships = []
  playerStrikes = []
  shipsRemaining = 0
  hits = [];
};

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

const placeShips = () => {
  while (shipsRemaining < battleShips.length) {
      generateShip(shipsRemaining)
      shipsRemaining++
  }
  mapHits();
};

const mapHits = () => {
  battleShips.forEach(ship => {
      hits.push({ name: ship.name, units: ship.units, hits: 0, isSunk: false })
  });
};


const generateShip = (ship) => {
  const orientation = Math.floor(Math.random() * 2)
  // If orientation is 0, ship is vertical & 10 is added to flatGrid start index
  // If orientation is 1, ship is horizontal & 1 is added to flatGrid start index
  const direction = orientation === 0 ? 10 : 1
  const index = Math.abs(Math.floor(Math.random() * alphabet.length) * (alphabet.length - battleShips[ship].units))

  let offGrid = false, shipCoordinates = []

  // Make sure ship does not overflow grid
  if (direction === 1 && (index % alphabet.length) + (battleShips[ship].units * direction) >= grid.flat().length) offGrid = true;
  if (direction === 10 && index + (battleShips[ship].units * direction) >= (alphabet.length * direction)) offGrid = true;

  if (offGrid) {
    generateShip(ship);
  } else {
    // Make sure ship doesn't overlap another ship
    for (i = 0; i < battleShips[ship].units; i++) {
      if (ships.flat().includes(index + (direction * i))) {
        generateShip(ship);
      } else {
        shipCoordinates.push(index + (direction * i));
      }
    }
  }
  //If ship is generated, add to ships array
  if (shipCoordinates.length === battleShips[ship].units) {
    ships.push(shipCoordinates);
  }
}

const playerStrike = () => {
  isGameOver();
  let strike = rs.question(' Enter a location to strike ie \'A2\'... ')
  strike = strike.toUpperCase()
  if (strike === 'EXIT') {
    console.log(' Goodbye!');
    process.exit();
  }
  if (!grid.flat().includes(strike)) {
    console.log('That is not a valid location. Please try again.');
    playerStrike();
  }
  if (playerStrikes.includes(strike)) {
    console.log('You have already picked this location. Miss!');
    playerStrike();
  }
  playerStrikes.push(strike);
  checkForHit(strike);
};

const checkForHit = (strike) => {
  const strikeIndex = grid.flat().indexOf(strike);
  if (ships.flat().includes(strikeIndex)) {
    console.log(`${strike} is a Hit!`);
    countHit(strikeIndex);
    playerStrike();
  }
  else {
    console.log(`${strike} is a Miss! Guess again!`);
    playerStrike();
  }
};

const countHit = (strike) => {
  ships.forEach(ship => {
    if (ship.includes(strike)) {
      const hitShip = ships.indexOf(ship);
      const currentHits = hits[hitShip].hits;
      hits[hitShip].hits = currentHits + 1;
      checkIfSunk();
    }
  });
};

const checkIfSunk = () => {
  hits.forEach(ship => {
    if(!ship.isSunk && ship.hits === ship.units) {
      ship.isSunk = true;
      shipsRemaining--;
      const word = shipsRemaining === 1 ? 'ship' : 'ships';
      console.log(`You sank the ${ship.name}! ${shipsRemaining} ${word} remaining.`);
    }
  })
}

const isGameOver = () => {
  if (shipsRemaining === 0) {
    console.log('You have destroyed all battleships.');
    if (rs.keyInYNStrict(' Would you like to play again? ')) {
      startGame();
    }
    console.log(' Goodbye!');
    process.exit();
  }
};

const startGame = () => {
  resetGame();
  rs.keyIn(' Press any key to start game... ')
  createGrid(alphabet.length);
  placeShips();
  playerStrike();
};

startGame();
