/**
 * Tile Map Editor
 * Editor de mapas modular compatível com o sistema tilemap.js da engine JS2Love
 */

import { EditorState } from './modules/EditorState.js';
import { TilesetManager } from './modules/TilesetManager.js';
import { MapRenderer } from './modules/MapRenderer.js';
import { LayerManager } from './modules/LayerManager.js';
import { ToolManager } from './modules/ToolManager.js';
import { ExportManager } from './modules/ExportManager.js';

class TileMapEditor {
    constructor() {
        // Estado global
        this.state = new EditorState();
        
        // Gerenciadores
        this.tilesetManager = null;
        this.mapRenderer = null;
        this.layerManager = null;
        this.toolManager = null;
        this.exportManager = null;
        
        this.init();
    }
    
    init() {
        // Inicializa gerenciadores
        this.initializeManagers();
        
        // Configura event listeners principais
        this.setupEventListeners();
        
        // Cria mapa inicial
        this.createMap();
        
        // Redimensionamento
        window.addEventListener('resize', () => {
            this.mapRenderer.resizeCanvas();
            this.mapRenderer.render();
        });
    }
    
    initializeManagers() {
        // Tileset Manager
        const tilesetCanvas = document.getElementById('tileset-canvas');
        this.tilesetManager = new TilesetManager(this.state, tilesetCanvas);
        
        // Map Renderer
        const mapCanvas = document.getElementById('map-canvas');
        this.mapRenderer = new MapRenderer(this.state, mapCanvas);
        
        // Callback de desenho
        this.mapRenderer.setDrawCallback((e) => {
            this.toolManager.drawTile(e.clientX, e.clientY);
        });
        
        // Layer Manager
        const layersList = document.getElementById('layers-list');
        this.layerManager = new LayerManager(this.state, layersList);
        this.layerManager.setChangeCallback(() => {
            this.mapRenderer.render();
        });
        
        // Tool Manager
        this.toolManager = new ToolManager(this.state, this.mapRenderer);
        
        // Export Manager
        this.exportManager = new ExportManager(this.state);
    }
    
    setupEventListeners() {
        // Carregar tileset
        document.getElementById('tileset-input').addEventListener('change', (e) => {
            this.tilesetManager.loadTileset(e.target.files[0]);
        });
        
        // Configurações de tile
        document.getElementById('tile-width').addEventListener('change', (e) => {
            this.state.tileWidth = parseInt(e.target.value);
            this.tilesetManager.render();
            this.mapRenderer.render();
        });
        
        document.getElementById('tile-height').addEventListener('change', (e) => {
            this.state.tileHeight = parseInt(e.target.value);
            this.tilesetManager.render();
            this.mapRenderer.render();
        });
        
        // Configurações do mapa
        document.getElementById('map-width').addEventListener('change', (e) => {
            this.state.mapWidth = parseInt(e.target.value);
        });
        
        document.getElementById('map-height').addEventListener('change', (e) => {
            this.state.mapHeight = parseInt(e.target.value);
        });
        
        // Criar mapa
        document.getElementById('create-map').addEventListener('click', () => {
            if (confirm('Criar um novo mapa apagará o atual. Deseja continuar?')) {
                this.createMap();
            }
        });
        
        // Adicionar camada
        document.getElementById('add-layer').addEventListener('click', () => {
            const name = document.getElementById('layer-name').value || undefined;
            this.layerManager.addLayer(name);
            document.getElementById('layer-name').value = '';
        });
        
        // Exportar mapa
        document.getElementById('export-map').addEventListener('click', (e) => {
            e.preventDefault();
            const filename = document.getElementById('map-name').value || 'tilemap.json';
            if (this.exportManager.exportMap(filename)) {
                alert('Mapa exportado com sucesso!');
            }
        });
        
        // Ferramenta de borracha
        document.getElementById('erase-tool').addEventListener('click', () => {
            this.toolManager.toggleEraser();
            this.tilesetManager.render();
        });
        
        // Importar mapa (opcional - adicione um input se necessário)
        const importInput = document.getElementById('import-map');
        if (importInput) {
            importInput.addEventListener('change', async (e) => {
                if (e.target.files[0]) {
                    const success = await this.exportManager.importMap(e.target.files[0]);
                    if (success) {
                        this.layerManager.updateUI();
                        this.mapRenderer.render();
                        alert('Mapa importado com sucesso!');
                    }
                }
            });
        }
    }
    
    createMap() {
        // Limpa camadas existentes
        this.state.layers = [];
        
        // Adiciona camada inicial
        this.layerManager.addLayer('Background');
        
        // Reseta transformações
        this.state.resetMapTransform();
        
        // Renderiza
        this.mapRenderer.resizeCanvas();
        this.mapRenderer.render();
    }
}

// Inicializa o editor quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () => {
    new TileMapEditor();
});