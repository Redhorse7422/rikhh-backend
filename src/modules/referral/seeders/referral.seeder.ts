import { DataSource } from "typeorm";
import { ReferralCode, Referral, REFERRAL_TYPE, REFERRAL_STATUS } from "../entities/referral.entity";
import { User } from "../../user/user.entity";
import { Seller } from "../../seller/entities/seller.entity";
import { Product } from "../../products/entities/product.entity";

export const referralSeeder = async (dataSource: DataSource) => {
  const referralCodeRepository = dataSource.getRepository(ReferralCode);
  const referralRepository = dataSource.getRepository(Referral);
  const userRepository = dataSource.getRepository(User);
  const sellerRepository = dataSource.getRepository(Seller);
  const productRepository = dataSource.getRepository(Product);

  try {
    // Get some sample users
    const users = await userRepository.find({ take: 5 });
    if (users.length < 3) {
      console.log("⚠️  Need at least 3 users to seed referral data");
      return;
    }

    // Get some sample sellers
    const sellers = await sellerRepository.find({ take: 3 });

    // Get some sample products
    const products = await productRepository.find({ take: 3 });

    console.log("🌱 Seeding referral data...");

    // Create referral codes for seller accounts
    for (let i = 0; i < Math.min(users.length, 3); i++) {
      const referralCode = referralCodeRepository.create({
        userId: users[i].id,
        type: REFERRAL_TYPE.SELLER_ACCOUNT,
        commissionRate: 10.0 + (i * 2), // 10%, 12%, 14%
        maxUsage: 50 + (i * 25),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        notes: `Sample seller referral code for ${users[i].firstName} ${users[i].lastName}`,
      });

      await referralCodeRepository.save(referralCode);
      console.log(`✅ Created seller referral code: ${referralCode.code}`);
    }

    // Create referral codes for products
    for (let i = 0; i < Math.min(users.length, 2); i++) {
      if (products[i]) {
        const referralCode = referralCodeRepository.create({
          userId: users[i].id,
          type: REFERRAL_TYPE.PRODUCT,
          productId: products[i].id,
          commissionRate: 5.0 + (i * 1), // 5%, 6%
          maxUsage: 100 + (i * 50),
          expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
          notes: `Sample product referral code for ${products[i].name}`,
        });

        await referralCodeRepository.save(referralCode);
        console.log(`✅ Created product referral code: ${referralCode.code}`);
      }
    }

    // Create some sample referrals
    if (users.length >= 3 && sellers.length > 0) {
      // Seller account referral
      const sellerReferral = referralRepository.create({
        referrerId: users[0].id,
        referredId: users[1].id,
        type: REFERRAL_TYPE.SELLER_ACCOUNT,
        status: REFERRAL_STATUS.PENDING,
        referralCode: "SELLER001",
        sellerId: sellers[0].id,
        commissionRate: 10.0,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        notes: "Sample seller account referral",
      });

      await referralRepository.save(sellerReferral);
      console.log("✅ Created sample seller referral");
    }

    if (users.length >= 3 && products.length > 0) {
      // Product referral
      const productReferral = referralRepository.create({
        referrerId: users[1].id,
        referredId: users[2].id,
        type: REFERRAL_TYPE.PRODUCT,
        status: REFERRAL_STATUS.PENDING,
        referralCode: "PRODUCT001",
        productId: products[0].id,
        commissionRate: 5.0,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        notes: "Sample product referral",
      });

      await referralRepository.save(productReferral);
      console.log("✅ Created sample product referral");
    }

    console.log("🎉 Referral seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding referral data:", error);
  }
};
