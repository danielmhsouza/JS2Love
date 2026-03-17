/**
 * Sistema de Gerenciamento de Cenas e Estados
 * Permite criar múltiplas cenas (menu, jogo, pause, etc) com transições suaves
 * Uso simples inspirado no Love2D - PLUG AND PLAY
 */

export const scene = (function () {
    let scenes = {};
    let currentScene = null;
    let previousScene = null;
    
    // Sistema de transição
    let transitioning = false;
    let transitionProgress = 0;
    let transitionDuration = 0.5; // segundos
    let transitionType = 'fade';
    let transitionCallback = null;
    let nextSceneName = null;
    
    /**
     * Registra uma nova cena
     * @param {string} name - Nome da cena
     * @param {object} sceneObj - Objeto com load, update, draw, keypressed, etc
     */
    function register(name, sceneObj) {
        scenes[name] = {
            load: sceneObj.load || null,
            unload: sceneObj.unload || null,
            update: sceneObj.update || null,
            draw: sceneObj.draw || null,
            keypressed: sceneObj.keypressed || null,
            keyreleased: sceneObj.keyreleased || null,
            mousepressed: sceneObj.mousepressed || null,
            mousereleased: sceneObj.mousereleased || null,
            mousemoved: sceneObj.mousemoved || null,
            enter: sceneObj.enter || null,  // Chamado ao entrar na cena
            leave: sceneObj.leave || null,  // Chamado ao sair da cena
            data: {}  // Dados persistentes da cena
        };
    }

    /**
     * Remove uma cena registrada
     */
    function unregister(name) {
        if (scenes[name]) {
            if (currentScene === name) {
                console.warn(`Cannot unregister active scene: ${name}`);
                return;
            }
            delete scenes[name];
        }
    }

    /**
     * Muda para uma cena específica (sem transição)
     */
    function switchTo(name, ...args) {
        if (!scenes[name]) {
            console.error(`Scene not found: ${name}`);
            return;
        }

        // Chama leave da cena anterior
        if (currentScene && scenes[currentScene]?.leave) {
            scenes[currentScene].leave();
        }

        previousScene = currentScene;
        currentScene = name;

        // Chama enter da nova cena
        if (scenes[currentScene]?.enter) {
            scenes[currentScene].enter(...args);
        }

        // Chama load se existir e não foi carregada antes
        if (scenes[currentScene]?.load && !scenes[currentScene].loaded) {
            scenes[currentScene].load(...args);
            scenes[currentScene].loaded = true;
        }
    }

    /**
     * Muda para uma cena com transição
     * @param {string} name - Nome da cena destino
     * @param {number} duration - Duração da transição (opcional)
     * @param {string} type - Tipo de transição: 'fade', 'slideLeft', 'slideRight', 'slideUp', 'slideDown' (opcional)
     */
    function transitionTo(name, duration = 0.5, type = 'fade', ...args) {
        if (!scenes[name]) {
            console.error(`Scene not found: ${name}`);
            return;
        }

        if (transitioning) {
            console.warn('Already transitioning');
            return;
        }

        transitioning = true;
        transitionProgress = 0;
        transitionDuration = duration;
        transitionType = type;
        nextSceneName = name;
        transitionCallback = () => {
            switchTo(name, ...args);
        };
    }

    /**
     * Atualiza o sistema de transições
     */
    function updateTransition(dt) {
        if (!transitioning) return;

        transitionProgress += dt / transitionDuration;

        // Quando chega no meio da transição (50%), muda a cena
        if (transitionProgress >= 0.5 && transitionCallback) {
            transitionCallback();
            transitionCallback = null;
        }

        // Quando termina a transição
        if (transitionProgress >= 1) {
            transitionProgress = 1;
            transitioning = false;
            nextSceneName = null;
        }
    }

    /**
     * Desenha o efeito de transição
     */
    function drawTransition() {
        if (!transitioning) return;

        const ctx = window.engine.ctx;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // Calcula alpha baseado no progresso (fade in até 50%, fade out depois)
        let alpha;
        if (transitionProgress < 0.5) {
            alpha = transitionProgress * 2; // 0 -> 1
        } else {
            alpha = (1 - transitionProgress) * 2; // 1 -> 0
        }

        switch (transitionType) {
            case 'fade':
                ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
                ctx.fillRect(0, 0, width, height);
                break;

            case 'slideLeft':
                const offsetLeft = (transitionProgress < 0.5) 
                    ? -width * (transitionProgress * 2)
                    : -width + width * ((transitionProgress - 0.5) * 2);
                ctx.fillStyle = 'black';
                ctx.fillRect(offsetLeft, 0, width, height);
                break;

            case 'slideRight':
                const offsetRight = (transitionProgress < 0.5) 
                    ? width * (1 - transitionProgress * 2)
                    : width * ((transitionProgress - 0.5) * 2);
                ctx.fillStyle = 'black';
                ctx.fillRect(offsetRight, 0, width, height);
                break;

            case 'slideUp':
                const offsetUp = (transitionProgress < 0.5) 
                    ? -height * (transitionProgress * 2)
                    : -height + height * ((transitionProgress - 0.5) * 2);
                ctx.fillStyle = 'black';
                ctx.fillRect(0, offsetUp, width, height);
                break;

            case 'slideDown':
                const offsetDown = (transitionProgress < 0.5) 
                    ? height * (1 - transitionProgress * 2)
                    : height * ((transitionProgress - 0.5) * 2);
                ctx.fillStyle = 'black';
                ctx.fillRect(0, offsetDown, width, height);
                break;
        }
    }

    /**
     * Atualiza a cena atual
     */
    function update(dt) {
        updateTransition(dt);

        if (currentScene && scenes[currentScene]?.update) {
            scenes[currentScene].update(dt);
        }
    }

    /**
     * Desenha a cena atual
     */
    function draw() {
        if (currentScene && scenes[currentScene]?.draw) {
            scenes[currentScene].draw();
        }

        // Desenha transição por cima
        drawTransition();
    }

    /**
     * Propaga evento de tecla pressionada
     */
    function keypressed(key) {
        if (currentScene && scenes[currentScene]?.keypressed) {
            scenes[currentScene].keypressed(key);
        }
    }

    /**
     * Propaga evento de tecla solta
     */
    function keyreleased(key) {
        if (currentScene && scenes[currentScene]?.keyreleased) {
            scenes[currentScene].keyreleased(key);
        }
    }

    /**
     * Propaga evento de mouse pressionado
     */
    function mousepressed(x, y, button) {
        if (currentScene && scenes[currentScene]?.mousepressed) {
            scenes[currentScene].mousepressed(x, y, button);
        }
    }

    /**
     * Propaga evento de mouse solto
     */
    function mousereleased(x, y, button) {
        if (currentScene && scenes[currentScene]?.mousereleased) {
            scenes[currentScene].mousereleased(x, y, button);
        }
    }

    /**
     * Propaga evento de movimento do mouse
     */
    function mousemoved(x, y) {
        if (currentScene && scenes[currentScene]?.mousemoved) {
            scenes[currentScene].mousemoved(x, y);
        }
    }

    /**
     * Retorna o nome da cena atual
     */
    function getCurrent() {
        return currentScene;
    }

    /**
     * Retorna o nome da cena anterior
     */
    function getPrevious() {
        return previousScene;
    }

    /**
     * Retorna os dados persistentes de uma cena
     */
    function getData(name) {
        return scenes[name]?.data || null;
    }

    /**
     * Define dados persistentes para uma cena
     */
    function setData(name, data) {
        if (scenes[name]) {
            scenes[name].data = data;
        }
    }

    /**
     * Retorna se está em transição
     */
    function isTransitioning() {
        return transitioning;
    }

    /**
     * Define a duração padrão das transições
     */
    function setTransitionDuration(duration) {
        transitionDuration = duration;
    }

    /**
     * Lista todas as cenas registradas
     */
    function list() {
        return Object.keys(scenes);
    }

    return {
        register,
        unregister,
        switchTo,
        transitionTo,
        update,
        draw,
        keypressed,
        keyreleased,
        mousepressed,
        mousereleased,
        mousemoved,
        getCurrent,
        getPrevious,
        getData,
        setData,
        isTransitioning,
        setTransitionDuration,
        list
    };
})();

// Exporta globalmente para uso sem import
if (typeof window !== 'undefined') {
    window.scene = scene;
}
