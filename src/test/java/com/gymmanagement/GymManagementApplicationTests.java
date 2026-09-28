package com.gymmanagement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "app.auth.token-secret=test-secret-for-isolated-tests-only-32-bytes")
class GymManagementApplicationTests {

	@Test
	void contextLoads() {
	}

}
