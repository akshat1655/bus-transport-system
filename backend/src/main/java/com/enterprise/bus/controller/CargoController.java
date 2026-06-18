package com.enterprise.bus.controller;

import com.enterprise.bus.model.CargoParcel;
import com.enterprise.bus.model.Route;
import com.enterprise.bus.repository.CargoParcelRepository;
import com.enterprise.bus.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cargo")
public class CargoController {

    @Autowired
    private CargoParcelRepository cargoRepository;

    @Autowired
    private RouteRepository routeRepository;

    @GetMapping
    public List<CargoParcel> getAllParcels() {
        return cargoRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> bookParcel(@RequestBody CargoParcel parcel) {
        Route route = routeRepository.findById(parcel.getRoute().getId()).orElse(null);
        if (route == null) {
            return ResponseEntity.badRequest().body("Error: Selected route is invalid!");
        }

        // Calculate Pricing: Base of Rs 150 + Rs 25 per kg
        double weight = parcel.getWeightKg();
        BigDecimal price = BigDecimal.valueOf(150 + (weight * 25));
        parcel.setPrice(price);

        // Generate unique tracking barcode
        String barcode = "CRG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        parcel.setBarcode(barcode);
        parcel.setRoute(route);

        return ResponseEntity.ok(cargoRepository.save(parcel));
    }

    @GetMapping("/track/{barcode}")
    public ResponseEntity<CargoParcel> trackParcel(@PathVariable String barcode) {
        return cargoRepository.findByBarcode(barcode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CargoParcel> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return cargoRepository.findById(id)
                .map(parcel -> {
                    parcel.setStatus(status.toUpperCase());
                    return ResponseEntity.ok(cargoRepository.save(parcel));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
