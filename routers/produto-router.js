const express = require( 'express' );
const multer = require('multer');
const auth = require( '../middlewares/authorization_check');

const Controller = require( '../controllers/produto-controller' );

const router = express.Router()
const controller = new Controller();

/******************** Multer Setup ******************************/

//define onde os arquivos serão salvos e qual nome terão
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback( null, './imagens/produtos');
    },
    filename: ( req, file, callback ) => {
        let date = new Date().toISOString().replace(/[:._]/g, "-");
        let extension = file.mimetype.split( '/')[1];       
        let fileName = file.fieldname + date.toString() + "." + extension;        
        callback( null, fileName );
    }
})

//define quais formatos de arquivos serão aceitos
const fileFilter = (req, file, callback ) => {
    let isTypeOk = file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'
    callback( null, isTypeOk );
} 

//cria uma instancia do multer
const upload = multer({
    storage: storage,
    limits : {
        fileSize: 1024 * 1024 * 8 
    },
    fileFilter : fileFilter
});
/*********************************************************************/

router.post( '/', auth, upload.single('imagem'), controller.criar_produto.bind( controller ));
router.get( '/', controller.listar_produtos.bind( controller ) );
router.get( '/:id', controller.buscar_produto.bind( controller ) );
router.patch( '/:id', auth, controller.atualizar_produto.bind( controller )  );
router.delete( '/:id', auth, controller.apagar_produto.bind( controller ) );

module.exports = router;