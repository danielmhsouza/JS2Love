# 📖 Sistema de Configurações - JS2Love

Sistema completo de gerenciamento de configurações com volume, fullscreen, controles e persistência automática.

## 🎯 Características

- ✅ **Volume por Categoria** - Master, música, SFX, voz
- ✅ **Fullscreen** - Toggle com F11 ou via código
- ✅ **Persistência Automática** - LocalStorage com auto-save
- ✅ **Export/Import** - Compartilhe configurações via JSON
- ✅ **Callbacks** - Reaja a mudanças de configuração
- ✅ **Key Mapping** - Mapeamento customizável de teclas
- ✅ **Configurações de Gameplay** - Dificuldade, tutorial, idioma
- ✅ **Plug and Play** - Uso simples e intuitivo

---

## 🚀 Setup Básico

```javascript
import { settings } from './JS2Love/modules/settings.js';

window.love.load = function() {
    // O settings já está inicializado automaticamente!
    
    // Obtém configurações
    const volume = settings.getVolume('master');
    const fullscreen = settings.isFullscreen();
    
    console.log('Volume Master:', volume);
    console.log('Fullscreen:', fullscreen);
};
```

---

## 🔊 Volume

### Volume por Categoria

```javascript
// Obtém volume (0 a 1)
const masterVol = settings.getVolume('master');  // 1.0
const musicVol = settings.getVolume('music');    // 0.8
const sfxVol = settings.getVolume('sfx');        // 1.0
const voiceVol = settings.getVolume('voice');    // 1.0

// Define volume
settings.setVolume('master', 0.7);
settings.setVolume('music', 0.5);
settings.setVolume('sfx', 0.8);

// Volume efetivo (categoria * master)
const effectiveMusic = settings.getEffectiveVolume('music');
// Se master = 0.7 e music = 0.5, retorna 0.35
```

### Aplicando Volume no Áudio

```javascript
// Exemplo com Web Audio API
function playSound(audioBuffer, category = 'sfx') {
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = audioBuffer;
    gainNode.gain.value = settings.getEffectiveVolume(category);
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start(0);
}

// Exemplo com HTML Audio
function playMusic(audioElement) {
    audioElement.volume = settings.getEffectiveVolume('music');
    audioElement.play();
}
```

### Callback de Mudança de Volume

```javascript
settings.onChange('volume', (config) => {
    console.log('Volume mudou!', config.volume);
    
    // Atualiza volume de músicas tocando
    backgroundMusic.volume = settings.getEffectiveVolume('music');
});
```

---

## 🖼️ Fullscreen

```javascript
// Toggle fullscreen
settings.toggleFullscreen();

// Define fullscreen
settings.setFullscreen(true);   // Entra em fullscreen
settings.setFullscreen(false);  // Sai de fullscreen

// Verifica estado
if (settings.isFullscreen()) {
    console.log('Em fullscreen!');
}

// Atalho comum: F11
window.love.keypressed = function(key) {
    if (key === 'f11') {
        settings.toggleFullscreen();
    }
};
```

### Callback de Mudança de Gráficos

```javascript
settings.onChange('graphics', (config) => {
    console.log('Gráficos mudaram!', config.graphics);
    
    if (config.graphics.fullscreen) {
        console.log('Entrou em fullscreen');
    }
});
```

---

## 💾 Save & Load

### Automático

Por padrão, as configurações são salvas automaticamente 500ms após qualquer mudança:

```javascript
settings.setVolume('music', 0.5);
// Salvo automaticamente após 500ms
```

### Manual

```javascript
// Salvar agora
settings.save();

// Carregar
settings.load();

// Resetar para padrão
settings.reset();
```

### Configurar Auto-Save

```javascript
// Desabilitar auto-save
settings.setAutoSave(false);

// Mudar delay (em ms)
settings.setAutoSaveDelay(1000); // 1 segundo

// Agora você precisa salvar manualmente
settings.setVolume('music', 0.5);
settings.save();
```

---

## 📤 Export & Import

### Exportar Configurações

```javascript
// Obtém JSON das configurações
const json = settings.exportSettings();
console.log(json);

// Copiar para clipboard
navigator.clipboard.writeText(json);

// Ou fazer download
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'config.json';
a.click();
```

### Importar Configurações

```javascript
// De JSON string
const success = settings.importSettings(jsonString);

if (success) {
    console.log('Configurações importadas!');
} else {
    console.log('Erro ao importar');
}

// De arquivo
inputFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
        settings.importSettings(event.target.result);
    };
    
    reader.readAsText(file);
});
```

---

## 🎮 Configurações de Gameplay

```javascript
// Dificuldade
settings.set('gameplay.difficulty', 'hard'); // 'easy', 'normal', 'hard'
const difficulty = settings.get('gameplay.difficulty');

// Tutorial
settings.set('gameplay.showTutorial', false);
const showTutorial = settings.get('gameplay.showTutorial');

// Idioma
settings.set('gameplay.language', 'en-US');
const language = settings.get('gameplay.language');
```

---

## ⌨️ Key Mapping

### Verificar Mapeamento

```javascript
// Verifica se a tecla está mapeada para uma ação
if (settings.isKeyMappedTo('w', 'jump')) {
    console.log('W está mapeado para pular');
}

// Obtém todas as teclas de uma ação
const jumpKeys = settings.getMappedKeys('jump');
// ['w', ' '] (w e espaço)
```

### Mapear Teclas

```javascript
// Adiciona tecla a uma ação
settings.mapKey('jump', 'w');
settings.mapKey('jump', ' '); // espaço também pula

// Remove mapeamento
settings.unmapKey('jump', 'w');
```

### Usar no Jogo

```javascript
window.love.keypressed = function(key) {
    if (settings.isKeyMappedTo(key, 'jump')) {
        player.jump();
    }
    
    if (settings.isKeyMappedTo(key, 'attack')) {
        player.attack();
    }
    
    if (settings.isKeyMappedTo(key, 'pause')) {
        scene.transitionTo('pause');
    }
};
```

### Tela de Remapeamento

```javascript
let remappingAction = null;

function startRemapping(action) {
    remappingAction = action;
    console.log(`Pressione uma tecla para ${action}`);
}

window.love.keypressed = function(key) {
    if (remappingAction) {
        // Remove mapeamento antigo
        const oldKeys = settings.getMappedKeys(remappingAction);
        for (const oldKey of oldKeys) {
            settings.unmapKey(remappingAction, oldKey);
        }
        
        // Mapeia nova tecla
        settings.mapKey(remappingAction, key);
        remappingAction = null;
        
        console.log(`${key} agora é ${remappingAction}`);
    }
};
```

---

## 🔔 Callbacks

### Registrar Callbacks

```javascript
// Callback para mudanças de volume
settings.onChange('volume', (config) => {
    console.log('Volume:', config.volume);
});

// Callback para mudanças de gráficos
settings.onChange('graphics', (config) => {
    console.log('Gráficos:', config.graphics);
});

// Callback para mudanças de controles
settings.onChange('controls', (config) => {
    console.log('Controles:', config.controls);
});

// Callback para mudanças de gameplay
settings.onChange('gameplay', (config) => {
    console.log('Gameplay:', config.gameplay);
});

// Callback para QUALQUER mudança
settings.onChange('any', (config) => {
    console.log('Configuração mudou!', config);
});
```

### Remover Callbacks

```javascript
function myCallback(config) {
    console.log('Volume mudou');
}

// Registra
settings.onChange('volume', myCallback);

// Remove
settings.offChange('volume', myCallback);
```

---

## 📊 Get & Set Avançado

### Usando Path

```javascript
// Get com path (notação de ponto)
const pixelated = settings.get('graphics.pixelated');
const difficulty = settings.get('gameplay.difficulty');
const masterVol = settings.get('volume.master');

// Set com path
settings.set('graphics.vsync', true);
settings.set('gameplay.language', 'pt-BR');
settings.set('volume.voice', 0.8);
```

### Get/Set Completo

```javascript
// Obtém TODAS as configurações
const allSettings = settings.getAll();
console.log(allSettings);

// Define TODAS as configurações
settings.setAll({
    volume: {
        master: 0.7,
        music: 0.5,
        sfx: 0.9,
        voice: 1.0
    },
    graphics: {
        fullscreen: false,
        pixelated: true,
        vsync: true
    },
    // ...
});
```

---

## 🎨 Exemplo Completo: Tela de Configurações

```javascript
import { ui } from './JS2Love/modules/ui.js';
import { settings } from './JS2Love/modules/settings.js';

window.love.load = function() {
    // Painel
    ui.newPanel({ x: 50, y: 50, width: 500, height: 400 });
    
    // Título
    ui.newLabel({ 
        x: 200, y: 70, 
        text: 'Configurações',
        style: { fontSize: 24, color: [255, 255, 100] }
    });
    
    // Volume Master
    ui.newLabel({ x: 70, y: 120, text: 'Volume Master:' });
    
    const volumeLabel = ui.newLabel({ 
        x: 450, y: 120, 
        text: Math.round(settings.getVolume('master') * 100) + '%'
    });
    
    ui.newSlider({
        x: 200, y: 120, width: 230, height: 20,
        min: 0, max: 100,
        value: settings.getVolume('master') * 100,
        onChange: (value) => {
            settings.setVolume('master', value / 100);
            volumeLabel.setText(Math.round(value) + '%');
        }
    });
    
    // Fullscreen
    ui.newCheckbox({
        x: 70, y: 160,
        label: 'Tela Cheia',
        checked: settings.isFullscreen(),
        onChange: (checked) => {
            settings.setFullscreen(checked);
        }
    });
    
    // Dificuldade
    ui.newLabel({ x: 70, y: 200, text: 'Dificuldade:' });
    
    ui.newButton({
        x: 70, y: 230, width: 100, height: 35,
        text: 'Fácil',
        onClick: () => settings.set('gameplay.difficulty', 'easy')
    });
    
    ui.newButton({
        x: 180, y: 230, width: 100, height: 35,
        text: 'Normal',
        onClick: () => settings.set('gameplay.difficulty', 'normal')
    });
    
    ui.newButton({
        x: 290, y: 230, width: 100, height: 35,
        text: 'Difícil',
        onClick: () => settings.set('gameplay.difficulty', 'hard')
    });
    
    // Salvar/Resetar
    ui.newButton({
        x: 70, y: 380, width: 150, height: 40,
        text: 'Salvar',
        onClick: () => {
            settings.save();
            console.log('Salvo!');
        }
    });
    
    ui.newButton({
        x: 240, y: 380, width: 150, height: 40,
        text: 'Resetar',
        onClick: () => {
            settings.reset();
            console.log('Resetado!');
        }
    });
};
```

---

## 📋 Estrutura Padrão das Configurações

```javascript
{
    volume: {
        master: 1.0,
        music: 0.8,
        sfx: 1.0,
        voice: 1.0
    },
    
    graphics: {
        fullscreen: false,
        pixelated: false,
        vsync: true
    },
    
    controls: {
        keyMap: {
            jump: ['w', ' '],
            attack: ['j', 'z'],
            interact: ['e'],
            pause: ['escape', 'p']
        }
    },
    
    gameplay: {
        difficulty: 'normal',
        showTutorial: true,
        language: 'pt-BR'
    }
}
```

---

## 🔧 API Completa

### Core
- `settings.init()` - Inicializa (automático)
- `settings.save()` - Salva no localStorage
- `settings.load()` - Carrega do localStorage
- `settings.reset()` - Reseta para padrão
- `settings.exportSettings()` - Retorna JSON
- `settings.importSettings(json)` - Importa de JSON

### Get/Set
- `settings.get(path)` - Obtém configuração
- `settings.set(path, value)` - Define configuração
- `settings.getAll()` - Obtém todas
- `settings.setAll(config)` - Define todas

### Volume
- `settings.getVolume(category)` - Obtém volume
- `settings.setVolume(category, value)` - Define volume
- `settings.getEffectiveVolume(category)` - Volume real (categoria * master)

### Fullscreen
- `settings.toggleFullscreen()` - Alterna fullscreen
- `settings.setFullscreen(enabled)` - Define fullscreen
- `settings.isFullscreen()` - Verifica estado

### Key Mapping
- `settings.isKeyMappedTo(key, action)` - Verifica mapeamento
- `settings.mapKey(action, key)` - Mapeia tecla
- `settings.unmapKey(action, key)` - Remove mapeamento
- `settings.getMappedKeys(action)` - Obtém teclas

### Callbacks
- `settings.onChange(category, callback)` - Registra callback
- `settings.offChange(category, callback)` - Remove callback

### Auto-Save
- `settings.setAutoSave(enabled)` - Liga/desliga auto-save
- `settings.setAutoSaveDelay(ms)` - Define delay

---

## 💡 Casos de Uso

### 1. Menu de Opções Completo
Configurações acessíveis pelo jogador para personalizar a experiência.

### 2. Perfis de Jogador
Salvar diferentes configurações para múltiplos jogadores.

### 3. Acessibilidade
Ajustes de volume, controles e dificuldade para diferentes necessidades.

### 4. Debug Mode
Salvar preferências de desenvolvedor (mostrar FPS, hitboxes, etc).

### 5. Tutorial Adaptativo
Mostrar ou ocultar tutorial baseado na configuração salva.

---

## ⚠️ Notas Importantes

1. **LocalStorage**: As configurações são salvas no navegador. Limpar cache pode apagá-las.

2. **Auto-Save**: Delay de 500ms evita salvar a cada frame. Ajuste se necessário.

3. **Fullscreen**: Alguns navegadores bloqueiam fullscreen sem interação do usuário.

4. **Callbacks**: Cuidado com loops infinitos (callback que muda configuração que dispara callback).

5. **Export/Import**: Útil para transferir configurações entre dispositivos.

---

## 🎯 Exemplo Mínimo

```javascript
import { settings } from './JS2Love/modules/settings.js';

// Define volume
settings.setVolume('master', 0.7);

// Obtém volume
const volume = settings.getVolume('master');

// Fullscreen
settings.toggleFullscreen();

// Pronto! As configurações são salvas automaticamente.
```

---

Consulte `exempleSettings.js` e `settingsDemo.html` para um exemplo completo e funcional! 🚀
