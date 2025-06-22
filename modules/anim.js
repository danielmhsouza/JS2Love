// anim.js — Sistema de animações estilo anim8

export const anim = (function () {
    function newGrid(frameWidth, frameHeight, imageWidth, imageHeight) {
        const cols = Math.floor(imageWidth / frameWidth);
        const rows = Math.floor(imageHeight / frameHeight);

        return function (rangeX, rangeY) {
            const quads = [];
            const parse = (val) => {
                if (typeof val === 'string' && val.includes('-')) {
                    const [start, end] = val.split('-').map(Number);
                    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
                }
                return [Number(val)];
            };

            const xs = parse(rangeX);
            const ys = parse(rangeY);

            for (const y of ys) {
                for (const x of xs) {
                    const quad = love.graphics.newQuad(
                        (x - 1) * frameWidth,
                        (y - 1) * frameHeight,
                        frameWidth,
                        frameHeight,
                        imageWidth,
                        imageHeight
                    );
                    quads.push(quad);
                }
            }

            return quads;
        };
    }

    function newAnimation(frames, frameTime) {
        return {
            frames,
            frameTime,
            timer: 0,
            currentFrame: 0,

            update(dt) {
                this.timer += dt;
                if (this.timer >= this.frameTime) {
                    this.timer -= this.frameTime;
                    this.currentFrame = (this.currentFrame + 1) % this.frames.length;
                }
            },

            draw(image, x, y, r = 0, sx = 1, sy = 1, ox = 0, oy = 0) {
                const quad = this.frames[this.currentFrame];
                love.graphics.draw(image, quad, x, y, r, sx, sy, ox, oy);
            }
        };
    }

    return {
        newGrid,
        newAnimation
    };
})();
