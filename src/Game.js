import { Engine } from '../web_modules/@babylonjs/core.js';
// Base
import Helper from './base/Helper.js';

// Game Levels
import HomeMenuLevel from './game/levels/HomeMenuLevel.js';

export class Game {

    constructor(options = {}) {

        /**
         * Sets game options
         */
        this.options = options;

        /**
         * Keyboard pressed keys
         */
        this.keys = {};

        /**
         * Is game paused?
         */
        this.paused = false;

        /**
         * Helper methods
         */
        this.helper = new Helper();

        /**
         * Starts the BABYLON engine on the Canvas element
         */
        this.canvas = document.getElementById("renderCanvas");

        this.engine = new Engine(this.canvas, true);

        this.currentLevel = null;
        this.currentLevelName = 'HomeMenuLevel';
        this.levels = {
            'HomeMenuLevel': async _ => new HomeMenuLevel(),
            'CreditsLevel': async _ => {
              const { CreditsLevel } = await import('./game/levels/CreditsLevel.js')
              return new CreditsLevel();
             },
            'FirstLevel': async _ => {
              const { FirstLevel } = await import('./game/levels/FirstLevel.js')
              return new FirstLevel();
             }
        };

    }
    init() {
      
    }
    start() {
        this.listenKeys();
        this.startLevel();
        this.listenOtherEvents();
    }

    pause() {
        this.paused = true;
    }

    isPaused() {
        return this.paused;
    }

    resume() {
        this.paused = false;
    }

    listenKeys() {
        
        document.addEventListener('keydown', keyDown.bind(this));
        document.addEventListener('keyup', keyUp.bind(this));
    
        this.keys.up = false;
        this.keys.down = false;
        this.keys.left = false;
        this.keys.right = false;

        function keyDown(e) {
            if (e.keyCode == 87 || e.keyCode == 38) {//Arrow Up
                this.keys.up = 1;
                
            }else if (e.keyCode == 83 || e.keyCode == 40) {//Arrow Down
                this.keys.down = 1;
                
            } else if (e.keyCode == 65 || e.keyCode == 37) {//Arrow Left
                this.keys.left = 1;
                
            } else if (e.keyCode == 68 || e.keyCode == 39) {//Arrow Right
                this.keys.right = 1;
            }
        }

        function keyUp(e) {
            if (e.keyCode == 87 || e.keyCode == 38) {//Arrow Up
                this.keys.up = 0;
            }else if (e.keyCode == 83 || e.keyCode == 40) {//Arrow Down
                this.keys.down = 0;
            } else if (e.keyCode == 65 || e.keyCode == 37) {//Arrow Left
                this.keys.left = 0;
            } else if (e.keyCode == 68 || e.keyCode == 39) {//Arrow Right
                this.keys.right = 0;
            }
        }
    }


    listenOtherEvents() {
        window.addEventListener('blur', () => {
            this.pause();
        });

        window.addEventListener('focus', () => {
            this.resume();
        });

        window.addEventListener('resize', () => { 
            this.engine.resize();
        });
    }

    goToLevel(levelName) {

        if(!this.levels[levelName]) {
            console.error('A level with name ' + levelName + ' does not exists');
            return;
        }

        if(this.currentLevel) {
            this.currentLevel.exit();
        }

        this.currentLevelName = levelName;
        this.startLevel();
    }

    async startLevel() {

        this.currentLevel = await this.levels[this.currentLevelName]();
        this.currentLevel.start();

    }

    render() {
        this.startRenderLoop();
    }

    startRenderLoop() {
        setTimeout(() => {
            this.engine.runRenderLoop(() => {
                this.currentLevel.scene.render();
            });
        }, 50);
    }

    stopRenderLoop() {
        this.engine.stopRenderLoop();
    }

    isMobile() {
        if( navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)) {
            return true;
        }

        return false;
    }

}