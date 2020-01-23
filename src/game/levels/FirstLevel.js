import {
  PointLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Mesh,
  Color3,
  UniversalCamera,
  SpriteManager,
  Sprite
} from '../../../web_modules/@babylonjs/core.js';
import {
  RoadProceduralTexture
} from '../../../web_modules/@babylonjs/procedural-textures.js';
import * as GUI from '../../../web_modules/@babylonjs/gui.js';
import Enemy from '../Enemy.js';
import UI from '../../base/UI.js';
import Weapon from '../Weapon.js';
import Player from '../Player.js';
import Level from '../../base/Level.js';
import {
  RNG,
  Map
} from '../../../web_modules/rot-js.js';

export class FirstLevel extends Level {

    setProperties() {

        // Menu
        this.menu = null;
        this.weapon = null;
        this.ammoBox = null;

        // Player
        this.player = new Player(this);
        this.playerMesh = null;
        this.playerLife = 100;

        // Enemies
        this.maxEnemies = 10;
        this.currentEnemies = 0;
        this.enemies = [];
        this.enemyDistanceFromCenter = 100;

    }

    setupAssets() {
        this.assets.addAnimatedMesh('rifle', '/src/assets/models/weapons/rifle/rifle.gltf', {
            'normalized': true, // Normalize all rifle animations
            'start': 0,
            'end': 207
        });
        
        this.assets.addMergedMesh('enemy', '/src/assets/models/skull/skull2.obj');

        this.assets.addMusic('music', '/src/assets/musics/music.mp3', {volume: 0.1});
        this.assets.addSound('shotgun', '/src/assets/sounds/shotgun.wav', { volume: 0.4 });
        this.assets.addSound('reload', '/src/assets/sounds/reload.mp3', { volume: 0.4 });
        this.assets.addSound('empty', '/src/assets/sounds/empty.wav', { volume: 0.4 });
        this.assets.addSound('monsterAttack', '/src/assets/sounds/monster_attack.wav', { volume: 0.3 });
        this.assets.addSound('playerDamaged', '/src/assets/sounds/damage.wav', { volume: 0.3 });
        
    }

    buildScene() {
        
        this.scene.clearColor = new Color3.FromHexString('#777');
        
        this.scene.gravity = new Vector3(0, -9.81, 0);
        this.scene.collisionsEnabled = true;

        // Create and set the active camera
        this.camera = this.createCamera();
        this.scene.activeCamera = this.camera;
        this.enablePointerLock();
        
        this.createGround();
        this.createWall();
        this.addWeapon();
        
        this.addEnemies();

        this.createHUD();
        this.createMenu();
        
        setInterval(() => {
            this.addEnemies();
        }, 1000 * 25);

        this.setupEventListeners();

        this.player.startTimeCounter();
    }

    createGround() {
        let ground = Mesh.CreateGround('ground',  1000,  1000, 2, this.scene);
        ground.checkCollisions = true;
        
        let groundMaterial = new StandardMaterial('groundMaterial', this.scene);
        groundMaterial.diffuseTexture = new Texture('/src/assets/images/sand.jpg', this.scene);
        groundMaterial.specularColor = new Color3(0, 0, 0);

        ground.material = groundMaterial;
    }
    createWall(start, end) {

      let wall = MeshBuilder.CreateBox('wall', {height: 50, width: 1000, depth: 8}, this.scene);
      wall.checkCollisions = true;

      let wallMaterial = new StandardMaterial('wallMaterial', this.scene);
      let wallTexture = new RoadProceduralTexture('wallTexture', 1024, this.scene);
      wallMaterial.diffuseTexture = wallTexture;
      wall.material = wallMaterial;
      wall.rotation.y = Math.PI/180 * 90;
      wall.position = new Vector3(500, 0, 0);
    }

    addWeapon() {
        this.weapon = new Weapon(this);
        this.weapon.create();
    }

    addEnemies() {
        
        // Let's remove unnecessary enemies to prevent performance issues
        this.removeUnnecessaryEnemies();

        let quantityOfEnemiesToCreate = this.maxEnemies - this.currentEnemies;

        for(var enemiesQuantity = 0; enemiesQuantity < quantityOfEnemiesToCreate; enemiesQuantity++) {
            let enemy = new Enemy(this).create();

            this.enemies.push(enemy);
            this.currentEnemies++;
        }

        // Increasing the quantity of max enemies
        this.maxEnemies += 1;
        this.enemyDistanceFromCenter += 10;
    }

    removeUnnecessaryEnemies() {
        let enemiesQuantity = this.enemies.length;

        for(var i = 0; i < enemiesQuantity; i++) {
            if(this.enemies[i] && !this.enemies[i].mesh) {
                this.enemies.splice(i, 1);
            }
        }
    }

    setupEventListeners() {
        GAME.canvas.addEventListener('click', () => {
            if(this.weapon) {
                this.weapon.fire();
            }
        }, false);
    }

    createHUD() {
        var hud = new UI('levelUI');
        
        hud.addImage('gunsight', '/src/assets/images/gunsight.png', {
            'width': 0.05,
            'height': 0.05
        });

        this.lifeTextControl = hud.addText('Life: ' + this.playerLife, {
            'top': '10px',
            'left': '10px',
            'horizontalAlignment': GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
        });

        this.ammoTextControl = hud.addText('Ammo: ' + this.weapon.ammo, {
            'top': '10px',
            'left': '10px',
            'horizontalAlignment': GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
        });

        this.hitsTextControl = hud.addText('Hits: ' + this.player.hits, {
            'top': '10px',
            'left': '-10px',
            'horizontalAlignment': GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
        });
    }

    createMenu() {
        this.menu = new UI('runnerMenuUI');

        this.pointsTextControl = this.menu.addText('Points: 0', {
            'top': '-200px',
            'outlineWidth': '2px',
            'fontSize': '40px',
            'verticalAlignment': GUI.Control.VERTICAL_ALIGNMENT_CENTER
        });

        this.currentRecordTextControl = this.menu.addText('Current Record: 0', {
            'top': '-150px',
            'verticalAlignment': GUI.Control.VERTICAL_ALIGNMENT_CENTER
        });

        this.hasMadeRecordTextControl = this.menu.addText('You got a new Points Record!', {
            'top': '-100px',
            'color': GAME.options.recordTextColor,
            'fontSize': '20px',
            'verticalAlignment': GUI.Control.VERTICAL_ALIGNMENT_CENTER
        });

        this.gameOverTextControl = this.menu.addText('GAME OVER', {
            'top': '-60px',
            'color': GAME.options.recordTextColor,
            'fontSize': '25px',
            'verticalAlignment': GUI.Control.VERTICAL_ALIGNMENT_CENTER
        });

        this.menu.addButton('replayButton', 'Replay Game', {
            'onclick': () => this.replay() 
        });

        this.menu.addButton('backButton', 'Return to Home', {
            'top': '70px',
            'onclick': () => GAME.goToLevel('HomeMenuLevel')
        });

        this.menu.hide();
    }

    createCamera() {
        var camera = new UniversalCamera("UniversalCamera", new Vector3(0, 3.5, 100), this.scene);
        camera.setTarget(new Vector3(0,2,0));
        
        camera.attachControl(GAME.canvas, true);
        
        camera.applyGravity = true;
        camera.ellipsoid = new Vector3(1, 1.7, 1);
        camera.checkCollisions = true;
        camera._needMoveForGravity = true;

        this.addEnemies();

        // Reducing the minimum visible FOV to show the Weapon correctly 
        camera.minZ = 0;

        // Remap keys to move with WASD
        camera.keysUp = [87, 38]; // W or UP Arrow
        camera.keysDown = [83, 40]; // S or DOWN ARROW
        camera.keysLeft = [65, 37]; // A or LEFT ARROW
        camera.keysRight = [68, 39]; // D or RIGHT ARROW

        camera.inertia = 0.1;
        camera.angularSensibility = 800;
        camera.speed = 17;
        
        camera.onCollide = (collidedMesh) => {
            if(collidedMesh.id == 'ammoBox') {
                this.weapon.reload();
                collidedMesh.dispose();
                collidedMesh.arrow.dispose();
            }
        }
        
        return camera;
    }

    playerWasAttacked() {
        this.playerLife -= 5;
        
        if(this.playerLife <= 0) {
            this.playerLife = 0;
            this.lifeTextControl.text = 'Life: ' + this.playerLife;

            this.gameOver();

            return;
        }
        
        this.lifeTextControl.text = 'Life: ' + this.playerLife;
        this.assets.getSound('playerDamaged').play();
    }

    playerHitEnemy() {
        this.currentEnemies--;
        this.player.hits++;
        this.hitsTextControl.text = 'Hits: ' + this.player.hits;
    }

    ammoIsOver() {
        // Create a new ammo package that, if collided, recharge the ammo
        this.addAmmoBox();
    }

    addAmmoBox() {
        this.ammoBox = MeshBuilder.CreateBox(
            'ammoBox', 
            { 'width': 4, 'height': 2, 'depth': 2 }, 
            this.scene
        );
        
        this.ammoBox.position.x = 0;
        this.ammoBox.position.y = 1;
        this.ammoBox.position.z = 0;

        this.ammoBox.checkCollisions = true;
        
        // Let's add a green arrow to show where is the ammo box
        var arrowSpriteManager = new SpriteManager('arrowSpriteManager','assets/images/arrow.png', 1, 256, this.scene);
        this.ammoBox.arrow = new Sprite('arrow', arrowSpriteManager);
        this.ammoBox.arrow.position.y = 5;
        this.ammoBox.arrow.size = 4;
    }

    updateStats() {
        this.lifeTextControl.text = 'Life: ' + this.playerLife;
        this.ammoTextControl.text = 'Ammo: ' + this.weapon.ammo;
        this.hitsTextControl.text = 'Hits: ' + this.player.hits;
    }

    gameOver() {
        GAME.pause();
        
        this.player.stopTimeCounter();
        this.player.calculatePoints();
        
        this.showMenu();
        this.exitPointerLock();
        this.enemies.forEach(enemy => enemy.remove());
        this.removeUnnecessaryEnemies();
        
        if(this.ammoBox) {
            this.ammoBox.dispose();
            this.ammoBox.arrow.dispose();
        }
    }

    showMenu() {
        this.pointsTextControl.text = 'Points: ' + this.player.getPoints();
        this.currentRecordTextControl.text = 'Current Record: ' + this.player.getLastRecord();
        this.menu.show();

        if(this.player.hasMadePointsRecord()) {
            this.hasMadeRecordTextControl.isVisible = true;
        } else {
            this.hasMadeRecordTextControl.isVisible = false;
        }
    }

    replay() {
        this.playerLife = 100;
        this.player.hits = 0;

        this.maxEnemies = 10;
        this.currentEnemies = 0;
        this.enemies = [];
        this.enemyDistanceFromCenter = 100;

        this.updateStats();
        GAME.resume();
        this.menu.hide();

        this.camera.position = new Vector3(0, 3.5, 100);
        this.weapon.reload();
        this.addEnemies();

        this.player.startTimeCounter();
    }
    
    beforeRender() {
        if(!GAME.isPaused()) {
            this.weapon.controlFireRate();
            this.enemies.forEach(enemy => enemy.move());
            if(!this.light) {
              this.light = new PointLight("pointLight", this.camera.position, this.scene);
              this.light.intensity = 0.5;
              this.light.range = 100;
              this.light.specular = new Color3(1, 0.2, 0);
              this.light.diffuse = new Color3(1, 0.5, 0);
              this.frame = 0;
            } else {
              this.light.position = this.camera.position;
              this.frame++;
              if(this.frame % 20 === 0)
                this.light.diffuse = new Color3(1, (Math.random()*0.3)+0.4, 0);
            }

            if(this.camera.position.y < -20) {
                this.gameOver();
            }
        }
    }

}