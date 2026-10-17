package com.foodbridge.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.foodbridge.enums.DonationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.sql.Timestamp;

@Entity
@Data
public class FoodDonation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donor_id", nullable = false)
    @JsonIgnoreProperties({"password", "authorities", "hibernateLazyInitializer", "handler"})
    private User donor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ngo_id")
    @JsonIgnoreProperties({"password", "authorities", "hibernateLazyInitializer", "handler"})
    private User ngo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "volunteer_id")
    @JsonIgnoreProperties({"password", "authorities", "hibernateLazyInitializer", "handler"})
    private User volunteer;

    // Kept as foodName for compatibility with the existing React UI.
    @NotBlank(message = "Donation title is required")
    private String foodName;
    @Column(nullable = false, length = 40)
    private String category;
    @Column(length = 1500)
    private String description;
    private String itemCondition;
    @Min(value = 1, message = "Quantity must be at least one")
    private int quantity;
    @NotBlank(message = "Pickup address is required")
    @Column(length = 1000)
    private String pickupAddress;
    private Timestamp expiryTime;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DonationStatus status;
    private String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donation_request_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private DonationRequest donationRequest;

}
