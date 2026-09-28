package com.gymmanagement.utility;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import java.nio.file.Path;

class StorageServiceImplTest {
    @TempDir Path directory;

    @Test
    void storesOnlyValidatedImageAndRejectsTraversal() throws Exception {
        StorageServiceImpl storage = new StorageServiceImpl();
        ReflectionTestUtils.setField(storage, "BASEPATH", directory.toString());
        ByteArrayOutputStream image = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", image);

        String name = storage.store(new MockMultipartFile("file", "malicious.svg", "image/svg+xml", image.toByteArray()));
        assertNotNull(storage.load(name));
        assertThrows(IllegalArgumentException.class, () -> storage.load("../other/secret.png"));
        assertThrows(IllegalArgumentException.class, () -> storage.store(
                new MockMultipartFile("file", "face.png", "image/png", "not an image".getBytes())));
    }
}
