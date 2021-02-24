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

        this.isResize = true;
        this.isFullScreen = false;

        window.addEventListener('resize', () => {
            this.isResize = true;
        });

        this.key = {
            states: {},
            listeningTo: undefined,
            eventTypes: ['keydown', 'keyup']
        };
        this.touch = {
            states: [],
            listeningTo: undefined,
            eventTypes: (BDC.isMobile() ? ['touchstart', 'touchend', 'touchmove'] : ['mousedown', 'mouseup', 'mousemove']),
        };

        this.isInitialized = false;
        this.isPreloaded = false;
    }

    fullscreen() {
        this.isFullScreen = true;

        if (this.scene.canvas.webkitRequestFullScreen) {
            this.scene.canvas.webkitRequestFullScreen();
        }
        else {
            this.scene.canvas.mozRequestFullScreen();
        }
    }

    addKeyboardListener(object) {
        if (typeof this.key.listeningTo === 'undefined') {
            this.key.listeningTo = object;
            this.scene.canvas.addEventListener(this.key.eventTypes[0], this.keyEventLogger.bind(this));
            this.scene.canvas.addEventListener(this.key.eventTypes[1], this.keyEventLogger.bind(this));
        }
    }

    addTouchListener(object) {
        if (typeof this.touch.listeningTo === 'undefined') {
            this.touch.listeningTo = object;
            object.addEventListener(this.touch.eventTypes[0], this.touchEventListener.bind(this));
            object.addEventListener(this.touch.eventTypes[1], this.touchEventListener.bind(this));
            object.addEventListener(this.touch.eventTypes[2], this.touchEventListener.bind(this));
        }
    }

    keyEventLogger(event) {
        this.key.states[event.code] = (event.type === 'keydown');
    }

    touchEventListener(event) {
        const rect = this.touch.listeningTo.getBoundingClientRect();

        if (BDC.isMobile()) {
            for (let i = 0; i < event.touches.length; i++) {
                const touch = event.touches[i];
                const position = new BDC.Point();
                position.x = Math.round(touch.clientX - rect.left);
                position.y = Math.round(touch.clientY - rect.top);
                touch.position = position;
            }

            this.touch.states = event.touches;
        }
        else {
            const position = new BDC.Point();
            position.x = Math.round(event.clientX - rect.left);
            position.y = Math.round(event.clientY - rect.top);
            event.position = position;
            this.touch.states = [event];
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

    getInput(keyStates, touchStates) {

    }

    update(deltaTime) {
        if (this.isResize) {
            this.isResize = false;
            this.scene.setWidth(window.innerWidth);
            this.scene.setHeight(window.innerHeight);

            this.resizeScene(this.scene);

            if (document.fullscreenElement === null) {
                this.isFullScreen = false;
                // this.bgm.pause();
            }
        }
    }

    render(scene) {

    }

    resizeScene(scene) {

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
            this.getInput(this.key.states, this.touch.states);
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

    static isRectCollidedToRect(r1, r2) {
        return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
    }

    static isPointCollidedToRect(p, r) {
        return p.x > r.x && p.x < r.x + r.width && p.y > r.y && p.y < r.y + r.height;
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
        this.canvas.tabIndex = 1;

        if (isAppendToBody) {
            document.body.appendChild(this.canvas);
        }
    }

    setWidth(width) {
        this.width = width;
        this.canvas.width = width;
    }

    setHeight(height) {
        this.height = height;
        this.canvas.height = height;
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

BDC.Button = class {
    constructor(text, x, y, width, height, color) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.ox = x;
        this.oy = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.xAlign = 'left';
        this.yAlign = 'top';
        this.isVisible = true;
        this.isTouching = false;
        this.onTouchStartFunction = undefined;
        this.onTouchEndFunction = undefined;
    }

    addOnTouchStartListener(func) {
        if (typeof this.onTouchStartFunction === 'undefined') {
            this.onTouchStartFunction = func;
        }
    }

    addOnTouchEndListener(func) {
        if (typeof this.onTouchEndFunction === 'undefined') {
            this.onTouchEndFunction = func;
        }
    }

    removeOnTouchStartListener(func) {
        if (typeof this.onTouchStartFunction !== 'undefined') {
            this.onTouchStartFunction = undefined;
        }
    }

    removeOnTouchEndListener(func) {
        if (typeof this.onTouchEndFunction !== 'undefined') {
            this.onTouchEndFunction = undefined;
        }
    }

    update(touches) {
        if (!this.isVisible) return;

        for (let i = 0; i < touches.length; i++) {
            if (BDC.isPointCollidedToRect(touches[i].position, this)) {
                this.color.a = 0.5;
                this.isTouching = true;

                if (typeof this.onTouchStartFunction !== 'undefined') {
                    this.onTouchStartFunction();
                }

                break;
            }
        }

        if (this.isTouching) {
            this.color.a = 1;
            this.isTouching = false;

            if (typeof this.onTouchEndFunction !== 'undefined') {
                this.onTouchEndFunction();
            }
        }
    }

    render(scene) {
        if (!this.isVisible) return;
        scene.context.save();

        scene.context.fillStyle = this.color.toString();
        scene.context.fillRect(this.x, this.y, this.width, this.height);

        scene.context.fillStyle = 'white';
        scene.context.font = '15px sans-serif';

        scene.context.textAlign = "center";
        scene.context.textBaseline = 'middle';

        scene.context.fillText(this.text, this.x + (this.width / 2), this.y + (this.height / 2));

        scene.context.restore();
    }

    setCoordinate(x, y) {
        this.ox = x;
        this.oy = y;
    }

    setXAlign(xAlign) {
        if (xAlign === 'left' || xAlign === 'center' || xAlign === 'right') {
            this.xAlign = xAlign.toLowerCase();
        }
        else {
            this.xAlign = 'left';
        }
    }

    setYAlign(yAlign) {
        if (yAlign === 'top' || yAlign === 'center' || yAlign === 'bottom') {
            this.yAlign = yAlign.toLowerCase();
        }
        else {
            this.yAlign = 'top';
        }
    }

    reposition(scene) {
        const width = scene.width;
        const height = scene.height;

        if (this.xAlign === 'left') {
            this.x = this.ox;
        }
        else if (this.xAlign === 'center') {
            this.x = (width / 2) - (this.width / 2) + this.ox;
        }
        else if (this.xAlign === 'right') {
            this.x = width - this.width - this.ox;
        }

        if (this.xAlign === 'top') {
            this.y = this.oy;
        }
        else if (this.yAlign === 'center') {
            this.y = (height / 2) - (this.height / 2) + this.oy;
        }
        else if (this.yAlign === 'bottom') {
            this.y = height - this.height - this.oy;
        }
    }
}