# EazyGoRwanda Backend API

Welcome to EazyGoRwanda, your premier destination for convenient and sustainable transportation across the beautiful landscapes of Rwanda. At EazyGoRwanda, we believe in fostering community, reducing carbon footprints, and making your journeys not just efficient but memorable.

Postman Workspace Link https://www.postman.com/planetary-shuttle-895172/workspace/rwandarideshare/collection/11350364-098a775f-8747-464d-ba4b-64b5cc5fd63d?action=share&source=copy-link&creator=11350364
## Table of Contents
- [EazyGoRwanda Backend API](#eazygorwanda-backend-api)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Features](#features)
  - [Encryption](#encryption)
  - [License](#license)
  - [Contact Information](#contact-information)

## Installation

To get started with EazyGoRwanda backend, follow these steps:

1. Clone the repository:

    - Using HTTPS:
        ```bash
        git clone https://github.com/ALVINdimpos/RwandaRideShare.git
        cd RwandaRideShare
        ```
        
    - Using SSH:
        ```bash
        git clone git@github.com:ALVINdimpos/RwandaRideShare.git
        cd RwandaRideShare
        ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Copy the environment configuration:
    ```bash
    cp .env.example .env
    ```
   Update the values in the `.env` file with your configurations.

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Run database seeds:
   ```bash
   npm run seed
   ```

6. Generating Private and Public Keys:
    - To enhance token security, generate the required private and public keys using the following script:

      ```bash
      #!/bin/bash

      # 1. Generate private key
      openssl genpkey -algorithm RSA -out private_key.pem

      # 2. Extract public key from private key
      openssl rsa -pubout -in private_key.pem -out public_key.pem
      ```

      This script uses OpenSSL to generate an RSA private key (`private_key.pem`) and extracts the corresponding public key (`public_key.pem`). These keys are necessary for the custom signature algorithm 'RS256' used in the creation of JWT tokens. Make sure to keep your private key secure and never expose it to unauthorized users.

## Features

- User Registration and Authentication.
- Profile Management.
- Ride Creation.
- Ride Search and Booking.
- Real-time Tracking.
- Payment Integration.
- Reviews and Ratings.
- Notifications.
- Chat or Messaging System.
- Driver Verification.
- Emergency Assistance.
- Carpooling and Group Rides.
- Promotions and Referrals.
- Multi-language Support.
- Data Privacy and Security.

## Encryption

All data exchanged through EazyGoRwanda's backend API is end-to-end encrypted using the renowned library Crypto-JS with strong keys to ensure the highest level of security.

## License

This project is licensed under the MIT License.

## Contact Information

For any inquiries or support, please contact the EazyGoRwanda team at [info@EazyGoRwanda.com](mailto:info@EazyGoRwanda.com).
