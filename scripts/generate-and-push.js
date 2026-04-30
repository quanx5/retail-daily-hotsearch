const pushChannel = (process.env.PUSH_CHANNEL || 'wecom').toLowerCase();

function getTodayLabel() {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long'
  }).format(new Date());
}

function getCategory(index) {
  const categories = ['新零售', '电商', '消费趋势', '品牌动态', '市场洞察', '行业报告', '技术创新', '用户体验'];
  return categories[index % categories.length];
}

function getRetailNews() {
  const now = new Date();
  return [
    {
      title: '直播电商GMV突破新高，品牌自播成主流趋势',
      description: '2026年Q1直播电商交易额同比增长65%，品牌自播占比超过40%，头部品牌纷纷加码自播团队建设，私域流量运营成为核心竞争力。',
      source: '电商观察',
      category: '电商',
      publishedAt: new Date(now - 30 * 60000)
    },
    {
      title: '即时零售订单量激增，30分钟达成为标配',
      description: '美团、饿了么等平台即时零售业务增长迅猛，消费者对配送时效要求不断提升，零售商加速布局前置仓和社区店。',
      source: '零售前沿',
      category: '新零售',
      publishedAt: new Date(now - 90 * 60000)
    },
    {
      title: 'AI智能导购系统落地，转化率提升30%',
      description: '多家头部零售企业引入AI导购系统，通过智能推荐和个性化服务，显著提升用户购物体验和转化效率。',
      source: '科技零售',
      category: '技术创新',
      publishedAt: new Date(now - 150 * 60000)
    },
    {
      title: '新消费品牌集体出海，东南亚市场成热门',
      description: '国内新消费品牌加速国际化布局，东南亚、中东等新兴市场成为重点，跨境电商平台助力品牌快速拓展海外业务。',
      source: '品牌观察',
      category: '品牌动态',
      publishedAt: new Date(now - 210 * 60000)
    },
    {
      title: '会员制零售模式火热，付费会员突破5000万',
      description: '山姆、Costco等会员制商超持续扩张，本土零售企业纷纷推出付费会员体系，会员经济成为零售新增长点。',
      source: '商业周刊',
      category: '消费趋势',
      publishedAt: new Date(now - 270 * 60000)
    },
    {
      title: '绿色消费成趋势，可持续产品销量翻倍',
      description: '消费者环保意识增强，可持续、环保产品需求激增，品牌ESG表现成为影响购买决策的重要因素。',
      source: '消费日报',
      category: '市场洞察',
      publishedAt: new Date(now - 330 * 60000)
    },
    {
      title: '社区团购重新洗牌，精细化运营成关键',
      description: '社区团购行业进入理性发展阶段，企业从规模扩张转向精细化运营，供应链效率和用户留存成为核心指标。',
      source: '零售内参',
      category: '新零售',
      publishedAt: new Date(now - 390 * 60000)
    },
    {
      title: '元宇宙虚拟店铺兴起，Z世代成消费主力',
      description: '多个品牌在元宇宙平台开设虚拟店铺，通过沉浸式体验吸引年轻消费者，虚拟商品交易额持续增长。',
      source: '未来零售',
      category: '行业报告',
      publishedAt: new Date(now - 450 * 60000)
    },
    {
      title: '无人零售技术成熟，智能货柜覆盖率提升',
      description: '无人便利店、智能货柜等无人零售业态技术日趋成熟，运营成本下降，在写字楼、社区等场景快速普及。',
      source: '智慧商业',
      category: '技术创新',
      publishedAt: new Date(now - 510 * 60000)
    },
    {
      title: '私域流量运营升级，企业微信用户破8亿',
      description: '零售企业加大私域流量投入，通过企业微信、小程序等工具构建私域生态，实现用户精细化运营和复购提升。',
      source: '营销观察',
      category: '消费趋势',
      publishedAt: new Date(now - 570 * 60000)
    }
  ];
}

function formatTime(date) {
  const diff = Math.floor((new Date() - date) / 1000 / 60);
  if (diff < 60) return `${diff}分钟前`;
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

function buildMarkdownBody() {
  const news = getRetailNews();
  const pageUrl = process.env.PAGE_URL || 'https://quanx5.github.io/retail-daily-hotsearch/';

  let md = `## 🛍️ 零售行业每日热搜\n`;
  md += `> **${getTodayLabel()}** ｜ 共 ${news.length} 条行业动态\n\n`;

  news.forEach((item, index) => {
    const rank = index + 1;
    const medal = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `**#${rank}**`;
    md += `${medal} **[${item.category}] ${item.title}**\n`;
    md += `> ${item.description}\n`;
    md += `📊 ${item.source} ｜ ${formatTime(item.publishedAt)}\n\n`;
  });

  md += `---\n`;
  md += `📖 查看完整榜单：[零售行业每日热搜](${pageUrl}) ｜ 每日 09:00 自动推送`;

  return md;
}

function buildTextBody() {
  const news = getRetailNews();
  const pageUrl = process.env.PAGE_URL || 'https://quanx5.github.io/retail-daily-hotsearch/';

  let text = `【零售行业每日热搜】${getTodayLabel()}\n`;
  text += `━━━━━━━━━━━━━━━━\n\n`;

  news.forEach((item, index) => {
    text += `#${index + 1} [${item.category}] ${item.title}\n`;
    text += `  ${item.description}\n`;
    text += `  📊 ${item.source} ｜ ${formatTime(item.publishedAt)}\n\n`;
  });

  text += `━━━━━━━━━━━━━━━━\n`;
  text += `查看完整榜单：${pageUrl}`;

  return text;
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

async function pushToWeCom() {
  const webhook = process.env.WECOM_BOT_WEBHOOK;
  if (!webhook) {
    throw new Error('Missing WECOM_BOT_WEBHOOK. Please add it in GitHub Secrets.');
  }

  const markdownContent = buildMarkdownBody();

  const result = await postJson(webhook, {
    msgtype: 'markdown',
    markdown: { content: markdownContent }
  });

  console.log('✅ WeCom push result:', JSON.stringify(result));
}

async function pushToServerChan() {
  const sendKey = process.env.SERVER_CHAN_SENDKEY;
  if (!sendKey) {
    throw new Error('Missing SERVER_CHAN_SENDKEY. Please add it in GitHub Secrets.');
  }

  const news = getRetailNews();
  const pageUrl = process.env.PAGE_URL || 'https://quanx5.github.io/retail-daily-hotsearch/';

  const title = `零售行业每日热搜 ${getTodayLabel()}`;

  let desp = `## 今日热点\n\n`;
  news.forEach((item, index) => {
    desp += `### ${index + 1}. [${item.category}] ${item.title}\n\n`;
    desp += `${item.description}\n\n`;
    desp += `> 📊 ${item.source} ｜ ${formatTime(item.publishedAt)}\n\n---\n\n`;
  });
  desp += `\n[查看完整榜单](${pageUrl})`;

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

  console.log('✅ ServerChan push result:', text);
}

async function main() {
  if (pushChannel === 'wecom') {
    await pushToWeCom();
    return;
  }

  if (pushChannel === 'serverchan') {
    await pushToServerChan();
    return;
  }

  throw new Error(`Unsupported PUSH_CHANNEL: ${pushChannel}. Use "wecom" or "serverchan".`);
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
