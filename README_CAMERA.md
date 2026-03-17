# 📷 Módulo de Câmera - JS2Love

Sistema de câmera 2D simples e poderoso para jogos.

## Uso Básico

```javascript
import { camera } from './JS2Love/modules/camera.js';

// No love.load
camera.setScreenSize(800, 600);  // Define tamanho da tela
camera.follow(player);            // Segue o player
camera.setSmoothness(5);          // Suavização (0-10, recomendado: 5)

// No love.update
camera.update(dt);

// No love.draw
camera.attach();                  // Inicia transformações
// ... desenhe o mundo aqui ...
camera.detach();                  // Remove transformações
// ... desenhe UI aqui (sem câmera) ...
```

## Funcionalidades

### 🎯 Seguir Objetos

```javascript
// Segue automaticamente um objeto (Actor, body, etc)
camera.follow(player);

// Com offset (deslocar a câmera)
camera.follow(player, 0, -50); // 50px acima do player

// Para de seguir
camera.unfollow();
```

### 🔍 Zoom

```javascript
camera.setZoom(2.0);      // Zoom 2x (mais perto)
camera.setZoom(0.5);      // Zoom 0.5x (mais longe)
const z = camera.getZoom(); // Pega zoom atual
```

### 💥 Shake (Tremor)

```javascript
// Shake ao pular
camera.shake(10, 0.5);  // intensidade: 10px, duração: 0.5s

// Shake forte em explosão
camera.shake(20, 1.0);

// Shake sutil em impacto
camera.shake(5, 0.2);
```

### 🗺️ Limites de Mundo

```javascript
// Define limites do mapa (câmera não sai desses limites)
camera.setLimits(0, 0, 2000, 1000); // x, y, largura, altura

// Remove limites
camera.removeLimits();
```

### 🎮 Deadzone

Área central onde a câmera não se move (melhor para plataformas):

```javascript
// Cria área de 200x100 no centro
camera.setDeadzone(200, 100);

// Remove deadzone
camera.removeDeadzone();
```

### 📐 Posição Manual

```javascript
// Define posição diretamente (sem suavização)
camera.setPosition(100, 200);

// Move suavemente para posição
camera.moveTo(100, 200);

// Pega posição atual
const pos = camera.getPosition(); // { x, y }
```

### 🔄 Rotação

```javascript
camera.setRotation(Math.PI / 4); // 45 graus
const rot = camera.getRotation();
```

### 🎛️ Configurações

```javascript
// Suavização: 0 = instantâneo, valores maiores = mais suave
camera.setSmoothness(10); // Muito suave
camera.setSmoothness(0);  // Sem suavização

// Tamanho da tela (importante para centralização correta)
camera.setScreenSize(1920, 1080);
```

### 🔄 Conversão de Coordenadas

```javascript
// Tela → Mundo (útil para mouse)
const world = camera.screenToWorld(mouseX, mouseY);

// Mundo → Tela
const screen = camera.worldToScreen(objectX, objectY);
```

### 🔄 Reset

```javascript
camera.reset(); // Volta tudo ao padrão
```

## Exemplos Completos

### Plataforma 2D

```javascript
window.love.load = function() {
    camera.setScreenSize(800, 600);
    camera.follow(player);
    camera.setSmoothness(5);
    camera.setLimits(0, 0, 3200, 600); // Mapa de 3200x600
}

window.love.update = function(dt) {
    camera.update(dt);
}

window.love.draw = function() {
    camera.attach();
    // Desenha mundo
    tilemap.draw();
    player.draw();
    camera.detach();
    
    // UI
    drawHealthBar();
}

window.love.keypressed = function(key) {
    if (key === 'w') {
        player.jump();
        camera.shake(5, 0.3); // Shake ao pular
    }
}
```

### Top-Down com Deadzone

```javascript
window.love.load = function() {
    camera.setScreenSize(800, 600);
    camera.follow(player);
    camera.setDeadzone(150, 150); // Área central de conforto
    camera.setSmoothness(8); // Mais suave para top-down
}
```

### Boss Fight com Zoom Dinâmico

```javascript
// Zoom out quando boss aparece
function onBossEnter() {
    camera.setZoom(0.7);  // Mostra mais da arena
    camera.shake(20, 1.0); // Entrada dramática
}

// Zoom normal quando boss morre
function onBossDefeated() {
    camera.setZoom(1.0);
    camera.shake(30, 1.5); // Explosão
}
```

### Mouse no Mundo

```javascript
window.love.mousepressed = function(x, y, button) {
    const world = camera.screenToWorld(x, y);
    // Agora 'world' tem coordenadas do mundo, não da tela
    spawnObjectAt(world.x, world.y);
}
```

## Dicas

✅ **Sempre** chame `camera.update(dt)` no `love.update`  
✅ **Sempre** use `attach()` antes e `detach()` depois de desenhar o mundo  
✅ Desenhe UI **depois** do `detach()` para não ser afetada pela câmera  
✅ Para mouse, use sempre `screenToWorld()` para converter coordenadas  
✅ Suavização recomendada: 5-10 (plataforma), 3-5 (top-down)  
✅ Use `shake()` em momentos de impacto para mais "juice"  

## Performance

O módulo da câmera é muito leve e não afeta performance. Todas as transformações são feitas pelo canvas nativo do navegador.
