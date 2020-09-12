const mongoose = require( 'mongoose' );
const { dbModels } = require('../bin/variables')

const produtoSchema = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    imagemURL: { type : String }, 
    nome : { type: String, required: true, trim: true },
    preco : Number,
    qtd_em_estoque: { type: Number, required: true, default: 0 }
})

module.exports = mongoose.model( dbModels.PRODUTO.nome, produtoSchema );