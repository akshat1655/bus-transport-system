package com.enterprise.bus.repository;

import com.enterprise.bus.model.CargoParcel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CargoParcelRepository extends JpaRepository<CargoParcel, Long> {
    Optional<CargoParcel> findByBarcode(String barcode);
    List<CargoParcel> findBySenderPhone(String senderPhone);
    List<CargoParcel> findByStatus(String status);
}
