class TileMapEditor {
    constructor() {
        this.tileset = null;
        this.tilesetImage = null;
        this.tileWidth = 32;
        this.tileHeight = 32;
        this.mapWidth = 20;
        this.mapHeight = 15;
        this.layers = [];
        this.currentLayer = 0;
        this.selectedTile = { x: 0, y: 0 };
        this.isDrawing = false;
        this.isErasing = false;

        // Propriedades para Pan e Zoom do Tileset
        this.tilesetPanX = 0;
        this.tilesetPanY = 0;
        this.tilesetZoom = 1;
        this.isPanningTileset = false;
        this.lastTilesetPanX = 0;
        this.lastTilesetPanY = 0;

        // Propriedades para Pan e Zoom do Mapa
        this.mapPanX = 0;
        this.mapPanY = 0;
        this.mapZoom = 1;
        this.isPanningMap = false;
        this.lastMapPanX = 0;
        this.lastMapPanY = 0;

        this.canvasWidth = 800;
        this.canvasHeight = 600;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createMap(); // Garante que o mapa seja criado ao iniciar
        this.updateCursor(); // Define o cursor inicial
        window.addEventListener('resize', () => {
            this.resizeMapCanvas();
            this.renderMap();
        });
    }

    setupEventListeners() {
        document.getElementById('tileset-input').addEventListener('change', (e) => {
            this.loadTileset(e.target.files[0]);
        });

        document.getElementById('tile-width').addEventListener('change', (e) => {
            this.tileWidth = parseInt(e.target.value);
            this.updateTilesetCanvas();
            this.renderMap(); // Re-renderiza o mapa também com o novo tamanho do tile
        });

        document.getElementById('tile-height').addEventListener('change', (e) => {
            this.tileHeight = parseInt(e.target.value);
            this.updateTilesetCanvas();
            this.renderMap(); // Re-renderiza o mapa também com o novo tamanho do tile
        });

        document.getElementById('map-width').addEventListener('change', (e) => {
            this.mapWidth = parseInt(e.target.value);
        });

        document.getElementById('map-height').addEventListener('change', (e) => {
            this.mapHeight = parseInt(e.target.value);
        });

        document.getElementById('create-map').addEventListener('click', () => {
            this.createMap();
        });

        document.getElementById('add-layer').addEventListener('click', () => {
            const name = document.getElementById('layer-name').value || `Layer ${this.layers.length + 1}`;
            this.addLayer(name);
            document.getElementById('layer-name').value = '';
        });

        document.getElementById('export-map').addEventListener('click', (e) => { // e passado para a função
            this.exportMap(e); // Passa o evento para a função exportMap
        });

        document.getElementById('erase-tool').addEventListener('click', () => {
            this.toggleEraser();
        });

        const tilesetCanvas = document.getElementById('tileset-canvas');
        tilesetCanvas.addEventListener('click', (e) => {
            this.selectTile(e);
        });

        // Eventos de Pan e Zoom para o Tileset Canvas
        tilesetCanvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Botão esquerdo do mouse para seleção de tiles
                this.selectTile(e);
            } else if (e.button === 1) { // Botão do meio do mouse para pan
                this.isPanningTileset = true;
                this.lastTilesetPanX = e.clientX;
                this.lastTilesetPanY = e.clientY;
                tilesetCanvas.style.cursor = 'grabbing';
            }
        });

        tilesetCanvas.addEventListener('mousemove', (e) => {
            if (this.isPanningTileset) {
                const dx = e.clientX - this.lastTilesetPanX;
                const dy = e.clientY - this.lastTilesetPanY;
                this.tilesetPanX += dx;
                this.tilesetPanY += dy;
                this.lastTilesetPanX = e.clientX;
                this.lastTilesetPanY = e.clientY;
                this.updateTilesetCanvas();
            }
        });

        tilesetCanvas.addEventListener('mouseup', () => {
            this.isPanningTileset = false;
            tilesetCanvas.style.cursor = ''; // Volta ao cursor padrão ou crosshair se tiver um
        });

        tilesetCanvas.addEventListener('mouseleave', () => {
            this.isPanningTileset = false;
            tilesetCanvas.style.cursor = ''; // Volta ao cursor padrão ou crosshair se tiver um
        });

        tilesetCanvas.addEventListener('wheel', (e) => {
            e.preventDefault(); // Impede o scroll da página
            const scaleAmount = 1.1;
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;

            // Calcula a posição do mouse no canvas com o zoom atual
            const currentZoomedX = (mouseX - this.tilesetPanX) / this.tilesetZoom;
            const currentZoomedY = (mouseY - this.tilesetPanY) / this.tilesetZoom;

            if (e.deltaY < 0) { // Zoom in
                this.tilesetZoom *= scaleAmount;
            } else { // Zoom out
                this.tilesetZoom /= scaleAmount;
            }

            // Garante que o zoom não seja muito pequeno
            this.tilesetZoom = Math.max(0.1, this.tilesetZoom);

            // Recalcula o pan para que o ponto sob o mouse permaneça fixo
            this.tilesetPanX = mouseX - currentZoomedX * this.tilesetZoom;
            this.tilesetPanY = mouseY - currentZoomedY * this.tilesetZoom;

            this.updateTilesetCanvas();
        });


        const mapCanvas = document.getElementById('map-canvas');
        mapCanvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Botão esquerdo do mouse para desenho
                this.isDrawing = true;
                this.drawTile(e);
            } else if (e.button === 1) { // Botão do meio do mouse para pan
                this.isPanningMap = true;
                this.lastMapPanX = e.clientX;
                this.lastMapPanY = e.clientY;
                mapCanvas.style.cursor = 'grabbing';
            }
        });

        mapCanvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                this.drawTile(e);
            } else if (this.isPanningMap) {
                const dx = e.clientX - this.lastMapPanX;
                const dy = e.clientY - this.lastMapPanY;
                this.mapPanX += dx;
                this.mapPanY += dy;
                this.lastMapPanX = e.clientX;
                this.lastMapPanY = e.clientY;
                this.renderMap();
            }
        });

        mapCanvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
            this.isPanningMap = false;
            this.updateCursor(); // Restaura o cursor após pan
        });

        mapCanvas.addEventListener('mouseleave', () => {
            this.isDrawing = false;
            this.isPanningMap = false;
            this.updateCursor(); // Restaura o cursor após pan
        });

        mapCanvas.addEventListener('wheel', (e) => {
            e.preventDefault(); // Impede o scroll da página
            const scaleAmount = 1.1;
            const mapRect = mapCanvas.getBoundingClientRect();
            const mouseX = e.clientX - mapRect.left;
            const mouseY = e.clientY - mapRect.top;

            // Calcula a posição do mouse no canvas com o zoom e pan atual
            const currentZoomedX = (mouseX - this.mapPanX) / this.mapZoom;
            const currentZoomedY = (mouseY - this.mapPanY) / this.mapZoom;

            if (e.deltaY < 0) { // Zoom in
                this.mapZoom *= scaleAmount;
            } else { // Zoom out
                this.mapZoom /= scaleAmount;
            }

            // Garante que o zoom não seja muito pequeno
            this.mapZoom = Math.max(0.1, this.mapZoom);

            // Recalcula o pan para que o ponto sob o mouse permaneça fixo
            this.mapPanX = mouseX - currentZoomedX * this.mapZoom;
            this.mapPanY = mouseY - currentZoomedY * this.mapZoom;

            this.renderMap();
        });
    }

    loadTileset(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.tilesetImage = img;
                // Resetar pan e zoom ao carregar um novo tileset
                this.tilesetPanX = 0;
                this.tilesetPanY = 0;
                this.tilesetZoom = 1;
                this.updateTilesetCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    updateTilesetCanvas() {
        if (!this.tilesetImage) return;
        const canvas = document.getElementById('tileset-canvas');
        const ctx = canvas.getContext('2d');

        // Definir o tamanho intrínseco do canvas para o tamanho real da imagem
        canvas.width = this.tilesetImage.width;
        canvas.height = this.tilesetImage.height;

        // Limpar o canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Salvar o estado original do contexto
        ctx.save();

        // Aplicar transformações de pan e zoom
        ctx.translate(this.tilesetPanX, this.tilesetPanY);
        ctx.scale(this.tilesetZoom, this.tilesetZoom);

        // Desenhar a imagem do tileset
        ctx.drawImage(this.tilesetImage, 0, 0);

        // Desenhar as grades
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 1 / this.tilesetZoom; // Ajustar a espessura da linha para o zoom
        for (let x = 0; x < this.tilesetImage.width; x += this.tileWidth) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.tilesetImage.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.tilesetImage.height; y += this.tileHeight) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.tilesetImage.width, y);
            ctx.stroke();
        }

        // Desenhar o retângulo de seleção do tile
        if (this.selectedTile.x !== -1 && this.selectedTile.y !== -1) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3 / this.tilesetZoom; // Ajustar a espessura da linha para o zoom
            ctx.strokeRect(
                this.selectedTile.x * this.tileWidth,
                this.selectedTile.y * this.tileHeight,
                this.tileWidth,
                this.tileHeight
            );
        }

        // Restaurar o estado do contexto
        ctx.restore();
    }

    toggleEraser() {
        this.isErasing = !this.isErasing;
        const eraseButton = document.getElementById('erase-tool');
        if (this.isErasing) {
            eraseButton.classList.remove('bg-red-500'); // Remove a cor normal
            eraseButton.classList.add('bg-red-700', 'text-white'); // Adiciona a cor de ativado e texto branco
            this.selectedTile = { x: -1, y: -1 }; // Desseleciona o tile
            this.updateTilesetCanvas();
        } else {
            eraseButton.classList.remove('bg-red-700', 'text-white'); // Remove a cor de ativado e texto branco
            eraseButton.classList.add('bg-red-500'); // Adiciona a cor normal
            // Opcional: Re-selecionar o primeiro tile ou um default se quiser
            this.selectedTile = { x: 0, y: 0 };
            this.updateTilesetCanvas();
        }
        this.updateCursor();
    }

    selectTile(e) {
        if (!this.tilesetImage) return;

        const canvas = document.getElementById('tileset-canvas');
        const rect = canvas.getBoundingClientRect();

        // Obter coordenadas relativas ao canvas, corrigindo por escala visual
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        this.selectedTile.x = Math.floor(x / this.tileWidth);
        this.selectedTile.y = Math.floor(y / this.tileHeight);

        const tilesetTilesX = Math.floor(this.tilesetImage.width / this.tileWidth);
        const tilesetTilesY = Math.floor(this.tilesetImage.height / this.tileHeight);

        if (
            this.selectedTile.x < 0 || this.selectedTile.x >= tilesetTilesX ||
            this.selectedTile.y < 0 || this.selectedTile.y >= tilesetTilesY
        ) {
            this.selectedTile = { x: -1, y: -1 }; // fora dos limites
        }

        this.updateTilesetCanvas();

        if (this.isErasing) {
            this.toggleEraser();
        }
    }


    resizeMapCanvas() {
        const mapContainer = document.querySelector('.flex-1.p-4.overflow-auto');
        if (mapContainer) {
            const canvas = document.getElementById('map-canvas');
            // Calcula a largura máxima baseada no container pai
            const maxWidth = mapContainer.offsetWidth - (parseInt(getComputedStyle(mapContainer).paddingLeft) + parseInt(getComputedStyle(mapContainer).paddingRight));

            // Mantém a proporção do mapa ou define um tamanho máximo
            canvas.width = Math.min(this.mapWidth * this.tileWidth * this.mapZoom, maxWidth); // Ajusta para o zoom
            canvas.height = (canvas.width / (this.mapWidth * this.tileWidth * this.mapZoom)) * (this.mapHeight * this.tileHeight * this.mapZoom); // Mantém a proporção
        }
    }

    createMap() {
        const canvas = document.getElementById('map-canvas');
        canvas.width = this.canvasWidth || 800;
        canvas.height = this.canvasHeight || 600;
        if (this.layers.length === 0) {
            this.addLayer('Background');
        }
        // Resetar pan e zoom do mapa ao criar um novo mapa
        this.mapPanX = 0;
        this.mapPanY = 0;
        this.mapZoom = 1;
        this.resizeMapCanvas(); // Adicione isso aqui
        this.renderMap();
    }

    addLayer(name) {
        const layer = {
            name: name,
            visible: true,
            data: new Array(this.mapWidth * this.mapHeight).fill(-1)
        };
        this.layers.push(layer);
        this.updateLayersList();
    }

    updateLayersList() {
        const list = document.getElementById('layers-list');
        list.innerHTML = '';
        this.layers.forEach((layer, index) => {
            const div = document.createElement('div');
            div.className = `p-2 border rounded ${index === this.currentLayer ? 'bg-blue-100 border-blue-300' : 'bg-gray-50'}`;
            div.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-medium">${layer.name}</span>
          <div class="flex gap-1">
            <button class="toggle-visibility p-1 text-sm ${layer.visible ? 'text-green-600' : 'text-gray-400'}" data-layer="${index}">👁</button>
            <button class="delete-layer p-1 text-sm text-red-600" data-layer="${index}">🗑</button>
          </div>
        </div>
      `;
            div.addEventListener('click', (e) => {
                if (!e.target.classList.contains('toggle-visibility') && !e.target.classList.contains('delete-layer')) {
                    this.currentLayer = index;
                    this.updateLayersList();
                }
            });
            list.appendChild(div);
        });
        document.querySelectorAll('.toggle-visibility').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const layerIndex = parseInt(e.target.dataset.layer);
                this.layers[layerIndex].visible = !this.layers[layerIndex].visible;
                this.updateLayersList();
                this.renderMap();
            });
        });
        document.querySelectorAll('.delete-layer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const layerIndex = parseInt(e.target.dataset.layer);
                if (this.layers.length > 1) {
                    this.layers.splice(layerIndex, 1);
                    if (this.currentLayer >= this.layers.length) {
                        this.currentLayer = this.layers.length - 1;
                    }
                    this.updateLayersList();
                    this.renderMap();
                }
            });
        });
    }

    updateCursor() {
        const mapCanvas = document.getElementById('map-canvas');
        if (this.isErasing) {
            mapCanvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><path fill=\'red\' d=\'M10 2l-2 2h-4v2h2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-16h2v-2h-4l-2-2h-6zm-1 4h14v16h-14v-16zm2 2v12h2v-12h-2zm4 0v12h2v-12h-2zm4 0v12h2v-12h-2z\'/></svg>") 16 16, auto'; // Um ícone de borracha (exemplo SVG)
        } else if (this.isPanningMap) {
            mapCanvas.style.cursor = 'grabbing';
        }
        else {
            mapCanvas.style.cursor = 'crosshair'; // Cursor padrão para desenho
        }
    }

    drawTile(e) {
        if (!this.tilesetImage || this.layers.length === 0) return;
        const canvas = document.getElementById('map-canvas');
        const rect = canvas.getBoundingClientRect();

        // Calcular a posição do clique no mapa considerando o pan e o zoom
        const clientX = e.clientX;
        const clientY = e.clientY;

        const x = Math.floor(((clientX - rect.left - this.mapPanX) / this.mapZoom) / this.tileWidth);
        const y = Math.floor(((clientY - rect.top - this.mapPanY) / this.mapZoom) / this.tileHeight);

        if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
            let tileIndex;
            if (this.isErasing) {
                tileIndex = -1; // Apaga o tile
            } else {
                tileIndex = this.selectedTile.y * Math.floor(this.tilesetImage.width / this.tileWidth) + this.selectedTile.x;
            }
            const mapIndex = y * this.mapWidth + x;
            // Certifique-se de que o tileIndex seja diferente do que já está lá para evitar re-renderizações desnecessárias
            if (this.layers[this.currentLayer].data[mapIndex] !== tileIndex) {
                this.layers[this.currentLayer].data[mapIndex] = tileIndex;
                this.renderMap();
            }
        }
    }

    renderMap() {
        const canvas = document.getElementById('map-canvas');
        const ctx = canvas.getContext('2d');

        // Definir o tamanho intrínseco do canvas baseado no mapa e no zoom
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Salvar o estado original do contexto
        ctx.save();

        // Aplicar transformações de pan e zoom
        ctx.translate(this.mapPanX, this.mapPanY);
        ctx.scale(this.mapZoom, this.mapZoom);

        // Desenhar as grades do mapa
        ctx.strokeStyle = 'rgba(230, 224, 224, 0.1)';
        ctx.lineWidth = 1 / this.mapZoom; // Ajusta a espessura da linha
        for (let x = 0; x <= this.mapWidth; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.tileWidth, 0);
            ctx.lineTo(x * this.tileWidth, this.mapHeight * this.tileHeight);
            ctx.stroke();
        }
        for (let y = 0; y <= this.mapHeight; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.tileHeight);
            ctx.lineTo(this.mapWidth * this.tileWidth, y * this.tileHeight);
            ctx.stroke();
        }

        this.layers.forEach(layer => {
            if (!layer.visible || !this.tilesetImage) return;
            for (let y = 0; y < this.mapHeight; y++) {
                for (let x = 0; x < this.mapWidth; x++) {
                    const mapIndex = y * this.mapWidth + x;
                    const tileIndex = layer.data[mapIndex];
                    if (tileIndex >= 0) {
                        const tilesPerRow = Math.floor(this.tilesetImage.width / this.tileWidth);
                        const tileX = tileIndex % tilesPerRow;
                        const tileY = Math.floor(tileIndex / tilesPerRow);
                        ctx.drawImage(
                            this.tilesetImage,
                            tileX * this.tileWidth,
                            tileY * this.tileHeight,
                            this.tileWidth,
                            this.tileHeight,
                            x * this.tileWidth,
                            y * this.tileHeight,
                            this.tileWidth,
                            this.tileHeight
                        );
                    }
                }
            }
        });

        // Restaurar o estado do contexto
        ctx.restore();
    }

    exportMap(e) {
        const mapData = {
            width: this.mapWidth,
            height: this.mapHeight,
            tileWidth: this.tileWidth,
            tileHeight: this.tileHeight,
            layers: this.layers.map(layer => ({
                name: layer.name,
                visible: layer.visible,
                data: layer.data
            }))
        };
        const dataStr = JSON.stringify(mapData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = document.getElementById('map-name').value || 'tilemap.json';
        link.click();
        URL.revokeObjectURL(url);
        e.preventDefault(); // Previne o comportamento padrão do link
        alert('Mapa exportado com sucesso!'); // Mensagem de sucesso
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new TileMapEditor();
});