const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('currentScore');
const bestScoreEl = document.getElementById('bestScore');
const overlay = document.getElementById('overlay');
const overlayContent = document.getElementById('overlayContent');
const startButton = document.getElementById('startButton');
const GRAVITY = 0.25;
const JUMP = -5.5;
const PIPE_SPEED = 2;
const PIPE_SPAWN_INTERVAL = 110;
let bird = { x: 50, y: 240, radius: 12, velocity: 0 };
let pipes = [];
let score = 0;
let bestScore = localStorage.getItem('arcadeBestScore') || 0;
let frameCount = 0;
let gameState = 'START';
bestScoreEl.textContent = bestScore;
function resetGame() {
  bird.x = 50;
  bird.y = 240;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  frameCount = 0;
  currentScoreEl.textContent = score;
}
function startGame() {
  resetGame();
  gameState = 'PLAYING';
  overlay.classList.add('hidden');
  loop();
}
function gameOver() {
  gameState = 'OVER';
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('arcadeBestScore', bestScore);
    bestScoreEl.textContent = bestScore;
  }
  overlayContent.querySelector('h2').textContent = 'Game Over';
  overlayContent.querySelector('p').textContent = 'Score: ' + score;
  startButton.textContent = 'Play Again';
  overlay.classList.remove('hidden');
}
function triggerJump() {
  if (gameState === 'PLAYING') {
    bird.velocity = JUMP;
  }
}
function update() {
  if (gameState !== 'PLAYING') return;
  bird.velocity += GRAVITY;
  bird.y += bird.velocity;
  if (bird.y + bird.radius >= canvas.height - 40) {
    bird.y = canvas.height - 40 - bird.radius;
    gameOver();
    return;
  }
  if (bird.y - bird.radius <= 0) {
    bird.y = bird.radius;
    bird.velocity = 0;
  }
  if (frameCount % PIPE_SPAWN_INTERVAL === 0) {
    let minHeight = 60;
    let maxHeight = canvas.height - 180;
    let height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipes.push({
      x: canvas.width,
      top: height,
      bottom: canvas.height - height - 110,
      width: 50,
      passed: false
    });
  }
  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].x -= PIPE_SPEED;
    if (
      bird.x + bird.radius > pipes[i].x &&
      bird.x - bird.radius < pipes[i].x + pipes[i].width &&
      (bird.y - bird.radius < pipes[i].top ||
       bird.y + bird.radius > canvas.height - pipes[i].bottom)
    ) {
      gameOver();
      return;
    }
    if (!pipes[i].passed && pipes[i].x + pipes[i].width < bird.x) {
      pipes[i].passed = true;
      score++;
      currentScoreEl.textContent = score;
    }
    if (pipes[i].x + pipes[i].width < 0) {
      pipes.splice(i, 1);
    }
  }
  frameCount++;
}
function draw() {
  ctx.fillStyle = '#4ec0ca';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ded895';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
  ctx.fillStyle = '#73bf2e';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 8);
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(p.x, 0, p.width, p.top);
    ctx.fillRect(p.x - 2, p.top - 16, p.width + 4, 16);
    ctx.fillRect(p.x, canvas.height - p.bottom, p.width, p.bottom);
    ctx.fillRect(p.x - 2, canvas.height - p.bottom, p.width + 4, 16);
  }
  ctx.fillStyle = '#f8e71c';
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#333333';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(bird.x + 4, bird.y - 3, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(bird.x + 5, bird.y - 3, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5a623';
  ctx.beginPath();
  ctx.moveTo(bird.x + bird.radius, bird.y);
  ctx.lineTo(bird.x + bird.radius + 6, bird.y - 3);
  ctx.lineTo(bird.x + bird.radius + 6, bird.y + 3);
  ctx.closePath();
  ctx.fill();
}
function loop() {
  update();
  draw();
  if (gameState === 'PLAYING') {
    requestAnimationFrame(loop);
  }
}
startButton.addEventListener('click', startGame);
window.addEventListener('keydown', function(e) {
  if (e.code === 'Space') {
    e.preventDefault();
    if (gameState === 'START' || gameState === 'OVER') {
      startGame();
    } else {
      triggerJump();
    }
  }
});
canvas.addEventListener('click', function() {
  if (gameState === 'PLAYING') {
    triggerJump();
  }
});
draw();
