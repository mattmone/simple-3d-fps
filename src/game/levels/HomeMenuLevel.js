import {
  FreeCamera,
  Vector3,
  Color4
} from '../../../web_modules/@babylonjs/core.js';
import UI from '../../base/UI.js';
import Level from '../../base/Level.js';

export default class HomeMenuLevel extends Level {

    setupAssets() {
        this.assets.addMusic('music', '/assets/musics/music.mp3');
    }

    buildScene() {

        var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), this.scene);

        // Make this scene transparent to see the document background
        this.scene.clearColor = new Color4(0,0,0,0);
 
        var menu = new UI('homeMenuUI');
        
        menu.addButton('playButton', 'Play Game', {
            'background': 'transparent',
            'color': 'white',
            'onclick': () => GAME.goToLevel('FirstLevel')
        });
        
        menu.addButton('creditsButton', 'Credits', {
            'top': '70px',
            'background': 'transparent',
            'color': 'white',
            'onclick': () => GAME.goToLevel('CreditsLevel')
        });

        document.getElementById('forkMeOnGithub').style.display = 'block';

    }

    onExit() {
        document.getElementById('forkMeOnGithub').style.display = 'none';
    }

}