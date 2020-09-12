const mongoose = require( 'mongoose' );
const { dbModels } = require( '../bin/variables' );

const pedidoSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    comprador: { type: mongoose.Schema.Types.ObjectId, required: true, ref: dbModels.USER.model_name },
    lista: [{
        produtoId: { type: mongoose.Schema.Types.ObjectId, ref: dbModels.PRODUTO.nome },
        quantidade: { type: Number, default: 1 },
        _id : false
    }]    
})

module.exports = mongoose.model( dbModels.PEDIDO.nome, pedidoSchema );