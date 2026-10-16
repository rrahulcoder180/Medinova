# MEDINOVA — Full Stack Java Pharmacy Application

Medinova is a full-stack pharmacy web application developed as a college presentation project. It allows users to browse healthcare products, search medicines, manage a shopping cart, and place orders.

## Live Demo

- **Website:** https://medinova-9vnw.onrender.com
- **Medicines API:** https://medinova-9vnw.onrender.com/api/medicines

*Note: The free hosting service may take some time to start after a period of inactivity.*

## Technology Stack

- **Backend:** Java 21, Spring Boot
- **Frontend:** HTML, CSS, JavaScript
- **Database:** H2 for local development; PostgreSQL for production
- **ORM:** Spring Data JPA / Hibernate
- **Deployment:** Render
- **Production database hosting:** Neon PostgreSQL

## Features

- Responsive pharmacy interface for laptops and mobile phones
- Medicine listing loaded from the backend REST API
- Medicine search and category filtering
- Shopping cart with quantity controls
- Automatic cart-total calculation
- Checkout form and payment-method selection
- Order creation and database persistence
- Emergency SOS demonstration interface

## Project Structure

- `backend/` — Spring Boot application, REST controllers, entities, repositories, and database configuration
- `source/` — Frontend HTML, CSS, and JavaScript files
- `Dockerfile` — Instructions for building and running the application on Render
- `README_START_HERE.md` — Project documentation and setup guide

## Run Locally

### Requirements

- Java 21
- Maven, or the Maven Wrapper if included in the project
- Git (optional, for cloning the repository)

### Steps

1. Open the project folder in VS Code.
2. Open a terminal in the `backend` folder.
3. Run the application:

   ```bash
   mvn spring-boot:run
   ```

4. Open the local website:

   http://localhost:8080

Use the project's existing local database configuration when running in the default development profile.

## Main API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/medicines` | Retrieve medicines |
| POST | `/api/orders` | Create an order |
| GET | `/api/orders` | Retrieve saved orders |

**Security note:** This is an educational MVP, not a production-ready pharmacy or payment system. Login and registration are not implemented. Order access needs additional authorization before real customer information is used.

## Future Improvements

- User registration and secure login
- Customer-specific order history and access controls
- Admin dashboard
- Order tracking
- Maps and delivery-location support
- Prescription uploads
- Doctor consultation
- Integration with a real payment gateway after appropriate security and testing

## Project Status

The deployed website has been tested for medicine retrieval, shopping-cart functionality, checkout, and order persistence in PostgreSQL.

Medinova is intended for educational demonstration purposes. It is not a substitute for a regulated pharmacy platform or a real payment-processing system.
