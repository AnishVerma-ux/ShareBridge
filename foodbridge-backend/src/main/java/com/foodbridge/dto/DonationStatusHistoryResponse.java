package com.foodbridge.dto;

import com.foodbridge.entity.DonationStatusHistory;
import com.foodbridge.enums.DonationStatus;
import java.time.LocalDateTime;

public record DonationStatusHistoryResponse(
        Long id,
        DonationStatus status,
        String note,
        String changedByName,
        String changedByRole,
        LocalDateTime changedAt
) {
    public static DonationStatusHistoryResponse from(DonationStatusHistory history) {
        return new DonationStatusHistoryResponse(
                history.getId(),
                history.getStatus(),
                history.getNote(),
                history.getChangedBy() == null ? "System" : history.getChangedBy().getFullName(),
                history.getChangedBy() == null || history.getChangedBy().getRole() == null ? "SYSTEM" : history.getChangedBy().getRole().name(),
                history.getChangedAt()
        );
    }
}
