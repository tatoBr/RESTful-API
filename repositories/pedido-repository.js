const PedidoModel = require( '../models/pedido-model');
const UsuarioModel = require( '../models/usuario-model');
const Response = require( '../bin/helpers/response' );
const { dbModels, httpStatusCode, dbQueryResponses } = require( '../bin/variables' );
const { query } = require('express');
const populate_args = { path: 'lista', populate: { path: 'produtoId', model: dbModels.PRODUTO.nome }};

class PedidoRepository{
    constructor(){}

    /**
     * Salva um novo documento no banco de dados
     * @param { Document } documento
     * @returns { Promise< Response > }  - Retorna uma promessa de que um documento será salvo na base de dados
     */
    create( documento ){         
        const { id, comprador, lista_de_produtos } = dbModels.PEDIDO.campos;

        //verifica se o usuário passado existe no banco de dados
        return UsuarioModel.findById( documento[ comprador ]).exec()
        .then( query_result => {            
            //se o usuário passado não existe no banco de dados, retorna erro
            if( !query_result ){
                return new Response( httpStatusCode.BAD_REQUEST, "Usuário com id passada não existe no banco de dados",{} );
            }
            else{          
               
                const pedido = new PedidoModel( documento )                
                return new Response( httpStatusCode.CREATED, dbQueryResponses.CREATED, {} );
                return pedido.save()
                .then( save_result => {
                    console.log( save_result );
                    return new Response( httpStatusCode.CREATED, dbQueryResponses.CREATED, save_result );
                })
                .catch( error => {
                    console.error( error.message, error );
                    return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, '', null, error );
                });
            }
        })
        .catch( error => {
            console.error( error.message, error );
            return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, '', null, error );
        });

        // return pedido.save()
        // .then( saved => { 
        //     //O modelo 'Pedido' salva apenas a ID do produto
        //     //O metodo 'populate' preenche a lista de produtos do pedido com os detalhes de cada produto                      
        //     return saved.populate( populate_args ).execPopulate();                               
        // })  
        // .then( populated => populated )        
        // .catch( error => error );
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

