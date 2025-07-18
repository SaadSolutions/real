// src/modules/facebook/createAccount.js
const playwright = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')(); // For evasion
playwright.chromium.use(stealth);

const { spoofBrowser } = require('../../utils/spoof'); // Spoofing utils
const { humanizeType, humanizeClick, randomDelay } = require('../../utils/humanize'); // Human-like actions
const { getProxy } = require('../../utils/proxies'); // Proxy assignment

async function createFacebookAccount() {
  let browser;
  try {
    // Assign a proxy (scalable from config/proxies.json)
    const proxy = getProxy(); // Returns { server: 'http://ip:port', username: '', password: '' }
    
    // Launch stealthy browser with spoofing
    browser = await playwright.chromium.launch({
      headless: true, // Set to false for debugging
      proxy: proxy.server ? proxy : null, // Apply proxy if available
    });
    const context = await browser.newContext({
      userAgent: spoofBrowser().userAgent, // Random UA from spoof.js
      viewport: { width: 1280, height: 720 }, // Common size
      // Additional spoofing: disable WebGL, emulate mobile if needed (configurable in spoof.js)
    });
    const page = await context.newPage();

    console.log('Navigating to Facebook signup...');
    await page.goto('https://www.facebook.com/r.php', { waitUntil: 'networkidle' });
    await randomDelay(2000, 4000); // Human-like pause

    // Fill form with fake data, humanized
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa', 'Alex', 'Maria'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@gmail.com`;
    const password = Math.random().toString(36).slice(-12) + Math.floor(Math.random() * 100);

    await humanizeType(page, 'input[name="firstname"]', firstName);
    await humanizeType(page, 'input[name="lastname"]', lastName);
    await humanizeType(page, 'input[name="reg_email__"]', email);
    await humanizeType(page, 'input[name="reg_email_confirmation__"]', email);
    await humanizeType(page, 'input[name="reg_passwd__"]', password);

    // Select DOB (random adult age)
    await page.selectOption('select[name="birthday_month"]', { value: `${Math.floor(Math.random() * 12) + 1}` });
    await page.selectOption('select[name="birthday_day"]', { value: `${Math.floor(Math.random() * 28) + 1}` });
    await page.selectOption('select[name="birthday_year"]', { value: `${new Date().getFullYear() - (Math.floor(Math.random() * 20) + 18)}` }); // 18-38 years old

    // Select gender (random)
    const gender = Math.random() > 0.5 ? '1' : '2'; // 1=Female, 2=Male
    await humanizeClick(page, `input[value="${gender}"]`);

    // Submit
    await humanizeClick(page, 'button[name="websubmit"]');
    await randomDelay(3000, 5000); // Wait for potential redirect

    // Check for success (basic; expand later for verification)
    if (page.url().includes('facebook.com/checkpoint')) {
      throw new Error('Checkpoint detected; may need CAPTCHA or better spoofing.');
    }
    console.log(`Account created: ${email} / ${password}`);

    // Store session for later logins
    const sessionState = await context.storageState({ path: `./storage/sessions/fb_${email.replace(/@.*/, '')}.json` });
    console.log('Session stored for relogin.');

  } catch (error) {
    console.error('Error during registration:', error.message);
    // Future: Retry logic or ban monitoring
  } finally {
    if (browser) await browser.close();
  }
}

createFacebookAccount(); // Run directly; make async in index.js for scalability