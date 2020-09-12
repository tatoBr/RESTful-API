const express = require( 'express' );
const Controller = require( '../controllers/pedido-controller' );

const router = express.Router();
const controller = new Controller();

router.post( '/', controller.criar_pedido.bind( controller ) );
router.get( '/', controller.listar_pedidos.bind( controller ) );
router.get( '/:id', controller.buscar_pedido.bind( controller ) );
router.patch( '/:id', controller.atualizar_pedido.bind( controller ) );
router.delete( '/:id', controller.apagar_pedido.bind( controller ) );

module.exports = router;

