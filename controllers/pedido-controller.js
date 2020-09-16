const mongoose = require( 'mongoose' );
const PedidoRepository = require( '../repositories/pedido-repository' );
const { httpStatusCode, currencies, dbQueryResponses, dbModels : { PEDIDO } } = require('../bin/variables' );
const { validateId, validatePedidoRegister } = require('../bin/helpers/validator');

/** Classe que representa o Controller do Pedido */
class PedidoController{
    /**Pedido Controller constructor **/
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

    /**
     * cria um novo pedido
     * @param {*} req 
     * @param {*} res 
     */
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

        //envia os dados para o repositório realizar a transação com o banco de dados
        this._repo.create( pedido )
        .then( result => res.status(result.getStatusCode()).json( result.getResponse() ))     
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json({ message: error.message, content: error }));
    }

    /**
     * busca lista de pedidos
     * @param {*} req 
     * @param {*} res 
     */
    listar_pedidos( req, res ){
        //invoca o repositório para realizar a transação com o banco de dados
        this._repo.readAll()
        .then( result => res.status( result.getStatusCode()).json( result.getResponse()))
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json({ message: error.message, error: error }));
    }

    /**
     * Busca um pedido específico pela ID
     * @param {*} req 
     * @param {*} res 
     */
    buscar_pedido( req, res ){
        // recupera a id nos parâmetros da requisição
        const id = req.params.id;
        
        //Verifica se a id possui um formato válido
        if( !validateId( id )){
            return res.status( httpStatusCode.BAD_REQUEST ).json({
                message: 'Formato de ID inválido.',
                content: id
            })
        }

        //invoca o repositório para realizar a transação com o banco de dados
        this._repo.read( id )
        .then( result => res.status( result.getStatusCode()).json( result.getResponse()))
        .catch( error => res.status( httpStatusCode.INTERNAL_SERVER_ERROR ).json({ message: error.message, error: error }));
    }
    
    /**
     * Busca e atualiza um pedido pela ID
     * @param {*} req 
     * @param {*} res 
     */
    atualizar_pedido( req, res ){        
        res.status( httpStatusCode.OK ).json({
            message: 'Metodo a ser implementado'
        })        
    }

    /**
     * Busca e apaga um pedido pela ID
     * @param {*} req 
     * @param {*} res 
     */
    apagar_pedido( req, res ){
        // recupera a id nos parâmetros da requisição
        const id = req.params.id;
        
        //Verifica se a id possui um formato válido
        if( !validateId( id )){
            return res.status( httpStatusCode.BAD_REQUEST ).json({
                message: 'Formato de ID inválido.',
                content: id
            })
        }

        //invoca o repositório para realizar a transação com o banco de dados
        this._repo.delete( id )
        .then( result => res.status( result.getStatusCode()).json( result.getResponse()))
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