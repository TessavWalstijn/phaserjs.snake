var game = new Phaser.Game(336, 480, Phaser.AUTO, "", { preload: preload, create: create, update: update }),
    snake, score, food, tile, scl = 16,
    speed = 0,
    style = 0,
    setup = {},
    button = {},
    keys = {},
    dir = {},
    tail = [],
    wall = [],
    styles = [];


styles.push("classic");
styles.push("rider");

/**
 * phaser preload function.
 */
function preload() {
    let m = styles.length;
    for (let i = 0; i < m; i++) {
        game.load.image(styles[i] + "food", "Img/" + styles[i] + "/food.png");
        game.load.image(styles[i] + "Ywall", "Img/" + styles[i] + "/ywall.png");
        game.load.image(styles[i] + "Rwall", "Img/" + styles[i] + "/rwall.png");
        game.load.image(styles[i] + "tile", "Img/" + styles[i] + "/tile.png");
        loadButtons(i);
        loadSnake(i);
    }
}

/**
 * load snake images.
 */
function loadSnake(i) {
    game.load.image(styles[i] + "snakeH", "Img/" + styles[i] + "/snakehead.png");
    game.load.image(styles[i] + "snakeB", "Img/" + styles[i] + "/snakeback.png");
    game.load.image(styles[i] + "snakeT", "Img/" + styles[i] + "/snaketail.png");
    game.load.image(styles[i] + "snakeL", "Img/" + styles[i] + "/snakeleft.png");
    game.load.image(styles[i] + "snakeR", "Img/" + styles[i] + "/snakeright.png");
}

/**
 * load button images.
 */
function loadButtons(i) {
    game.load.image(styles[i] + "start", "Img/" + styles[i] + "/startbutton.png");
    game.load.image(styles[i] + "leftB", "Img/" + styles[i] + "/leftbutton.png");
    game.load.image(styles[i] + "leftP", "Img/" + styles[i] + "/leftpressed.png");
    game.load.image(styles[i] + "rightB", "Img/" + styles[i] + "/rightbutton.png");
    game.load.image(styles[i] + "rightP", "Img/" + styles[i] + "/rightpressed.png");
    game.load.image(styles[i] + "upB", "Img/" + styles[i] + "/upbutton.png");
    game.load.image(styles[i] + "upP", "Img/" + styles[i] + "/uppressed.png");
    game.load.image(styles[i] + "downB", "Img/" + styles[i] + "/downbutton.png");
    game.load.image(styles[i] + "downP", "Img/" + styles[i] + "/downpressed.png");
}

/**
 * phaser create function.
 */
function create() {
    game.stage.backgroundColor = "#666";
    game.physics.startSystem(Phaser.Physics.ARCADE);
    addWalls();
    addButtons();
    addKeys();
    tile = game.add.sprite(0, 22 * 16, styles[style] + "tile");
    snake = game.add.sprite(168, 168, styles[style] + "snakeH");
    snake.anchor.setTo(0.5, 0.5);
    food = game.add.sprite(0, 0, styles[style] + "food");
    food.anchor.setTo(0, 0);
    addPhysics();
    setUp();
}

/**
 * add all wall images.
 */
function addWalls() {
    for (let i = 0; i < 21; i++) {
        addWall(i, 0)
    }
    for (let i = 0; i < 21; i++) {
        addWall(i, 21)
    }
    for (let i = 1; i < 21; i++) {
        addWall(0, i);
    }
    for (let i = 1; i < 21; i++) {
        addWall(20, i);
    }
}

/**
 * add wall image to wall object at posistion.
 * @param {number} x the x posistion of the image.
 * @param {number} y the y posistion of the image.
 */
function addWall(x, y) {
    wall.push(game.add.sprite(x * 16, y * 16, styles[style] + "Ywall"));
}

/**
 * add buttons to the button object.
 */
function addButtons() {
    button.left = game.add.sprite(5 * scl - scl * 0.5, 24 * scl, styles[style] + "leftB");
    button.right = game.add.sprite(13 * scl - scl * 0.5, 24 * scl, styles[style] + "rightB");
    button.up = game.add.sprite(9 * scl - scl * 0.5, 22 * scl, styles[style] + "upB");
    button.down = game.add.sprite(9 * scl - scl * 0.5, 26 * scl, styles[style] + "downB");
    button.left.inputEnabled = true;
    button.right.inputEnabled = true;
    button.up.inputEnabled = true;
    button.down.inputEnabled = true;
    button.left.events.onInputDown.add(leftButton, this);
    button.right.events.onInputDown.add(rightButton, this);
    button.up.events.onInputDown.add(upButton, this);
    button.down.events.onInputDown.add(downButton, this);
}

/**
 * add keys to the key object.
 */
function addKeys() {
    keys.right = game.input.keyboard.addKey(39);
    keys.left = game.input.keyboard.addKey(37);
    keys.down = game.input.keyboard.addKey(40);
    keys.up = game.input.keyboard.addKey(38);
    keys.w = game.input.keyboard.addKey(87);
    keys.a = game.input.keyboard.addKey(65);
    keys.s = game.input.keyboard.addKey(83);
    keys.d = game.input.keyboard.addKey(68);
}

/**
 * enable the phaser physics to the needed objects.
 */
function addPhysics() {
    game.physics.arcade.enable(snake);
    game.physics.arcade.enable(food);
    game.physics.arcade.enable(wall);
}

/**
 * phaser update function.
 */
function update() {
    physics();
    keyHandler();
    if (setup.start) {
        gameRunning();
    }
    if (setup.restart) {
        if (setup.counter > 99) setUp(setup.wall);
        setup.counter++
    }
    if (!setup.style) {
        if (setup.counter > 30) {
            setup.style = true;
            setup.counter = 0;
            setStyle();
        }
        setup.counter++
    }
}

/**
 * check the objects for collision.
 */
function physics() {
    game.physics.arcade.overlap(snake, food, foodHandler, null, this);
    game.physics.arcade.overlap(snake, wall, wallHandler, null, this);
    game.physics.arcade.overlap(snake, tail, gameOver, null, this);
}

/**
 * reset the button sprites.
 */
function resetButtons(b = "upB") {
    button.left.loadTexture(styles[style] + "leftB");
    button.right.loadTexture(styles[style] + "rightB");
    button.up.loadTexture(styles[style] + b);
    button.down.loadTexture(styles[style] + "downB");
}

/**
 * let the snake go left and give feedback that left is pressed.
 */
function leftButton() {
    if (setup.start) {
        if (snake.angle != -90 && snake.angle != 90 && dir.set && setup.start) {
            button.left.loadTexture(styles[style] + "leftP");
            dir.x = -1;
            dir.y = 0;
            snake.angle = -90;
            dir.set = false;
        }
    } else if (!setup.restart) {
        if (setup.style) {
            setup.style = false;
            style--;
            if (style < 0) {
                style = styles.length - 1;
            }
        }
    }
}

/**
 * let the snake go right and give feedback that right is pressed.
 */
function rightButton() {
    if (setup.start) {
        if (snake.angle != -90 && snake.angle != 90 && dir.set) {
            button.right.loadTexture(styles[style] + "rightP");
            dir.x = 1;
            dir.y = 0;
            snake.angle = 90;
            dir.set = false;
        }
    } else if (!setup.restart) {
        if (setup.style) {
            setup.style = false;
            style++;
            if (style >= styles.length) {
                style = 0;
            }
        }
    }
}

/**
 * let the snake go up and give feedback that up is pressed.
 * or start the game if it is not started yet.
 */
function upButton() {
    if (setup.start) {
        if (snake.angle != 0 && snake.angle != -180 && dir.set) {
            button.up.loadTexture(styles[style] + "upP");
            dir.x = 0;
            dir.y = -1;
            snake.angle = 0;
            dir.set = false;
        }
    } else {
        if (!setup.restart) {
            button.up.loadTexture(styles[style] + "upP");
            dir.x = 0;
            dir.y = -1;
            setup.start = true;
        }
    }
}

/**
 * let the snake go down and give feedback that down is pressed.
 */
function downButton() {
    if (snake.angle != 0 && snake.angle != -180 && dir.set && setup.start) {
        button.down.loadTexture(styles[style] + "downP");
        dir.x = 0;
        dir.y = 1;
        snake.angle = -180;
        dir.set = false;
    }
}

/**
 * checks if a key is pressed.
 */
function keyHandler() {
    if (keys.left.isDown || keys.a.isDown)
        leftButton();
    if (keys.right.isDown || keys.d.isDown)
        rightButton();
    if (keys.up.isDown || keys.w.isDown)
        upButton();
    if (keys.down.isDown || keys.s.isDown)
        downButton();
}

/**
 * when the snake hits a food object.
 * @param {object} snake collide object.
 * @param {object} food collide object.
 */
function foodHandler(snake, food) {
    food.kill();
    setFood();
    score++;
}

/**
 * when the snake hist a wall object.
 * @param {object} snake collide object.
 * @param {object} wall collide object.
 */
function wallHandler(snake, wall) {
    wall.loadTexture(styles[style] + "Rwall", 0);
    setup.wall = wall;
    gameOver();
}

/**
 * when the snake hits him self or the game need to stop.
 */
function gameOver() {
    setup.restart = true;
    setup.start = false;
    dir.x = 0;
    dir.y = 0;
}

/**
 * snake movement when game is running.
 */
function gameRunning() {
    if (speed > 10) {
        let t = snakeHandler();
        snakeCurve(tail[t], snake.angle);
        snakePos(tail[t], snake);
        tail[0].loadTexture(styles[style] + "snakeT");
        resetButtons();
        snakeDir();
    }
    speed++;
}

/**
 * toggels the snakes behavior and tail adding.
 * @return {number} for the total tail length.
 */
function snakeHandler() {
    let t = tail.length - 1;
    if (score === t) {
        for (let i = 0; i < t; i++) {
            snakeCurve(tail[i], tail[i + 1].angle);
            snakePos(tail[i], tail[i + 1]);
        }
    } else {
        t = addTail(t);
    }
    return t;
}

/**
 * set the right sprite for the tail.
 * @param {object} obj 
 * @param {number} angle 
 */
function snakeCurve(obj, angle) {
    if (obj.angle != angle) {
        let dif = obj.angle - angle
        if (dif == -90 || dif == 270)
            obj.loadTexture(styles[style] + "snakeR");
        if (dif == 90 || dif == -270)
            obj.loadTexture(styles[style] + "snakeL");
    } else obj.loadTexture(styles[style] + "snakeB");
}

/**
 * replece posistion and angle.
 * @param {object} obj0 object that needs to be replaced by obj1.
 * @param {object} obj1 object that replace obj0.
 */
function snakePos(obj0, obj1) {
    obj0.angle = obj1.angle;
    obj0.x = obj1.x;
    obj0.y = obj1.y;
}

/**
 * snakes movement and direction.
 */
function snakeDir() {
    snake.x += scl * dir.x;
    snake.y += scl * dir.y;
    dir.set = true;
    speed = 0;
}

/**
 * add a new tail object to tail[].
 * @param {number} t the last object in tail[].
 * @return {number} the new last posistion.
 */
function addTail(t) {
    tail.push(game.add.sprite(snake.x, snake.y, styles[style] + "snakeB"));
    t++;
    tail[t].anchor.setTo(0.5, 0.5);
    tail[t].angle = tail[t - 1].angle;
    game.physics.arcade.enable(tail[t]);
    return t;
}

/**
 * set up or reset the game values
 * @param {object} wall the hitted wall by the snake
 */
function setUp(wall) {
    resetButtons("start");
    setup.wall = undefined;
    setup.restart = false;
    setup.start = false;
    setup.style = true;
    setup.counter = 0;
    start = false;
    score = 0;
    if (wall !== undefined)
        wall.loadTexture(styles[style] + "Ywall");
    dir.set = true;
    dir.x = 0;
    dir.y = 0;
    snake.angle = 0;
    snake.x = 168;
    snake.y = 168;
    let t = tail.length;
    for (let i = 0; i < t; i++)
        tail[i].kill();
    tail = [];
    tail.push(game.add.sprite(snake.x, snake.y + scl, styles[style] + "snakeT"));
    tail[0].anchor.setTo(0.5, 0.5);
    game.physics.arcade.enable(tail[0]);
    snake.revive();
    setFood();
}

/**
 * gives food a new posistion in the world.
 */
function setFood() {
    let x = Math.floor(game.world.randomX / scl),
        y = Math.floor(game.world.randomY / scl);
    if (x > 19) x = 19;
    if (y > 20) y = 20;
    if (x < 1) x = 1;
    if (y < 1) y = 1;
    x = x * scl;
    y = y * scl;
    food.x = x;
    food.y = y;
    food.revive();
}

function setStyle() {
    let m = wall.length
    for (let i = 0; i < m; i++) {
        wall[i].loadTexture(styles[style] + "Ywall");
    }
    tail[0].loadTexture(styles[style] + "snakeT");
    snake.loadTexture(styles[style] + "snakeH");
    food.loadTexture(styles[style] + "food");
    tile.loadTexture(styles[style] + "tile");
    resetButtons("start");
}