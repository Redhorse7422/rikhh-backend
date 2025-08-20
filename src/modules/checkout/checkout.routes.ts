import { Router } from "express";
import { AppDataSource } from "../../config/database";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { OrderStatusHistory } from "./entities/order-status-history.entity";
import { ShippingAddress } from "./entities/shipping-address.entity";
import { Coupon } from "../coupon/coupon.entity";
import { Cart } from "../cart/entities/cart.entity";
import { Product } from "../products/entities/product.entity";
import { User } from "../user/user.entity";
import { Address } from "../address/address.entity";
import { checkoutController } from "./checkout.controller";
import { validateDto } from "../../common/middlewares/validation.middleware";
import { CheckoutInitiateDto } from "./dto/checkout-initiate.dto";
import { ShippingAddressDto } from "./dto/shipping-address.dto";
import { ApplyCouponDto } from "./dto/apply-coupon.dto";
import { ConfirmOrderDto } from "./dto/confirm-order.dto";
import { UpdateCheckoutAddressDto } from "./dto/update-checkout-address.dto";
import {
  authenticate,
  optionalAuth,
} from "../auth/middlewares/auth.middleware";
import { ORDER_STATUS, PAYMENT_STATUS } from "./entities/order.enums";

const router = Router();

// Initialize repositories
const orderRepository = AppDataSource.getRepository(Order);
const orderItemRepository = AppDataSource.getRepository(OrderItem);
const orderStatusHistoryRepository =
  AppDataSource.getRepository(OrderStatusHistory);
const shippingAddressRepository = AppDataSource.getRepository(ShippingAddress);
const couponRepository = AppDataSource.getRepository(Coupon);
const cartRepository = AppDataSource.getRepository(Cart);
const productRepository = AppDataSource.getRepository(Product);
const userRepository = AppDataSource.getRepository(User);
const addressRepository = AppDataSource.getRepository(Address);

// Initialize controller
const ctrl = checkoutController(
  orderRepository,
  orderItemRepository,
  orderStatusHistoryRepository,
  shippingAddressRepository,
  couponRepository,
  cartRepository,
  productRepository,
  userRepository,
  addressRepository
);

/**
 * @swagger
 * /api/v1/checkout/initiate:
 *   post:
 *     summary: Initiate checkout process
 *     description: Start the checkout process for both authenticated and guest users
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutInitiateDto'
 *     responses:
 *       201:
 *         description: Checkout initiated successfully
 *       400:
 *         description: Validation error or invalid data
 */
router.post(
  "/initiate",
  optionalAuth,
  validateDto(CheckoutInitiateDto),
  ctrl.initiateCheckout
);

/**
 * @swagger
 * /api/v1/checkout/calculate-shipping:
 *   post:
 *     summary: Calculate shipping costs
 *     description: Calculate shipping costs for the current checkout session
 *     tags: [Checkout]
 *     responses:
 *       200:
 *         description: Shipping costs calculated successfully
 *       400:
 *         description: Invalid checkout data
 */
router.post("/calculate-shipping", optionalAuth, ctrl.calculateShipping);

/**
 * @swagger
 * /api/v1/checkout/calculate-shipping-preview:
 *   post:
 *     summary: Calculate shipping costs (preview)
 *     description: Calculate shipping costs without requiring a checkout session
 *     tags: [Checkout]
 *     responses:
 *       200:
 *         description: Shipping costs calculated successfully
 *       400:
 *         description: Invalid shipping data
 */
router.post("/calculate-shipping-preview", optionalAuth, ctrl.calculateShippingWithoutSession);

/**
 * @swagger
 * /api/v1/checkout/calculate-tax:
 *   post:
 *     summary: Calculate tax
 *     description: Calculate tax for the current checkout
 *     tags: [Checkout]
 *     responses:
 *       200:
 *         description: Tax calculated successfully
 *       400:
 *         description: Invalid checkout data
 */
router.post("/calculate-tax", optionalAuth, ctrl.calculateTax);

/**
 * @swagger
 * /api/v1/checkout/apply-coupon:
 *   post:
 *     summary: Apply coupon to checkout
 *     description: Apply a coupon code to the current checkout session
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyCouponDto'
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *       400:
 *         description: Invalid coupon or validation error
 */
router.post(
  "/apply-coupon",
  optionalAuth,
  validateDto(ApplyCouponDto),
  ctrl.applyCoupon
);

/**
 * @swagger
 * /api/v1/checkout/confirm-order:
 *   post:
 *     summary: Confirm and place order
 *     description: Confirm the checkout and create the final order
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmOrderDto'
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Validation error or invalid data
 *       500:
 *         description: Order creation failed
 */
router.post(
  "/confirm-order",
  optionalAuth,
  validateDto(ConfirmOrderDto),
  ctrl.confirmOrder
);

/**
 * @swagger
 * /api/v1/checkout/session/{checkoutId}:
 *   get:
 *     summary: Get checkout session
 *     description: Retrieve checkout session data with addresses populated
 *     tags: [Checkout]
 *     parameters:
 *       - in: path
 *         name: checkoutId
 *         required: true
 *         schema:
 *           type: string
 *         description: Checkout session identifier
 *     responses:
 *       200:
 *         description: Checkout session retrieved successfully
 *       404:
 *         description: Checkout session not found
 */
router.get("/session/:checkoutId", optionalAuth, ctrl.getCheckoutSession);

/**
 * @swagger
 * /api/v1/checkout/address:
 *   put:
 *     summary: Update checkout address
 *     description: Update shipping address for guest users
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCheckoutAddressDto'
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Validation error or invalid data
 */
router.put(
  "/address",
  optionalAuth,
  validateDto(UpdateCheckoutAddressDto),
  ctrl.updateCheckoutAddress
);

/**
 * @swagger
 * /api/v1/checkout/orders:
 *   get:
 *     summary: Get user orders
 *     description: Retrieve orders for both authenticated and guest users
 *     tags: [Checkout]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get("/orders", optionalAuth, ctrl.getOrders);

/**
 * @swagger
 * /api/v1/checkout/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve a specific order by its ID
 *     tags: [Checkout]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order unique identifier
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get("/orders/:id", optionalAuth, ctrl.getOrderById);

/**
 * @swagger
 * /api/v1/checkout/addresses:
 *   get:
 *     summary: Get user addresses
 *     description: Retrieve saved addresses for authenticated users
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get("/addresses", authenticate, ctrl.getUserAddresses);

/**
 * @swagger
 * /api/v1/checkout/addresses/default:
 *   get:
 *     summary: Get default addresses
 *     description: Retrieve default shipping and billing addresses
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default addresses retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get("/addresses/default", authenticate, ctrl.getDefaultAddresses);

export default router;
