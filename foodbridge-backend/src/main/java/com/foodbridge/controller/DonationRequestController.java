package com.foodbridge.controller;

import com.foodbridge.entity.DonationRequest;
import com.foodbridge.service.DonationRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/donation-requests")
public class DonationRequestController {
    private final DonationRequestService service;
    public DonationRequestController(DonationRequestService service) { this.service = service; }

    @GetMapping("/open")
    @PreAuthorize("hasAuthority('DONOR')")
    public ResponseEntity<List<DonationRequest>> getOpenRequests() { return ResponseEntity.ok(service.getOpenRequests()); }

    @GetMapping("/mine")
    @PreAuthorize("hasAuthority('NGO')")
    public ResponseEntity<List<DonationRequest>> getMyRequests() { return ResponseEntity.ok(service.getMyRequests()); }

    @PostMapping
    @PreAuthorize("hasAuthority('NGO')")
    public ResponseEntity<DonationRequest> createRequest(@RequestBody CreateDonationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createRequest(request.title(), request.category(), request.quantity(), request.description()));
    }

    public record CreateDonationRequest(String title, String category, Integer quantity, String description) {}
}
