package com.foodbridge.controller;

import com.foodbridge.dto.DonationStatusHistoryResponse;
import com.foodbridge.entity.FoodDonation;
import com.foodbridge.service.FileStorageService;
import com.foodbridge.service.FoodDonationService;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.List;

@RestController
@RequestMapping("/donations")
public class FoodDonationController {
    private final FoodDonationService donationService;
    private final FileStorageService fileStorageService;

    public FoodDonationController(FoodDonationService donationService, FileStorageService fileStorageService) {
        this.donationService = donationService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('DONOR')")
    public ResponseEntity<FoodDonation> createDonation(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String foodName,
            @RequestParam(defaultValue = "OTHER") String category,
            @RequestParam Integer quantity,
            @RequestParam String pickupAddress,
            @RequestParam(required = false) String expiryTime,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String itemCondition,
            @RequestParam(required = false) Long requestId,
            @RequestParam(required = false) MultipartFile image) throws IOException {
        String donationTitle = title != null && !title.isBlank() ? title : foodName;
        if (donationTitle == null || donationTitle.isBlank()) throw new IllegalArgumentException("Donation title is required");
        if (quantity == null || quantity < 1) throw new IllegalArgumentException("Quantity must be at least one");
        if (pickupAddress == null || pickupAddress.isBlank()) throw new IllegalArgumentException("Pickup address is required");

        FoodDonation donation = new FoodDonation();
        donation.setFoodName(donationTitle.trim());
        donation.setCategory(category == null ? "OTHER" : category.trim().toUpperCase());
        donation.setQuantity(quantity);
        donation.setPickupAddress(pickupAddress.trim());
        donation.setDescription(description);
        donation.setItemCondition(itemCondition);
        if (expiryTime != null && !expiryTime.isBlank()) {
            try {
                donation.setExpiryTime(Timestamp.valueOf(expiryTime.trim().replace('T', ' ')));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid expiry date/time. Please choose a valid expiry date.");
            }
        }
        if (image != null && !image.isEmpty()) {
            if (image.getSize() > 5 * 1024 * 1024) throw new IllegalArgumentException("Image must be 5 MB or smaller");
            String contentType = image.getContentType();
            if (contentType == null || !java.util.Set.of("image/jpeg", "image/png", "image/webp", "image/gif").contains(contentType.toLowerCase())) throw new IllegalArgumentException("Only JPEG, PNG, WEBP, or GIF images are allowed");
            donation.setImageUrl(fileStorageService.saveFile(image));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(donationService.createDonation(donation, requestId));
    }

    @GetMapping("/available")
    @PreAuthorize("hasAuthority('NGO')")
    public ResponseEntity<Page<FoodDonation>> getAvailableDonations(@ParameterObject Pageable pageable) {
        return ResponseEntity.ok(donationService.getAvailableDonations(pageable));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasAuthority('NGO')")
    public ResponseEntity<FoodDonation> acceptDonation(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.acceptsDonation(id));
    }

    @GetMapping("/accepted")
    @PreAuthorize("hasAuthority('VOLUNTEER')")
    public ResponseEntity<Page<FoodDonation>> getAcceptedDonation(@ParameterObject Pageable pageable) {
        return ResponseEntity.ok(donationService.getAcceptedDonation(pageable));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAuthority('VOLUNTEER')")
    public ResponseEntity<FoodDonation> assignDonation(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.assignDonation(id));
    }

    @PutMapping("/{id}/pickup")
    @PreAuthorize("hasAuthority('VOLUNTEER')")
    public ResponseEntity<FoodDonation> pickUpDonation(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.pickUpDonation(id));
    }

    @PutMapping("/{id}/deliver")
    @PreAuthorize("hasAuthority('VOLUNTEER')")
    public ResponseEntity<FoodDonation> deliverDonation(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.deliverDonation(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<DonationStatusHistoryResponse>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.getDonationHistory(id));
    }

    @GetMapping("/my-donations")
    public ResponseEntity<List<FoodDonation>> getMyDonations() {
        return ResponseEntity.ok(donationService.getMyDonations());
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<FoodDonation>> getAllDonations() {
        return ResponseEntity.ok(donationService.getAllDonations());
    }
}
