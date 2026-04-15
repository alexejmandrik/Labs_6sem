# test_demoblaze.py
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoAlertPresentException
from webdriver_manager.chrome import ChromeDriverManager

# ================= PAGE OBJECT =================
class DemoblazePage:

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def open(self):
        self.driver.get("https://www.demoblaze.com/")

    def login(self, username, password):
        self.driver.find_element(By.ID, "login2").click()
        self.wait.until(EC.visibility_of_element_located((By.ID, "loginusername"))).send_keys(username)
        self.driver.find_element(By.ID, "loginpassword").send_keys(password)
        self.driver.find_element(By.XPATH, "//button[text()='Log in']").click()

        # --- Обработка alert при неверном логине ---
        try:
            alert = self.wait.until(EC.alert_is_present())
            print(f"Alert text: {alert.text}")
            alert.accept()
        except NoAlertPresentException:
            pass

    def is_logged_in(self):
        try:
            return self.wait.until(EC.presence_of_element_located((By.ID, "logout2"))).is_displayed()
        except:
            return False

    def open_first_product(self):
        self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "hrefch"))).click()

    def add_to_cart(self):
        self.wait.until(EC.element_to_be_clickable((By.XPATH, "//a[text()='Add to cart']"))).click()
        self.wait.until(EC.alert_is_present())
        self.driver.switch_to.alert.accept()

    def go_to_cart(self):
        self.driver.find_element(By.ID, "cartur").click()

    def place_order(self, name="Ivan"):
        self.wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Place Order']"))).click()
        self.wait.until(EC.visibility_of_element_located((By.ID, "name"))).send_keys(name)
        self.driver.find_element(By.ID, "country").send_keys("Belarus")
        self.driver.find_element(By.ID, "city").send_keys("Minsk")
        self.driver.find_element(By.ID, "card").send_keys("1234")
        self.driver.find_element(By.ID, "month").send_keys("12")
        self.driver.find_element(By.ID, "year").send_keys("2026")
        self.driver.find_element(By.XPATH, "//button[text()='Purchase']").click()

    def get_success_text(self):
        return self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "sweet-alert"))).text

    def filter_phones(self):
        self.wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Phones"))).click()

    def get_products(self):
        return self.wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, "card-title")))


# ================= FIXTURE =================
@pytest.fixture(scope="class")
def driver_init(request):
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    page = DemoblazePage(driver)
    request.cls.driver = driver
    request.cls.page = page
    yield
    driver.quit()


# ================= TESTS =================
@pytest.mark.usefixtures("driver_init")
class TestDemoblaze:

    # --- ПАРАМЕТРИЗАЦИЯ LOGIN ---
    @pytest.mark.parametrize("username,password,success", [
        ("testuser", "testpass", True),
        ("wronguser", "wrongpass", False)
    ])
    def test_login_parametrized(self, username, password, success):
        self.page.open()
        self.page.login(username, password)
        assert self.page.is_logged_in() == success

    # --- LOGIN ---
    def test_login(self):
        self.page.open()
        self.page.login("alexej", "qwerty")
        assert self.page.is_logged_in()

    # --- ADD TO CART + SCREENSHOT ---
    def test_add_to_cart(self):
        self.page.open()
        self.page.open_first_product()
        self.page.add_to_cart()
        self.driver.save_screenshot("screenshot.png")
        self.page.go_to_cart()
        assert True

    # --- CHECKOUT ---
    def test_checkout(self):
        self.page.open()
        self.page.open_first_product()
        self.page.add_to_cart()
        self.page.go_to_cart()
        self.page.place_order()
        success_text = self.page.get_success_text()
        assert "Thank" in success_text

    # --- COOKIES ---
    def test_cookies(self):
        self.page.open()
        cookies = self.driver.get_cookies()
        print("\nCOOKIES:")
        for cookie in cookies:
            print(cookie)
        with open("cookies.txt", "w") as f:
            for cookie in cookies:
                f.write(f"{cookie}\n")
        assert len(cookies) > 0

    # --- SKIP EXAMPLE ---
    @pytest.mark.skip(reason="Пример пропущенного теста")
    def test_filter(self):
        self.page.open()
        self.page.filter_phones()
        products = self.page.get_products()
        assert len(products) > 0

    # --- EXPECTED FAIL ---
    @pytest.mark.xfail(reason="Пример ожидаемого падения")
    def test_fail_example(self):
        assert 1 == 2





# pytest task.py --html=report.html --self-contained-html
# pytest task.py::TestDemoblaze::test_login