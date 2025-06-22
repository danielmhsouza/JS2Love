// physics.js — Módulo de física leve estilo Love2D com tipos e respostas de colisão

export const physics = (function () {
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

    // A função checkCollision retorna um objeto com informações da colisão
    // { collided: boolean, normal: {x,y}, penetration: number }
    function checkCollision(a, b) {
        const shapes = [a.shape, b.shape].sort().join('-');
        let result = { collided: false, normal: { x: 0, y: 0 }, penetration: 0 };

        switch (shapes) {
            case 'circle-circle':
                result = circleCircleCollision(a, b);
                break;
            case 'rectangle-rectangle':
                result = rectRectCollision(a, b);
                break;
            // Para colisões entre retângulos e círculos, precisamos de uma função dedicada.
            // Por enquanto, faremos uma verificação simples ou trataremos na resposta.
            case 'circle-rectangle':
                // Nota: O método sort() fará com que 'circle-rectangle' sempre seja 'circle-rectangle'.
                // Se a ordem for 'rectangle-circle', você terá que inverter a e b na função de colisão.
                result = circleRectCollision(a, b);
                break;
            default:
                // Se não houver uma função de colisão específica, retorne false.
                // Isso pode levar a objetos passando uns pelos outros.
                break;
        }
        return result;
    }

    function handleCollisionResponse(a, b) {
        const collisionResult = checkCollision(a, b); // Obtenha o resultado da colisão
        if (!collisionResult.collided || a.type === 'sensor' || b.type === 'sensor') return;

        const normal = collisionResult.normal;
        const penetration = collisionResult.penetration;

        // Resolução posicional: empurra os corpos para fora da colisão
        // Aplica apenas para corpos que não são estáticos
        if (a.type !== 'static' && b.type !== 'static') {
            // Se ambos são dinâmicos/empurráveis, divida a penetração
            a.x += normal.x * penetration * 0.5;
            a.y += normal.y * penetration * 0.5;
            b.x -= normal.x * penetration * 0.5;
            b.y -= normal.y * penetration * 0.5;
        } else if (a.type !== 'static') { // Se apenas 'a' não é estático
            a.x += normal.x * penetration;
            a.y += normal.y * penetration;
        } else if (b.type !== 'static') { // Se apenas 'b' não é estático
            b.x -= normal.x * penetration;
            b.y -= normal.y * penetration;
        }

        // Resolução de velocidade (simples)
        if (a.type === 'dynamic' && b.type === 'static') {
            // Se o objeto dinâmico está se movendo em direção ao estático, zere a velocidade na direção normal
            const dotProduct = a.vx * normal.x + a.vy * normal.y;
            if (dotProduct > 0) { // Se o vetor de velocidade está na mesma direção do vetor normal (se aproximando)
                a.vx -= dotProduct * normal.x;
                a.vy -= dotProduct * normal.y;
            }
            // Verifica se está no chão
            if (Math.abs(normal.y - (-1)) < 0.1) { // Se a normal aponta para cima (colisão com o chão)
                a.grounded = true;
            } else {
                a.grounded = false; // Não está no chão se colidiu lateralmente ou com o teto
            }
        } else if (a.type === 'dynamic' && b.type === 'pushable') {
            pushBody(a, b);
        } else if (a.type === 'pushable' && b.type === 'static') {
            const dotProduct = a.vx * normal.x + a.vy * normal.y;
            if (dotProduct > 0) { // Se o vetor de velocidade está na mesma direção do vetor normal (se aproximando)
                a.vx -= dotProduct * normal.x;
                a.vy -= dotProduct * normal.y;
            }
            // Verifica se está no chão
            if (Math.abs(normal.y - (-1)) < 0.1) { // Se a normal aponta para cima (colisão com o chão)
                a.grounded = true;
            } else {
                a.grounded = false;
            }
        } else if (a.type === 'dynamic' && b.type === 'dynamic') {
            // Resolução de colisão entre dois corpos dinâmicos (complexo, envolve conservação de momento)
            // Por enquanto, uma repulsão simples:
            const totalVX = a.vx - b.vx;
            const totalVY = a.vy - b.vy;
            const impulse = (totalVX * normal.x + totalVY * normal.y); // Impulso na direção normal

            if (impulse > 0) { // Se estão se aproximando
                a.vx -= impulse * normal.x;
                a.vy -= impulse * normal.y;
                b.vx += impulse * normal.x;
                b.vy += impulse * normal.y;
            }
        }
        // ... mais casos para outras interações pushable-dynamic, pushable-pushable, etc.
    }

    // A função original stopBodyOnCollision não será mais usada diretamente,
    // pois a lógica de resolução de colisão agora está em handleCollisionResponse
    // function stopBodyOnCollision(moving, solid) {
    //     // ... lógica antiga ...
    // }

    function pushBody(pusher, pushed) {
        // Transfere a velocidade horizontal do empurrador para o empurrado
        pushed.vx += pusher.vx * pushed.pushFactor;
        // Adiciona a transferência da velocidade vertical também
        pushed.vy += pusher.vy * pushed.pushFactor;
    }


    // --- Colisões básicas (retornam {collided, normal, penetration}) ---

    function rectRectCollision(a, b) {
        // Calcula a sobreposição em X e Y
        const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);

        if (overlapX > 0 && overlapY > 0) {
            let normal = { x: 0, y: 0 };
            let penetration = 0;

            if (overlapX < overlapY) { // Menor sobreposição em X
                penetration = overlapX;
                if (a.x < b.x) normal.x = -1; // Colisão da direita do A com a esquerda do B
                else normal.x = 1; // Colisão da esquerda do A com a direita do B
            } else { // Menor sobreposição em Y
                penetration = overlapY;
                if (a.y < b.y) normal.y = -1; // Colisão da parte inferior do A com a superior do B
                else normal.y = 1; // Colisão da parte superior do A com a inferior do B
            }
            return { collided: true, normal, penetration };
        }
        return { collided: false, normal: { x: 0, y: 0 }, penetration: 0 };
    }

    function circleCircleCollision(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        const radiiSum = a.radius + b.radius;

        if (distance < radiiSum) {
            const penetration = radiiSum - distance;
            // Evita divisão por zero se os círculos estão exatamente no mesmo lugar
            const normalX = distance === 0 ? 1 : dx / distance;
            const normalY = distance === 0 ? 0 : dy / distance;
            return { collided: true, normal: { x: normalX, y: normalY }, penetration: penetration };
        }
        return { collided: false, normal: { x: 0, y: 0 }, penetration: 0 };
    }

    // Função de colisão Círculo-Retângulo (SAT ou Algoritmo de Ponto Mais Próximo)
    function circleRectCollision(circle, rect) {
        // Encontra o ponto mais próximo no retângulo ao centro do círculo
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        const distanceSq = (dx * dx) + (dy * dy);
        const radiusSq = circle.radius * circle.radius;

        if (distanceSq < radiusSq) {
            // Colisão detectada
            const distance = Math.sqrt(distanceSq);
            const penetration = circle.radius - distance;
            let normal = { x: 0, y: 0 };

            if (distance === 0) { // Círculo exatamente no centro do retângulo
                // Escolha uma normal padrão, por exemplo, para cima (se estiver caindo)
                normal = { x: 0, y: -1 };
            } else {
                normal = { x: dx / distance, y: dy / distance };
            }

            return { collided: true, normal, penetration };
        }
        return { collided: false, normal: { x: 0, y: 0 }, penetration: 0 };
    }


    function ellipseEllipseCollision(a, b) {
        // Esta função precisa ser mais robusta para retornar normal e penetração
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        const aRadiusX = a.width / 2;
        const aRadiusY = a.height / 2;
        const bRadiusX = b.width / 2;
        const bRadiusY = b.height / 2;

        const distance = Math.hypot(dx, dy);
        const avgA = (aRadiusX + aRadiusY) / 2;
        const avgB = (bRadiusX + bRadiusY) / 2;

        if (distance < avgA + avgB) {
            // Estimativa simples para normal e penetração para elipses
            const penetration = (avgA + avgB) - distance;
            const normalX = dx / distance;
            const normalY = dy / distance;
            return { collided: true, normal: { x: normalX, y: normalY }, penetration: penetration };
        }
        return { collided: false, normal: { x: 0, y: 0 }, penetration: 0 };
    }

    function polygonPolygonCollision(a, b) {
        const polyA = a.vertices;
        const polyB = b.vertices;
        if (!polyA || !polyB) return { collided: false, normal: { x: 0, y: 0 }, penetration: 0 };

        const axes = getAxes(polyA).concat(getAxes(polyB));
        let minOverlap = Infinity;
        let collisionNormal = { x: 0, y: 0 };

        for (const axis of axes) {
            const [minA, maxA] = projectPolygon(polyA, axis);
            const [minB, maxB] = projectPolygon(polyB, axis);

            if (maxA < minB || maxB < minA) {
                return { collided: false, normal: { x: 0, y: 0 }, penetration: 0 };
            }

            const overlap = Math.min(maxA, maxB) - Math.max(minA, minB);
            if (overlap < minOverlap) {
                minOverlap = overlap;
                collisionNormal = axis;
            }
        }
        return { collided: true, normal: collisionNormal, penetration: minOverlap };
    }

    function getAxes(vertices) {
        const axes = [];
        for (let i = 0; i < vertices.length; i++) {
            const p1 = vertices[i];
            const p2 = vertices[(i + 1) % vertices.length];
            const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
            const normal = { x: -edge.y, y: edge.x };
            const length = Math.hypot(normal.x, normal.y);
            // Normalizar o vetor
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
        checkCollision, // Agora retorna um objeto de resultado de colisão
        setGravity,
        handleCollisionResponse
    };
})();