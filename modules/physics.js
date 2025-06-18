// physics.js — Módulo de física leve estilo Love2D com tipos e respostas de colisão

const physics = (function () {
    const bodies = [];
    /**
     * Cria um novo corpo físico.
     * @param {Object} options - Opções do corpo.
     * @param {number} options.x - Posição X do corpo.
     * @param {number} options.y - Posição Y do corpo.
     * @param {number} options.width - Largura do corpo.
     * @param {number} options.height - Altura do corpo.
     * @param {number} options.radius - Raio do corpo (para círculos).
     * @param {string} options.shape - Forma do corpo ('rectangle', 'circle', 'ellipse', 'polygon').
     * @param {string} options.type - Tipo de corpo ('static', 'dynamic', 'pushable', 'sensor').
     * @param {boolean} options.gravity - Se o corpo deve ser afetado pela gravidade.
     * @param {number} options.friction - Fator de atrito do corpo.
     * @param {number} options.pushFactor - Fator de empurrão para corpos pushable.
     * @param {Array} options.vertices - Vértices para polígonos.
     */
    function newBody({
        x = 0,
        y = 0,
        width = 0,
        height = 0,
        radius = 0,
        shape = 'rectangle',
        type = 'dynamic', // 'static', 'dynamic', 'pushable', 'sensor'
        gravity = true,
        friction = 0.95,
        pushFactor = 0.3,
        vertices = null,
    }) {
        const body = {
            x,
            y,
            vx: 0,
            vy: 0,
            width,
            height,
            radius,
            shape,
            type,
            gravity,
            friction,
            pushFactor,
            grounded: false,
            vertices,
        };
        bodies.push(body);
        return body;
    }

    function update(dt, gravityForce = 600) {
        for (const body of bodies) {
            if (body.type === 'static') continue;

            // Aplicar gravidade
            if (body.gravity) {
                body.vy += gravityForce * dt;
            }

            // Aplicar atrito para dynamic e pushable
            if (body.type === 'dynamic' || body.type === 'pushable') {
                body.vx *= body.friction;
                body.vy *= body.friction;

                // Parar completamente se a velocidade for muito baixa
                if (Math.abs(body.vx) < 10) body.vx = 0;
                if (Math.abs(body.vy) < 10) body.vy = 0;
            }

            body.x += body.vx * dt;
            body.y += body.vy * dt;
        }
    }

    function setGravity(body, enabled) {
        body.gravity = enabled;
    }

    function checkCollision(a, b) {
        const shapes = [a.shape, b.shape].sort().join('-');

        switch (shapes) {
            case 'circle-circle':
                return circleCircleCollision(a, b);
            case 'rectangle-rectangle':
                return rectRectCollision(a, b);
            case 'ellipse-ellipse':
                return ellipseEllipseCollision(a, b);
            case 'polygon-polygon':
                return polygonPolygonCollision(a, b);
            default:
                return false;
        }
    }
    /**
     * @param {Object} a - Primeiro corpo.
     * @param {Object} b - Segundo corpo.
     * @description Lida com a resposta de colisão entre dois corpos.
     * Se um corpo é sensor, não há resposta. Se um corpo é dinâmico e o outro é estático, para o corpo dinâmico.
     * Se um corpo é dinâmico e o outro é empurrável, transfere a velocidade do corpo dinâmico para o empurrável.
     * Se um corpo empurrável colide com um corpo estático, para o corpo empurrável.
     * Se ambos os corpos são dinâmicos, aplica a resposta de colisão padrão.
     * Se ambos os corpos são estáticos, não há resposta.
     * Se ambos os corpos são sensores, não há resposta.
     * Se ambos os corpos são empurráveis, transfere a velocidade do primeiro para o segundo.
     * Se um corpo é sensor, não há resposta.
     * Se um corpo é dinâmico e o outro é estático, para o corpo dinâmico.
     * **/
    function handleCollisionResponse(a, b) {
        if (a.type === 'sensor' || b.type === 'sensor') return;

        if (a.type === 'dynamic' && b.type === 'static') {
            stopBodyOnCollision(a, b);
        }

        if (a.type === 'dynamic' && b.type === 'pushable') {
            pushBody(a, b);
        }

        if (a.type === 'pushable' && b.type === 'static') {
            stopBodyOnCollision(a, b);
        }
    }

    function stopBodyOnCollision(moving, solid) {
        if (moving.y + moving.height > solid.y && moving.vy > 0) {
            moving.y = solid.y - moving.height;
            moving.vy = 0;
            moving.grounded = true;
        }
    }

    function pushBody(pusher, pushed) {

        // Transfere a velocidade horizontal do empurrador para o empurrado
        pushed.vx += pusher.vx * pushed.pushFactor;

        // Adiciona a transferência da velocidade vertical também
        pushed.vy += pusher.vy * pushed.pushFactor; // <-- Adicione esta linha!

        // O atrito (desaceleração) será aplicado na função update,
        // garantindo que o objeto pare eventualmente.
    }


    // --- Colisões básicas ---
    function rectRectCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    function circleCircleCollision(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        return distance < a.radius + b.radius;
    }

    function ellipseEllipseCollision(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        const aRadiusX = a.width / 2;
        const aRadiusY = a.height / 2;
        const bRadiusX = b.width / 2;
        const bRadiusY = b.height / 2;

        const distance = Math.hypot(dx, dy);
        const avgA = (aRadiusX + aRadiusY) / 2;
        const avgB = (bRadiusX + bRadiusY) / 2;

        return distance < avgA + avgB;
    }

    function polygonPolygonCollision(a, b) {
        const polyA = a.vertices;
        const polyB = b.vertices;
        if (!polyA || !polyB) return false;

        const axes = getAxes(polyA).concat(getAxes(polyB));

        for (const axis of axes) {
            const [minA, maxA] = projectPolygon(polyA, axis);
            const [minB, maxB] = projectPolygon(polyB, axis);
            if (maxA < minB || maxB < minA) {
                return false;
            }
        }

        return true;
    }

    function getAxes(vertices) {
        const axes = [];
        for (let i = 0; i < vertices.length; i++) {
            const p1 = vertices[i];
            const p2 = vertices[(i + 1) % vertices.length];
            const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
            const normal = { x: -edge.y, y: edge.x };
            const length = Math.hypot(normal.x, normal.y);
            axes.push({ x: normal.x / length, y: normal.y / length });
        }
        return axes;
    }

    function projectPolygon(vertices, axis) {
        let min = Infinity;
        let max = -Infinity;
        for (const v of vertices) {
            const projection = v.x * axis.x + v.y * axis.y;
            min = Math.min(min, projection);
            max = Math.max(max, projection);
        }
        return [min, max];
    }

    return {
        newBody,
        update,
        checkCollision,
        setGravity,
        handleCollisionResponse
    };
})();