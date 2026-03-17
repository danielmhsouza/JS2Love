// lightShadow.js – módulo avançado de luz com ray‑casting e sombras
// Depende do seu physics.js (precisa expor getShadowObstacles())

import { physics } from "./physics.js";

export const dynamicLight = (function () {
    const lights = [];

    /**
     * Cria uma nova luz que projeta sombras com ray‑casting.
     * @param {Object} cfg
     * @param {number} cfg.x
     * @param {number} cfg.y
     * @param {number} [cfg.radius=150]
     * @param {{r:number,g:number,b:number,a:number}} [cfg.color]
     * @param {boolean} [cfg.flicker=false]
     * @param {number} [cfg.flickerStrength=0.05] – faixa ±% do raio base
     * @param {number} [cfg.resolution=180] – quantos raios (360 => 1 grau)
     */
    function newLight({
        x,
        y,
        radius = 150,
        color = { r: 255, g: 255, b: 255, a: 0.35 },
        flicker = false,
        flickerStrength = 0.05,
        resolution = 180,
        showRays = false
    }) {
        const l = {
            x,
            y,
            baseRadius: radius,
            radius,
            color,
            flicker,
            flickerStrength,
            resolution,
            showRays,
            enabled: true
        };
        lights.push(l);
        return l;
    }

    function update(dt) {
        for (const l of lights) {
            if (!l.enabled) continue;
            
            if (l.flicker) {
                const varr = (Math.random() * 2 - 1) * l.flickerStrength * l.baseRadius;
                l.radius = l.baseRadius + varr;
            } else {
                l.radius = l.baseRadius;
            }
        }
    }

    /**
     * Desenha as luzes com sombras. Pode receber um ou dois contextos:
     * - Se receber 1 contexto: desenha só nele (comportamento antigo)
     * - Se receber shadowCtx e colorCtx: desenha em ambos (novo sistema)
     */
    function draw(shadowCtx, colorCtx) {
        const obstacles = physics.getShadowObstacles?.() || [];
        
        // Compatibilidade: se passar só 1 argumento, usa o antigo comportamento
        if (!colorCtx && shadowCtx) {
            drawSingleContext(shadowCtx, obstacles);
            return;
        }
        
        // Novo sistema: desenha em ambos os canvas
        for (const l of lights) {
            if (!l.enabled) continue;

            const rays = buildRayPolygon(l, obstacles);
            if (rays.length < 3) continue;

            const flatRays = rays.flatMap(p => [p.x, p.y]);
            if (flatRays.length < 6) continue;

            // CAMADA 1: Máscara de sombra (branco = remove escuridão)
            if (shadowCtx) {
                shadowCtx.fillStyle = `rgba(255, 255, 255, 1)`;
                shadowCtx.beginPath();
                shadowCtx.moveTo(flatRays[0], flatRays[1]);
                for (let i = 2; i < flatRays.length; i += 2) {
                    shadowCtx.lineTo(flatRays[i], flatRays[i + 1]);
                }
                shadowCtx.closePath();
                shadowCtx.fill();
            }

            // CAMADA 2: Cor da luz (adiciona cor)
            if (colorCtx) {
                colorCtx.fillStyle = `rgba(${l.color.r}, ${l.color.g}, ${l.color.b}, ${l.color.a})`;
                colorCtx.beginPath();
                colorCtx.moveTo(flatRays[0], flatRays[1]);
                for (let i = 2; i < flatRays.length; i += 2) {
                    colorCtx.lineTo(flatRays[i], flatRays[i + 1]);
                }
                colorCtx.closePath();
                colorCtx.fill();
            }

            // opcional: linhas dos raios p/ debug
            if (l.showRays && colorCtx) {
                colorCtx.strokeStyle = `rgba(${l.color.r}, ${l.color.g}, ${l.color.b}, 0.47)`;
                colorCtx.lineWidth = 1;
                for (const p of rays) {
                    colorCtx.beginPath();
                    colorCtx.moveTo(l.x, l.y);
                    colorCtx.lineTo(p.x, p.y);
                    colorCtx.stroke();
                }
            }
        }
    }

    // Método auxiliar para compatibilidade com código antigo
    function drawSingleContext(targetCtx, obstacles) {
        for (const l of lights) {
            if (!l.enabled) continue;

            const rays = buildRayPolygon(l, obstacles);
            if (rays.length < 3) continue;

            const flatRays = rays.flatMap(p => [p.x, p.y]);
            if (flatRays.length >= 6) {
                targetCtx.fillStyle = `rgba(${l.color.r}, ${l.color.g}, ${l.color.b}, ${l.color.a})`;
                targetCtx.beginPath();
                targetCtx.moveTo(flatRays[0], flatRays[1]);
                for (let i = 2; i < flatRays.length; i += 2) {
                    targetCtx.lineTo(flatRays[i], flatRays[i + 1]);
                }
                targetCtx.closePath();
                targetCtx.fill();
            }

            if (l.showRays) {
                targetCtx.strokeStyle = `rgba(${l.color.r}, ${l.color.g}, ${l.color.b}, 0.47)`;
                targetCtx.lineWidth = 1;
                for (const p of rays) {
                    targetCtx.beginPath();
                    targetCtx.moveTo(l.x, l.y);
                    targetCtx.lineTo(p.x, p.y);
                    targetCtx.stroke();
                }
            }
        }
    }

    /** Gera vértices do polígono de luz considerando retângulos e círculos */
    function buildRayPolygon(light, obstacles) {
        const { x, y, radius, resolution } = light;
        const pts = [];

        for (let i = 0; i < resolution; i++) {
            const ang = (i / resolution) * 2 * Math.PI;
            const dx = Math.cos(ang);
            const dy = Math.sin(ang);
            let minDist = radius;
            let hit = null;

            for (const o of obstacles) {
                if (o.shape === "polygon") {
                    const verts = o.vertices;
                    for (let j = 0; j < verts.length; j++) {
                        const a = verts[j];
                        const b = verts[(j + 1) % verts.length];
                        const p = raySegmentIntersection(x, y, dx, dy, a, b);
                        if (p) {
                            const d = Math.hypot(p.x - x, p.y - y);
                            if (d < minDist) {
                                minDist = d;
                                hit = p;
                            }
                        }
                    }
                } else if (o.shape === "circle") {
                    const p = rayCircleIntersection(x, y, dx, dy, o);
                    if (p) {
                        const d = Math.hypot(p.x - x, p.y - y);
                        if (d < minDist) {
                            minDist = d;
                            hit = p;
                        }
                    }
                }
            }

            pts.push(hit || { x: x + dx * radius, y: y + dy * radius });
        }
        return pts;
    }

    // interseção raio‑segmento
    function raySegmentIntersection(rx, ry, dx, dy, p1, p2) {
        const r_px = rx,
            r_py = ry;
        const r_dx = dx,
            r_dy = dy;
        const s_px = p1.x,
            s_py = p1.y;
        const s_dx = p2.x - p1.x,
            s_dy = p2.y - p1.y;
        const denom = s_dx * r_dy - s_dy * r_dx;
        if (Math.abs(denom) < 0.0001) return null; // paralelos ou quase
        const T2 = (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / denom;
        const T1 = Math.abs(r_dx) > 0.0001 
            ? (s_px + s_dx * T2 - r_px) / r_dx 
            : (s_py + s_dy * T2 - r_py) / r_dy;
        if (T1 < 0 || T2 < 0 || T2 > 1) return null;
        return { x: r_px + r_dx * T1, y: r_py + r_dy * T1 };
    }

    // interseção raio‑círculo
    function rayCircleIntersection(rx, ry, dx, dy, { cx, cy, r }) {
        const ox = cx - rx;
        const oy = cy - ry;
        const tProj = ox * dx + oy * dy; // projeção
        const dSq = ox * ox + oy * oy - tProj * tProj;
        const rSq = r * r;
        if (dSq > rSq) return null; // raio passa fora
        const thc = Math.sqrt(rSq - dSq);
        const tHit = tProj - thc; // primeiro ponto de contato
        if (tHit < 0) return null; // atrás da origem
        return { x: rx + dx * tHit, y: ry + dy * tHit };
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