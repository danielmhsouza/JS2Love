//optional modules
import { physics } from './modules/physics.js';
import { tilemap } from './modules/tilemap.js';
import { Actor } from './modules/behaviors/Actor.js';
import { particles } from './modules/particles.js';

window.onload = (e) => {
    physics.init(0, 1);
    let p = new Actor({ jumpForce: 7, spritePath: './maps/1.png', canRotate: false });


    let b = physics.newBody({
        x: 150, y: 50, width: 32, height: 32,
        shape: 'circle', type: 'pushable', radius: 32 / 2,
        isSensor: false, canRotate: true
    });

    let emmiter;

    window.love.load = async function () {
        await tilemap.load('./maps/1.png', './maps/1.json', () => { console.log('Mapa carregado!'); });
        p.update = function (dt) {
            this.movePlatform(dt, 300);

            if (physics.checkCollision(p.body, b)) {
                console.log('bateeeeeu')
            }
        }

        emmiter = particles.newEmitter({
            x: 400,
            y: 300,
            rate: 100,
            spread: Math.PI * 2,
            speed: [20, 50],
            size: [2, 5],
            life: [0.5, 0.7],
            color: { r: 255, g: 200, b: 255, a: 100 },
            max: 200
        });
    }

    window.love.keypressed = function (key) {
        if (key == 'w') {
            p.dobleJump();
            emmiter.x = p.body.x + p.body.width / 2 
            emmiter.y = p.body.y + p.body.height / 2 
        } 
    }

    window.love.keyreleased = function (key) { 
         if (key == 'w') {
            emmiter.x = 700
            emmiter.y = 400
        } 
    }

    window.love.update = function (dt) {
        physics.update(dt);
        p.update(dt);
        particles.update(dt)
    }

    window.love.draw = function () {
        love.graphics.setBackgroundColor(50, 100, 250);
        tilemap.draw();

        p.draw();

        love.graphics.setColor(233, 150, 84);
        love.graphics.circle('fill', b.x + b.width / 2, b.y + b.height / 2, b.radius);

        particles.draw()


    }

    // Initialize the game
    if (window.love.load) {
        window.love.load();
    }
}