package com.enterprise.bus.controller;

import com.enterprise.bus.dto.AuthDto.*;
import com.enterprise.bus.model.Role;
import com.enterprise.bus.model.User;
import com.enterprise.bus.repository.UserRepository;
import com.enterprise.bus.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private final Map<String, String> otpStore = new HashMap<>(); // Temp OTP store for verification simulation

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsernameIgnoreCase(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmailIgnoreCase(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        Role userRole = Role.CUSTOMER;
        try {
            if (registerRequest.getRole() != null) {
                userRole = Role.valueOf(registerRequest.getRole().toUpperCase());
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: Invalid role specified.");
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhone(registerRequest.getPhone());
        user.setRole(userRole);

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        System.out.println("Login attempt for username: [" + loginRequest.getUsername() + "]");
        User user = userRepository.findByUsernameIgnoreCase(loginRequest.getUsername())
                .orElse(null);

        if (user == null) {
            System.out.println("User not found in DB!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Invalid username or password!");
        }

        boolean matches = passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash());
        System.out.println("Password match result: " + matches);
        System.out.println("Input password length: " + (loginRequest.getPassword() == null ? "null" : loginRequest.getPassword().length()));
        System.out.println("Stored hash in DB: [" + user.getPasswordHash() + "]");

        if (!matches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Invalid username or password!");
        }

        if (!user.getActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Account is disabled!");
        }

        String jwt = tokenProvider.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(jwt, user.getUsername(), user.getRole().name(), user.getId()));
    }

    @GetMapping("/debug-users")
    public ResponseEntity<?> debugUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream()
            .map(u -> u.getUsername() + " | " + u.getRole() + " | " + u.getPasswordHash() + " | " + u.getActive())
            .toList());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getUserProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByUsernameIgnoreCase(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new ProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getWalletBalance(),
                user.getLoyaltyPoints()
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Error: No account linked to this email.");
        }

        // Simulate OTP sending
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.put(email, otp);
        System.out.println("====== SMS SIMULATOR ======");
        System.out.println("To: " + user.getPhone() + " (Email: " + email + ")");
        System.out.println("Body: Your OTP for Bus Transport System is: " + otp);
        System.out.println("===========================");

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent successfully (Simulated)");
        response.put("otp", otp); // Return OTP for easy UI testing/verification!
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp, @RequestParam String newPassword) {
        String cachedOtp = otpStore.get(email);
        if (cachedOtp == null || !cachedOtp.equals(otp)) {
            return ResponseEntity.badRequest().body("Error: Invalid or expired OTP.");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpStore.remove(email);

        return ResponseEntity.ok("Password reset successful!");
    }

    @GetMapping("/drivers")
    public ResponseEntity<?> getDrivers() {
        return ResponseEntity.ok(userRepository.findAll().stream()
            .filter(u -> u.getRole() == Role.DRIVER)
            .toList());
    }

    @PostMapping("/drivers")
    public ResponseEntity<?> createDriver(@RequestParam String name) {
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Driver name cannot be empty.");
        }
        
        String cleanName = name.trim().toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", "").replaceAll("\\s+", "_");
        String baseUsername = "driver_" + cleanName;
        String username = baseUsername;
        int counter = 1;
        while (userRepository.existsByUsernameIgnoreCase(username)) {
            username = baseUsername + counter;
            counter++;
        }

        String email = username + "@rajnibus.com";

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("driver123"));
        user.setPhone("+910000000000");
        user.setRole(Role.DRIVER);

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }
}
