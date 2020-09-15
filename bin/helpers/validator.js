const joi = require( 'joi' );
const { dbModels } = require( '../variables' );

const validateId = ( id ) => {
    const regexp = new RegExp( '^[a-fA-F0-9]{24}$');
    return regexp.test( id );
}

const validateUserRegister = ( data ) => {
    const schema = joi.object({
        [ dbModels.USER.campos.id ] : joi.required(),
        [ dbModels.USER.campos.nomeDeUsuario ] : joi.string().pattern(new RegExp('^[\\S-_.a-zA-Z0-9]{3,30}$')).required(),
        [ dbModels.USER.campos.email ] : joi.string().email().required(),
        [ dbModels.USER.campos.cpf ] : joi.number().required(), 
        [ dbModels.USER.campos.senha ] : joi.string().pattern( new RegExp('^[\\S-_.a-zA-Z0-9]{6,30}$')).required(),
        [ 'confirmar' + dbModels.USER.campos.senha ] : joi.ref( dbModels.USER.campos.senha ),
        [ dbModels.USER.campos.nome ] : joi.string().pattern( /^[\s\w]{3,30}$/ ).min(3).max(30),
        [ dbModels.USER.campos.sobrenome ] : joi.string().pattern( /^[\s\w]{3,60}$/ ).min(3).max(30),
        [ dbModels.USER.campos.dataDeNascimento ] : joi.date()
    })

    return schema.validate( data );
}

const validateUserUpdate = ( data ) => {
    const schema = joi.object({
        [ dbModels.USER.campos.nome ] : joi.string().pattern( /^[\s\w]{3,30}$/ ).min(3).max(30),
        [ dbModels.USER.campos.sobrenome ] : joi.string().pattern( /^[\s\w]{3,60}$/ ).min(3).max(30),
        [ dbModels.USER.campos.dataDeNascimento ] : joi.date()
    })

    return schema.validate( data );
}

const validateProdutoRegister = ( data ) => {
    const { id, imagem, nome, preco, estoque } = dbModels.PRODUTO.campos;

    const schema = joi.object({
        [ id ] : joi.required(),
        [ imagem ] : joi.string().required(),
        [ nome ] : joi.string().required().trim(),
        [ preco ] : joi.number().required(),
        [ estoque ] : joi.number().required()
    });

    return schema.validate( data );
}

const validateProdutoUpdate = ( data ) => {
    const { imagem, nome, preco, estoque } = dbModels.PRODUTO.campos;

    const schema = joi.object({       
        [ imagem ] : joi.string(),
        [ nome ] : joi.string().min(3).max(30).trim(),
        [ preco ] : joi.number(),
        [ estoque ] : joi.number()
    });

    return schema.validate( data );
}

module.exports = {
    validateId,
    validateUserRegister, validateUserUpdate,
    validateProdutoRegister, validateProdutoUpdate
};