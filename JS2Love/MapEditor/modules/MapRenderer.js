/**
 * MapRenderer.js
 * Gerencia a renderização do mapa com pan/zoom e interação
 */
export class MapRenderer {
    constructor(state, canvas) {
        this.state = state;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupEventListeners();
        this.resizeCanvas();
    }
    
    /**
     * Redimensiona o canvas baseado no container
     */
    resizeCanvas() {
        this.canvas.width = this.state.canvasWidth;
        this.canvas.height = this.state.canvasHeight;
    }
    
    /**
     * Renderiza o mapa completo com todas as camadas
     */
    render() {
        const { canvasWidth, canvasHeight } = this.state;
        const { panX, panY, zoom } = this.state.map;
        
        // Limpa canvas
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Aplica transformações
        this.ctx.save();
        this.ctx.translate(panX, panY);
        this.ctx.scale(zoom, zoom);
        
        // Desenha grade
        this.drawGrid();
        
        // Desenha camadas
        this.drawLayers();
        
        this.ctx.restore();
    }
    
    /**
     * Desenha a grade do mapa
     */
    drawGrid() {
        const { mapWidth, mapHeight, tileWidth, tileHeight } = this.state;
        const zoom = this.state.map.zoom;
        
        this.ctx.strokeStyle = 'rgba(230, 224, 224, 0.1)';
        this.ctx.lineWidth = 1 / zoom;
        
        // Linhas verticais
        for (let x = 0; x <= mapWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * tileWidth, 0);
            this.ctx.lineTo(x * tileWidth, mapHeight * tileHeight);
            this.ctx.stroke();
        }
        
        // Linhas horizontais
        for (let y = 0; y <= mapHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * tileHeight);
            this.ctx.lineTo(mapWidth * tileWidth, y * tileHeight);
            this.ctx.stroke();
        }
    }
    
    /**
     * Desenha todas as camadas visíveis
     */
    drawLayers() {
        const { layers, tilesetImage, mapWidth, mapHeight, tileWidth, tileHeight } = this.state;
        
        if (!tilesetImage) return;
        
        const tilesPerRow = Math.floor(tilesetImage.width / tileWidth);
        
        layers.forEach(layer => {
            if (!layer.visible) return;
            
            for (let y = 0; y < mapHeight; y++) {
                for (let x = 0; x < mapWidth; x++) {
                    const mapIndex = y * mapWidth + x;
                    const tileIndex = layer.data[mapIndex];
                    
                    if (tileIndex >= 0) {
                        const tileX = tileIndex % tilesPerRow;
                        const tileY = Math.floor(tileIndex / tilesPerRow);
                        
                        this.ctx.drawImage(
                            tilesetImage,
                            tileX * tileWidth,
                            tileY * tileHeight,
                            tileWidth,
                            tileHeight,
                            x * tileWidth,
                            y * tileHeight,
                            tileWidth,
                            tileHeight
                        );
                    }
                }
            }
        });
    }
    
    /**
     * Converte coordenadas do clique para posição no mapa
     */
    getMapPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const { panX, panY, zoom } = this.state.map;
        const { tileWidth, tileHeight } = this.state;
        
        const x = Math.floor(((clientX - rect.left - panX) / zoom) / tileWidth);
        const y = Math.floor(((clientY - rect.top - panY) / zoom) / tileHeight);
        
        return { x, y };
    }
    
    /**
     * Verifica se a posição está dentro dos limites do mapa
     */
    isValidPosition(x, y) {
        return x >= 0 && x < this.state.mapWidth && y >= 0 && y < this.state.mapHeight;
    }
    
    /**
     * Inicia panning
     */
    startPan(clientX, clientY) {
        this.state.map.isPanning = true;
        this.state.map.lastPanX = clientX;
        this.state.map.lastPanY = clientY;
        this.canvas.style.cursor = 'grabbing';
    }
    
    /**
     * Atualiza panning
     */
    updatePan(clientX, clientY) {
        if (!this.state.map.isPanning) return;
        
        const dx = clientX - this.state.map.lastPanX;
        const dy = clientY - this.state.map.lastPanY;
        
        this.state.map.panX += dx;
        this.state.map.panY += dy;
        this.state.map.lastPanX = clientX;
        this.state.map.lastPanY = clientY;
        
        this.render();
    }
    
    /**
     * Para panning
     */
    stopPan() {
        this.state.map.isPanning = false;
        this.updateCursor();
    }
    
    /**
     * Aplica zoom
     */
    applyZoom(deltaY, clientX, clientY) {
        const scaleAmount = 1.1;
        const rect = this.canvas.getBoundingClientRect();
        const { zoom, panX, panY } = this.state.map;
        
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        
        // Posição do mouse no canvas com zoom atual
        const currentZoomedX = (mouseX - panX) / zoom;
        const currentZoomedY = (mouseY - panY) / zoom;
        
        // Aplica zoom
        if (deltaY < 0) {
            this.state.map.zoom *= scaleAmount;
        } else {
            this.state.map.zoom /= scaleAmount;
        }
        
        // Limita zoom mínimo
        this.state.map.zoom = Math.max(0.1, this.state.map.zoom);
        
        // Recalcula pan para manter o ponto fixo
        this.state.map.panX = mouseX - currentZoomedX * this.state.map.zoom;
        this.state.map.panY = mouseY - currentZoomedY * this.state.map.zoom;
        
        this.render();
    }
    
    /**
     * Atualiza o cursor baseado no estado
     */
    updateCursor() {
        if (this.state.map.isPanning) {
            this.canvas.style.cursor = 'grabbing';
        } else if (this.state.isErasing) {
            this.canvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><path fill=\'red\' d=\'M10 2l-2 2h-4v2h2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-16h2v-2h-4l-2-2h-6zm-1 4h14v16h-14v-16zm2 2v12h2v-12h-2zm4 0v12h2v-12h-2zm4 0v12h2v-12h-2z\'/></svg>") 16 16, auto';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
    }
    
    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Desenho e panning
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Botão esquerdo - desenho
                this.state.isDrawing = true;
                if (this.onDrawStart) this.onDrawStart(e);
            } else if (e.button === 1) { // Botão do meio - pan
                e.preventDefault();
                this.startPan(e.clientX, e.clientY);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.state.isDrawing) {
                if (this.onDraw) this.onDraw(e);
            } else {
                this.updatePan(e.clientX, e.clientY);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.state.isDrawing = false;
            this.stopPan();
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.state.isDrawing = false;
            this.stopPan();
        });
        
        // Zoom com scroll
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.applyZoom(e.deltaY, e.clientX, e.clientY);
        });
        
        // Atualiza cursor ao iniciar
        this.updateCursor();
    }
    
    /**
     * Define callback para desenho
     */
    setDrawCallback(callback) {
        this.onDraw = callback;
        this.onDrawStart = callback;
    }
}
