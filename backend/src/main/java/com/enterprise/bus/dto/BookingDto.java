package com.enterprise.bus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class BookingDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerDto {
        private String seatNumber;
        private String passengerName;
        private Integer age;
        private String gender;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingRequest {
        private Long tripId;
        private List<PassengerDto> passengers;
        private String paymentMethod; // RAZORPAY_UPI, RAZORPAY_CARD, WALLET, AGENT_CASH
        private String transactionId; // If paid via gateway
        private String pickupLocation;
        private String pickupTime;
        private String dropLocation;
        private String dropTime;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingResponse {
        private Long bookingId;
        private String bookingReference;
        private BigDecimal totalFare;
        private String status;
        private String qrCodeData;
        private LocalDateTime bookingDate;
        private List<String> seatNumbers;
        private String pickupLocation;
        private String pickupTime;
        private String dropLocation;
        private String dropTime;
    }
}
