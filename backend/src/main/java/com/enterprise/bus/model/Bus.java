package com.enterprise.bus.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "buses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bus_number", nullable = false, unique = true, length = 20)
    private String busNumber;

    @Column(name = "bus_type", nullable = false, length = 50)
    private String busType; // e.g. AC_SLEEPER, AC_SEATER, VOLVO_CLASSIC, SEMI_SLEEPER

    @Column(nullable = false)
    private Integer capacity;

    @Column(columnDefinition = "TEXT")
    private String amenities; // Wi-Fi, Water, charging, etc.

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, MAINTENANCE, IN_SERVICE

    @Column(name = "seat_layout_json", columnDefinition = "TEXT")
    private String seatLayoutJson; // Serialized seat position matrix

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
