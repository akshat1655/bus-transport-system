package com.enterprise.bus;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BcryptTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("admin123 match: " + encoder.matches("admin123", "$2a$10$kd7Zp7oiRRdEW7lCjI7W4O14cpQ2QzT0t86XfVdE9Fb/13vTHjJTK"));
        System.out.println("customer123 match: " + encoder.matches("customer123", "$2a$10$vk4E5VmzQCSMgZ2taFb5hOPSXJwzdlyJw9FHpocTo9qs3kfvdBLci"));
    }
}
