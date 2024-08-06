// script.js

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const scoreSound = new Audio('scorePop.mp3'); // Replace with your actual sound file path
const gameOverSound = new Audio('GameOverSound.mp3'); // Replace with your actual sound file path

// Set canvas size to 75% of the viewport
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.75;
    canvas.height = window.innerHeight * 0.75;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const bird = {
    x: 50,
    y: canvas.height / 2 - 10,
    width: 30,
    height: 30,
    gravity: 0.3,
    lift: -7,
    velocity: 0
};

const pipes = [];
const pipeWidth = 40;
const pipeGap = canvas.height * 0.25;
let frameCount = 0;
let gameOver = false;
let score = 0;
const tailSegments = [];

// Number of tail segments
const numTailSegments = 20; // Adjust as needed

// Initialize tail segments with initial positions and opacity
for (let i = 0; i < numTailSegments; i++) {
    tailSegments.push({
        x: bird.x,
        y: bird.y,
        opacity: 1 - i * (0.8 / numTailSegments) // Adjust opacity levels
    });
}


function drawBird() {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Update tail segments
    for (let i = tailSegments.length - 1; i >= 0; i--) {
        if (i === 0) {
            // Set the first tail segment to the bird's current position
            tailSegments[i].x = bird.x;
            tailSegments[i].y = bird.y;
        } else {
            // Move each tail segment towards the previous one
            tailSegments[i].x = tailSegments[i - 1].x;
            tailSegments[i].y = tailSegments[i - 1].y;
        }

        // Decrease opacity gradually
        tailSegments[i].opacity -= 0.01; // Adjust the opacity decrease rate

        // Remove tail segment if opacity is too low
        if (tailSegments[i].opacity <= 0) {
            tailSegments.pop();
        }
    }

    // Draw tail segments
    tailSegments.forEach((segment, index) => {
        context.fillStyle = `rgba(255, 255, 0, ${segment.opacity})`;
        context.fillRect(segment.x, segment.y, bird.width, bird.height);
    });

    // Draw main bird
    context.fillStyle = 'yellow';
    context.fillRect(bird.x, bird.y, bird.width, bird.height);
}


function drawPipes() {
    context.fillStyle = 'green';
    pipes.forEach(pipe => {
        context.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        context.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
        gameOver = true;
    }
}

function updatePipes() {
    if (frameCount % 90 === 0) {
        const topPipeHeight = Math.random() * (canvas.height - pipeGap - 20) + 20;
        const bottomPipeHeight = canvas.height - topPipeHeight - pipeGap;
        pipes.push({ x: canvas.width, top: topPipeHeight, bottom: bottomPipeHeight, passed: false });
    }

    pipes.forEach(pipe => {
        pipe.x -= 4;

        if (!pipe.passed && pipe.x < bird.x - bird.width) {
            pipe.passed = true;
            score++;
            scoreDisplay.innerText = `Score: ${score}`;

            // Play score sound
            playScoreSound();

            // Apply pop animation class
            scoreDisplay.classList.add('score-pop');
            setTimeout(() => {
                scoreDisplay.classList.remove('score-pop');
            }, 500); // 500ms should match the duration of the animation in CSS
        }
    });

    if (pipes.length && pipes[0].x < -pipeWidth) {
        pipes.shift();
    }
}

function playScoreSound() {
    scoreSound.currentTime = 0; // Rewind to the beginning (in case it's already playing)
    scoreSound.play()
        .catch(error => console.error('Error playing score sound:', error));
}

function checkCollision() {
    pipes.forEach(pipe => {
        if (bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)) {
            gameOver = true;
        }
    });

    if (gameOver) {
        // Play game over sound
        gameOverSound.currentTime = 0; // Rewind to the beginning (in case it's already playing)
        gameOverSound.play()
            .catch(error => console.error('Error playing game over sound:', error));
    }
}

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        drawBird();
        drawPipes();
        updateBird();
        updatePipes();
        checkCollision();

        frameCount++;
        requestAnimationFrame(gameLoop);
    } else {
        context.fillStyle = 'red';
        context.font = '100px Arial';
        context.fillText('Game Over', canvas.width / 4, canvas.height / 2);
    }
}

canvas.addEventListener('click', () => {
    if (!gameOver) {
        bird.velocity = bird.lift;
    } else {
        resetGame();
    }
});

function resetGame() {
    bird.y = canvas.height / 2 - 10;
    bird.velocity = 0;
    pipes.length = 0;
    frameCount = 0;
    gameOver = false;
    score = 0;
    scoreDisplay.innerText = 'Score: 0';
    gameLoop();
}

// Preload audio files
scoreSound.load();
gameOverSound.load();

// Start the game loop
gameLoop();
