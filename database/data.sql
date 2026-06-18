-- Seed Data for Bus Transport Management System
-- Database: bus_transport_db

USE bus_transport_db;

-- 1. Seed Users (Passwords are BCrypt hashed for 'admin123' / 'customer123')
-- Hash for 'admin123': $2a$10$kd7Zp7oiRRdEW7lCjI7W4O14cpQ2QzT0t86XfVdE9Fb/13vTHjJTK
-- Hash for 'customer123': $2a$10$vk4E5VmzQCSMgZ2taFb5hOPSXJwzdlyJw9FHpocTo9qs3kfvdBLci
INSERT INTO users (username, email, password_hash, phone, role, wallet_balance, loyalty_points, branch_id, active) VALUES
('superadmin', 'admin@rajnibus.com', '$2a$10$kd7Zp7oiRRdEW7lCjI7W4O14cpQ2QzT0t86XfVdE9Fb/13vTHjJTK', '+919999999999', 'SUPER_ADMIN', 5000.00, 100, NULL, TRUE),
('branch_mgr_blr', 'blr.mgr@rajnibus.com', '$2a$10$kd7Zp7oiRRdEW7lCjI7W4O14cpQ2QzT0t86XfVdE9Fb/13vTHjJTK', '+918888888888', 'BRANCH_ADMIN', 1500.00, 50, 1, TRUE),
('operator1', 'op1@rajnibus.com', '$2a$10$kd7Zp7oiRRdEW7lCjI7W4O14cpQ2QzT0t86XfVdE9Fb/13vTHjJTK', '+917777777777', 'OPERATOR', 0.00, 0, NULL, TRUE),
('agent_travels', 'agent@rajnibus.com', '$2a$10$kd7Zp7oiRRdEW7lCjI7W4O14cpQ2QzT0t86XfVdE9Fb/13vTHjJTK', '+916666666666', 'AGENT', 8500.00, 120, 1, TRUE),
('driver_ramesh', 'ramesh@rajnibus.com', '$2a$10$kd7Zp7oiRRdEW7lCjI7W4O14cpQ2QzT0t86XfVdE9Fb/13vTHjJTK', '+915555555555', 'DRIVER', 0.00, 0, NULL, TRUE),
('customer_amit', 'amit@gmail.com', '$2a$10$vk4E5VmzQCSMgZ2taFb5hOPSXJwzdlyJw9FHpocTo9qs3kfvdBLci', '+919876543210', 'CUSTOMER', 350.00, 45, NULL, TRUE),
('customer_priya', 'priya@gmail.com', '$2a$10$vk4E5VmzQCSMgZ2taFb5hOPSXJwzdlyJw9FHpocTo9qs3kfvdBLci', '+919876543211', 'CUSTOMER', 1200.00, 150, NULL, TRUE);

-- 2. Seed Buses
-- Seat layouts are structured as JSON arrays containing row/col, tier (lower/upper), and type (sleeper/seater)
INSERT INTO buses (bus_number, bus_type, capacity, amenities, status, seat_layout_json) VALUES
('KA-01-F-1234', 'AC_SLEEPER', 30, 'WiFi,Charging Port,Water Bottle,Pillow,Blanket,GPS', 'ACTIVE', 
'[{"id":"L1","row":1,"col":1,"type":"SLEEPER","tier":"LOWER","status":"AVAILABLE"},{"id":"L2","row":1,"col":2,"type":"SLEEPER","tier":"LOWER","status":"AVAILABLE"},{"id":"U1","row":1,"col":1,"type":"SLEEPER","tier":"UPPER","status":"AVAILABLE"},{"id":"U2","row":1,"col":2,"type":"SLEEPER","tier":"UPPER","status":"AVAILABLE"}]'),

('MH-12-Q-5678', 'AC_SEATER', 40, 'WiFi,Charging Port,Reading Light,Water Bottle,GPS', 'ACTIVE', 
'[{"id":"S1","row":1,"col":1,"type":"SEATER","tier":"LOWER","status":"AVAILABLE"},{"id":"S2","row":1,"col":2,"type":"SEATER","tier":"LOWER","status":"AVAILABLE"},{"id":"S3","row":1,"col":3,"type":"SEATER","tier":"LOWER","status":"AVAILABLE"},{"id":"S4","row":1,"col":4,"type":"SEATER","tier":"LOWER","status":"AVAILABLE"}]'),

('DL-03-A-9012', 'VOLVO_CLASSIC', 36, 'WiFi,Charging Port,Entertainment LCD,Water Bottle,Snacks,GPS', 'MAINTENANCE', 
'[{"id":"V1","row":1,"col":1,"type":"SEATER","tier":"LOWER","status":"AVAILABLE"},{"id":"V2","row":1,"col":2,"type":"SEATER","tier":"LOWER","status":"AVAILABLE"}]'),

('KA-02-N-9999', 'NON_AC_SLEEPER', 30, 'Charging Port,Water Bottle,Pillow,GPS', 'ACTIVE', 
'[{"id":"L1","row":1,"col":1,"type":"SLEEPER","tier":"LOWER","status":"AVAILABLE"},{"id":"L2","row":1,"col":2,"type":"SLEEPER","tier":"LOWER","status":"AVAILABLE"},{"id":"U1","row":1,"col":1,"type":"SLEEPER","tier":"UPPER","status":"AVAILABLE"},{"id":"U2","row":1,"col":2,"type":"SLEEPER","tier":"UPPER","status":"AVAILABLE"}]');

-- 3. Seed Routes
INSERT INTO routes (source, destination, distance_km, duration_minutes, active) VALUES
('Bangalore', 'Mumbai', 1000.0, 960, TRUE),
('Mumbai', 'Pune', 150.0, 180, TRUE),
('Bangalore', 'Chennai', 350.0, 360, TRUE),
('Delhi', 'Jaipur', 270.0, 300, TRUE);

-- 4. Seed Intermediate Stops
INSERT INTO stops (route_id, stop_name, stop_sequence, arrival_time_offset, fare_offset) VALUES
(1, 'Tumkur', 1, 60, 100.00),
(1, 'Chitradurga', 2, 180, 250.00),
(1, 'Hubli', 3, 420, 500.00),
(1, 'Kolhapur', 4, 600, 750.00),
(1, 'Pune Bypass', 5, 780, 900.00),
(3, 'Hosur', 1, 45, 50.00),
(3, 'Krishnagiri', 2, 90, 120.00),
(3, 'Vellore', 3, 210, 220.00);

-- 5. Seed Trips (Daily operations)
-- Set departures for today and tomorrow dynamically
INSERT INTO trips (bus_id, route_id, driver_id, departure_time, arrival_time, base_fare, trip_status, recurring_days) VALUES
(1, 1, 5, '2026-05-22 18:00:00', '2026-05-23 10:00:00', 1200.00, 'SCHEDULED', 'MON,WED,FRI'),
(2, 3, 5, '2026-05-22 22:00:00', '2026-05-23 04:00:00', 650.00, 'SCHEDULED', 'MON,TUE,WED,THU,FRI,SAT,SUN'),
(1, 2, 5, '2026-05-23 14:00:00', '2026-05-23 17:00:00', 350.00, 'SCHEDULED', 'SAT,SUN'),
(4, 1, 5, '2026-05-22 21:00:00', '2026-05-23 13:00:00', 950.00, 'SCHEDULED', 'MON,WED,FRI');

-- 6. Seed Payments
INSERT INTO payments (transaction_id, amount, payment_method, status, created_at) VALUES
('TXN-RZP-98321A', 1200.00, 'RAZORPAY_UPI', 'COMPLETED', '2026-05-22 09:30:00'),
('TXN-RZP-98321B', 650.00, 'RAZORPAY_CARD', 'COMPLETED', '2026-05-22 10:15:00'),
('TXN-WLT-98321C', 650.00, 'WALLET', 'COMPLETED', '2026-05-22 11:00:00'),
('TXN-CSH-98321D', 1300.00, 'AGENT_CASH', 'COMPLETED', '2026-05-22 11:20:00');

-- 7. Seed Bookings & Tickets
INSERT INTO bookings (trip_id, user_id, booking_reference, total_fare, booking_status, payment_id, booking_date) VALUES
(1, 6, 'BTMS-2026-A1B2', 1200.00, 'CONFIRMED', 1, '2026-05-22 09:30:00'),
(2, 7, 'BTMS-2026-C3D4', 650.00, 'CONFIRMED', 2, '2026-05-22 10:15:00'),
(2, 6, 'BTMS-2026-E5F6', 650.00, 'CONFIRMED', 3, '2026-05-22 11:00:00');

-- Seed Passengers (tied to bookings)
INSERT INTO passengers (booking_id, seat_number, passenger_name, age, gender) VALUES
(1, 'L1A', 'Amit Sharma', 32, 'MALE'),
(2, 'L1A', 'Priya Patel', 28, 'FEMALE'),
(3, 'L1B', 'Rohan Sharma', 12, 'MALE');

-- 8. Seed Cargo
INSERT INTO cargo_parcels (sender_name, sender_phone, receiver_name, receiver_phone, weight_kg, price, route_id, status, barcode) VALUES
('Vijay Kumar', '+919988776655', 'Sanjay Shah', '+919944332211', 12.5, 450.00, 1, 'BOOKED', 'CRG-1002931A'),
('Rajesh Jain', '+918877665544', 'Anil Mehta', '+918833221100', 4.0, 200.00, 3, 'IN_TRANSIT', 'CRG-1002931B');

-- 9. Seed Support Tickets
INSERT INTO support_tickets (user_id, subject, description, status, priority) VALUES
(6, 'Refund request for cancelled trip', 'My trip on route BLR-MAA was cancelled, please credit back the wallet.', 'OPEN', 'HIGH'),
(7, 'Seat Layout layout issue', 'Unable to book upper sleeper seats on mobile app browser.', 'IN_PROGRESS', 'MEDIUM');

-- 10. Audit Logs
INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES
(1, 'USER_LOGIN', 'Superadmin logged in successfully from Firefox browser', '192.168.1.100'),
(3, 'BUS_ADD', 'Operator added new Volvo Classic Bus DL-03-A-9012', '192.168.1.102'),
(4, 'TICKET_BOOK', 'Agent booked seats L1A, L1B for trip ID 2', '192.168.1.105');
