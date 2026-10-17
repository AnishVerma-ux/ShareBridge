package com.foodbridge.service;

import com.foodbridge.entity.DonationRequest;
import com.foodbridge.entity.User;
import com.foodbridge.enums.DonationRequestStatus;
import com.foodbridge.enums.Role;
import com.foodbridge.repository.DonationRequestRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Locale;

@Service
public class DonationRequestService {
    private final DonationRequestRepository repository;
    public DonationRequestService(DonationRequestRepository repository) { this.repository = repository; }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) throw new AccessDeniedException("Please log in");
        return user;
    }

    @Transactional(readOnly = true)
    public List<DonationRequest> getOpenRequests() {
        if (currentUser().getRole() != Role.DONOR) throw new AccessDeniedException("Only donors can browse open donation requests");
        return repository.findByStatusOrderByCreatedAtDesc(DonationRequestStatus.OPEN);
    }

    @Transactional(readOnly = true)
    public List<DonationRequest> getMyRequests() {
        User user = currentUser();
        if (user.getRole() != Role.NGO) throw new AccessDeniedException("Only NGOs can view their requests");
        return repository.findByNgo_IdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional
    public DonationRequest createRequest(String title, String category, Integer quantity, String description) {
        User ngo = currentUser();
        if (ngo.getRole() != Role.NGO) throw new AccessDeniedException("Only NGOs can create donation requests");
        if (title == null || title.isBlank()) throw new IllegalArgumentException("Request title is required");
        if (category == null || category.isBlank()) throw new IllegalArgumentException("Category is required");
        if (quantity == null || quantity < 1) throw new IllegalArgumentException("Quantity must be at least one");
        DonationRequest request = new DonationRequest();
        request.setNgo(ngo);
        request.setTitle(title.trim());
        request.setCategory(category.trim().toUpperCase(Locale.ROOT));
        request.setQuantity(quantity);
        request.setDescription(description == null ? "" : description.trim());
        request.setStatus(DonationRequestStatus.OPEN);
        return repository.save(request);
    }
}
