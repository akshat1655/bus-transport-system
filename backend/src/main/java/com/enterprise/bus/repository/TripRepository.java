package com.enterprise.bus.repository;

import com.enterprise.bus.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    
    @Query("SELECT t FROM Trip t WHERE t.route.source = :source AND t.route.destination = :destination AND t.departureTime BETWEEN :start AND :end AND t.tripStatus <> 'CANCELLED'")
    List<Trip> searchTrips(
        @Param("source") String source, 
        @Param("destination") String destination, 
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );

    List<Trip> findByDriverId(Long driverId);
    List<Trip> findByBusId(Long busId);
}
