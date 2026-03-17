// modules/screenDarkness.js
// Sistema de iluminação usando canvas offscreen com suporte a cores
export const screenDarkness = (function () {
  let alpha = 0.7;         // 0-1
  let shadowCanvas = null;
  let shadowCtx = null;
  let lightColorCanvas = null;
  let lightColorCtx = null;

  // Inicializa os canvas offscreen
  function init() {
    if (!shadowCanvas) {
      const width = love.graphics.getWidth();
      const height = love.graphics.getHeight();
      
      // Canvas para máscara de sombra (preto/transparente)
      shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = width;
      shadowCanvas.height = height;
      shadowCtx = shadowCanvas.getContext('2d');
      shadowCtx.imageSmoothingEnabled = false;
      
      // Canvas para cores das luzes
      lightColorCanvas = document.createElement('canvas');
      lightColorCanvas.width = width;
      lightColorCanvas.height = height;
      lightColorCtx = lightColorCanvas.getContext('2d');
      lightColorCtx.imageSmoothingEnabled = false;
    }
  }

  function set(alphaVal) { 
    alpha = Math.max(0, Math.min(1, alphaVal)); 
  }
  
  function get() { 
    return alpha; 
  }

  /** 
   * Inicia a renderização da máscara de luz.
   * Chame ANTES de desenhar as luzes.
   */
  function beginLightMask() {
    init();
    
    // Limpa e prepara o canvas de sombra (máscara preto/transparente)
    shadowCtx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
    shadowCtx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    shadowCtx.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height);
    shadowCtx.globalCompositeOperation = 'destination-out';
    
    // Limpa o canvas de cores
    lightColorCtx.clearRect(0, 0, lightColorCanvas.width, lightColorCanvas.height);
    lightColorCtx.globalCompositeOperation = 'source-over';
  }

  /** 
   * Finaliza a máscara e aplica no canvas principal.
   * Chame DEPOIS de desenhar todas as luzes.
   */
  function endLightMask() {
    if (!shadowCanvas) return;
    
    // Restaura blend modes dos canvas offscreen
    shadowCtx.globalCompositeOperation = 'source-over';
    lightColorCtx.globalCompositeOperation = 'source-over';
    
    const mainCtx = window.engine.ctx;
    const previousBlend = mainCtx.globalCompositeOperation;
    
    // PASSO 1: Aplica a máscara de sombra com multiply (escurece)
    mainCtx.globalCompositeOperation = 'multiply';
    mainCtx.drawImage(shadowCanvas, 0, 0);
    
    // PASSO 2: Aplica as cores das luzes com screen (ilumina e adiciona cor)
    mainCtx.globalCompositeOperation = 'screen';
    mainCtx.drawImage(lightColorCanvas, 0, 0);
    
    mainCtx.globalCompositeOperation = previousBlend;
  }

  /**
   * Retorna o contexto do canvas de sombra (máscara preto/transparente).
   */
  function getShadowContext() {
    init();
    return shadowCtx;
  }

  /**
   * Retorna o contexto do canvas de cores (luzes coloridas).
   */
  function getLightColorContext() {
    init();
    return lightColorCtx;
  }

  /**
   * Retorna o contexto do canvas de sombra.
   * Mantido para compatibilidade (mesmo que getShadowContext).
   */
  function getLightContext() {
    return getShadowContext();
  }

  /**
   * Desenha uma luz no canvas offscreen.
   * Use dentro de beginLightMask/endLightMask.
   */
  function drawLight(x, y, radius, color = { r: 255, g: 255, b: 255, a: 1 }) {
    if (!shadowCtx) return;
    
    // Cria gradiente radial
    const gradient = shadowCtx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    
    shadowCtx.fillStyle = gradient;
    shadowCtx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  /** Método legado - mantido para compatibilidade */
  function drawMask() {
    // Não faz nada - a nova abordagem não precisa disso
  }

  /** Método legado - mantido para compatibilidade */
  function beginCut() {
    // Redirecionado para o novo sistema
    beginLightMask();
  }

  /** Método legado - mantido para compatibilidade */
  function endCut() {
    // Redirecionado para o novo sistema
    endLightMask();
  }

  return { 
    set, 
    get, 
    init,
    beginLightMask, 
    endLightMask, 
    drawLight,
    getShadowContext,
    getLightColorContext,
    getLightContext, // compatibilidade
    // Métodos legados
    drawMask,
    beginCut, 
    endCut 
  };
})();
