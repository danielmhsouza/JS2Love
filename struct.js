//optional modules
import { physics } from './modules/physics2.js';
import { anim } from './modules/anim.js';
import { particles } from './modules/particles.js';
import { tilemap } from './modules/tilemap.js';

window.love.load = function () {
    //load all you need here
}

window.love.update = function (dt) {
    //update all you need here
}

window.love.draw = function () {
    //draw all you need here
}

// Initialize the game
if (window.love.load) {
    window.love.load();
}