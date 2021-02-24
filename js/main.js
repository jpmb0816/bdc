class Main extends BDC {
    constructor() {
        super();
        this.addKeyboardListener(this.scene.canvas);
        this.addTouchListener(this.scene.canvas);
        this.images = {};
        this.spritesJSON = {};
        this.buttons = {};
    }

    preloadJSON(promises) {
        promises.push(BDC.loadJSON('json/sprites.json').then(json => {
            this.spritesJSON = json
        }));

        return Promise.all(promises);
    }

    preloadOther(promises) {
        this.spritesJSON['sprites'].forEach(sprite => {
            const name = sprite['name'];
            const path = sprite['sprite_path'];

            promises.push(BDC.loadSprite(path).then(image => {
                this.images[name] = image;
            }));
        });

        return Promise.all(promises);
    }

    afterPreload() {
        this.player = new BDC.Entity(this, 128, 128, 64, 64);

        this.gameMap = new BDC.GameMap(this, 20, 15, 64, 64);
        this.gameMap.entities['player'] = this.player;

        this.camera = new BDC.Camera(this.scene, this.gameMap);
        this.camera.bindedTo = this.player;

        const gap = 20;

        this.buttons['fullscreen'] = new BDC.Button('Fullscreen', gap, gap, 100, 50);
        this.buttons['fullscreen'].setXAlign('right');

        this.buttons['up'] = new BDC.Button('U', 50 + gap, 100 + gap, 50, 50);
        this.buttons['up'].setYAlign('bottom');

        this.buttons['down'] = new BDC.Button('D', 50 + gap, gap, 50, 50);
        this.buttons['down'].setYAlign('bottom');

        this.buttons['left'] = new BDC.Button('L', gap, 50 + gap, 50, 50);
        this.buttons['left'].setYAlign('bottom');

        this.buttons['right'] = new BDC.Button('R', 100 + gap, 50 + gap, 50, 50);
        this.buttons['right'].setYAlign('bottom');

        this.buttons['a'] = new BDC.Button('A', 50 + gap * 2, 50 + gap, 50, 50);
        this.buttons['a'].setXAlign('right');
        this.buttons['a'].setYAlign('bottom');

        this.buttons['b'] = new BDC.Button('B', gap, 50 + gap, 50, 50);
        this.buttons['b'].setXAlign('right');
        this.buttons['b'].setYAlign('bottom');
    }

    getInput(keyStates, touchStates) {
        if (this.buttons['fullscreen'].isTouchEnd) {
            this.fullscreen();
        }

        if (this.buttons['up'].isTouchStart) {
            this.player.move('up');
        }
        else if (this.buttons['down'].isTouchStart) {
            this.player.move('down');
        }
        else if (this.buttons['left'].isTouchStart) {
            this.player.move('left');
        }
        else if (this.buttons['right'].isTouchStart) {
            this.player.move('right');
        }
        else {
            this.player.move('stop');
        }

        // if (keyStates['KeyW']) {
        //     this.index = 3;
        //     char.isAnimating = true;
        // }
        // else if (keyStates['KeyS']) {
        //     this.index = 0;
        //     char.isAnimating = true;
        // }
        // else if (keyStates['KeyA']) {
        //     this.index = 1;
        //     char.isAnimating = true;
        // }
        // else if (keyStates['KeyD']) {
        //     this.index = 2;
        //     char.isAnimating = true;
        // }
        // else {
        //     char.stop();
        // }
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.gameMap.update();

        for (const [name, button] of Object.entries(this.buttons)) {
            button.update(this.touch.states);
        }
    }

    render(scene) {
        scene.clearScene(new BDC.Color(50));

        this.camera.update();
        this.gameMap.render(scene);
        this.camera.stop();

        for (const [name, button] of Object.entries(this.buttons)) {
            button.render(scene);
        }

        for (let i = 0; i < this.touch.states.length; i++) {
            const touch = this.touch.states[i];
            scene.context.fillStyle = 'yellow';
            scene.context.fillRect(touch.position.x, touch.position.y, 10, 10);
        }

        this.renderStats(scene.context, new BDC.Color(255));
    }

    resizeScene(scene) {
        for (const [name, button] of Object.entries(this.buttons)) {
            button.reposition(scene);
        }
    }
}

const main = new Main();
main.start();