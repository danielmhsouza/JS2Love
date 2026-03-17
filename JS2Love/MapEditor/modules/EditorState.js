/**
 * EditorState.js
 * Gerencia o estado global do editor de mapas
 */
export class EditorState {
    constructor() {
        // Configurações do tileset
        this.tilesetImage = null;
        this.tileWidth = 32;
        this.tileHeight = 32;
        
        // Configurações do mapa
        this.mapWidth = 20;
        this.mapHeight = 15;
        this.layers = [];
        this.currentLayer = 0;
        
        // Estado da ferramenta
        this.selectedTile = { x: 0, y: 0 };
        this.isDrawing = false;
        this.isErasing = false;
        
        // Pan e Zoom do Tileset
        this.tileset = {
            panX: 0,
            panY: 0,
            zoom: 1,
            isPanning: false,
            lastPanX: 0,
            lastPanY: 0
        };
        
        // Pan e Zoom do Mapa
        this.map = {
            panX: 0,
            panY: 0,
            zoom: 1,
            isPanning: false,
            lastPanX: 0,
            lastPanY: 0
        };
        
        // Tamanhos do canvas
        this.canvasWidth = 800;
        this.canvasHeight = 600;
    }
    
    /**
     * Reseta o estado do tileset
     */
    resetTilesetTransform() {
        this.tileset.panX = 0;
        this.tileset.panY = 0;
        this.tileset.zoom = 1;
        this.tileset.isPanning = false;
    }
    
    /**
     * Reseta o estado do mapa
     */
    resetMapTransform() {
        this.map.panX = 0;
        this.map.panY = 0;
        this.map.zoom = 1;
        this.map.isPanning = false;
    }
    
    /**
     * Adiciona uma nova camada
     */
    addLayer(name) {
        const layer = {
            name: name || `Layer ${this.layers.length + 1}`,
            visible: true,
            data: new Array(this.mapWidth * this.mapHeight).fill(-1)
        };
        this.layers.push(layer);
        return layer;
    }
    
    /**
     * Remove uma camada
     */
    removeLayer(index) {
        if (this.layers.length <= 1) return false;
        
        this.layers.splice(index, 1);
        if (this.currentLayer >= this.layers.length) {
            this.currentLayer = this.layers.length - 1;
        }
        return true;
    }
    
    /**
     * Alterna visibilidade de uma camada
     */
    toggleLayerVisibility(index) {
        if (this.layers[index]) {
            this.layers[index].visible = !this.layers[index].visible;
        }
    }
    
    /**
     * Obtém a camada atual
     */
    getCurrentLayer() {
        return this.layers[this.currentLayer];
    }
    
    /**
     * Define o tile selecionado
     */
    setSelectedTile(x, y) {
        this.selectedTile = { x, y };
    }
    
    /**
     * Obtém o índice do tile no tileset
     */
    getTileIndex(tileX, tileY) {
        if (!this.tilesetImage) return -1;
        const tilesPerRow = Math.floor(this.tilesetImage.width / this.tileWidth);
        return tileY * tilesPerRow + tileX;
    }
    
    /**
     * Obtém a posição do tile a partir do índice
     */
    getTilePosition(tileIndex) {
        if (!this.tilesetImage || tileIndex < 0) return { x: 0, y: 0 };
        const tilesPerRow = Math.floor(this.tilesetImage.width / this.tileWidth);
        return {
            x: tileIndex % tilesPerRow,
            y: Math.floor(tileIndex / tilesPerRow)
        };
    }
    
    /**
     * Exporta o estado do mapa no formato compatível com tilemap.js
     */
    exportMapData() {
        return {
            width: this.mapWidth,
            height: this.mapHeight,
            tilewidth: this.tileWidth,
            tileheight: this.tileHeight,
            layers: this.layers.map(layer => ({
                name: layer.name,
                type: "tilelayer",
                visible: layer.visible,
                width: this.mapWidth,
                height: this.mapHeight,
                data: layer.data.map(tile => tile === -1 ? 0 : tile + 1) // Converte -1 para 0 e incrementa (formato Tiled)
            }))
        };
    }
    
    /**
     * Importa dados do mapa
     */
    importMapData(mapData) {
        this.mapWidth = mapData.width;
        this.mapHeight = mapData.height;
        this.tileWidth = mapData.tilewidth || mapData.tileWidth || 32;
        this.tileHeight = mapData.tileheight || mapData.tileHeight || 32;
        
        this.layers = mapData.layers
            .filter(layer => layer.type === "tilelayer")
            .map(layer => ({
                name: layer.name,
                visible: layer.visible !== false,
                data: layer.data.map(tile => tile === 0 ? -1 : tile - 1) // Converte 0 para -1 e decrementa (formato interno)
            }));
        
        if (this.layers.length === 0) {
            this.addLayer('Background');
        }
        
        this.currentLayer = 0;
        this.resetMapTransform();
    }
}
