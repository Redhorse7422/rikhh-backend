import { IsUUID, IsEnum, IsOptional, IsString, IsDateString } from "class-validator";
import { ORDER_STATUS } from "../entities/order.enums";

/**
 * @swagger
 * components:
 *   schemas:
 *     SellerOrderUpdateDto:
 *       type: object
 *       required:
 *         - orderId
 *         - status
 *       properties:
 *         orderId:
 *           type: string
 *           format: uuid
 *           description: Unique identifier of the order to update
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         status:
 *           $ref: '#/components/schemas/ORDER_STATUS'
 *           description: New status for the order
 *         notes:
 *           type: string
 *           description: Optional notes about the status update
 *           example: "Order has been shipped via express delivery"
 *         trackingNumber:
 *           type: string
 *           description: Optional tracking number for shipped orders
 *           example: "TRK123456789"
 *         estimatedDeliveryDate:
 *           type: string
 *           format: date
 *           description: Optional estimated delivery date for shipped orders
 *           example: "2024-01-15"
 */
export class SellerOrderUpdateDto {
  @IsUUID()
  orderId: string;

  @IsEnum(ORDER_STATUS)
  status: ORDER_STATUS;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;
}
