package com.aurafitness.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Iterator;
import java.util.Locale;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;

    private final Path fileStorageLocation;

    public FileUploadService() {
        this.fileStorageLocation = Paths.get("data", "uploads")
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > MAX_IMAGE_BYTES) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Image must be between 1 byte and 5 MB");
        }
        try {
            String extension;
            try (ImageInputStream image = ImageIO.createImageInputStream(file.getInputStream())) {
                if (image == null) throw new IllegalArgumentException("Invalid image");
                Iterator<ImageReader> readers = ImageIO.getImageReaders(image);
                if (!readers.hasNext()) throw new IllegalArgumentException("Invalid image");
                ImageReader reader = readers.next();
                try {
                    reader.setInput(image);
                    String format = reader.getFormatName().toLowerCase(Locale.ROOT);
                    if (!"jpeg".equals(format) && !"png".equals(format)) {
                        throw new IllegalArgumentException("Only JPEG and PNG images are allowed");
                    }
                    if (reader.getWidth(0) > 4096 || reader.getHeight(0) > 4096) {
                        throw new IllegalArgumentException("Image dimensions exceed 4096 pixels");
                    }
                    extension = "jpeg".equals(format) ? ".jpg" : ".png";
                } finally {
                    reader.dispose();
                }
            }
            String fileName = UUID.randomUUID().toString() + extension;
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation);

            return fileName;
        } catch (IllegalArgumentException ex) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        } catch (IOException ex) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid image", ex);
        }
    }
}
