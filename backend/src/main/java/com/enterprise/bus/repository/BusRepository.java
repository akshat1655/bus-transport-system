package com.enterprise.bus.repository;

import com.enterprise.bus.model.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {
    List<Bus> findByStatus(String status);
    boolean existsByBusNumber(String busNumber);
}
