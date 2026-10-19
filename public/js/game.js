const socket = io();

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
        this.outrasPessoas = {};
    }

    init(data) {
        this.mapaAtual = data.mapa || "mapa_estagio1";
    }

    preload() {
        // Carregar Imagens de Tilesets e Mapas em JSON criados no Tiled
        this.load.image("tileset_imagem", "assets/mapas/tileset_geral.png");
        this.load.tilemapTiledJSON("mapa_estagio1", "assets/mapas/estagio1.json");
        this.load.tilemapTiledJSON("mapa_estagio2", "assets/mapas/estagio2.json");

        // Carregar Sprite Sheet do LPC (64x64 por frame)
        this.load.spritesheet("lpc_player", "assets/sprites/player_lpc.png", {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {
        // Criar o Mapa baseado no Tiled
        const map = this.make.tilemap({ key: this.mapaAtual });
        const tileset = map.addTilesetImage("tileset_nome_no_tiled", "tileset_imagem");

        const camadaFundo = map.createLayer("CamadaFundo", tileset, 0, 0);
        const camadaColisao = map.createLayer("CamadaColisao", tileset, 0, 0);

        if (camadaColisao) {
            camadaColisao.setCollisionByExclusion([-1]);
        }

        // Animações do Personagem LPC
        this.anims.create({
            key: "andar",
            frames: this.anims.generateFrameNumbers("lpc_player", { start: 0, end: 8 }),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: "parado",
            frames: [{ key: "lpc_player", frame: 0 }],
            frameRate: 10
        });

        // Criar Jogador com Física
        this.player = this.physics.add.sprite(150, 150, "lpc_player").setOrigin(0.5, 0.5);

        if (camadaColisao) {
            this.physics.add.collider(this.player, camadaColisao);
        }

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.cursors = this.input.keyboard.createCursorKeys();

        // Detectar Entradas de Caverna (Transição de Estágios)
        const camadaObjetos = map.getObjectLayer("Objetos");
        if (camadaObjetos) {
            camadaObjetos.objects.forEach(obj => {
                if (obj.name === "EntradaCaverna") {
                    const zonaCaverna = this.add.zone(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width, obj.height);
                    this.physics.world.enable(zonaCaverna);
                    zonaCaverna.body.setAllowGravity(false);
                    zonaCaverna.body.moves = false;

                    this.physics.add.overlap(this.player, zonaCaverna, () => {
                        this.transicionarParaMapa("mapa_estagio2");
                    });
                }
            });
        }

        // Conexão em Tempo Real (Socket.io)
        socket.emit("entrar_no_jogo", { username: "Hero_" + Math.floor(Math.random() * 1000), x: 150, y: 150 });

        socket.on("lista_jogadores", (jogadores) => {
            jogadores.forEach((j) => {
                if (j.socketId !== socket.id) {
                    this.criarOutroJogador(j);
                }
            });
        });

        socket.on("jogador_entrou", (j) => {
            this.criarOutroJogador(j);
        });

        socket.on("jogador_moveu", (dados) => {
            if (this.outrasPessoas[dados.socketId]) {
                this.outrasPessoas[dados.socketId].setPosition(dados.x, dados.y);
            }
        });

        socket.on("jogador_saiu", (dados) => {
            if (this.outrasPessoas[dados.socketId]) {
                this.outrasPessoas[dados.socketId].destroy();
                delete this.outrasPessoas[dados.socketId];
            }
        });
    }

    update() {
        const velocidade = 170;
        this.player.setVelocity(0);

        let movendo = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-velocidade);
            movendo = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(velocidade);
            movendo = true;
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-velocidade);
            movendo = true;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(velocidade);
            movendo = true;
        }

        if (movendo) {
            this.player.play("andar", true);
        } else {
            this.player.play("parado", true);
        }

        if (this.player.oldPosition && (this.player.x !== this.player.oldPosition.x || this.player.y !== this.player.oldPosition.y)) {
            socket.emit("mover", { x: this.player.x, y: this.player.y });
        }

        this.player.oldPosition = { x: this.player.x, y: this.player.y };
    }

    criarOutroJogador(j) {
        const outro = this.physics.add.sprite(j.x, j.y, "lpc_player");
        this.outrasPessoas[j.socketId] = outro;
    }

    transicionarParaMapa(novoMapaKey) {
        this.scene.restart({ mapa: novoMapaKey });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: GameScene
};

const game = new Phaser.Game(config);
