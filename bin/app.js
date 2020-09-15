require('dotenv').config();

//importa dependências
const express = require('express');
const cors = require('cors');
const morgan = require( 'morgan' );
const mongoose = require( 'mongoose' );
const { dbConnectionUri } = require('../bin/variables');
const { httpStatusCode } = require('./variables');

//cria uma aplicação express
const app = express();

//estabelece conexão com banco de dados
mongoose.connect(
    dbConnectionUri,
    { useNewUrlParser: true, useUnifiedTopology: true },
    console.log( 'conexão com banco de dados estabelecida'
    ));

//**************prepara middlewares para serem usados*******************/
//*logger middleware
app.use( morgan( 'dev' ));

//trata cors errors
app.use( cors() );

//*parsers
app.use( express.urlencoded({ extended : false }));
app.use( express.json());

//static folders
app.use('/imagens', express.static('imagens'))
//*********************************************************************/

//importa rotas
const produto_router = require( '../routers/produto-router' );
const pedido_router = require( '../routers/pedido-router' );
const usuario_router = require( '../routers/usuario-router' );


//configura rotas que lidam com requests
app.use( '/produtos', produto_router );
app.use( '/pedidos', pedido_router );
app.use( '/usuarios', usuario_router );


//rotas que tratam erros que não foram tratados em outras rotas
app.use(( req, res, next )=>{
    const error = new Error( 'Ei vc...É vc mesmo lendo essa mensagem... Vc sabe que estou falando com vc mesma... Sabia que eu te amo mais que pudim de leite??' );
    error.status = httpStatusCode.NOT_FOUND;
    next( error );
})

app.use(( error, req, res, next )=>{
    console.error( 'Ocorreu um erro', error );
    res.status( error.status || httpStatusCode.INTERNAL_SERVER_ERROR ).json({
        error : {
            message : error.message,        
        }        
    });    
})

//exporta app
module.exports = app;