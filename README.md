# Fintech Backend Application

![KolPay API](https://img.shields.io/badge/Node.js-Express.js-brightgreen)

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Admin Dashboard](#admin-dashboard)
- [Security](#security)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Project Overview

KolPay is a fintech API built using Node.js, Express.js, MongoDb & Flutterwave for payment processing. It allows users to manage their financial transactions, such as funds deposits, bill payments and inter-bank transactions. It also includes an admin dashboard for monitoring user activities, virtual accounts and generating reports, invoices etc.

## Features

- **User Authentication**: Sign-up, login, password reset.
- **User Profiles and Account Management**: Manage user information and view transaction history.
- **Transaction Management**: Deposit, withdrawal, inter-bank transfer, automatic refunds for failed transactions etc.
- **Bill Payments and Airtime Recharge**: uses flutterwave api to provide bill payments and airtime recharge
- **Virtual accounts and virtual cards**: users can create virtual accounts and get virtual cards
- **Admin Dashboard**: User management, transaction monitoring, reports, and audit logs.
- **Security**: Data encryption, JWT authentication, and two-factor authentication (Authenticator App & sms), Data Sanitization, Secure HTTP headers, Parameter Pollution and several other security techniques against attacks like brute force, XSS, DoS and so on.
- **Notifications**: Email and SMS notifications for transactions.
- **Error Handling**: Server error handling (uncaughtException & unhandledRejection). DB Errors. Clear error messages for both in development and production mode. And so on...

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Service**: flutterwave API
- **Email Service**: Nodemailer with Brevo SMTP service
- **Admin Dashboard**: MongoDB Aggregate pipeline and other mongoDB statistics and query methods
- **Logging**: Winston, Morgan, Audit logs

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js (v14 or higher)
- MongoDB
- Postman (for API testing)

## Getting Started

To get a local copy up and running, follow these simple steps:

1. **Clone the repo:**

   ```bash
   git clone https://github.com/KolarDev/KolPay.git
   cd your-repo-name

   ```

2. **Navigate to the project directory**

   ```bash
   cd KolPay

   ```

3. **Install dependencies**

````bash
npm install

4. **Create a .env file in the root directory and add the following environment variables**
```bash
NODE_ENV=development
PORT=8000
DATABASE_URL=your-mongodb-connection-string
DATABASE_PASSWORD=your-mongodb-password
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=jwt-expire-time
JWT_COOKIE_EXPIRES_IN=jwt-cookie-expire-time
EMAIL_FROM=your-email-sending-from
EMAIL_USERNAME=email-service-username
EMAIL_PASSWORD=email-password
EMAIL_HOST=email-host
EMAIL_PORT=email-port
FLW_PUBLIC_KEY=FLWPUBK_TEST-c658ba90799c8c77ba56e58dc-X
FLW_SECRET_KEY=FLWSECK_TEST-58d8af6c822a18fe83c3751a8-X
FLW_ENCRYPTION_KEY=FLWSECK_TEST1ba34bf4a3
FLW_SECRET_HASH=fintechapi-webhook-secret-key

5. **Install dependencies**
```bash
npm start

## Folder Structure
├── controllers
├── models
├── routes
├── public
├── middlewares
├── utils
├── tests
├── views
├── app.js
├── .eslintrc.json
├── .gitignore
├── package.json
├── .env
└── server.js

## API Endpoints

### User Authentication
- POST /api/v1/user/register - Register a new user
- POST /api/v1/user/login - Log in a user
- POST /api/v1/user/forgotPassword - Send password reset link
- PATCH /api/v1/user/resetPassword - Reset user password
- PATCH /api/v1/user/updatePassword - Update user password
- GET /api/v1/user/2faAuth - Enable two factor authenctication
- POST /api/v1/user/2faAuth - Verify with two factor authentication
### User Management
- GET /api/v1/users/profile/:id - Get user profile
- PATCH /api/v1/users/profile/:id - Update user profile but not password
- DELETE /api/v1/users/profile/:id - Delete user account
### Transactions
- POST /api/v1/transactions/deposit - Deposit funds
- POST /api/v1/transactions/withdraw - Withdraw funds
- POST /api/v1/transactions/transfer - Transfer funds Kolpay to Kolpay
- POST /api/v1/transactions/transfer-inter - Transfer funds Inter-bank
- GET /api/v1/transactions/history - Get transaction history
### Fraud Detection
- GET /api/v1/fraud-monitoring - Monitor suspicious activities
### Virtual Accounts
- POST /api/v1/transactions/deposit - Deposit funds
- POST /api/v1/transactions/withdraw - Withdraw funds
- POST /api/v1/transactions/transfer - Transfer funds Kolpay to Kolpay
- POST /api/v1/transactions/transfer-inter - Transfer funds Inter-bank

## Admin Dashboard
The admin dashboard allows administrators to manage users, monitor transactions, review suspicious activities, and generate reports. Below are the key routes available in the admin dashboard:

### Admin Endpoints
- GET /api/v1/admin/dashboard - Admin dashboard
- PATCH /api/v1/admin/users/:id/block - Block a user
- PATCH /api/v1/admin/users/blocked - View all blocked users
- GET /api/v1/admin/users - View all users
- GET /api/v1/admin/transactions - View all transactions
- GET /api/v1/admin/logs - View all admin actions logs
- POST /api/v1/admin/report - Generate a transaction report

## Security
This application follows industry standards for securing user data and transactions. Below are the key security measures implemented:

1. Encryption
All sensitive user data, such as passwords, are encrypted using bcrypt before being stored in the database. Other sensitive information is encrypted using the crypto module.

2. Two-Factor Authentication (2FA)
Users can enable 2FA for enhanced account security. 2FA can be completed via an OTP sent to the user’s email or phone number, or by using an authenticator app.

3. Fraud Detection
Upcoming..........

4. Data Sanitization, Secure HTTP headers, Parameter Pollution and several other security techniques against attacks like brute force, XSS, DoS and so on.

5. **Run tests**
```bash
npm run test

## Contributing
Contributions are welcome! If you want to contribute to this project, please follow these steps:

Fork the project
Create a feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
Code of Conduct
Please adhere to the code of conduct to maintain a collaborative and friendly environment.

## License
This project is licensed under the MIT License. See the LICENSE file for more information.

## Contact
Project Maintainer - Muhyideen Abdulbasit Kolawole (KolarDev)
Email - muhyideenabdulbasit2@gmail.com or kolardev118@gmail.com
````
