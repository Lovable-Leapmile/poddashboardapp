from playwright.sync_api import sync_playwright
import time
import random
import os

# LEAPMILE_LOCAL_HOST = os.getenv("LEAPMILE_LOCAL_HOST")
# APP_NAME = "poddashboardapp"
# APP_URL = f"https://{LEAPMILE_LOCAL_HOST}/{APP_NAME}"

APP_URL = "https://testhostpod.leapmile.com/poddashboardapp"
LOGIN_PHONE = "9778003310"
LOGIN_OTP = "875311"

USER_PHONE = "8547356155"
USER_NAME = "Test User"

POD_ID = "1002222"
LOCATION_NAME = "Qikpod Tower1"


# =========================
# LOG
# =========================
def log_header():
    print("-" * 100)
    print(f"| {'Task'.ljust(30)} | {'Status'.ljust(9)} | {'Message'.ljust(50)} |")
    print("-" * 100)

def log_step(task, status="✅", message="Done"):
    print(f"| {task.ljust(30)} | {status.ljust(8)} | {message.ljust(50)} |")

def log_footer():
    print("-" * 100)


# =========================
# TEST CASES
# =========================
def test_login(page):
    try:
        page.goto(APP_URL)
        page.wait_for_load_state("networkidle")

        page.get_by_role("textbox", name="Mobile Number").fill(LOGIN_PHONE)
        page.get_by_role("button", name="Request OTP").click()

        page.get_by_role("textbox", name="Enter OTP").fill(LOGIN_OTP)
        page.get_by_role("button", name="Sign In").click()

        page.wait_for_load_state("networkidle")

        log_step("Login", "✅", "Login successful")
        return True

    except Exception as e:
        log_step("Login", "❌", str(e))
        return False


def test_add_user(page):
    try:
        page.get_by_role("button", name="Users", exact=True).click()
        page.wait_for_timeout(2000)

        page.get_by_role("button", name="Add User").click()
        page.get_by_role("combobox").click()
        page.get_by_role("option", name="QPStaff").click()

        page.get_by_role("textbox", name="Enter full name").fill(USER_NAME)
        page.get_by_role("textbox", name="Enter email address").fill("test@gmail.com")
        page.get_by_role("textbox", name="Enter phone number").fill(USER_PHONE)
        page.get_by_role("textbox", name="Enter flat number").fill("214")
        page.get_by_role("textbox", name="Enter address or company name").fill("Leapmile")

        page.get_by_role("button", name="Submit").click()
        page.wait_for_timeout(2000)
        log_step("Add User", "✅", "User created")
        return True

    except Exception as e:
        log_step("Add User", "❌", str(e))
        return False


def test_add_location(page):
    try:
        page.get_by_role("button", name="Locations").click()
        page.wait_for_timeout(2000)

        page.get_by_role("button", name="Add Location").click()
        page.get_by_role("textbox", name="Location Name *").fill(LOCATION_NAME)
        page.get_by_role("textbox", name="Address *").fill("CV Raman Nagar")

        page.get_by_role("button", name="Create Location").click()
        page.wait_for_timeout(2000)

        log_step("Add Location", "✅", "Location created")
        return True

    except Exception as e:
        log_step("Add Location", "❌", str(e))
        return False


def test_add_pod(page):
    try:
        page.get_by_role("button", name="Pods").click()
        page.wait_for_timeout(2000)

        page.get_by_role("button", name="Add Pod").click()
        page.get_by_role("spinbutton", name="Pod ID *").fill(POD_ID)

        page.get_by_role("combobox").filter(has_text="Select Location").click()
        page.get_by_role("option", name=LOCATION_NAME).click()
        page.get_by_role("spinbutton", name="Total Doors").fill("7")
        page.get_by_role("textbox", name="Production Version", exact=True).fill("3_4_3")
        page.get_by_role("textbox", name="Pod Name *").fill("DEMO-2")
        page.get_by_role("button", name="Create Pod").click()
        page.wait_for_timeout(2000)

        log_step("Add Pod", "✅", "Pod created")
        return True

    except Exception as e:
        log_step("Add Pod", "❌", str(e))
        return False


def test_delete_flow(page):
    try:
        # POD DELETE
        page.get_by_role("button", name="Pods").click()
        page.get_by_role("gridcell", name=POD_ID).click()
        page.get_by_role("button", name="Delete").click()
        page.get_by_role("button", name="Yes").click()
        log_step("Delete Pod", "✅", "Pod deleted")

        # LOCATION DELETE
        page.get_by_role("button", name="Locations").click()
        page.get_by_role("gridcell", name=LOCATION_NAME).click()
        page.get_by_role("button", name="Delete").click()
        page.get_by_role("button", name="Yes").click()
        log_step("Delete Location", "✅", "Location deleted")

        # USER DELETE
        page.get_by_role("button", name="Users", exact=True).click()
        page.get_by_role("gridcell", name=USER_NAME).click()
        page.get_by_role("button", name="Delete").click()
        page.get_by_role("button", name="Yes").click()
        log_step("Delete User", "✅", "User deleted")

        #log_step("Delete Flow", "✅", "All entities deleted")
        return True

    except Exception as e:
        log_step("Delete Flow", "❌", str(e))
        return False


# =========================
# RUNNER
# =========================
def run_tests(headless=False):

    log_header()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        page = browser.new_page()

        try:
            if not test_login(page):
                return

            if not test_add_user(page):
                return

            if not test_add_location(page):
                return

            if not test_add_pod(page):
                return

            if not test_delete_flow(page):
                return

            
            

        finally:
            browser.close()
            log_step("Browser ", "✅", "Closed")

    log_footer()
    print("\n✅ TEST COMPLETED\n")


# =========================
# MAIN
# =========================
if __name__ == "__main__":
    run_tests(headless=False)