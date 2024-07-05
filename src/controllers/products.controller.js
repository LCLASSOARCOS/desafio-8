import ProductsService from "../service/products.service.js";
import { createError, ERROR_TYPES } from '../utils/errorDirectory.js';
const ps = new ProductsService();

class ProductsController {
    async getProductsApi(req, res) {
        try {
            const { page = 1, limit = 10, sort, query } = req.query;
            //console.log('Request query parameters:', { page, limit, sort, query });

            const productList = await ps.getProducts({ page: parseInt(page), limit: parseInt(limit), sort, query });

            //console.log('Product list:', productList);

            if (!productList || !productList.docs || !Array.isArray(productList.docs)) {
                throw createError(ERROR_TYPES.SERVER_ERROR, "Lista de productos no es válida");
            }

            res.json({
                status: "success",
                products: productList.docs,
                hasPrevPage: productList.hasPrevPage,
                hasNextPage: productList.hasNextPage,
                prevPage: productList.prevPage,
                nextPage: productList.nextPage,
                currentPage: productList.page,
                totalPages: productList.totalPages,
            });
        } catch (error) {
            console.error("Error al obtener productos:", error.message);
            res.status(500).json({
                status: "error",
                error: "Error interno del servidor",
            });
        }
    }

    async getProductsView(req, res) {
        try {
            const { page = 1, limit = 2, sort, query } = req.query;
            //console.log('Request query parameters (view):', { page, limit, sort, query });

            const productList = await ps.getProducts({ page: parseInt(page), limit: parseInt(limit), sort, query });

            if (!productList || !productList.docs) {
               throw createError(ERROR_TYPES.SERVER_ERROR,"Lista de productos es indefinida o vacía");
            }

            //console.log('Product list (view):', productList);

            const requiredProperties = ['hasPrevPage', 'hasNextPage', 'prevPage', 'nextPage', 'page', 'totalPages'];

            requiredProperties.forEach(prop => {
                if (productList[prop] === undefined) {
                    throw createError(ERROR_TYPES.SERVER_ERROR,`La propiedad '${prop}' es indefinida en productList`);
                }
            });

            res.render("home", {
                user: req.session.user,
                products: productList.docs,
                hasPrevPage: productList.hasPrevPage,
                hasNextPage: productList.hasNextPage,
                prevPage: productList.prevPage,
                nextPage: productList.nextPage,
                currentPage: productList.page,
                totalPages: productList.totalPages,
            });
        } catch (error) {
            console.error("Error al obtener productos (view):", error.message);
            res.status(500).json({
                status: "error",
                error: "Error interno del servidor",
            });
        }
    }

    async getProductById(req, res) {
        try {
            const productId = req.params.pid;
            const product = await ps.getProductById(productId);

            if (product.status) {
                return res.status(200).json({
                    status: true,
                    product: product.product,
                    msg: "Producto encontrado exitosamente"
                });
            } else {
                throw createError(ERROR_TYPES.PRODUCT_NOT_FOUND, "Producto no encontrado");
            }
        } catch (error) {
            next(error);
        }
    }

    async addProduct(req, res) {
        try {
            const { title, description, price, thumbnail, code, stock, status, category } = req.body;
            if (!title || !price) {
                throw createError(ERROR_TYPES.MISSING_REQUIRED_FIELDS, "El título y el precio son campos requeridos", { title, price });
            }

            const respuesta = await ps.addProduct({ title, description, price, thumbnail, code, stock, status, category });

            if (respuesta.status) {
                return res.status(200).json(respuesta);
            } else {
                return res.status(400).json(respuesta);
            }
        } catch (error) {
            next(error);
        }
    }

    async updateProduct(req, res) {
        try {
            const productId = req.params.pid;
            const productData = req.body;
            const respuesta = await ps.updateProduct(productId, productData);

            if (respuesta.status) {
                return res.status(200).json(respuesta);
            } else {
                return res.status(400).json(respuesta);
            }
        } catch (error) {
            next(error);}
    }

    async deleteProduct(req, res) {
        try {
            const productId = req.params.pid;
            const respuesta = await ps.deleteProduct(productId);

            if (respuesta.status) {
                return res.status(200).json(respuesta);
            } else {
                throw createError(ERROR_TYPES.PRODUCT_NOT_FOUND, `Producto con ID ${productId} no encontrado.`);
            }
        } catch (error) {
            next(error);
        }
    }
}

export default ProductsController;