import { DataSource, Repository } from "typeorm";
import { Commission, COMMISSION_STATUS } from "../entities/commission.entity";
import { Order } from "../entities/order.entity";
import { OrderItem } from "../entities/order-item.entity";
import { User } from "../../user/user.entity";

export class CommissionService {
  private commissionRepository: Repository<Commission>;
  private orderRepository: Repository<Order>;
  private orderItemRepository: Repository<OrderItem>;
  private userRepository: Repository<User>;

  constructor(private dataSource: DataSource) {
    this.commissionRepository = this.dataSource.getRepository(Commission);
    this.orderRepository = this.dataSource.getRepository(Order);
    this.orderItemRepository = this.dataSource.getRepository(OrderItem);
    this.userRepository = this.dataSource.getRepository(User);
  }

  async calculateAndCreateCommission(orderId: string): Promise<Commission[]> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ["items", "items.product", "items.product.seller"]
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "delivered") {
      throw new Error("Commission can only be calculated for delivered orders");
    }

    const commissions: Commission[] = [];
    const sellerCommissions = new Map<string, { amount: number; rate: number }>();

    // Group order items by seller and calculate commission
    for (const item of order.items) {
      if (item.product?.sellerId) {
        const sellerId = item.product.sellerId;
        const itemTotal = item.quantity * item.price;
        const commissionRate = this.getCommissionRate(sellerId); // Default 10%
        const commissionAmount = itemTotal * (commissionRate / 100);

        if (sellerCommissions.has(sellerId)) {
          const existing = sellerCommissions.get(sellerId)!;
          existing.amount += commissionAmount;
        } else {
          sellerCommissions.set(sellerId, { amount: commissionAmount, rate: commissionRate });
        }
      }
    }

    // Create commission records for each seller
    for (const [sellerId, commissionData] of sellerCommissions) {
      const commission = this.commissionRepository.create({
        orderId,
        sellerId,
        orderAmount: order.totalAmount,
        commissionRate: commissionData.rate,
        commissionAmount: commissionData.amount,
        status: COMMISSION_STATUS.CALCULATED,
        notes: `Commission calculated for order #${order.orderNumber}`
      });

      const savedCommission = await this.commissionRepository.save(commission);
      commissions.push(savedCommission);
    }

    return commissions;
  }

  async markCommissionAsPaid(commissionId: string): Promise<Commission> {
    const commission = await this.commissionRepository.findOne({
      where: { id: commissionId }
    });

    if (!commission) {
      throw new Error("Commission not found");
    }

    commission.status = COMMISSION_STATUS.PAID;
    commission.paidAt = new Date();

    return await this.commissionRepository.save(commission);
  }

  async getSellerCommissions(sellerId: string, limit: number = 50, offset: number = 0): Promise<{
    commissions: Commission[];
    total: number;
    totalEarned: number;
    totalPaid: number;
    pendingAmount: number;
  }> {
    const [commissions, total] = await this.commissionRepository.findAndCount({
      where: { sellerId },
      order: { createdAt: "DESC" },
      skip: offset,
      take: limit,
      relations: ["order"]
    });

    const totalEarned = commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    const totalPaid = commissions
      .filter(c => c.status === COMMISSION_STATUS.PAID)
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    const pendingAmount = commissions
      .filter(c => c.status === COMMISSION_STATUS.CALCULATED)
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0);

    return {
      commissions,
      total,
      totalEarned,
      totalPaid,
      pendingAmount
    };
  }

  async getOrderCommission(orderId: string): Promise<Commission[]> {
    return await this.commissionRepository.find({
      where: { orderId },
      relations: ["seller"]
    });
  }

  async getCommissionSummary(sellerId: string): Promise<{
    totalEarned: number;
    totalPaid: number;
    pendingAmount: number;
    commissionCount: number;
  }> {
    const [commissions, total] = await this.commissionRepository.findAndCount({
      where: { sellerId }
    });

    const totalEarned = commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    const totalPaid = commissions
      .filter(c => c.status === COMMISSION_STATUS.PAID)
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    const pendingAmount = commissions
      .filter(c => c.status === COMMISSION_STATUS.CALCULATED)
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0);

    return {
      totalEarned,
      totalPaid,
      pendingAmount,
      commissionCount: total
    };
  }

  private getCommissionRate(sellerId: string): number {
    // TODO: Implement dynamic commission rates based on seller tier, category, etc.
    // For now, return a default 10% commission rate
    return 10.0;
  }
}
