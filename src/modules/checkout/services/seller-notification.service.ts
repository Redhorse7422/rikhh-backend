import { DataSource, Repository } from "typeorm";
import { SellerNotification, NOTIFICATION_TYPE, NOTIFICATION_STATUS } from "../entities/seller-notification.entity";
import { Order } from "../entities/order.entity";
import { User } from "../../user/user.entity";

export class SellerNotificationService {
  private sellerNotificationRepository: Repository<SellerNotification>;
  private userRepository: Repository<User>;

  constructor(private dataSource: DataSource) {
    this.sellerNotificationRepository = this.dataSource.getRepository(SellerNotification);
    this.userRepository = this.dataSource.getRepository(User);
  }

  async sendNewOrderNotification(order: Order, sellerId: string): Promise<SellerNotification> {
    const seller = await this.userRepository.findOne({ where: { id: sellerId } });
    if (!seller) {
      throw new Error(`Seller with ID ${sellerId} not found`);
    }

    const notification = this.sellerNotificationRepository.create({
      sellerId,
      orderId: order.id,
      type: NOTIFICATION_TYPE.NEW_ORDER,
      title: "New Order Received",
      message: `You have received a new order #${order.orderNumber}. Please review and accept the order.`,
      metadata: {
        orderNumber: order.orderNumber,
        orderTotal: order.totalAmount
      }
    });

    return await this.sellerNotificationRepository.save(notification);
  }

  async sendOrderAcceptedNotification(order: Order, sellerId: string): Promise<SellerNotification> {
    const notification = this.sellerNotificationRepository.create({
      sellerId,
      orderId: order.id,
      type: NOTIFICATION_TYPE.ORDER_ACCEPTED,
      title: "Order Accepted",
      message: `Order #${order.orderNumber} has been accepted and is now being processed.`,
      metadata: {
        orderNumber: order.orderNumber,
        acceptedAt: new Date()
      }
    });

    return await this.sellerNotificationRepository.save(notification);
  }

  async sendCommissionEarnedNotification(order: Order, sellerId: string, commissionAmount: number): Promise<SellerNotification> {
    const notification = this.sellerNotificationRepository.create({
      sellerId,
      orderId: order.id,
      type: NOTIFICATION_TYPE.COMMISSION_EARNED,
      title: "Commission Earned",
      message: `You have earned a commission of $${commissionAmount} for order #${order.orderNumber}.`,
      metadata: {
        orderNumber: order.orderNumber,
        commissionAmount,
        earnedAt: new Date()
      }
    });

    return await this.sellerNotificationRepository.save(notification);
  }

  async getSellerNotifications(sellerId: string, limit: number = 50, offset: number = 0): Promise<{
    notifications: SellerNotification[];
    total: number;
  }> {
    const [notifications, total] = await this.sellerNotificationRepository.findAndCount({
      where: { sellerId },
      order: { createdAt: "DESC" },
      skip: offset,
      take: limit,
      relations: ["order"]
    });

    return { notifications, total };
  }

  async markNotificationAsRead(notificationId: string, sellerId: string): Promise<SellerNotification> {
    const notification = await this.sellerNotificationRepository.findOne({
      where: { id: notificationId, sellerId }
    });

    if (!notification) {
      throw new Error("Notification not found or access denied");
    }

    notification.status = NOTIFICATION_STATUS.READ;
    notification.readAt = new Date();

    return await this.sellerNotificationRepository.save(notification);
  }

  async markAllNotificationsAsRead(sellerId: string): Promise<void> {
    await this.sellerNotificationRepository.update(
      { sellerId, status: NOTIFICATION_STATUS.UNREAD },
      { status: NOTIFICATION_STATUS.READ, readAt: new Date() }
    );
  }

  async getUnreadCount(sellerId: string): Promise<number> {
    return await this.sellerNotificationRepository.count({
      where: { sellerId, status: NOTIFICATION_STATUS.UNREAD }
    });
  }

  // Placeholder for email sending - integrate with your email service
  private async sendEmailNotification(notification: SellerNotification): Promise<void> {
    // TODO: Integrate with your email service (Nodemailer, SendGrid, etc.)
    console.log(`Email notification would be sent for: ${notification.title}`);
  }
}
