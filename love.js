// Love2D JavaScript Engine
class Love2D {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 800;
    this.height = 600;
    this.dt = 0;
    this.lastTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsTime = 0;

    // Input state
    this.keys = {};
    this.mouse = { x: 0, y: 0, buttons: {} };

    // Graphics state
    this.graphics = {
      color: { r: 255, g: 255, b: 255, a: 255 },
      backgroundColor: { r: 0, g: 0, b: 0, a: 255 },
      font: '12px Arial',
      lineWidth: 1
    };

    // Audio context
    this.audio = {
      context: null,
      sources: new Map()
    };

    // Timer
    this.timer = {
      time: 0
    };

    this.init();
  }

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Initialize audio context
    try {
      this.audio.context = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Audio not supported');
    }

    this.setupEventListeners();
    this.gameLoop();
  }

  setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (window.love && window.love.keypressed) {
        window.love.keypressed(e.key.toLowerCase());
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      if (window.love && window.love.keyreleased) {
        window.love.keyreleased(e.key.toLowerCase());
      }
    });

    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      if (window.love && window.love.mousemoved) {
        window.love.mousemoved(this.mouse.x, this.mouse.y);
      }
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.mouse.buttons[e.button] = true;
      if (window.love && window.love.mousepressed) {
        window.love.mousepressed(this.mouse.x, this.mouse.y, e.button + 1);
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.mouse.buttons[e.button] = false;
      if (window.love && window.love.mousereleased) {
        window.love.mousereleased(this.mouse.x, this.mouse.y, e.button + 1);
      }
    });
  }

  gameLoop() {
    const currentTime = performance.now();
    this.dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    this.timer.time += this.dt;

    // Calculate FPS
    this.frameCount++;
    if (currentTime - this.lastFpsTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsTime = currentTime;
      document.getElementById('fps').textContent = this.fps;
    }

    // Clear canvas
    this.ctx.fillStyle = `rgba(${this.graphics.backgroundColor.r}, ${this.graphics.backgroundColor.g}, ${this.graphics.backgroundColor.b}, ${this.graphics.backgroundColor.a / 255})`;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Call user functions
    if (window.love) {
      if (window.love.update) {
        window.love.update(this.dt);
      }
      if (window.love.draw) {
        window.love.draw();
      }
    }

    requestAnimationFrame(() => this.gameLoop());
  }
}

const imageCache = new Map();

// Love2D API
const love = {
  // Graphics module
  graphics: {

    setColor: function (r, g, b, a = 255) {
      engine.graphics.color = { r, g, b, a };
      engine.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      engine.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    },

    setBackgroundColor: function (r, g, b, a = 255) {
      engine.graphics.backgroundColor = { r, g, b, a };
    },

    rectangle: function (mode, x, y, width, height) {
      if (mode === 'fill') {
        engine.ctx.fillRect(x, y, width, height);
      } else if (mode === 'line') {
        engine.ctx.strokeRect(x, y, width, height);
      }
    },

    circle: function (mode, x, y, radius) {
      engine.ctx.beginPath();
      engine.ctx.arc(x, y, radius, 0, 2 * Math.PI);
      if (mode === 'fill') {
        engine.ctx.fill();
      } else if (mode === 'line') {
        engine.ctx.stroke();
      }
    },

    line: function (x1, y1, x2, y2) {
      engine.ctx.beginPath();
      engine.ctx.moveTo(x1, y1);
      engine.ctx.lineTo(x2, y2);
      engine.ctx.stroke();
    },

    polygon: function (mode, vertices) {
      if (vertices.length < 6) return;

      engine.ctx.beginPath();
      engine.ctx.moveTo(vertices[0], vertices[1]);

      for (let i = 2; i < vertices.length; i += 2) {
        engine.ctx.lineTo(vertices[i], vertices[i + 1]);
      }

      engine.ctx.closePath();

      if (mode === 'fill') {
        engine.ctx.fill();
      } else if (mode === 'line') {
        engine.ctx.stroke();
      }
    },

    print: function (text, x = 0, y = 12) {
      engine.ctx.font = engine.graphics.font;
      engine.ctx.fillText(text, x, y);
    },

    setFont: function (size = 12, family = 'Arial') {
      engine.graphics.font = `${size}px ${family}`;
      engine.ctx.font = engine.graphics.font;
    },

    setLineWidth: function (width) {
      engine.graphics.lineWidth = width;
      engine.ctx.lineWidth = width;
    },

    push: function () {
      engine.ctx.save();
    },

    pop: function () {
      engine.ctx.restore();
    },

    translate: function (x, y) {
      engine.ctx.translate(x, y);
    },

    rotate: function (angle) {
      engine.ctx.rotate(angle);
    },

    scale: function (x, y = x) {
      engine.ctx.scale(x, y);
    },

    getWidth: function () {
      return engine.width;
    },

    getHeight: function () {
      return engine.height;
    },

    newImage: function (src) {
      if (imageCache.has(src)) {
        return imageCache.get(src);
      }

      const img = new Image();
      img.src = src;

      // Salva quando carregar
      img.onload = () => {
        img.loaded = true;
        img.width = img.naturalWidth;
        img.height = img.naturalHeight;
      };

      imageCache.set(src, img);
      return img;
    },

    newQuad: function (x, y, w, h, sw, sh) {
      return { x, y, w, h, sw, sh };
    },

    draw: function (image, quadOrX, y, r, sx, sy, ox, oy) {
      engine.ctx.save();

      let quad = null;
      let drawX = quadOrX;

      if (typeof quadOrX === 'object' && 'x' in quadOrX) {
        quad = quadOrX;
        drawX = y;
        y = r;
        r = sx;
        sx = sy;
        sy = ox;
        ox = oy;
        oy = arguments[8];
      }

      // Valores padrão
      r = r || 0;
      sx = sx !== undefined ? sx : 1;
      sy = sy !== undefined ? sy : 1;
      ox = ox !== undefined ? ox : 0;
      oy = oy !== undefined ? oy : 0;

      engine.ctx.translate(drawX, y);
      engine.ctx.rotate(r);
      engine.ctx.scale(sx, sy);

      if (quad) {
        engine.ctx.drawImage(
          image,
          quad.x, quad.y, quad.w, quad.h,
          -ox, -oy, quad.w, quad.h
        );
      } else {
        engine.ctx.drawImage(image, -ox, -oy);
      }

      engine.ctx.restore();
    }

  },

  // Keyboard module
  keyboard: {
    isDown: function (key) {
      return !!engine.keys[key.toLowerCase()];
    }
  },

  // Mouse module
  mouse: {
    getX: function () {
      return engine.mouse.x;
    },

    getY: function () {
      return engine.mouse.y;
    },

    getPosition: function () {
      return [engine.mouse.x, engine.mouse.y];
    },

    isDown: function (button) {
      return !!engine.mouse.buttons[button - 1];
    }
  },

  // Timer module
  timer: {
    getTime: function () {
      return engine.timer.time;
    },

    getDelta: function () {
      return engine.dt;
    },

    getFPS: function () {
      return engine.fps;
    }
  },

  // Math module
  math: {
    random: function (min = 0, max = 1) {
      if (arguments.length === 0) {
        return Math.random();
      } else if (arguments.length === 1) {
        return Math.floor(Math.random() * min);
      } else {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
    },

    randomseed: function (seed) {
      // Simple seeded random (not cryptographically secure)
      Math.random = function () {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    }
  },

  // Audio module (basic implementation)
  audio: {
    newSource: function (frequency = 440, type = 'sine', duration = 1) {
      if (!engine.audio.context) return null;

      return {
        frequency,
        type,
        duration,
        playing: false,
        oscillator: null,
        gainNode: null,

        play: function () {
          if (this.playing) return;

          this.oscillator = engine.audio.context.createOscillator();
          this.gainNode = engine.audio.context.createGain();

          this.oscillator.type = this.type;
          this.oscillator.frequency.setValueAtTime(this.frequency, engine.audio.context.currentTime);

          this.oscillator.connect(this.gainNode);
          this.gainNode.connect(engine.audio.context.destination);

          this.gainNode.gain.setValueAtTime(0.1, engine.audio.context.currentTime);
          this.oscillator.start();

          if (this.duration > 0) {
            this.oscillator.stop(engine.audio.context.currentTime + this.duration);
          }

          this.playing = true;
        },

        stop: function () {
          if (this.oscillator && this.playing) {
            this.oscillator.stop();
            this.playing = false;
          }
        }
      };
    }
  }
};

// Initialize engine
const engine = new Love2D();

// Export love object to global scope
window.love = window.love || {};
