import { Repository, In } from "typeorm";
import { Referral, ReferralCode, ReferralCommission, REFERRAL_TYPE, REFERRAL_STATUS, COMMISSION_STATUS } from "./entities/referral.entity";
import { User } from "../user/user.entity";
import { Seller } from "../seller/entities/seller.entity";
import { Product } from "../products/entities/product.entity";
import { Order } from "../checkout/entities/order.entity";
import { AppDataSource } from "../../config/database";
import { CreateReferralCodeDto, CreateReferralDto, ValidateReferralCodeDto, ActivateReferralDto, CompleteReferralDto, MarkCommissionPaidDto } from "./dto/create-referral.dto";



export interface ReferralStats {
    totalReferrals: number;
    activeReferrals: number;
    totalCommission: number;
    pendingCommission: number;
    paidCommission: number;
    referralBreakdown: {
        sellerAccounts: number;
        products: number;
    };
}

export class ReferralService {
    private referralRepository: Repository<Referral>;
    private referralCodeRepository: Repository<ReferralCode>;
    private referralCommissionRepository: Repository<ReferralCommission>;
    private userRepository: Repository<User>;
    private sellerRepository: Repository<Seller>;
    private productRepository: Repository<Product>;
    private orderRepository: Repository<Order>;

    constructor() {
        this.referralRepository = AppDataSource.getRepository(Referral);
        this.referralCodeRepository = AppDataSource.getRepository(ReferralCode);
        this.referralCommissionRepository = AppDataSource.getRepository(ReferralCommission);
        this.userRepository = AppDataSource.getRepository(User);
        this.sellerRepository = AppDataSource.getRepository(Seller);
        this.productRepository = AppDataSource.getRepository(Product);
        this.orderRepository = AppDataSource.getRepository(Order);
    }

    /**
     * Generate a unique referral code
     */
    private generateReferralCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Create a new referral code
     */
    async createReferralCode(data: CreateReferralCodeDto): Promise<ReferralCode> {
        // Generate unique code
        let code: string;
        let attempts = 0;
        do {
            code = this.generateReferralCode();
            attempts++;
            if (attempts > 10) {
                throw new Error('Unable to generate unique referral code');
            }
        } while (await this.referralCodeRepository.findOne({ where: { code } }) !== null);

        // Set default commission rate if not provided
        if (!data.commissionRate) {
            data.commissionRate = data.type === REFERRAL_TYPE.SELLER_ACCOUNT ? 10.0 : 5.0; // 10% for seller accounts, 5% for products
        }

        // Convert string date to Date object if provided
        const referralCodeData: any = {
            ...data,
            code,
        };

        if (data.expiresAt) {
            referralCodeData.expiresAt = new Date(data.expiresAt);
        }

        const referralCode = this.referralCodeRepository.create(referralCodeData);

        return await this.referralCodeRepository.save(referralCode as any);
    }

    /**
     * Create a new referral
     */
    async createReferral(data: CreateReferralDto): Promise<Referral> {
        // Validate referral code
        const referralCode = await this.referralCodeRepository.findOne({
            where: { code: data.referralCode, isActive: true }
        });

        if (!referralCode) {
            throw new Error('Invalid or inactive referral code');
        }

        // Check if referral code has expired
        if (referralCode.expiresAt && referralCode.expiresAt < new Date()) {
            throw new Error('Referral code has expired');
        }

        // Check usage limits
        if (referralCode.maxUsage && referralCode.usageCount >= referralCode.maxUsage) {
            throw new Error('Referral code usage limit reached');
        }

        // Check if user was already referred
        const existingReferral = await this.referralRepository.findOne({
            where: { referredId: data.referredId, type: data.type }
        });

        if (existingReferral) {
            throw new Error('User has already been referred for this type');
        }

        // Use commission rate from referral code if not specified
        if (!data.commissionRate) {
            data.commissionRate = referralCode.commissionRate;
        }

        // Create referral
        const referral = this.referralRepository.create({
            ...data,
            status: REFERRAL_STATUS.PENDING,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        });

        const savedReferral = await this.referralRepository.save(referral);

        // Update referral code usage count
        referralCode.usageCount += 1;
        await this.referralCodeRepository.save(referralCode);

        return savedReferral;
    }

    /**
     * Activate a referral (when referred user completes required action)
     */
    async activateReferral(referralId: string): Promise<Referral> {
        const referral = await this.referralRepository.findOne({
            where: { id: referralId }
        });

        if (!referral) {
            throw new Error('Referral not found');
        }

        if (referral.status !== REFERRAL_STATUS.PENDING) {
            throw new Error('Referral cannot be activated');
        }

        referral.status = REFERRAL_STATUS.ACTIVE;
        referral.activatedAt = new Date();

        return await this.referralRepository.save(referral);
    }

    /**
     * Complete a referral (when referral conditions are met)
     */
    async completeReferral(referralId: string): Promise<Referral> {
        const referral = await this.referralRepository.findOne({
            where: { id: referralId }
        });

        if (!referral) {
            throw new Error('Referral not found');
        }

        if (referral.status !== REFERRAL_STATUS.ACTIVE) {
            throw new Error('Referral cannot be completed');
        }

        referral.status = REFERRAL_STATUS.COMPLETED;
        referral.completedAt = new Date();

        return await this.referralRepository.save(referral);
    }

    /**
     * Process commission for a completed order
     */
    async processOrderCommission(orderId: string): Promise<void> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['items', 'items.product']
        });

        if (!order) {
            throw new Error('Order not found');
        }

        // Find active referrals for this order
        const referrals = await this.referralRepository.find({
            where: {
                status: REFERRAL_STATUS.ACTIVE,
                type: REFERRAL_TYPE.PRODUCT
            },
            relations: ['referrer', 'product']
        });

        for (const referral of referrals) {
            // Check if any product in the order matches the referral
            const matchingItems = order.items.filter(item =>
                item.product?.sellerId === referral.referrerId ||
                item.productId === referral.productId
            );

            if (matchingItems.length > 0) {
                // Calculate commission
                const totalAmount = matchingItems.reduce((sum, item) => sum + ((item.product?.regularPrice || 0) * item.quantity), 0);
                const commissionAmount = (totalAmount * referral.commissionRate) / 100;

                // Create commission record
                const commission = this.referralCommissionRepository.create({
                    referralId: referral.id,
                    orderId: order.id,
                    orderAmount: totalAmount,
                    commissionRate: referral.commissionRate,
                    commissionAmount,
                    status: COMMISSION_STATUS.EARNED,
                });

                await this.referralCommissionRepository.save(commission);

                // Update referral total commission
                referral.totalCommission += commissionAmount;
                await this.referralRepository.save(referral);
            }
        }
    }

    /**
     * Process seller account referral commission
     */
    async processSellerReferralCommission(sellerId: string): Promise<void> {
        const referral = await this.referralRepository.findOne({
            where: {
                sellerId,
                type: REFERRAL_TYPE.SELLER_ACCOUNT,
                status: REFERRAL_STATUS.ACTIVE
            }
        });

        if (!referral) {
            return; // No referral found
        }

        // Get seller's total revenue
        const seller = await this.sellerRepository.findOne({
            where: { id: sellerId }
        });

        if (!seller || seller.totalRevenue <= 0) {
            return;
        }

        // Calculate commission (one-time commission for seller account referral)
        const commissionAmount = (seller.totalRevenue * referral.commissionRate) / 100;

        // Create commission record
        const commission = this.referralCommissionRepository.create({
            referralId: referral.id,
            orderId: '', // Not tied to a specific order, but we need a valid string
            orderAmount: seller.totalRevenue,
            commissionRate: referral.commissionRate,
            commissionAmount,
            status: COMMISSION_STATUS.EARNED,
        });

        await this.referralCommissionRepository.save(commission);

        // Update referral total commission
        referral.totalCommission += commissionAmount;
        await this.referralRepository.save(referral);
    }

    /**
     * Get referral statistics for a user
     */
    async getUserReferralStats(userId: string): Promise<ReferralStats> {
        const referrals = await this.referralRepository.find({
            where: { referrerId: userId },
            relations: ['commissions']
        });

        const totalReferrals = referrals.length;
        const activeReferrals = referrals.filter(r => r.status === REFERRAL_STATUS.ACTIVE).length;

        const totalCommission = referrals.reduce((sum, r) => sum + r.totalCommission, 0);
        const pendingCommission = referrals.reduce((sum, r) => {
            const pendingCommissions = r.commissions.filter(c => c.status === COMMISSION_STATUS.PENDING);
            return sum + pendingCommissions.reduce((cSum, c) => cSum + c.commissionAmount, 0);
        }, 0);

        const paidCommission = referrals.reduce((sum, r) => {
            const paidCommissions = r.commissions.filter(c => c.status === COMMISSION_STATUS.PAID);
            return sum + paidCommissions.reduce((cSum, c) => cSum + c.commissionAmount, 0);
        }, 0);

        const referralBreakdown = {
            sellerAccounts: referrals.filter(r => r.type === REFERRAL_TYPE.SELLER_ACCOUNT).length,
            products: referrals.filter(r => r.type === REFERRAL_TYPE.PRODUCT).length,
        };

        return {
            totalReferrals,
            activeReferrals,
            totalCommission,
            pendingCommission,
            paidCommission,
            referralBreakdown,
        };
    }

    /**
     * Get all referral codes for a user
     */
    async getUserReferralCodes(userId: string): Promise<ReferralCode[]> {
        return await this.referralCodeRepository.find({
            where: { userId, isActive: true },
            relations: ['product', 'seller']
        });
    }

    /**
     * Get all referrals for a user
     */
    async getUserReferrals(userId: string): Promise<Referral[]> {
        return await this.referralRepository.find({
            where: { referrerId: userId },
            relations: ['referred', 'product', 'seller', 'commissions']
        });
    }

    /**
     * Validate a referral code
     */
    async validateReferralCode(code: string, type: REFERRAL_TYPE): Promise<ReferralCode | null> {
        const referralCode = await this.referralCodeRepository.findOne({
            where: {
                code,
                type,
                isActive: true
            }
        });

        if (!referralCode) {
            return null;
        }

        // Check if expired
        if (referralCode.expiresAt && referralCode.expiresAt < new Date()) {
            return null;
        }

        // Check usage limits
        if (referralCode.maxUsage && referralCode.usageCount >= referralCode.maxUsage) {
            return null;
        }

        return referralCode;
    }

    /**
     * Mark commission as paid
     */
    async markCommissionAsPaid(commissionId: string, payoutTransactionId: string): Promise<ReferralCommission> {
        const commission = await this.referralCommissionRepository.findOne({
            where: { id: commissionId }
        });

        if (!commission) {
            throw new Error('Commission not found');
        }

        if (commission.status !== COMMISSION_STATUS.EARNED) {
            throw new Error('Commission cannot be marked as paid');
        }

        commission.status = COMMISSION_STATUS.PAID;
        commission.paidAt = new Date();
        commission.payoutTransactionId = payoutTransactionId;

        return await this.referralCommissionRepository.save(commission);
    }

    /**
     * Get pending commissions for payout
     */
    async getPendingCommissions(userId: string): Promise<ReferralCommission[]> {
        const referrals = await this.referralRepository.find({
            where: { referrerId: userId }
        });

        const referralIds = referrals.map(r => r.id);

        return await this.referralCommissionRepository.find({
            where: {
                referralId: In(referralIds),
                status: COMMISSION_STATUS.EARNED
            },
            relations: ['referral', 'order']
        });
    }
}

export const referralService = new ReferralService();
