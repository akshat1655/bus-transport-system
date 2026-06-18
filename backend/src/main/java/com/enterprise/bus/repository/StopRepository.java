package com.enterprise.bus.repository;

import com.enterprise.bus.model.Stop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StopRepository extends JpaRepository<Stop, Long> {
    List<Stop> findByRouteIdOrderByStopSequenceAsc(Long routeId);
}
