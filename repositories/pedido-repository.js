const PedidoModel = require( '../models/pedido-model');
const { dbModels } = require( '../bin/variables' );
const populate_args = { path: 'lista', populate: { path: 'produtoId', model: dbModels.PRODUTO.nome }};
// class Response{
//     /**
//      * 
//      * @param { Number } status 
//      * @param { Document } data 
//      * @param { String } message 
//      * @param { Error } error 
//      */
//     constructor(status, data, message=null, error=null ){
//         this._status = status;
//         this._data = data;
//         this._message = message
//         this._error=error;
//     }    
    
//     get status(){
//         return this._status;
//     }   
//     set status( code ){
//         this.status = code;
//     }
// }

class PedidoRepository{
    constructor(){}

    /**
     * Salva um novo documento no banco de dados
     * @param { Document } document
     * @returns { Promise<Document> }  - Retorna uma promessa de que um documento será salvo na base de dados
     */
    create( document ){ 
        //cria um novo pedido       
        let pedido = new PedidoModel( document );
        
        return pedido.save()
        .then( saved => { 
            //O modelo 'Pedido' salva apenas a ID do produto
            //O metodo 'populate' preenche a lista de produtos do pedido com os detalhes de cada produto                      
            return saved.populate( populate_args ).execPopulate();                               
        })  
        .then( populated => populated )        
        .catch( error => error );
    }

    /**
     * Le os documentos da coleção PEDIDOS salvos no banco de dados
     * @returns { Promise<Document[]> } Retorna uma promessa de que um array de pedidos será resgatado da base de dados
     */
    readAll(){
        return PedidoModel.find().populate( "lista.produtoId" ).exec()
        .then( query_result => query_result )
        .catch( error => error );
    }

    /**
     * @param { Number } id id do pedido
     * @returns { Promise<Document> } retorna uma promessa de que o pedido com id passada será lido no banco de dados
     */
    read( id ){
        return PedidoModel.findById( id ).populate( populate_args )
        .then( query_result => query_result )
        .catch( error => error );
    }

    update( id, data ){
        return PedidoModel.findByIdAndUpdate( {_id : id }, data )
        .then( query_result => query_result )
        .catch( error => error );
    }

    delete( id ){        
        return PedidoModel.deleteOne( { _id: id } )
        .then( query_result => query_result.deletedCount )              
        .catch( error => error )
    }
}

module.exports = PedidoRepository;

