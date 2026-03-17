/**
 * LayerManager.js
 * Gerencia camadas do mapa e UI de camadas
 */
export class LayerManager {
    constructor(state, listElement) {
        this.state = state;
        this.listElement = listElement;
        this.onLayerChange = null;
    }
    
    /**
     * Adiciona uma nova camada
     */
    addLayer(name) {
        this.state.addLayer(name);
        this.updateUI();
        if (this.onLayerChange) this.onLayerChange();
    }
    
    /**
     * Remove uma camada
     */
    removeLayer(index) {
        if (this.state.removeLayer(index)) {
            this.updateUI();
            if (this.onLayerChange) this.onLayerChange();
        }
    }
    
    /**
     * Alterna visibilidade de uma camada
     */
    toggleVisibility(index) {
        this.state.toggleLayerVisibility(index);
        this.updateUI();
        if (this.onLayerChange) this.onLayerChange();
    }
    
    /**
     * Define camada atual
     */
    setCurrentLayer(index) {
        this.state.currentLayer = index;
        this.updateUI();
    }
    
    /**
     * Atualiza a UI da lista de camadas
     */
    updateUI() {
        this.listElement.innerHTML = '';
        
        this.state.layers.forEach((layer, index) => {
            const div = document.createElement('div');
            div.className = `p-2 border rounded cursor-pointer transition ${
                index === this.state.currentLayer 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'bg-gray-50 hover:bg-gray-100'
            }`;
            
            div.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="font-medium">${layer.name}</span>
                    <div class="flex gap-1">
                        <button class="toggle-visibility p-1 text-sm ${
                            layer.visible ? 'text-green-600' : 'text-gray-400'
                        }" data-layer="${index}" title="${layer.visible ? 'Ocultar' : 'Mostrar'}">
                            👁
                        </button>
                        <button class="delete-layer p-1 text-sm text-red-600 hover:text-red-800" 
                                data-layer="${index}" 
                                title="Deletar camada"
                                ${this.state.layers.length <= 1 ? 'disabled opacity-50' : ''}>
                            🗑
                        </button>
                    </div>
                </div>
            `;
            
            // Click na camada para selecioná-la
            div.addEventListener('click', (e) => {
                if (!e.target.classList.contains('toggle-visibility') && 
                    !e.target.classList.contains('delete-layer')) {
                    this.setCurrentLayer(index);
                }
            });
            
            this.listElement.appendChild(div);
        });
        
        // Event listeners para botões
        this.attachButtonListeners();
    }
    
    /**
     * Anexa event listeners nos botões das camadas
     */
    attachButtonListeners() {
        // Botão de visibilidade
        this.listElement.querySelectorAll('.toggle-visibility').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const layerIndex = parseInt(e.target.dataset.layer);
                this.toggleVisibility(layerIndex);
            });
        });
        
        // Botão de deletar
        this.listElement.querySelectorAll('.delete-layer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const layerIndex = parseInt(e.target.dataset.layer);
                if (confirm(`Deseja realmente deletar a camada "${this.state.layers[layerIndex].name}"?`)) {
                    this.removeLayer(layerIndex);
                }
            });
        });
    }
    
    /**
     * Define callback para mudanças nas camadas
     */
    setChangeCallback(callback) {
        this.onLayerChange = callback;
    }
}
