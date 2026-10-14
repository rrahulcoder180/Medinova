# MEDINOVA - Full Stack Java MVP

This project is designed for a college presentation.

ARCHITECTURE:
- Backend: Java 17 + Spring Boot
- Database: H2 (easy demo database; can later change to MySQL)
- Frontend: HTML + CSS + JavaScript
- Android: Java Android app can use WebView for the same responsive website, or later become a native REST client.

FEATURES IN THIS MVP:
- Medinova teal/white pharmacy UI
- Responsive mobile + laptop design
- Medicine list loaded from Java REST API
- Search medicines
- Add to cart
- Increase/decrease quantity
- Checkout
- Payment method selection
- Order creation
- Emergency SOS demo flow
- H2 database

RUN:
1. Install Java 17.
2. Install Maven.
3. Open a terminal in the `backend` folder.
4. Run: mvn spring-boot:run
5. Open: http://localhost:8080

IMPORTANT:
For a phone on the same Wi-Fi, the phone cannot use localhost to reach your laptop.
Use your laptop's local IPv4 address, for example:
http://192.168.1.5:8080
and allow Java through Windows Firewall if asked.

NEXT FEATURES:
- MySQL
- Login/register
- Admin dashboard
- Real order tracking
- Google Maps/location
- Doctor consultation
- Prescription upload
- Real payment gateway (only after the college demo)
