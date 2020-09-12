const ProdutoModel = require('../models/produto-model');
const { dbModels, currencies, httpStatusCode, dbQueryResponses } = require('../bin/variables');
const { db } = require('../models/produto-model');

class ProdutoRepository {
    constructor() { }

    /**
     * Salva um documento no banco de dados
     * @param { Document } document
     * @returns { Promise<Document> } uma promessa de que o documento será salvo no banco de dados 
     */
    create( document ) {
        let produto = new ProdutoModel(document);

        //Busca na base de dados por um produto com o mesmo nome passado no parametro
        return ProdutoModel.findOne({ nome: document.nome })
            .then(query_result => {
                //Se nenhum produto for encontrado, segue com a criaçãp
                if (!query_result) {
                    //salva o novo produto na base
                    return produto.save()
                    .then(saved_doc => {
                        let doc = formatToRead(saved_doc)
                        return {
                            status: httpStatusCode.CREATED,
                            response: {
                                message: dbQueryResponses.CREATED,
                                content: doc
                            }
                        }
                    })
                    .catch(error => {
                        console.error(error.message, error);
                        return error;
                    });
                }
                else {
                    //se o produto já existe, retorna o produto e o aviso de redundância
                    let doc = formatToRead(query_result)
                    return {
                        status: httpStatusCode.BAD_REQUEST,
                        response: {
                            message: `Já existe um Documento com esse nome na Base de dados. Id:${doc.id} `,
                            content: doc
                        }
                    }
                }
            })
            .catch(error => {
                console.error(error.message, error);
                return error;
            });
    }

    /**
     * Lê todos os documentos do Banco de Dados
     * @returns { Promise<Document[]> } uma promessa de buscar uma lista de documentos no banco de dados
     */
    readAll() {
        return ProdutoModel.find().exec()
            .then(query_result => {
                //se o retorno não for um array ou um array vázio
                if (!Array.isArray(query_result) || query_result.length <= 0) {
                    return {
                        status: httpStatusCode.BAD_REQUEST,
                        response: {
                            message: dbQueryResponses.EMPTY_LIST,
                            content: null
                        }
                    }
                }
                else {
                    let list = query_result.map(produto => formatToRead(produto))
                    return {
                        status: httpStatusCode.OK,
                        response: {
                            message: `${list.length} documento${list.length > 1 ? 's ' : ' '} encontrado${list.length > 1 ? 's.' : '.'}`,
                            content: list
                        }
                    }
                }
            })
            .catch(error => {
                console.error(error.message, error);
                return error;
            });
    }

    /**
     * Busca um documento que tenha a mesma id passada no parâmetro
     * @param { String } id
     * @returns { Promise< Document> } - uma promessa de buscar um documento na base de dados
     */
    read(id) {
        return ProdutoModel.findById(id).exec()
            .then(query_result => {
                if (!query_result) {
                    return {
                        status: httpStatusCode.BAD_REQUEST,
                        response: {
                            message: dbQueryResponses.NO_ID_FOUND,
                            content: null
                        }
                    }
                }
                else {
                    let doc = formatToRead(query_result);
                    return {
                        status: httpStatusCode.OK,
                        response: {
                            message: dbQueryResponses.RETRIEVED,
                            content: doc
                        }
                    }
                }
            })
            .catch(error => {
                console.error(error.message, error);
                return error;
            });
    }

    update(id, doc) {
        return ProdutoModel.findOneAndUpdate({ _id: id }, doc).exec()
        .then(update_response => {
            if (!update_response) {
                return {
                    status: httpStatusCode.BAD_REQUEST,
                    response: {
                        message: dbQueryResponses.NO_ID_FOUND,
                        content: null
                    }
                }
            }
            else {
                return {
                    status: httpStatusCode.OK,
                    response: {
                        message: dbQueryResponses.UPDATED_SUCCESSFULLY,
                        content: update_response
                    }
                }
            }
        })
        .catch(error => {
            console.error(error.message, error);
            return error;
        });
        {
        /*verifica se o doc possui o parametro nome
        // let filter = {}
        // for (let key in doc) {
        //     if (key === dbModels.PRODUTO.nome) {
        //         filter[dbModels.PRODUTO.nome] = doc[dbModels.PRODUTO.nome];
        //         break;
        //     }
        // }
        // console.log(filter);

        // //verifica se já não existe um outro produto com esse nome no banco de dados
        // return ProdutoModel.findOne( filter ).exec()
        // .then( query_result => {
        //     //se nenhum produto com o mesmo nome for encontrado
        //     //console.log( query_result );
        //     if( query_result._id === id ){
        //         ProdutoModel.updateOne({ _id: id }, doc ).exec()
        //         .then(update_response => {
        //             if( !update_response ){
        //                 return {
        //                     status: httpStatusCode.BAD_REQUEST,
        //                     response: {
        //                         message: dbQueryResponses.NO_ID_FOUND,
        //                         content: null
        //                     }
        //                 }                                 
        //             }
        //             else{
        //                 return {
        //                     status: httpStatusCode.OK,
        //                     response: {
        //                         message: dbQueryResponses.UPDATED_SUCCESSFULLY,
        //                         content: update_response
        //                     }
        //                 }
        //             }
        //         })
        //         .catch( error => {
        //             console.error(error.message, error);
        //             return error;
        //         })
        //     }
        //     else{
        //        return {
        //            status: httpStatusCode.BAD_REQUEST,
        //            response: {
        //                message: `Já existe um produto com esse nome no banco de dados`,
        //                content: formatToRead( query_result )
        //            }
        //        } 
        //     }
        // })           
        // .catch(error => {
        //     console.error(error.message, error);
        //     return error;
        // })*/
        }
    }

    delete(id) {
        return ProdutoModel.deleteOne({ _id: id }).exec()
            .then(query_result => {
                if (query_result.deletedCount <= 0) {
                    return {
                        status: httpStatusCode.BAD_REQUEST,
                        response: {
                            message: dbQueryResponses.NO_ID_FOUND,
                            content: null,
                        }
                    }
                }
                else {
                    return {
                        status: httpStatusCode.OK,
                        response: {
                            message: dbQueryResponses.DELETED_SUCCESSFULLY,
                            content: null
                        }
                    }
                }
            })
            .catch(error => {
                console.error(error.message, error);
                return error;
            });
    }
}

/*************************************** FUNÇOES AUXILIARES *****************************************************/
/**  
* Função que recebe um documento do banco de dados e retorna um documento formatado para leitura      
* @param { Document } unformated_doc Documento em formato 'bruto' vindo do banco de dados
* @returns { Document } Documento formatado   
*/
const formatToRead = function (unformated_doc) {
    let id_do_produto = ( unformated_doc._id ) ? unformated_doc._id : 'id nula';
    let nome_do_produto = ( unformated_doc.nome ) ? unformated_doc.nome.toUpperCase().charAt(0) + unformated_doc.nome.slice(1).toLowerCase() : 'Nome nulo';
    let preco_do_produto = ( unformated_doc.preco ) ? unformated_doc.preco : -1;
    let em_estoque = ( unformated_doc.qtd_em_estoque ) ? unformated_doc.qtd_em_estoque : -1;
    let url_imagem = ( unformated_doc.imagemURL ) ? unformated_doc.imagemURL : 'sem URL';

    //monta o documento formatado para retornar
    let formated_doc = {
        id: id_do_produto,
        nome: nome_do_produto,
        valor: `${currencies.REAL}${preco_do_produto.toFixed(2)}`,
        estoque: `${em_estoque} unidade${(em_estoque == 1) ? '.' : 's.'}`,
        imagem: url_imagem
    }
    return formated_doc;
};

const formatToSave = function (unformated_doc) {
    let formated_doc = {}
    formated_doc[dbModels.PRODUTO.campos.id] = unformated_doc.id;
    formated_doc[dbModels.PRODUTO.campos.nome] = unformated_doc.nome;
}
module.exports = ProdutoRepository;