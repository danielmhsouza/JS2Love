/**
 * Sistema de UI - Botões, Checkboxes, Sliders, etc
 * Suporta assets customizados ou renderização padrão com estilos
 * Uso simples inspirado no Love2D - PLUG AND PLAY
 */

export const ui = (function () {
    let components = [];
    let hoveredComponent = null;
    let activeComponent = null;
    let focusedComponent = null;

    /**
     * Classe base para componentes UI
     */
    class UIComponent {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.visible = true;
            this.enabled = true;
            this.hovered = false;
            this.active = false;
            this.id = Math.random().toString(36).substr(2, 9);
        }

        containsPoint(x, y) {
            return x >= this.x && x <= this.x + this.width &&
                   y >= this.y && y <= this.y + this.height;
        }

        update(dt) {}
        draw() {}
        onClick() {}
        onHover() {}
        onLeave() {}
    }

    /**
     * Botão
     */
    class Button extends UIComponent {
        constructor({
            x, y, width, height,
            text = 'Button',
            image = null,
            imageHover = null,
            imageActive = null,
            onClick = null,
            style = {}
        }) {
            super(x, y, width, height);
            this.text = text;
            this.image = image;
            this.imageHover = imageHover;
            this.imageActive = imageActive;
            this.onClickCallback = onClick;
            
            // Estilo padrão
            this.style = {
                backgroundColor: style.backgroundColor || [100, 100, 100],
                backgroundColorHover: style.backgroundColorHover || [130, 130, 130],
                backgroundColorActive: style.backgroundColorActive || [80, 80, 80],
                backgroundColorDisabled: style.backgroundColorDisabled || [60, 60, 60],
                textColor: style.textColor || [255, 255, 255],
                textColorDisabled: style.textColorDisabled || [150, 150, 150],
                borderColor: style.borderColor || [200, 200, 200],
                borderWidth: style.borderWidth || 2,
                borderRadius: style.borderRadius || 5,
                fontSize: style.fontSize || 16,
                padding: style.padding || 10
            };
        }

        draw() {
            if (!this.visible) return;

            const ctx = window.engine.ctx;
            
            // Escolhe a imagem baseada no estado
            let currentImage = this.image;
            if (!this.enabled) {
                currentImage = this.image;
            } else if (this.active && this.imageActive) {
                currentImage = this.imageActive;
            } else if (this.hovered && this.imageHover) {
                currentImage = this.imageHover;
            }

            // Desenha imagem ou fundo padrão
            if (currentImage) {
                love.graphics.setColor(255, 255, 255);
                love.graphics.drawImage(currentImage, this.x, this.y, this.width, this.height);
            } else {
                // Fundo
                let bgColor = this.style.backgroundColor;
                if (!this.enabled) {
                    bgColor = this.style.backgroundColorDisabled;
                } else if (this.active) {
                    bgColor = this.style.backgroundColorActive;
                } else if (this.hovered) {
                    bgColor = this.style.backgroundColorHover;
                }

                love.graphics.setColor(...bgColor);
                this.drawRoundedRect(this.x, this.y, this.width, this.height, this.style.borderRadius);

                // Borda
                love.graphics.setColor(...this.style.borderColor);
                ctx.lineWidth = this.style.borderWidth;
                this.drawRoundedRectStroke(this.x, this.y, this.width, this.height, this.style.borderRadius);
            }

            // Texto
            const textColor = this.enabled ? this.style.textColor : this.style.textColorDisabled;
            love.graphics.setColor(...textColor);
            
            // Centraliza o texto (horizontal e vertical)
            ctx.font = `${this.style.fontSize}px Arial`;
            const textWidth = ctx.measureText(this.text).width;
            const textX = this.x + (this.width - textWidth) / 2;
            const textY = this.y + this.height / 2;
            
            // Usa textBaseline middle para centralização vertical perfeita
            ctx.textBaseline = 'middle';
            love.graphics.print(this.text, textX, textY);
            ctx.textBaseline = 'alphabetic'; // Restaura padrão
        }

        drawRoundedRect(x, y, w, h, r) {
            const ctx = window.engine.ctx;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.arcTo(x + w, y, x + w, y + r, r);
            ctx.lineTo(x + w, y + h - r);
            ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
            ctx.lineTo(x + r, y + h);
            ctx.arcTo(x, y + h, x, y + h - r, r);
            ctx.lineTo(x, y + r);
            ctx.arcTo(x, y, x + r, y, r);
            ctx.closePath();
            ctx.fill();
        }

        drawRoundedRectStroke(x, y, w, h, r) {
            const ctx = window.engine.ctx;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.arcTo(x + w, y, x + w, y + r, r);
            ctx.lineTo(x + w, y + h - r);
            ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
            ctx.lineTo(x + r, y + h);
            ctx.arcTo(x, y + h, x, y + h - r, r);
            ctx.lineTo(x, y + r);
            ctx.arcTo(x, y, x + r, y, r);
            ctx.closePath();
            ctx.stroke();
        }

        onClick() {
            if (this.enabled && this.onClickCallback) {
                this.onClickCallback(this);
            }
        }
    }

    /**
     * Checkbox
     */
    class Checkbox extends UIComponent {
        constructor({
            x, y, size = 20,
            label = '',
            checked = false,
            onChange = null,
            style = {}
        }) {
            super(x, y, size, size);
            this.label = label;
            this.checked = checked;
            this.onChangeCallback = onChange;
            
            this.style = {
                backgroundColor: style.backgroundColor || [200, 200, 200],
                checkColor: style.checkColor || [50, 200, 50],
                borderColor: style.borderColor || [100, 100, 100],
                borderWidth: style.borderWidth || 2,
                labelColor: style.labelColor || [255, 255, 255],
                labelOffset: style.labelOffset || 10
            };
        }

        draw() {
            if (!this.visible) return;

            const ctx = window.engine.ctx;

            // Fundo do checkbox
            love.graphics.setColor(...this.style.backgroundColor);
            love.graphics.rectangle('fill', this.x, this.y, this.width, this.height);

            // Borda
            love.graphics.setColor(...this.style.borderColor);
            ctx.lineWidth = this.style.borderWidth;
            love.graphics.rectangle('line', this.x, this.y, this.width, this.height);

            // Check mark
            if (this.checked) {
                love.graphics.setColor(...this.style.checkColor);
                const padding = 4;
                love.graphics.rectangle('fill', 
                    this.x + padding, 
                    this.y + padding, 
                    this.width - padding * 2, 
                    this.height - padding * 2
                );
            }

            // Label (alinhado verticalmente com o checkbox)
            if (this.label) {
                love.graphics.setColor(...this.style.labelColor);
                const labelY = this.y + this.height / 2;
                ctx.textBaseline = 'middle';
                love.graphics.print(this.label, this.x + this.width + this.style.labelOffset, labelY);
                ctx.textBaseline = 'alphabetic';
            }
        }

        onClick() {
            if (this.enabled) {
                this.checked = !this.checked;
                if (this.onChangeCallback) {
                    this.onChangeCallback(this.checked, this);
                }
            }
        }
    }

    /**
     * Slider
     */
    class Slider extends UIComponent {
        constructor({
            x, y, width, height = 20,
            min = 0, max = 100, value = 50,
            onChange = null,
            style = {}
        }) {
            super(x, y, width, height);
            this.min = min;
            this.max = max;
            this.value = value;
            this.onChangeCallback = onChange;
            this.dragging = false;
            
            this.style = {
                trackColor: style.trackColor || [80, 80, 80],
                fillColor: style.fillColor || [100, 200, 100],
                handleColor: style.handleColor || [255, 255, 255],
                handleColorHover: style.handleColorHover || [200, 200, 200],
                handleSize: style.handleSize || 16,
                borderColor: style.borderColor || [150, 150, 150],
                borderWidth: style.borderWidth || 1
            };
        }

        draw() {
            if (!this.visible) return;

            const ctx = window.engine.ctx;

            // Track (trilha)
            love.graphics.setColor(...this.style.trackColor);
            love.graphics.rectangle('fill', this.x, this.y, this.width, this.height);

            // Fill (preenchimento até o valor atual)
            const fillWidth = ((this.value - this.min) / (this.max - this.min)) * this.width;
            love.graphics.setColor(...this.style.fillColor);
            love.graphics.rectangle('fill', this.x, this.y, fillWidth, this.height);

            // Borda
            love.graphics.setColor(...this.style.borderColor);
            ctx.lineWidth = this.style.borderWidth;
            love.graphics.rectangle('line', this.x, this.y, this.width, this.height);

            // Handle (alça)
            const handleX = this.x + fillWidth - this.style.handleSize / 2;
            const handleY = this.y + this.height / 2 - this.style.handleSize / 2;
            
            const handleColor = this.hovered || this.dragging ? 
                this.style.handleColorHover : this.style.handleColor;
            
            love.graphics.setColor(...handleColor);
            love.graphics.circle('fill', handleX + this.style.handleSize / 2, handleY + this.style.handleSize / 2, this.style.handleSize / 2);
        }

        updateValue(mouseX) {
            const relativeX = Math.max(0, Math.min(this.width, mouseX - this.x));
            const percent = relativeX / this.width;
            this.value = this.min + percent * (this.max - this.min);
            
            if (this.onChangeCallback) {
                this.onChangeCallback(this.value, this);
            }
        }

        onClick() {
            if (this.enabled) {
                this.dragging = true;
            }
        }
    }

    /**
     * Text Label
     */
    class Label extends UIComponent {
        constructor({
            x, y,
            text = 'Label',
            style = {}
        }) {
            super(x, y, 0, 0);
            this.text = text;
            this.enabled = false; // Labels não são clicáveis por padrão
            
            this.style = {
                color: style.color || [255, 255, 255],
                fontSize: style.fontSize || 16,
                align: style.align || 'left'
            };
        }

        draw() {
            if (!this.visible) return;
            
            love.graphics.setColor(...this.style.color);
            love.graphics.print(this.text, this.x, this.y);
        }

        setText(text) {
            this.text = text;
        }
    }

    /**
     * Panel/Container
     */
    class Panel extends UIComponent {
        constructor({
            x, y, width, height,
            style = {}
        }) {
            super(x, y, width, height);
            this.enabled = false; // Paineis não capturam eventos por padrão
            
            this.style = {
                backgroundColor: style.backgroundColor || [40, 40, 40, 200],
                borderColor: style.borderColor || [100, 100, 100],
                borderWidth: style.borderWidth || 2,
                borderRadius: style.borderRadius || 10
            };
        }

        draw() {
            if (!this.visible) return;

            const ctx = window.engine.ctx;

            // Fundo
            love.graphics.setColor(...this.style.backgroundColor);
            this.drawRoundedRect(this.x, this.y, this.width, this.height, this.style.borderRadius);

            // Borda
            love.graphics.setColor(...this.style.borderColor);
            ctx.lineWidth = this.style.borderWidth;
            this.drawRoundedRectStroke(this.x, this.y, this.width, this.height, this.style.borderRadius);
        }

        drawRoundedRect(x, y, w, h, r) {
            const ctx = window.engine.ctx;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.arcTo(x + w, y, x + w, y + r, r);
            ctx.lineTo(x + w, y + h - r);
            ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
            ctx.lineTo(x + r, y + h);
            ctx.arcTo(x, y + h, x, y + h - r, r);
            ctx.lineTo(x, y + r);
            ctx.arcTo(x, y, x + r, y, r);
            ctx.closePath();
            ctx.fill();
        }

        drawRoundedRectStroke(x, y, w, h, r) {
            const ctx = window.engine.ctx;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.arcTo(x + w, y, x + w, y + r, r);
            ctx.lineTo(x + w, y + h - r);
            ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
            ctx.lineTo(x + r, y + h);
            ctx.arcTo(x, y + h, x, y + h - r, r);
            ctx.lineTo(x, y + r);
            ctx.arcTo(x, y, x + r, y, r);
            ctx.closePath();
            ctx.stroke();
        }
    }

    /**
     * Progress Bar
     */
    class ProgressBar extends UIComponent {
        constructor({
            x, y, width, height = 20,
            min = 0, max = 100, value = 0,
            showText = true,
            style = {}
        }) {
            super(x, y, width, height);
            this.min = min;
            this.max = max;
            this.value = value;
            this.showText = showText;
            this.enabled = false; // Progress bars não capturam eventos por padrão
            
            this.style = {
                backgroundColor: style.backgroundColor || [60, 60, 60],
                fillColor: style.fillColor || [50, 200, 50],
                borderColor: style.borderColor || [100, 100, 100],
                borderWidth: style.borderWidth || 2,
                textColor: style.textColor || [255, 255, 255]
            };
        }

        draw() {
            if (!this.visible) return;

            const ctx = window.engine.ctx;

            // Fundo
            love.graphics.setColor(...this.style.backgroundColor);
            love.graphics.rectangle('fill', this.x, this.y, this.width, this.height);

            // Preenchimento
            const fillWidth = ((this.value - this.min) / (this.max - this.min)) * this.width;
            love.graphics.setColor(...this.style.fillColor);
            love.graphics.rectangle('fill', this.x, this.y, fillWidth, this.height);

            // Borda
            love.graphics.setColor(...this.style.borderColor);
            ctx.lineWidth = this.style.borderWidth;
            love.graphics.rectangle('line', this.x, this.y, this.width, this.height);

            // Texto
            if (this.showText) {
                const percent = Math.round(((this.value - this.min) / (this.max - this.min)) * 100);
                const text = `${percent}%`;
                const textWidth = ctx.measureText(text).width;
                const textX = this.x + (this.width - textWidth) / 2;
                const textY = this.y + (this.height - 12) / 2;
                
                love.graphics.setColor(...this.style.textColor);
                love.graphics.print(text, textX, textY);
            }
        }

        setValue(value) {
            this.value = Math.max(this.min, Math.min(this.max, value));
        }
    }

    /**
     * Adiciona um componente
     */
    function add(component) {
        components.push(component);
        return component;
    }

    /**
     * Remove um componente
     */
    function remove(component) {
        const index = components.indexOf(component);
        if (index > -1) {
            components.splice(index, 1);
        }
    }

    /**
     * Remove todos os componentes
     */
    function clear() {
        components = [];
        hoveredComponent = null;
        activeComponent = null;
        focusedComponent = null;
    }

    /**
     * Atualiza todos os componentes
     */
    function update(dt) {
        for (const comp of components) {
            if (comp.visible && comp.enabled) {
                comp.update(dt);
            }
        }
    }

    /**
     * Desenha todos os componentes
     */
    function draw() {
        for (const comp of components) {
            comp.draw();
        }
    }

    /**
     * Processa movimento do mouse
     */
    function mousemoved(x, y) {
        // Atualiza slider se estiver arrastando (prioridade máxima)
        if (activeComponent && activeComponent instanceof Slider && activeComponent.dragging) {
            activeComponent.updateValue(x);
        }

        // Processa hover em ordem reversa
        let foundHover = false;
        for (let i = components.length - 1; i >= 0; i--) {
            const comp = components[i];
            if (!comp.visible || !comp.enabled) continue;

            const wasHovered = comp.hovered;
            const shouldHover = !foundHover && comp.containsPoint(x, y);
            comp.hovered = shouldHover;

            if (comp.hovered && !wasHovered) {
                hoveredComponent = comp;
                if (comp.onHover) comp.onHover();
                foundHover = true; // Apenas o componente de cima fica hovered
            } else if (!comp.hovered && wasHovered) {
                if (comp.onLeave) comp.onLeave();
                if (hoveredComponent === comp) hoveredComponent = null;
            }
        }
    }

    /**
     * Processa clique do mouse
     */
    function mousepressed(x, y, button) {
        if (button !== 1) return; // Apenas botão esquerdo

        // Processa componentes em ordem reversa (componentes adicionados por último têm prioridade)
        for (let i = components.length - 1; i >= 0; i--) {
            const comp = components[i];
            if (!comp.visible || !comp.enabled) continue;

            if (comp.containsPoint(x, y)) {
                comp.active = true;
                activeComponent = comp;
                comp.onClick();
                
                if (comp instanceof Slider) {
                    comp.updateValue(x);
                }
                
                return; // Para no primeiro componente clicado
            }
        }
    }

    /**
     * Processa soltar do mouse
     */
    function mousereleased(x, y, button) {
        if (button !== 1) return;

        if (activeComponent) {
            activeComponent.active = false;
            
            if (activeComponent instanceof Slider) {
                activeComponent.dragging = false;
            }
            
            activeComponent = null;
        }
    }

    /**
     * Cria um botão
     */
    function newButton(options) {
        const button = new Button(options);
        add(button);
        return button;
    }

    /**
     * Cria um checkbox
     */
    function newCheckbox(options) {
        const checkbox = new Checkbox(options);
        add(checkbox);
        return checkbox;
    }

    /**
     * Cria um slider
     */
    function newSlider(options) {
        const slider = new Slider(options);
        add(slider);
        return slider;
    }

    /**
     * Cria um label
     */
    function newLabel(options) {
        const label = new Label(options);
        add(label);
        return label;
    }

    /**
     * Cria um panel
     */
    function newPanel(options) {
        const panel = new Panel(options);
        add(panel);
        return panel;
    }

    /**
     * Cria uma progress bar
     */
    function newProgressBar(options) {
        const progressBar = new ProgressBar(options);
        add(progressBar);
        return progressBar;
    }

    return {
        add,
        remove,
        clear,
        update,
        draw,
        mousemoved,
        mousepressed,
        mousereleased,
        newButton,
        newCheckbox,
        newSlider,
        newLabel,
        newPanel,
        newProgressBar,
        // Exporta classes para uso avançado
        Button,
        Checkbox,
        Slider,
        Label,
        Panel,
        ProgressBar
    };
})();

// Exporta globalmente para uso sem import
if (typeof window !== 'undefined') {
    window.ui = ui;
}
