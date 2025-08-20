# Referral System

This module implements a comprehensive referral system for both seller accounts and products, with automatic commission tracking and payout management.

## Features

- **Dual Referral Types**: Support for both seller account referrals and product referrals
- **Automatic Commission Calculation**: Real-time commission calculation based on sales
- **Flexible Commission Rates**: Configurable commission percentages (default: 10% for seller accounts, 5% for products)
- **Referral Code Management**: Unique referral codes with usage limits and expiration dates
- **Commission Tracking**: Detailed tracking of earned, pending, and paid commissions
- **Integration**: Seamless integration with existing order and seller systems

## How It Works

### 1. Seller Account Referrals

When someone creates a seller account using a referral code:
- The referral is created with `PENDING` status
- When the seller account is approved, the referral becomes `ACTIVE`
- Commission is calculated as a percentage of the seller's total revenue
- Commission is earned once and marked as `EARNED`

### 2. Product Referrals

When someone purchases a product using a referral code:
- The referral is created with `PENDING` status
- When the order is completed, the referral becomes `ACTIVE`
- Commission is calculated as a percentage of each qualifying order
- Commission is earned for every qualifying order

### 3. Commission Flow

1. **PENDING**: Commission is calculated but not yet earned
2. **EARNED**: Commission has been earned and is ready for payout
3. **PAID**: Commission has been paid out to the referrer

## Database Schema

### Referrals Table
- `referrerId`: User who made the referral
- `referredId`: User who was referred
- `type`: Type of referral (seller_account or product)
- `status`: Current status of the referral
- `commissionRate`: Commission percentage
- `totalCommission`: Total commission earned

### Referral Codes Table
- `userId`: User who owns the referral code
- `code`: Unique referral code
- `type`: Type of referral this code is for
- `commissionRate`: Override commission rate
- `maxUsage`: Maximum number of times the code can be used
- `expiresAt`: When the code expires

### Referral Commissions Table
- `referralId`: Reference to the referral
- `orderId`: Reference to the order (if applicable)
- `commissionAmount`: Amount of commission earned
- `status`: Current status of the commission

## API Endpoints

### Public Endpoints

#### Validate Referral Code
```http
POST /api/v1/referrals/validate
Content-Type: application/json

{
  "code": "ABC12345",
  "type": "seller_account"
}
```

### Authenticated Endpoints

#### Create Referral Code
```http
POST /api/v1/referrals/codes
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-id",
  "type": "seller_account",
  "commissionRate": 10.0,
  "maxUsage": 100,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

#### Create Referral
```http
POST /api/v1/referrals/
Authorization: Bearer <token>
Content-Type: application/json

{
  "referrerId": "referrer-user-id",
  "referredId": "referred-user-id",
  "type": "seller_account",
  "referralCode": "ABC12345"
}
```

#### Get User Referral Statistics
```http
GET /api/v1/referrals/stats/:userId
Authorization: Bearer <token>
```

#### Get User Referral Codes
```http
GET /api/v1/referrals/codes/:userId
Authorization: Bearer <token>
```

#### Get User Referrals
```http
GET /api/v1/referrals/:userId
Authorization: Bearer <token>
```

#### Get Pending Commissions
```http
GET /api/v1/referrals/commissions/pending/:userId
Authorization: Bearer <token>
```

#### Mark Commission as Paid
```http
POST /api/v1/referrals/commissions/paid
Authorization: Bearer <token>
Content-Type: application/json

{
  "commissionId": "commission-id",
  "payoutTransactionId": "payout-tx-id"
}
```

### Internal Endpoints

#### Process Order Commission
```http
POST /api/v1/referrals/process-order-commission/:orderId
```

#### Process Seller Referral Commission
```http
POST /api/v1/referrals/process-seller-commission/:sellerId
```

## Configuration

### Default Commission Rates
- **Seller Account Referrals**: 10%
- **Product Referrals**: 5%

### Environment Variables
```env
# Referral system configuration
REFERRAL_DEFAULT_SELLER_COMMISSION=10.0
REFERRAL_DEFAULT_PRODUCT_COMMISSION=5.0
REFERRAL_EXPIRY_DAYS=30
```

## Usage Examples

### 1. Creating a Referral Code for Seller Accounts

```typescript
const referralCode = await referralService.createReferralCode({
  userId: "user-123",
  type: REFERRAL_TYPE.SELLER_ACCOUNT,
  commissionRate: 10.0,
  maxUsage: 50,
  expiresAt: new Date("2024-12-31")
});
```

### 2. Creating a Referral Code for Products

```typescript
const referralCode = await referralService.createReferralCode({
  userId: "user-123",
  type: REFERRAL_TYPE.PRODUCT,
  productId: "product-456",
  commissionRate: 5.0,
  maxUsage: 100
});
```

### 3. Processing a Referral

```typescript
const referral = await referralService.createReferral({
  referrerId: "user-123",
  referredId: "user-789",
  type: REFERRAL_TYPE.SELLER_ACCOUNT,
  referralCode: "ABC12345"
});
```

### 4. Getting Referral Statistics

```typescript
const stats = await referralService.getUserReferralStats("user-123");
console.log(`Total referrals: ${stats.totalReferrals}`);
console.log(`Total commission: $${stats.totalCommission}`);
console.log(`Pending commission: $${stats.pendingCommission}`);
```

## Integration Points

### 1. Seller Approval
When a seller account is approved, the system automatically:
- Activates any pending referrals for that seller
- Processes commission based on the seller's revenue

### 2. Order Completion
When an order is completed, the system automatically:
- Processes commission for any active product referrals
- Updates commission records and referral totals

### 3. Commission Payout
The system tracks commission status and provides endpoints for:
- Marking commissions as paid
- Tracking payout transactions
- Managing commission lifecycle

## Security Features

- **Signature Verification**: All webhook calls are verified using HMAC signatures
- **Authentication**: Most endpoints require valid authentication tokens
- **Rate Limiting**: Built-in protection against abuse
- **Input Validation**: Comprehensive DTO validation for all inputs

## Monitoring and Analytics

The system provides comprehensive tracking of:
- Referral conversion rates
- Commission earnings over time
- Top performing referrers
- Referral code usage statistics
- Commission payout history

## Future Enhancements

- **Multi-level Referrals**: Support for referral chains
- **Dynamic Commission Rates**: Commission rates based on performance
- **Referral Campaigns**: Time-limited referral promotions
- **Advanced Analytics**: Detailed reporting and insights
- **Automated Payouts**: Integration with payment gateways for automatic payouts
