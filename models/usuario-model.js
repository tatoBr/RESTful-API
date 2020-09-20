const mongoose = require( 'mongoose' );
const { misc: { emailRegEx }, dbModels, dbModels: { USER }} = require( '../bin/variables' );

const usuarioSchema = mongoose.Schema({
    [ USER.campos.id ]: mongoose.Schema.Types.ObjectId,
    [ USER.campos.nomeDeUsuario ] : { type: String, required: true, unique : true },
    [USER.campos.nome]: { type : String, required : true },
    [USER.campos.sobrenome] : { type : String, required : true },
    [USER.campos.cpf]: { type : Number, required : true, unique: true },
    [USER.campos.email]: {type : String, required : true, unique: true, match: emailRegEx },
    [USER.campos.senha]: { type: String, required : true },
    [USER.campos.failed_login_attempts]: { type: Number, default: 0 },
    [USER.campos.blocked_until]: { type: Date },
    [USER.campos.dataDeNascimento ]: { type : Date },
    [USER.campos.pedidos ]: [{ type: mongoose.Schema.Types.ObjectId, ref: dbModels.PEDIDO.nome }]
});

module.exports = mongoose.model( USER.model_name, usuarioSchema );