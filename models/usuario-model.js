const mongoose = require( 'mongoose' );
const { misc: { emailRegEx }, dbModels, dbModels: { USER }} = require( '../bin/variables' );


let schema = {};
schema[USER.campos.id] = mongoose.Schema.Types.ObjectId;
schema[USER.campos.nomeDeUsuario] = { type: String, required: true, unique: true };
schema[USER.campos.nome] = { type : String, required : true };
schema[USER.campos.sobrenome] = { type : String, required : true };
schema[USER.campos.cpf] = { type : Number, required : true, unique: true };
schema[USER.campos.email] = {type : String, required : true, unique: true, match: emailRegEx };
schema[USER.campos.senha] = { type: String, required : true };
schema[USER.campos.dataDeNascimento ] = { type : Date };
schema[USER.campos.pedidos ] = { type:  [ mongoose.Schema.Types.ObjectId ] , ref: dbModels.PEDIDO.nome };

const usuarioSchema = mongoose.Schema( schema );

module.exports = mongoose.model( USER.model_name, usuarioSchema );