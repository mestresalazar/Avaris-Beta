require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const conectarBancoDeDados = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const inicializarSocket = require('./sockets/gameSocket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Conectar ao Banco de Dados MongoDB
conectarBancoDeDados();

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Servir os arquivos estáticos do cliente (HTML, JS, Imagens, Mapas)
app.use(express.static(path.join(__dirname, '../public')));

// Rotas de Autenticação / API
app.use('/api/auth', authRoutes);

// Servir a página principal do jogo
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Inicialização dos Sockets em tempo real
inicializarSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[Servidor] Avaris rodando na porta ${PORT}`);
});