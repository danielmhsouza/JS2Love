# 🎬 Scene Manager - Sistema de Cenas e Estados

Sistema completo para gerenciar diferentes cenas do jogo (menu, gameplay, pause, game over, etc) com transições suaves.

## 📦 Importação

```javascript
import { scene } from './JS2Love/modules/scene.js';
```

## 🚀 Uso Básico

### 1. Registrar Cenas

```javascript
// Cena do Menu
scene.register('menu', {
    load: function() {
        console.log('Menu carregado');
        this.data.selectedOption = 0;
    },
    
    enter: function() {
        console.log('Entrou no menu');
    },
    
    update: function(dt) {
        // Lógica do menu
    },
    
    draw: function() {
        love.graphics.setColor(255, 255, 255);
        love.graphics.print('=== MENU ===', 10, 10);
        love.graphics.print('Pressione ENTER para jogar', 10, 30);
    },
    
    keypressed: function(key) {
        if (key === 'enter') {
            scene.transitionTo('game', 0.5, 'fade');
        }
    },
    
    leave: function() {
        console.log('Saiu do menu');
    }
});

// Cena do Jogo
scene.register('game', {
    load: function() {
        // Inicializa o jogo
        this.data.player = createPlayer();
        this.data.score = 0;
    },
    
    update: function(dt) {
        // Atualiza gameplay
        this.data.player.update(dt);
    },
    
    draw: function() {
        // Desenha o jogo
        this.data.player.draw();
        love.graphics.print(`Score: ${this.data.score}`, 10, 10);
    },
    
    keypressed: function(key) {
        if (key === 'escape') {
            scene.transitionTo('pause', 0.3, 'fade');
        }
    }
});

// Cena de Pause
scene.register('pause', {
    draw: function() {
        // Desenha a cena anterior (game)
        const gameScene = scene.getData('game');
        if (gameScene) {
            // Ainda mostra o jogo
        }
        
        // Overlay de pause
        love.graphics.setColor(0, 0, 0, 150);
        love.graphics.rectangle('fill', 0, 0, 640, 320);
        
        love.graphics.setColor(255, 255, 255);
        love.graphics.print('=== PAUSADO ===', 10, 10);
        love.graphics.print('ESC = voltar', 10, 30);
    },
    
    keypressed: function(key) {
        if (key === 'escape') {
            scene.transitionTo('game', 0.3, 'fade');
        }
    }
});
```

### 2. Iniciar o Jogo

```javascript
window.love.load = function() {
    // Vai para o menu inicial com transição
    scene.transitionTo('menu', 0.5, 'fade');
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
```

## 🎨 Tipos de Transição

### Fade (padrão)
```javascript
scene.transitionTo('game', 0.5, 'fade');
```

### Slide Left
```javascript
scene.transitionTo('game', 0.5, 'slideLeft');
```

### Slide Right
```javascript
scene.transitionTo('game', 0.5, 'slideRight');
```

### Slide Up
```javascript
scene.transitionTo('game', 0.5, 'slideUp');
```

### Slide Down
```javascript
scene.transitionTo('game', 0.5, 'slideDown');
```

### Sem Transição
```javascript
scene.switchTo('game'); // Instantâneo
```

## 📚 API Completa

### `scene.register(name, sceneObj)`
Registra uma nova cena.

**Callbacks disponíveis:**
- `load()` - Chamado uma vez ao carregar a cena pela primeira vez
- `unload()` - Chamado ao desregistrar a cena
- `enter()` - Chamado toda vez que entra na cena
- `leave()` - Chamado toda vez que sai da cena
- `update(dt)` - Atualizado a cada frame
- `draw()` - Desenha a cena
- `keypressed(key)` - Tecla pressionada
- `keyreleased(key)` - Tecla solta
- `mousepressed(x, y, button)` - Mouse pressionado
- `mousereleased(x, y, button)` - Mouse solto
- `mousemoved(x, y)` - Mouse movido

### `scene.switchTo(name, ...args)`
Muda para uma cena instantaneamente (sem transição).

### `scene.transitionTo(name, duration, type, ...args)`
Muda para uma cena com transição.
- `duration` - Duração em segundos (padrão: 0.5)
- `type` - Tipo de transição (padrão: 'fade')

### `scene.unregister(name)`
Remove uma cena registrada.

### `scene.getCurrent()`
Retorna o nome da cena atual.

### `scene.getPrevious()`
Retorna o nome da cena anterior.

### `scene.getData(name)`
Retorna os dados persistentes de uma cena.

### `scene.setData(name, data)`
Define dados persistentes para uma cena.

### `scene.isTransitioning()`
Verifica se está em transição.

### `scene.setTransitionDuration(duration)`
Define a duração padrão das transições.

### `scene.list()`
Lista todas as cenas registradas.

## 💡 Exemplo Completo: Jogo com Menu

```javascript
import { scene } from './JS2Love/modules/scene.js';
import { physics } from './JS2Love/modules/physics.js';

// ==================== MENU ====================
scene.register('menu', {
    load: function() {
        this.data.options = ['Jogar', 'Créditos', 'Sair'];
        this.data.selected = 0;
    },
    
    draw: function() {
        love.graphics.setBackgroundColor(20, 20, 40);
        
        love.graphics.setColor(255, 255, 100);
        love.graphics.print('MEU JOGO', 250, 50);
        
        this.data.options.forEach((opt, i) => {
            const color = (i === this.data.selected) ? [255, 255, 0] : [200, 200, 200];
            love.graphics.setColor(...color);
            love.graphics.print(opt, 280, 120 + i * 30);
        });
    },
    
    keypressed: function(key) {
        if (key === 'up' || key === 'w') {
            this.data.selected = Math.max(0, this.data.selected - 1);
        }
        if (key === 'down' || key === 's') {
            this.data.selected = Math.min(this.data.options.length - 1, this.data.selected + 1);
        }
        if (key === 'enter') {
            if (this.data.selected === 0) {
                scene.transitionTo('game', 0.5, 'slideLeft');
            }
        }
    }
});

// ==================== GAME ====================
scene.register('game', {
    load: function() {
        physics.init(0, 1);
        this.data.player = createPlayer();
        this.data.score = 0;
    },
    
    update: function(dt) {
        physics.update(dt);
        this.data.player.update(dt);
    },
    
    draw: function() {
        love.graphics.setBackgroundColor(50, 150, 200);
        this.data.player.draw();
        
        love.graphics.setColor(255, 255, 255);
        love.graphics.print(`Score: ${this.data.score}`, 10, 10);
        love.graphics.print('ESC = Menu', 10, 30);
    },
    
    keypressed: function(key) {
        if (key === 'escape') {
            scene.transitionTo('menu', 0.5, 'slideRight');
        }
    }
});

// ==================== INÍCIO ====================
window.love.load = function() {
    scene.transitionTo('menu', 0.5, 'fade');
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
```

## 🎯 Padrões de Uso

### Game Over com Retry
```javascript
scene.register('gameover', {
    enter: function(finalScore) {
        this.data.finalScore = finalScore;
    },
    
    draw: function() {
        love.graphics.print(`Game Over! Score: ${this.data.finalScore}`, 10, 10);
        love.graphics.print('R = Retry, M = Menu', 10, 30);
    },
    
    keypressed: function(key) {
        if (key === 'r') {
            scene.transitionTo('game', 0.5, 'fade');
        }
        if (key === 'm') {
            scene.transitionTo('menu', 0.5, 'slideRight');
        }
    }
});

// No jogo, quando o player morre:
// scene.transitionTo('gameover', 0.5, 'fade', playerScore);
```

### Compartilhar Dados Entre Cenas
```javascript
// Na cena do jogo
scene.setData('game', { highScore: 1000 });

// No menu
const gameData = scene.getData('game');
console.log(gameData.highScore); // 1000
```

## ⚡ Performance

- **Leve**: ~300 linhas, 0 dependências
- **Eficiente**: Apenas a cena atual é atualizada
- **Transições suaves**: 60 FPS garantido
- **Sem GC pressure**: Reutiliza objetos

## 🎮 Casos de Uso

✅ Menu principal  
✅ Tela de loading  
✅ Gameplay  
✅ Pause  
✅ Game Over  
✅ Tutorial  
✅ Cutscenes  
✅ Loja/Inventário  
✅ Configurações  

---

**Dica**: Combine com o módulo `camera` para ter câmeras diferentes por cena!
