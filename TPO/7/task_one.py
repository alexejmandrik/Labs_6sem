from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.maximize_window()

driver.implicitly_wait(5)

driver.get("https://www.saucedemo.com/")

wait = WebDriverWait(driver, 10)

# --- По ID ---
username = wait.until(EC.presence_of_element_located((By.ID, "user-name")))
print("Найден элемент по ID:", username.get_attribute("placeholder"))

# --- По NAME ---
password = driver.find_element(By.NAME, "password")
print("Найден элемент по NAME:", password.get_attribute("placeholder"))

# --- CSS (сложный селектор №1) ---
login_button = driver.find_element(By.CSS_SELECTOR, "input.submit-button.btn_action")
print("Найден CSS 1:", login_button.get_attribute("value"))

# --- CSS (сложный селектор №2) ---
logo = driver.find_element(By.CSS_SELECTOR, "div.login_logo")
print("Найден CSS 2:", logo.text)

# --- XPath ---
xpath_elem1 = wait.until(
    EC.presence_of_element_located(
        (By.XPATH, "//div[contains(@class,'login_wrapper')]//input[@id='user-name']")
    )
)
print("Найден XPath 1:", xpath_elem1.get_attribute("id"))

# --- XPath ---
xpath_elem2 = driver.find_element(
    By.XPATH,
    "//input[@id='password' and @type='password']"
)
print("Найден XPath 2:", xpath_elem2.get_attribute("id"))


driver.find_element(By.ID, "user-name").send_keys("standard_user")
driver.find_element(By.ID, "password").send_keys("secret_sauce")
driver.find_element(By.ID, "login-button").click()

wait.until(EC.presence_of_element_located((By.CLASS_NAME, "inventory_list")))

# --- Поиск по частичному тексту
add_buttons = wait.until(
    EC.presence_of_all_elements_located(
        (By.XPATH, "//button[contains(text(),'Add')]")
    )
)
print("Найдено кнопок с текстом 'Add':", len(add_buttons))


items = driver.find_elements(By.CLASS_NAME, "inventory_item_name")
print("Найдено товаров:", len(items))

driver.quit()