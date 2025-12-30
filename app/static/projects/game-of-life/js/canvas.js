// Constants
const CANVAS_SIZE = 500;
const INITIAL_GRID_SIZE = 25;
const INITIAL_INTERVAL_SECONDS = 1000;

// Canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

// Set the canvas size and scale it according to the device pixel ratio
canvas.width = CANVAS_SIZE * dpr;
canvas.height = CANVAS_SIZE * dpr;
canvas.style.width = `${CANVAS_SIZE}px`;
canvas.style.height = `${CANVAS_SIZE}px`;
ctx.scale(dpr, dpr);
ctx.fillStyle = "white";

// Initialize grid information
let gridSize = INITIAL_GRID_SIZE;
let cellSize = (CANVAS_SIZE / dpr - (gridSize + 1)) / gridSize;
let reset = false;
let intervalRunning = false;
let intervalId;
let intervalSeconds = INITIAL_INTERVAL_SECONDS;

// Utility function to create a grid with a specified value
const createGrid = (size, valueFunc) =>
  Array.from({ length: size }, () => Array.from({ length: size }, valueFunc));

// Initialize the grid with random states
let grid = createGrid(gridSize, () => Math.round(Math.random()));

/**
 * @description Draw the grid on the canvas.
 * @param {number} gridSize - The number of cells in each row or column of the grid.
 * @param {number} cellSize - The width and height of each cell in the grid in pixels.
 * @param {number[][]} grid - The grid containing the states of all the cells in the grid.
 * @param {HTMLCanvasElement} canvas - The canvas to draw the grid upon.
 * @param {CanvasRenderingContext2D} ctx - The context to draw on the canvas.
 * @returns {void}
 */
export function drawGrid(gridSize, cellSize, grid, canvas, ctx) {
  // Clear the canvas before drawing on it.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the state of each cell in the grid onto the canvas.
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cellState = grid[j][i];

      // Colour the cell white if it's state is 1 or black if it's state is 0.
      ctx.fillStyle = cellState === 0 ? "black" : "white";
      ctx.fillRect(
        i + 1 + i * cellSize,
        j + 1 + j * cellSize,
        cellSize,
        cellSize
      );
    }
  }
}

/**
 * @description Gets the cells in a 3 by 3 grid with the cell at the given x, y coordinates at the centre of the grid.
 * @param {number} c - The column of the cell in the grid.
 * @param {number} r - The row of the cell in the grid.
 * @param {number[][]} grid - The grid containing the states of all the cells in the grid.
 * @param {number} gridSize - The number of cells in each row or column of the grid.
 * @returns {number[]} A list of the states of all adjacent cells.
 */
export function getAdjacentCells(c, r, grid, gridSize) {
  const adjacentCells = [];

  // Loop through each cell adjacent to the given row and column.
  for (let i = 0; i < 9; i++) {
    // Calculate the row and column of the adjacent cell relative to the given row and column.
    const row = Math.floor(i / 3) - 1 + r;
    const column = (i % 3) - 1 + c;

    // Checks if the row and column are in the bounds of the grid.
    if (0 <= row && row < gridSize && 0 <= column && column < gridSize) {
      // Checks if the cell is not the input cell.
      if ((row !== r) | (column !== c)) {
        // Appends the state of the adjacent cell to the array.
        adjacentCells.push(grid[row][column]);
      }
    }
  }

  // Returns the state of all the adjacent cells.
  return adjacentCells;
}

/**
 * @description
 * @param {number} numLiveAdjacentCells - The number of adjacent cells that are live (have a state of 1).
 * @param {number} cellState - The current state of the cell.
 * @returns {number} The next state of the cell based on the current states of the adjacent cells.
 */
export function calculateNextState(numLiveAdjacentCells, cellState) {
  if (cellState === 1 && numLiveAdjacentCells < 2) {
    // The cell dies if there are less than two live cells adjacent to it.
    return 0;
  } else if (
    cellState === 1 &&
    (numLiveAdjacentCells === 2) | (numLiveAdjacentCells === 3)
  ) {
    // The cell remains alive if there are two or three live cells adjacent to it.
    return cellState;
  } else if (cellState === 1 && numLiveAdjacentCells > 3) {
    // The cell dies if there are more than three live cells adjacent to it.
    return 0;
  } else if (cellState === 0 && numLiveAdjacentCells === 3) {
    // The cell becomes alive if there are three live cells adjacent to it.
    return 1;
  }

  // All cells that do not meet these conditions remain dead.
  return 0;
}

/**
 * @description
 */
function main() {
  const tempGrid = grid.map((row) => [...row]);

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const adjacentCells = getAdjacentCells(j, i, grid, gridSize).filter(
        (state) => state === 1
      ).length;
      tempGrid[i][j] = calculateNextState(adjacentCells, grid[i][j]);
    }
  }

  grid = tempGrid;
  drawGrid(gridSize, cellSize, grid, canvas, ctx);
}

function toggleInterval(intervalSeconds) {
  const icons = document.querySelectorAll(".icon");
  icons.forEach((icon) => {
    icon.classList.toggle("hidden");
  });

  if (reset === true) {
    grid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => Math.round(Math.random()))
    );
    reset = false;
  }
  if (intervalRunning) {
    startGrid = grid;
    clearInterval(intervalId);
  } else {
    grid = startGrid;
    intervalId = setInterval(main, intervalSeconds);
  }

  intervalRunning = !intervalRunning;
}

const startStopButton = document.getElementById("startStopButton");
startStopButton.addEventListener("click", function () {
  toggleInterval(intervalSeconds, reset);
});

let startGrid = Array.from({ length: gridSize }, () =>
  Array.from({ length: gridSize }, () => 0)
);
drawGrid(gridSize, cellSize, startGrid, canvas, ctx);

function updateSlider(sliderLabel, slider) {
  const value = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(to right, grey ${value}%, white ${value}%)`;
  sliderLabel.textContent = slider.value;

  if (slider.id === "gridSizeSlider") {
    gridSize = parseInt(slider.value);
    cellSize = (canvas.width / dpr - (gridSize + 1)) / gridSize;

    startGrid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => 0)
    );

    grid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => Math.round(Math.random()))
    );

    if (intervalRunning) {
      toggleInterval(intervalSeconds);
    }

    drawGrid(gridSize, cellSize, startGrid, canvas, ctx);
  } else if (slider.id === "refreshRateSlider") {
    intervalSeconds = slider.value * 1000;
    if (intervalRunning) {
      toggleInterval(intervalSeconds);
    }
  }
}

function resetPage() {
  grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 0)
  );
  startGrid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 0)
  );
  drawGrid(gridSize, cellSize, grid, canvas, ctx);
  reset = true;

  if (intervalRunning) {
    toggleInterval(intervalSeconds);
  }
}

const gridSizeAmount = document.getElementById("gridSizeAmount");
const gridSizeSlider = document.getElementById("gridSizeSlider");
const refreshRateAmount = document.getElementById("refreshRateAmount");
const refreshRateSlider = document.getElementById("refreshRateSlider");

document.addEventListener("DOMContentLoaded", function () {
  updateSlider(gridSizeAmount, gridSizeSlider);
  updateSlider(refreshRateAmount, refreshRateSlider);
});

gridSizeSlider.addEventListener("input", function () {
  updateSlider(gridSizeAmount, gridSizeSlider);
});

refreshRateSlider.addEventListener("input", function () {
  updateSlider(refreshRateAmount, refreshRateSlider);
});

const resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", resetPage);

let isMouseDown = false;

canvas.addEventListener("mousedown", (event) => {
  isMouseDown = true;
  if (intervalRunning) {
    toggleInterval();
  }
  handleMouseEvent(event);
});

canvas.addEventListener("mousemove", (event) => {
  if (isMouseDown && !intervalRunning) {
    handleMouseEvent(event);
  }
});

canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
});

function replaceSection(grid, replacement, startX, startY) {
  for (let i = 0; i < replacement.length; i++) {
    for (let j = 0; j < replacement[i].length; j++) {
      grid[startX + i][startY + j] = replacement[i][j];
    }
  }
}

let activeColour = 1;

const brush = document.getElementById("brush-button");
const eraser = document.getElementById("eraser-button");
const spaceship = document.getElementById("spaceship-button");
const methuselah = document.getElementById("methuselah-button");
const gun = document.getElementById("gun-button");
const puffer = document.getElementById("puffer-button");
const diamond = document.getElementById("diamond-button");
const randomise = document.getElementById("randomise-button");

brush.addEventListener("click", () => {
  activeColour = 1;
  canvas.style.cursor = `url(${imgFolderPath}/brush-icon.svg) 0 24, auto`;
});

eraser.addEventListener("click", () => {
  activeColour = 0;
  canvas.style.cursor = `url(${imgFolderPath}/eraser-icon.svg) 0 24, auto`;
});

spaceship.addEventListener("click", () => {
  resetPage();
  const minSize = 10;
  if (gridSize < minSize) {
    gridSizeAmount.textContent = minSize;
    gridSizeSlider.value = minSize;
    const value =
      ((minSize - gridSizeSlider.min) /
        (gridSizeSlider.max - gridSizeSlider.min)) *
      100;
    gridSizeSlider.style.background = `linear-gradient(to right, grey ${value}%, white ${value}%)`;

    gridSize = minSize;
    cellSize = (canvas.width / dpr - (gridSize + 1)) / gridSize;
  }

  startGrid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 0)
  );

  const spaceshipPattern = [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1],
  ];

  replaceSection(startGrid, spaceshipPattern, 1, 1);

  drawGrid(gridSize, cellSize, startGrid, canvas, ctx);
});

methuselah.addEventListener("click", () => {
  resetPage();
  const minSize = 200;
  if (gridSize < minSize) {
    gridSizeAmount.textContent = minSize;
    gridSizeSlider.value = minSize;
    const value =
      ((minSize - gridSizeSlider.min) /
        (gridSizeSlider.max - gridSizeSlider.min)) *
      100;
    gridSizeSlider.style.background = `linear-gradient(to right, grey ${value}%, white ${value}%)`;

    gridSize = minSize;
    cellSize = (canvas.width / dpr - (gridSize + 1)) / gridSize;
  }

  startGrid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 0)
  );

  const methuselahPattern = [
    [0, 1, 1],
    [1, 1, 0],
    [0, 1, 0],
  ];

  replaceSection(startGrid, methuselahPattern, 99, 99);

  drawGrid(gridSize, cellSize, startGrid, canvas, ctx);
});

gun.addEventListener("click", () => {
  resetPage();
  const minSize = 40;
  if (gridSize < minSize) {
    gridSizeAmount.textContent = minSize;
    gridSizeSlider.value = minSize;
    const value =
      ((minSize - gridSizeSlider.min) /
        (gridSizeSlider.max - gridSizeSlider.min)) *
      100;
    gridSizeSlider.style.background = `linear-gradient(to right, grey ${value}%, white ${value}%)`;

    gridSize = minSize;
    cellSize = (canvas.width / dpr - (gridSize + 1)) / gridSize;
  }

  startGrid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 0)
  );

  const gunPattern = [
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
    ],
    [
      1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
  ];

  replaceSection(startGrid, gunPattern, 1, 1);

  drawGrid(gridSize, cellSize, startGrid, canvas, ctx);
});

puffer.addEventListener("click", () => {
  resetPage();
  const minSize = 200;
  if (gridSize < minSize) {
    gridSizeAmount.textContent = minSize;
    gridSizeSlider.value = minSize;
    const value =
      ((minSize - gridSizeSlider.min) /
        (gridSizeSlider.max - gridSizeSlider.min)) *
      100;
    gridSizeSlider.style.background = `linear-gradient(to right, grey ${value}%, white ${value}%)`;

    gridSize = minSize;
    cellSize = (canvas.width / dpr - (gridSize + 1)) / gridSize;
  }

  startGrid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 0)
  );

  const pufferPattern = [
    [
      0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1,
      1, 0,
    ],
    [
      1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0,
      0, 1,
    ],
    [
      0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0,
      0, 0,
    ],
    [
      0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
      0, 0,
    ],
    [
      0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0,
      0, 0,
    ],
    [
      0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0,
      0, 0,
    ],
    [
      0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1,
      0, 0,
    ],
  ];

  replaceSection(startGrid, pufferPattern, 192, 85);

  drawGrid(gridSize, cellSize, startGrid, canvas, ctx);
});

diamond.addEventListener("click", () => {
  resetPage();
  const minSize = 15;
  if (gridSize < minSize) {
    gridSizeAmount.textContent = minSize;
    gridSizeSlider.value = minSize;
    const value =
      ((minSize - gridSizeSlider.min) /
        (gridSizeSlider.max - gridSizeSlider.min)) *
      100;
    gridSizeSlider.style.background = `linear-gradient(to right, grey ${value}%, white ${value}%)`;

    gridSize = minSize;
    cellSize = (canvas.width / dpr - (gridSize + 1)) / gridSize;
  }

  startGrid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 0)
  );

  const diamondPattern = [
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  ];

  replaceSection(startGrid, diamondPattern, 1, 1);

  drawGrid(gridSize, cellSize, startGrid, canvas, ctx);
});

randomise.addEventListener("click", () => {
  resetPage();
  
  startGrid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => Math.round(Math.random()))
  );

  drawGrid(gridSize, cellSize, startGrid, canvas, ctx);
});

function handleMouseEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const row = Math.floor(mouseY / (cellSize + 1));
  const column = Math.floor(mouseX / (cellSize + 1));

  if (
    row >= 0 &&
    row < startGrid.length &&
    column >= 0 &&
    column < startGrid[0].length
  ) {
    startGrid[row][column] = activeColour;
    drawGrid(gridSize, cellSize, startGrid, canvas, ctx);
  }
}
