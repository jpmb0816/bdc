class Main extends BDC {
    constructor() {
        super();
    }

    getInput(keyboard, mouse) {
        if (keyboard.type !== '') {
            console.log(keyboard.type);
        }

        if (mouse.type !== '') {
            console.log(mouse.type);
        }
    }

    update() {

    }

    render(scene) {
        scene.clearScene(new BDC.Color(50));
        this.renderStats(scene.context, new BDC.Color(255));
    }
}

const main = new Main();
main.start();