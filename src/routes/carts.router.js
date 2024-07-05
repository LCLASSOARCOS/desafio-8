//carts-manager-db.js
import express from "express";
const router = express.Router();
import CartsController from "../controllers/carts.controller.js";
import authMiddleware from "../middleware/authmiddleware.js";
const cartsController = new CartsController();
router.use(authMiddleware);
import CartsService from "../service/carts.service.js";
const cs = new CartsService();
router.post('/', cartsController.addCart);

router.delete('/:cid', cartsController.deleteCart);
router.post('/:cid/product/:pid', cartsController.addProductToCart);
router.get('/', cartsController.getCarts);
router.get('/:cid', cartsController.getCartById);
router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const result = await cs.deleteProductCart(cid, pid);
        if (result.status) {
            res.json({ status: 'success' });
        } else {
            res.json({ status: 'failure' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
router.put('/:cid', cartsController.updateCart);
router.put('/:cid/product/:pid', cartsController.updateProductsQuantityCart);
router.delete('/:cid', cartsController.emptyCart);

export default router;

