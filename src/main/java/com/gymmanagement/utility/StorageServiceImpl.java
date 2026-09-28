package com.gymmanagement.utility;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class StorageServiceImpl implements StorageService {
	private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
	
	@Value("${disk.upload.basepath}")
	private String BASEPATH;

	
	@Override
	public List<String> loadAll() {
		File dirPath = new File(BASEPATH);
		String[] names = dirPath.list();
		return names == null ? java.util.Collections.emptyList() : Arrays.asList(names);
	}

	@Override
	public String store(MultipartFile file) {
		if (file == null || file.isEmpty() || file.getSize() > MAX_IMAGE_BYTES) {
			throw new IllegalArgumentException("Image must be between 1 byte and 5 MB");
		}
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
		} catch (IOException ex) {
			throw new IllegalArgumentException("Invalid image", ex);
		}
		String fileName = UUID.randomUUID().toString().replace("-", "") + extension;
		try {
			Path directory = Paths.get(BASEPATH).toAbsolutePath().normalize();
			Files.createDirectories(directory);
			Files.copy(file.getInputStream(), directory.resolve(fileName));
			return fileName;
		} catch (IOException ex) {
			throw new IllegalStateException("Could not store image", ex);
		}
	}

	@Override
	public Resource load(String fileName) {
		Path filePath = safeImagePath(fileName);
		if(Files.isRegularFile(filePath, LinkOption.NOFOLLOW_LINKS))
			return new FileSystemResource(filePath);
		return null;
	}

	@Override
	public void delete(String fileName) {
		try {
			Files.deleteIfExists(safeImagePath(fileName));
		} catch (IOException ex) {
			throw new IllegalStateException("Could not delete image", ex);
		}
	}

	private Path safeImagePath(String fileName) {
		if (fileName == null || !fileName.matches("(?i)[a-z0-9_-]{1,128}\\.(png|jpe?g|gif|webp)")) {
			throw new IllegalArgumentException("Invalid image name");
		}
		Path directory = Paths.get(BASEPATH).toAbsolutePath().normalize();
		Path path = directory.resolve(fileName).normalize();
		if (!path.startsWith(directory)) throw new IllegalArgumentException("Invalid image path");
		return path;
	}

}
