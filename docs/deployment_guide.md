# Deployment Guide

This document describes how to deploy and run the Bus Transport Management System application in local development or production environments.

---

## Prerequisites
To run the full stack, you need:
* **Docker** and **Docker Compose** installed on your system.
* Alternatively, if running services standalone (without containers):
  * **Java JDK 17** (to compile and run the backend)
  * **Node.js v18/v20** (to run the frontend Vite server)
  * **MySQL 8.x** (or use the H2 database engine fallback configured by default)

---

## Option 1: Unified Docker Deployment (Recommended)
This approach launches all dependencies (MySQL database, Spring Boot API layer, and React.js Client) within containerized environments. No local Java, Maven, or MySQL installations are required.

### 1. Build and Launch Container Services
In the root project directory (containing `docker-compose.yml`), run:
```bash
docker-compose up --build
```

### 2. Verify Port Routing
Once all containers boot up:
* **React Web Frontend**: `http://localhost:3000` (Access the portal here)
* **Spring Boot REST APIs**: `http://localhost:8080`
* **MySQL Database**: `localhost:3306` (Credentials: Username `root`, Password `rootpassword`)

### 3. Tear Down Container Services
To stop and clean up containers, run:
```bash
docker-compose down -v
```

---

## Option 2: Standalone Developer Execution

If you prefer to run services manually for local development, follow these instructions.

### 1. Launch the Backend REST APIs
The Spring Boot backend is configured to use an **in-memory H2 database engine** by default. This allows immediate execution without requiring a MySQL server.

Navigate to the `backend/` directory:
```bash
cd backend
```

Build and run using the Maven Wrapper (zero global Maven installation required):
```bash
# On Windows PowerShell / Command Prompt:
.\mvnw.cmd spring-boot:run

# On Linux / macOS:
chmod +x mvnw
./mvnw spring-boot:run
```
The server starts on `http://localhost:8080`.
* **H2 Database Console**: Accessible at `http://localhost:8080/h2-console`
  * **JDBC URL**: `jdbc:h2:mem:bus_transport_db`
  * **Username**: `sa`
  * **Password**: (leave blank)

### 2. Launch the React Frontend
Navigate to the `frontend/` directory:
```bash
cd frontend
```

Install packages and boot the Vite development server:
```bash
npm install
npm run dev
```
The frontend is served on `http://localhost:3000` with HMR (Hot Module Replacement) enabled.

---

## 3. Seed Credentials for Testing
The application classpaths are auto-seeded with administrative profiles on initial database startup. You can log in using these default credentials:

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `superadmin` | `admin123` | `ROLE_SUPER_ADMIN` | Full permissions to fleet, routes, and financial audits |
| `operator1` | `admin123` | `ROLE_OPERATOR` | Manage schedules, cargo status, and support desk |
| `agent_travels` | `admin123` | `ROLE_AGENT` | Standard ticket booking with agency wallet access |
| `customer_amit` | `customer123` | `ROLE_CUSTOMER` | Regular user for seat booking and ticket printing |
| `driver_ramesh` | `admin123` | `ROLE_DRIVER` | Bus transit crew |
