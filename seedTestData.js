// seedTestData.js - Add test data for KYC and Withdrawals
import mongoose from "mongoose";
import dotenv from "dotenv";
import KYC from "./models/KYC.js";
import Withdrawal from "./models/Withdrawal.js";
import User from "./models/User.js";
import MLM from "./models/MLM.js";
import MLMTransaction from "./models/MLMTransaction.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ks4pharmanet";

// Test Users Data
const testUsers = [
  {
    firstName: "Rahul",
    lastName: "Sharma",
    email: "rahul.sharma@test.com",
    phone: "+919876543210",
    password: "password123",
  },
  {
    firstName: "Priya",
    lastName: "Singh",
    email: "priya.singh@test.com",
    phone: "+919876543211",
    password: "password123",
  },
  {
    firstName: "Amit",
    lastName: "Kumar",
    email: "amit.kumar@test.com",
    phone: "+919876543212",
    password: "password123",
  },
  {
    firstName: "Sneha",
    lastName: "Patel",
    email: "sneha.patel@test.com",
    phone: "+919876543213",
    password: "password123",
  },
  {
    firstName: "Rajesh",
    lastName: "Verma",
    email: "rajesh.verma@test.com",
    phone: "+919876543214",
    password: "password123",
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing test data
    console.log("🗑️  Clearing existing test data...");
    await KYC.deleteMany({});
    await Withdrawal.deleteMany({});
    await MLM.deleteMany({});
    await MLMTransaction.deleteMany({});
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });

    // Create test users
    console.log("👥 Creating test users...");
    const createdUsers = await User.insertMany(testUsers);
    console.log(`✅ Created ${createdUsers.length} test users`);

    // Create KYC data
    console.log("📋 Creating KYC data...");
    const kycData = [
      {
        userId: createdUsers[0]._id,
        fullName: "Rahul Sharma",
        email: "rahul.sharma@test.com",
        phone: "+919876543210",
        address: "123 Main Street, Sector 15, Noida, UP - 201301",
        panCard: "ABCDE1234F",
        aadharCard: "123456789012",
        documents: {
          panImage: "https://via.placeholder.com/400x250?text=PAN+Card+Rahul",
          aadharFrontImage: "https://via.placeholder.com/400x250?text=Aadhar+Front+Rahul",
          aadharBackImage: "https://via.placeholder.com/400x250?text=Aadhar+Back+Rahul",
          bankPassbook: "https://via.placeholder.com/400x250?text=Bank+Passbook+Rahul",
          selfie: "https://via.placeholder.com/300x400?text=Selfie+Rahul",
        },
        status: "approved", // APPROVED - Can make withdrawals
        submittedAt: new Date("2024-01-25"),
        reviewedAt: new Date("2024-01-26"),
      },
      {
        userId: createdUsers[1]._id,
        fullName: "Priya Singh",
        email: "priya.singh@test.com",
        phone: "+919876543211",
        address: "456 Park Avenue, Connaught Place, Delhi - 110001",
        panCard: "FGHIJ5678K",
        aadharCard: "567890123456",
        documents: {
          panImage: "https://via.placeholder.com/400x250?text=PAN+Card+Priya",
          aadharFrontImage: "https://via.placeholder.com/400x250?text=Aadhar+Front+Priya",
          aadharBackImage: "https://via.placeholder.com/400x250?text=Aadhar+Back+Priya",
          bankPassbook: "https://via.placeholder.com/400x250?text=Bank+Passbook+Priya",
          selfie: "https://via.placeholder.com/300x400?text=Selfie+Priya",
        },
        status: "approved", // APPROVED - Can make withdrawals
        submittedAt: new Date("2024-01-24"),
        reviewedAt: new Date("2024-01-25"),
      },
      {
        userId: createdUsers[2]._id,
        fullName: "Amit Kumar",
        email: "amit.kumar@test.com",
        phone: "+919876543212",
        address: "789 MG Road, Bangalore, Karnataka - 560001",
        panCard: "KLMNO9012P",
        aadharCard: "901234567890",
        documents: {
          panImage: "https://via.placeholder.com/400x250?text=Blurry+PAN+Amit",
          aadharFrontImage: "https://via.placeholder.com/400x250?text=Aadhar+Front+Amit",
          aadharBackImage: "https://via.placeholder.com/400x250?text=Aadhar+Back+Amit",
          bankPassbook: "https://via.placeholder.com/400x250?text=Bank+Passbook+Amit",
          selfie: "https://via.placeholder.com/300x400?text=Selfie+Amit",
        },
        status: "rejected", // REJECTED - Cannot make withdrawals
        submittedAt: new Date("2024-01-23"),
        reviewedAt: new Date("2024-01-24"),
        rejectReason: "PAN card image is not clear. Please upload a clearer image.",
      },
      {
        userId: createdUsers[3]._id,
        fullName: "Sneha Patel",
        email: "sneha.patel@test.com",
        phone: "+919876543213",
        address: "321 Ring Road, Ahmedabad, Gujarat - 380001",
        panCard: "PQRST3456U",
        aadharCard: "345678901234",
        documents: {
          panImage: "https://via.placeholder.com/400x250?text=PAN+Card+Sneha",
          aadharFrontImage: "https://via.placeholder.com/400x250?text=Aadhar+Front+Sneha",
          aadharBackImage: "https://via.placeholder.com/400x250?text=Aadhar+Back+Sneha",
          bankPassbook: "https://via.placeholder.com/400x250?text=Bank+Passbook+Sneha",
          selfie: "https://via.placeholder.com/300x400?text=Selfie+Sneha",
        },
        status: "pending", // PENDING - Waiting for approval
        submittedAt: new Date("2024-01-22"),
      },
      {
        userId: createdUsers[4]._id,
        fullName: "Rajesh Verma",
        email: "rajesh.verma@test.com",
        phone: "+919876543214",
        address: "567 Lake Road, Pune, Maharashtra - 411001",
        panCard: "UVWXY6789Z",
        aadharCard: "678901234567",
        documents: {
          panImage: "https://via.placeholder.com/400x250?text=PAN+Card+Rajesh",
          aadharFrontImage: "https://via.placeholder.com/400x250?text=Aadhar+Front+Rajesh",
          aadharBackImage: "https://via.placeholder.com/400x250?text=Aadhar+Back+Rajesh",
          bankPassbook: "https://via.placeholder.com/400x250?text=Bank+Passbook+Rajesh",
          selfie: "https://via.placeholder.com/300x400?text=Selfie+Rajesh",
        },
        status: "pending", // PENDING - Waiting for approval
        submittedAt: new Date("2024-01-21"),
      },
    ];

    const createdKYCs = await KYC.insertMany(kycData);
    console.log(`✅ Created ${createdKYCs.length} KYC records`);
    console.log(`   - Approved: ${kycData.filter(k => k.status === "approved").length}`);
    console.log(`   - Pending: ${kycData.filter(k => k.status === "pending").length}`);
    console.log(`   - Rejected: ${kycData.filter(k => k.status === "rejected").length}`);

    // Create Withdrawal data (ONLY for approved KYC users)
    console.log("💰 Creating withdrawal requests...");
    const withdrawalData = [
      {
        userId: createdUsers[0]._id, // Rahul - APPROVED KYC
        amount: 5000,
        fee: 50,
        netAmount: 4950,
        referenceId: "WD00001",
        paymentMethod: {
          type: "bank",
          bankName: "HDFC Bank",
          accountNumber: "12345678901234",
          ifscCode: "HDFC0001234",
          accountHolder: "Rahul Sharma",
        },
        status: "pending",
        kycStatus: "verified",
        userDetails: {
          name: "Rahul Sharma",
          email: "rahul.sharma@test.com",
          phone: "+919876543210",
          address: "123 Main Street, Sector 15, Noida, UP - 201301",
          panCard: "ABCDE1234F",
          aadharCard: "123456789012",
        },
      },
      {
        userId: createdUsers[1]._id, // Priya - APPROVED KYC
        amount: 8000,
        fee: 50,
        netAmount: 7950,
        referenceId: "WD00002",
        paymentMethod: {
          type: "bank",
          bankName: "SBI Bank",
          accountNumber: "98765432109876",
          ifscCode: "SBIN0001234",
          accountHolder: "Priya Singh",
        },
        status: "approved",
        kycStatus: "verified",
        userDetails: {
          name: "Priya Singh",
          email: "priya.singh@test.com",
          phone: "+919876543211",
          address: "456 Park Avenue, Connaught Place, Delhi - 110001",
          panCard: "FGHIJ5678K",
          aadharCard: "567890123456",
        },
        approvedAt: new Date("2024-01-26"),
      },
      {
        userId: createdUsers[0]._id, // Rahul - APPROVED KYC (Second withdrawal)
        amount: 3000,
        fee: 50,
        netAmount: 2950,
        referenceId: "WD00003",
        paymentMethod: {
          type: "upi",
          upiId: "rahul@phonepe",
        },
        status: "completed",
        kycStatus: "verified",
        userDetails: {
          name: "Rahul Sharma",
          email: "rahul.sharma@test.com",
          phone: "+919876543210",
          address: "123 Main Street, Sector 15, Noida, UP - 201301",
          panCard: "ABCDE1234F",
          aadharCard: "123456789012",
        },
        approvedAt: new Date("2024-01-20"),
        completedAt: new Date("2024-01-21"),
        transactionId: "TXN123456789",
      },
    ];

    const createdWithdrawals = await Withdrawal.insertMany(withdrawalData);
    console.log(`✅ Created ${createdWithdrawals.length} withdrawal requests`);
    console.log(`   - Pending: ${withdrawalData.filter(w => w.status === "pending").length}`);
    console.log(`   - Approved: ${withdrawalData.filter(w => w.status === "approved").length}`);
    console.log(`   - Completed: ${withdrawalData.filter(w => w.status === "completed").length}`);

    console.log("\n🎉 Test data seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   KYC Records: ${createdKYCs.length}`);
    console.log(`   Withdrawals: ${createdWithdrawals.length}`);
    console.log("\n✅ IMPORTANT: Only users with APPROVED KYC have withdrawal requests!");
    console.log("   - Rahul Sharma (APPROVED) → 2 withdrawals");
    console.log("   - Priya Singh (APPROVED) → 1 withdrawal");
    console.log("   - Amit Kumar (REJECTED) → 0 withdrawals");
    console.log("   - Sneha Patel (PENDING) → 0 withdrawals");
    console.log("   - Rajesh Verma (PENDING) → 0 withdrawals");

    // Create MLM data
    console.log("\n🔗 Creating MLM referral structure...");
    // Main user: Rahul Sharma (createdUsers[0])
    const rahulMLM = await MLM.create({
      userId: createdUsers[0]._id,
      referralCode: "RAHUL123",
      totalReferrals: 3,
      activeReferrals: 3,
      level1Referrals: 1, // Priya
      level2Referrals: 1, // Amit
      level3Referrals: 1, // Sneha
      totalEarnings: 850,
      availableBalance: 850,
      monthlyEarnings: 850,
      referrals: [
        { userId: createdUsers[1]._id, level: 1, joinedAt: new Date("2024-01-20"), isActive: true, totalEarned: 500 },
        { userId: createdUsers[2]._id, level: 2, joinedAt: new Date("2024-01-21"), isActive: true, totalEarned: 250 },
        { userId: createdUsers[3]._id, level: 3, joinedAt: new Date("2024-01-22"), isActive: true, totalEarned: 100 },
      ]
    });

    // Add MLM Transactions
    await MLMTransaction.insertMany([
      { userId: createdUsers[0]._id, type: "referral", amount: 500, description: "Level 1 Referral: Priya Singh", relatedUser: createdUsers[1]._id, level: 1, status: "completed" },
      { userId: createdUsers[0]._id, type: "commission", amount: 250, description: "Level 2 Commission: Amit Kumar", relatedUser: createdUsers[2]._id, level: 2, status: "completed" },
      { userId: createdUsers[0]._id, type: "commission", amount: 100, description: "Level 3 Commission: Sneha Patel", relatedUser: createdUsers[3]._id, level: 3, status: "completed" },
    ]);

    console.log("✅ Created MLM hierarchy for Rahul Sharma");
    console.log(`   - Referral Code: ${rahulMLM.referralCode}`);
    console.log(`   - Use Rahul's ID for testing: ${createdUsers[0]._id}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
