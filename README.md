### Fintech Api:

## KOLPAY API

## Overview

 These API is a Fintech project aimed at solving the problem digital funds processing. It comes with variety of features above:

 - KolPay allows users to create an account with their personal credentials and login. 

 - It assigns the user a unique account number authomatically making the first five digits of their phone number the last five digits of their unique account number. 

 - It also allows a user to send funds, deposit and also withdraw fellow users. 

 - Provided flexibity in the api is updating a user account balance, checking account balance and records of a user transactions and a lot more...

 

## Tools Used includes: 
  1. **languages:** Javascript server side (Node.js)
  2. **Frameworks:** Express.js
  3. **Database:** MongoDB mongoose
  3. **Packages:** mongoose, validator for DB and schema Management. bcryptjs and crypto for password management and hashing. JsonWebToken for user authentication and authorization and a lot more..

## Features include:
  - User  authentication signUp/Login Using JsonWebToken.
  - Generated unique account number for transactions such as fund deposit, transfer and withdraw.
  - Updating and checking of user's account balance and transaction record
  - Secured user data


## Routes available in the API:
# User:
  - Register route
  - Login route
  - Get user's account balance
  - Preview user's transactions record
  - Update password route
  - Forgot password and reset password routes
  - Get all Users route (Restricted to only admin and director)
  - Get user profile route
  - Update user profile route
  - Delete user profile route

# Trasanction:
  - Get All transaction route
  - Get a transaction record route
  - Deposit funds route
  - Withdrawal funds route
  - Transfer funds route
 
