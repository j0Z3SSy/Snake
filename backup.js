class SnakeGame {
  // constructor to initialize the game
  constructor() {
    // global variables
    this.gridSize = 10;
    this.squareSize = 50;
    this.direction = "right";
    this.gameOver = false;
    this.gameStarted = false;
    this.points = 0;
    this.speed = 400;
    this.snake = [1];
    this.foodPosition = this.generateFoodPosition();
    // setup artwork for snake,food and gameboard
    this.snakeImage = new Image();
    this.foodImage = new Image();
    this.gameboardImage = new Image();
    this.snakeImage.src = "./artwork/snake.png";
    this.foodImage.src = "./artwork/food.png";
    this.gameboardImage.src = "./artwork/gameboard.png";
    // setup sound effects and audio for eating, start, game over and music
    this.snakeEats = new Audio();
    this.snakeEats.src = "./audio/eat.mp3";
    // get often used elements from html and local storage etc.
    this.grid = document.getElementById("gameboard");
    this.ctx = this.grid.getContext("2d");
    this.pointsElement = document.getElementById("points");
    this.highscoreElement = document.getElementById("highscore");
    this.highscore = localStorage.getItem("highScore") || 0;
    this.highscoreElement.textContent = this.highscore;
    this.gameOverElement = document.getElementById("gameOver");
    // setup grid and invoke the event listeners fro keyboard and events such as game over and opening the page
    this.setupGrid();
    this.attachEventListeners();
  }

  // method to setup the grid
  setupGrid() {
    this.grid.width = this.gridSize * this.squareSize;
    this.grid.height = this.gridSize * this.squareSize;
    // for debuggin
    console.log(
      "Grid Details - Width: " +
        this.grid.width +
        ", Height: " +
        this.grid.height +
        ", Grid Size: " +
        this.gridSize +
        ", Square Size: " +
        this.squareSize
    );
  }

  // method to draw the game board
  drawGameboard() {
    // draws all of the squares a.k.a gameboard with the artwork of gameboard
    this.ctx.clearRect(0, 0, this.grid.width, this.grid.height);
    for (let x = 0; x < this.grid.width; x += this.squareSize) {
      for (let y = 0; y < this.grid.height; y += this.squareSize) {
        this.ctx.drawImage(
          this.gameboardImage,
          x,
          y,
          this.squareSize,
          this.squareSize
        );
      }
    }
  }

  // method to draw the snake on the canvas
  drawSnake() {
    // check if the gameOver-flag is true. If so, do not proceed further.
    if (this.gameOver) return;
    const newHead = this.getNewHead();

    // for debugging
    // console.log("Before moving, snake is at:", this.snake);

    // check if the snake collides with itself
    if (this.snake.includes(newHead)) {
      this.gameOver = true;
      // for debuggin
      console.log("Game Over! Snake collided with its own body at:", newHead);
      return;
    }
    // first element = TAIL
    // last element = HEAD
    // move the snake by adding the new head at the end
    this.snake.push(newHead);
    // for debugging
    // console.log("After moving, snake is at:", this.snake);

    // check if the new head's position matches the food position
    if (newHead === this.foodPosition) {
      // for debugging
      console.log("Snake ate food at:", this.foodPosition);
      // play the eating sound
      this.snakeEats.play();
      // if so, generate new food, update the score, and increase difficulty by adding more speed
      this.foodPosition = this.generateFoodPosition();
      this.updateScore();
      this.updateSpeed();
      // for debugging
      console.log("New food generated at:", this.foodPosition);
    } else {
      // if no food was eaten, remove the tail to keep the snake's length constant
      this.snake.shift();
    }
    // for debugging
    // console.log("Final snake position this turn:", this.snake);

    // draw each segment of the snake on the canvas with the image of snake
    this.snake.forEach((segment) => {
      // convert index to x-coordinate
      const x = (segment % this.gridSize) * this.squareSize;
      // convert index to y-coordinate
      const y = Math.floor(segment / this.gridSize) * this.squareSize;

      // Set shadow properties
      this.setShadow(this.ctx, "rgba(53, 255, 137, 0.65)", 8);

      this.ctx.drawImage(
        this.snakeImage,
        x,
        y,
        this.squareSize,
        this.squareSize
      );

      // Reset shadow properties
      this.resetShadow(this.ctx);
    });
  }

  // methd to get the new head of the snake
  getNewHead() {
    let head = this.snake[this.snake.length - 1];
    // four possible directions for the snake to move
    // right, left, down, up
    switch (this.direction) {
      case "right":
        // if the snake is at the right edge of the grid, move it to the left edge
        return (head + 1) % this.gridSize === 0
          ? head - (this.gridSize - 1)
          : // if not, move it to the right
            head + 1;
      case "left":
        // if the snake is at the left edge of the grid, move it to the right edge
        return head % this.gridSize === 0
          ? head + (this.gridSize - 1)
          : // if not, move it to the left
            head - 1;
      case "down":
        // if the snake is at the bottom edge of the grid, move it to the top edge
        return head + this.gridSize >= this.gridSize * this.gridSize
          ? head % this.gridSize
          : // if not, move it down
            head + this.gridSize;
      case "up":
        // if the snake is at the top edge of the grid, move it to the bottom edge
        return head - this.gridSize < 0
          ? this.gridSize * this.gridSize -
              this.gridSize +
              (head % this.gridSize)
          : // if not, move it up
            head - this.gridSize;
    }
  }

  // method to generate a new food position for the drawFood method
  generateFoodPosition() {
    let pos;
    do {
      pos = Math.floor(Math.random() * 100);
    } while (this.snake.includes(pos));
    // for debugging
    console.log("Generated new food.");
    return pos;
  }

  // method to draw food on the canvas, location is determined by foodPosition which is generated by generateFoodPosition
  drawFood() {
    // draw food to the corresponding location (foodPosition) with image of food
    const x = (this.foodPosition % this.gridSize) * this.squareSize;
    const y = Math.floor(this.foodPosition / this.gridSize) * this.squareSize;
    // Set shadow properties
    this.setShadow(this.ctx, "rgba(255, 62, 62, 0.65)", 8);
    this.ctx.drawImage(this.foodImage, x, y, this.squareSize, this.squareSize);
    // Reset shadow properties
    this.resetShadow(this.ctx);
  }

  // method to update the score
  updateScore() {
    this.points++;
    this.pointsElement.textContent = this.points;
    // for debugging
    console.log("1+ point for eating added to the points.");
    let highScore = localStorage.getItem("highScore") || 0;
    highScore = parseInt(highScore);

    if (this.points > highScore) {
      localStorage.setItem("highScore", this.points);
      // for debugging
      console.log("New record set!");
    }
  }

  // method to increase the speed of the snake
  updateSpeed() {
    this.speed = Math.max(0, this.speed - 5);
    // for debugging
    console.log("Speed increased.");
  }

  // method to set shadow properties
  setShadow(ctx, color, blurAmount) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blurAmount;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // method to reset shadow properties
  resetShadow(ctx) {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // method to attach event listeners for keyboard and game over
  // also to start the game when the page is opened
  attachEventListeners() {
    document.addEventListener("keydown", (event) => {
      if (!this.gameStarted && event.key === "Enter") {
        this.gameStarted = true;
        document.getElementById("start").style.display = "none";
        this.gameLoop();
        // for debugging
        // console.log("gameStarted was false and Enter pressed!");
      } else if (event.key === "ArrowRight" && this.direction !== "left") {
        this.direction = "right";
        // for debugging
        // console.log("Right pressed!");
      } else if (event.key === "ArrowLeft" && this.direction !== "right") {
        this.direction = "left";
        // for debugging
        // console.log("Left pressed!");
      } else if (event.key === "ArrowDown" && this.direction !== "up") {
        this.direction = "down";
        // for debugging
        // console.log("Down pressed!");
      } else if (event.key === "ArrowUp" && this.direction !== "down") {
        this.direction = "up";
        // for debugging
        // console.log("Up pressed!");
      } else if (this.gameOver && event.key === "Enter") {
        this.resetGame();
        // for debugging
        // console.log("gameOver was true and Enter pressed!");
      }
    });
  }

  // method to reset the game
  resetGame() {
    this.gameOver = false;
    this.points = 0;
    this.speed = 400;
    this.pointsElement.textContent = this.points;
    this.gameOverElement.style.display = "none";
    this.direction = "right";
    this.snake = [1];
    this.foodPosition = this.generateFoodPosition();
    this.highscoreElement.textContent = localStorage.getItem("highScore") || 0;
    this.gameLoop();
    // for debugging
    console.log("Game was reset.");
  }

  // method to run the game loop
  gameLoop(timestamp = 0) {
    // stop the game loop if the game is over
    if (this.gameOver) {
      // display the game over box
      this.gameOverElement.style.display = "block";
      // display the highscore on the personal best box
      this.highscoreElement.textContent = this.highscore;
      return;
    }
    // initialize lastRenderTime on the first frame
    if (!this.lastRenderTime) this.lastRenderTime = timestamp;
    // calculate time since the last update
    const deltaTime = timestamp - this.lastRenderTime;

    // if enough time has passed, update the game state
    if (deltaTime > this.speed) {
      // reset timer
      this.lastRenderTime = timestamp;
      // draw the bame board, snake and food
      this.drawGameboard();
      this.drawSnake();
      this.drawFood();
    }
    // schedule the next game loop to sync with the screen refresh rate
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// create a new instance of the SnakeGame class
const game = new SnakeGame();
