// lightShadow.js – módulo avançado de luz com ray‑casting e sombras
// Depende do seu physics.js (precisa expor getShadowObstacles())

import { physics } from "./physics.js";

export const lightShadow = (function () {
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
            showRays
        };
        lights.push(l);
        return l;
    }

    function update(dt) {
        for (const l of lights) {
            if (l.flicker) {
                const varr = (Math.random() * 2 - 1) * l.flickerStrength * l.baseRadius;
                l.radius = l.baseRadius + varr;
            } else {
                l.radius = l.baseRadius;
            }
        }
    }

    function draw() {
        const obstacles = physics.getShadowObstacles?.() || [];

        for (const l of lights) {
            const rays = buildRayPolygon(l, obstacles);

            // polígono iluminado
            love.graphics.setColor(l.color.r, l.color.g, l.color.b, l.color.a * 255);
            love.graphics.polygon("fill", rays.flatMap(p => [p.x, p.y]));

            // opcional: linhas dos raios p/ debug
            if (l.showRays) {
                love.graphics.setLineWidth(1);
                love.graphics.setColor(l.color.r, l.color.g, l.color.b, 120);
                for (const p of rays) love.graphics.line(l.x, l.y, p.x, p.y);
            }
        }
        love.graphics.setColor(255, 255, 255, 255);
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
        if (denom === 0) return null; // paralelos
        const T2 = (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / denom;
        const T1 = (s_px + s_dx * T2 - r_px) / r_dx;
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

    return { newLight, update, draw, getLights: () => lights };
})();