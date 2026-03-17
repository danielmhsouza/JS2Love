/**
 * Sistema de Câmera 2D
 * Permite seguir objetos, aplicar shake, zoom e definir limites de mundo
 * Uso simples inspirado no Love2D - PLUG AND PLAY
 */

export const camera = (function () {
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let zoom = 1;
    let rotation = 0;
    
    // Suavização
    let smoothness = 5;
    
    // Shake
    let shakeX = 0;
    let shakeY = 0;
    let shakeIntensity = 0;
    let shakeDuration = 0;
    let shakeTimer = 0;
    
    // Seguir objeto
    let followTarget = null;
    let followOffsetX = 0;
    let followOffsetY = 0;
    
    // Limites do mundo
    let worldLimits = null;
    
    // Deadzone
    let deadzone = null;
    
    // Tamanho do viewport (detectado automaticamente do canvas)
    let viewportWidth = 0;
    let viewportHeight = 0;
    
    /**
     * Detecta automaticamente o tamanho do canvas
     */
    function detectCanvasSize() {
        if (window.engine && window.engine.canvas) {
            viewportWidth = window.engine.canvas.width;
            viewportHeight = window.engine.canvas.height;
        }
        return { width: viewportWidth, height: viewportHeight };
    }

    /**
     * Define o alvo para a câmera seguir
     */
    function follow(target, offsetX = 0, offsetY = 0) {
        followTarget = target;
        followOffsetX = offsetX;
        followOffsetY = offsetY;
    }

    /**
     * Para de seguir o alvo
     */
    function unfollow() {
        followTarget = null;
    }

    /**
     * Define a posição da câmera diretamente
     */
    function setPosition(newX, newY) {
        x = newX;
        y = newY;
        targetX = newX;
        targetY = newY;
    }

    /**
     * Move a câmera suavemente para uma posição
     */
    function moveTo(newX, newY) {
        targetX = newX;
        targetY = newY;
    }

    /**
     * Define o zoom da câmera
     */
    function setZoom(newZoom) {
        zoom = Math.max(0.1, newZoom);
    }

    /**
     * Define a rotação da câmera em radianos
     */
    function setRotation(angle) {
        rotation = angle;
    }

    /**
     * Define a suavização do movimento
     */
    function setSmoothness(value) {
        smoothness = Math.max(0, value);
    }

    /**
     * Ativa efeito de tremor na câmera
     */
    function shake(intensity = 10, duration = 0.5) {
        shakeIntensity = intensity;
        shakeDuration = duration;
        shakeTimer = 0;
    }

    /**
     * Define os limites do mundo
     */
    function setLimits(minX, minY, maxWidth, maxHeight) {
        worldLimits = {
            x: minX,
            y: minY,
            width: maxWidth,
            height: maxHeight
        };
    }

    /**
     * Remove os limites do mundo
     */
    function removeLimits() {
        worldLimits = null;
    }

    /**
     * Define uma área central onde a câmera não se move (deadzone)
     */
    function setDeadzone(width, height) {
        const size = detectCanvasSize();
        deadzone = {
            x: (size.width / 2) - (width / 2),
            y: (size.height / 2) - (height / 2),
            width: width,
            height: height
        };
    }

    /**
     * Remove a deadzone
     */
    function removeDeadzone() {
        deadzone = null;
    }

    /**
     * Define o tamanho da tela (OPCIONAL - detecta automaticamente se não chamar)
     * Use apenas se precisar sobrescrever o tamanho detectado
     */
    function setScreenSize(width, height) {
        viewportWidth = width;
        viewportHeight = height;
    }

    /**
     * Atualiza a posição da câmera
     */
    function update(dt) {
        // Detecta o tamanho do canvas automaticamente se não foi definido
        if (viewportWidth === 0 || viewportHeight === 0) {
            detectCanvasSize();
        }
        
        // Atualiza shake
        if (shakeTimer < shakeDuration) {
            shakeTimer += dt;
            const progress = shakeTimer / shakeDuration;
            const currentIntensity = shakeIntensity * (1 - progress);
            
            shakeX = (Math.random() - 0.5) * 2 * currentIntensity;
            shakeY = (Math.random() - 0.5) * 2 * currentIntensity;
        } else {
            shakeX = 0;
            shakeY = 0;
        }

        // Segue o alvo se houver
        if (followTarget) {
            const tx = (followTarget.body?.x ?? followTarget.x) + followOffsetX;
            const ty = (followTarget.body?.y ?? followTarget.y) + followOffsetY;
            
            const targetWidth = followTarget.body?.width ?? followTarget.width ?? 0;
            const targetHeight = followTarget.body?.height ?? followTarget.height ?? 0;
            
            const centerX = tx + targetWidth / 2;
            const centerY = ty + targetHeight / 2;

            if (deadzone) {
                const screenPosX = centerX - x;
                const screenPosY = centerY - y;

                if (screenPosX < deadzone.x) {
                    targetX = centerX - deadzone.x;
                } else if (screenPosX > deadzone.x + deadzone.width) {
                    targetX = centerX - (deadzone.x + deadzone.width);
                }

                if (screenPosY < deadzone.y) {
                    targetY = centerY - deadzone.y;
                } else if (screenPosY > deadzone.y + deadzone.height) {
                    targetY = centerY - (deadzone.y + deadzone.height);
                }
            } else {
                // Centraliza o alvo na tela
                targetX = centerX;
                targetY = centerY;
            }
        }

        // Aplica suavização
        if (smoothness > 0) {
            const lerpFactor = Math.min(1, dt * smoothness);
            x += (targetX - x) * lerpFactor;
            y += (targetY - y) * lerpFactor;
        } else {
            x = targetX;
            y = targetY;
        }

        // Aplica limites do mundo
        if (worldLimits) {
            const halfScreenW = viewportWidth / (2 * zoom);
            const halfScreenH = viewportHeight / (2 * zoom);
            
            const minX = worldLimits.x - halfScreenW + viewportWidth / zoom;
            const maxX = worldLimits.x + worldLimits.width - halfScreenW;
            const minY = worldLimits.y - halfScreenH + viewportHeight / zoom;
            const maxY = worldLimits.y + worldLimits.height - halfScreenH;
            
            x = Math.max(worldLimits.x, Math.min(maxX, x));
            y = Math.max(worldLimits.y, Math.min(maxY, y));
        }
    }

    /**
     * Aplica transformações em um contexto específico
     */
    function applyTransform(ctx) {
        // Usa o tamanho do canvas associado ao contexto específico
        const cx = ctx.canvas.width / 2;
        const cy = ctx.canvas.height / 2;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.scale(zoom, zoom);
        ctx.translate(-x - shakeX, -y - shakeY);
    }

    /**
     * Remove transformações de um contexto específico
     */
    function removeTransform(ctx) {
        ctx.restore();
    }

    /**
     * Aplica as transformações da câmera ao canvas principal
     */
    function attach() {
        const ctx = window.engine.ctx;
        applyTransform(ctx);
    }

    /**
     * Remove as transformações da câmera do canvas principal
     */
    function detach() {
        const ctx = window.engine.ctx;
        removeTransform(ctx);
    }

    /**
     * Aplica as transformações da câmera a um contexto específico
     * Útil para aplicar em canvas offscreen manualmente
     */
    function applyTransformTo(ctx) {
        applyTransform(ctx);
    }

    /**
     * Remove as transformações de um contexto específico
     */
    function removeTransformFrom(ctx) {
        removeTransform(ctx);
    }

    /**
     * Converte coordenadas da tela para coordenadas do mundo
     */
    function screenToWorld(screenX, screenY) {
        const size = detectCanvasSize();
        const cx = size.width / 2;
        const cy = size.height / 2;
        
        const worldX = (screenX - cx) / zoom + x;
        const worldY = (screenY - cy) / zoom + y;
        
        return { x: worldX, y: worldY };
    }

    /**
     * Converte coordenadas do mundo para coordenadas da tela
     */
    function worldToScreen(worldX, worldY) {
        const size = detectCanvasSize();
        const cx = size.width / 2;
        const cy = size.height / 2;
        
        const screenX = (worldX - x) * zoom + cx;
        const screenY = (worldY - y) * zoom + cy;
        
        return { x: screenX, y: screenY };
    }

    /**
     * Retorna a posição atual da câmera
     */
    function getPosition() {
        return { x, y };
    }

    /**
     * Retorna o zoom atual
     */
    function getZoom() {
        return zoom;
    }

    /**
     * Retorna a rotação atual
     */
    function getRotation() {
        return rotation;
    }

    /**
     * Reseta a câmera para valores padrão
     */
    function reset() {
        x = 0;
        y = 0;
        targetX = 0;
        targetY = 0;
        zoom = 1;
        rotation = 0;
        smoothness = 5;
        shakeX = 0;
        shakeY = 0;
        shakeIntensity = 0;
        shakeDuration = 0;
        shakeTimer = 0;
        followTarget = null;
        worldLimits = null;
        deadzone = null;
        viewportWidth = 0;
        viewportHeight = 0;
    }

    return {
        follow,
        unfollow,
        setPosition,
        moveTo,
        setZoom,
        setRotation,
        setSmoothness,
        shake,
        setLimits,
        removeLimits,
        setDeadzone,
        removeDeadzone,
        setScreenSize,
        update,
        attach,
        detach,
        applyTransformTo,
        removeTransformFrom,
        screenToWorld,
        worldToScreen,
        getPosition,
        getZoom,
        getRotation,
        reset
    };
})();

// Exporta globalmente para uso sem import
if (typeof window !== 'undefined') {
    window.camera = camera;
}
