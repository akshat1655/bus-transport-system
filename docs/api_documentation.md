# REST API Documentation

This document outlines the REST APIs exposed by the Spring Boot backend service on `http://localhost:8080`.

---

## 1. Authentication & Session Management (`/api/auth`)

### Register New User
* **Endpoint**: `POST /api/auth/register`
* **Access**: Public
* **Request Body**:
```json
{
  "username": "customer_user",
  "password": "secure_password",
  "email": "customer@example.com",
  "fullName": "John Doe",
  "phoneNumber": "+919876543210",
  "roleName": "CUSTOMER"
}
```
* **Response**: `200 OK` on success, or error details on conflict.

### Login / JWT Issuance
* **Endpoint**: `POST /api/auth/login`
* **Access**: Public
* **Request Body**:
```json
{
  "username": "customer_user",
  "password": "secure_password"
}
```
* **Response**: `200 OK` with JSON Web Token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.ey...",
  "role": "ROLE_CUSTOMER",
  "username": "customer_user",
  "userId": 1,
  "walletBalance": 1000.00
}
```

### Fetch Current Profile details
* **Endpoint**: `GET /api/auth/me`
* **Access**: Authenticated (JWT Header required)
* **Headers**: `Authorization: Bearer <token>`
* **Response**: `200 OK` with details of logged in operator/customer.

---

## 2. Bus Fleet Inventory (`/api/buses`)

### List All Buses
* **Endpoint**: `GET /api/buses`
* **Access**: Authenticated (ADMIN, OPERATOR)
* **Response**: List of all fleet assets.

### Create Bus Profile / Layout
* **Endpoint**: `POST /api/buses`
* **Access**: Authenticated (ADMIN)
* **Request Body**:
```json
{
  "busNumber": "KA-01-F-7733",
  "busType": "AC_SLEEPER",
  "capacity": 30,
  "amenities": "Wifi, Charging Points, Blankets",
  "status": "ACTIVE",
  "seatLayoutJson": "[{\"id\":\"1A\",\"row\":1,\"col\":1,\"type\":\"SLEEPER\"}]"
}
```

---

## 3. Routes & Schedule Planning (`/api/routes`)

### Create Transit Route
* **Endpoint**: `POST /api/routes`
* **Access**: Authenticated (ADMIN)
* **Request Body**:
```json
{
  "source": "Bangalore",
  "destination": "Goa",
  "distanceKm": 560.00,
  "durationMinutes": 600,
  "stopSequenceJson": "[\"Tumkur\", \"Davangere\", \"Hubli\"]"
}
```

---

## 4. Trip Scheduling (`/api/trips`)

### Search Schedules
* **Endpoint**: `GET /api/trips/search`
* **Access**: Public / Authenticated
* **Parameters**:
  * `source` (String)
  * `destination` (String)
  * `date` (ISO Date Format, e.g. `2026-05-22`)
* **Response**: `200 OK` with matching schedules and arrays of locked/occupied seat IDs.

### Live GPS Tracking Coordinates
* **Endpoint**: `GET /api/trips/live-coordinates/{id}`
* **Access**: Public / Authenticated
* **Response**: Real-time mock coordinates of active bus:
```json
{
  "tripId": 1,
  "latitude": 12.9716,
  "longitude": 77.5946,
  "speedKmh": 74.50,
  "etaMinutes": 240,
  "status": "IN_SERVICE"
}
```

---

## 5. Ticket Bookings (`/api/bookings`)

### Book Tickets (Safe Seat Locking)
* **Endpoint**: `POST /api/bookings`
* **Access**: Authenticated
* **Request Body**:
```json
{
  "tripId": 1,
  "passengers": [
    {
      "seatNumber": "1A",
      "passengerName": "Jane Doe",
      "age": 28,
      "gender": "FEMALE"
    }
  ],
  "paymentMethod": "WALLET"
}
```
* **Response**: `200 OK` with ticket details:
```json
{
  "id": 1,
  "bookingReference": "REF-ABC12345",
  "seatNumbers": ["1A"],
  "totalFare": 1200.00,
  "bookingStatus": "CONFIRMED",
  "paymentMethod": "WALLET",
  "qrCodeData": "TICKET:REF-ABC12345:SEATS[1A]",
  "bookingDate": "2026-05-22T12:00:00"
}
```

---

## 6. Cargo & Logistics (`/api/cargo`)

### Book Shipment
* **Endpoint**: `POST /api/cargo`
* **Access**: Authenticated (ADMIN, OPERATOR)
* **Request Body**:
```json
{
  "route": { "id": 1 },
  "senderName": "Sender Name",
  "senderPhone": "+919988776655",
  "receiverName": "Recipient Name",
  "receiverPhone": "+918877665544",
  "weightKg": 12.50,
  "description": "Box of industrial tools",
  "status": "BOOKED"
}
```
* **Response**: `200 OK` containing calculated price (`150 + 25/kg`) and generated barcode `CRG-UUID8`.

### Update Cargo Status
* **Endpoint**: `PUT /api/cargo/{id}/status`
* **Access**: Authenticated (OPERATOR)
* **Parameters**: `status` (e.g. `IN_TRANSIT`, `DELIVERED`)

---

## 7. Customer Support Desk (`/api/support`)

### Log Support Ticket
* **Endpoint**: `POST /api/support`
* **Access**: Authenticated (CUSTOMER, AGENT)
* **Request Body**:
```json
{
  "subject": "Fare discrepancy",
  "category": "BOOKING_ISSUE",
  "message": "Dynamic pricing applied twice on the booking checkout."
}
```

### Update Ticket status (Resolve/Close)
* **Endpoint**: `PUT /api/support/{id}/status`
* **Access**: Authenticated (OPERATOR, ADMIN)
* **Parameters**: `status` (e.g. `RESOLVED`, `CLOSED`)
