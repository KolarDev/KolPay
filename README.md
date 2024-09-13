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
KolPay is a backend application for a fintech platform built using Node.js and Express.js. It provides users with functionality to manage their financial transactions, such as deposits, withdrawals, and transfers. It also includes an admin dashboard for monitoring user activities, generating reports, and handling transactions.

## Features
- **User Authentication**: Sign-up, login, password reset.
- **User Profiles and Account Management**: Manage user information and view transaction history.
- **Transaction Management**: Deposit, withdrawal, transfer, and balance checks.
- **Account Number Generation**: Unique account numbers generated using user information. User's seriel number and Phone number
- **Admin Dashboard**: User management, transaction monitoring, reports, and audit logs.
- **Security**: Data encryption, JWT authentication, and two-factor authentication.
- **Notifications**: Email and SMS notifications for transactions.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer with SendGrid or any other SMTP service
- **Admin Dashboard**: MongoDB Aggregate pipeline and other mongoDB statistics and query methods 
- **Logging**: Winston, Audit logs

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

2. **Navigate to the project directory**
  ```bash
  cd fintech-backend

3. **Install dependencies**
  ```bash
  npm install

4. **Create a .env file in the root directory and add the following environment variables**
  ```bash
  NODE_ENV=development
  PORT=8000
  MONGO_URI=your-mongodb-connection-string
  JWT_SECRET=your-jwt-secret
  EMAIL_SERVICE_API_KEY=your-email-service-api-key
  TWILIO_ACCOUNT_SID=your-twilio-account-sid
  TWILIO_AUTH_TOKEN=your-twilio-auth-token

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
  - POST /api/v1/auth/signup - Register a new user
  - POST /api/v1/auth/login - Log in a user
  - POST /api/v1/auth/forgot-password - Send password reset link
  - POST /api/v1/auth/reset-password - Reset user password
### User Management
  - GET /api/v1/users/me - Get user profile
  - PATCH /api/v1/users/me - Update user profile
  - POST /api/v1/users/me/avatar - Upload user avatar
### Transactions
  - POST /api/v1/transactions/deposit - Deposit funds
  - POST /api/v1/transactions/withdraw - Withdraw funds
  - POST /api/v1/transactions/transfer - Transfer funds
  - GET /api/v1/transactions/history - Get transaction history
### Fraud Detection
  - GET /api/v1/fraud-monitoring - Monitor suspicious activities

## Admin Dashboard
  The admin dashboard allows administrators to manage users, monitor transactions, review suspicious activities, and generate reports. Below are the key routes available in the admin dashboard:

### Admin Endpoints
  - GET /api/v1/admin/users - Get all users
  - PATCH /api/v1/admin/users/:id/block - Block a user
  - PATCH /api/v1/admin/users/:id/unblock - Unblock a user
  - GET /api/v1/admin/transactions - View all transactions
  - GET /api/v1/admin/fraud-logs - View fraud detection logs
  - POST /api/v1/admin/report - Generate a transaction report

## Security
This application follows industry standards for securing user data and transactions. Below are the key security measures implemented:

1. Encryption
All sensitive user data, such as passwords, are encrypted using bcrypt before being stored in the database. Other sensitive information is encrypted using the crypto module.

2. Two-Factor Authentication (2FA)
Users can enable 2FA for enhanced account security. 2FA can be completed via an OTP sent to the user’s email or phone number, or by using an authenticator app.

3. Fraud Detection
A rule-based and machine learning-powered system detects suspicious transactions, such as unusual spending patterns or location anomalies, and raises alerts or blocks transactions for review.

## Testing
The application has unit and integration tests for the API endpoints, ensuring reliable and robust functionality. We use the jest and supertest libraries for our testing suite.

<!-- ### Running Tests
To run the tests, use the following command:
  ```bash
  npm test -->


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
