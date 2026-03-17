// particles.js — Sistema modular de partículas

export const particles = (function () {
    const emitters = [];

    function newEmitter(config) {
        const emitter = {
            x: config.x || 0,
            y: config.y || 0,
            image: config.image || null,
            rate: config.rate || 50, // partículas por segundo
            life: config.life || [0.5, 1.5],
            speed: config.speed || [50, 100],
            size: config.size || [1, 1],
            spread: config.spread || Math.PI * 2,
            direction: config.direction || 0,
            color: config.color || { r: 255, g: 255, b: 255, a: 255 },
            particles: [],
            timeSinceLastEmit: 0,
            max: config.max || 100,
            active: true,
            burst: config.burst || false,
        };

        emitters.push(emitter);

        if (emitter.burst) {
            emit(emitter, emitter.max);
            emitter.active = false;
        }

        return emitter;
    }

    function emit(emitter, count) {
        for (let i = 0; i < count; i++) {
            const angle = emitter.direction + (Math.random() - 0.5) * emitter.spread;
            const speed = rand(emitter.speed);
            const size = rand(emitter.size);
            const life = rand(emitter.life);

            emitter.particles.push({
                x: emitter.x,
                y: emitter.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life,
                maxLife: life,
                size,
                color: { ...emitter.color }
            });

            if (emitter.particles.length > emitter.max) {
                emitter.particles.shift();
            }
        }
    }

    function update(dt) {
        for (const emitter of emitters) {
            if (emitter.active) {
                emitter.timeSinceLastEmit += dt;
                const emitCount = Math.floor(emitter.timeSinceLastEmit * emitter.rate);
                if (emitCount > 0) {
                    emitter.timeSinceLastEmit -= emitCount / emitter.rate;
                    emit(emitter, emitCount);
                }
            }

            // Atualiza partículas
            for (let i = emitter.particles.length - 1; i >= 0; i--) {
                const p = emitter.particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.life -= dt;

                if (p.life <= 0) {
                    emitter.particles.splice(i, 1);
                }
            }
        }
    }

    function draw() {
        for (const emitter of emitters) {
            for (const p of emitter.particles) {
                const alpha = (p.life / p.maxLife) * (p.color.a || 255);
                love.graphics.setColor(p.color.r, p.color.g, p.color.b, alpha);

                if (emitter.image && emitter.image.loaded) {
                    love.graphics.draw(emitter.image, p.x, p.y, 0, p.size, p.size, emitter.image.width / 2, emitter.image.height / 2);
                } else {
                    love.graphics.circle("fill", p.x, p.y, p.size);
                }
            }
        }

        love.graphics.setColor(255, 255, 255, 255); // reset
    }

    function rand(val) {
        if (Array.isArray(val)) {
            return love.math.random(val[0], val[1]);
        }
        return val;
    }

    return {
        newEmitter,
        update,
        draw
    };
})();
