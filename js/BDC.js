// BDC Game Engine
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
        this.scene.canvas.focus();

        this.keyStates = {
            data: {},
            listeningTo: undefined,
            eventTypes: ['keydown', 'keyup']
        };
        this.touchStates = {
            data: [],
            listeningTo: undefined,
            eventTypes: (BDC.isMobile() ? ['touchstart', 'touchend', 'touchmove'] : ['mousedown', 'mouseup', 'mousemove']),
        };

        this.isInitialized = false;
        this.isPreloaded = false;
    }

    addKeyboardListener(object) {
        if (typeof this.keyStates.listeningTo === 'undefined') {
            this.keyStates.listeningTo = object;
            this.scene.canvas.addEventListener(this.keyStates.eventTypes[0], this.keyEventLogger.bind(this));
            this.scene.canvas.addEventListener(this.keyStates.eventTypes[1], this.keyEventLogger.bind(this));
        }
    }

    keyEventLogger(event) {
        this.keyStates.data[event.code] = (event.type === 'keydown');
    }

    addTouchListener(object) {
        if (typeof this.touchStates.listeningTo === 'undefined') {
            this.touchStates.listeningTo = object;
            object.addEventListener(this.touchStates.eventTypes[0], this.touchEventListener.bind(this));
            object.addEventListener(this.touchStates.eventTypes[1], this.touchEventListener.bind(this));
            object.addEventListener(this.touchStates.eventTypes[2], this.touchEventListener.bind(this));
        }
    }

    touchEventListener(event) {
        if (BDC.isMobile()) {
            this.touchStates.data = event.touches;
        }
        else {
            this.touchStates.data = [];
            this.touchStates.data.push(event);
        }
    }

    start() {
        if (!this.interval) {
            if (this.isPreloaded) {
                this.interval = setInterval(() => this.tick(), 0);
            }
            else {
                this.isPreloaded = true;
                this.preloadJSON([]).then(() => {
                    this.preloadOther([]).then(() => {
                        if (!this.isInitialized) {
                            this.isInitialized = true;
                            this.afterPreload();
                        }

                        this.interval = setInterval(() => this.tick(), 0)
                    });
                }).catch(error => console.error(error));
            }
        }
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

    preloadJSON(promises) {

    }

    preloadOther(promises) {

    }

    afterPreload() {

    }

    getInput(keyStates) {

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
            this.getInput(this.keyStates.data, this.touchStates.data);
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

    static random(min, max) {
        if (typeof max === 'undefined') {
            max = min;
            min = 0;
        }

        return Math.random() * (max - min) + min;
    }

    static clamp(val, min, max) {
        if (val < min) {
            return min;
        }
        else if (val > max) {
            return max;
        }

        return val;
    }

    static radians(degree) {
        return degree * Math.PI / 180;
    }

    static fromAngle(angle, length) {
        if (typeof length === 'undefined') {
            length = 1;
        }

        return new BDC.Vector(length * Math.cos(angle), length * Math.sin(angle));
    }

    static scaleValue(v, s1, e1, s2, e2) {
        return (v - s1) / (e1 - s1) * (e2 - s2) + s2;
    }

    static loadSprite(url) {
        return new Promise(resolve => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.src = url;
        });
    }

    static loadJSON(url) {
        return new Promise(resolve => {
            const xmlHttp = new XMLHttpRequest();

            xmlHttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    const json = JSON.parse(this.responseText);
                    resolve(json);
                }
            };

            xmlHttp.open("GET", url, true);
            xmlHttp.send();
        });
    }
}

// Canvas
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

BDC.Sprite = class {
    constructor(image, columns, rows, cellWidth, cellHeight) {
        this.image = image;
        this.columns = columns;
        this.rows = rows;
        this.cellDimension = new BDC.Dimension(cellWidth, cellHeight);

        this.cellsPosition = [];
        this.cellIndex = 0;
        this.cellStartingIndex = 0;
        this.cellEndingIndex = 0;

        this.animationList = [];
        this.animationIndex = 0;
        this.currentAnimation = { startingIndex: 0, endingIndex: 0 };

        this.delayCounter = 0;
        this.delay = 16;

        this.isAnimating = false;

        for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
                this.cellsPosition.push(new BDC.Point(column * this.cellDimension.width, row * this.cellDimension.height));
            }
        }
    }

    play(index) {
        if (!this.isAnimating) return;

        if (this.animationIndex !== index) {
            this.setAnimationIndex(index);
        }

        this.next();
    }

    pause() {
        this.isAnimating = false;
    }

    stop() {
        this.isAnimating = false;
        this.animationIndex = -1;
        this.cellIndex = this.currentAnimation.startingIndex;
        this.delayCounter = 0;
    }

    setAnimationIndex(index) {
        this.currentAnimation = this.animationList[index];
        this.animationIndex = index;
        this.cellIndex = this.currentAnimation.startingIndex + 1;
        this.delayCounter = 0;
    }

    next() {
        if (this.delayCounter < this.delay) {
            this.delayCounter++;
        }
        else if (this.delayCounter >= this.delay) {
            this.delayCounter = 0;
            this.nextFrame();
        }
    }

    nextFrame() {
        this.cellIndex++;

        if (this.cellIndex >= this.currentAnimation.endingIndex) {
            this.cellIndex = this.currentAnimation.startingIndex;
        }
    }

    render(scene, x, y, width, height) {
        if (typeof width === 'undefined') {
            width = this.cellDimension.width;
        }

        if (typeof height === 'undefined') {
            height = this.cellDimension.height;
        }

        const cell = this.cellsPosition[this.cellIndex];
        scene.context.drawImage(this.image, cell.x, cell.y, this.cellDimension.width, this.cellDimension.height, x, y, width, height);
    }

    addAnimation(startingIndex, endingIndex) {
        this.animationList.push({ startingIndex: startingIndex, endingIndex: endingIndex })
    }
}

// Objects
BDC.Vector = class {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    getLength() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    getHeading() {
        return Math.atan2(this.y, this.x);
    }

    normalize() {
        const length = this.getLength();

        if (length > 0) {
            this.x = this.x / length;
            this.y = this.y / length;
        }

        this.x = 0;
        this.y = 0;
    }

    dot(p) {
        return this.x * p.x + this.y * p.y;
    }

    static normalize(vector) {
        const length = vector.length();

        if (length > 0) {
            return new BDC.Vector(vector.x / length, vector.y / length);
        }

        return new BDC.Vector();
    }

    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
}

BDC.Point = class {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    getDistance(p) {
        const xDiff = this.x - p.x;
        const yDiff = this.y - p.y;

        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }

    getDirection(p) {
        const xDiff = this.x - p.x;
        const yDiff = this.y - p.y;
        const length = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

        if (length > 0) {
            return new BDC.Vector(xDiff / length, yDiff / length);
        }

        return new BDC.Vector();
    }
}

BDC.Line = class {
    constructor(x1, y1, x2, y2) {
        this.a = new BDC.Point(x1, y1);
        this.b = new BDC.Point(x2, y2);
    }

    getLength() {
        const xDiff = this.a.x - this.b.x;
        const yDiff = this.a.y - this.b.y;

        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }
}

BDC.Rectangle = class {
    constructor(x, y, width, height) {
        this.position = new BDC.Point(x, y);
        this.dimension = new BDC.Dimension(width, height);
    }

    getBounds() {
        const bounds = {};

        const p1 = new BDC.Point(this.position.x, this.position.y);
        const p2 = new BDC.Point(this.position.x + this.dimension.width, this.position.y);
        const p3 = new BDC.Point(this.position.x + this.dimension.width, this.position.y + this.dimension.height);
        const p4 = new BDC.Point(this.position.x, this.position.y + this.dimension.height);

        bounds.up = new BDC.Line(p1.x, p1.y, p2.x, p2.y);
        bounds.right = new BDC.Line(p2.x, p2.y, p3.x, p3.y);
        bounds.down = new BDC.Line(p3.x, p3.y, p4.x, p4.y);
        bounds.left = new BDC.Line(p4.x, p4.y, p1.x, p1.y);

        return bounds;
    }
}

BDC.Dimension = class {
    constructor(width, height) {
        this.width = width || 0;
        this.height = height || 0;
    }
}