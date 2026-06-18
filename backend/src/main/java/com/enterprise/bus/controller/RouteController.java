package com.enterprise.bus.controller;

import com.enterprise.bus.model.*;
import com.enterprise.bus.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @GetMapping
    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Route> getRouteById(@PathVariable Long id) {
        return routeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Route createRoute(@RequestBody Route route) {
        if (route.getStops() != null) {
            for (Stop stop : route.getStops()) {
                stop.setRoute(route);
            }
        }
        Route savedRoute = routeRepository.save(route);

        // Fetch default bus and driver for auto-generating trips
        Bus defaultBus = busRepository.findAll().stream()
                .filter(b -> "ACTIVE".equalsIgnoreCase(b.getStatus()))
                .findFirst()
                .orElse(busRepository.findAll().stream().findFirst().orElse(null));

        User defaultDriver = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.DRIVER)
                .findFirst()
                .orElse(null);

        double farePerKm = 2.5;
        double calculatedFare = (savedRoute.getDistanceKm() != null && savedRoute.getDistanceKm() > 0)
                ? savedRoute.getDistanceKm() * farePerKm
                : 500.00;

        int durationMins = (savedRoute.getDurationMinutes() != null && savedRoute.getDurationMinutes() > 0)
                ? savedRoute.getDurationMinutes()
                : 360;

        // Auto schedule trips for the next 30 days (starting tomorrow)
        for (int i = 1; i <= 30; i++) {
            LocalDateTime departure = LocalDate.now().plusDays(i).atTime(21, 0); // Default departure at 9:00 PM
            LocalDateTime arrival = departure.plusMinutes(durationMins);

            Trip trip = new Trip();
            trip.setBus(defaultBus);
            trip.setRoute(savedRoute);
            trip.setDriver(defaultDriver);
            trip.setDepartureTime(departure);
            trip.setArrivalTime(arrival);
            trip.setBaseFare(java.math.BigDecimal.valueOf(calculatedFare));
            trip.setTripStatus("SCHEDULED");
            trip.setRecurringDays("MON,TUE,WED,THU,FRI,SAT,SUN");

            tripRepository.save(trip);
        }

        return savedRoute;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Route> updateRoute(@PathVariable Long id, @RequestBody Route routeDetails) {
        return routeRepository.findById(id)
                .map(route -> {
                    route.setSource(routeDetails.getSource());
                    route.setDestination(routeDetails.getDestination());
                    route.setDistanceKm(routeDetails.getDistanceKm());
                    route.setDurationMinutes(routeDetails.getDurationMinutes());
                    route.setActive(routeDetails.getActive());
                    
                    // Update stops
                    route.getStops().clear();
                    if (routeDetails.getStops() != null) {
                        for (Stop stopDetails : routeDetails.getStops()) {
                            stopDetails.setRoute(route);
                            route.getStops().add(stopDetails);
                        }
                    }
                    return ResponseEntity.ok(routeRepository.save(route));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoute(@PathVariable Long id) {
        return routeRepository.findById(id)
                .map(route -> {
                    routeRepository.delete(route);
                    return ResponseEntity.ok("Route deleted successfully!");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
