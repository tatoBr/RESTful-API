const express = require( 'express' );
const UsuarioController = require( '../controllers/usuario-controller' );

const router = express.Router();
const controller = new UsuarioController();

router.post('/signup', controller.criar_usuario.bind( controller ));
router.post('/login', controller.logar_usuario.bind( controller ));
router.get( '/', controller.listar_usuarios.bind( controller ));
router.get('/:id', controller.buscar_usuario.bind( controller ));
router.patch('/:id', controller.atualizar_usuario.bind( controller ));
router.delete('/:id', controller.deletar_usuario.bind( controller ));

module.exports = router;