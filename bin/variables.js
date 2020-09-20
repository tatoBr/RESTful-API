module.exports = {
    port : process.env.PORT || 8000,    
    httpStatusCode : {
        OK : 200,
        CREATED : 201,        
        ACCEPTED : 202,
        BAD_REQUEST : 400,
        UNAUTHORIZED: 401,
        NOT_FOUND : 404,
        CONFLICT: 409,
        INTERNAL_SERVER_ERROR : 500
    },
    multer_setup: {
        isFileTypeAccepted: ( mimetype ) => {
            return mimetype === 'image/jpeg' || mimetype === 'image/jpg' || mimetype === 'image/png'
        }                
    },
    dbConnectionUri : `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASSWORD }@aifooddb.ghkbc.gcp.mongodb.net/${ process.env.DB_NAME }?retryWrites=true&w=majority`,
    dbModels: {
        USER: {
            model_name: "Usuario",
            campos: {
                id: '_id',
                nomeDeUsuario: 'user_name',
                nome: 'nome',
                sobrenome: 'sobre_nome',
                cpf: 'cadastro_pessoa_fisica',
                email: 'email',
                senha: 'senha',
                failed_login_attempts: 'loginFail',
                blocked_until: 'blockEndTime',
                dataDeNascimento: 'data_nasc',
                pedidos: '_idPedidos'
            }
        },        
        PRODUTO : {
            nome: "Produto",
            campos : {
                id: '_id',
                nome: 'nome',
                preco: 'preco',
                estoque: 'estoque',
                imagem: 'imagemURL'
            },
            defaultURLimage: 'imagens\\default\\default_product.jpg'
        },
        PEDIDO : {
            nome: "Pedido",
            campos : {
                id : '_id',
                comprador: 'comprador',
                lista_de_produtos: 'lista',
                id_do_produto : 'produtoId',
                qtd_do_produto : 'quantidade'
            }
        },
    },
    dbQueryResponses: {
        CREATED: "Documento salvo com sucesso no banco de dados. ",        
        NOT_CREATED: "Não Foi possivel criar o Documento na base de dados. ",
        REDUNDENT: "Documento já existe. ",
        LIST_RETRIEVED: "Lista de Documentos lida com sucesso no Banco de Dados. ",
        DOC_RETRIEVED: "Documento com ID passada encontrado no banco de dados. ",
        FAIL_TO_RETRIEVE: "Não foi possível encontrar o documento no banco de dados. ",
        EMPTY_LIST: "Não há Documentos salvos nesta lista do Banco de Dados. ",
        NO_ID_FOUND: "Nenhum documento encontrado. ",
        DELETED_SUCCESSFULLY: "Documento deletado com sucesso. ",
        FAIL_TO_DELETE: "Nenhum Documento foi apagado. ",
        UPDATED_SUCCESSFULLY: "Documento atualizado com sucesso. ",
        FAIL_TO_UPDATE: "Não foi possivel atualizar o documento no banco de dados. ",
        NONE_UPDATED: "Nenhum documento foi atualizado. "
    },
    currencies: {
        REAL : 'R$'
    },
    misc: {
        emailRegEx : /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
        jwt_secret : 'This is a secret'
    }
}