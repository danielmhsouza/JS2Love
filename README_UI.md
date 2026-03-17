# 🎨 UI System - Sistema de Interface do Usuário

Sistema completo de componentes UI com suporte a assets customizados ou renderização padrão com estilos personalizáveis.

## 📦 Importação

```javascript
import { ui } from './JS2Love/modules/ui.js';
```

## 🎮 Setup Básico

```javascript
window.love.update = function(dt) {
    ui.update(dt);
}

window.love.draw = function() {
    ui.draw();
}

window.love.mousemoved = function(x, y) {
    ui.mousemoved(x, y);
}

window.love.mousepressed = function(x, y, button) {
    ui.mousepressed(x, y, button);
}

window.love.mousereleased = function(x, y, button) {
    ui.mousereleased(x, y, button);
}
```

## 🔘 Componentes

### Button (Botão)

```javascript
const button = ui.newButton({
    x: 100,
    y: 50,
    width: 200,
    height: 50,
    text: 'Clique Aqui!',
    onClick: (btn) => {
        console.log('Botão clicado!');
    },
    style: {
        backgroundColor: [50, 100, 200],
        backgroundColorHover: [70, 120, 220],
        backgroundColorActive: [30, 80, 180],
        textColor: [255, 255, 255],
        borderRadius: 10,
        borderWidth: 3,
        borderColor: [100, 150, 255]
    }
});

// Com imagens customizadas
const buttonWithImage = ui.newButton({
    x: 100,
    y: 120,
    width: 200,
    height: 50,
    text: 'Play',
    image: myButtonImage,           // Estado normal
    imageHover: myButtonHoverImage, // Estado hover
    imageActive: myButtonActiveImage, // Estado pressionado
    onClick: () => {
        scene.transitionTo('game');
    }
});
```

**Propriedades do estilo:**
- `backgroundColor` - Cor de fundo `[r, g, b]`
- `backgroundColorHover` - Cor ao passar o mouse
- `backgroundColorActive` - Cor ao pressionar
- `backgroundColorDisabled` - Cor quando desabilitado
- `textColor` - Cor do texto `[r, g, b]`
- `borderColor` - Cor da borda
- `borderWidth` - Largura da borda (px)
- `borderRadius` - Raio dos cantos arredondados
- `fontSize` - Tamanho da fonte
- `padding` - Espaçamento interno

### Checkbox

```javascript
const checkbox = ui.newCheckbox({
    x: 100,
    y: 50,
    size: 24,
    label: 'Ativar som',
    checked: true,
    onChange: (checked, chk) => {
        console.log('Checkbox agora está:', checked);
        audio.setMuted(!checked);
    },
    style: {
        backgroundColor: [200, 200, 200],
        checkColor: [50, 200, 50],
        borderColor: [100, 100, 100],
        borderWidth: 2,
        labelColor: [255, 255, 255],
        labelOffset: 10
    }
});

// Acessar/modificar valor
console.log(checkbox.checked); // true ou false
checkbox.checked = false; // Mudar programaticamente
```

### Slider

```javascript
const volumeSlider = ui.newSlider({
    x: 100,
    y: 50,
    width: 200,
    height: 20,
    min: 0,
    max: 100,
    value: 50,
    onChange: (value, slider) => {
        console.log('Volume:', value);
        audio.setVolume(value / 100);
    },
    style: {
        trackColor: [80, 80, 80],
        fillColor: [100, 200, 100],
        handleColor: [255, 255, 255],
        handleColorHover: [200, 200, 200],
        handleSize: 16
    }
});

// Acessar/modificar valor
console.log(volumeSlider.value); // 0-100
volumeSlider.value = 75; // Mudar programaticamente
```

### Label (Texto)

```javascript
const label = ui.newLabel({
    x: 100,
    y: 50,
    text: 'Score: 0',
    style: {
        color: [255, 255, 255],
        fontSize: 20
    }
});

// Atualizar texto
label.setText('Score: 1000');
```

### Panel (Painel/Container)

```javascript
const panel = ui.newPanel({
    x: 50,
    y: 50,
    width: 300,
    height: 200,
    style: {
        backgroundColor: [40, 40, 40, 200], // Com alpha
        borderColor: [100, 100, 100],
        borderWidth: 2,
        borderRadius: 15
    }
});

// Útil como fundo para outros componentes
```

### ProgressBar (Barra de Progresso)

```javascript
const healthBar = ui.newProgressBar({
    x: 100,
    y: 50,
    width: 200,
    height: 30,
    min: 0,
    max: 100,
    value: 75,
    showText: true,
    style: {
        backgroundColor: [60, 60, 60],
        fillColor: [200, 50, 50], // Vermelho para vida
        borderColor: [100, 100, 100],
        borderWidth: 2,
        textColor: [255, 255, 255]
    }
});

// Atualizar valor
healthBar.setValue(50);

// Loading bar
const loadingBar = ui.newProgressBar({
    x: 200,
    y: 300,
    width: 240,
    height: 20,
    min: 0,
    max: 100,
    value: 0,
    showText: true,
    style: {
        fillColor: [100, 200, 100]
    }
});
```

## 🎯 Exemplo Completo: Menu de Configurações

```javascript
import { ui } from './JS2Love/modules/ui.js';

window.love.load = function() {
    // Painel de fundo
    ui.newPanel({
        x: 50,
        y: 50,
        width: 540,
        height: 400,
        style: {
            backgroundColor: [30, 30, 50, 220],
            borderRadius: 20
        }
    });

    // Título
    ui.newLabel({
        x: 250,
        y: 70,
        text: 'Configurações',
        style: {
            color: [255, 255, 100],
            fontSize: 24
        }
    });

    // Checkbox: Som
    const soundCheckbox = ui.newCheckbox({
        x: 100,
        y: 130,
        size: 24,
        label: 'Ativar Som',
        checked: true,
        onChange: (checked) => {
            console.log('Som:', checked ? 'ON' : 'OFF');
        }
    });

    // Label: Volume
    ui.newLabel({
        x: 100,
        y: 180,
        text: 'Volume da Música',
        style: { color: [200, 200, 200] }
    });

    // Slider: Volume
    const volumeLabel = ui.newLabel({
        x: 500,
        y: 180,
        text: '50',
        style: { color: [100, 255, 100] }
    });

    ui.newSlider({
        x: 100,
        y: 210,
        width: 380,
        height: 20,
        min: 0,
        max: 100,
        value: 50,
        onChange: (value) => {
            volumeLabel.setText(Math.round(value).toString());
        },
        style: {
            fillColor: [100, 200, 255]
        }
    });

    // Checkboxes: Qualidade
    ui.newLabel({
        x: 100,
        y: 260,
        text: 'Qualidade Gráfica',
        style: { color: [200, 200, 200] }
    });

    ui.newCheckbox({
        x: 100,
        y: 290,
        size: 20,
        label: 'Partículas',
        checked: true
    });

    ui.newCheckbox({
        x: 100,
        y: 320,
        size: 20,
        label: 'Sombras Dinâmicas',
        checked: false
    });

    // Botões de ação
    ui.newButton({
        x: 100,
        y: 380,
        width: 150,
        height: 40,
        text: 'Aplicar',
        onClick: () => {
            console.log('Configurações aplicadas!');
        },
        style: {
            backgroundColor: [50, 150, 50],
            backgroundColorHover: [70, 180, 70],
            borderRadius: 8
        }
    });

    ui.newButton({
        x: 270,
        y: 380,
        width: 150,
        height: 40,
        text: 'Cancelar',
        onClick: () => {
            scene.transitionTo('menu');
        },
        style: {
            backgroundColor: [150, 50, 50],
            backgroundColorHover: [180, 70, 70],
            borderRadius: 8
        }
    });
}

window.love.update = function(dt) {
    ui.update(dt);
}

window.love.draw = function() {
    love.graphics.setBackgroundColor(20, 20, 30);
    ui.draw();
}

window.love.mousemoved = function(x, y) {
    ui.mousemoved(x, y);
}

window.love.mousepressed = function(x, y, button) {
    ui.mousepressed(x, y, button);
}

window.love.mousereleased = function(x, y, button) {
    ui.mousereleased(x, y, button);
}
```

## 🎮 Exemplo: HUD de Jogo

```javascript
let healthBar, manaBar, scoreLabel;

window.love.load = function() {
    // Barra de vida
    healthBar = ui.newProgressBar({
        x: 10,
        y: 10,
        width: 200,
        height: 25,
        min: 0,
        max: 100,
        value: 100,
        showText: true,
        style: {
            fillColor: [200, 50, 50],
            borderWidth: 3
        }
    });

    // Barra de mana
    manaBar = ui.newProgressBar({
        x: 10,
        y: 45,
        width: 200,
        height: 20,
        min: 0,
        max: 100,
        value: 100,
        showText: false,
        style: {
            fillColor: [50, 100, 255]
        }
    });

    // Score
    scoreLabel = ui.newLabel({
        x: 10,
        y: 75,
        text: 'Score: 0',
        style: {
            color: [255, 255, 100],
            fontSize: 18
        }
    });
}

// Durante o jogo
function updateHUD(health, mana, score) {
    healthBar.setValue(health);
    manaBar.setValue(mana);
    scoreLabel.setText(`Score: ${score}`);
}
```

## 🖼️ Usando Imagens Customizadas

```javascript
// Carrega imagens
const btnNormal = new Image();
btnNormal.src = './assets/button_normal.png';

const btnHover = new Image();
btnHover.src = './assets/button_hover.png';

const btnActive = new Image();
btnActive.src = './assets/button_active.png';

// Cria botão com imagens
ui.newButton({
    x: 100,
    y: 100,
    width: 200,
    height: 60,
    text: 'Jogar',
    image: btnNormal,
    imageHover: btnHover,
    imageActive: btnActive,
    onClick: () => {
        scene.transitionTo('game');
    },
    style: {
        textColor: [255, 255, 255],
        fontSize: 24
    }
});
```

## 🎨 Controle Manual de Componentes

```javascript
// Criar sem adicionar automaticamente
const myButton = new ui.Button({
    x: 100,
    y: 100,
    width: 200,
    height: 50,
    text: 'Custom'
});

// Adicionar manualmente
ui.add(myButton);

// Remover
ui.remove(myButton);

// Limpar todos
ui.clear();

// Mostrar/ocultar
myButton.visible = false;

// Habilitar/desabilitar
myButton.enabled = false;

// Desenhar manualmente
myButton.draw();
```

## 📋 Propriedades Comuns

Todos os componentes têm:
- `x`, `y` - Posição
- `width`, `height` - Tamanho
- `visible` - Visível (true/false)
- `enabled` - Habilitado (true/false)
- `hovered` - Mouse sobre o componente
- `active` - Componente ativo/pressionado
- `id` - ID único gerado automaticamente

## 🎯 Casos de Uso

✅ Menus principais  
✅ Configurações  
✅ Pause screen  
✅ HUD (vida, mana, score)  
✅ Diálogos  
✅ Inventário  
✅ Lojas  
✅ Loading screens  
✅ Game Over screen  

## ⚡ Performance

- **Leve**: ~600 linhas, 0 dependências
- **Eficiente**: Apenas componentes visíveis são processados
- **Escalável**: Suporta centenas de componentes simultâneos
- **Responsivo**: Hover e click detection otimizados

---

**Dica**: Combine com o módulo `scene` para ter UI diferente em cada cena!
