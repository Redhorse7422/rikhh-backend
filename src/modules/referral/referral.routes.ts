import { Router } from "express";
import { referralController } from "./referral.controller";
import { validateDto } from "../../common/middlewares/validation.middleware";
import { CreateReferralCodeDto, CreateReferralDto, ValidateReferralCodeDto, ActivateReferralDto, CompleteReferralDto, MarkCommissionPaidDto } from "./dto/create-referral.dto";
import { authenticate } from "../auth/middlewares/auth.middleware";

const router = Router();
const ctrl = referralController();

/**
 * @swagger
 * /api/v1/referrals/codes:
 *   post:
 *     summary: Create a new referral code
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReferralCodeDto'
 *     responses:
 *       201:
 *         description: Referral code created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  "/codes",
  authenticate,
  validateDto(CreateReferralCodeDto),
  ctrl.createReferralCode
);

/**
 * @swagger
 * /api/v1/referrals:
 *   post:
 *     summary: Create a new referral
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReferralDto'
 *     responses:
 *       201:
 *         description: Referral created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  "/",
  authenticate,
  validateDto(CreateReferralDto),
  ctrl.createReferral
);

/**
 * @swagger
 * /api/v1/referrals/validate:
 *   post:
 *     summary: Validate a referral code
 *     tags: [Referrals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateReferralCodeDto'
 *     responses:
 *       200:
 *         description: Referral code validated
 *       400:
 *         description: Invalid referral code
 */
router.post(
  "/validate",
  validateDto(ValidateReferralCodeDto),
  ctrl.validateReferralCode
);

/**
 * @swagger
 * /api/v1/referrals/activate:
 *   post:
 *     summary: Activate a referral
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivateReferralDto'
 *     responses:
 *       200:
 *         description: Referral activated successfully
 *       400:
 *         description: Bad request
 */
router.post(
  "/activate",
  authenticate,
  validateDto(ActivateReferralDto),
  ctrl.activateReferral
);

/**
 * @swagger
 * /api/v1/referrals/complete:
 *   post:
 *     summary: Complete a referral
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteReferralDto'
 *     responses:
 *       200:
 *         description: Referral completed successfully
 *       400:
 *         description: Bad request
 */
router.post(
  "/complete",
  authenticate,
  validateDto(CompleteReferralDto),
  ctrl.completeReferral
);

/**
 * @swagger
 * /api/v1/referrals/stats/{userId}:
 *   get:
 *     summary: Get user referral statistics
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User referral statistics retrieved
 *       400:
 *         description: Bad request
 */
router.get(
  "/stats/:userId",
  authenticate,
  ctrl.getUserReferralStats
);

/**
 * @swagger
 * /api/v1/referrals/codes/{userId}:
 *   get:
 *     summary: Get user referral codes
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User referral codes retrieved
 *       400:
 *         description: Bad request
 */
router.get(
  "/codes/:userId",
  authenticate,
  ctrl.getUserReferralCodes
);

/**
 * @swagger
 * /api/v1/referrals/{userId}:
 *   get:
 *     summary: Get user referrals
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User referrals retrieved
 *       400:
 *         description: Bad request
 */
router.get(
  "/:userId",
  authenticate,
  ctrl.getUserReferrals
);

/**
 * @swagger
 * /api/v1/referrals/commissions/pending/{userId}:
 *   get:
 *     summary: Get pending commissions for a user
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pending commissions retrieved
 *       400:
 *         description: Bad request
 */
router.get(
  "/commissions/pending/:userId",
  authenticate,
  ctrl.getPendingCommissions
);

/**
 * @swagger
 * /api/v1/referrals/commissions/paid:
 *   post:
 *     summary: Mark commission as paid
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarkCommissionPaidDto'
 *     responses:
 *       200:
 *         description: Commission marked as paid
 *       400:
 *         description: Bad request
 */
router.post(
  "/commissions/paid",
  authenticate,
  validateDto(MarkCommissionPaidDto),
  ctrl.markCommissionAsPaid
);

// Internal endpoints for processing commissions
router.post(
  "/process-order-commission/:orderId",
  ctrl.processOrderCommission
);

router.post(
  "/process-seller-commission/:sellerId",
  ctrl.processSellerReferralCommission
);

export default router;
