const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const conectarBancoDeDados = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Ligar à Base de Dados
conectarBancoDeDados();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Configuração dos Sockets em tempo real
io.on('connection', (socket) => {
    console.log(`Novo jogador ligado: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Jogador desligado: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[Servidor] Avaris a executar na porta ${PORT}`);
});