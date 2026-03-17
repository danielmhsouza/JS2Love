/**
 * ToolManager.js
 * Gerencia ferramentas de desenho e edição
 */
export class ToolManager {
    constructor(state, mapRenderer) {
        this.state = state;
        this.mapRenderer = mapRenderer;
    }
    
    /**
     * Alterna ferramenta de borracha
     */
    toggleEraser() {
        this.state.isErasing = !this.state.isErasing;
        
        const eraseButton = document.getElementById('erase-tool');
        if (eraseButton) {
            if (this.state.isErasing) {
                eraseButton.classList.remove('bg-red-500');
                eraseButton.classList.add('bg-red-700', 'text-white');
                this.state.setSelectedTile(-1, -1);
            } else {
                eraseButton.classList.remove('bg-red-700', 'text-white');
                eraseButton.classList.add('bg-red-500');
                this.state.setSelectedTile(0, 0);
            }
        }
        
        this.mapRenderer.updateCursor();
    }
    
    /**
     * Desenha um tile no mapa
     */
    drawTile(clientX, clientY) {
        if (!this.state.tilesetImage || this.state.layers.length === 0) return;
        
        const pos = this.mapRenderer.getMapPosition(clientX, clientY);
        
        if (!this.mapRenderer.isValidPosition(pos.x, pos.y)) return;
        
        let tileIndex;
        if (this.state.isErasing) {
            tileIndex = -1; // Apaga o tile
        } else {
            tileIndex = this.state.getTileIndex(
                this.state.selectedTile.x,
                this.state.selectedTile.y
            );
        }
        
        const layer = this.state.getCurrentLayer();
        const mapIndex = pos.y * this.state.mapWidth + pos.x;
        
        // Só redesenha se mudou
        if (layer.data[mapIndex] !== tileIndex) {
            layer.data[mapIndex] = tileIndex;
            this.mapRenderer.render();
        }
    }
    
    /**
     * Preenche uma área com um tile (flood fill)
     */
    floodFill(startX, startY) {
        // TODO: Implementar flood fill se necessário
        console.log('Flood fill não implementado ainda', startX, startY);
    }
    
    /**
     * Seleciona uma ferramenta
     */
    selectTool(toolName) {
        switch(toolName) {
            case 'draw':
                this.state.isErasing = false;
                break;
            case 'erase':
                this.state.isErasing = true;
                break;
            case 'fill':
                // TODO: Implementar ferramenta de preenchimento
                break;
            case 'select':
                // TODO: Implementar seleção de área
                break;
        }
        
        this.mapRenderer.updateCursor();
    }
}
