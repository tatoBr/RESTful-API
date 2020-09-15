const mongoose = require( 'mongoose' );
const PedidoRepository = require( '../repositories/pedido-repository' );
const { httpStatusCode, currencies, dbQueryResponses, dbModels : { PEDIDO } } = require('../bin/variables' );
const { validateId, validatePedidoRegister } = require('../bin/helpers/validator');

class PedidoController{
    constructor(){
        /**
         * @param { Error } error 
         * @param { Number } status 
         */
        this._sendErrorResponse = function( error, status ){
            return res.status( status ).json({
                error: error
            });
        }
               
        this._repo = new PedidoRepository();        
    }

    criar_pedido( req, res ){        
        //recupera os dados do corpo da requisição e monta um novo documento pedido
        const { id, comprador, lista_de_produtos } = PEDIDO.campos; 
       
        const pedido = {};
        pedido[ id ] = new mongoose.Types.ObjectId();
        pedido[ comprador ] = req.body.idUsuario;
        pedido[ lista_de_produtos ] = req.body.lista;
    
        //faz a validação dos dados
        const { error } = validatePedidoRegister( pedido );
        if( error ){
            const { details: [{ message }]} = error;
            return res.status( httpStatusCode.BAD_REQUEST ).json({ message: message });            
        };

        this._repo.create( pedido )
        .then( result => {
            console.log(result);
            res.status(result.getStatusCode()).json(result.getResponse()); 
        })     
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json({ message: error.message, content: error }));
    }

    listar_pedidos( req, res ){
        //invoca o repositório para realizar a transação com o banco de dados
        this._repo.readAll()
        .then( response => {            
            if( !Array.isArray( response ) || response.length <= 0 )
                return res.status( httpStatusCode.BAD_REQUEST ).json({ message: dbQueryResponses.EMPTY_LIST, content: response })
            else
                return res.status( httpStatusCode.OK ).json({ message: dbQueryResponses.LIST_RETRIEVED, content: response });
        })
        .catch( error => {
            res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json({ message: error.message, error: error });
        })
    }

    buscar_pedido( req, res ){
        // recupera a id nos parâmetros da requisição
        const id = req.params.id;

        //invoca o repositório para realizar a transação com o banco de dados
        this._repo.read( id )
        .then( response => {
            if( !response )
                return res.status( httpStatusCode.BAD_REQUEST ).json({ message: dbQueryResponses.NO_ID_FOUND, content: response })
            else
                return res.status( httpStatusCode.OK ).json({ message: dbQueryResponses.RETRIEVED, content: response })
        })
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json({ message: error.message, error: error }));
    }
    
    atualizar_pedido( req, res ){
        //toDo
    }

    apagar_pedido( req, res ){
        const id = req.params.id;

        this._repo.delete( id )
        .then( deletedCount => {
            if( deletedCount > 0 )
                return res.status( httpStatusCode.OK ).json({ message : dbQueryResponses.DELETED_SUCCESSFULLY, content: null })
            else
                return res.status( httpStatusCode.BAD_REQUEST ).json({ message: dbQueryResponses.NO_ID_FOUND, content: null })            
        })
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json({ message: error.message, content: error }))
    }
};

/*************************************** FUNÇOES AUXILIARES *****************************************************/
/**  
* Funcção que recebe um documento do modelo pedido vindo do banco de dados e retorna um documento formatado       
* @param { Document } unformated_doc Documento em formato 'bruto' normalmente vindo do banco de dados
* @returns { Document } Documento formatado   
*/
const formatDocument = function( unformated_doc ){ 
    let id_do_pedido = unformated_doc._id;       
    let nome_do_comprador = unformated_doc.comprador;
    
    /*formata a lista de produtos
        nome do item,
        valor do item,
        quantidade comprada,
        valor total de todos os itens
    */
   let lista_de_produtos = unformated_doc.lista.map( item => ({
       id: item.produtoId._id,                
       nome: item.produtoId.nome,
       precoUnitario: `${ currencies.REAL }${ item.produtoId.preco.toFixed(2) }`,
       quantidade: item.quantidade,
       total_do_item: `${ currencies.REAL }${ (item.produtoId.preco * item.quantidade).toFixed(2) }`
    }));

    //calcula o valor todas de todos os iténs da lista de compras
    let valor_total = unformated_doc.lista.reduce(( acc, cur ) => ( acc + ( cur.produtoId.preco * cur.quantidade )), 0);
    
    //monta o documento formatado para retornar
    let formated_doc = {
        id: id_do_pedido,
        comprador: nome_do_comprador,
        produtos: lista_de_produtos,
        total_da_compra: `${ currencies.REAL }${ valor_total.toFixed(2) }`
    }             
    return formated_doc;           
};

module.exports = PedidoController;