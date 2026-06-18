package com.enterprise.bus.controller;

import com.enterprise.bus.model.SupportTicket;
import com.enterprise.bus.model.User;
import com.enterprise.bus.repository.SupportTicketRepository;
import com.enterprise.bus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    @Autowired
    private SupportTicketRepository supportRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<SupportTicket> getAllTickets() {
        return supportRepository.findAll();
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyTickets(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByUsernameIgnoreCase(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(supportRepository.findByUserId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody SupportTicket ticket, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findByUsernameIgnoreCase(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ticket.setUser(user);
        return ResponseEntity.ok(supportRepository.save(ticket));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SupportTicket> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return supportRepository.findById(id)
                .map(ticket -> {
                    ticket.setStatus(status.toUpperCase());
                    return ResponseEntity.ok(supportRepository.save(ticket));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
