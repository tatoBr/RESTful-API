const UsuarioRepository = require('../repositories/usuario-repository');
const Validator = require('../bin/helpers/validator');
const bcrypt = require('bcrypt');
const jwt = require( 'jsonwebtoken' );
const mongoose = require('mongoose');
const { misc: { jwt_secret }, dbModels: { USER }, httpStatusCode, dbModels } = require('../bin/variables');
const { query } = require('express');

/** Class representing a User Controller */
class UsuarioController {
    /**
     * User Controller constructor
     */
    constructor() {
        this._repo = new UsuarioRepository();
        this._validator = new Validator();
    }

    /**
     * cria um novo usuário
     * @param { Object } req 
     * @param { Object } res 
     */
    criar_usuario(req, res) {
        //recupera os dados da requisição.
        let usuario = {};
        usuario[USER.campos.id] = new mongoose.Types.ObjectId()
        usuario[USER.campos.nomeDeUsuario] = req.body.apelido;
        usuario[USER.campos.nome] = req.body.nome;
        usuario[USER.campos.sobrenome] = req.body.sobrenome;
        usuario[USER.campos.cpf] = req.body.cpf;
        usuario[USER.campos.email] = req.body.email;
        usuario[USER.campos.pedidos] = [];
        usuario[USER.campos.dataDeNascimento] = new Date();

        //tenta criptografar a senha
        bcrypt.hash(req.body.senha, 8, (error, hash) => {
            //se ocorer um erro durante a criptografia, responde com o erro
            if (error) {
                console.error(error);
                res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
                    message: error.message,
                })
            }
            //se a criptografia for bem sucedida, segue com a criação do usuário
            else {
                //salva a hash da senha no campo 'senha' do documento
                usuario[USER.campos.senha] = hash;

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

    logar_usuario(req, res, next) {
        //recupera os dados do corpo da requisição
        const email = req.body.email;
        const username = req.body.username;
        const senha = req.body.senha;

        //involca o repositorio para completar a ação no banco de dados
        //Verifica se existe no banco de dados um usuario com email ou nome de usuario correspoendente
        this._repo.readAll({ $or: [
            {[ USER.campos.nomeDeUsuario ]: username },
            {[ USER.campos.email ] : email }
        ]})
        .then( query_result =>{
            const authfail = () => { return res.status( httpStatusCode.BAD_REQUEST ).json({ message : "Falha na authenticação" })};
            let users = query_result.getResponse().content;
            
            //se a query retornar vazia, então o usuario nao esta cadastrado. retorna erro
            if (!Array.isArray( users ) || users.length <= 0) authfail();

            //se o usuario for encontrado, checar correspondência da senha passada com a senha do banco de dados
            else {
                let user = users[0];
                let payload = {
                    id: user[ USER.campos.id ],
                    username: user[ USER.campos.nomeDeUsuario],
                    email: user[ USER.campos.email ]
                }
                let token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET || jwt_secret,
                    { expiresIn: "30m"})
                bcrypt.compare( senha, user.senha, ( error, comparation_result ) => {
                    if( error ) authfail(); //retorna erro se a comparação for mal sucedida
                    else if( !comparation_result ) authfail(); // retorna erro se as senhas não corresponder
                    else{     
                        res.set( 'Authorization', token );                   
                        res.status( httpStatusCode.OK ).json({
                        message: "Usuario authenticado",
                        content: formatToRead( user )                       
                    })}// retorna ok se as senhas correspondem                     
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

    listar_usuarios(req, res) {
        this._repo.readAll()
            .then(result => { res.status(result.getStatusCode()).json(result.getResponse()); })
            .catch(error => {
                res.status(httpStatusCode.INTERNAL_SERVER_ERROR).json({
                    message: error.message,
                    content: error
                });
            })
    }

    buscar_usuario(req, res) {
        const id = req.params.id;

        if (!this._validator.idFormatIsValid(id)) {
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

    atualizar_usuario(req, res) {
        //verifica autenticidade da id
        const id = req.params.id;

        if (!this._validator.idFormatIsValid(id)) {
            return res.status(httpStatusCode.BAD_REQUEST).json({
                message: 'Formato de Id Inválido.',
                content: id
            });
        }

        //recupera os dados da requisição;
        let filter = {}
        for (let key in req.body) {
            filter[key] = req.body[key];
            if (!filter[key]) {
                return res.status(httpStatusCode.BAD_REQUEST).json({
                    message: `valor da propriedade ${key} é inválido.`,
                    content: filter[key]
                });
            }
        }

        //involca o repositorio para completar a ação no banco de dados
        this._repo.update(id, filter)
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

    deletar_usuario(req, res) {
        //verifica autenticidade da id
        const id = req.params.id;

        if (!this._validator.idFormatIsValid(id)) {
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

module.exports = UsuarioController;