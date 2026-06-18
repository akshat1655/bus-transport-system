# Entity Relationship Diagram (ERD)

The following diagram illustrates the relational database structure of the Bus Transport Management System. It tracks users, roles, buses, routes, trips, bookings, passenger seat assignments, cargo shipping, support tickets, and payments.

```mermaid
erDiagram
    users {
        BIGINT id PK
        VARCHAR username UK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR phone
        VARCHAR role
        DECIMAL wallet_balance
        INT loyalty_points
        BIGINT branch_id
        BOOLEAN active
        TIMESTAMP created_at
    }

    buses {
        BIGINT id PK
        VARCHAR bus_number UK
        VARCHAR bus_type
        INT capacity
        TEXT amenities
        VARCHAR status
        TEXT seat_layout_json
        TIMESTAMP created_at
    }

    routes {
        BIGINT id PK
        VARCHAR source
        VARCHAR destination
        DOUBLE distance_km
        INT duration_minutes
        BOOLEAN active
    }

    stops {
        BIGINT id PK
        BIGINT route_id FK
        VARCHAR stop_name
        INT stop_sequence
        INT arrival_time_offset
        DECIMAL fare_offset
    }

    trips {
        BIGINT id PK
        BIGINT bus_id FK
        BIGINT route_id FK
        BIGINT driver_id FK
        DATETIME departure_time
        DATETIME arrival_time
        DECIMAL base_fare
        VARCHAR trip_status
        VARCHAR recurring_days
    }

    payments {
        BIGINT id PK
        VARCHAR transaction_id UK
        DECIMAL amount
        VARCHAR payment_method
        VARCHAR status
        TIMESTAMP created_at
    }

    bookings {
        BIGINT id PK
        BIGINT trip_id FK
        BIGINT user_id FK
        VARCHAR booking_reference UK
        DECIMAL total_fare
        VARCHAR booking_status
        BIGINT payment_id FK
        TIMESTAMP booking_date
    }

    passengers {
        BIGINT id PK
        BIGINT booking_id FK
        VARCHAR seat_number
        VARCHAR passenger_name
        INT age
        VARCHAR gender
    }

    cargo_parcels {
        BIGINT id PK
        VARCHAR sender_name
        VARCHAR sender_phone
        VARCHAR receiver_name
        VARCHAR receiver_phone
        DOUBLE weight_kg
        DECIMAL price
        BIGINT route_id FK
        VARCHAR status
        VARCHAR barcode UK
    }

    support_tickets {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR subject
        TEXT description
        VARCHAR status
        VARCHAR priority
        TIMESTAMP created_at
    }

    audit_logs {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR action
        TEXT details
        VARCHAR ip_address
        TIMESTAMP created_at
    }

    routes ||--o{ stops : "has many stops"
    routes ||--o{ trips : "scheduled onto"
    buses ||--o{ trips : "assigned to"
    users ||--o{ trips : "drives (role DRIVER)"
    trips ||--o{ bookings : "booked under"
    users ||--o{ bookings : "creates (role CUSTOMER/AGENT)"
    payments ||--o| bookings : "settles"
    bookings ||--o{ passengers : "lists"
    routes ||--o{ cargo_parcels : "routed via"
    users ||--o{ support_tickets : "submits"
    users ||--o{ audit_logs : "triggers activity"
```
