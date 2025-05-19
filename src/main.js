import * as neataptic from "neataptic";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
const gravity = 0.3;
const jumpStrength = -4;
const pipeGap = 105;
const pipeWidth = 50;
const pipeSpeed = 5;
const populationSize = 100;
const inputSize = 5;
const outputSize = 1;

const birdFrames = [];
for (let i = 1; i <= 4; i++) {
  const img = new Image();
  img.src = `assets/Frame-${i}.png`;
  birdFrames.push(img);
}

let score = 0;
let frame = 0;
let birds = [];
let pipes = [];
let isEvolving = false;

let neat = new neataptic.Neat(inputSize, outputSize, null, {
  popsize: populationSize,
  mutation: [
    neataptic.methods.mutation.MOD_WEIGHT,
    neataptic.methods.mutation.MOD_BIAS,
    neataptic.methods.mutation.ADD_CONN,
    neataptic.methods.mutation.SUB_CONN,
    neataptic.methods.mutation.ADD_NODE,
    neataptic.methods.mutation.SUB_NODE,
  ],
  mutationRate: 0.1,
  elitism: Math.round(0.1 * populationSize),
  selection: neataptic.methods.selection.FITNESS_PROPORTIONATE,
});


function createBird(genome = null) {
  return {
    x: 80,
    y: canvas.height * (0.2 + Math.random() * 0.6),
    width: 47,
    height: 40,
    velocity: 0,
    score: 0,
    alive: true,
    genome: genome,
    animationFrame: Math.floor(Math.random() * birdFrames.length),
    animationCounter: 0,
  };
}

function spawnPipe() {
  const topHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 140)) + 70;
  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: topHeight + pipeGap,
    passed: false,
  });
}

function startGeneration() {
  birds = [];
  pipes = [];
  frame = 0;
  score = 0;

  for (let i = 0; i < neat.population.length; i++) {
    let genome = neat.population[i];
    birds.push(createBird(genome));
  }
}

function endGeneration() {
  if (isEvolving) return;
  isEvolving = true;

  console.log(`Generation ${neat.generation} finished. Score: ${score}`);

  for (let i = 0; i < birds.length; i++) {
    birds[i].genome.score = birds[i].score;
  }

  neat.evolve().then(() => {
    isEvolving = false;
    startGeneration();
  });
}


function normalizeVelocity(velocity) {
  return Math.max(-1, Math.min(1, velocity / 10));
}

function update() {
  if (isEvolving) return;
  if (frame % 90 === 0) spawnPipe();

  pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed;

    birds.forEach((bird) => {
      if (!pipe.passed && pipe.x + pipeWidth < bird.x && bird.alive) {
        pipe.passed = true;
        bird.score += 5;
        score++;
      }
    });
  });

  pipes = pipes.filter((pipe) => pipe.x + pipeWidth > 0);

  for (let bird of birds) {
    if (!bird.alive) continue;

    bird.animationCounter++;
    if (bird.animationCounter % 5 === 0) { // Change x to increase animation switch
      bird.animationFrame = (bird.animationFrame + 1) % birdFrames.length;
    }

    bird.score += 0.1;
    bird.velocity += gravity;
    bird.y += bird.velocity;

    let nearest = pipes.find((pipe) => pipe.x + pipeWidth > bird.x);

    if (nearest) {
      const inputs = [
        normalizeVelocity(bird.velocity),
        (nearest.x - bird.x) / canvas.width,
        (bird.y - nearest.top) / canvas.height,
        (nearest.bottom - bird.y) / canvas.height,
        (bird.y - (nearest.top + pipeGap / 2)) / canvas.height
      ];



      const output = bird.genome.activate(inputs);
      if (output[0] > 0.5) {
        bird.velocity = jumpStrength;
      }

      // Collision detection
      const birdTop = bird.y;
      const birdBottom = bird.y + bird.height;
      const birdLeft = bird.x;
      const birdRight = bird.x + bird.width;
      const pipeLeft = nearest.x;
      const pipeRight = nearest.x + pipeWidth;

      const horizontal = birdRight > pipeLeft && birdLeft < pipeRight;
      const verticalCollision = birdTop < nearest.top || birdBottom > nearest.bottom;

      if (
        bird.y + bird.height >= canvas.height || // Floor
        bird.y < 0 || // Ceiling
        (horizontal && verticalCollision)
      ) {
        bird.alive = false;
      }
    }
  }

  if (birds.every((b) => !b.alive)) {
    endGeneration();
  }

  frame++;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "green";
  pipes.forEach((pipe) => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
  });

  for (let bird of birds) {
    if (!bird.alive) continue;
      ctx.drawImage(birdFrames[bird.animationFrame], bird.x, bird.y, bird.width, bird.height);
  }

  ctx.fillStyle = "black";
  ctx.font = "36px sans-serif";
  ctx.fillText(`Score: ${score}`, 20, 50);
}

function gameLoop() {
  for (let i = 0; i < 2; i++) {
    update();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

startGeneration();
gameLoop();
