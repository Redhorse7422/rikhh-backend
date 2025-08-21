# Seller Order Management System

## Overview

The Seller Order Management System enhances the existing order process by adding seller-specific workflow steps, notifications, and commission tracking. This system integrates seamlessly with the existing order flow without creating a parallel system.

## Key Features

### 1. Enhanced Order Status Flow
The existing order status flow has been enhanced with new statuses:

```
PENDING → SELLER_NOTIFIED → SELLER_ACCEPTED → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
```

- **SELLER_NOTIFIED**: Order has been created and sellers are notified
- **SELLER_ACCEPTED**: Seller has accepted the order and is ready to process

### 2. Seller Notifications
- **New Order Notifications**: Sellers receive notifications when orders containing their products are placed
- **Order Status Updates**: Notifications for order acceptance and status changes
- **Commission Notifications**: Notifications when commissions are earned

### 3. Commission System
- **Automatic Calculation**: Commissions are calculated when orders reach "DELIVERED" status
- **Configurable Rates**: Default 10% commission rate (configurable per seller)
- **Commission Tracking**: Full tracking of commission status (pending, calculated, paid, cancelled)

## Database Schema

### New Tables

#### 1. `commissions`
```sql
CREATE TABLE commissions (
  id UUID PRIMARY KEY,
  orderId UUID REFERENCES orders(id),
  sellerId UUID REFERENCES users(id),
  orderAmount DECIMAL(10,2),
  commissionRate DECIMAL(5,2),
  commissionAmount DECIMAL(10,2),
  status commission_status_enum,
  notes TEXT,
  paidAt TIMESTAMP,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

#### 2. `seller_notifications`
```sql
CREATE TABLE seller_notifications (
  id UUID PRIMARY KEY,
  sellerId UUID REFERENCES users(id),
  orderId UUID REFERENCES orders(id),
  type notification_type_enum,
  status notification_status_enum,
  title VARCHAR(255),
  message TEXT,
  metadata JSONB,
  readAt TIMESTAMP,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### New Enums

#### 1. `commission_status_enum`
- `pending`: Commission is pending calculation
- `calculated`: Commission has been calculated
- `paid`: Commission has been paid to the platform
- `cancelled`: Commission has been cancelled

#### 2. `notification_type_enum`
- `new_order`: New order received
- `order_accepted`: Order accepted by seller
- `order_status_update`: Order status changed
- `commission_earned`: Commission earned

#### 3. `notification_status_enum`
- `unread`: Notification has not been read
- `read`: Notification has been read
- `archived`: Notification has been archived

## API Endpoints

### Base URL: `/api/v1/seller`

All endpoints require authentication and seller role authorization.

#### 1. Get Seller Orders
```
GET /orders
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- status: string (optional)
```

#### 2. Accept Order
```
POST /orders/accept
Body:
{
  "orderId": "uuid",
  "notes": "string (optional)",
  "estimatedProcessingTime": "number (optional, 1-30 days)"
}
```

#### 3. Update Order Status
```
PUT /orders/status
Body:
{
  "orderId": "uuid",
  "status": "ORDER_STATUS",
  "notes": "string (optional)",
  "trackingNumber": "string (optional)",
  "estimatedDeliveryDate": "ISO date string (optional)"
}
```

#### 4. Get Notifications
```
GET /notifications
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
```

#### 5. Mark Notification as Read
```
PUT /notifications/:notificationId/read
```

#### 6. Get Commission Summary
```
GET /commissions/summary
```

## Integration Points

### 1. Checkout Service Integration
The `confirmOrder` method in `CheckoutService` has been enhanced to:
- Automatically notify sellers when orders are placed
- Update order status to `SELLER_NOTIFIED`
- Create status history entries
- Send notifications to relevant sellers

### 2. Order Status Management
- New status transitions are enforced through validation
- Status history is automatically maintained
- Commission calculation is triggered on delivery

### 3. Product-Seller Relationship
The system relies on the existing product-seller relationship:
- Products must have a `sellerId` field
- Orders are linked to sellers through order items
- Seller access control is enforced at the order item level

## Security Features

### 1. Authentication
- All seller endpoints require JWT authentication
- User must be authenticated to access any seller functionality

### 2. Authorization
- Only users with `USER_TYPE.SELLER` can access seller endpoints
- Sellers can only access orders containing their products
- Access control is enforced at the database query level

### 3. Data Validation
- All input is validated using DTOs with class-validator
- Status transitions are validated to prevent invalid changes
- UUID validation for all ID parameters

## Error Handling

### 1. Graceful Degradation
- Seller notification failures don't break the order process
- Commission calculation failures are logged but don't affect order status
- Individual seller notification failures don't affect other sellers

### 2. Comprehensive Logging
- All errors are logged with context
- Failed operations are logged but don't fail the entire process
- Debug information is available for troubleshooting

## Configuration

### 1. Commission Rates
- Default commission rate: 10%
- Configurable per seller (future enhancement)
- Configurable per product category (future enhancement)

### 2. Notification Settings
- Email notifications (placeholder implementation)
- In-app notifications (fully implemented)
- Configurable notification preferences (future enhancement)

## Future Enhancements

### 1. Advanced Commission System
- Dynamic commission rates based on seller tier
- Category-specific commission rates
- Volume-based commission adjustments
- Commission payout scheduling

### 2. Enhanced Notifications
- Email integration with templates
- Push notifications
- SMS notifications
- Webhook support for external integrations

### 3. Seller Dashboard
- Real-time order tracking
- Performance analytics
- Commission reports
- Inventory management integration

### 4. Workflow Automation
- Automatic order acceptance rules
- SLA monitoring and alerts
- Escalation procedures
- Integration with shipping providers

## Testing

### 1. Unit Tests
- Service method testing
- Controller endpoint testing
- DTO validation testing

### 2. Integration Tests
- Database operation testing
- API endpoint testing
- Authentication and authorization testing

### 3. End-to-End Tests
- Complete order flow testing
- Seller notification testing
- Commission calculation testing

## Deployment

### 1. Database Migration
Run the migration to create new tables and update enums:
```bash
npm run migration:run
```

### 2. Entity Registration
Ensure new entities are registered in `src/config/database.ts`

### 3. Route Registration
Seller order routes are automatically registered in `src/apiV1.routes.ts`

## Monitoring and Maintenance

### 1. Performance Monitoring
- Database query performance
- API response times
- Notification delivery rates

### 2. Error Monitoring
- Failed notification attempts
- Commission calculation errors
- Database constraint violations

### 3. Data Cleanup
- Old notification cleanup
- Completed commission cleanup
- Status history maintenance

## Troubleshooting

### Common Issues

1. **Seller Notifications Not Working**
   - Check if products have valid `sellerId`
   - Verify database connection
   - Check notification service logs

2. **Commission Calculation Fails**
   - Ensure order status is "delivered"
   - Check product-seller relationships
   - Verify commission service configuration

3. **Order Status Update Fails**
   - Check status transition validation
   - Verify seller has access to the order
   - Check database constraints

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Support

For technical support or questions about the Seller Order Management System, please refer to:
- API documentation
- Database schema documentation
- Error logs and monitoring
- Development team contacts
