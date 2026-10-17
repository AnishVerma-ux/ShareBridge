package com.foodbridge.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Image file is empty");
        if (file.getSize() > 5 * 1024 * 1024) throw new IllegalArgumentException("Image must be 5 MB or smaller");
        String contentType = file.getContentType();
        String extension = switch (contentType == null ? "" : contentType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> throw new IllegalArgumentException("Only JPEG, PNG, WEBP, or GIF images are allowed");
        };
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        String uniqueFileName = UUID.randomUUID() + extension;
        Path filePath = uploadPath.resolve(uniqueFileName).normalize();
        if (!filePath.startsWith(uploadPath)) throw new IllegalArgumentException("Invalid upload path");
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return uniqueFileName;
    }
}
