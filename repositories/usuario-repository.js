const UsuarioModel = require( '../models/usuario-model' );
const PedidoModel = require( '../models/pedido-model');
const Response = require( '../bin/helpers/response' );
const { httpStatusCode, dbQueryResponses, dbModels: { USER, PEDIDO }, dbModels} = require( '../bin/variables' );
const { findById } = require('../models/usuario-model');

/** Class representing a User Repository */
class UsuarioRepository{
    /**
     * User Repository constructor
     */
    constructor(){ }

    /**
     * Salva um documento no banco de dados
     * @param { Document } document - documento que será salvo no banco de dados
     * @returns { Promise<Response> } - retorna uma promessa de que uma resposta será dada pelo banco de dados
     */
    create( document ){       
        //busca no banco de dados se já existe algum usuário salvo com o email, cpf ou username passados
        return  UsuarioModel.find(
            { $or : [
                {[ USER.campos.nomeDeUsuario ] : document[ USER.campos.nomeDeUsuario ]},
                {[ USER.campos.email ] : document[ USER.campos.email ]},
                {[ USER.campos.cpf ] : document[ USER.campos.cpf ]}
            ]
        }).exec()
        .then( query_result => {
            //Se a busca não retornar nenhum resultado, insere um novo usuário no banco de dados
            if( !Array.isArray( query_result) || query_result.length <= 0 ){
                // cria o modelo do documento e tenta salvar no banco de dados
                const usuario = new UsuarioModel( document );
                return usuario.save()
                .then( save_result => {
                    if( !save_result ){
                        return new Response( httpStatusCode.BAD_REQUEST, dbQueryResponses.NOT_CREATED, formatToRead( save_result ));
                    }
                    else{
                        return new Response( httpStatusCode.CREATED, dbQueryResponses.CREATED, formatToRead( save_result ));
                    }                        
                });        
            }
            else{
                //Se a busca retornar algum resultado, o usuario já existe e não será salvo novamente
                return new Response(
                    httpStatusCode.CONFLICT,
                    dbQueryResponses.NOT_CREATED + dbQueryResponses.REDUNDENT,
                    query_result.map( usuario => formatToRead( usuario )));
            }
        })
        .catch( error => {
            console.error( error.message, error );
            return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, '', null, error );
        })
    }

    /**
     * Busca um usuário no banco de dados pela ID
     * @param { String } id 
     */
    read( id ){
        return UsuarioModel.findById( id )
        .populate( "pedidos.produtoId" )
        // .populate({
        //     path: '_idPedidos',
        //     populate: 'lista.produtoId'
        // })
        .exec()
        //Se a busca não retornar nenhum documento, retorna um obj vazio
        .then( query_result => {
            if( !query_result ){                
                return new Response( httpStatusCode.BAD_REQUEST, dbQueryResponses.NO_ID_FOUND, {} );
            }
            else{
                //Se a busca retornar algum documento, retorna esse documento
                return new Response( httpStatusCode.OK, dbQueryResponses.DOC_RETRIEVED, formatToRead( query_result ));
            }
        })
        .catch( error => {
            console.error( error.message, error );
            return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, '', null, error );
        });
    }

    /**
     * Busca a lista de usuários no banco de dados
     * @param { Object } filter
     * @returns { Promise<Response> }  - retorna uma promessa de que uma resposta será dada pelo banco de dados
     */
    readAll( filter = {}){
        console.log( USER.campos.pedidos );
        return UsuarioModel.find( filter ).populate( USER.campos.pedidos )        
        .exec()
        .then( query_result => {
            //Retorna um objeto vazio se a busca não retornar nenhum Documento
            if( !Array.isArray( query_result ) || query_result.length <= 0 )
            {
                return new Response( httpStatusCode.BAD_REQUEST, dbQueryResponses.EMPTY_LIST, query_result );
            }
            else{
                //Se a busca retornar documentos, envia esses para o controller
                return new Response(
                    httpStatusCode.OK,
                    dbQueryResponses.LIST_RETRIEVED,
                    query_result
                );
            }
        })
        .catch( error => {
            console.error( error.message, error );
            return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, '', null, error );
        })
    }

    /**
     * Atualiza um usuário no banco de dados que tenha ID correspondente a passada no parâmetro
     * @param { Number } id - id do documento
     * @param { document } document - documento com dados à serem atualizados
     * @returns { Promise<Response> } - retorna uma promessa de que uma resposta será dada pelo banco de dados
     */
    update( id, document ){
        //Envia a query de atualização para o banco de dados
        return UsuarioModel.updateOne( { _id : id }, document )
        .then( update_result => {
            //Se nenhum documento for atualizado, retorna o documento original
            if( update_result.nModified <= 0 ){
                return new Response( httpStatusCode.BAD_REQUEST, dbQueryResponses.NONE_UPDATED, document );
            }
            else {
                //se algum documento for atualizado, busca esse documento no banco de dados e retorna para o controller
                return UsuarioModel.findById( id ).exec()
                .then( query_result => {
                    if( !query_result ){
                        return new Response(
                            httpStatusCode.ACCEPTED,
                            dbQueryResponses.UPDATED_SUCCESSFULLY + dbQueryResponses.NO_ID_FOUND )
                    }
                    else{
                        return new Response( httpStatusCode.ACCEPTED, dbQueryResponses.UPDATED_SUCCESSFULLY, formatToRead( query_result ));
                    }
                })
                .catch( error => new Response( httpStatusCode.INTERNAL_SERVER_ERROR, "", null, error ));
            }
        })
        .catch( error => new Response( httpStatusCode.INTERNAL_SERVER_ERROR, "", null, error ));
    }

    /** 
     * busca e deleta um documento com a id passada no banco de dados     
     * @param {*} id - ID do documento a ser deletado
     * @returns { Promise<Response> } - retorna uma promessa de que uma resposta será dada pelo banco de dados
     */
    delete( id ){
        //Busca o usuario na base de dados
        return UsuarioModel.findById( id, [ USER.campos.pedidos] ).exec()
        .then( query_result => {
            //Se o usuario com id passada não for encontrado no banco de dados, responde com erro
            if( !query_result ){                
                return new Response( httpStatusCode.BAD_REQUEST, dbQueryResponses.NO_ID_FOUND, {});
            }
            else{
                //Se o usuário existe na base de dados, apaga os pedidos da sua lista de pedidos
                console.log(query_result[ USER.campos.pedidos ]);
                return PedidoModel.deleteMany({[ PEDIDO.campos.id ] : { $in : query_result[ USER.campos.pedidos ]}}).exec()
                .then( del_pedidos_result => {
                    
                    //Por fim, deleta o usuário                    
                    return UsuarioModel.deleteOne({[ USER.campos.id ] : id }).exec()
                    .then( del_user_result => {                        
                        return new Response(httpStatusCode.OK, dbQueryResponses.DELETED_SUCCESSFULLY, {});
                    })
                    .catch( error => {
                        console.error(error.message, error);
                        return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, error.message, null, error );
                    })
                })
                .catch( error => {
                    console.error(error.message, error);
                    return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, error.message, null, error );
                });
            }
        })
        .catch( error => {
            console.error(error.message, error);
            return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, error.message, null, error );
        })
    }
    //     return UsuarioModel.deleteOne({ _id: id }).exec()
    //     .then( query_result => {
    //         //Verifica se algum documento foi deletado
    //         if ( query_result.deletedCount <= 0 ) {
    //             return new Response( httpStatusCode.NOT_FOUND, dbQueryResponses.NO_ID_FOUND + dbQueryResponses.FAIL_TO_DELETE, {});
    //         }
    //         else {
    //             return new Response( httpStatusCode.OK, dbQueryResponses.DELETED_SUCCESSFULLY, { _id: id });
    //         }
    //     })
    //     .catch(error => {
    //         console.error(error.message, error);
    //         return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, error.message, null, error );
    //     });        
    // }
}

/*************************************** FUNÇOES AUXILIARES *****************************************************/
/**  
* Função que recebe um documento do banco de dados e retorna um documento formatado para leitura      
* @param { Document } unformated_doc Documento em formato 'bruto' vindo do banco de dados
* @returns { Document } Documento formatado   
*/
const formatToRead = function ( unformated_doc ) {
    let userName = ( unformated_doc[ USER.campos.nomeDeUsuario ]) ? unformated_doc[ USER.campos.nomeDeUsuario ] : "Campor UserName Vázio";
    let userId = ( unformated_doc[ USER.campos.id ]) ? unformated_doc[ USER.campos.id ] : "Campo Id Vázia"
    let nome = ( unformated_doc[USER.campos.nome ]) ? unformated_doc[ USER.campos.nome ] : "Campo Primeiro Nome Vázio.";
    let sobreNome = ( unformated_doc[ USER.campos.sobrenome ]) ? unformated_doc[ USER.campos.sobrenome ] : "Sobrenome Vázio.";
    let email = ( unformated_doc[ USER.campos.email ]) ? unformated_doc[ USER.campos.email ] : "Campo email Vázio."
    let pedidos = ( unformated_doc[ USER.campos.pedidos ]) ? unformated_doc[ USER.campos.pedidos ] : [ "Campo", "Pedidos", "Vázio."]

    let formated_doc  = {
        userId: userId,
        nome_de_usuario : userName,
        nome_completo: `${ nome } ${ sobreNome }`,
        email: email,
        pedidos: pedidos
    };

    return formated_doc;
};

module.exports = UsuarioRepository;