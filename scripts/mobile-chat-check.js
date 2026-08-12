const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:3000/ai-assistance', { waituntil: 'networkidle', timeout: 5000 });

  const inputCount = await page.locator('input[aria-label="Message Mazhai Boutique"]').count();
  const formCount = await page.locator('form').count();

  const result = await page.evaluate(() => {
    const input = document.querySelector('input[aria-label="Message Mazhai Boutique"]');
    const form = document.querySelector('form');
    const content = document.querySelector('.ai-chat-content');
    const card = document.querySelector('.ai-chat-card');

    if (!input || !form || !content || !card) {
      return { missing: true };
    }

    const style = getComputedStyle(input);
    const formStyle = getComputedStyle(form);
    const contentStyle = getComputedStyle(content);
    const cardStyle = getComputedStyle(card);

    return {
      missing: false,
      inputDisplay: style.display,
      inputVisibility: style.visibility,
      inputHeight: style.height,
      inputWidth: style.width,
      placeholder: input.getAttribute('placeholder'),
      formDisplay: formStyle.display,
      formVisibility: formStyle.visibility,
      formHeight: formStyle.height,
      contentHeight: contentStyle.height,
      contentOverflow: contentStyle.overflow,
      cardHeight: cardStyle.height,
      cardOverflow: cardStyle.overflow,
      viewport: window.innerWidth + 'x' + window.innerHeight
    };
  });

  console.log(JSON.stringify({ inputCount, formCount, result }, null, 2));

  await browser.close();
})();
