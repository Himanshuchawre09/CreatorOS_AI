const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const EVIDENCE_DIR = path.resolve(__dirname, 'evidence');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Launching browser with Chrome at:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,768'],
    defaultViewport: { width: 1366, height: 768 }
  });

  const page = await browser.newPage();

  try {
    // 1. Landing Page
    console.log('Capturing Landing Page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-LAND-01-landing-page.png') });

    // 2. Registration Form
    console.log('Capturing Registration Form...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });
    await sleep(500);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-AUTH-01-registration-form.png') });

    // 3. Registration Validation Error (Negative Test)
    console.log('Capturing Registration Validation Error...');
    await page.type('input[id*="name"], input[placeholder*="name" i]', 'John');
    await page.type('input[type="email"]', 'invalid-email');
    await page.type('input[type="password"]', '123'); // weak password
    await page.click('button[type="submit"]');
    await sleep(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-AUTH-02-validation-error.png') });

    // 4. Login Screen
    console.log('Capturing Login Screen...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await sleep(500);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-AUTH-03-login-screen.png') });

    // 5. Invalid Login Error Toast (Negative Test)
    console.log('Capturing Invalid Login Error...');
    await page.type('input[type="email"]', 'wrong@example.com');
    await page.type('input[type="password"]', 'WrongPass123!');
    await page.click('button[type="submit"]');
    await sleep(1200);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-AUTH-04-invalid-login.png') });

    // 6. Valid Creator Login
    console.log('Logging in as Creator (tech.sarah@demo.creatoros.test)...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'tech.sarah@demo.creatoros.test');
    await page.type('input[type="password"]', 'demo@4321email');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await sleep(1500);

    // 7. Creator Dashboard
    console.log('Capturing Creator Dashboard...');
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-ROLE-01-dashboard-creator.png') });

    // 8. Campaigns Page
    console.log('Capturing Campaigns View...');
    await page.goto('http://localhost:5173/campaigns', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-CAMP-01-campaigns-view.png') });

    // 9. Discover Page
    console.log('Capturing Discover Page...');
    await page.goto('http://localhost:5173/discover', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-DISC-01-creator-discovery.png') });

    // 10. Contracts Page
    console.log('Capturing Contracts View...');
    await page.goto('http://localhost:5173/contracts', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-CONT-01-contract-detail.png') });

    // 11. Tasks Kanban Board
    console.log('Capturing Tasks Kanban Board...');
    await page.goto('http://localhost:5173/tasks', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-TASK-01-tasks-kanban.png') });

    // 12. Content Review Page
    console.log('Capturing Content Review Page...');
    await page.goto('http://localhost:5173/content-review', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-SUBM-01-content-review.png') });

    // 13. Content Calendar
    console.log('Capturing Content Calendar...');
    await page.goto('http://localhost:5173/calendar', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-CAL-01-content-calendar.png') });

    // 14. Analytics Page (Recharts)
    console.log('Capturing Analytics Page...');
    await page.goto('http://localhost:5173/analytics', { waitUntil: 'networkidle2' });
    await sleep(1200);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-ANA-01-campaign-analytics.png') });

    // 15. AI Assistant Page
    console.log('Capturing AI Assistant Page...');
    await page.goto('http://localhost:5173/ai-assistant', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-AI-01-ai-assistant.png') });

    // 16. Invoices Page
    console.log('Capturing Invoices Page...');
    await page.goto('http://localhost:5173/invoices', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-INV-01-invoices-view.png') });

    // 17. Responsive Checks on Dashboard
    console.log('Capturing Desktop 1366x768...');
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
    await sleep(800);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-RESP-01-desktop-1366.png') });

    console.log('Capturing Tablet 768x1024...');
    await page.setViewport({ width: 768, height: 1024 });
    await sleep(800);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-RESP-02-tablet-768.png') });

    console.log('Capturing Mobile 390x844...');
    await page.setViewport({ width: 390, height: 844 });
    await sleep(800);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-RESP-03-mobile-390.png') });

    // 18. 404 Not Found Page
    console.log('Capturing 404 Page...');
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto('http://localhost:5173/non-existent-route-404', { waitUntil: 'networkidle2' });
    await sleep(800);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-SEC-01-not-found-404.png') });

    // 19. Admin Console (Log in as admin)
    console.log('Logging in as Admin (admin@gmail.com)...');
    const adminContext = await browser.createBrowserContext();
    const adminPage = await adminContext.newPage();
    await adminPage.setViewport({ width: 1366, height: 768 });
    await adminPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await adminPage.type('input[type="email"]', 'admin@gmail.com');
    await adminPage.type('input[type="password"]', 'admin@4321email');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await sleep(1500);

    console.log('Navigating to Admin Console...');
    await adminPage.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2' });
    await sleep(1200);
    await adminPage.screenshot({ path: path.join(EVIDENCE_DIR, 'TC-ADM-01-admin-console.png') });
    await adminContext.close();

    console.log('All browser captures completed successfully!');
  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    await browser.close();
  }
}

capture();

