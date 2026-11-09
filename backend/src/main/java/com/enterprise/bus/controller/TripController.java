package com.enterprise.bus.controller;

import com.enterprise.bus.model.*;
import com.enterprise.bus.repository.BookingRepository;
import com.enterprise.bus.repository.PassengerRepository;
import com.enterprise.bus.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping
    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTripById(@PathVariable Long id) {
        return tripRepository.findById(id)
                .map(trip -> {
                    // Fetch booked seats
                    List<Booking> bookings = bookingRepository.findByTripId(id);
                    List<String> bookedSeats = bookings.stream()
                            .filter(b -> "CONFIRMED".equals(b.getBookingStatus()))
                            .flatMap(b -> b.getPassengers().stream())
                            .map(Passenger::getSeatNumber)
                            .collect(Collectors.toList());

                    Map<String, String> seatBookings = bookings.stream()
                            .filter(b -> "CONFIRMED".equals(b.getBookingStatus()))
                            .flatMap(b -> b.getPassengers().stream())
                            .collect(Collectors.toMap(
                                    Passenger::getSeatNumber,
                                    p -> p.getGender() != null ? p.getGender() : "MALE",
                                    (g1, g2) -> g1
                            ));

                    Map<String, Object> response = new HashMap<>();
                    response.put("trip", trip);
                    response.put("bookedSeats", bookedSeats);
                    response.put("seatBookings", seatBookings);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchTrips(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        String cleanSource = source != null ? source.trim() : "";
        String cleanDest = destination != null ? destination.trim() : "";

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Trip> trips = tripRepository.searchTrips(cleanSource, cleanDest, startOfDay, endOfDay);
        List<Map<String, Object>> response = trips.stream().map(trip -> {
            List<Booking> bookings = bookingRepository.findByTripId(trip.getId());
            List<String> bookedSeats = bookings.stream()
                    .filter(b -> "CONFIRMED".equals(b.getBookingStatus()))
                    .flatMap(b -> b.getPassengers().stream())
                    .map(Passenger::getSeatNumber)
                    .collect(Collectors.toList());

            Map<String, String> seatBookings = bookings.stream()
                    .filter(b -> "CONFIRMED".equals(b.getBookingStatus()))
                    .flatMap(b -> b.getPassengers().stream())
                    .collect(Collectors.toMap(
                            Passenger::getSeatNumber,
                            p -> p.getGender() != null ? p.getGender() : "MALE",
                            (g1, g2) -> g1
                    ));

            Map<String, Object> map = new HashMap<>();
            map.put("id", trip.getId());
            map.put("bus", trip.getBus());
            map.put("route", trip.getRoute());
            map.put("departureTime", trip.getDepartureTime());
            map.put("arrivalTime", trip.getArrivalTime());
            map.put("baseFare", trip.getBaseFare());
            map.put("tripStatus", trip.getTripStatus());
            map.put("bookedSeats", bookedSeats);
            map.put("seatBookings", seatBookings);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public Trip createTrip(@RequestBody Trip trip) {
        return tripRepository.save(trip);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(@PathVariable Long id, @RequestBody Trip tripDetails) {
        return tripRepository.findById(id)
                .map(trip -> {
                    trip.setBus(tripDetails.getBus());
                    trip.setRoute(tripDetails.getRoute());
                    trip.setDriver(tripDetails.getDriver());
                    trip.setDepartureTime(tripDetails.getDepartureTime());
                    trip.setArrivalTime(tripDetails.getArrivalTime());
                    trip.setBaseFare(tripDetails.getBaseFare());
                    trip.setTripStatus(tripDetails.getTripStatus());
                    trip.setRecurringDays(tripDetails.getRecurringDays());
                    return ResponseEntity.ok(tripRepository.save(trip));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long id) {
        return tripRepository.findById(id)
                .map(trip -> {
                    tripRepository.delete(trip);
                    return ResponseEntity.ok("Trip deleted successfully!");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // GPS coordinate mock generator for active/running buses
    @GetMapping("/live-coordinates/{id}")
    public ResponseEntity<?> getLiveCoordinates(@PathVariable Long id) {
        return tripRepository.findById(id)
                .map(trip -> {
                    // Generate pseudo-coordinates along a simulated line
                    double progress = Math.sin(System.currentTimeMillis() / 20000.0) * 0.5 + 0.5; // oscillate 0-1
                    
                    // Simple mock routing path (e.g. Bangalore to Mumbai approximate path)
                    double startLat = 12.9716;
                    double startLng = 77.5946;
                    double endLat = 19.0760;
                    double endLng = 72.8777;

                    if (trip.getRoute().getSource().toLowerCase().contains("delhi")) {
                        startLat = 28.7041;
                        startLng = 77.1025;
                        endLat = 26.9124;
                        endLng = 75.7873; // Jaipur
                    } else if (trip.getRoute().getSource().toLowerCase().contains("mumbai")) {
                        startLat = 19.0760;
                        startLng = 72.8777;
                        endLat = 18.5204;
                        endLng = 73.8567; // Pune
                    }

                    double currentLat = startLat + (endLat - startLat) * progress;
                    double currentLng = startLng + (endLng - startLng) * progress;
                    
                    // Speed mock
                    double speed = 65.0 + Math.random() * 10;
                    
                    Map<String, Object> coords = new HashMap<>();
                    coords.put("tripId", id);
                    coords.put("latitude", currentLat);
                    coords.put("longitude", currentLng);
                    coords.put("speedKmh", speed);
                    coords.put("etaMinutes", (int)((1 - progress) * trip.getRoute().getDurationMinutes()));
                    coords.put("status", trip.getTripStatus());

                    return ResponseEntity.ok(coords);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
