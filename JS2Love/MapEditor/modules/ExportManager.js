/**
 * ExportManager.js
 * Gerencia importação e exportação de mapas
 * Formato compatível com tilemap.js da engine
 */
export class ExportManager {
    constructor(state) {
        this.state = state;
    }
    
    /**
     * Exporta o mapa no formato JSON compatível com Tiled/tilemap.js
     */
    exportMap(filename = 'tilemap.json') {
        const mapData = this.state.exportMapData();
        
        const dataStr = JSON.stringify(mapData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(url);
        
        return true;
    }
    
    /**
     * Importa um arquivo de mapa JSON
     */
    async importMap(file) {
        if (!file) return false;
        
        try {
            const text = await file.text();
            const mapData = JSON.parse(text);
            
            // Valida estrutura básica
            if (!this.validateMapData(mapData)) {
                throw new Error('Formato de mapa inválido');
            }
            
            this.state.importMapData(mapData);
            return true;
        } catch (error) {
            console.error('Erro ao importar mapa:', error);
            alert(`Erro ao importar mapa: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Valida se os dados do mapa são válidos
     */
    validateMapData(mapData) {
        if (!mapData || typeof mapData !== 'object') return false;
        
        // Verifica campos obrigatórios
        const requiredFields = ['width', 'height', 'layers'];
        for (const field of requiredFields) {
            if (!(field in mapData)) {
                console.error(`Campo obrigatório ausente: ${field}`);
                return false;
            }
        }
        
        // Verifica se layers é um array
        if (!Array.isArray(mapData.layers)) {
            console.error('layers deve ser um array');
            return false;
        }
        
        // Verifica se tem pelo menos uma camada
        if (mapData.layers.length === 0) {
            console.error('O mapa deve ter pelo menos uma camada');
            return false;
        }
        
        return true;
    }
    
    /**
     * Exporta apenas uma camada específica
     */
    exportLayer(layerIndex, filename) {
        if (layerIndex < 0 || layerIndex >= this.state.layers.length) {
            console.error('Índice de camada inválido');
            return false;
        }
        
        const layer = this.state.layers[layerIndex];
        const layerData = {
            name: layer.name,
            width: this.state.mapWidth,
            height: this.state.mapHeight,
            data: layer.data
        };
        
        const dataStr = JSON.stringify(layerData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `${layer.name}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        return true;
    }
    
    /**
     * Cria um projeto completo (mapa + tileset) em um ZIP
     * Nota: Requer biblioteca externa como JSZip
     */
    async exportProject(projectName = 'map-project') {
        // TODO: Implementar exportação de projeto completo com JSZip
        console.warn('Exportação de projeto completo não implementada ainda');
        alert('Recurso em desenvolvimento. Use "Exportar Mapa" por enquanto.');
    }
    
    /**
     * Gera prévia do mapa como imagem PNG
     */
    async exportAsImage(canvas, filename = 'map-preview.png') {
        try {
            // Cria uma versão do canvas sem pan/zoom
            const tempCanvas = document.createElement('canvas');
            const { mapWidth, mapHeight, tileWidth, tileHeight } = this.state;
            
            tempCanvas.width = mapWidth * tileWidth;
            tempCanvas.height = mapHeight * tileHeight;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Renderiza cada camada visível
            this.renderToCanvas(tempCtx);
            
            // Converte para blob e faz download
            tempCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
                URL.revokeObjectURL(url);
            });
            
            return true;
        } catch (error) {
            console.error('Erro ao exportar imagem:', error);
            return false;
        }
    }
    
    /**
     * Renderiza o mapa em um contexto específico (helper para exportAsImage)
     */
    renderToCanvas(ctx) {
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
                        
                        ctx.drawImage(
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
}
