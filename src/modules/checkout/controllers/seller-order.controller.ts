import { Request, Response } from "express";
import { DataSource, Repository } from "typeorm";
import { Order } from "../entities/order.entity";
import { OrderItem } from "../entities/order-item.entity";
import { OrderStatusHistory } from "../entities/order-status-history.entity";
import { User } from "../../user/user.entity";
import { ORDER_STATUS } from "../entities/order.enums";
import { SellerOrderAcceptDto } from "../dto/seller-order-accept.dto";
import { SellerOrderUpdateDto } from "../dto/seller-order-update.dto";
import { SellerNotificationService } from "../services/seller-notification.service";
import { CommissionService } from "../services/commission.service";
import { getResponseAPI } from "../../../common/getResponseAPI";

export class SellerOrderController {
  private orderRepository: Repository<Order>;
  private orderItemRepository: Repository<OrderItem>;
  private orderStatusHistoryRepository: Repository<OrderStatusHistory>;
  private userRepository: Repository<User>;
  private sellerNotificationService: SellerNotificationService;
  private commissionService: CommissionService;

  constructor(private dataSource: DataSource) {
    this.orderRepository = this.dataSource.getRepository(Order);
    this.orderItemRepository = this.dataSource.getRepository(OrderItem);
    this.orderStatusHistoryRepository = this.dataSource.getRepository(OrderStatusHistory);
    this.userRepository = this.dataSource.getRepository(User);
    this.sellerNotificationService = new SellerNotificationService(this.dataSource);
    this.commissionService = new CommissionService(this.dataSource);
  }

  async getSellerOrders(req: Request, res: Response) {
    try {
      const sellerId = req.user?.id;
      if (!sellerId) {
        return res.status(401).json(getResponseAPI("401", { message: "User not authenticated" }));
      }

      const { page = 1, limit = 10, status } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const whereClause: any = {};

      if (status) {
        whereClause.status = status;
      }

      // Get orders that contain products from this seller
      const orderItems = await this.orderItemRepository.find({
        where: {
          product: { sellerId }
        },
        relations: ["order", "product"]
      });

      const orderIds = [...new Set(orderItems.map(item => item.orderId))];

      if (orderIds.length === 0) {
        return res.json(getResponseAPI("200", { orders: [], total: 0 }));
      }

      const [orders, total] = await this.orderRepository.findAndCount({
        where: {
          id: orderIds,
          ...whereClause
        },
        order: { createdAt: "DESC" },
        skip: offset,
        take: Number(limit),
        relations: ["items", "items.product", "statusHistory"]
      });

      return res.json(getResponseAPI("200", {
        orders,
        total,
        page: Number(page),
        limit: Number(limit)
      }));
    } catch (error) {
      console.error("Error getting seller orders:", error);
      return res.status(500).json(getResponseAPI("500", { message: "Failed to get orders" }));
    }
  }

  async acceptOrder(req: Request, res: Response) {
    try {
      const sellerId = req.user?.id;
      if (!sellerId) {
        return res.status(401).json(getResponseAPI("401", { message: "User not authenticated" }));
      }

      const { orderId, notes, estimatedProcessingTime }: SellerOrderAcceptDto = req.body;

      // Verify the order contains products from this seller
      const orderItems = await this.orderItemRepository.find({
        where: {
          orderId,
          product: { sellerId }
        }
      });

      if (orderItems.length === 0) {
        return res.status(403).json(getResponseAPI("403", { message: "Access denied to this order" }));
      }

      const order = await this.orderRepository.findOne({
        where: { id: orderId }
      });

      if (!order) {
        return res.status(404).json(getResponseAPI("404", { message: "Order not found" }));
      }

      if (order.status !== ORDER_STATUS.SELLER_NOTIFIED) {
        return res.status(400).json(getResponseAPI("400", { message: "Order cannot be accepted in current status" }));
      }

      // Update order status
      order.status = ORDER_STATUS.SELLER_ACCEPTED;
      if (estimatedProcessingTime) {
        order.notes = `Estimated processing time: ${estimatedProcessingTime} days. ${notes || ""}`;
      } else if (notes) {
        order.notes = notes;
      }

      await this.orderRepository.save(order);

      // Create status history
      const statusHistory = this.orderStatusHistoryRepository.create({
        orderId,
        status: ORDER_STATUS.SELLER_ACCEPTED,
        previousStatus: ORDER_STATUS.SELLER_NOTIFIED,
        notes: `Order accepted by seller. ${notes || ""}`,
        notificationSent: true
      });

      await this.orderStatusHistoryRepository.save(statusHistory);

      // Send notification
      await this.sellerNotificationService.sendOrderAcceptedNotification(order, sellerId);

      return res.json(getResponseAPI("200", { order }));
    } catch (error) {
      console.error("Error accepting order:", error);
      return res.status(500).json(getResponseAPI("500", { message: "Failed to accept order" }));
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const sellerId = req.user?.id;
      if (!sellerId) {
        return res.status(401).json(getResponseAPI("401", { message: "User not authenticated" }));
      }

      const { orderId, status, notes, trackingNumber, estimatedDeliveryDate }: SellerOrderUpdateDto = req.body;

      // Verify the order contains products from this seller
      const orderItems = await this.orderItemRepository.find({
        where: {
          orderId,
          product: { sellerId }
        }
      });

      if (orderItems.length === 0) {
        return res.status(403).json(getResponseAPI("403", { message: "Access denied to this order" }));
      }

      const order = await this.orderRepository.findOne({
        where: { id: orderId }
      });

      if (!order) {
        return res.status(404).json(getResponseAPI("404", { message: "Order not found" }));
      }

      // Validate status transition
      if (!this.isValidStatusTransition(order.status, status)) {
        return res.status(400).json(getResponseAPI("400", { message: "Invalid status transition" }));
      }

      const previousStatus = order.status;
      order.status = status;

      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }

      if (estimatedDeliveryDate) {
        order.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
      }

      if (notes) {
        order.notes = notes;
      }

      await this.orderRepository.save(order);

      // Create status history
      const statusHistory = this.orderStatusHistoryRepository.create({
        orderId,
        status,
        previousStatus,
        notes: notes || `Status updated to ${status}`,
        notificationSent: true
      });

      await this.orderStatusHistoryRepository.save(statusHistory);

      // If order is delivered, calculate commission
      if (status === ORDER_STATUS.DELIVERED) {
        try {
          await this.commissionService.calculateAndCreateCommission(orderId);
        } catch (error) {
          console.error("Failed to calculate commission:", error);
        }
      }

      return res.json(getResponseAPI("200", { order }));
    } catch (error) {
      console.error("Error updating order status:", error);
      return res.status(500).json(getResponseAPI("500", { message: "Failed to update order status" }));
    }
  }

  async getNotifications(req: Request, res: Response) {
    try {
      const sellerId = req.user?.id;
      if (!sellerId) {
        return res.status(401).json(getResponseAPI("401", { message: "User not authenticated" }));
      }

      const { page = 1, limit = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const result = await this.sellerNotificationService.getSellerNotifications(
        sellerId,
        Number(limit),
        offset
      );

      return res.json(getResponseAPI("200", result));
    } catch (error) {
      console.error("Error getting notifications:", error);
      return res.status(500).json(getResponseAPI("500", { message: "Failed to get notifications" }));
    }
  }

  async markNotificationAsRead(req: Request, res: Response) {
    try {
      const sellerId = req.user?.id;
      if (!sellerId) {
        return res.status(401).json(getResponseAPI("401", { message: "User not authenticated" }));
      }

      const { notificationId } = req.params;

      const notification = await this.sellerNotificationService.markNotificationAsRead(
        notificationId,
        sellerId
      );

      return res.json(getResponseAPI("200", { notification }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json(getResponseAPI("500", { message: "Failed to mark notification as read" }));
    }
  }

  async getCommissionSummary(req: Request, res: Response) {
    try {
      const sellerId = req.user?.id;
      if (!sellerId) {
        return res.status(401).json(getResponseAPI("401", { message: "User not authenticated" }));
      }

      const summary = await this.commissionService.getCommissionSummary(sellerId);

      return res.json(getResponseAPI("200", summary));
    } catch (error) {
      console.error("Error getting commission summary:", error);
      return res.status(500).json(getResponseAPI("500", { message: "Failed to get commission summary" }));
    }
  }

  private isValidStatusTransition(currentStatus: ORDER_STATUS, newStatus: ORDER_STATUS): boolean {
    const validTransitions: Record<ORDER_STATUS, ORDER_STATUS[]> = {
      [ORDER_STATUS.PENDING]: [ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.SELLER_NOTIFIED]: [ORDER_STATUS.SELLER_ACCEPTED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.SELLER_ACCEPTED]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
      [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.RETURNED],
      [ORDER_STATUS.CANCELLED]: [],
      [ORDER_STATUS.REFUNDED]: [],
      [ORDER_STATUS.RETURNED]: []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
