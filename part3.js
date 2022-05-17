const rs = require('readline-sync');

const alphabet = 'abcdefghij'.toUpperCase();
let grid;
let shipsRemaining;
let shipLocations;
let strikes;
let hits;
let playersTurn;

const battleShips = [
  { name: 'Destroyer', units: 2 },
  { name: 'Submarine', units: 3 },
  { name: 'Cruiser', units: 3 },
  { name: 'Battleship', units: 4 },
  { name: 'Carrier', units: 5 }
];

const resetGame = () => {
  console.clear()
  grid = [];
  shipsRemaining = { player: 0, computer: 0 }
  shipLocations = { player: [], computer: [] }
  strikes = { player: [], computer: [] }
  hits = { player: [], computer: [] }
  playersTurn = 'computer';
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

const printGrid = () => {
  console.clear();
  console.table(grid);
}

const getCords = (input, g = grid) => {
	let row = 0;
	let col = 0;
	row = g.findIndex(row => row.includes(input));
	if (row !== -1) {
		col = g[row].indexOf(input);
		return { row, col };
	}
}

const placeShips = () => {
  while (shipsRemaining.player < battleShips.length) {
    generateShip('player', shipsRemaining.player);
    shipsRemaining['player']++;
  }
  while (shipsRemaining.computer < battleShips.length) {
    generateShip('computer', shipsRemaining.computer);
    shipsRemaining['computer']++;
  }
  mapHits();
};

const mapHits = () => {
  battleShips.forEach(ship => {
    hits.player.push({ name: ship.name, units: ship.units, hits: 0, isSunk: false })
    hits.computer.push({ name: ship.name, units: ship.units, hits: 0, isSunk: false })
  });
};

const generateShip = (player, ship) => {
  const orientation = Math.floor(Math.random() * 2)
  // If orientation is 0, ship is vertical & 10 is added to start index
  // If orientation is 1, ship is horizontal & 1 is added to start index
  const direction = orientation === 0 ? 10 : 1;
  const index = Math.abs(Math.floor(Math.random() * alphabet.length) * (alphabet.length - battleShips[ship].units));

  let offGrid = false, shipCoordinates = [];

  // Make sure ship does not overflow grid
  if (direction === 1 && (index % alphabet.length) + (battleShips[ship].units * direction) >= alphabet.length) offGrid = true;
  if (direction === 10 && index + (battleShips[ship].units * direction) >= (alphabet.length * direction)) offGrid = true;

  if (offGrid) {
    generateShip(player, ship);
  } else {
    // Make sure ship doesn't overlap another ship
    for (i = 0; i < battleShips[ship].units; i++) {
      if (shipLocations[player].flat().includes(index + (direction * i))) {
        generateShip(player, ship);
      } else {
        shipCoordinates.push(index + (direction * i));
      }
    }
  }
  //If ship is generated, add to ships array
  if (shipCoordinates.length === battleShips[ship].units) {
    shipLocations[player].push(shipCoordinates);
  }
}

const playerMove = () => {
  isGameOver();
  playersTurn = (playersTurn === 'player' ? 'computer' : 'player');
  if (playersTurn === 'player') playerStrike();
  if (playersTurn === 'computer') computerStrike();
}

const playerStrike = () => {
  let strike = rs.question(' Enter a location to strike ie \'A2\'... ');
  
  strike = strike.toUpperCase()
  if (strike === 'EXIT') {
    console.log(' Goodbye!');
    process.exit();
  }
  if (strikes.player.includes(strike)) {
    printGrid();
    console.log(`You have already hit ${strike}. Please try again.`);
    playerStrike();
  }
  if (!grid.flat().includes(strike)) {
    printGrid();
    console.log('That is not a valid location. Please try again.');
    playerStrike();
  }
  

  strikes.player.push(strike);
  strikeIndex = grid.flat().indexOf(strike);
  const { row, col } = getCords(strike);
  const ship = checkForHit('computer', strikeIndex);
  if (!ship) {
    grid[row][col] = '🌊';
    printGrid();
    console.log(`${strike} is a Miss!!`);
  } else {
    grid[row][col] = '🔥';
    printGrid();
    const sunkShip = checkIfSunk('computer');
    if (sunkShip === ship) {
      printGrid();
      const word = shipsRemaining.computer === 1 ? 'ship' : 'ships';
      console.log(`${strike} is a Hit!`);
      console.log(`You sank the computer's ${ship}! Computer has ${shipsRemaining.computer} ${word} remaining.`);
    } else {
      printGrid();
      console.log(`${strike} is a Hit!`);
    }
  }
  playerMove();
};

const computerStrike = () => {
  location = Math.floor(Math.random() * grid.flat().length);
  if (strikes.computer.includes(location)) computerStrike();
  strikes.computer.push(location);
  const ship = checkForHit('player', location);
  if (!ship) {
    console.log('The computer has missed.');
  } else {
    const sunkShip = checkIfSunk('player');
    if(sunkShip === ship) {
        const word = shipsRemaining.player === 1 ? 'ship' : 'ships'
        console.log(`The computer hit and sank your ${ship}! You have ${shipsRemaining.player} ${word} remaining.`);
    } else {
        console.log(`The computer hit your ${ship}.`);
    }
  }
  playerMove();
};

const checkForHit = (opponent, location) => {
  let shipName;
  shipLocations[opponent].forEach(ship => {
    if(ship.includes(location)) {
      const hitShip = shipLocations[opponent].indexOf(ship);
      const currentHits = hits[opponent][hitShip].hits;
      hits[opponent][hitShip].hits = currentHits + 1;
      shipName = hits[opponent][hitShip].name;
    }
  })
  return shipName;
}

const checkIfSunk = (opponent) => {
  let shipName;
  hits[opponent].forEach(ship => {
    if(!ship.isSunk && ship.hits === ship.units) {
      ship.isSunk = true;
      shipsRemaining[opponent]--;
      shipName = ship.name;
    }
  });
  return shipName;
};

const isGameOver = () => {
  if (shipsRemaining.player === 0 || shipsRemaining.computer === 0) {
    console.log('Game Over!');
    if (rs.keyInYNStrict(' Would you like to play again? ')) startGame();
    console.log(' Goodbye!' );
    process.exit();
  }
};

const startGame = () => {
  resetGame();
  rs.keyIn(' Press any key to start game... ')
  createGrid(alphabet.length);
  placeShips();
  console.log('computer ships', shipLocations.computer);
  console.table(grid);
  playerMove();
};

startGame();
