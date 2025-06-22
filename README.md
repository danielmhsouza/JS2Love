## 🎮 JS2Love - Uma Engine Love2D em JavaScript

**JS2Love** é uma engine 2D feita em JavaScript que recria as principais funcionalidades da **Love2D** (Lua), proporcionando uma experiência familiar para desenvolvedores que desejam criar jogos 2D diretamente no navegador com uma API semelhante.

---

## 🚀 Principais Funcionalidades

### 🎨 Gráficos (`love.graphics`)
- `setColor(r, g, b, a)` — Define a cor para desenho
- `setBackgroundColor(r, g, b)` — Altera a cor de fundo
- `rectangle(mode, x, y, w, h)` — Desenha retângulos
- `circle(mode, x, y, radius)` — Desenha círculos
- `line(x1, y1, x2, y2, ...)` — Desenha linhas
- `polygon(mode, ...)` — Desenha polígonos personalizados
- `print(text, x, y)` — Exibe texto na tela
- `setFont(size)` — Define o tamanho da fonte
- `push()`, `pop()` — Salva/restaura o estado gráfico
- `translate(x, y)` — Move a origem do canvas
- `rotate(angle)` — Rotaciona o canvas
- `scale(sx, sy)` — Escala o canvas
- `setLineWidth(width)` — Altera a espessura das linhas

### 🖼️ Sprites e Imagens
- `newImage(path)` — Carrega uma imagem
- `draw(image, x, y, r, sx, sy, ox, oy)` — Desenha uma imagem com rotação, escala e origem


---

### ⌨️ Entrada (`love.keyboard`, `love.mouse`)
- `keyboard.isDown(key)` — Verifica se uma tecla está pressionada
- `mouse.getX()`, `mouse.getY()` — Obtém a posição atual do mouse
- `mouse.getPosition()` — Retorna a posição como vetor
- `mouse.isDown(button)` — Verifica se um botão do mouse está pressionado

---

### ⏱️ Tempo (`love.timer`)
- `getTime()` — Tempo total desde o início
- `getDelta()` — Delta time entre frames
- `getFPS()` — Frames por segundo atuais

---

### 🔢 Matemática (`love.math`)
- `random(min, max)` — Gera números aleatórios
- `randomseed(seed)` — Define a semente do gerador aleatório

---

### 🔊 Áudio (`love.audio`)
- `newSource(path, type)` — Cria uma fonte de som (utiliza Web Audio API)

<small> *Ainda em desenvolvimento</small>

---

## 🔁 Callbacks do Love2D

- `love.load()` — Chamado uma vez no início
- `love.update(dt)` — Atualização lógica a cada frame
- `love.draw()` — Renderização da tela
- `love.keypressed(key)` / `love.keyreleased(key)` — Eventos de teclado
- `love.mousepressed(x, y, button)` / `love.mousereleased(x, y, button)` — Eventos de mouse
- `love.mousemoved(x, y, dx, dy)` — Movimentação do mouse

## Módulos

Módulos auxiliares que facilitam no desenvolvimento de jogos.

## anim.js
- `anim.newGrid(frameWidth, frameHeight, imageWidth, imageHeight)` - Cria uma grade de acordo com imagem
- `anim.newAnimation(frames, frameTime)` - Cria uma animação com os frames e a grade

Código de exemplo:

```javascript
const game = {
    sprite: null,
    frame: null,
    animFrame: null,
    animation: null,
    grid: null
};

window.love.load = function () {
    console.log("Game loaded!");

    game.sprite = love.graphics.newImage('./frogamcao.png');
    game.frame = love.graphics.newQuad(250, 300, 100, 180, game.sprite.width, game.sprite.height);

    game.grid = anim.newGrid(64, 64, game.sprite.width, game.sprite.height);
    game.animFrame = game.grid('1-16', 6);
    game.animation = anim.newAnimation(game.animFrame, 0.15);
}

window.love.update = function (dt) {
    game.animation.update(dt);
}

window.love.draw = function () {
    game.animation.draw(game.sprite, 600, 100, 0, 1.5, 1.5, 32, 32);
}
```
## particles.js
- `particles.newEmitter(config)`- Cria uma fonte de emissão de partículas

```javascript
let config = {
    x: config.x || 0,
    y: config.y || 0,
    image: config.image || null,
    rate: config.rate || 50, // partículas por segundo
    life: config.life || [0.5, 1.5],
    speed: config.speed || [50, 100],
    size: config.size || [1, 1],
    spread: config.spread || Math.PI * 2,
    direction: config.direction || 0,
    color: config.color || { r: 255, g: 255, b: 255, a: 255 },
    particles: [],
    timeSinceLastEmit: 0,
    max: config.max || 100,
    active: true,
    burst: config.burst || false,
}
```
Código de exemplo:

```javascript
let emitter;

window.love.load = function () {
    emitter = particles.newEmitter({
        x: 400,
        y: 300,
        rate: 100,
        spread: Math.PI * 2,
        speed: [50, 150],
        size: [2, 5],
        life: [0.5, 1.5],
        color: { r: 255, g: 255, b: 0, a: 255 },
        max: 200
    });
}

window.love.update = function(dt) {
    emitter.x = love.mouse.getX();
    emitter.y = love.mouse.getY();
    particles.update(dt);
}

window.love.draw = function() {
    particles.draw();
}
```

## physics.js

- `physics.newBody({ x = 0, y = 0, width = 0, height = 0, radius = 0, shape = 'rectangle', type = 'dynamic', gravity = true, friction = 0.95, pushFactor = 0.3, vertices = null })` - Cria um corpo que responde à física
o parâmetro `shape` pode ser `'static'`, `'dynamic'`, `'pushable'` ou `'sensor'`.
- `physics.checkCollision(a, b)` - Verifica se houve colisão entre dois objetos
- `physics.handleCollisionResponse(a, b)` - Lida com a colisão entre dois objetos
```
* Se um corpo é sensor, não há resposta. Se um corpo é dinâmico e o outro é estático, para o corpo dinâmico.
* Se um corpo é dinâmico e o outro é empurrável, transfere a velocidade do corpo dinâmico para o empurrável.
* Se um corpo empurrável colide com um corpo estático, para o corpo empurrável.
* Se ambos os corpos são dinâmicos, aplica a resposta de colisão padrão.
* Se ambos os corpos são estáticos, não há resposta.
* Se ambos os corpos são sensores, não há resposta.
* Se ambos os corpos são empurráveis, transfere a velocidade do primeiro para o segundo.
* Se um corpo é sensor, não há resposta.
* Se um corpo é dinâmico e o outro é estático, para o corpo dinâmico.
```
- `physics.setGravity(body, enabled)` - Ativa e desativa gravidade de um objeto

Código de exemplo:

```javascript
const player = physics.newBody({
    x: 100, y: 100, width: 32, height: 32,
    shape: 'rectangle', type: 'dynamic',
    friction: 1, gravity: false
});

const box = physics.newBody({
    x: 100, y: 50, width: 32, height: 32,
    shape: 'circle', type: 'pushable', friction: 0.95, gravity: true, radius: 16
});

const floor = physics.newBody({
    x: 0, y: 400, width: 800, height: 50,
    shape: 'rectangle', type: 'static'
});

window.love.update = function (dt) {
    physics.update(dt);
    [box, floor].forEach(other => { // Loop externo verifica box e floor
        if (physics.checkCollision(player, other)) {
            physics.handleCollisionResponse(player, other);
        }
        if (physics.checkCollision(box, other)) { // Aqui, box colide com floor (static)
            physics.handleCollisionResponse(box, other);
        }
    });

    if (love.keyboard.isDown('a')) {
        player.vx = -200;
    }
    else if (love.keyboard.isDown('d')) {
        player.vx = 200;
    } else {
        player.vx = 0;
    }
    if (love.keyboard.isDown('w')) {
        player.vy = -200;
    }
    else if (love.keyboard.isDown('s')) {
        player.vy = 200;
    } else {
        player.vy = 0;
    }
}

window.love.draw = function() {
    //... Código de renderização
}
```

<small> <b>OBS: </b> Algumas funcionalidades do módulo de física ainda estão sendo desenvolvidas, mas o básico funciona perfeitamente! </small>

## tilemap.js
- `tilemap.load(tilesetPath, mapJsonPath, callback)` - Carrega um mapa a partir de um tileset e um json
- `tilemap.getColliders()` - Retorna todos os objetos com física (estáticos)

Código de exemplo:

``` javascript
window.love.load = function() {
    tilemap.load('./maps/1.png', './maps/1.json', () => {
        console.log('Mapa carregado!');
    });
}

window.love.update = function(dt) {
    for (const col of tilemap.getColliders()) {
        if (physics.checkCollision(player, col)) {
            physics.handleCollisionResponse(player, col);
        }
    }
}

window.love.draw = function(){
    tilemap.draw()
}
```

<br>
---

## 🧠 Objetivo

Esta engine tem como objetivo ser uma ponte para desenvolvedores que amam a Love2D e desejam criar jogos 2D para navegadores, sem perder a familiaridade da API original.

---

## 📦 Instalação

Faça o download do arquivo love.js (opcional os módulos) e adicione ao seu projeto! Simples assim.

---

## 🛠 Em desenvolvimento

Funcionalidades planejadas:
- Gerenciador de cenas
- Sistema de física 2D leve
- Sistema de colisão
- Módulo de assets (imagem, áudio, fonte)

---

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues, sugerir melhorias ou enviar pull requests.