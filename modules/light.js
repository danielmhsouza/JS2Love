
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
            flickerStrength
        };
        lights.push(light);
        return light;
    }

    function update(dt) {
        for (const light of lights) {
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

    function draw() {
        for (const light of lights) {

            const steps = 10;
            for (let i = steps; i >= 1; i--) {
                const alpha = light.color.a * (i / steps);
                love.graphics.setColor(
                    light.color.r,
                    light.color.g,
                    light.color.b,
                    alpha * 255
                );
                love.graphics.circle(
                    "fill",
                    light.x,
                    light.y,
                    light.radius * (i / steps)
                );
            }
        }

        // Restaura cor
        love.graphics.setColor(255, 255, 255, 255);
    }


    return {
        newLight,
        update,
        draw,
        getLights: () => lights
    };
})();
