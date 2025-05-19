const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const gravity = 0.3;
const jumpStrength = -5;
const pipeGap = 105;
const pipeWidth = 50;
const pipeSpeed = 6;


const birdImg = new Image();

let isGameOver = false;
let score = 0;

let birds = []

birdImg.src = 'assets/Frame-1.png';

function createBird(brain = null) {
  return {
    x: 80,
    y: 200,
    width: 47,
    height: 40,
    velocity: 0,
    score: 0,
    alive: true,
    brain: brain
  };
}

let bird = {
  x: 80,
  y: 200,
  width: 47,
  height: 40,
  velocity: 0,
};

let pipes = [];
function spawnPipe() {
  const topHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 140)) + 70;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: topHeight + pipeGap,
    passed: false,
  });
}

let frame = 0;
function update() {
  if (isGameOver) return;

  bird.velocity += gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height >= canvas.height) {
    bird.y = canvas.height - bird.height;
    isGameOver = true;
    return;
  }

  if (frame % 55 === 0) spawnPipe();

  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;

    if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
      pipe.passed = true;
      score++;
    }
  });

  pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

  pipes.forEach(pipe => {
    const birdLeft = bird.x;
    const birdRight = bird.x + bird.width;
    const birdTop = bird.y;
    const birdBottom = bird.y + bird.height;
  
    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipeWidth;
  
    const horizontalCollision = birdRight > pipeLeft && birdLeft < pipeRight;
  
    if (horizontalCollision) {
      const hitsTopPipe = birdTop < pipe.top;
      const hitsBottomPipe = birdBottom > pipe.bottom;
  
      if (hitsTopPipe || hitsBottomPipe) {
        isGameOver = true;
      }
    }
  });
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.strokeRect(bird.x, bird.y, bird.width, bird.height);

  ctx.fillStyle = 'green';
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
  });

  ctx.fillStyle = 'black';
  ctx.font = '36px sans-serif';
  ctx.fillText(`Score: ${score}`, 20, 50);

  if (isGameOver) {
    ctx.fillStyle = 'black';
    ctx.font = '48px sans-serif';
    ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2);
  }
  
}

function gameLoop() {
  update();
  draw();
  frame++;
  requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    bird.velocity = jumpStrength;
  }
});

gameLoop();
