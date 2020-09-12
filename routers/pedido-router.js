const express = require( 'express' );
const Controller = require( '../controllers/pedido-controller' );

const auth = require( '../middlewares/authorization_check' );

const router = express.Router();
const controller = new Controller();

router.post( '/', auth, controller.criar_pedido.bind( controller ) );
router.get( '/', controller.listar_pedidos.bind( controller ) );
router.get( '/:id', controller.buscar_pedido.bind( controller ) );
router.patch( '/:id', auth, controller.atualizar_pedido.bind( controller ) );
router.delete( '/:id', auth, controller.apagar_pedido.bind( controller ) );

module.exports = router;

