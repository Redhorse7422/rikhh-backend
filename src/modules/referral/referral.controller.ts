import { Request, Response } from "express";
import { referralService } from "./referral.service";
import { CreateReferralCodeDto, CreateReferralDto, ValidateReferralCodeDto, ActivateReferralDto, CompleteReferralDto, MarkCommissionPaidDto } from "./dto/create-referral.dto";

export const referralController = () => {
  /**
   * Create a new referral code
   */
  const createReferralCode = async (req: Request, res: Response) => {
    try {
      const data: CreateReferralCodeDto = req.body;
      const referralCode = await referralService.createReferralCode(data);

      res.status(201).json({
        success: true,
        message: "Referral code created successfully",
        data: referralCode,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create referral code",
      });
    }
  };

  /**
   * Create a new referral
   */
  const createReferral = async (req: Request, res: Response) => {
    try {
      const data: CreateReferralDto = req.body;
      const referral = await referralService.createReferral(data);

      res.status(201).json({
        success: true,
        message: "Referral created successfully",
        data: referral,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create referral",
      });
    }
  };

  /**
   * Validate a referral code
   */
  const validateReferralCode = async (req: Request, res: Response) => {
    try {
      const data: ValidateReferralCodeDto = req.body;
      const referralCode = await referralService.validateReferralCode(data.code, data.type);

      if (!referralCode) {
        return res.status(404).json({
          success: false,
          message: "Invalid or expired referral code",
        });
      }

      res.status(200).json({
        success: true,
        message: "Referral code is valid",
        data: referralCode,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to validate referral code",
      });
    }
  };

  /**
   * Activate a referral
   */
  const activateReferral = async (req: Request, res: Response) => {
    try {
      const data: ActivateReferralDto = req.body;
      const referral = await referralService.activateReferral(data.referralId);

      res.status(200).json({
        success: true,
        message: "Referral activated successfully",
        data: referral,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to activate referral",
      });
    }
  };

  /**
   * Complete a referral
   */
  const completeReferral = async (req: Request, res: Response) => {
    try {
      const data: CompleteReferralDto = req.body;
      const referral = await referralService.completeReferral(data.referralId);

      res.status(200).json({
        success: true,
        message: "Referral completed successfully",
        data: referral,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to complete referral",
      });
    }
  };

  /**
   * Get user's referral statistics
   */
  const getUserReferralStats = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const stats = await referralService.getUserReferralStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get referral statistics",
      });
    }
  };

  /**
   * Get user's referral codes
   */
  const getUserReferralCodes = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const codes = await referralService.getUserReferralCodes(userId);

      res.status(200).json({
        success: true,
        data: codes,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get referral codes",
      });
    }
  };

  /**
   * Get user's referrals
   */
  const getUserReferrals = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const referrals = await referralService.getUserReferrals(userId);

      res.status(200).json({
        success: true,
        data: referrals,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get referrals",
      });
    }
  };

  /**
   * Get pending commissions for a user
   */
  const getPendingCommissions = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const commissions = await referralService.getPendingCommissions(userId);

      res.status(200).json({
        success: true,
        data: commissions,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get pending commissions",
      });
    }
  };

  /**
   * Mark commission as paid
   */
  const markCommissionAsPaid = async (req: Request, res: Response) => {
    try {
      const data: MarkCommissionPaidDto = req.body;
      const commission = await referralService.markCommissionAsPaid(
        data.commissionId,
        data.payoutTransactionId
      );

      res.status(200).json({
        success: true,
        message: "Commission marked as paid successfully",
        data: commission,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to mark commission as paid",
      });
    }
  };

  /**
   * Process order commission (internal use)
   */
  const processOrderCommission = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      await referralService.processOrderCommission(orderId);

      res.status(200).json({
        success: true,
        message: "Order commission processed successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to process order commission",
      });
    }
  };

  /**
   * Process seller referral commission (internal use)
   */
  const processSellerReferralCommission = async (req: Request, res: Response) => {
    try {
      const { sellerId } = req.params;
      await referralService.processSellerReferralCommission(sellerId);

      res.status(200).json({
        success: true,
        message: "Seller referral commission processed successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to process seller referral commission",
      });
    }
  };

  return {
    createReferralCode,
    createReferral,
    validateReferralCode,
    activateReferral,
    completeReferral,
    getUserReferralStats,
    getUserReferralCodes,
    getUserReferrals,
    getPendingCommissions,
    markCommissionAsPaid,
    processOrderCommission,
    processSellerReferralCommission,
  };
};
