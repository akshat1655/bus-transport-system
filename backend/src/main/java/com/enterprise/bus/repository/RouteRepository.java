package com.enterprise.bus.repository;

import com.enterprise.bus.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByActiveTrue();
    List<Route> findBySourceContainingAndDestinationContaining(String source, String destination);
}
