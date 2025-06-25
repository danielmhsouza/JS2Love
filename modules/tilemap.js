// tilemap.js — Módulo de leitura de mapas do Tiled
import { physics } from './physics.js';

export const tilemap = (function () {
    let tilesetImage = null;
    let tileWidth = 0;
    let tileHeight = 0;
    let mapWidth = 0;
    let mapHeight = 0;
    let tilesPerRow = 0;
    let layers = [];
    let colliders = [];

    async function load(tilesetPath, mapJsonPath, callback) {
        // Carrega imagem dos tiles
        tilesetImage = love.graphics.newImage(tilesetPath);

        // Carrega JSON do mapa
        await fetch(mapJsonPath)
            .then(res => res.json())
            .then(map => {
                tileWidth = map.tilewidth;
                tileHeight = map.tileheight;
                mapWidth = map.width;
                mapHeight = map.height;
                layers = map.layers;
                colliders = [];
                
                // Calcula quantos tiles cabem por linha
                tilesPerRow = Math.floor(tilesetImage.width / tileWidth);

                // Processa objetos de colisão
                for (const layer of layers) {
                    if (layer.type === "objectgroup") {
                        for (const obj of layer.objects) {
                            if (obj.width && obj.height) {
                                colliders.push(physics.newBody({
                                    x: obj.x,
                                    y: obj.y,
                                    width: obj.width,
                                    height: obj.height,
                                    shape: 'rectangle',
                                    type: 'static'
                                }));
                            }
                            // Você pode expandir para polygon ou ellipse
                        }
                    }
                }

                if (callback) callback();
            });
    }

    function draw() {
        for (const layer of layers) {
            if (layer.type !== "tilelayer") continue;

            const data = layer.data;
            for (let i = 0; i < data.length; i++) {
                const gid = data[i];
                if (gid === 0) continue;

                const tileX = (i % mapWidth) * tileWidth;
                const tileY = Math.floor(i / mapWidth) * tileHeight;
                const quadX = ((gid - 1) % tilesPerRow) * tileWidth;
                const quadY = Math.floor((gid - 1) / tilesPerRow) * tileHeight;

                const quad = love.graphics.newQuad(
                    quadX, quadY, tileWidth, tileHeight,
                    tilesetImage.width, tilesetImage.height
                );

                love.graphics.draw(tilesetImage, quad, tileX, tileY);
            }
        }
    }

    return {
        load,
        draw,
        getColliders: () => colliders
    };
})();
