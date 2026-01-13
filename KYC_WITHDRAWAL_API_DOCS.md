# KYC & Withdrawal API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## KYC APIs

### 1. Submit KYC
**POST** `/kyc/submit`

Submit KYC documents for verification.

**Request Body:**
```json
{
  "userId": "user_id_here",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "address": "123 Main Street, Mumbai, Maharashtra - 400001",
  "panCard": "ABCDE1234F",
  "aadharCard": "123456789012",
  "documents": {
    "panImage": "cloudinary_url_here",
    "aadharFrontImage": "cloudinary_url_here",
    "aadharBackImage": "cloudinary_url_here",
    "bankPassbook": "cloudinary_url_here",
    "selfie": "cloudinary_url_here"
  }
}
```

**Response:**
```json
{
  "message": "KYC submitted successfully",
  "kyc": {
    "id": "kyc_id",
    "status": "pending",
    "submittedAt": "2024-01-25T10:30:00.000Z"
  }
}
```

---

### 2. Get KYC Status
**GET** `/kyc/status/:userId`

Get KYC verification status for a user.

**Response:**
```json
{
  "status": "approved",
  "submittedAt": "2024-01-25T10:30:00.000Z",
  "reviewedAt": "2024-01-26T14:20:00.000Z",
  "rejectReason": null
}
```

---

### 3. Get All KYC Requests (Admin)
**GET** `/kyc/all?status=pending`

Get all KYC requests with optional status filter.

**Query Parameters:**
- `status` (optional): `all`, `pending`, `approved`, `rejected`

**Response:**
```json
{
  "count": 10,
  "kycRequests": [
    {
      "id": "kyc_id",
      "userId": "user_id",
      "userName": "John Doe",
      "email": "john@example.com",
      "phone": "+91 9876543210",
      "submitDate": "2024-01-25T10:30:00.000Z",
      "status": "pending",
      "kycData": {
        "fullName": "John Doe",
        "address": "123 Main Street",
        "panCard": "ABCDE1234F",
        "aadharCard": "123456789012",
        "panImage": "url",
        "aadharFrontImage": "url",
        "aadharBackImage": "url",
        "bankPassbook": "url",
        "selfie": "url"
      }
    }
  ]
}
```

---

### 4. Get KYC by ID (Admin)
**GET** `/kyc/:id`

Get detailed KYC information by ID.

---

### 5. Approve KYC (Admin)
**PUT** `/kyc/approve/:id`

Approve a KYC request.

**Request Body:**
```json
{
  "adminId": "admin_id_here"
}
```

**Response:**
```json
{
  "message": "KYC approved successfully",
  "kyc": {
    "id": "kyc_id",
    "status": "approved",
    "reviewedAt": "2024-01-26T14:20:00.000Z"
  }
}
```

---

### 6. Reject KYC (Admin)
**PUT** `/kyc/reject/:id`

Reject a KYC request with reason.

**Request Body:**
```json
{
  "adminId": "admin_id_here",
  "reason": "PAN card image is not clear"
}
```

**Response:**
```json
{
  "message": "KYC rejected successfully",
  "kyc": {
    "id": "kyc_id",
    "status": "rejected",
    "reviewedAt": "2024-01-26T14:20:00.000Z",
    "rejectReason": "PAN card image is not clear"
  }
}
```

---

### 7. Get KYC Statistics (Admin)
**GET** `/kyc/stats`

Get KYC statistics.

**Response:**
```json
{
  "total": 100,
  "pending": 25,
  "approved": 60,
  "rejected": 15
}
```

---

## Withdrawal APIs

### 1. Create Withdrawal Request
**POST** `/withdrawals/create`

Create a new withdrawal request (Only for KYC-approved users).

**Request Body:**
```json
{
  "userId": "user_id_here",
  "amount": 5000,
  "paymentMethod": {
    "type": "bank",
    "bankName": "HDFC Bank",
    "accountNumber": "12345678901234",
    "ifscCode": "HDFC0001234",
    "accountHolder": "John Doe"
  }
}
```

**OR for UPI:**
```json
{
  "userId": "user_id_here",
  "amount": 5000,
  "paymentMethod": {
    "type": "upi",
    "upiId": "john@phonepe"
  }
}
```

**Response:**
```json
{
  "message": "Withdrawal request created successfully",
  "withdrawal": {
    "id": "withdrawal_id",
    "referenceId": "WD00001",
    "amount": 5000,
    "fee": 50,
    "netAmount": 4950,
    "status": "pending",
    "createdAt": "2024-01-25T10:30:00.000Z"
  }
}
```

---

### 2. Get User Withdrawals
**GET** `/withdrawals/user/:userId`

Get all withdrawal requests for a specific user.

**Response:**
```json
{
  "count": 5,
  "withdrawals": [
    {
      "id": "withdrawal_id",
      "amount": 5000,
      "fee": 50,
      "netAmount": 4950,
      "method": "HDFC Bank",
      "accountDetails": "****1234",
      "date": "2024-01-25T10:30:00.000Z",
      "status": "pending",
      "referenceId": "WD00001"
    }
  ]
}
```

---

### 3. Get All Withdrawals (Admin)
**GET** `/withdrawals/all?status=pending`

Get all withdrawal requests (Only KYC-verified users).

**Query Parameters:**
- `status` (optional): `all`, `pending`, `approved`, `completed`, `rejected`

**Response:**
```json
{
  "count": 10,
  "withdrawals": [
    {
      "id": "withdrawal_id",
      "userId": "user_id",
      "userName": "John Doe",
      "amount": 5000,
      "fee": 50,
      "method": "HDFC Bank",
      "accountDetails": "Account: ****1234",
      "bankAccount": "12345678901234",
      "ifscCode": "HDFC0001234",
      "date": "2024-01-25T10:30:00.000Z",
      "status": "pending",
      "referenceId": "WD00001",
      "kycStatus": "verified",
      "userDetails": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+91 9876543210",
        "address": "123 Main Street",
        "panCard": "ABCDE1234F",
        "aadharCard": "123456789012"
      }
    }
  ]
}
```

---

### 4. Get Withdrawal by ID
**GET** `/withdrawals/:id`

Get detailed withdrawal information.

---

### 5. Approve Withdrawal (Admin)
**PUT** `/withdrawals/approve/:id`

Approve a withdrawal request.

**Request Body:**
```json
{
  "adminId": "admin_id_here"
}
```

**Response:**
```json
{
  "message": "Withdrawal approved successfully",
  "withdrawal": {
    "id": "withdrawal_id",
    "status": "approved",
    "approvedAt": "2024-01-26T14:20:00.000Z"
  }
}
```

---

### 6. Reject Withdrawal (Admin)
**PUT** `/withdrawals/reject/:id`

Reject a withdrawal request.

**Request Body:**
```json
{
  "adminId": "admin_id_here",
  "reason": "Insufficient balance"
}
```

---

### 7. Complete Withdrawal (Admin)
**PUT** `/withdrawals/complete/:id`

Mark withdrawal as completed (paid).

**Request Body:**
```json
{
  "transactionId": "TXN123456789",
  "transactionProof": "cloudinary_url_here"
}
```

**Response:**
```json
{
  "message": "Withdrawal completed successfully",
  "withdrawal": {
    "id": "withdrawal_id",
    "status": "completed",
    "completedAt": "2024-01-26T15:30:00.000Z",
    "transactionId": "TXN123456789"
  }
}
```

---

### 8. Get Withdrawal Statistics (Admin)
**GET** `/withdrawals/stats`

Get withdrawal statistics (Only KYC-verified users).

**Response:**
```json
{
  "total": 100,
  "pending": 25,
  "approved": 30,
  "completed": 40,
  "rejected": 5,
  "totalAmount": 500000
}
```

---

## Important Notes

1. **KYC Verification Required**: Users must have approved KYC to create withdrawal requests.
2. **Minimum Withdrawal**: ₹500
3. **Withdrawal Fee**: ₹50 (deducted from withdrawal amount)
4. **PAN Format**: ABCDE1234F (5 letters, 4 digits, 1 letter)
5. **Aadhar Format**: 12 digits
6. **Reference ID**: Auto-generated (WD00001, WD00002, etc.)
7. **KYC Status Filter**: Withdrawal APIs automatically filter to show only KYC-verified users

---

## Status Flow

### KYC Status Flow:
```
pending → approved/rejected
```

### Withdrawal Status Flow:
```
pending → approved → completed
        ↓
     rejected
```

---

## Error Responses

**400 Bad Request:**
```json
{
  "message": "KYC not submitted. Please complete KYC verification first.",
  "kycStatus": "not_submitted"
}
```

**404 Not Found:**
```json
{
  "message": "User not found"
}
```

**500 Server Error:**
```json
{
  "message": "Server error",
  "error": "Error details"
}
```
