import { physics } from "../physics.js";
import { anim } from "../anim.js";

class Actor {
    constructor({ jumpForce = 30, spritePath, animConfig, canRotate = false }) {
        this.jumpForce = jumpForce;
        this.doubleJumpAvailable = false;
        this.flip = false;

        this.body = physics.newBody({
            x: 50, y: 50,
            width: 32, height: 32,
            shape: 'rectangle',
            type: 'dynamic',
            gravity: true,
            canRotate: canRotate
        });

        if (spritePath) {
            this.animConfig = animConfig || {
                frame: { x: 0, y: 0, w: 32, h: 32 },
                grid: { fw: 32, fh: 32 },
                anims: {
                    idle: { cols: '1-6', row: 1, vel: 0.1 },
                    run: { cols: '1-6', row: 2, vel: 0.1 }
                }
            };

            this.sprite = love.graphics.newImage(spritePath);
            this.grid = anim.newGrid(
                this.animConfig.grid.fw,
                this.animConfig.grid.fh,
                this.sprite.width,
                this.sprite.height
            );

            const idle = this.animConfig.anims.idle;
            this.animFrame = this.grid(idle.cols, idle.row);
            this.animation = anim.newAnimation(this.animFrame, idle.vel);
        }
    }

    update(dt) {
        this.animUpdate(dt);
    }

    move4Directions(dt, speed) {
        const vx = (love.keyboard.isDown("a") ? -speed : love.keyboard.isDown("d") ? speed : 0);
        const vy = (love.keyboard.isDown("w") ? -speed : love.keyboard.isDown("s") ? speed : 0);
        Matter.Body.setVelocity(this.body.matterBody, { x: vx * dt, y: vy * dt });
    }

    move8Directions(dt, speed) {
        let vx = 0, vy = 0;
        if (love.keyboard.isDown("w")) vy = -1;
        if (love.keyboard.isDown("s")) vy = 1;
        if (love.keyboard.isDown("a")) vx = -1;
        if (love.keyboard.isDown("d")) vx = 1;

        if (vx !== 0 && vy !== 0) {
            const norm = Math.sqrt(0.5);
            vx *= norm;
            vy *= norm;
        }

        Matter.Body.setVelocity(this.body.matterBody, { x: vx * speed * dt, y: vy * speed * dt });
    }

    movePlatform(dt, speed) {
        let vx = 0;
        if (love.keyboard.isDown("a")) vx = -1;
        else if (love.keyboard.isDown("d")) vx = 1;
        Matter.Body.setVelocity(this.body.matterBody, { x: vx * speed * dt, y: this.body.vy });
    }

    jump() {
        const grounded = this.body.matterBody.customData.grounded;
        if (grounded) {
            Matter.Body.setVelocity(this.body.matterBody, {
                x: this.body.vx,
                y: -this.jumpForce
            });
            this.body.matterBody.customData.grounded = false;
        }
    }

    dobleJump() {
        const customData = this.body.matterBody.customData;

        if (customData.grounded) {
            Matter.Body.setVelocity(this.body.matterBody, {
                x: this.body.vx,
                y: -this.jumpForce // Aplica a força de pulo para cima
            });
            this.doubleJumpAvailable = true;


        } else if (this.doubleJumpAvailable && !customData.grounded) {
            Matter.Body.setVelocity(this.body.matterBody, {
                x: this.body.vx,
                y: -this.jumpForce // Aplica a força de pulo para cima
            });
            this.doubleJumpAvailable = false;
        }

    }

    animUpdate(dt) {
        if (this.animation) this.animation.update(dt);
    }

    changeAnim(name) {
        if (this.animConfig.anims[name]) {
            const cfg = this.animConfig.anims[name];
            this.animFrame = this.grid(cfg.cols, cfg.row);
            this.animation = anim.newAnimation(this.animFrame, cfg.vel);
        }
    }

    /**
     * 
     * @param {boolean} dir - true: left, false: right 
     */
    flipAnimation(dir) {
        this.flip = dir;
    }

    draw() {

        if (this.animation) {
            const fw = this.animConfig.grid.fw;
            const fh = this.animConfig.grid.fh;
            const scaleX = (this.body.width / fw) * (this.flip ? -1 : 1);
            const scaleY = this.body.height / fh;

            const angle = this.body.matterBody.angle; // ângulo atual em radianos

            this.animation.draw(
                this.sprite,
                this.body.matterBody.position.x,
                this.body.matterBody.position.y,
                angle, // aplica rotação real
                scaleX,
                scaleY,
                this.animConfig.grid.fw / 2,
                this.animConfig.grid.fh / 2
            );
        } else {
            love.graphics.setColor(255, 255, 255);
            love.graphics.rectangle('fill', this.body.x, this.body.y, this.body.width, this.body.height);
        }
        
    }
}

export { Actor };
