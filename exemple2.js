//optional modules
import { physics } from './modules/physics.js';
import { tilemap } from './modules/tilemap.js';
import { Actor } from './modules/behaviors/Actor.js';
import { particles } from './modules/particles.js';
import { lightShadow } from './modules/lightShadow.js';
import { light } from './modules/light.js';

window.onload = (e) => {
    physics.init(0, 1);

    let p;
    let b;
    let emmiter;
    let lightShadowTest;
    let lightTest;
    let walking = false;

    window.love.load = function () {

        tilemap.load('./maps/1.png', './maps/1.json', () => { console.log('Mapa carregado!'); });
        const configAnim = {
            grid: { fw: 48, fh: 48 },
            anims: {
                idle: { cols: '1-8', row: 1, vel: 0.1 },
                run: { cols: '1-6', row: 2, vel: 0.1 }
            }
        }
        p = new Actor({ jumpForce: 7, spritePath: './u.png', canRotate: false, animConfig: configAnim });
        p.flipAnimation(true);

        b = physics.newBody({
            x: 150, y: 50, width: 32, height: 32,
            shape: 'circle', type: 'pushable', radius: 32 / 2,
            isSensor: false, canRotate: true, shadowBlock: true
        });

        physics.setGravity(p.body, true);
        p.update = function (dt) {
            this.animUpdate(dt)
            this.movePlatform(dt, 300);

            if (physics.checkCollision(p.body, b)) {
                console.log('bateeeeeu')
            }
        }

        emmiter = particles.newEmitter({
            x: 700,
            y: 400,
            rate: 100,
            spread: Math.PI * 2,
            speed: [20, 50],
            size: [2, 5],
            life: [0.5, 0.7],
            color: { r: 255, g: 200, b: 255, a: 100 },
            max: 200
        });

        lightShadowTest = lightShadow.newLight({
            x: 150, y: 200,
            radius: 64,
            flicker: true,
            color: { r: 200, g: 59, b: 89, a: 0.2 },
            resolution: 300,
            showRays: true
        });

        lightTest = light.newLight({
            x: 150, y: 200,
            radius: 40,
            flicker: true,
            color: { r: 200, g: 59, b: 89, a: 0.2 }
        });
    }

    window.love.keypressed = function (key) {
        if (key == 'w') {
            p.dobleJump();
            emmiter.x = p.body.x + p.body.width / 2
            emmiter.y = p.body.y + p.body.height / 2
        }
        if (key == 'd') {p.flipAnimation(false) }
        if (key == 'a') {p.flipAnimation(true) }

        if (!walking) {
            p.changeAnim('run');
        }
        walking = true;
    }

    window.love.keyreleased = function (key) {
        if (key == 'w') {
            emmiter.x = 700
            emmiter.y = 400
        }
       if (walking) {
            p.changeAnim('idle');
        }
        walking = false;
    }

    window.love.update = function (dt) {
        physics.update(dt);

        p.update(dt);
        particles.update(dt)

        lightTest.y = p.body.y + p.body.height / 2;
        lightTest.x = p.body.x + p.body.width / 2;
        lightShadow.update(dt);
        light.update(dt);
    }

    window.love.draw = function () {
        love.graphics.setBackgroundColor(99, 99, 99);
        tilemap.draw();



        love.graphics.setColor(233, 150, 84);
        love.graphics.circle('fill', b.x + b.width / 2, b.y + b.height / 2, b.radius);

        love.graphics.setColor(0, 0, 0, 150)
        love.graphics.rectangle('fill', 0, 0, 640, 320);

        light.draw()
        p.draw();
        lightShadow.draw()

        particles.draw()


    }

    // Initialize the game
    if (window.love.load) {
        window.love.load();
    } else {
        window.love.load();
    }
}