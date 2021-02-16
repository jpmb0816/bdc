class BDC {
    constructor() {
        this.lastTime = BDC.getCurrentTimeMillis();
        this.timer = BDC.getCurrentTimeMillis();
        this.totalUpdateDeltaTime = 0;
        this.totalFrameDeltaTime = 0;
        this.updateDeltaTime = 0;
        this.frameDeltaTime = 0;
        this.targetUPS = 60;
        this.targetFPS = 60;
        this.updates = 0;
        this.frames = 0;
        this.UPS = 0;
        this.FPS = 0;
        this.updateTime = 1000 / this.targetUPS;
        this.frameTime = 1000 / this.targetFPS;
        this.interval = undefined;
        this.scene = new BDC.Scene2(320, 320, true);
        this.keyboard = new BDC.KeyboardListener(this.scene.canvas);
        this.mouse = new BDC.MouseListener(this.scene.canvas);
        this.scene.canvas.focus();
    }

    start() {
        if (!this.interval) {
            this.interval = setInterval(() => this.tick(), 0);
        }
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

    getInput(keyboard, mouse) {

    }

    update(deltaTime) {

    }

    render(scene) {

    }

    tick() {
        const currentTime = BDC.getCurrentTimeMillis();
        this.updateDeltaTime = (currentTime - this.lastTime) / this.updateTime;
        this.frameDeltaTime = (currentTime - this.lastTime) / this.frameTime;
        this.totalUpdateDeltaTime += this.updateDeltaTime;
        this.totalFrameDeltaTime += this.frameDeltaTime;
        this.lastTime = currentTime;

        // Update the game based on how many delta time passed
        while (this.totalUpdateDeltaTime > 0) {
            this.getInput(this.keyboard.getData(), this.mouse.getData());
            this.update(this.updateDeltaTime);
            this.totalUpdateDeltaTime--;
            this.updates++;
        }

        // Render the game based on how many delta time passed
        while (this.totalFrameDeltaTime > 0) {
            this.render(this.scene);
            this.totalFrameDeltaTime--;
            this.frames++;
        }

        // Show UPS and FPS
        while (BDC.getCurrentTimeMillis() - this.timer >= 1000) {
            this.FPS = this.frames;
            this.UPS = this.updates;
            this.timer += 1000;
            this.frames = 0;
            this.updates = 0;
        }
    }

    setTargetFPS(targetFPS) {
        this.targetFPS = targetFPS;
        this.frameTime = 1000 / this.targetFPS;
    }

    setTargetUPS(targetUPS) {
        this.targetUPS = targetUPS;
        this.updateTime = 1000 / this.targetUPS;
    }

    renderStats(context, color) {
        context.fillStyle = color;
        context.font = '15px sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('UPS: ' + this.UPS, 20, 20);
        context.fillText('FPS: ' + this.FPS, 20, 40);
    }

    static getCurrentTimeMillis() {
        return new Date().getTime();
    }

    static isMobile() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }
}

BDC.Scene2 = class {
    constructor(width, height, isAppendToBody = false) {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.setWidth(width);
        this.setHeight(height);
        this.context.scale(2, 2);
        this.canvas.tabIndex = 1;

        if (isAppendToBody) {
            document.body.appendChild(this.canvas);
        }
    }

    setWidth(width) {
        this.width = width;
        this.canvas.width = width * 2;
        this.canvas.style.width = width + 'px';
    }

    setHeight(height) {
        this.height = height;
        this.canvas.height = height * 2;
        this.canvas.style.height = height + 'px';
    }

    clearScene(color) {
        if (typeof color === 'undefined') {
            this.context.clearRect(0, 0, this.width, this.height);
        }
        else {
            this.context.fillStyle = color;
            this.context.fillRect(0, 0, this.width, this.height);
        }
    }
}

BDC.Color = class {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = arguments.length === 1 ? r : g;
        this.b = arguments.length === 1 ? r : b;
        this.a = a;
    }

    toString() {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a + ')';
    }
}

BDC.KeyboardListener = class {
    constructor(object) {
        this.object = object;
        this.data = undefined;
        this.eventType = ['keydown', 'keyup'];

        this.object.addEventListener(this.eventType[0], this.eventLogger.bind(this));
        this.object.addEventListener(this.eventType[1], this.eventLogger.bind(this));
    }

    eventLogger(event) {
        const data = {};

        data.type = event.type;
        data.code = event.keyCode;

        this.data = data;
    }

    getData() {
        const data = this.data;
        this.data = undefined;
        return data;
    }
}

BDC.MouseListener = class {
    constructor(object) {
        this.object = object;
        this.data = undefined;
        this.isMobile = BDC.isMobile();
        this.eventType = this.isMobile ? ['touchstart', 'touchend', 'touchmove'] : ['mousedown', 'mouseup', 'mousemove'];

        this.object.addEventListener(this.eventType[0], this.eventLogger.bind(this));
        this.object.addEventListener(this.eventType[1], this.eventLogger.bind(this));
        this.object.addEventListener(this.eventType[2], this.eventLogger.bind(this));
    }

    eventLogger(event) {
        const rect = this.object.getBoundingClientRect();
        const data = {};

        data.type = event.type;
        data.code = event.code;

        if (this.isMobile) {
            if (event.type === this.eventType[1]) {
                data.x = Math.round(event.changedTouches[0].clientX - rect.left);
                data.y = Math.round(event.changedTouches[0].clientY - rect.top);
            }
            else {
                data.x = Math.round(event.touches[0].clientX - rect.left);
                data.y = Math.round(event.touches[0].clientY - rect.top);
            }
        }
        else {
            data.x = Math.round(event.clientX - rect.left);
            data.y = Math.round(event.clientY - rect.top);
        }

        this.data = data;
    }

    getData() {
        const data = this.data;
        this.data = undefined;
        return data;
    }
}