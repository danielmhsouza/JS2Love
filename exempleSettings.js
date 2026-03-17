// Módulos
import { ui } from './JS2Love/modules/ui.js';
import { settings } from './JS2Love/modules/settings.js';

window.onload = (e) => {
    let volumeMasterLabel, volumeMusicLabel, volumeSfxLabel;
    let fullscreenCheckbox, pixelatedCheckbox, tutorialCheckbox;
    let difficultyLabel;

    window.love.load = function() {
        console.log('Carregando configurações demo...');

        // ==================== PAINEL PRINCIPAL ====================
        ui.newPanel({
            x: 30,
            y: 20,
            width: 580,
            height: 520,
            style: {
                backgroundColor: [25, 25, 40, 240],
                borderColor: [100, 100, 150],
                borderWidth: 3,
                borderRadius: 15
            }
        });

        // ==================== TÍTULO ====================
        ui.newLabel({
            x: 180,
            y: 40,
            text: '⚙️ Configurações',
            style: {
                color: [255, 255, 100],
                fontSize: 28
            }
        });

        // ==================== SEÇÃO: VOLUME ====================
        ui.newLabel({
            x: 50,
            y: 85,
            text: '🔊 Volume',
            style: {
                color: [200, 200, 255],
                fontSize: 20
            }
        });

        // Volume Master
        ui.newLabel({
            x: 50,
            y: 120,
            text: 'Master:',
            style: { color: [200, 200, 200], fontSize: 16 }
        });

        volumeMasterLabel = ui.newLabel({
            x: 540,
            y: 120,
            text: Math.round(settings.getVolume('master') * 100) + '%',
            style: { color: [100, 255, 100], fontSize: 16 }
        });

        ui.newSlider({
            x: 140,
            y: 120,
            width: 380,
            height: 20,
            min: 0,
            max: 100,
            value: settings.getVolume('master') * 100,
            onChange: (value) => {
                settings.setVolume('master', value / 100);
                volumeMasterLabel.setText(Math.round(value) + '%');
            },
            style: {
                fillColor: [100, 200, 255],
                handleSize: 16
            }
        });

        // Volume Music
        ui.newLabel({
            x: 50,
            y: 160,
            text: 'Música:',
            style: { color: [200, 200, 200], fontSize: 16 }
        });

        volumeMusicLabel = ui.newLabel({
            x: 540,
            y: 160,
            text: Math.round(settings.getVolume('music') * 100) + '%',
            style: { color: [100, 255, 100], fontSize: 16 }
        });

        ui.newSlider({
            x: 140,
            y: 160,
            width: 380,
            height: 20,
            min: 0,
            max: 100,
            value: settings.getVolume('music') * 100,
            onChange: (value) => {
                settings.setVolume('music', value / 100);
                volumeMusicLabel.setText(Math.round(value) + '%');
            },
            style: {
                fillColor: [255, 150, 200],
                handleSize: 16
            }
        });

        // Volume SFX
        ui.newLabel({
            x: 50,
            y: 200,
            text: 'Efeitos:',
            style: { color: [200, 200, 200], fontSize: 16 }
        });

        volumeSfxLabel = ui.newLabel({
            x: 540,
            y: 200,
            text: Math.round(settings.getVolume('sfx') * 100) + '%',
            style: { color: [100, 255, 100], fontSize: 16 }
        });

        ui.newSlider({
            x: 140,
            y: 200,
            width: 380,
            height: 20,
            min: 0,
            max: 100,
            value: settings.getVolume('sfx') * 100,
            onChange: (value) => {
                settings.setVolume('sfx', value / 100);
                volumeSfxLabel.setText(Math.round(value) + '%');
            },
            style: {
                fillColor: [255, 200, 50],
                handleSize: 16
            }
        });

        // ==================== SEÇÃO: GRÁFICOS ====================
        ui.newLabel({
            x: 50,
            y: 245,
            text: '🖼️ Gráficos',
            style: {
                color: [200, 200, 255],
                fontSize: 20
            }
        });

        // Fullscreen
        fullscreenCheckbox = ui.newCheckbox({
            x: 50,
            y: 280,
            size: 24,
            label: 'Tela Cheia (F11)',
            checked: settings.isFullscreen(),
            onChange: (checked) => {
                settings.setFullscreen(checked);
            },
            style: {
                checkColor: [50, 200, 255],
                labelColor: [255, 255, 255]
            }
        });

        // Pixelated
        pixelatedCheckbox = ui.newCheckbox({
            x: 50,
            y: 315,
            size: 24,
            label: 'Renderização Pixelada',
            checked: settings.get('graphics.pixelated'),
            onChange: (checked) => {
                settings.set('graphics.pixelated', checked);
            },
            style: {
                checkColor: [200, 50, 255],
                labelColor: [255, 255, 255]
            }
        });

        // ==================== SEÇÃO: GAMEPLAY ====================
        ui.newLabel({
            x: 50,
            y: 360,
            text: '🎮 Gameplay',
            style: {
                color: [200, 200, 255],
                fontSize: 20
            }
        });

        // Tutorial
        tutorialCheckbox = ui.newCheckbox({
            x: 50,
            y: 395,
            size: 24,
            label: 'Mostrar Tutorial',
            checked: settings.get('gameplay.showTutorial'),
            onChange: (checked) => {
                settings.set('gameplay.showTutorial', checked);
            },
            style: {
                checkColor: [255, 200, 50],
                labelColor: [255, 255, 255]
            }
        });

        // Dificuldade
        ui.newLabel({
            x: 50,
            y: 435,
            text: 'Dificuldade:',
            style: { color: [200, 200, 200], fontSize: 16 }
        });

        difficultyLabel = ui.newLabel({
            x: 170,
            y: 435,
            text: settings.get('gameplay.difficulty').toUpperCase(),
            style: { 
                color: getDifficultyColor(settings.get('gameplay.difficulty')),
                fontSize: 16
            }
        });

        // Botões de dificuldade
        ui.newButton({
            x: 260,
            y: 428,
            width: 80,
            height: 30,
            text: 'Fácil',
            onClick: () => {
                settings.set('gameplay.difficulty', 'easy');
                difficultyLabel.setText('EASY');
                difficultyLabel.style.color = getDifficultyColor('easy');
            },
            style: {
                backgroundColor: [50, 150, 50],
                backgroundColorHover: [70, 180, 70],
                borderRadius: 5,
                fontSize: 14
            }
        });

        ui.newButton({
            x: 350,
            y: 428,
            width: 80,
            height: 30,
            text: 'Normal',
            onClick: () => {
                settings.set('gameplay.difficulty', 'normal');
                difficultyLabel.setText('NORMAL');
                difficultyLabel.style.color = getDifficultyColor('normal');
            },
            style: {
                backgroundColor: [100, 100, 200],
                backgroundColorHover: [120, 120, 230],
                borderRadius: 5,
                fontSize: 14
            }
        });

        ui.newButton({
            x: 440,
            y: 428,
            width: 80,
            height: 30,
            text: 'Difícil',
            onClick: () => {
                settings.set('gameplay.difficulty', 'hard');
                difficultyLabel.setText('HARD');
                difficultyLabel.style.color = getDifficultyColor('hard');
            },
            style: {
                backgroundColor: [200, 50, 50],
                backgroundColorHover: [230, 70, 70],
                borderRadius: 5,
                fontSize: 14
            }
        });

        // ==================== BOTÕES DE AÇÃO ====================
        // Salvar
        ui.newButton({
            x: 50,
            y: 480,
            width: 130,
            height: 40,
            text: '💾 Salvar',
            onClick: () => {
                settings.save();
                showNotification('Configurações salvas!');
            },
            style: {
                backgroundColor: [50, 150, 50],
                backgroundColorHover: [70, 180, 70],
                borderRadius: 8,
                fontSize: 16
            }
        });

        // Resetar
        ui.newButton({
            x: 195,
            y: 480,
            width: 130,
            height: 40,
            text: '🔄 Resetar',
            onClick: () => {
                if (confirm('Resetar todas as configurações?')) {
                    settings.reset();
                    reloadUI();
                    showNotification('Configurações resetadas!');
                }
            },
            style: {
                backgroundColor: [200, 100, 50],
                backgroundColorHover: [230, 120, 70],
                borderRadius: 8,
                fontSize: 16
            }
        });

        // Exportar
        ui.newButton({
            x: 340,
            y: 480,
            width: 110,
            height: 40,
            text: '📤 Exportar',
            onClick: () => {
                const json = settings.exportSettings();
                navigator.clipboard.writeText(json);
                showNotification('Copiado para clipboard!');
            },
            style: {
                backgroundColor: [100, 100, 180],
                backgroundColorHover: [120, 120, 210],
                borderRadius: 8,
                fontSize: 14
            }
        });

        // Importar
        ui.newButton({
            x: 465,
            y: 480,
            width: 110,
            height: 40,
            text: '📥 Importar',
            onClick: () => {
                const json = prompt('Cole o JSON das configurações:');
                if (json) {
                    if (settings.importSettings(json)) {
                        reloadUI();
                        showNotification('Configurações importadas!');
                    } else {
                        alert('Erro ao importar configurações!');
                    }
                }
            },
            style: {
                backgroundColor: [100, 100, 180],
                backgroundColorHover: [120, 120, 210],
                borderRadius: 8,
                fontSize: 14
            }
        });

        // Info
        ui.newLabel({
            x: 50,
            y: 545,
            text: 'As configurações são salvas automaticamente no navegador',
            style: {
                color: [150, 150, 150],
                fontSize: 11
            }
        });

        // Console log das configurações atuais
        console.log('Configurações atuais:', settings.getAll());
    };

    // Notificação temporária
    let notificationText = '';
    let notificationTimer = 0;

    function showNotification(text) {
        notificationText = text;
        notificationTimer = 2; // 2 segundos
    }

    function getDifficultyColor(difficulty) {
        switch(difficulty) {
            case 'easy': return [100, 255, 100];
            case 'normal': return [100, 200, 255];
            case 'hard': return [255, 100, 100];
            default: return [255, 255, 255];
        }
    }

    function reloadUI() {
        ui.clear();
        window.love.load();
    }

    window.love.update = function(dt) {
        ui.update(dt);

        if (notificationTimer > 0) {
            notificationTimer -= dt;
        }
    };

    window.love.draw = function() {
        love.graphics.setBackgroundColor(15, 15, 25);
        ui.draw();
        
        // FPS
        love.graphics.setColor(100, 100, 100);
        love.graphics.print('FPS: ' + Math.round(1 / love.timer.getDelta()), 10, 10);

        // Notificação
        if (notificationTimer > 0) {
            love.graphics.setColor(50, 255, 50, Math.min(255, notificationTimer * 255));
            love.graphics.print(notificationText, 250, 560);
        }

        // Info de volumes efetivos
        const effectiveMaster = Math.round(settings.getEffectiveVolume('master') * 100);
        const effectiveMusic = Math.round(settings.getEffectiveVolume('music') * 100);
        const effectiveSfx = Math.round(settings.getEffectiveVolume('sfx') * 100);
        
        love.graphics.setColor(150, 150, 150);
        love.graphics.print(`Volume Efetivo: Master ${effectiveMaster}%, Music ${effectiveMusic}%, SFX ${effectiveSfx}%`, 50, 560);
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

    window.love.keypressed = function(key) {
        // F11 para fullscreen
        if (key === 'f11') {
            settings.toggleFullscreen();
            fullscreenCheckbox.checked = settings.isFullscreen();
        }
    };

    // Registra callbacks para mudanças de configuração
    settings.onChange('volume', (config) => {
        console.log('Volume changed:', config.volume);
    });

    settings.onChange('graphics', (config) => {
        console.log('Graphics changed:', config.graphics);
    });

    // Initialize
    if (window.love.load) {
        window.love.load();
    }
}
