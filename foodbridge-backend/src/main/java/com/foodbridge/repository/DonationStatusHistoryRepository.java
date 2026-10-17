package com.foodbridge.repository;

import com.foodbridge.entity.DonationStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonationStatusHistoryRepository extends JpaRepository<DonationStatusHistory, Long> {
    List<DonationStatusHistory> findByDonation_IdOrderByChangedAtAscIdAsc(Long donationId);
}
