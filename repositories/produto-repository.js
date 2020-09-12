const ProdutoModel = require('../models/produto-model');
const { dbModels, currencies, httpStatusCode, dbQueryResponses } = require('../bin/variables');
const Response = require('../bin/helpers/response');

//Classe que representa o repositório dos produtos
class ProdutoRepository {
    /**
     * Construtor do Repositório
     */
    constructor() { }
    
    /**
     * Salva um documento no banco de dados
     * @param { Document } document
     * @returns { Promise<Response> } uma promessa de que o documento será salvo no banco de dados 
     */
    create(document) {
        let produto = new ProdutoModel(document);

        //Busca na base de dados por um produto com o mesmo nome passado no parametro
        return ProdutoModel.findOne({ nome: document.nome })
            .then(query_result => {
                //Se nenhum produto for encontrado, segue com a criaçãp
                if (!query_result) {
                    //salva o novo produto na base
                    return produto.save()
                        .then(saved_doc => new Response(httpStatusCode.CREATED, dbQueryResponses.CREATED, saved_doc))
                        .catch(error => {
                            console.error(error.message, error);
                            return new Response(httpStatusCode.INTERNAL_SERVER_ERROR, error.message, null, error);
                        });
                }
                else {
                    //se o produto já existe, retorna o produto e o aviso de redundância
                    return new Response(
                        httpStatusCode.CONFLICT,
                        dbQueryResponses.NOT_CREATED + dbQueryResponses.REDUNDENT,
                        query_result);
                }
            })
            .catch(error => {
                console.error(error.message, error);
                return new Response(httpStatusCode.INTERNAL_SERVER_ERROR, error.message, null, error);
            });
    }

    /**
     * Busca uma lista de documentos no Banco de Dados
     * @returns { Promise<Response> } uma promessa de buscar uma lista de documentos no banco de dados
     */
    readAll() {
        return ProdutoModel.find().exec()
            .then(query_result => {
                //se o retorno não for um array ou um array vázio
                if (!Array.isArray(query_result) || query_result.length <= 0) {
                    return new Response(httpStatusCode.NOT_FOUND, dbQueryResponses.EMPTY_LIST, query_result);
                }
                else {
                    return new Response(httpStatusCode.OK, dbQueryResponses.LIST_RETRIEVED, query_result);
                }
            })
            .catch(error => {
                console.error(error.message, error);
                return error;
            });
    }

    /**
     * Busca um documento que tenha a mesma id passada no parâmetro
     * @param { String } id - ID do documento
     * @returns { Promise< Response > } - uma promessa de uma Resposta do Banco de Dados
     */
    read(id) {
        return ProdutoModel.findById(id).exec()
            .then(query_result => {
                //Verifica se a query retornou um documento ou vazia
                if (!query_result) {
                    return new Response(httpStatusCode.NOT_FOUND, dbQueryResponses.NO_ID_FOUND, {});
                }
                else {
                    return new Response(httpStatusCode.OK, dbQueryResponses.DOC_RETRIEVED, query_result);
                }
            })
            .catch(error => {
                console.error(error.message, error);
                return new Response(httpStatusCode.INTERNAL_SERVER_ERROR, error.message, null, error);
            });
    }

    /**
     * Busca e Atualiza um documento que tenha a mesma id passada no parametro
     * @param { Number } id - id do documento à ser atualizado
     * @param { Object } doc - documento com dados à serem atualizados
     * @returns { Promise< Response > } - - uma promessa de uma Resposta do Banco de Dados
     */
    update(id, doc) {
        return ProdutoModel.updateOne({ _id: id }, doc).exec()
            .then(update_response => {
                //verifica se algum documento foi modificado            
                if (update_response.nModified <= 0) {
                    return new Response(httpStatusCode.OK, dbQueryResponses.NONE_UPDATED, {});
                }
                else {
                    //Busca no Banco de Dados o documento atualizado e retorna
                    return ProdutoModel.findById(id).exec()
                        .then(query_result => new Response(httpStatusCode.OK, dbQueryResponses.UPDATED_SUCCESSFULLY, query_result))
                        .catch(error => new Response(httpStatusCode.INTERNAL_SERVER_ERROR, error.message, null, error));
                }
            })
            .catch(error => {
                console.error(error.message, error);
                return new Response(httpStatusCode.INTERNAL_SERVER_ERROR, error.message, null, error);
            });
    }

    /**
     * Deleta do banco de dados o documento com id passada 
     * @param {*} id - ID do documento
     * @returns { Promise<Response> } promessa de uma Resposta do Banco de Dados
     */
    delete(id) {        
        
        return ProdutoModel.deleteOne({ _id: id }).exec()
        .then( query_result => {
            //Verifica se algum documento foi deletado
            if ( query_result.deletedCount <= 0 ) {
                return new Response( httpStatusCode.NOT_FOUND, dbQueryResponses.NO_ID_FOUND + dbQueryResponses.FAIL_TO_DELETE, {});
            }
            else {
                return new Response( httpStatusCode.OK, dbQueryResponses.DELETED_SUCCESSFULLY, {});
            }
        })
        .catch(error => {
            console.error(error.message, error);
            return new Response( httpStatusCode.INTERNAL_SERVER_ERROR, error.message, null, error );
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
    let id_do_produto = (unformated_doc._id) ? unformated_doc._id : 'id nula';
    let nome_do_produto = (unformated_doc.nome) ? unformated_doc.nome.toUpperCase().charAt(0) + unformated_doc.nome.slice(1).toLowerCase() : 'Nome nulo';
    let preco_do_produto = (unformated_doc.preco) ? unformated_doc.preco : -1;
    let em_estoque = (unformated_doc.qtd_em_estoque) ? unformated_doc.qtd_em_estoque : -1;
    let url_imagem = (unformated_doc.imagemURL) ? unformated_doc.imagemURL : 'sem URL';

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