import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, Min, Max } from "class-validator";
import { REFERRAL_TYPE } from "../entities/referral.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateReferralCodeDto:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user creating the referral code
 *         type:
 *           $ref: '#/components/schemas/REFERRAL_TYPE'
 *         productId:
 *           type: string
 *           description: ID of the product (for product referrals)
 *         sellerId:
 *           type: string
 *           description: ID of the seller (for seller account referrals)
 *         commissionRate:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Commission rate percentage
 *         maxUsage:
 *           type: number
 *           minimum: 1
 *           description: Maximum number of times the code can be used
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Expiration date of the referral code
 *     CreateReferralDto:
 *       type: object
 *       required:
 *         - referrerId
 *         - referredId
 *         - type
 *         - referralCode
 *       properties:
 *         referrerId:
 *           type: string
 *           description: ID of the user making the referral
 *         referredId:
 *           type: string
 *           description: ID of the user being referred
 *         type:
 *           $ref: '#/components/schemas/REFERRAL_TYPE'
 *         referralCode:
 *           type: string
 *           description: The referral code being used
 *         productId:
 *           type: string
 *           description: ID of the product (for product referrals)
 *         sellerId:
 *           type: string
 *           description: ID of the seller (for seller account referrals)
 *         commissionRate:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Commission rate percentage
 *     ValidateReferralCodeDto:
 *       type: object
 *       required:
 *         - code
 *         - type
 *       properties:
 *         code:
 *           type: string
 *           description: The referral code to validate
 *         type:
 *           $ref: '#/components/schemas/REFERRAL_TYPE'
 *     ActivateReferralDto:
 *       type: object
 *       required:
 *         - referralId
 *       properties:
 *         referralId:
 *           type: string
 *           description: ID of the referral to activate
 *     CompleteReferralDto:
 *       type: object
 *       required:
 *         - referralId
 *       properties:
 *         referralId:
 *           type: string
 *           description: ID of the referral to complete
 *     MarkCommissionPaidDto:
 *       type: object
 *       required:
 *         - commissionId
 *         - payoutTransactionId
 *       properties:
 *         commissionId:
 *           type: string
 *           description: ID of the commission to mark as paid
 *         payoutTransactionId:
 *           type: string
 *           description: Transaction ID of the payout
 *     REFERRAL_TYPE:
 *       type: string
 *       enum: [seller_account, product]
 *       description: Type of referral
 */

export class CreateReferralCodeDto {
  @IsString()
  userId: string;

  @IsEnum(REFERRAL_TYPE)
  type: REFERRAL_TYPE;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsage?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class CreateReferralDto {
  @IsString()
  referrerId: string;

  @IsString()
  referredId: string;

  @IsEnum(REFERRAL_TYPE)
  type: REFERRAL_TYPE;

  @IsString()
  referralCode: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  sellerId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;
}

export class ValidateReferralCodeDto {
  @IsString()
  code: string;

  @IsEnum(REFERRAL_TYPE)
  type: REFERRAL_TYPE;
}

export class ActivateReferralDto {
  @IsString()
  referralId: string;
}

export class CompleteReferralDto {
  @IsString()
  referralId: string;
}

export class MarkCommissionPaidDto {
  @IsString()
  commissionId: string;

  @IsString()
  payoutTransactionId: string;
}
