const mongoose = require( 'mongoose' );

const ProdutoRepository = require( '../repositories/produto-repository' );
const { validateId, validateProdutoRegister, validateProdutoUpdate } = require( '../bin/helpers/validator' );

const { httpStatusCode, currencies, dbModels: { PRODUTO }} = require( '../bin/variables' );

/** Classe que representa o Controller de Produtos */
class ProdutoController{

    /**
     * Produto Controller constructor
     */
    constructor(){
        this._repo = new ProdutoRepository();        
    }

    /**
     * cria um novo produto
     * @param {*} req  requisição para o servidor
     * @param {*} res  resposta do servidor
     */
    criar_produto( req, res ){ 
        //recupera os dados do corpo da requisição e cria um novo documento
        const { defaultURLimage, campos: { id, nome, preco, estoque, imagem }} = PRODUTO;
        const produto = {}
        produto[ id ] = new mongoose.Types.ObjectId(); 
        produto[ nome ] = req.body.nome.trim().toUpperCase();
        produto[ preco ] = req.body.valor;
        produto[ estoque ] = req.body.estoque;
        produto[ imagem ] = req.file ? req.file.path : defaultURLimage; 
        
        //faz a validação dos dados e responde com erro se algum dado for inválido
        const { error } = validateProdutoRegister( produto );
        if( error ){
            const { details : [{ message }]} = error;
           return  res.status( httpStatusCode.BAD_REQUEST ).json({ message: message });
        } 
 
        //Invoca o repositorio e envia o Documento para este realizar a transação com o banco de dados
        this._repo.create( produto )
        .then( result => res.status( result.getStatusCode()).json( result.getResponse()))
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json( error ));           
    }    
    
    /**
     * busca a lista de produtos
     * @param {*} req requisição para o servidor
     * @param {*} res resposta do servidor
     */
    listar_produtos( req, res ){
        //invoca o repositório para este realizar a query no banco de dados
        this._repo.readAll()
        .then( result => res.status( result.getStatusCode()).json( result.getResponse()))
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json( error.message ))
    }

    /**
    * Atualiza os dados de um produto específico
    * @param {*} req requisição para o servidor
    * @param {*} res resposta do servidor
    */
    buscar_produto( req, res ){
        //recupera a id da lista de parametros da requisição
        const id = req.params.id
        
        //checa a validade do formato da id
        if( !validateId( id )){
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

    /**
    * Atualiza os dados de um produto específico
    * @param {*} req requisição para o servidor
    * @param {*} res resposta do servidor 
    */
    atualizar_produto( req, res ){
        //recupera a id da lista de parametros da requisição
        const id = req.params.id

        //checa a validade do formato da id
        if( !validateId( id )){
            return res.status( httpStatusCode.BAD_REQUEST ).json({
                message: 'Formato de Id Inválido.',
                content: id
            })
        }
        
        //monta o documento com as propriedades a serem atualizadas
        let filter = {}
        for( let key in req.body ){
            if( req.body[ key ] ) {                
                filter[ key ] = ( typeof req.body[ key ] === 'string' ) ? req.body[ key ].trim().toUpperCase() : req.body[ key ];
            }
        }
        if( req.file ) {
            filter[ 'imagemURL' ] = req.file.path
        }

        //Verifica se o documento possui alguma propriedade para ser atualizada
        if( Object.keys( filter ).length <= 0 ){
            return res.status( httpStatusCode.BAD_REQUEST ).json({
                message: 'Não foi passado nenhum dado à ser atualizado',
                filter: filter
            })
        };
        
        //valida os dados do documento de atualização
        const { error } = validateProdutoUpdate( filter );
        if( error ){
            let { details: [{ message }]} = error;
            return res.status( httpStatusCode.BAD_REQUEST ).json({ message: message });
        }       
       
        //Invoca o repositório base para este buscar  e atualizar o documento na base de dados
        this._repo.update( id, filter )
        .then( result => res.status( result.getStatusCode()).json( result.getResponse()))
        .catch( error => {
            console.error( error );
            res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json( error );
        });
    }

    /**
    * busca um produto pela id e apaga o mesmo
    * @param {*} req requisição para o servidor
    * @param {*} res resposta do servidor  
    */
    apagar_produto( req, res ){
        //recupera a id da lista de parametros da requisição
        const id = req.params.id;

        //checa a validade do formato da id
        if( !validateId( id )){
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