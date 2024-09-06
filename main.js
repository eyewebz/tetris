class TetrisBlock {
    constructor(shape, position, type) {
      this.shape = shape; 
      this.position = position;
      this.type = type;
      this.rotation = 0;
    }
  }
  
  class TetrisBoard {
    constructor() {
      this.cells = [];
      this.rows = 20;
      this.columns = 10;
      this.filledCells = []; 
      this.currentTetrisBlock = this.getRandomPiece();
      this.intervalId = null;
  
      this.initBoard(); 
      this.renderBoard(); 
      this.startTetrisInterval();
      this.setupEventListeners();
    }
  
    resetGame() {
      this.stopTetrisInterval();
  
      this.filledCells = [];
      this.currentTetrisBlock = this.getRandomPiece();
  
      this.renderBoard();
    }
  
    gameOver() {
      this.stopTetrisInterval();
      alert("Game Over!");
      this.resetGame();
    }
  
    initBoard() {
      const tetrisBoard = document.getElementById("tetrisBoard");
  
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.columns; col++) {
          const cell = document.createElement("div");
          cell.classList.add("cell");
          tetrisBoard.appendChild(cell);
          this.cells.push(cell); 
        }
      }
    }
  
    renderBoard() { 
      this.cells.forEach((cell) => cell.classList.remove("filled"));
  
      this.currentTetrisBlock.shape.forEach(([offsetX, offsetY]) => {
        const row = this.currentTetrisBlock.position.x + offsetX;
        const col = this.currentTetrisBlock.position.y + offsetY;
        const index = row * this.columns + col; 
        this.cells[index].classList.add("filled");
      });
  
      
      this.filledCells.forEach((cell) => {
        const { x, y } = cell;
        const index = x * this.columns + y;
        this.cells[index].classList.add("filled");
      });
    }
  
    getRandomPiece() {
      const pieceKeys = Object.keys(tetrisPieces);
      const randomIndex = this.getRandomIndex(pieceKeys.length);
      const randomType = pieceKeys[randomIndex];
      const randomShape = tetrisPieces[randomType];
  
      return new TetrisBlock(randomShape, { x: 0, y: 4 }, randomType);
    }
  
    
    getRandomIndex(max) {
      const lastIndex = this.lastRandomIndex;
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * max);
      } while (randomIndex === lastIndex);
      this.lastRandomIndex = randomIndex;
      return randomIndex;
    }
  
    moveTetrisBlock(direction) {
      const currentPosition = { ...this.currentTetrisBlock.position };
  
      if (direction === "left") {
        this.currentTetrisBlock.position.y -= 1;
      } else if (direction === "right") {
        this.currentTetrisBlock.position.y += 1;
      }
  
      if (!this.isValidMove()) {
        this.currentTetrisBlock.position = currentPosition;
        return;
      }
  
      this.renderBoard();
    }
  
    isValidMove(block) {
      let piece = block || this.currentTetrisBlock;
      const { x, y } = piece.position;
  
      for (const [offsetX, offsetY] of piece.shape) {
        const newRow = x + offsetX;
        const newCol = y + offsetY;
  
        // Check if the new position is within the boundaries
        if (newRow < 0 || newRow >= this.rows || newCol < 0 || newCol >= this.columns) {
          return false;
        }
  
        if (this.filledCells.some((cell) => cell.x === 0)) {
          this.gameOver();
        }
  
        // Check if the new position overlaps with filled cells
        if (this.filledCells.some((cell) => cell.x === newRow && cell.y === newCol)) {
          return false;
        }
      }
  
      // Check if the rotated piece's shape is within the valid Y boundaries
      const minY = Math.min(...piece.shape.map(([_, offsetY]) => y + offsetY)); 
      const maxY = Math.max(...piece.shape.map(([_, offsetY]) => y + offsetY)); 
  
      if (minY < 0 || maxY >= this.columns) {
        return false;
      }
  
      return true;
    }
  
    moveTetrisBlockDown() {
      const currentPosition = { ...this.currentTetrisBlock.position }; 
      this.currentTetrisBlock.position.x += 1; 
  
      if (!this.isValidMove()) {  
        this.currentTetrisBlock.position = currentPosition; 
        this.renderBoard();
        this.placeTetrisBlock();
        return;
      }
  
      this.renderBoard();
    }
  
    placeTetrisBlock() {
      for (const [offsetX, offsetY] of this.currentTetrisBlock.shape) {
        const row = this.currentTetrisBlock.position.x + offsetX;
        const col = this.currentTetrisBlock.position.y + offsetY;
  
        if (!this.filledCells.some((cell) => cell.x === row && cell.y === col)) {
          this.filledCells.push({ x: row, y: col });
        }
      }
  
      this.clearFullRows();
      this.currentTetrisBlock = this.getRandomPiece();
      this.renderBoard();
    }
  
    clearFullRows() {
      const fullyOccupiedRows = this.getFullyOccupiedRows(this.filledCells);
      this.filledCells = this.removeRows(this.filledCells, fullyOccupiedRows);
    }
  
    removeRows(cells, rowsToRemove) {
      let updatedCells = cells.filter((cell) => !rowsToRemove.includes(cell.x));
  
      if (rowsToRemove.length) {
        updatedCells = updatedCells.map((cell) => {
          let { x } = cell;
          const rowsAbove = rowsToRemove.filter((rowToRemove) => rowToRemove > x).length;
  
          if (rowsAbove > 0) {
            x += rowsAbove;
          }
  
          return { x, y: cell.y };
        });
      }
  
      return updatedCells;
    }
  
    getFullyOccupiedRows(occupiedCells) {
      const rowOccupancyMap = new Map();
  
  
      // goes through all x values of the filledCells and keeps track of each filled cell on a specific row
      occupiedCells.forEach((cell) => {
        const { x } = cell;
        if (!rowOccupancyMap.has(x)) {
          rowOccupancyMap.set(x, 1);
        } else {
          rowOccupancyMap.set(x, rowOccupancyMap.get(x) + 1);
        }
      });
  
      // if that row of filled cells equals the number of collums the board has
      const fullyOccupiedRows = [];
      rowOccupancyMap.forEach((count, row) => {
        if (count === this.columns) {
          fullyOccupiedRows.push(row);
        }
      });
  
      // then return the array of fully filled row []
      return fullyOccupiedRows;
    }
  
    startTetrisInterval() {
      this.intervalId = setInterval(() => {
        this.moveTetrisBlockDown();
      }, 300);
    }
  
    stopTetrisInterval() {
      clearInterval(this.intervalId);
    }
  
    setupEventListeners() {
      document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
          this.moveTetrisBlock("left");
          event.target.blur();
        } else if (event.key === "ArrowRight") {
          this.moveTetrisBlock("right");
          event.target.blur();
        } else if (event.key === " ") {
          this.rotateTetrisBlock();
          event.target.blur();
        }
      });
  
      document.getElementById("resetButton").addEventListener("click", () => {
        this.resetGame();
      });
  
      document.getElementById("pauseButton").addEventListener("click", () => {
        this.stopTetrisInterval();
      });
  
      document.getElementById("playButton").addEventListener("click", () => {
        this.stopTetrisInterval();
        this.startTetrisInterval();
      });
    }
  
    rotateTetrisBlock() {
      if (this.currentTetrisBlock.type !== "O") {
        const rotatedNew = this.currentTetrisBlock.shape.map((row) => [...row]);
  
        const rotatedShape = this.rotateShape(rotatedNew, this.currentTetrisBlock.type, this.currentTetrisBlock.rotation);
  
        const rotatedBlock = {
          shape: rotatedShape.shape,
          position: { ...this.currentTetrisBlock.position },
          type: this.currentTetrisBlock.type,
          rotation: rotatedShape.rotation, // Updated rotation
        };
  
        // Check if the rotated block fits within the boundaries
        if (this.isValidMove(rotatedBlock)) {
          this.currentTetrisBlock = rotatedBlock;
        }
      }
    }
  
    rotateShape(shape, type, rotation) {
      // Function to rotate a shape 90 degrees counter-clockwise
      let rotatedShape;
      let updatedRotation;
  
      switch (type) {
        case "T":
          switch (rotation) {
            case 0:
              rotatedShape = shape.map((row) => row.reverse()).reverse();
              updatedRotation = 1;
              break;
            case 1:
              rotatedShape = T[0];
              updatedRotation = 2;
              break;
            case 2:
              rotatedShape = T[1];
              updatedRotation = 3;
              break;
            case 3:
              rotatedShape = tetrisPieces.T;
              updatedRotation = 0;
              break;
            default:
              break;
          }
          break;
        case "L":
          switch (rotation) {
            case 0:
              rotatedShape = L[rotation];
              updatedRotation = 1;
              break;
            case 1:
              rotatedShape = L[rotation];
              updatedRotation = 2;
              break;
            case 2:
              rotatedShape = L[rotation];
              updatedRotation = 3;
              break;
            case 3:
              rotatedShape = tetrisPieces.L;
              updatedRotation = 0;
              break;
            default:
              break;
          }
          break;
        case "J":
          switch (rotation) {
            case 0:
              rotatedShape = J[rotation];
              updatedRotation = 1;
              break;
            case 1:
              rotatedShape = J[rotation];
              updatedRotation = 2;
              break;
            case 2:
              rotatedShape = J[rotation];
              updatedRotation = 3;
              break;
            case 3:
              rotatedShape = tetrisPieces.J;
              updatedRotation = 0;
              break;
            default:
              break;
          }
          break;
        case "S":
          if (rotation === 0) {
            rotatedShape = tetrisPieces.Z.map((row) => row.slice().reverse()); 
            updatedRotation = rotation + 1;
          } else {
            rotatedShape = tetrisPieces.S;
            updatedRotation = rotation - 1;
          }
          break;
        case "Z":
          if (rotation === 0) {
            rotatedShape = tetrisPieces.S.map((row) => row.slice().reverse());
            updatedRotation = rotation + 1;
          } else {
            rotatedShape = tetrisPieces.Z;
            updatedRotation = rotation - 1;
          }
          break;
        default:
          rotatedShape = shape.map((row) => row.reverse()).reverse(); 
      }
  
      return { shape: rotatedShape, rotation: updatedRotation };
    }
  }
  // Tetris pieces
  const tetrisPieces = {
    T: [
      [2, 1],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
    O: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    J: [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    L: [
      [2, 2],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    I: [
      [3, 1],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    S: [
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 2],
    ],
    Z: [
      [1, 0],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
  };
  
  // Rotated pieces
  L = [
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [0, 2],
    ],
    [
      [1, 0],
      [2, 1],
      [3, 1],
      [1, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 0],
    ],
  ];
  
  J = [
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [0, 0],
    ],
    [
      [1, 2],
      [3, 1],
      [2, 1],
      [1, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
  ];
  
  T = [
    [
      [1, 0],
      [1, 1],
      [0, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  ];
  
  // Initialize TetrisBoard
  const tetrisBoard = new TetrisBoard();