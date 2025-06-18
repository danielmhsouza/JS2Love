// Example game using Love2D JS Engine
// This demonstrates the Love2D-like API

// Game state
const game = {
  player: {
    x: 400,
    y: 300,
    size: 20,
    speed: 200,
    color: { r: 100, g: 150, b: 255 }
  },

  particles: [],

  colors: [
    { r: 255, g: 100, b: 100 },
    { r: 100, g: 255, b: 100 },
    { r: 100, g: 100, b: 255 },
    { r: 255, g: 255, b: 100 },
    { r: 255, g: 100, b: 255 },
    { r: 100, g: 255, b: 255 }
  ],

  colorIndex: 0,

  beepSound: null
};

// Love2D callbacks
window.love.load = function () {
  console.log("Game loaded!");
  love.graphics.setBackgroundColor(20, 20, 40);

  // Create a simple beep sound
  game.beepSound = love.audio.newSource(440, 'sine', 0.1);

  // Initialize some particles
  for (let i = 0; i < 50; i++) {
    game.particles.push({
      x: love.math.random(0, love.graphics.getWidth()),
      y: love.math.random(0, love.graphics.getHeight()),
      vx: love.math.random(-50, 50),
      vy: love.math.random(-50, 50),
      size: love.math.random(2, 6),
      life: love.math.random(1, 3),
      maxLife: love.math.random(1, 3)
    });
  }
};

window.love.update = function (dt) {
  // Player movement
  if (love.keyboard.isDown('w') || love.keyboard.isDown('arrowup')) {
    game.player.y -= game.player.speed * dt;
  }
  if (love.keyboard.isDown('s') || love.keyboard.isDown('arrowdown')) {
    game.player.y += game.player.speed * dt;
  }
  if (love.keyboard.isDown('a') || love.keyboard.isDown('arrowleft')) {
    game.player.x -= game.player.speed * dt;
  }
  if (love.keyboard.isDown('d') || love.keyboard.isDown('arrowright')) {
    game.player.x += game.player.speed * dt;
  }

  // Keep player in bounds
  game.player.x = Math.max(game.player.size, Math.min(love.graphics.getWidth() - game.player.size, game.player.x));
  game.player.y = Math.max(game.player.size, Math.min(love.graphics.getHeight() - game.player.size, game.player.y));

  // Update particles
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const particle = game.particles[i];

    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;

    // Wrap around screen
    if (particle.x < 0) particle.x = love.graphics.getWidth();
    if (particle.x > love.graphics.getWidth()) particle.x = 0;
    if (particle.y < 0) particle.y = love.graphics.getHeight();
    if (particle.y > love.graphics.getHeight()) particle.y = 0;

    // Remove dead particles
    if (particle.life <= 0) {
      game.particles.splice(i, 1);
      // Add new particle
      game.particles.push({
        x: love.math.random(0, love.graphics.getWidth()),
        y: love.math.random(0, love.graphics.getHeight()),
        vx: love.math.random(-50, 50),
        vy: love.math.random(-50, 50),
        size: love.math.random(2, 6),
        life: love.math.random(1, 3),
        maxLife: love.math.random(1, 3)
      });
    }
  }
};

window.love.draw = function () {
  // Draw particles
  for (const particle of game.particles) {
    const alpha = (particle.life / particle.maxLife) * 100;
    love.graphics.setColor(255, 255, 255, alpha);
    love.graphics.circle('fill', particle.x, particle.y, particle.size);
  }

  // Draw player
  love.graphics.setColor(game.player.color.r, game.player.color.g, game.player.color.b);
  love.graphics.circle('fill', game.player.x, game.player.y, game.player.size);

  // Draw player outline
  love.graphics.setColor(255, 255, 255);
  love.graphics.setLineWidth(2);
  love.graphics.circle('line', game.player.x, game.player.y, game.player.size);

  // Draw UI
  love.graphics.setColor(255, 255, 255);
  love.graphics.setFont(16);
  love.graphics.print(`Position: ${Math.floor(game.player.x)}, ${Math.floor(game.player.y)}`, 10, 30);
  love.graphics.print(`Time: ${love.timer.getTime().toFixed(1)}s`, 10, 50);
  love.graphics.print(`Particles: ${game.particles.length}`, 10, 70);

  // Draw mouse position
  const mouseX = love.mouse.getX();
  const mouseY = love.mouse.getY();
  love.graphics.print(`Mouse: ${mouseX}, ${mouseY}`, 10, 90);

  // Draw a line from player to mouse
  love.graphics.setColor(255, 255, 255, 100);
  love.graphics.setLineWidth(1);
  love.graphics.line(game.player.x, game.player.y, mouseX, mouseY);

  // Draw some shapes for demonstration
  love.graphics.push();
  love.graphics.translate(love.graphics.getWidth() - 100, 100);
  love.graphics.rotate(love.timer.getTime());

  love.graphics.setColor(255, 100, 100);
  love.graphics.rectangle('fill', -25, -25, 50, 50);

  love.graphics.setColor(100, 255, 100);
  love.graphics.polygon('fill', [-20, 20, 0, -20, 20, 20]);

  love.graphics.pop();
};

window.love.keypressed = function (key) {
  if (key === ' ') {
    // Change player color
    game.colorIndex = (game.colorIndex + 1) % game.colors.length;
    game.player.color = game.colors[game.colorIndex];

    // Play beep sound
    if (game.beepSound) {
      game.beepSound.play();
    }
  }

  if (key === 'escape') {
    console.log('Escape pressed!');
  }
};

window.love.keyreleased = function (key) {
  // Handle key releases
};

window.love.mousepressed = function (x, y, button) {
  console.log(`Mouse pressed at ${x}, ${y} with button ${button}`);

  // Add explosion of particles at mouse position
  for (let i = 0; i < 10; i++) {
    game.particles.push({
      x: x,
      y: y,
      vx: love.math.random(-200, 200),
      vy: love.math.random(-200, 200),
      size: love.math.random(3, 8),
      life: love.math.random(0.5, 1.5),
      maxLife: love.math.random(0.5, 1.5)
    });
  }
};

window.love.mousereleased = function (x, y, button) {
  // Handle mouse releases
};

window.love.mousemoved = function (x, y) {
  // Handle mouse movement
};

// Initialize the game
if (window.love.load) {
  window.love.load();
}
