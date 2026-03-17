
export const light = (function () {
    const lights = [];

    function newLight({
        x,
        y,
        radius = 100,
        color = { r: 255, g: 255, b: 255, a: 0.3 },
        flicker = false,
        flickerStrength = 0.05,
    }) {
        const light = {
            x,
            y,
            baseRadius: radius,   // <-- raio fixo de referência
            radius,               // radius será recalculado a cada quadro
            color,
            flicker,
            flickerStrength,
            enabled: true
        };
        lights.push(light);
        return light;
    }

    function update(dt) {
        for (const light of lights) {
            if (!light.enabled) continue;
            
            if (light.flicker) {
                // variação ±strength % do raio base
                const variation =
                    (Math.random() * 2 - 1) * light.flickerStrength * light.baseRadius;
                light.radius = light.baseRadius + variation;
            } else {
                light.radius = light.baseRadius;
            }
        }
    }

    /**
     * Desenha as luzes. Pode receber um ou dois contextos:
     * - Se receber 1 contexto: desenha só nele (comportamento antigo)
     * - Se receber shadowCtx e colorCtx: desenha em ambos (novo sistema)
     */
    function draw(shadowCtx, colorCtx) {
        // Compatibilidade: se passar só 1 argumento, usa o antigo comportamento
        if (!colorCtx && shadowCtx) {
            drawSingleContext(shadowCtx);
            return;
        }
        
        // Novo sistema: desenha em ambos os canvas
        for (const light of lights) {
            if (!light.enabled) continue;

            // CAMADA 1: Máscara de sombra (branco = remove escuridão)
            if (shadowCtx) {
                const gradient = shadowCtx.createRadialGradient(
                    light.x, light.y, 0,
                    light.x, light.y, light.radius
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, 1)`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
                
                shadowCtx.fillStyle = gradient;
                shadowCtx.beginPath();
                shadowCtx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
                shadowCtx.fill();
            }

            // CAMADA 2: Cor da luz (adiciona cor)
            if (colorCtx) {
                const gradient = colorCtx.createRadialGradient(
                    light.x, light.y, 0,
                    light.x, light.y, light.radius
                );
                gradient.addColorStop(0, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, ${light.color.a})`);
                gradient.addColorStop(1, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, 0)`);
                
                colorCtx.fillStyle = gradient;
                colorCtx.beginPath();
                colorCtx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
                colorCtx.fill();
            }
        }
    }

    // Método auxiliar para compatibilidade com código antigo
    function drawSingleContext(targetCtx) {
        for (const light of lights) {
            if (!light.enabled) continue;

            const steps = 10;
            for (let i = steps; i >= 1; i--) {
                const alpha = light.color.a * (i / steps);
                
                const gradient = targetCtx.createRadialGradient(
                    light.x, light.y, 0,
                    light.x, light.y, light.radius * (i / steps)
                );
                gradient.addColorStop(0, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, ${alpha})`);
                gradient.addColorStop(1, `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, 0)`);
                
                targetCtx.fillStyle = gradient;
                targetCtx.beginPath();
                targetCtx.arc(light.x, light.y, light.radius * (i / steps), 0, Math.PI * 2);
                targetCtx.fill();
            }
        }
    }

    function removeLight(light) {
        const index = lights.indexOf(light);
        if (index > -1) {
            lights.splice(index, 1);
        }
    }

    function clear() {
        lights.length = 0;
    }

    return {
        newLight,
        update,
        draw,
        removeLight,
        clear,
        getLights: () => lights
    };
})();
