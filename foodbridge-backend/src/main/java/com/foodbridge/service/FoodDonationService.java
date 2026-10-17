package com.foodbridge.service;

import com.foodbridge.dto.DonationStatusHistoryResponse;
import com.foodbridge.entity.DonationStatusHistory;
import com.foodbridge.entity.DonationRequest;
import com.foodbridge.enums.DonationRequestStatus;
import com.foodbridge.repository.DonationRequestRepository;
import com.foodbridge.entity.FoodDonation;
import com.foodbridge.entity.User;
import com.foodbridge.enums.DonationStatus;
import com.foodbridge.enums.Role;
import com.foodbridge.repository.DonationStatusHistoryRepository;
import com.foodbridge.repository.FoodDonationRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class FoodDonationService {
    private final FoodDonationRepository donationRepository;
    private final DonationStatusHistoryRepository historyRepository;
    private final DonationRequestRepository requestRepository;

    public FoodDonationService(FoodDonationRepository donationRepository,
                               DonationStatusHistoryRepository historyRepository,
                               DonationRequestRepository requestRepository) {
        this.donationRepository = donationRepository;
        this.historyRepository = historyRepository;
        this.requestRepository = requestRepository;
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new AccessDeniedException("Please log in to continue");
        }
        return user;
    }

    private void requireRole(Role expected) {
        if (currentUser().getRole() != expected) throw new AccessDeniedException("This action is not allowed for your role");
    }

    @Transactional
    public FoodDonation createDonation(FoodDonation donation, Long requestId) {
        requireRole(Role.DONOR);
        String category = donation.getCategory() == null ? "OTHER" : donation.getCategory().trim().toUpperCase(Locale.ROOT);
        donation.setCategory(category);
        if (donation.getFoodName() == null || donation.getFoodName().isBlank()) throw new IllegalArgumentException("Donation title is required");
        if (donation.getQuantity() < 1) throw new IllegalArgumentException("Quantity must be at least one");
        if (donation.getPickupAddress() == null || donation.getPickupAddress().isBlank()) throw new IllegalArgumentException("Pickup address is required");
        if ("FOOD".equals(category)) validateFoodExpiry(donation.getExpiryTime());
        donation.setDonor(currentUser());
        if (requestId != null) {
            DonationRequest request = requestRepository.findById(requestId)
                    .orElseThrow(() -> new IllegalArgumentException("Donation request not found"));
            if (request.getStatus() != DonationRequestStatus.OPEN) throw new IllegalArgumentException("This donation request is no longer open");
            if (!request.getCategory().equalsIgnoreCase(category)) throw new IllegalArgumentException("Donation category must match the selected NGO request");
            donation.setDonationRequest(request);
        }
        donation.setStatus(DonationStatus.AVAILABLE);
        FoodDonation saved = donationRepository.saveAndFlush(donation);
        record(saved, DonationStatus.AVAILABLE, "Donation published and available for NGO acceptance", currentUser());
        return saved;
    }

    @Transactional
    public Page<FoodDonation> getAvailableDonations(Pageable pageable) {
        requireRole(Role.NGO);
        return donationRepository.findAvailableNotExpired(DonationStatus.AVAILABLE, currentUser().getId(), DonationRequestStatus.OPEN, pageable);
    }

    @Transactional
    public FoodDonation acceptsDonation(Long donationId) {
        requireRole(Role.NGO);
        User ngo = currentUser();
        FoodDonation donation = findDonationForUpdate(donationId);
        ensureNotExpired(donation);
        if (donation.getStatus() != DonationStatus.AVAILABLE) throw new IllegalArgumentException("Donation is no longer available");
        if (donation.getDonationRequest() != null) {
            DonationRequest request = requestRepository.findById(donation.getDonationRequest().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Linked NGO request no longer exists"));
            if (!request.getNgo().getId().equals(ngo.getId())) throw new AccessDeniedException("Only the NGO that created this request can accept the donation");
            if (request.getStatus() != DonationRequestStatus.OPEN) throw new IllegalArgumentException("The linked NGO request is no longer open");
            request.setStatus(DonationRequestStatus.IN_PROGRESS);
            requestRepository.save(request);
        }
        donation.setNgo(ngo);
        donation.setStatus(DonationStatus.ACCEPTED);
        FoodDonation saved = donationRepository.saveAndFlush(donation);
        record(saved, DonationStatus.ACCEPTED, "Accepted by NGO " + safeName(ngo), ngo);
        return saved;
    }

    @Transactional
    public Page<FoodDonation> getAcceptedDonation(Pageable pageable) {
        requireRole(Role.VOLUNTEER);
        return donationRepository.findVolunteerQueue(currentUser().getId(),
                List.of(DonationStatus.ASSIGNED, DonationStatus.PICKED_UP, DonationStatus.DELIVERED), pageable);
    }

    @Transactional
    public FoodDonation assignDonation(Long id) {
        requireRole(Role.VOLUNTEER);
        User volunteer = currentUser();
        FoodDonation donation = findDonationForUpdate(id);
        ensureNotExpired(donation);
        if (donation.getStatus() != DonationStatus.ACCEPTED || donation.getVolunteer() != null) {
            throw new IllegalArgumentException("This donation has already been assigned or is not ready for assignment");
        }
        donation.setVolunteer(volunteer);
        donation.setStatus(DonationStatus.ASSIGNED);
        FoodDonation saved = donationRepository.saveAndFlush(donation);
        record(saved, DonationStatus.ASSIGNED, "Volunteer " + safeName(volunteer) + " accepted the assignment", volunteer);
        return saved;
    }

    @Transactional
    public FoodDonation pickUpDonation(Long id) {
        requireRole(Role.VOLUNTEER);
        User volunteer = currentUser();
        FoodDonation donation = findDonationForUpdate(id);
        ensureNotExpired(donation);
        if (donation.getStatus() != DonationStatus.ASSIGNED || donation.getVolunteer() == null
                || !donation.getVolunteer().getId().equals(volunteer.getId())) {
            throw new AccessDeniedException("Only the assigned volunteer can pick up this donation");
        }
        donation.setStatus(DonationStatus.PICKED_UP);
        FoodDonation saved = donationRepository.saveAndFlush(donation);
        record(saved, DonationStatus.PICKED_UP, "Donation picked up by assigned volunteer", volunteer);
        return saved;
    }

    @Transactional
    public FoodDonation deliverDonation(Long id) {
        requireRole(Role.VOLUNTEER);
        User volunteer = currentUser();
        FoodDonation donation = findDonationForUpdate(id);
        ensureNotExpired(donation);
        if (donation.getStatus() != DonationStatus.PICKED_UP || donation.getVolunteer() == null
                || !donation.getVolunteer().getId().equals(volunteer.getId())) {
            throw new AccessDeniedException("Only the assigned volunteer can deliver a picked-up donation");
        }
        donation.setStatus(DonationStatus.DELIVERED);
        if (donation.getDonationRequest() != null) {
            requestRepository.findById(donation.getDonationRequest().getId()).ifPresent(request -> {
                request.setStatus(DonationRequestStatus.FULFILLED);
                requestRepository.save(request);
            });
        }
        FoodDonation saved = donationRepository.saveAndFlush(donation);
        record(saved, DonationStatus.DELIVERED, "Donation delivered successfully", volunteer);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<FoodDonation> getMyDonations() {
        User user = currentUser();
        return switch (user.getRole()) {
            case DONOR -> donationRepository.findByDonor_IdOrderByIdDesc(user.getId());
            case NGO -> donationRepository.findByNgo_IdOrderByIdDesc(user.getId());
            case VOLUNTEER -> donationRepository.findVolunteerQueue(user.getId(),
                    List.of(DonationStatus.ASSIGNED, DonationStatus.PICKED_UP, DonationStatus.DELIVERED),
                    Pageable.unpaged()).getContent();
            case ADMIN -> donationRepository.findAll();
        };
    }

    @Transactional
    public List<DonationStatusHistoryResponse> getDonationHistory(Long donationId) {
        User user = currentUser();
        FoodDonation donation = findDonation(donationId);
        boolean allowed = user.getRole() == Role.ADMIN
                || (donation.getDonor() != null && donation.getDonor().getId().equals(user.getId()))
                || (donation.getNgo() != null && donation.getNgo().getId().equals(user.getId()))
                || (donation.getVolunteer() != null && donation.getVolunteer().getId().equals(user.getId()));
        if (!allowed) throw new AccessDeniedException("You cannot view this donation's tracking history");
        List<DonationStatusHistory> history = historyRepository.findByDonation_IdOrderByChangedAtAscIdAsc(donationId);
        if (history.isEmpty()) {
            // Legacy donations predate history tracking. Record the current state without inventing past events.
            DonationStatusHistory initial = new DonationStatusHistory();
            initial.setDonation(donation);
            initial.setStatus(donation.getStatus());
            initial.setChangedBy(null);
            initial.setChangedAt(LocalDateTime.now());
            initial.setNote("Tracking started for an existing donation. Earlier status changes were not recorded.");
            historyRepository.saveAndFlush(initial);
            history = historyRepository.findByDonation_IdOrderByChangedAtAscIdAsc(donationId);
        }
        return history.stream().map(DonationStatusHistoryResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<FoodDonation> getAllDonations() {
        if (currentUser().getRole() != Role.ADMIN) throw new AccessDeniedException("Only administrators can view all donations");
        return donationRepository.findAll();
    }

    private FoodDonation findDonation(Long id) {
        return donationRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Donation not found"));
    }

    private FoodDonation findDonationForUpdate(Long id) {
        return donationRepository.findByIdForUpdate(id).orElseThrow(() -> new IllegalArgumentException("Donation not found"));
    }

    private void ensureNotExpired(FoodDonation donation) {
        if ("FOOD".equalsIgnoreCase(donation.getCategory())) {
            validateFoodExpiry(donation.getExpiryTime());
        }
    }

    private void validateFoodExpiry(Timestamp expiryTime) {
        if (expiryTime == null) throw new IllegalArgumentException("Food donations must include an expiry date");
        if (!expiryTime.toLocalDateTime().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("This food donation has expired and cannot be accepted, assigned, picked up, or delivered");
        }
    }

    private void record(FoodDonation donation, DonationStatus status, String note, User actor) {
        DonationStatusHistory history = new DonationStatusHistory();
        history.setDonation(donation);
        history.setStatus(status);
        history.setNote(note);
        history.setChangedBy(actor);
        history.setChangedAt(LocalDateTime.now());
        historyRepository.save(history);
    }

    private String safeName(User user) {
        return user.getFullName() == null || user.getFullName().isBlank() ? user.getEmail() : user.getFullName();
    }
}
