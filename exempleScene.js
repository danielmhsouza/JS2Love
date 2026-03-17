//optional modules
import { physics } from './JS2Love/modules/physics.js';
import { scene } from './JS2Love/modules/scene.js';
import { Actor } from './JS2Love/modules/behaviors/Actor.js';

window.onload = (e) => {
    physics.init(0, 1);

    let player = null;

    // ==================== CENA: MENU ====================
    scene.register('menu', {
        load: function() {
            this.data.options = ['Jogar', 'Sair'];
            this.data.selected = 0;
            this.data.colors = [
                [255, 100, 100],
                [100, 255, 100],
                [100, 100, 255]
            ];
            this.data.colorIndex = 0;
            this.data.colorTimer = 0;
        },

        enter: function() {
            console.log('Bem-vindo ao menu!');
        },

        update: function(dt) {
            // Anima as cores
            this.data.colorTimer += dt;
            if (this.data.colorTimer > 0.5) {
                this.data.colorTimer = 0;
                this.data.colorIndex = (this.data.colorIndex + 1) % this.data.colors.length;
            }
        },

        draw: function() {
            love.graphics.setBackgroundColor(20, 20, 40);
            
            // Título com cor animada
            const color = this.data.colors[this.data.colorIndex];
            love.graphics.setColor(...color);
            love.graphics.print('=== JS2LOVE DEMO ===', 200, 50);
            
            // Opções do menu
            this.data.options.forEach((opt, i) => {
                const selected = (i === this.data.selected);
                const optColor = selected ? [255, 255, 0] : [200, 200, 200];
                love.graphics.setColor(...optColor);
                love.graphics.print((selected ? '> ' : '  ') + opt, 260, 120 + i * 30);
            });

            // Instruções
            love.graphics.setColor(150, 150, 150);
            love.graphics.print('W/S = navegar', 240, 200);
            love.graphics.print('ENTER = selecionar', 240, 220);
        },

        keypressed: function(key) {
            if (key === 'w' || key === 'up') {
                this.data.selected = Math.max(0, this.data.selected - 1);
            }
            if (key === 's' || key === 'down') {
                this.data.selected = Math.min(this.data.options.length - 1, this.data.selected + 1);
            }
            if (key === 'enter') {
                if (this.data.selected === 0) {
                    // Jogar - transição slide
                    scene.transitionTo('game', 0.5, 'slideLeft');
                } else if (this.data.selected === 1) {
                    alert('Obrigado por jogar!');
                }
            }
        },

        leave: function() {
            console.log('Saindo do menu...');
        }
    });

    // ==================== CENA: JOGO ====================
    scene.register('game', {
        load: function() {
            console.log('Carregando jogo...');
            
            const configAnim = {
                grid: { fw: 48, fh: 48 },
                anims: {
                    idle: { cols: '1-8', row: 1, vel: 0.1 },
                    run: { cols: '1-6', row: 2, vel: 0.1 }
                }
            };
            
            player = new Actor({ 
                jumpForce: 7, 
                spritePath: './u.png', 
                canRotate: false, 
                animConfig: configAnim 
            });
            player.flipAnimation(true);
            player.body.x = 200;
            player.body.y = 100;

            this.data.walking = false;
            this.data.score = 0;
            this.data.scoreTimer = 0;

            // Cria o chão
            this.data.ground = physics.newBody({
                x: 0, y: 280, width: 640, height: 40,
                shape: 'rectangle', type: 'static'
            });

            physics.setGravity(player.body, true);
        },

        enter: function() {
            console.log('Começando o jogo!');
            
            // Garante que o ground existe ao entrar na cena
            if (!this.data.ground) {
                this.data.ground = physics.newBody({
                    x: 0, y: 280, width: 640, height: 40,
                    shape: 'rectangle', type: 'static'
                });
            }
            
            // Garante que o score existe
            if (this.data.score === undefined) {
                this.data.score = 0;
                this.data.scoreTimer = 0;
            }
        },

        update: function(dt) {
            physics.update(dt);
            
            // Atualiza player
            player.animUpdate(dt);
            player.movePlatform(dt, 300);

            // Aumenta score com o tempo
            this.data.scoreTimer += dt;
            if (this.data.scoreTimer > 1) {
                this.data.scoreTimer = 0;
                this.data.score += 10;
            }
        },

        draw: function() {
            love.graphics.setBackgroundColor(50, 150, 200);
            
            // Desenha o chão (com verificação de segurança)
            if (this.data.ground) {
                love.graphics.setColor(100, 200, 100);
                love.graphics.rectangle('fill', 
                    this.data.ground.x, 
                    this.data.ground.y, 
                    this.data.ground.width, 
                    this.data.ground.height
                );
            }

            // Desenha player (com verificação de segurança)
            if (player) {
                player.draw();
            }

            // UI
            love.graphics.setColor(255, 255, 255);
            love.graphics.print(`Score: ${this.data.score || 0}`, 10, 10);
            love.graphics.print('A/D = mover, W = pular', 10, 30);
            love.graphics.print('ESC = Pause', 10, 50);
        },

        keypressed: function(key) {
            if (key === 'w') {
                player.dobleJump();
            }

            if (key === 'a' || key === 'd') {
                if (key === 'd') { player.flipAnimation(false); }
                if (key === 'a') { player.flipAnimation(true); }
                
                if (!this.data.walking) {
                    player.changeAnim('run');
                    this.data.walking = true;
                }
            }

            if (key === 'escape') {
                scene.transitionTo('pause', 0.3, 'fade');
            }
        },

        keyreleased: function(key) {
            const stillMoving = love.keyboard.isDown('a') || love.keyboard.isDown('d');
            
            if (this.data.walking && !stillMoving) {
                player.changeAnim('idle');
                this.data.walking = false;
            }
        },

        leave: function() {
            console.log('Saindo do jogo...');
        }
    });

    // ==================== CENA: PAUSE ====================
    scene.register('pause', {
        draw: function() {
            // Fundo escuro
            love.graphics.setBackgroundColor(10, 10, 20);
            
            // Overlay escuro
            love.graphics.setColor(0, 0, 0, 180);
            love.graphics.rectangle('fill', 0, 0, 640, 320);

            // Texto de pause
            love.graphics.setColor(255, 255, 255);
            love.graphics.print('=== PAUSADO ===', 250, 100);
            love.graphics.print('ESC = Continuar', 240, 140);
            love.graphics.print('M = Menu', 260, 160);
            
            const gameData = scene.getData('game');
            if (gameData && gameData.score !== undefined) {
                love.graphics.print(`Score: ${gameData.score}`, 250, 200);
            }
        },

        keypressed: function(key) {
            if (key === 'escape') {
                scene.transitionTo('game', 0.3, 'fade');
            }
            if (key === 'm') {
                scene.transitionTo('menu', 0.5, 'slideRight');
            }
        }
    });

    // ==================== INÍCIO ====================
    window.love.load = function() {
        // Começa no menu com fade
        scene.transitionTo('menu', 1.0, 'fade');
    }

    window.love.update = function(dt) {
        scene.update(dt);
    }

    window.love.draw = function() {
        scene.draw();
    }

    window.love.keypressed = function(key) {
        scene.keypressed(key);
    }

    window.love.keyreleased = function(key) {
        scene.keyreleased(key);
    }

    // Initialize the game
    if (window.love.load) {
        window.love.load();
    }
}
