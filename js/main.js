class Main extends BDC {
    constructor() {
        super();
        this.addKeyboardListener(this.scene.canvas);
        this.addTouchListener(this.scene.canvas);
        this.spritesJSON = {};
        this.sprites = new Map();
        this.index = 0;
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
                this.sprites.set(name, new BDC.Sprite(image, 4, 4, 64, 64));
            }));
        });

        return Promise.all(promises);
    }

    afterPreload() {
        const char = this.sprites.get('char');

        char.addAnimation(0, 4);
        char.addAnimation(4, 8);
        char.addAnimation(8, 12);
        char.addAnimation(12, 16);
    }

    getInput(keyStates, touchStates) {
        const char = this.sprites.get('char');

        if (keyStates['KeyW']) {
            this.index = 3;
            char.isAnimating = true;
        }
        else if (keyStates['KeyS']) {
            this.index = 0;
            char.isAnimating = true;
        }
        else if (keyStates['KeyA']) {
            this.index = 1;
            char.isAnimating = true;
        }
        else if (keyStates['KeyD']) {
            this.index = 2;
            char.isAnimating = true;
        }
        else {
            char.stop();
        }
    }

    update() {
        const char = this.sprites.get('char');
        char.play(this.index);
    }

    render(scene) {
        scene.clearScene(new BDC.Color(50));

        const char = this.sprites.get('char');
        char.render(scene, 100, 100);

        const data = this.touchStates.data;

        if (data.length > 0) {
            const rect = this.touchStates.listeningTo.getBoundingClientRect();

            for (let i = 0; i < data.length; i++) {
                const x = Math.round(data[i].clientX - rect.left);
                const y = Math.round(data[i].clientY - rect.top);

                scene.context.fillStyle = 'yellow';
                scene.context.fillRect(x, y, 10, 10);
            }

        }

        this.renderStats(scene.context, new BDC.Color(255));
    }
}

const main = new Main();
main.start();