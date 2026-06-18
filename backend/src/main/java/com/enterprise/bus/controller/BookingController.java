package com.enterprise.bus.controller;

import com.enterprise.bus.dto.BookingDto.*;
import com.enterprise.bus.model.*;
import com.enterprise.bus.repository.*;
import com.enterprise.bus.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private WhatsAppService whatsAppService;

    @PostMapping
    @Transactional
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByUsernameIgnoreCase(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Trip trip = tripRepository.findById(request.getTripId())
                .orElse(null);
        if (trip == null) {
            return ResponseEntity.badRequest().body("Error: Trip not found!");
        }

        // 1. Verify seat conflicts
        List<Booking> activeBookings = bookingRepository.findByTripId(trip.getId());
        Set<String> alreadyBookedSeats = activeBookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getBookingStatus()))
                .flatMap(b -> b.getPassengers().stream())
                .map(Passenger::getSeatNumber)
                .collect(Collectors.toSet());

        List<String> requestedSeats = request.getPassengers().stream()
                .map(PassengerDto::getSeatNumber)
                .collect(Collectors.toList());

        for (String seat : requestedSeats) {
            if (alreadyBookedSeats.contains(seat)) {
                return ResponseEntity.badRequest().body("Error: Seat " + seat + " is already booked!");
            }
        }

        // 2. Pricing Engine with Dynamic Markup
        // If occupancy exceeds 50%, increase fare by 20%. If occupancy exceeds 80%, increase by 40%.
        int totalSeats = trip.getBus().getCapacity();
        double currentOccupancy = (double) alreadyBookedSeats.size() / totalSeats;
        double pricingMultiplier = 1.0;
        if (currentOccupancy > 0.8) {
            pricingMultiplier = 1.4;
        } else if (currentOccupancy > 0.5) {
            pricingMultiplier = 1.2;
        }

        BigDecimal baseFare = trip.getBaseFare();
        BigDecimal itemPrice = baseFare.multiply(BigDecimal.valueOf(pricingMultiplier));
        BigDecimal totalFare = itemPrice.multiply(BigDecimal.valueOf(request.getPassengers().size()));

        // 3. Handle Payment settlement
        Payment payment = new Payment();
        payment.setAmount(totalFare);
        payment.setPaymentMethod(request.getPaymentMethod());
        
        if ("WALLET".equalsIgnoreCase(request.getPaymentMethod())) {
            if (user.getWalletBalance().compareTo(totalFare) < 0) {
                return ResponseEntity.badRequest().body("Error: Insufficient wallet balance!");
            }
            user.setWalletBalance(user.getWalletBalance().subtract(totalFare));
            payment.setTransactionId("TXN-WLT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            payment.setStatus("COMPLETED");
            userRepository.save(user);
        } else {
            // Simulated gateway payment success (Razorpay/Cards)
            payment.setTransactionId(request.getTransactionId() != null ? request.getTransactionId() : 
                    "TXN-RZP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            payment.setStatus("COMPLETED");
        }
        paymentRepository.save(payment);

        // 4. Save Booking & Passenger allocations
        Booking booking = new Booking();
        booking.setTrip(trip);
        booking.setUser(user);
        booking.setBookingReference("BTMS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setTotalFare(totalFare);
        booking.setBookingStatus("CONFIRMED");
        booking.setPayment(payment);
        booking.setPickupLocation(request.getPickupLocation());
        booking.setPickupTime(request.getPickupTime());
        booking.setDropLocation(request.getDropLocation());
        booking.setDropTime(request.getDropTime());

        for (PassengerDto passDto : request.getPassengers()) {
            Passenger passenger = new Passenger();
            passenger.setBooking(booking);
            passenger.setSeatNumber(passDto.getSeatNumber());
            passenger.setPassengerName(passDto.getPassengerName());
            passenger.setAge(passDto.getAge());
            passenger.setGender(passDto.getGender());
            booking.getPassengers().add(passenger);
        }

        // Add Loyalty Points (1 point for every 100 Rs spent)
        user.setLoyaltyPoints(user.getLoyaltyPoints() + totalFare.divide(BigDecimal.valueOf(100)).intValue());
        userRepository.save(user);

        Booking savedBooking = bookingRepository.save(booking);

        try {
            whatsAppService.sendBookingConfirmation(savedBooking);
        } catch (Exception e) {
            System.err.println("Failed to send WhatsApp notification: " + e.getMessage());
        }

        // Construct QR Code payload content for e-ticket verification
        String qrContent = String.format("Ref:%s|Trip:%d|Seats:%s|Fare:Rs.%s",
                savedBooking.getBookingReference(),
                trip.getId(),
                String.join(",", requestedSeats),
                totalFare.toString()
        );

        BookingResponse response = new BookingResponse(
                savedBooking.getId(),
                savedBooking.getBookingReference(),
                savedBooking.getTotalFare(),
                savedBooking.getBookingStatus(),
                qrContent,
                savedBooking.getBookingDate(),
                requestedSeats,
                savedBooking.getPickupLocation(),
                savedBooking.getPickupTime(),
                savedBooking.getDropLocation(),
                savedBooking.getDropTime()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getBookingHistory(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByUsernameIgnoreCase(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> bookings = bookingRepository.findByUserId(user.getId());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{reference}")
    public ResponseEntity<?> getBookingDetails(@PathVariable String reference) {
        return bookingRepository.findByBookingReference(reference)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/cancel")
    @Transactional
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByUsernameIgnoreCase(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        if ("CANCELLED".equals(booking.getBookingStatus())) {
            return ResponseEntity.badRequest().body("Error: Booking is already cancelled.");
        }

        // Update booking status
        booking.setBookingStatus("CANCELLED");
        if (booking.getPayment() != null) {
            booking.getPayment().setStatus("REFUNDED");
        }

        // Refund fare to wallet
        user.setWalletBalance(user.getWalletBalance().add(booking.getTotalFare()));
        userRepository.save(user);
        bookingRepository.save(booking);

        return ResponseEntity.ok("Booking cancelled and Rs. " + booking.getTotalFare() + " refunded to your wallet!");
    }
}
