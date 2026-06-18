package com.enterprise.bus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

public class ReportDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardMetrics {
        private Long totalBookings;
        private BigDecimal totalRevenue;
        private Double seatOccupancyRate;
        private Long activeBuses;
        private List<MonthlyRevenue> monthlyRevenueData;
        private List<BookingDistribution> bookingDistributionData;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month;
        private BigDecimal revenue;
        private Long bookings;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingDistribution {
        private String category; // e.g. AC vs Non-AC, Sleeper vs Seater
        private Long count;
    }
}
