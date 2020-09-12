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
        console.log( req.file );            
        let doc = {
            _id: new mongoose.Types.ObjectId(),
            nome: req.body.nome.trim().toUpperCase(),
            preco: req.body.preco,
            qtd_em_estoque: req.body.estoque,
            imagemURL: ( req.file ) ? req.file.path : PRODUTO.defaultURLimage
        }
        
        this._repo.create( doc )
        .then( repo_return => res.status( repo_return.status ).json( repo_return.response ))
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json( error ));           
    }    
    
    listar_produtos( req, res ){
        this._repo.readAll()
        .then( repo_return => res.status( repo_return.status ).json( repo_return.response ))
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json( error.message ))
    }

    buscar_produto( req, res ){
        const id = req.params.id
        
        if( !this._validator.idFormatIsValid( id )){
            return res.status( httpStatusCode.BAD_REQUEST ).json({
                message: 'Formato de Id Inválido.',
                content: id
            })
        }

        this._repo.read( id )
        .then( repo_return => res.status( repo_return.status ).json( repo_return.response ))
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json( error ));
    }


    atualizar_produto( req, res ){
        const id = req.params.id

        if( !this._validator.idFormatIsValid( id )){
            return res.status( httpStatusCode.BAD_REQUEST ).json({
                message: 'Formato de Id Inválido.',
                content: id
            })
        }

        let doc = {}
        for( let key in req.body ){
            doc[ key ] = ( typeof req.body[ key ] === 'string' ) ? req.body[ key ].trim().toUpperCase() : req.body[ key ];
        }
        console.log( doc );

        this._repo.update( id, doc )
        .then( repo_return => res.status( repo_return.status ).json( repo_return.response ))
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json( { message: "erro aqui porra!!", error: error } ));
    }

    apagar_produto( req, res ){
        const id = req.params.id;

        if( !this._validator.idFormatIsValid( id )){
            return res.status( httpStatusCode.BAD_REQUEST ).json({
                message: 'Formato de Id Inválido.',
                content: id
            })
        }

        this._repo.delete( id )
        .then( repo_return => res.status( repo_return.status ).json( repo_return.response ))
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json( response ));       
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