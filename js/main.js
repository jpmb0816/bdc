class Main extends BDC {
    constructor() {
        super();
        this.addKeyboardListener(this.scene.canvas);
        this.addTouchListener(this.scene.canvas);
        this.spritesJSON = {};
        this.sprites = {};
        this.index = 0;
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
                this.sprites[name] = new BDC.Sprite(image, 4, 4, 64, 64);
            }));
        });

        return Promise.all(promises);
    }

    afterPreload() {
        const char = this.sprites['char'];

        char.addAnimation(0, 4);
        char.addAnimation(4, 8);
        char.addAnimation(8, 12);
        char.addAnimation(12, 16);

        this.buttons.fullscreen = new BDC.Button('Fullscreen', 0, 0, 100, 50, new BDC.Color(255, 0, 0));
        this.buttons.fullscreen.setXAlign('center');
        this.buttons.fullscreen.setYAlign('center');

        this.buttons.mute = new BDC.Button('Mute', 0, 0, 70, 50, new BDC.Color(255, 0, 0));
        this.buttons.mute.setXAlign('right');

        this.buttons.up = new BDC.Button('U', 50, 100, 50, 50, new BDC.Color(255, 0, 0));
        this.buttons.up.setYAlign('bottom');

        this.buttons.down = new BDC.Button('D', 50, 0, 50, 50, new BDC.Color(255, 0, 0));
        this.buttons.down.setYAlign('bottom');

        this.buttons.left = new BDC.Button('L', 0, 50, 50, 50, new BDC.Color(255, 0, 0));
        this.buttons.left.setYAlign('bottom');

        this.buttons.right = new BDC.Button('R', 100, 50, 50, 50, new BDC.Color(255, 0, 0));
        this.buttons.right.setYAlign('bottom');

        this.buttons.a = new BDC.Button('A', 50, 0, 50, 50, new BDC.Color(255, 0, 0));
        this.buttons.a.setXAlign('right');
        this.buttons.a.setYAlign('bottom');

        this.buttons.b = new BDC.Button('B', 0, 0, 50, 50, new BDC.Color(255, 0, 0));
        this.buttons.b.setXAlign('right');
        this.buttons.b.setYAlign('bottom');

        // Listeners
        this.buttons.fullscreen.addOnTouchEndListener(() => {
            this.fullscreen();
            // this.bgm.play();
        });
        this.buttons.mute.addOnTouchEndListener(() => {
            console.log('mute');
            // if (this.isSoundMuted) {
            //     this.isSoundMuted = false;
            //     this.buttons.mute.text = 'Mute';
            //     this.bgm.play();
            // }
            // else {
            //     this.isSoundMuted = true;
            //     this.buttons.mute.text = 'Unmute';
            //     this.bgm.pause();
            // }
        });

        this.buttons.up.addOnTouchStartListener(() => {
            this.index = 3;
            char.isAnimating = true;
        });
        this.buttons.up.addOnTouchEndListener(() => {
            char.stop();
        });

        this.buttons.down.addOnTouchStartListener(() => {
            this.index = 0;
            char.isAnimating = true;
        });
        this.buttons.down.addOnTouchEndListener(() => {
            char.stop();
        });

        this.buttons.left.addOnTouchStartListener(() => {
            this.index = 1;
            char.isAnimating = true;
        });
        this.buttons.left.addOnTouchEndListener(() => {
            char.stop();
        });

        this.buttons.right.addOnTouchStartListener(() => {
            this.index = 2;
            char.isAnimating = true;
        });
        this.buttons.right.addOnTouchEndListener(() => {
            char.stop();
        });

        this.buttons.a.addOnTouchStartListener(() => {
            console.log('A');
        });
        this.buttons.b.addOnTouchStartListener(() => {
            console.log('B')
        });
    }

    getInput(keyStates, touchStates) {
        // const char = this.sprites['char'];
        //
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
        const char = this.sprites['char'];
        const touches = this.touch.states;
        char.play(this.index);

        this.buttons.fullscreen.update(touches);
        this.buttons.mute.update(touches);
        this.buttons.up.update(touches);
        this.buttons.down.update(touches);
        this.buttons.left.update(touches);
        this.buttons.right.update(touches);
        this.buttons.a.update(touches);
        this.buttons.b.update(touches);
    }

    render(scene) {
        scene.clearScene(new BDC.Color(50));

        const char = this.sprites['char'];
        char.render(scene, 100, 100);

        this.touch.states.forEach(touch => {
            scene.context.fillStyle = 'yellow';
            scene.context.fillRect(touch.position.x, touch.position.y, 10, 10);
        });

        this.buttons.fullscreen.render(scene);
        this.buttons.mute.render(scene);
        this.buttons.up.render(scene);
        this.buttons.down.render(scene);
        this.buttons.left.render(scene);
        this.buttons.right.render(scene);
        this.buttons.a.render(scene);
        this.buttons.b.render(scene);

        this.renderStats(scene.context, new BDC.Color(255));
    }

    resizeScene(scene) {
        this.buttons.fullscreen.reposition(scene);
        this.buttons.mute.reposition(scene);
        this.buttons.up.reposition(scene);
        this.buttons.down.reposition(scene);
        this.buttons.left.reposition(scene);
        this.buttons.right.reposition(scene);
        this.buttons.a.reposition(scene);
        this.buttons.b.reposition(scene);
    }
}

const main = new Main();
main.start();