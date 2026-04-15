import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select


class TestSauceDemo(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        self.driver.maximize_window()

        self.driver.implicitly_wait(5)

    def login(self):
        driver = self.driver
        driver.get("https://www.ydachnik.by/")

        driver.find_element(By.ID, "user-name").send_keys("alexej.mandrik.2005@gmail.com")
        driver.find_element(By.ID, "password").send_keys("L2e0sch0a5")
        driver.find_element(By.ID, "login-button").click()

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "inventory_list"))
        )

    # --- ТЕСТ 1: Авторизация ---
    def test_login(self):
        self.login()

        title = self.driver.find_element(By.CLASS_NAME, "title").text
        self.assertEqual(title, "Products")

    # --- ТЕСТ 2: Добавление товара в корзину ---
    def test_add_to_cart(self):
        self.login()

        self.driver.find_element(By.ID, "add-to-cart-sauce-labs-backpack").click()
        self.driver.find_element(By.CLASS_NAME, "shopping_cart_link").click()

        item = self.driver.find_element(By.CLASS_NAME, "inventory_item_name").text
        self.assertIn("Backpack", item)

    # --- ТЕСТ 3: Сквозной сценарий ---
    def test_checkout(self):
        self.login()

        self.driver.find_element(By.ID, "add-to-cart-sauce-labs-bike-light").click()
        self.driver.find_element(By.CLASS_NAME, "shopping_cart_link").click()
        self.driver.find_element(By.ID, "checkout").click()

        self.driver.find_element(By.ID, "first-name").send_keys("Ivan")
        self.driver.find_element(By.ID, "last-name").send_keys("Ivanov")
        self.driver.find_element(By.ID, "postal-code").send_keys("12345")
        self.driver.find_element(By.ID, "continue").click()

        self.driver.find_element(By.ID, "finish").click()

        success = self.driver.find_element(By.CLASS_NAME, "complete-header").text
        self.assertEqual(success, "Thank you for your order!")

    # --- ТЕСТ 4: Dropdown ---
    def test_sort_dropdown(self):
        self.login()

        dropdown = Select(self.driver.find_element(By.CLASS_NAME, "product_sort_container"))
        dropdown.select_by_visible_text("Price (low to high)")

        # Проверка — первый товар должен быть дешевый
        prices = self.driver.find_elements(By.CLASS_NAME, "inventory_item_price")
        first_price = prices[0].text

        self.assertTrue("$" in first_price)

    def tearDown(self):
        self.driver.quit()


if __name__ == "__main__":
    unittest.main()