import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Cart } from './entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeValue } from '../attributes/entities/attribute-value.entity';
import { cartController } from './cart.controller';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { authenticate } from '../auth/middlewares/auth.middleware';

const router = Router();
const cartRepository = AppDataSource.getRepository(Cart);
const productRepository = AppDataSource.getRepository(Product);
const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeValueRepository = AppDataSource.getRepository(AttributeValue);
const ctrl = cartController(cartRepository, productRepository, attributeRepository, attributeValueRepository);

/**
 * @swagger
 * /api/v1/cart/add:
 *   post:
 *     summary: Add item to cart
 *     description: Add a product to the shopping cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartDto'
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *       400:
 *         description: Validation error or invalid data
 *       404:
 *         description: Product not found
 */
router.post('/add', validateDto(AddToCartDto), ctrl.addToCart);

/**
 * @swagger
 * /api/v1/cart/items:
 *   get:
 *     summary: Get cart items
 *     description: Retrieve all items in the shopping cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart items retrieved successfully
 */
router.get('/items', ctrl.getCart);

/**
 * @swagger
 * /api/v1/cart/summary:
 *   get:
 *     summary: Get cart summary
 *     description: Get a summary of the cart including totals and item count
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart summary retrieved successfully
 */
router.get('/summary', ctrl.getCartSummary);

/**
 * @swagger
 * /api/v1/cart/coupon-validation:
 *   get:
 *     summary: Get cart for coupon validation
 *     description: Get cart data specifically for coupon validation purposes
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart data retrieved for coupon validation
 */
router.get('/coupon-validation', ctrl.getCartForCouponValidation);

/**
 * @swagger
 * /api/v1/cart/{id}:
 *   put:
 *     summary: Update cart item
 *     description: Update quantity or attributes of a cart item
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartDto'
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       400:
 *         description: Validation error or invalid data
 *       404:
 *         description: Cart item not found
 */
router.put('/:id', validateDto(UpdateCartDto), ctrl.updateCartItem);

/**
 * @swagger
 * /api/v1/cart/remove/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a specific item from the shopping cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item unique identifier
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       404:
 *         description: Cart item not found
 */
router.delete('/remove/:id', ctrl.removeFromCart);

/**
 * @swagger
 * /api/v1/cart/clear:
 *   delete:
 *     summary: Clear cart
 *     description: Remove all items from the shopping cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
router.delete('/clear', ctrl.clearCart);

export default router; 