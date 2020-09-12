const mongoose = require( 'mongoose' );

const ProdutoRepository = require( '../repositories/produto-repository' );
const Validator = require( '../bin/helpers/validator' );

const { httpStatusCode, currencies, dbModels: { PRODUTO }} = require( '../bin/variables' );



class ProdutoController{
    constructor(){
        this._repo = new ProdutoRepository();
        this._validator = new Validator();
    }

    criar_produto( req, res ){ 
        //recupera os dados do corpo da requisição e cria um novo documento
        let produto = {}
        produto[ PRODUTO.campos.id ] = new mongoose.Types.ObjectId(); 
        produto[ PRODUTO.campos.nome ] = req.body.nome.trim().toUpperCase();
        produto[ PRODUTO.campos.preco ] = req.body.preco;
        produto[ PRODUTO.campos.estoque ] = req.body.estoque;
        produto[ PRODUTO.campos.imagem ] = req.file ? req.file.path : PRODUTO.defaultURLimage;                 
 
        //Invoca o repositorio e envia o Documento para este realizar a transação com o banco de dados
        this._repo.create( produto )
        .then( result => res.status( result.getStatusCode()).json( result.getResponse()))
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json( error ));           
    }    
    
    listar_produtos( req, res ){
        //invoca o repositório para este realizar a query no banco de dados
        this._repo.readAll()
        .then( result => res.status( result.getStatusCode()).json( result.getResponse()))
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json( error.message ))
    }

    buscar_produto( req, res ){
        //recupera a id da lista de parametros da requisição
        const id = req.params.id
        
        //checa a validade do formato da id
        if( !this._validator.idFormatIsValid( id )){
            return res.status( httpStatusCode.BAD_REQUEST ).json({
                message: 'Formato de Id Inválido.',
                content: id
            });
        }

        //Invoca o repositório base para este buscar o documento na base de dados
        this._repo.read( id )
        .then( result => res.status( result.getStatusCode()).json( result.getResponse()))
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json( error ));
    }


    atualizar_produto( req, res ){
        //recupera a id da lista de parametros da requisição
        const id = req.params.id

        //checa a validade do formato da id
        if( !this._validator.idFormatIsValid( id )){
            return res.status( httpStatusCode.BAD_REQUEST ).json({
                message: 'Formato de Id Inválido.',
                content: id
            })
        }

        //monta o documento com as propriedades a serem atualizadas
        let filter = {}
        for( let key in req.body ){
            filter[ key ] = ( typeof req.body[ key ] === 'string' ) ? req.body[ key ].trim().toUpperCase() : req.body[ key ];
        }

        //Invoca o repositório base para este buscar  e atualizar o documento na base de dados
        this._repo.update( id, filter )
        .then( result => res.status( result.getStatusCode()).json( result.getResponse()))
        .catch( error => {
            console.error( error );
            res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json( error );
        });
    }

    apagar_produto( req, res ){
        //recupera a id da lista de parametros da requisição
        const id = req.params.id;

        //checa a validade do formato da id
        if( !this._validator.idFormatIsValid( id )){
            return res.status( httpStatusCode.BAD_REQUEST ).json({
                message: 'Formato de Id Inválido.',
                content: id
            })
        }

        //Invoca o repositório base para este buscar e apagar o documento na base de dados
        this._repo.delete( id )
        .then( result => res.status( result.getStatusCode()).json( result.getResponse()))
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json( error ));       
    }
}

/*************************************** FUNÇOES AUXILIARES *****************************************************/
/**  
* Função que recebe um documento do modelo pedido vindo do banco de dados e retorna um documento formatado       
* @param { Document } unformated_doc Documento em formato 'bruto' normalmente vindo do banco de dados
* @returns { Document } Documento formatado   
*/
const formatDocument = function( unformated_doc ){
    console.log( unformated_doc ); 
    let id_do_produto = unformated_doc._id;       
    let nome_do_produto = unformated_doc.nome;
    let preco_do_produto = unformated_doc.preco;
    
    //monta o documento formatado para retornar
    let formated_doc = {
        id: id_do_produto,        
        nome: nome_do_produto,
        valor: `${ currencies.REAL }${ preco_do_produto.toFixed(2) }`
    }             
    return formated_doc;           
};

module.exports = ProdutoController;