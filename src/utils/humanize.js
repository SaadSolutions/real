// src/utils/humanize.js
async function humanizeType(page, selector, text) {
  await page.type(selector, text, { delay: Math.random() * 100 + 50 }); // Typing with pauses
}

async function humanizeClick(page, selector) {
  const element = await page.$(selector);
  const box = await element.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 }); // Curved mouse
  await page.click(selector);
}

function randomDelay(min, max) {
  return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
}

module.exports = { humanizeType, humanizeClick, randomDelay };