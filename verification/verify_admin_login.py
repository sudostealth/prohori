from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Check login page
        print("Navigating to /login")
        page.goto("http://localhost:3004/login")
        page.wait_for_load_state("networkidle")

        # Take screenshot of login page
        page.screenshot(path="verification/login_page_admin_retry_2.png")
        print("Login page screenshot taken")

        if page.is_visible("input[type='email']"):
             print("Login form is visible")
        else:
             print("Login form is NOT visible")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
