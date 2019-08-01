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
        scene: [playGame, Menu, TrainingScreen],
        //scene: [Menu, playGame], //Final
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

    create() {
        this.add.text((game.canvas.width / 2) - 248, 150, 'NOME DO JOGO', { fontFamily: 'Arial', fontSize: 64, color: '#fff' });
        this.playText = this.add.text((game.canvas.width / 2) - 248, game.canvas.height / 2, 'Play', { fontFamily: 'Arial', fontSize: 64, color: '#fff' });
        this.playText.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.playText.width, this.playText.height), Phaser.Geom.Rectangle.Contains);
        this.playText.on("pointerdown", this.startGame);
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
        this.score = this.add.text(10, 10, `Score ${score}`, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });
        this.lives = this.add.text(10, 50, `Lives ${lives}`, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });
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
                    score++
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
                        score++
                    } else {
                        points2[points2.length - 1].hp--
                    }
                    this.cameras.main.flash(50, 255, 255, 0);
                    score++
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
                if(random < 20){
                    item.setFrame(1);
                    item.body.label = COIN;
                } else if (random < 40) {
                    item.setFrame(2);
                    item.body.label = SKULL;
                } else if (random < 60) {
                    item.setFrame(2)
                    item.body.label = SKULL2;
                    let skullEnemy = {index: skulls2.length, hp: 2}
                    skulls2.push(skullEnemy)
                } else if (random < 80) {
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
        this.score = this.add.text(10, 10, `Score ${score}`, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });
        this.lives = this.add.text(10, 50, `Lives ${lives}`, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });
        if(lives === 0) {
            //this.create()
            play = false
            lives = totalLifes
            this.scene.start("Training");
        }
    }
};


class TrainingScreen extends Phaser.Scene {
    constructor() {
        super("Training")
    }

    create() {
        this.add.text((game.canvas.width / 2) - 248, 150, 'NOME DO JOGO', { fontFamily: 'Arial', fontSize: 64, color: '#fff' });
        this.add.text((game.canvas.width / 2) - 248, 214, score, { fontFamily: 'Arial', fontSize: 32, color: '#fff' });
        this.buyLife = this.add.text((game.canvas.width / 2) - 248, game.canvas.height / 2, '+ Life', { fontFamily: 'Arial', fontSize: 64, color: '#fff' });
        this.buyLife.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.buyLife.width, this.buyLife.height), Phaser.Geom.Rectangle.Contains);
        this.buyLife.on("pointerdown", this.startGame);
        this.buyMoney = this.add.text((game.canvas.width / 2) - 248, game.canvas.height / 2 + 128, '+ Money', { fontFamily: 'Arial', fontSize: 64, color: '#fff' });
        this.buyMoney.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.buyMoney.width, this.buyMoney.height), Phaser.Geom.Rectangle.Contains);
        this.buyMoney.on("pointerdown", this.startGame);
        this.playText = this.add.text((game.canvas.width / 2) - 248, game.canvas.height - 128, 'Play', { fontFamily: 'Arial', fontSize: 64, color: '#fff' });
        this.playText.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.playText.width, this.playText.height), Phaser.Geom.Rectangle.Contains);
        this.playText.on("pointerdown", this.startGame);
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