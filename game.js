let game;
let gameOptions = {
    gravity: 1,
    maxItemsPerLevel: 80,
    maxIterations: 25,
    minItemsDistance: 160
}

let score = 0
let play = false
let totalLifes = 5
let lives = totalLifes
let experience = 0
let room = 0
let level = 0
let powerUp = 0
let coinUp = 1
let lifeprice = coinPrice = 5

const HERO = 0;
const COIN = 1;
const SKULL = 2;
const SKULL2 = 3;
const POINTS = 4;
const LIFES = 5;

let skulls2 = []
let points2 = []

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: 750,
            height: 1334
        },
        //scene: [playGame, Menu, MainScreen],
        scene: [Menu, playGame], //Final
        physics: {
            default: "matter",
            matter: {
                gravity: {
                    y: gameOptions.gravity
                }
            }
        }
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}

class Menu extends Phaser.Scene {
    constructor() {
        super("Menu")
    }

    preload() {
        this.load.spritesheet("player", "assets/player.png", {
            frameWidth: 512,
            frameHeight: 512
        });

        this.load.image("lives", "assets/heart.png");
        this.load.image("coins", "assets/coin.png");
    }

    create() {

        let moving = this.anims.create({
            key: 'moving',
            frames: this.anims.generateFrameNumbers("player", {prefix: 'moving_', end: 15, zeroPad: 4}),
            frameRate: 2,
            repeat: -1
        })

        let totalLevel = new Phaser.Geom.Rectangle(50, 25, game.canvas.width - 100, 20);
        let totalLevelGraphics = this.add.graphics({ fillStyle: { color: 0x0000ff } });
        totalLevelGraphics.fillRectShape(totalLevel);

        var xp = new Phaser.Geom.Rectangle(50, 25, experience * ( (game.canvas.width - 100) / `1${level * 5}`), 20);
        var xpGraphics = this.add.graphics({ fillStyle: { color: 0xff0000 } });
        xpGraphics.fillRectShape(xp);
        //graphics.setInteractive(rect, event);

        this.add.text(game.canvas.width - 112, 50, `${experience + powerUp}/${(level + 1) * 5}`, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });
        this.add.text(50, 50, `Level: ${level}`, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });

        //Lives
        this.add.image(128, 256, 'lives');
        this.add.text(74, 300, 'Lives: ' + totalLifes, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });

        //Coins
        this.add.image(392, 256, 'coins');
        this.add.text(300, 300, 'Coins: ' + score, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });

        /**
         * PLAY BUTTON
         */
        let playRect = new Phaser.Geom.Rectangle((game.canvas.width / 2) - 75, game.canvas.height - 142, 190, 100);
        var graphics = this.add.graphics({ fillStyle: { color: 0x0000ff } });
        graphics.fillRectShape(playRect);
        this.playText = this.add.text((game.canvas.width / 2) - 48, game.canvas.height - 128, 'Play', { fontFamily: 'Arial', fontSize: 64, color: '#fff' });
        this.playText.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.playText.width, this.playText.height), Phaser.Geom.Rectangle.Contains);

        /**
         * BUY LIFE BUTTON
         */
        let buyRect = new Phaser.Geom.Rectangle(64, game.canvas.height - 142, 190, 100);
        var graphics = this.add.graphics({ fillStyle: { color: 0x0000ff } });
        graphics.fillRectShape(buyRect);
        this.buyText = this.add.text(92, game.canvas.height - 128, 'Life ' + lifeprice, { fontFamily: 'Arial', fontSize: 64, color: '#fff' });
        this.buyText.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.buyText.width, this.buyText.height), Phaser.Geom.Rectangle.Contains);

        /**
         * BUY COIN BUTTON
         */
        let coinRect = new Phaser.Geom.Rectangle(game.canvas.width - 218, game.canvas.height - 142, 190, 100);
        var graphics = this.add.graphics({ fillStyle: { color: 0x0000ff } });
        graphics.fillRectShape(coinRect);
        this.coinText = this.add.text(game.canvas.width - 176, game.canvas.height - 128, 'coin' + coinPrice, { fontFamily: 'Arial', fontSize: 64, color: '#fff' });
        this.coinText.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.coinText.width, this.coinText.height), Phaser.Geom.Rectangle.Contains);
        
        let sprite = this.add.sprite(game.canvas.width / 2, game.canvas.height / 2 + 128, "player");

        sprite.play('moving')

        
        this.playText.on("pointerdown", this.startGame);
        this.buyText.on("pointerdown", this.lifesUpgrade)
        this.coinText.on("pointerdown", this.coinsUpgrade)
    }

    startGame() {
        play = true
    }

    lifesUpgrade() {
        totalLifes++
        lifePrice += 5
    }

    coinsUpgrade() {
        coinUp++
        coinPrice += 5
    }
    
    update() {
        if(play) {
            this.scene.start("PlayGame");
        }
    }
}

class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }
    preload(){
        this.load.spritesheet("items", "items-min.png", {
            frameWidth: 64,
            frameHeight: 64
        });
    }
    create(){
        room++
        this.score = this.add.text(10, 10, `Score ${score}`, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });
        this.lives = this.add.text(10, 50, `Lives ${lives}`, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });
        this.rooms = this.add.text(150, 10, `Room ${room}`, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });
        this.canSummonHero = true;
        this.matter.world.update30Hz();
        this.matter.world.setBounds(0, -400, game.config.width, game.config.height + 800);
        this.createLevel();
        this.input.on("pointerdown", this.releaseHero, this);
        this.matter.world.on("collisionstart", function(e, b1, b2){
            switch(b1.label){
                case COIN:
                    b1.gameObject.visible = false;
                    this.matter.world.remove(b1);
                    score += coinUp
                    this.cameras.main.flash(50, 255, 255, 0);
                    break;
                case SKULL:
                    if(b1.gameObject.y > b2.gameObject.y){
                        b1.gameObject.visible = false;
                        this.matter.world.remove(b1);
                        this.cameras.main.flash(50, 255, 0, 0);
                    }
                    else{
                        this.cameras.main.flash(50, 255, 0, 0);
                    }
                    lives--
                    break;
                case SKULL2:
                    if(b1.gameObject.y > b2.gameObject.y){
                        if(skulls2[skulls2.length - 1].hp == 1) {
                            b1.gameObject.visible = false;
                            this.matter.world.remove(b1);
                            this.cameras.main.flash(50, 255, 0, 0);
                            skulls2.splice(skulls2.length - 1, 1)
                        } else {
                            skulls2[skulls2.length - 1].hp--
                        }
                    }
                    else{
                        this.cameras.main.flash(50, 255, 0, 0);
                    }
                    lives--
                    break
                case POINTS:
                    if(points2[points2.length - 1].hp == 1) {
                        b1.gameObject.visible = false;
                        this.matter.world.remove(b1);
                        score += coinUp
                    } else {
                        points2[points2.length - 1].hp--
                    }
                    this.cameras.main.flash(50, 255, 255, 0);
                    score += coinUp
                    break;
                case LIFES:
                    b1.gameObject.visible = false;
                    this.matter.world.remove(b1);
                    lives++
                    this.cameras.main.flash(50, 50, 50, 50);
                    break;
                default:
                    if(b2.gameObject.y > game.config.height){
                        this.scene.start("PlayGame");
                    }
                    else{
                        if(b2.gameObject.y > 0){
                            this.cameras.main.flash(50, 255, 0, 0);
                        }
                    }
            }
            this.update()
        }, this);
    }

    createLevel(){
        this.gameItems = this.add.group();
        let spawnRectangle = new Phaser.Geom.Rectangle(80, 250, game.config.width - 160, game.config.height - 350);
        for(let i = 0; i < gameOptions.maxItemsPerLevel; i++){
            let iterations = 0;
            let point;
            do{
                point = Phaser.Geom.Rectangle.Random(spawnRectangle);
                iterations ++;
			} while(iterations < gameOptions.maxIterations && this.itemsOverlap(point));
            if(iterations == gameOptions.maxIterations){
                break;
            }
            else{
                let item = this.matter.add.image(point.x, point.y, "items");
                item.setCircle();
                item.setStatic(true);
                this.gameItems.add(item);
                let random = Phaser.Math.Between(0, 99)
                if(random < 25){
                    item.setFrame(1);
                    item.body.label = COIN;
                } else if (random < 50) {
                    item.setFrame(2);
                    item.body.label = SKULL;
                } else if (random < 75) {
                    item.setFrame(2)
                    item.body.label = SKULL2;
                    let skullEnemy = {index: skulls2.length, hp: 2}
                    skulls2.push(skullEnemy)
                } else if (random < 95) {
                    item.setFrame(1)
                    item.body.label = POINTS;
                    let points = {index: points2.length, hp: 2}
                    points2.push(points)   
                } else {
                    item.setFrame(1);
                    item.body.label = LIFES;
                }
            }
        }
    }

    itemsOverlap(p){
        let overlap = false;
        this.gameItems.getChildren().forEach(function(item){
            if(item.getCenter().distance(p) < gameOptions.minItemsDistance){
                overlap = true
            }
        })
		return overlap;
    }
    
    releaseHero(e){
        if(this.canSummonHero){
            this.canSummonHero = false;
            let item = this.matter.add.image(e.x, -200, "items");
            item.setCircle();
            item.setBounce(1)
            item.body.label = HERO
        }
    }

    
    render() {
        this.game.debug.text(`Debugging Phaser ${Phaser.VERSION}`, 20, 20, 'yellow', 'Segoe UI');
    }

    update() {
        this.score.destroy()
        this.lives.destroy()
        this.rooms.destroy()
        this.score = this.add.text(10, 10, `Score ${score}`, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });
        this.lives = this.add.text(10, 50, `Lives ${lives}`, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });
        this.rooms = this.add.text(game.canvas.width / 2 - 32, 10, `Room ${room}`, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });
        if(lives === 0) {
            //this.create()
            play = false
            lives = totalLifes
            experience += (room - 1)
            room = 0
            if(experience >= 10) {
                level++
                experience -= 10
                console.log(level)
            }
            //this.scene.start("MainScreen");
            this.scene.start("Menu");
        }
    }
};


class MainScreen extends Phaser.Scene {
    constructor() {
        super("MainScreen")
    }

    create() {
        this.add.text((game.canvas.width / 2) - 248, 150, 'NOME DO JOGO', { fontFamily: 'Arial', fontSize: 64, color: '#fff' });
    }

    startGame() {
        play = true
    }
    
    update() {
        if(play) {
            this.scene.start("PlayGame");
        }
    }
}