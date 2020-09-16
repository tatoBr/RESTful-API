const PedidoModel = require( '../models/pedido-model');
const UsuarioModel = require( '../models/usuario-model');
const ProdutoModel = require( '../models/produto-model' );
const Response = require( '../bin/helpers/response' );

const { dbModels, httpStatusCode, dbQueryResponses } = require( '../bin/variables' );
const { json } = require('express');
const populate_args = { path: 'lista', populate: { path: 'produtoId', model: dbModels.PRODUTO.nome }};

class PedidoRepository{
    constructor(){}

    /**
     * Salva um novo documento no banco de dados
     * @param { Document } documento
     * @returns { Promise< Response > }  - uma promessa de uma resposta do repositório
     */
    create( documento ){                 
        const { USER, PRODUTO, PEDIDO } = dbModels;
        const { id, comprador, lista_de_produtos } = PEDIDO.campos;

        /**Busca no banco de dados se o usuário passado está cadastrado**/
        return UsuarioModel.findById( documento[ comprador ]).exec()
        .then( user_query_result => {            
            /**Se o usuário passado não existir no banco de dados, retorna erro**/
            if( !user_query_result ){
                return new Response( httpStatusCode.BAD_REQUEST, "Usuário não existe! Não é possivel adicionar pedidos à um usuário não cadastrado.",{} );
            }
            else{  
                /**Se o usuário existe, verifica se os produtos da lista de pedido são válido**/

                //resgata a lista de ids dos produtos na lista de pedidos
                let idProdutos = documento[ lista_de_produtos ].map( item => item.produtoId );
               
                //busca a lista de ids no banco de dados
                return ProdutoModel.find({ '_id' : { $in : idProdutos }}, `${ PRODUTO.campos.nome } ${ PRODUTO.campos.estoque }` ).exec()
                .then( query_result => {
                    /*se a lista retornada for menor q a lista de ids,
                    então existem produtos na lista de ids que não estão
                    cadastrados no banco de dados*/
                    if( query_result.length !== idProdutos.length ){
                        return new Response( httpStatusCode.BAD_REQUEST, 'Existem produtos inválidos na lista de pedido.', {});
                    }
                    else{
                        /** Com o usuário validado e a lista de produtos validada, cria um novo pedido e salva no banco de dados **/
                        const pedido = new PedidoModel( documento );
        
                        return pedido.save()
                        .then( pedido_save_result => {
                            //verifica se o banco de dados retornou um documento válido
                            if( !pedido_save_result ){
                                return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, dbQueryResponses.NOT_CREATED, {})
                            }
                            else{
                                /**Adiciona o novo pedido a lista de pedidos do usuário**/                        
                                return UsuarioModel.updateOne(
                                    { [ USER.campos.id ] : documento[ comprador ]},
                                    { $push : {[ USER.campos.pedidos ] : documento[ id ]}})
                                .then( update_result => { 
                                    //verifica se o banco de dados retornou um documento válido                           
                                    if( !update_result ){
                                        return new Response(
                                            httpStatusCode.INTERNAL_SERVER_ERROR,
                                            dbQueryResponses.NOT_CREATED,
                                            {});
                                    }
                                    else {
                                        return new Response(
                                            httpStatusCode.CREATED,
                                            dbQueryResponses.CREATED,
                                            pedido_save_result );
                                    }
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
                    }
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
    }    

    /**
     * Le os documentos da coleção PEDIDOS salvos no banco de dados
     * @returns { Promise<Document[]> } - uma promessa de uma resposta do repositório
     */
    readAll(){
        //Executa a query no banco de dados
        return PedidoModel.find().populate({
            path: "lista.produtoId",
            select: dbModels.PRODUTO.campos.nome 
        }).exec()
        .then( query_result => {
            //Verifica se a busca retornou algum documento
            if( !Array.isArray( query_result ) || query_result.length <= 0 ){
                //Retorna mensagem de lista vazia
                return new Response( httpStatusCode.OK, dbQueryResponses.EMPTY_LIST, query_result );
            }
            else{      
                //retorna a lista de documentos          
                return new Response( httpStatusCode.OK, dbQueryResponses.LIST_RETRIEVED, query_result );
            }
        })
        .catch( error =>{
            console.error( error.message, error );
            return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, error.message, null, error );
        });
    }

    /**
     * @param { Number } id id do pedido
     * @returns { Promise<Document> } - uma promessa de uma resposta do repositório
     */
    read( id ){
        //Executa a query no banco de dados
        return PedidoModel.findById( id ).populate({
            path: 'lista.produtoId',
            select: dbModels.PRODUTO.campos.nome
        })
        .then( query_result => {
            //verifica se a query retornou um documento válido 
            if( !query_result ) {
                return new Response( httpStatusCode.BAD_REQUEST, dbQueryResponses.NO_ID_FOUND, {});
            }
            else{
                return new Response( httpStatusCode.OK, dbQueryResponses.DOC_RETRIEVED, query_result );
            }
        })
        .catch( error => {
            console.error( error.message, error );
            return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, '', null, error );
        });
    }

    /**
     * 
     * @param { String } id -id do documento a ser atualizado
     * @param { * } filter - dados a serem atualizados no documento
     * @returns { Promise<Response> } - uma promessa de uma resposta do repositório 
     */
    update( id, filter ){
        //Executa a query no banco de dados
        return PedidoModel.updateOne({[ dbModels.PEDIDO.campos.id ] : id }, filter )
        .then( update_result =>{
            console.log( update_result );
            return new Response( httpStatusCode.OK, 'Implementando', update_result );
        })
        .catch( error => {
            console.error( error.message, error );
            return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, '', null, error );
        });
    }

    /**
     * Busca e apaga da base de dados um documento com a id passada, além de remover o mesmo da lista de pedidos do usuário
     * @param {*} id id do documento a ser apagado
     * @returns { Promise<Response> } - uma promessa de uma resposta do repositório
     */
    delete( id ){
        const { USER } = dbModels;
        const{ id : idPedido, comprador : idUsuario } = dbModels.PEDIDO.campos;
        console.log( idPedido, idUsuario );

        /** busca o pedido original na base de dados **/
        return PedidoModel.findById( id, `${ idPedido } ${ idUsuario }` ).exec()
        .then( query_result => {
            // Se a busca não retornar nenhum documento, responde com erro de id inválida
            if( !query_result ){
                return new Response(
                    httpStatusCode.BAD_REQUEST,
                    dbQueryResponses.NO_ID_FOUND + dbQueryResponses.FAIL_TO_DELETE,
                    {}
                );
            }
            else{
                //Tenta apagar o pedido da lista de pedidos do usuário                
                return UsuarioModel.update(
                    {[ USER.campos.id ] : query_result[ idUsuario ] },
                    { $pull : {[ USER.campos.pedidos ] : query_result[ idPedido ]}
                }).exec()
                .then( user_update_result => {                    
                    //Verifica se algum pedido foi apagado da lista de pedidos do usuário
                    if( user_update_result.nModified <= 0 ){
                        console.log( 'Nenhum pedido foi removido da lista de pedidos' );
                    }
                    else{
                        console.log( `${ user_update_result.nModified } pedido${ user_update_result.nModified == 1 ? ' ':'s '}apagados da lista de pedidos do usuário.`)
                    }
                    //E por fim, apaga o pedido da base de dados.
                    return PedidoModel.deleteOne({[ idPedido ] : id }).exec()
                    .then( delete_result => {
                        console.log( delete_result );
                        return new Response( httpStatusCode.OK, dbQueryResponses.DELETED_SUCCESSFULLY, {});
                    })
                    .catch( error => {
                        console.error( error.message, error );
                        return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, '', null, error );
                    });
                })
                .catch( error => {
                    console.error( error.message, error );
                    return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, '', null, error );
                })
            }
        })
        .catch( error => {
            console.error( error.message, error );
            return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, '', null, error );
        });
    }
}

module.exports = PedidoRepository;

