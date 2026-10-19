const mongoose = require('mongoose');

const conectarBancoDeDados = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB ligado com sucesso!');
    } catch (error) {
        console.error('Erro ao ligar ao MongoDB:', error);
        process.exit(1);
    }
};

module.exports = conectarBancoDeDados;