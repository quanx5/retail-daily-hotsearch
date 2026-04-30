const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('@playwright/test');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'dist');
const screenshotPath = path.join(outDir, 'retail-hotsearch.png');
const pageUrl = process.env.PAGE_URL || `file://${path.join(rootDir, 'index.html').replace(/\\/g, '/')}`;
const pushChannel = (process.env.PUSH_CHANNEL || 'wecom').toLowerCase();

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getTodayLabel() {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long'
  }).format(new Date());
}

async function generateScreenshot() {
  ensureDir(outDir);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 420, height: 1200 }, deviceScaleFactor: 2 });

  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  await page.waitForSelector('#captureArea', { timeout: 15000 });
  await page.waitForTimeout(1200);

  const captureArea = page.locator('#captureArea');
  await captureArea.screenshot({ path: screenshotPath, animations: 'disabled' });

  await browser.close();
  console.log(`Screenshot saved: ${screenshotPath}`);
  return screenshotPath;
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function pushToWeCom(imagePath) {
  const webhook = process.env.WECOM_BOT_WEBHOOK;
  if (!webhook) {
    throw new Error('Missing WECOM_BOT_WEBHOOK. Please add it in GitHub Secrets.');
  }

  const buffer = fs.readFileSync(imagePath);
  const base64 = buffer.toString('base64');
  const md5 = crypto.createHash('md5').update(buffer).digest('hex');

  const result = await postJson(webhook, {
    msgtype: 'image',
    image: { base64, md5 }
  });

  console.log('WeCom push result:', result);
}

async function pushToServerChan(imagePath) {
  const sendKey = process.env.SERVER_CHAN_SENDKEY;
  if (!sendKey) {
    throw new Error('Missing SERVER_CHAN_SENDKEY. Please add it in GitHub Secrets.');
  }

  const title = `零售行业每日热搜 ${getTodayLabel()}`;
  const desp = `今日零售行业热搜图片已生成。\n\n页面地址：${process.env.PAGE_URL || 'GitHub Pages 发布后填写 PAGE_URL Secret'}\n\n图片文件已保存在本次 GitHub Actions Artifacts 中。`;
  const url = `https://sctapi.ftqq.com/${sendKey}.send`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ title, desp })
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`ServerChan HTTP ${res.status}: ${text}`);
  }

  console.log('ServerChan push result:', text);
}

async function pushImage(imagePath) {
  if (pushChannel === 'wecom') {
    await pushToWeCom(imagePath);
    return;
  }

  if (pushChannel === 'serverchan') {
    await pushToServerChan(imagePath);
    return;
  }

  throw new Error(`Unsupported PUSH_CHANNEL: ${pushChannel}. Use "wecom" or "serverchan".`);
}

async function main() {
  const mode = process.argv[2] || 'daily';

  if (mode === 'screenshot') {
    await generateScreenshot();
    return;
  }

  if (mode === 'push') {
    await pushImage(screenshotPath);
    return;
  }

  if (mode === 'daily') {
    const imagePath = await generateScreenshot();
    await pushImage(imagePath);
    return;
  }

  throw new Error(`Unknown mode: ${mode}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
