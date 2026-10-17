package com.foodbridge.repository;

import com.foodbridge.entity.FoodDonation;
import com.foodbridge.enums.DonationStatus;
import com.foodbridge.enums.DonationRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FoodDonationRepository extends JpaRepository<FoodDonation, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from FoodDonation d where d.id = :id")
    Optional<FoodDonation> findByIdForUpdate(@Param("id") Long id);

    @Query("select d from FoodDonation d where d.status = :status and (upper(d.category) <> 'FOOD' or (d.expiryTime is not null and d.expiryTime > current_timestamp)) and (d.donationRequest is null or (d.donationRequest.ngo.id = :ngoId and d.donationRequest.status = :requestStatus))")
    Page<FoodDonation> findAvailableNotExpired(@Param("status") DonationStatus status, @Param("ngoId") Long ngoId, @Param("requestStatus") DonationRequestStatus requestStatus, Pageable pageable);

    List<FoodDonation> findByDonor_IdOrderByIdDesc(Long donorId);
    List<FoodDonation> findByNgo_IdOrderByIdDesc(Long ngoId);

    @Query("select d from FoodDonation d where ((d.status = com.foodbridge.enums.DonationStatus.ACCEPTED and d.volunteer is null) or (d.volunteer.id = :volunteerId and d.status in :assignedStatuses)) order by d.id desc")
    Page<FoodDonation> findVolunteerQueue(@Param("volunteerId") Long volunteerId,
                                          @Param("assignedStatuses") List<DonationStatus> assignedStatuses,
                                          Pageable pageable);
}
