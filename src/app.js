// The Game main class
import { Game } from './Game.js';
import Log from './base/Log.js';
import { initialGameOptions } from './options.js';

var app = {

    init() {
        window.GAME = new Game(initialGameOptions);
        GAME.log = new Log();
        GAME.start();
    }

}

window.addEventListener('DOMContentLoaded', () => {
    app.init();
});