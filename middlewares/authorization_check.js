const jwt = require( 'jsonwebtoken' );
const { httpStatusCode, misc: { jwt_secret }} = require( '../bin/variables' );

module.exports = ( req, res, next )=>{
    try {       
        let verified = jwt.verify( req.body.token, process.env.JWT_SECRET || jwt_secret ); //verifica se o token é válido
        req.verifiedData = verified; //adiciona os dados resultantes da verificação ao objeto da resposta
        next();
    } catch (error) {
        //se a verificação falhar, retorna um erro
        console.log( error );
        res.status( httpStatusCode.UNAUTHORIZED ).json({
            message: "Você não tem autorização para acessar esse recurso.",
            content: error
        })
    }
}