/**
 * TilesetManager.js
 * Gerencia o tileset, renderização, seleção e transformações (pan/zoom)
 */
export class TilesetManager {
    constructor(state, canvas) {
        this.state = state;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupEventListeners();
    }
    
    /**
     * Carrega um arquivo de tileset
     */
    loadTileset(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.state.tilesetImage = img;
                this.state.resetTilesetTransform();
                this.render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * Renderiza o tileset com grades e seleção
     */
    render() {
        if (!this.state.tilesetImage) return;
        
        const img = this.state.tilesetImage;
        const { panX, panY, zoom } = this.state.tileset;
        
        // Define tamanho do canvas
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        // Limpa canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Aplica transformações
        this.ctx.save();
        this.ctx.translate(panX, panY);
        this.ctx.scale(zoom, zoom);
        
        // Desenha tileset
        this.ctx.drawImage(img, 0, 0);
        
        // Desenha grade
        this.drawGrid();
        
        // Desenha seleção
        this.drawSelection();
        
        this.ctx.restore();
    }
    
    /**
     * Desenha a grade do tileset
     */
    drawGrid() {
        const img = this.state.tilesetImage;
        const { tileWidth, tileHeight } = this.state;
        const zoom = this.state.tileset.zoom;
        
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.lineWidth = 1 / zoom;
        
        // Linhas verticais
        for (let x = 0; x < img.width; x += tileWidth) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, img.height);
            this.ctx.stroke();
        }
        
        // Linhas horizontais
        for (let y = 0; y < img.height; y += tileHeight) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(img.width, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Desenha o tile selecionado
     */
    drawSelection() {
        const { x, y } = this.state.selectedTile;
        if (x === -1 || y === -1) return;
        
        const { tileWidth, tileHeight } = this.state;
        const zoom = this.state.tileset.zoom;
        
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 3 / zoom;
        this.ctx.strokeRect(
            x * tileWidth,
            y * tileHeight,
            tileWidth,
            tileHeight
        );
    }
    
    /**
     * Seleciona um tile baseado em coordenadas do clique
     */
    selectTile(clientX, clientY) {
        if (!this.state.tilesetImage) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        
        const tileX = Math.floor(x / this.state.tileWidth);
        const tileY = Math.floor(y / this.state.tileHeight);
        
        // Valida limites
        const tilesPerRow = Math.floor(this.state.tilesetImage.width / this.state.tileWidth);
        const tilesPerCol = Math.floor(this.state.tilesetImage.height / this.state.tileHeight);
        
        if (tileX >= 0 && tileX < tilesPerRow && tileY >= 0 && tileY < tilesPerCol) {
            this.state.setSelectedTile(tileX, tileY);
            this.render();
            return true;
        }
        
        return false;
    }
    
    /**
     * Inicia panning
     */
    startPan(clientX, clientY) {
        this.state.tileset.isPanning = true;
        this.state.tileset.lastPanX = clientX;
        this.state.tileset.lastPanY = clientY;
        this.canvas.style.cursor = 'grabbing';
    }
    
    /**
     * Atualiza panning
     */
    updatePan(clientX, clientY) {
        if (!this.state.tileset.isPanning) return;
        
        const dx = clientX - this.state.tileset.lastPanX;
        const dy = clientY - this.state.tileset.lastPanY;
        
        this.state.tileset.panX += dx;
        this.state.tileset.panY += dy;
        this.state.tileset.lastPanX = clientX;
        this.state.tileset.lastPanY = clientY;
        
        this.render();
    }
    
    /**
     * Para panning
     */
    stopPan() {
        this.state.tileset.isPanning = false;
        this.canvas.style.cursor = '';
    }
    
    /**
     * Aplica zoom
     */
    applyZoom(deltaY, mouseX, mouseY) {
        const scaleAmount = 1.1;
        const { zoom, panX, panY } = this.state.tileset;
        
        // Posição do mouse no canvas com zoom atual
        const currentZoomedX = (mouseX - panX) / zoom;
        const currentZoomedY = (mouseY - panY) / zoom;
        
        // Aplica zoom
        if (deltaY < 0) {
            this.state.tileset.zoom *= scaleAmount;
        } else {
            this.state.tileset.zoom /= scaleAmount;
        }
        
        // Limita zoom mínimo
        this.state.tileset.zoom = Math.max(0.1, this.state.tileset.zoom);
        
        // Recalcula pan para manter o ponto fixo
        this.state.tileset.panX = mouseX - currentZoomedX * this.state.tileset.zoom;
        this.state.tileset.panY = mouseY - currentZoomedY * this.state.tileset.zoom;
        
        this.render();
    }
    
    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Clique para seleção
        this.canvas.addEventListener('click', (e) => {
            this.selectTile(e.clientX, e.clientY);
        });
        
        // Pan com botão do meio
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1) { // Botão do meio
                e.preventDefault();
                this.startPan(e.clientX, e.clientY);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.updatePan(e.clientX, e.clientY);
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.stopPan();
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.stopPan();
        });
        
        // Zoom com scroll
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.applyZoom(e.deltaY, e.offsetX, e.offsetY);
        });
    }
}
