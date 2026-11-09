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
    
    @Query("SELECT t FROM Trip t WHERE " +
           "(LOWER(TRIM(t.route.source)) = LOWER(TRIM(:source)) OR EXISTS (SELECT s1 FROM Stop s1 WHERE s1.route = t.route AND LOWER(TRIM(s1.stopName)) = LOWER(TRIM(:source)))) AND " +
           "(LOWER(TRIM(t.route.destination)) = LOWER(TRIM(:destination)) OR EXISTS (SELECT s2 FROM Stop s2 WHERE s2.route = t.route AND LOWER(TRIM(s2.stopName)) = LOWER(TRIM(:destination)))) AND " +
           "t.departureTime BETWEEN :start AND :end AND t.tripStatus <> 'CANCELLED'")
    List<Trip> searchTrips(
        @Param("source") String source, 
        @Param("destination") String destination, 
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );

    List<Trip> findByDriverId(Long driverId);
    List<Trip> findByBusId(Long busId);
}
