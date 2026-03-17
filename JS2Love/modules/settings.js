/**
 * Sistema de Configurações - Volume, Fullscreen, Persistência
 * Gerencia configurações do jogo com save/load automático
 * Uso simples inspirado no Love2D - PLUG AND PLAY
 */

export const settings = (function () {
    // Configurações padrão
    const defaults = {
        // Volume (0 a 1)
        volume: {
            master: 1.0,
            music: 0.8,
            sfx: 1.0,
            voice: 1.0
        },
        
        // Gráficos
        graphics: {
            fullscreen: false,
            pixelated: false,
            vsync: true
        },
        
        // Controles
        controls: {
            keyMap: {
                jump: ['w', ' '],
                attack: ['j', 'z'],
                interact: ['e'],
                pause: ['escape', 'p']
            }
        },
        
        // Gameplay
        gameplay: {
            difficulty: 'normal', // 'easy', 'normal', 'hard'
            showTutorial: true,
            language: 'pt-BR'
        }
    };

    // Configurações atuais (cópia profunda dos defaults)
    let current = JSON.parse(JSON.stringify(defaults));

    // Nome da chave no localStorage
    const STORAGE_KEY = 'js2love_settings';

    // Auto-save configurado?
    let autoSaveEnabled = true;
    let autoSaveDelay = 500; // ms
    let autoSaveTimer = null;

    // Callbacks de mudança
    const callbacks = {
        volume: [],
        graphics: [],
        controls: [],
        gameplay: [],
        any: []
    };

    /**
     * Inicializa o sistema de configurações
     */
    function init() {
        load();
        applyGraphicsSettings();
        console.log('[Settings] Initialized');
    }

    /**
     * Salva configurações no localStorage
     */
    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
            console.log('[Settings] Saved');
            return true;
        } catch (e) {
            console.error('[Settings] Failed to save:', e);
            return false;
        }
    }

    /**
     * Carrega configurações do localStorage
     */
    function load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const loaded = JSON.parse(stored);
                // Merge com defaults (caso novos campos sejam adicionados)
                current = deepMerge(defaults, loaded);
                console.log('[Settings] Loaded');
                return true;
            }
        } catch (e) {
            console.error('[Settings] Failed to load:', e);
        }
        return false;
    }

    /**
     * Reseta todas as configurações para os valores padrão
     */
    function reset() {
        current = JSON.parse(JSON.stringify(defaults));
        save();
        applyGraphicsSettings();
        notifyCallbacks('any');
        console.log('[Settings] Reset to defaults');
    }

    /**
     * Exporta configurações como JSON
     */
    function exportSettings() {
        return JSON.stringify(current, null, 2);
    }

    /**
     * Importa configurações de JSON
     */
    function importSettings(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            current = deepMerge(defaults, imported);
            save();
            applyGraphicsSettings();
            notifyCallbacks('any');
            return true;
        } catch (e) {
            console.error('[Settings] Failed to import:', e);
            return false;
        }
    }

    /**
     * Obtém uma configuração específica
     * @param {string} path - Caminho usando ponto (ex: 'volume.master')
     */
    function get(path) {
        const keys = path.split('.');
        let value = current;
        for (const key of keys) {
            if (value[key] === undefined) return undefined;
            value = value[key];
        }
        return value;
    }

    /**
     * Define uma configuração específica
     * @param {string} path - Caminho usando ponto (ex: 'volume.master')
     * @param {*} value - Novo valor
     */
    function set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let target = current;
        
        // Navega até o objeto pai
        for (const key of keys) {
            if (!target[key]) target[key] = {};
            target = target[key];
        }
        
        // Define o valor
        target[lastKey] = value;
        
        // Auto-save se habilitado
        if (autoSaveEnabled) {
            scheduleAutoSave();
        }
        
        // Aplica configurações especiais
        const category = keys[0];
        if (category === 'graphics') {
            applyGraphicsSettings();
        }
        
        // Notifica callbacks
        notifyCallbacks(category);
        notifyCallbacks('any');
    }

    /**
     * Obtém volume de uma categoria
     */
    function getVolume(category = 'master') {
        return current.volume[category] || 1.0;
    }

    /**
     * Define volume de uma categoria (0 a 1)
     */
    function setVolume(category, value) {
        value = Math.max(0, Math.min(1, value));
        set(`volume.${category}`, value);
        notifyCallbacks('volume');
    }

    /**
     * Obtém volume efetivo (categoria * master)
     */
    function getEffectiveVolume(category = 'master') {
        if (category === 'master') return current.volume.master;
        return current.volume[category] * current.volume.master;
    }

    /**
     * Toggle fullscreen
     */
    function toggleFullscreen() {
        const newValue = !current.graphics.fullscreen;
        set('graphics.fullscreen', newValue);
        applyFullscreen(newValue);
    }

    /**
     * Define fullscreen
     */
    function setFullscreen(value) {
        set('graphics.fullscreen', value);
        applyFullscreen(value);
    }

    /**
     * Verifica se está em fullscreen
     */
    function isFullscreen() {
        return current.graphics.fullscreen;
    }

    /**
     * Aplica configurações de gráficos
     */
    function applyGraphicsSettings() {
        // Pixelated rendering
        if (window.engine && window.engine.ctx) {
            const ctx = window.engine.ctx;
            const pixelated = current.graphics.pixelated;
            ctx.imageSmoothingEnabled = !pixelated;
            ctx.webkitImageSmoothingEnabled = !pixelated;
            ctx.mozImageSmoothingEnabled = !pixelated;
            ctx.msImageSmoothingEnabled = !pixelated;
        }
    }

    /**
     * Aplica fullscreen
     */
    function applyFullscreen(enabled) {
        const canvas = window.engine?.canvas;
        if (!canvas) return;

        try {
            if (enabled) {
                if (canvas.requestFullscreen) {
                    canvas.requestFullscreen();
                } else if (canvas.webkitRequestFullscreen) {
                    canvas.webkitRequestFullscreen();
                } else if (canvas.mozRequestFullScreen) {
                    canvas.mozRequestFullScreen();
                } else if (canvas.msRequestFullscreen) {
                    canvas.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        } catch (e) {
            console.error('[Settings] Fullscreen error:', e);
        }
    }

    /**
     * Agenda um auto-save
     */
    function scheduleAutoSave() {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }
        autoSaveTimer = setTimeout(() => {
            save();
            autoSaveTimer = null;
        }, autoSaveDelay);
    }

    /**
     * Registra callback para mudanças de configuração
     * @param {string} category - 'volume', 'graphics', 'controls', 'gameplay', 'any'
     * @param {function} callback - Função a ser chamada
     */
    function onChange(category, callback) {
        if (callbacks[category]) {
            callbacks[category].push(callback);
        }
    }

    /**
     * Remove callback
     */
    function offChange(category, callback) {
        if (callbacks[category]) {
            const index = callbacks[category].indexOf(callback);
            if (index > -1) {
                callbacks[category].splice(index, 1);
            }
        }
    }

    /**
     * Notifica callbacks de uma categoria
     */
    function notifyCallbacks(category) {
        if (callbacks[category]) {
            for (const callback of callbacks[category]) {
                try {
                    callback(current);
                } catch (e) {
                    console.error('[Settings] Callback error:', e);
                }
            }
        }
    }

    /**
     * Deep merge de objetos
     */
    function deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] instanceof Object && !Array.isArray(source[key])) {
                result[key] = deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    /**
     * Obtém todas as configurações
     */
    function getAll() {
        return JSON.parse(JSON.stringify(current));
    }

    /**
     * Define múltiplas configurações de uma vez
     */
    function setAll(newSettings) {
        current = deepMerge(defaults, newSettings);
        save();
        applyGraphicsSettings();
        notifyCallbacks('any');
    }

    /**
     * Verifica se uma tecla está mapeada para uma ação
     */
    function isKeyMappedTo(key, action) {
        const mappedKeys = current.controls.keyMap[action] || [];
        return mappedKeys.includes(key);
    }

    /**
     * Mapeia uma tecla para uma ação
     */
    function mapKey(action, key) {
        if (!current.controls.keyMap[action]) {
            current.controls.keyMap[action] = [];
        }
        if (!current.controls.keyMap[action].includes(key)) {
            current.controls.keyMap[action].push(key);
            set('controls.keyMap', current.controls.keyMap);
        }
    }

    /**
     * Remove mapeamento de tecla
     */
    function unmapKey(action, key) {
        if (current.controls.keyMap[action]) {
            const index = current.controls.keyMap[action].indexOf(key);
            if (index > -1) {
                current.controls.keyMap[action].splice(index, 1);
                set('controls.keyMap', current.controls.keyMap);
            }
        }
    }

    /**
     * Obtém todas as teclas mapeadas para uma ação
     */
    function getMappedKeys(action) {
        return current.controls.keyMap[action] || [];
    }

    // Listener para mudanças de fullscreen do navegador
    document.addEventListener('fullscreenchange', () => {
        const isCurrentlyFullscreen = !!document.fullscreenElement;
        if (isCurrentlyFullscreen !== current.graphics.fullscreen) {
            current.graphics.fullscreen = isCurrentlyFullscreen;
            notifyCallbacks('graphics');
            notifyCallbacks('any');
        }
    });

    // Auto-init se engine já existe
    if (window.engine) {
        init();
    } else {
        // Aguarda engine ser criado
        window.addEventListener('load', () => {
            setTimeout(init, 100);
        });
    }

    return {
        // Core
        init,
        save,
        load,
        reset,
        exportSettings,
        importSettings,
        
        // Get/Set
        get,
        set,
        getAll,
        setAll,
        
        // Volume
        getVolume,
        setVolume,
        getEffectiveVolume,
        
        // Fullscreen
        toggleFullscreen,
        setFullscreen,
        isFullscreen,
        
        // Key mapping
        isKeyMappedTo,
        mapKey,
        unmapKey,
        getMappedKeys,
        
        // Callbacks
        onChange,
        offChange,
        
        // Auto-save config
        setAutoSave: (enabled) => { autoSaveEnabled = enabled; },
        setAutoSaveDelay: (delay) => { autoSaveDelay = delay; }
    };
})();

// Exporta globalmente para uso sem import
if (typeof window !== 'undefined') {
    window.settings = settings;
}
