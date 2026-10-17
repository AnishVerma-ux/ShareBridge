package com.foodbridge.repository;

import com.foodbridge.entity.DonationRequest;
import com.foodbridge.enums.DonationRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonationRequestRepository extends JpaRepository<DonationRequest, Long> {
    List<DonationRequest> findByStatusOrderByCreatedAtDesc(DonationRequestStatus status);
    List<DonationRequest> findByNgo_IdOrderByCreatedAtDesc(Long ngoId);
}
