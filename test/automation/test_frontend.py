import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class FrontendAutomationTests(unittest.TestCase):

    def setUp(self):
        # Setup Chrome driver (needs chromedriver in PATH, or runs via selenium manager)
        options = webdriver.ChromeOptions()
        # Running in headless mode for robust CI/CD execution if preferred, but leaving typical for demo
        options.add_argument('--headless')
        self.driver = webdriver.Chrome(options=options)
        self.driver.get("http://localhost:3000") # Default Next.js url

    def test_page_title(self):
        """Test if the page loads and has a title."""
        self.assertIn("Inventory", self.driver.title, "Title should contain Inventory")

    def test_login_navigation(self):
        """Test navigating to the login screen."""
        self.driver.get("http://localhost:3000/login")
        time.sleep(1) # wait for render
        
        # Test presence of form fields using expected typical selectors
        try:
            email_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='email']")
            pass_input = self.driver.find_element(By.CSS_SELECTOR, "input[type='password']")
            self.assertIsNotNone(email_input)
            self.assertIsNotNone(pass_input)
        except Exception as e:
            self.fail(f"Login elements not found: {e}")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
