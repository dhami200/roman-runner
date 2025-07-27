const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load images and sounds
const bgImage = new Image();
bgImage.src = "4y3y_6ciz_210426.jpg";

const playerImage = new Image();
playerImage.src = "fun-3d-illustration-roman-soldier-with-vr-helmet.png";

const coinImage = new Image();
coinImage.src = "10243319.png";

const jumpSound = new Audio("686523__xupr_e3__mixkit-arcade-game-jump-coin-216.wav");
const coinSound = new Audio("342750__rhodesmas__coins-purchase-4.wav");
const bgm = new Audio("410574__manuelgraf__game-background-music-loop-short.mp3");
bgm.loop = true;
bgm.volume = 0.5;
bgm.play();

// Game state
let isPaused = false;
let isGameOver = false;

// Player setup
const player = {
  x: 50,
  y: 300,
  width: 30,
  height: 30,
  velocityX: 0,
  velocityY: 0,
  speed: 4,
  jumpPower: -10,
  onGround: false,
};

const gravity = 0.5;
let score = 0;
let cameraX = 0;

// Platforms
const platforms = [];
for (let i = 0; i < 6; i++) {
  platforms.push({
    x: i * 200,
    y: 280 + Math.random() * 100,
    width: 100,
    height: 10,
  });
}
platforms.push({ x: 0, y: 370, width: 800, height: 30 }); // Ground

// Enemies
const enemies = [
  { x: 600, y: 340, width: 30, height: 30, speed: 2 },
];

// Coins
const coins = [];
for (let i = 0; i < 10; i++) {
  coins.push({
    x: 300 + i * 200,
    y: 250,
    width: 20,
    height: 20,
    collected: false,
  });
}

// Controls
const keys = { left: false, right: false, up: false };

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") keys.left = true;
  if (e.code === "ArrowRight") keys.right = true;
  if (e.code === "Space" || e.code === "ArrowUp") keys.up = true;
  if (e.code === "Escape") togglePause();
});
document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
  if (e.code === "Space" || e.code === "ArrowUp") keys.up = false;
});

document.addEventListener("keydown", (e) => {
  if (isGameOver) {
    if (e.code === "KeyR") location.reload();
    if (e.code === "KeyQ") window.close(); // browser won't allow this
  }
});

function togglePause() {
  isPaused = !isPaused;
  if (!isPaused) gameLoop();
}

function showGameOverMenu() {
  isGameOver = true;
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.fillText("💀 Game Over! Your Score: " + score, 220, 150);
  ctx.fillText("Press R to Restart or Q to Quit", 210, 200);
}

function gameLoop() {
  if (isPaused || isGameOver) return;

  // Scroll background
  cameraX = player.x - 100;
  let bgScroll = cameraX % canvas.width;
  ctx.drawImage(bgImage, -bgScroll, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, canvas.width - bgScroll, 0, canvas.width, canvas.height);

  // Movement
  player.velocityX = keys.left ? -player.speed : keys.right ? player.speed : 0;
  if (keys.up && player.onGround) {
    player.velocityY = player.jumpPower;
    player.onGround = false;
    jumpSound.play();
  }

  player.velocityY += gravity;
  player.x += player.velocityX;
  player.y += player.velocityY;

  // Platform collision
  player.onGround = false;
  platforms.forEach((plat) => {
    if (plat.x + plat.width < cameraX - 100) {
      plat.x = cameraX + canvas.width + Math.random() * 200;
      plat.y = 150 + Math.random() * 200;
    }

    if (
      player.x < plat.x + plat.width &&
      player.x + player.width > plat.x &&
      player.y < plat.y + plat.height &&
      player.y + player.height > plat.y
    ) {
      if (player.velocityY > 0) {
        player.y = plat.y - player.height;
        player.velocityY = 0;
        player.onGround = true;
      }
    }

    ctx.fillStyle = "#999";
    ctx.fillRect(plat.x - cameraX, plat.y, plat.width, plat.height);
    ctx.strokeStyle = "#666";
    ctx.strokeRect(plat.x - cameraX, plat.y, plat.width, plat.height);
  });

  // Enemies
  enemies.forEach((enemy) => {
    enemy.x -= enemy.speed;
    if (enemy.x < cameraX - enemy.width) {
      enemy.x = cameraX + canvas.width + Math.random() * 300;
      enemy.y = 340;
    }

    ctx.fillStyle = "purple";
    ctx.fillRect(enemy.x - cameraX, enemy.y, enemy.width, enemy.height);

    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      showGameOverMenu();
      return;
    }
  });

  // Coins
  coins.forEach((coin) => {
    if (!coin.collected) {
      ctx.drawImage(coinImage, coin.x - cameraX, coin.y, coin.width, coin.height);
      if (
        player.x < coin.x + coin.width &&
        player.x + player.width > coin.x &&
        player.y < coin.y + coin.height &&
        player.y + player.height > coin.y
      ) {
        coin.collected = true;
        score += 10;
        coinSound.play();
      }
    }
  });

  // Player
  ctx.drawImage(playerImage, player.x - cameraX, player.y, player.width, player.height);

  // Score
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 25);
  score++;

  requestAnimationFrame(gameLoop);
}

gameLoop();
