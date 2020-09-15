const UsuarioRepository = require('../repositories/usuario-repository');
const { validateId, validateUserRegister, validateUserUpdate } = require('../bin/helpers/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { misc: { jwt_secret }, dbModels: { USER }, httpStatusCode, dbModels } = require('../bin/variables');


/** Class representing a User Controller */
class UsuarioController {
    /**
     * User Controller constructor
     */
    constructor() {
        this._repo = new UsuarioRepository();
    }

    /**
     * cria um novo usuário
     * @param {*} req  requisição para o servidor
     * @param {*} res  resposta do servidor
     */
    criar_usuario(req, res) {
        //recupera os campos do modelo usuario.
        let { nomeDeUsuario, email, cpf, senha, nome, sobrenome } = USER.campos;

        //recupera os dados do corpo da requisição e monta um novo documento 
        let usuario = {};

        usuario[USER.campos.id] = new mongoose.Types.ObjectId()
        usuario[nomeDeUsuario] = req.body.username;
        usuario[email] = req.body.email;
        usuario[cpf] = req.body.cpf;
        usuario[senha] = req.body.senha;
        usuario['confirmarsenha'] = req.body.confsenha;
        usuario[nome] = req.body.nome;
        usuario[sobrenome] = req.body.sobrenome;
        usuario[USER.campos.dataDeNascimento] = new Date();

        //faz a validação dos dados e retorna um erro se alguma propriedade tiver valor inválido
        const { error } = validateUserRegister(usuario);
        if (error) {
            let { details: [{ message }] } = error;
            return res.status(httpStatusCode.BAD_REQUEST).json({
                message: message
            });
        }

        //tenta criptografar a senha
        bcrypt.hash(req.body.senha, 8, (error, hash) => {
            //se ocorer um erro durante a criptografia, responde com o erro
            if (error) {
                console.error(error);
                res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
                    message: error.message,
                    content: error
                })
            }
            //se a criptografia for bem sucedida, segue com a criação do usuário
            else {
                //salva a hash da senha no campo 'senha' do documento
                usuario[USER.campos.senha] = hash;
                //cria uma id para o documento
                usuario[USER.ID]
                //envia o documento para o repositório para q esse complete a transação com o banco de dados
                this._repo.create(usuario)
                    .then(result => { res.status(result.getStatusCode()).json(result.getResponse()); })
                    .catch(error => {
                        res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
                            message: error.message,
                            content: error
                        });
                    });
            }
        });
    }


    /**
     * busca a lista de usuários
     * @param {*} req requisição para o servidor
     * @param {*} res resposta do servidor
     */
    listar_usuarios(req, res) {
        this._repo.readAll()
            .then(result => { res.status(result.getStatusCode()).json(result.getResponse()); })
            .catch(error => {
                res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
                    message: error.message,
                    content: error
                });
            });
    }

    /**
     * busca um usuário específico pela ID
     * @param {*} req 
     * @param {*} res 
     */
    buscar_usuario(req, res) {
        const id = req.params.id;

        if (!validateId(id)) {
            return res.status(httpStatusCode.BAD_REQUEST).json({
                message: 'Formato de Id Inválido.',
                content: id
            });
        }

        this._repo.read(id)
            .then(result => { res.status(result.getStatusCode()).json(result.getResponse()); })
            .catch(error => {
                res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
                    message: error.message,
                    content: error
                });
            })
    }


    /**
    * Atualiza os dados de um usuário específico
    * @param {*} req 
    * @param {*} res 
    */
    atualizar_usuario(req, res) {
        const id = req.params.id;

        //recupera os campos do modelo usuario.
        let { nome, sobrenome, dataDeNascimento } = USER.campos

        //recupera os dados do corpo da requisição e monta um novo documento
        let usuarioAtualizado = {};
        usuarioAtualizado[ nome ] = req.body.nome;
        usuarioAtualizado[ sobrenome ] = req.body.sobreNome;
        usuarioAtualizado[ dataDeNascimento ] = req.body.dataDeNascimento;
        
        //verifica autenticidade da id
        if (!validateId( id )) {
            return res.status(httpStatusCode.BAD_REQUEST).json({
                message: 'Formato de Id Inválido.',
                content: id
            });
        }

        //faz a validação dos dados e retorna um erro se alguma propriedade tiver valor inválido
        let { error } = validateUserUpdate( usuarioAtualizado );
        if ( error ) {
            console.log( error );
            let { details: [{ message }] } = error;
            return res.status(httpStatusCode.BAD_REQUEST).json({
                message: message
            });
        }

        //involca o repositorio para completar a ação no banco de dados
        this._repo.update(id, usuarioAtualizado )
            .then(result => {
                res.status(result.getStatusCode()).json(result.getResponse());
            })
            .catch(error => {
                res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
                    message: error.message,
                    content: error
                });
            });
    }

    /**
     * apaga um usuário pela id
     * @param {*} req 
     * @param {*} res 
     */
    deletar_usuario(req, res) {
        //verifica autenticidade da id
        const id = req.params.id;

        if (!validateId(id)) {
            return res.status(httpStatusCode.BAD_REQUEST).json({
                message: 'Formato de Id Inválido.',
                content: id
            });
        }

        //Invoca o repositório para completar a ação no banco de dados
        this._repo.delete(id)
            .then(resust => {
                res.status(resust.getStatusCode()).json(resust.getResponse());
            })
            .catch(error => {
                res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
                    message: error.message,
                    content: error
                });
            })
    }

    /**
     * Authentica um usuário e cria um token de acesso para o mesmo
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    logar_usuario(req, res, next) {
        //recupera os dados do corpo da requisição
        const email = req.body.email;
        const username = req.body.username;
        const senha = req.body.senha;

        //involca o repositorio para completar a ação no banco de dados
        //Verifica se existe no banco de dados um usuario com email ou nome de usuario correspoendente
        this._repo.readAll({
            $or: [
                { [ USER.campos.nomeDeUsuario ]: username },
                { [ USER.campos.email ]: email }
            ]
        })
            .then( query_result => {
                
                const authfail = () => { return res.status(httpStatusCode.BAD_REQUEST).json({ message: "Falha na authenticação" }) };
                let users = query_result.getResponse().content;

                //se a query retornar vazia, então o usuario nao esta cadastrado. retorna erro
                if (!Array.isArray( users ) || users.length <= 0) authfail();

                //se o usuario for encontrado, checar correspondência da senha passada com a senha do banco de dados
                else {
                    let user = users[0];
                    bcrypt.compare(senha, user.senha, (error, comparation_result) => {                        
                        if ( error ) authfail(); //retorna erro se a comparação for mal sucedida

                        else if ( !comparation_result ) authfail(); // retorna erro se as senhas não corresponder

                        //se as senhas corresponderem, cria um token de acesso e evia para o usuário
                        else {
                            //dados que serão gravados no token de acesso
                            let payload = {
                                id: user[USER.campos.id],
                                username: user[USER.campos.nomeDeUsuario],
                                email: user[USER.campos.email]
                            }

                            //cria o token propriamente dito
                            let token = jwt.sign( payload, process.env.JWT_SECRET || jwt_secret, { expiresIn: "30m" });

                            //anexa o token no cabeçalho da resposta
                            res.set('Authorization', token);

                            //envia a resposta
                            res.status( httpStatusCode.OK ).json({
                                message: "Usuario authenticado",
                                content: formatToRead(user)
                            })
                        }// retorna ok se as senhas correspondem                     
                    })
                }
            })
            .catch(error => {
                res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
                    message: error.message,
                    content: error
                });
            })
    }
}


/*************************************** FUNÇOES AUXILIARES *****************************************************/
/**  
* Função que recebe um documento do banco de dados e retorna um documento formatado para leitura      
* @param { Document } unformated_doc Documento em formato 'bruto' vindo do banco de dados
* @returns { Document } Documento formatado   
*/
const formatToRead = function (unformated_doc) {
    let userName = (unformated_doc[USER.campos.nomeDeUsuario]) ? unformated_doc[USER.campos.nomeDeUsuario] : "Campor UserName Vázio";
    let userId = (unformated_doc[USER.campos.id]) ? unformated_doc[USER.campos.id] : "Campo Id Vázia"
    let nome = (unformated_doc[USER.campos.nome]) ? unformated_doc[USER.campos.nome] : "Campo Primeiro Nome Vázio.";
    let sobreNome = (unformated_doc[USER.campos.sobrenome]) ? unformated_doc[USER.campos.sobrenome] : "Sobrenome Vázio.";
    let email = (unformated_doc[USER.campos.email]) ? unformated_doc[USER.campos.email] : "Campo email Vázio."
    let pedidos = (unformated_doc[USER.campos.pedidos]) ? unformated_doc[USER.campos.pedidos] : ["Campo", "Pedidos", "Vázio."]

    let formated_doc = {
        userId: userId,
        nome_de_usuario: userName,
        nome_completo: `${nome} ${sobreNome}`,
        email: email,
        pedidos: pedidos
    };

    return formated_doc;
};

module.exports = UsuarioController;