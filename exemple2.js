//optional modules
import { physics } from './JS2Love/modules/physics.js';
import { tilemap } from './JS2Love/modules/tilemap.js';
import { Actor } from './JS2Love/modules/behaviors/Actor.js';
import { particles } from './JS2Love/modules/particles.js';
import { dynamicLight } from './JS2Love/modules/DynamicLight.js';
import { light } from './JS2Love/modules/light.js';
import { screenDarkness } from './JS2Love/modules/screenDarkness.js';
import { camera } from './JS2Love/modules/camera.js';

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

        lightShadowTest = dynamicLight.newLight({
            x: 150, y: 200,
            radius: 150,
            flicker: true,
            color: { r: 5, g: 100, b: 50, a: 0.6 },  // Laranja/fogo - alpha aumentado
            resolution: 180,
            showRays: false
        });

        lightTest = light.newLight({
            x: 150, y: 200,
            radius: 80,
            flicker: true,
            color: { r: 255, g: 150, b: 50, a: 0.5 }  // Laranja claro - alpha aumentado
        });
        
        // Define a intensidade da escuridão ANTES de usar
        screenDarkness.set(0.9);
        
        // Configuração da câmera (plug-and-play!)
        // Não precisa mais de setScreenSize - detecta automaticamente!
        camera.follow(p);
        camera.setSmoothness(5);
    }

    window.love.keypressed = function (key) {
        if (key == 'w') {
            p.dobleJump();
            emmiter.x = p.body.x + p.body.width / 2
            emmiter.y = p.body.y + p.body.height / 2
            camera.shake(5, 0.3); // Shake ao pular
        }
        
        // Controles de câmera
        if (key == 'q') {
            camera.shake(10, 0.5);
        }
        if (key == '=') {
            camera.setZoom(camera.getZoom() + 0.2);
        }
        if (key == '-') {
            camera.setZoom(camera.getZoom() - 0.2);
        }
        
        // Só muda para animação de correr se pressionar teclas de movimento
        if (key == 'a' || key == 'd') {
            if (key == 'd') { p.flipAnimation(false) }
            if (key == 'a') { p.flipAnimation(true) }
            
            if (!walking) {
                p.changeAnim('run');
                walking = true;
            }
        }
    }

    window.love.keyreleased = function (key) {
        if (key == 'w') {
            emmiter.x = 700
            emmiter.y = 400
        }
        
        // Verifica se ainda há teclas de movimento pressionadas
        const stillMoving = love.keyboard.isDown('a') || love.keyboard.isDown('d');
        
        if (walking && !stillMoving) {
            p.changeAnim('idle');
            walking = false;
        }
    }

    window.love.update = function (dt) {
        physics.update(dt);
        camera.update(dt);

        p.update(dt);
        particles.update(dt)

        lightTest.y = p.body.y + p.body.height / 2;
        lightTest.x = p.body.x + p.body.width / 2;
        dynamicLight.update(dt);
        light.update(dt);
    }

    function worldDraw() {
        love.graphics.setBackgroundColor(99, 99, 99);
        tilemap.draw();

        love.graphics.setColor(233, 150, 84);
        love.graphics.circle('fill', b.x + b.width / 2, b.y + b.height / 2, b.radius);
        
        p.draw();
        particles.draw()
    }

    window.love.draw = function () {
        // Aplica a câmera ao mundo (automático nos offscreen também!)
        camera.attach();
        worldDraw();
        camera.detach();
        
        /* ---  PASSO 2: Crie a máscara de luz offscreen --- */
        screenDarkness.beginLightMask();
        
        // Obtém os dois contextos (sombra e cor) - já com transformação da câmera!
        const shadowCtx = screenDarkness.getShadowContext();
        const colorCtx = screenDarkness.getLightColorContext();
        
        // Desenha as luzes em ambos os canvas
        light.draw(shadowCtx, colorCtx);         // luz simples (gradiente circular)
        dynamicLight.draw(shadowCtx, colorCtx);  // luz com ray-casting e sombras
        
        /* ---  PASSO 3: Aplica ambas as camadas sobre o mundo --- */
        screenDarkness.endLightMask();

        /* --- UI (sem câmera) --- */
        love.graphics.setColor(255, 255, 255);
        love.graphics.print('Controles: A/D = mover, W = pular, Q = shake, +/- = zoom', 10, 10);
    }

    // Initialize the game
    if (window.love.load) {
        window.love.load();
    }
}
