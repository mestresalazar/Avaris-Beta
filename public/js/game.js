const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: document.body,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // Mude para true se quiser ver os retângulos de colisão
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let map;
let tileset;
let groundLayer;
let collisionLayer;

function preload() {
    // 1. Carregar os recursos do Tiled (Ajuste os nomes conforme salvou na pasta assets/mapas/)
    this.load.image('tiles_image', 'assets/mapas/tileset.png');
    this.load.tilemapTiledJSON('mapa_json', 'assets/mapas/mundo.json');

    // 2. Carregar o Sprite Sheet do Universal LPC (Ajuste frameWidth e frameHeight conforme a grade do seu arquivo)
    this.load.spritesheet('player', 'assets/sprites/player.png', {
        frameWidth: 64,
        frameHeight: 64
    });
}

function create() {
    // Inicializar o mapa do Tiled
    map = this.make.tilemap({ key: 'mapa_json' });
    
    // O primeiro parâmetro deve ser exatamente o nome dado ao Tileset dentro do software Tiled
    tileset = map.addTilesetImage('nome_do_tileset_no_tiled', 'tiles_image');

    // Criar as camadas do mapa (Garanta que os nomes batem com as camadas criadas no Tiled)
    groundLayer = map.createLayer('Camada de Chão', tileset, 0, 0);
    collisionLayer = map.createLayer('Camada de Colisao', tileset, 0, 0);

    // Ativar colisão na camada designada (evita bugs em cavernas e paredes)
    if (collisionLayer) {
        collisionLayer.setCollisionByExclusion([-1]);
    }

    // Criar animações direcionais baseadas no padrão Universal LPC
    // Ajuste os índices (start e end) conforme a linha correspondente no seu sprite sheet
    this.anims.create({
        key: 'walk-down',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk-left',
        frames: this.anims.generateFrameNumbers('player', { start: 9, end: 17 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk-right',
        frames: this.anims.generateFrameNumbers('player', { start: 18, end: 26 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'walk-up',
        frames: this.anims.generateFrameNumbers('player', { start: 27, end: 35 }),
        frameRate: 10,
        repeat: -1
    });

    // Criar o jogador com física arcade
    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);

    // Adicionar colisão entre o jogador e as paredes do mapa
    if (collisionLayer) {
        this.physics.add.collider(player, collisionLayer);
    }

    // Configurar a câmera para seguir o personagem principal
    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(1.5); // Ajuste o zoom se necessário

    // Capturar comandos do teclado
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    player.setVelocity(0);

    const speed = 160;

    // Lógica de Movimentação e Animações
    if (cursors.left.isDown) {
        player.setVelocityX(-speed);
        player.anims.play('walk-left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(speed);
        player.anims.play('walk-right', true);
    } else if (cursors.up.isDown) {
        player.setVelocityY(-speed);
        player.anims.play('walk-up', true);
    } else if (cursors.down.isDown) {
        player.setVelocityY(speed);
        player.anims.play('walk-down', true);
    } else {
        player.anims.stop();
        // Mantém o frame estático olhando para frente quando parar
        player.setFrame(0); 
    }
}