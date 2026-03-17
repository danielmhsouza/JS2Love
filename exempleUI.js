//optional modules
import { ui } from './JS2Love/modules/ui.js';

window.onload = (e) => {
    let volumeValue = 50;
    let healthValue = 100;
    let loadingValue = 0;
    let soundEnabled = true;
    let particlesEnabled = true;
    let shadowsEnabled = false;

    window.love.load = function() {
        // ==================== PAINEL DE FUNDO ====================
        // Nota: O painel é adicionado primeiro para ficar no fundo
        ui.newPanel({
            x: 30,
            y: 20,
            width: 580,
            height: 480,
            style: {
                backgroundColor: [30, 30, 50, 220],
                borderColor: [100, 100, 150],
                borderWidth: 3,
                borderRadius: 20
            }
        });

        // ==================== TÍTULO ====================
        ui.newLabel({
            x: 200,
            y: 40,
            text: '🎨 UI System Demo',
            style: {
                color: [255, 255, 100],
                fontSize: 24
            }
        });

        // ==================== SEÇÃO: BOTÕES ====================
        ui.newLabel({
            x: 50,
            y: 80,
            text: 'Botões:',
            style: {
                color: [200, 200, 255],
                fontSize: 18
            }
        });

        // Botão normal
        ui.newButton({
            x: 50,
            y: 110,
            width: 150,
            height: 40,
            text: 'Normal',
            onClick: (btn) => {
                console.log('Botão normal clicado!');
                alert('Botão Normal!');
            },
            style: {
                backgroundColor: [70, 130, 180],
                backgroundColorHover: [100, 160, 210],
                backgroundColorActive: [50, 100, 150],
                borderRadius: 8
            }
        });

        // Botão verde (sucesso)
        ui.newButton({
            x: 220,
            y: 110,
            width: 150,
            height: 40,
            text: 'Sucesso',
            onClick: () => {
                console.log('Sucesso!');
            },
            style: {
                backgroundColor: [50, 150, 50],
                backgroundColorHover: [70, 180, 70],
                backgroundColorActive: [30, 120, 30],
                borderRadius: 8
            }
        });

        // Botão vermelho (perigo)
        ui.newButton({
            x: 390,
            y: 110,
            width: 150,
            height: 40,
            text: 'Perigo',
            onClick: () => {
                console.log('Perigo!');
            },
            style: {
                backgroundColor: [180, 50, 50],
                backgroundColorHover: [210, 70, 70],
                backgroundColorActive: [150, 30, 30],
                borderRadius: 8
            }
        });

        // Botão desabilitado
        const disabledButton = ui.newButton({
            x: 50,
            y: 160,
            width: 150,
            height: 40,
            text: 'Desabilitado',
            onClick: () => {
                console.log('Não deveria clicar aqui...');
            }
        });
        disabledButton.enabled = false;

        // ==================== SEÇÃO: CHECKBOXES ====================
        ui.newLabel({
            x: 50,
            y: 220,
            text: 'Checkboxes:',
            style: {
                color: [200, 200, 255],
                fontSize: 18
            }
        });

        ui.newCheckbox({
            x: 50,
            y: 250,
            size: 24,
            label: 'Ativar Som',
            checked: soundEnabled,
            onChange: (checked) => {
                soundEnabled = checked;
                console.log('Som:', checked ? 'ON' : 'OFF');
            },
            style: {
                checkColor: [50, 200, 50],
                labelColor: [255, 255, 255]
            }
        });

        ui.newCheckbox({
            x: 50,
            y: 285,
            size: 24,
            label: 'Partículas',
            checked: particlesEnabled,
            onChange: (checked) => {
                particlesEnabled = checked;
                console.log('Partículas:', checked ? 'ON' : 'OFF');
            },
            style: {
                checkColor: [100, 150, 255]
            }
        });

        ui.newCheckbox({
            x: 50,
            y: 320,
            size: 24,
            label: 'Sombras Dinâmicas',
            checked: shadowsEnabled,
            onChange: (checked) => {
                shadowsEnabled = checked;
                console.log('Sombras:', checked ? 'ON' : 'OFF');
            },
            style: {
                checkColor: [255, 200, 50]
            }
        });

        // ==================== SEÇÃO: SLIDERS ====================
        ui.newLabel({
            x: 280,
            y: 220,
            text: 'Sliders:',
            style: {
                color: [200, 200, 255],
                fontSize: 18
            }
        });

        // Volume slider
        ui.newLabel({
            x: 280,
            y: 250,
            text: 'Volume:',
            style: { color: [200, 200, 200] }
        });

        const volumeLabel = ui.newLabel({
            x: 540,
            y: 250,
            text: '50',
            style: { color: [100, 255, 100] }
        });

        ui.newSlider({
            x: 280,
            y: 280,
            width: 240,
            height: 20,
            min: 0,
            max: 100,
            value: 50,
            onChange: (value) => {
                volumeValue = value;
                volumeLabel.setText(Math.round(value).toString());
            },
            style: {
                fillColor: [100, 200, 255],
                handleSize: 16
            }
        });

        // Brightness slider
        ui.newLabel({
            x: 280,
            y: 315,
            text: 'Brilho:',
            style: { color: [200, 200, 200] }
        });

        const brightnessLabel = ui.newLabel({
            x: 540,
            y: 315,
            text: '75',
            style: { color: [255, 255, 100] }
        });

        ui.newSlider({
            x: 280,
            y: 345,
            width: 240,
            height: 20,
            min: 0,
            max: 100,
            value: 75,
            onChange: (value) => {
                brightnessLabel.setText(Math.round(value).toString());
            },
            style: {
                fillColor: [255, 200, 50],
                handleSize: 14
            }
        });

        // ==================== SEÇÃO: PROGRESS BARS ====================
        ui.newLabel({
            x: 50,
            y: 360,
            text: 'Progress Bars:',
            style: {
                color: [200, 200, 255],
                fontSize: 18
            }
        });

        // Health bar
        ui.newLabel({
            x: 50,
            y: 390,
            text: 'Vida:',
            style: { color: [200, 200, 200] }
        });

        const healthBar = ui.newProgressBar({
            x: 110,
            y: 390,
            width: 200,
            height: 25,
            min: 0,
            max: 100,
            value: 100,
            showText: true,
            style: {
                fillColor: [200, 50, 50],
                borderWidth: 2
            }
        });

        // Loading bar (animada)
        ui.newLabel({
            x: 50,
            y: 430,
            text: 'Loading:',
            style: { color: [200, 200, 200] }
        });

        const loadingBar = ui.newProgressBar({
            x: 130,
            y: 430,
            width: 200,
            height: 20,
            min: 0,
            max: 100,
            value: 0,
            showText: true,
            style: {
                fillColor: [100, 200, 100]
            }
        });

        // Mana bar
        ui.newLabel({
            x: 350,
            y: 390,
            text: 'Mana:',
            style: { color: [200, 200, 200] }
        });

        const manaBar = ui.newProgressBar({
            x: 410,
            y: 390,
            width: 150,
            height: 20,
            min: 0,
            max: 100,
            value: 75,
            showText: true,
            style: {
                fillColor: [50, 100, 255],
                borderWidth: 2
            }
        });

        // ==================== BOTÃO DE TESTE ====================
        ui.newButton({
            x: 350,
            y: 430,
            width: 210,
            height: 35,
            text: 'Testar Animações',
            onClick: () => {
                // Anima health bar
                let health = 100;
                const healthInterval = setInterval(() => {
                    health -= 5;
                    healthBar.setValue(health);
                    if (health <= 0) {
                        clearInterval(healthInterval);
                        setTimeout(() => {
                            healthBar.setValue(100);
                        }, 1000);
                    }
                }, 100);

                // Anima loading bar
                loadingValue = 0;
            },
            style: {
                backgroundColor: [100, 50, 150],
                backgroundColorHover: [130, 70, 180],
                borderRadius: 8
            }
        });

        // ==================== INFO ====================
        ui.newLabel({
            x: 50,
            y: 475,
            text: 'Passe o mouse sobre os componentes e clique para interagir!',
            style: {
                color: [150, 150, 150],
                fontSize: 12
            }
        });

        // Anima loading bar continuamente
        setInterval(() => {
            if (loadingValue < 100) {
                loadingValue += 1;
                loadingBar.setValue(loadingValue);
            } else {
                loadingValue = 0;
            }
        }, 50);
    };

    window.love.update = function(dt) {
        ui.update(dt);
    };

    window.love.draw = function() {
        love.graphics.setBackgroundColor(20, 20, 30);
        ui.draw();
        
        // FPS counter
        love.graphics.setColor(100, 100, 100);
        love.graphics.print('FPS: ' + Math.round(1 / love.timer.getDelta()), 10, 10);
    };

    window.love.mousemoved = function(x, y) {
        ui.mousemoved(x, y);
    };

    window.love.mousepressed = function(x, y, button) {
        ui.mousepressed(x, y, button);
    };

    window.love.mousereleased = function(x, y, button) {
        ui.mousereleased(x, y, button);
    };

    // Initialize the game
    if (window.love.load) {
        window.love.load();
    }
}
