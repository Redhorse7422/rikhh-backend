import { IsUUID, IsOptional, IsString, IsNumber, Min, Max } from "class-validator";

/**
 * @swagger
 * components:
 *   schemas:
 *     SellerOrderAcceptDto:
 *       type: object
 *       required:
 *         - orderId
 *       properties:
 *         orderId:
 *           type: string
 *           format: uuid
 *           description: Unique identifier of the order to accept
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         notes:
 *           type: string
 *           description: Optional notes from the seller about the order acceptance
 *           example: "Order will be processed within 2-3 business days"
 *         estimatedProcessingTime:
 *           type: number
 *           minimum: 1
 *           maximum: 30
 *           description: Estimated processing time in days
 *           example: 3
 */
export class SellerOrderAcceptDto {
  @IsUUID()
  orderId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  estimatedProcessingTime?: number; // in days
}
