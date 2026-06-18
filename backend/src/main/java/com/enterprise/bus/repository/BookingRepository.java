package com.enterprise.bus.repository;

import com.enterprise.bus.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    Optional<Booking> findByBookingReference(String bookingReference);
    List<Booking> findByTripId(Long tripId);
}
