package com.enterprise.bus.controller;

import com.enterprise.bus.model.Bus;
import com.enterprise.bus.repository.BusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/buses")
public class BusController {

    @Autowired
    private BusRepository busRepository;

    @GetMapping
    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bus> getBusById(@PathVariable Long id) {
        return busRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createBus(@RequestBody Bus bus) {
        if (busRepository.existsByBusNumber(bus.getBusNumber())) {
            return ResponseEntity.badRequest().body("Error: Bus number already exists!");
        }
        return ResponseEntity.ok(busRepository.save(bus));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBus(@PathVariable Long id, @RequestBody Bus busDetails) {
        return busRepository.findById(id)
                .map(bus -> {
                    bus.setBusNumber(busDetails.getBusNumber());
                    bus.setBusType(busDetails.getBusType());
                    bus.setCapacity(busDetails.getCapacity());
                    bus.setAmenities(busDetails.getAmenities());
                    bus.setStatus(busDetails.getStatus());
                    if (busDetails.getSeatLayoutJson() != null) {
                        bus.setSeatLayoutJson(busDetails.getSeatLayoutJson());
                    }
                    return ResponseEntity.ok(busRepository.save(bus));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBus(@PathVariable Long id) {
        return busRepository.findById(id)
                .map(bus -> {
                    busRepository.delete(bus);
                    return ResponseEntity.ok("Bus deleted successfully!");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
