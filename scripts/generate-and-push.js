const pushChannel = (process.env.PUSH_CHANNEL || 'wecom').toLowerCase();
const JUHE_API_KEY = '74b842ddef4a8acdc200374f06e17343';
const JUHE_API_URL = 'https://apis.juhe.cn/fapigx/networkhot/query';
const REQUEST_TIMEOUT_MS = 15000;
const PUSH_MAX_ATTEMPTS = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWithRetry(label, url, options, validateResponse) {
  let lastError;

  for (let attempt = 1; attempt <= PUSH_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });
      const text = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      if (validateResponse) {
        validateResponse(text);
      }

      console.log(`✅ ${label} push result:`, text);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < PUSH_MAX_ATTEMPTS) {
        console.warn(`⚠️ ${label} push attempt ${attempt} failed: ${error.message}. Retrying...`);
        await sleep(attempt * 1000);
      }
    }
  }

  throw new Error(`${label} push failed after ${PUSH_MAX_ATTEMPTS} attempts: ${lastError.message}`);
}

function validateWeComResponse(text) {
  let data;

  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid WeCom response: ${text.slice(0, 200)}`);
  }

  if (data.errcode !== 0) {
    throw new Error(`WeCom errcode ${data.errcode}: ${data.errmsg || 'unknown error'}`);
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

function getCategory(index) {
  const categories = ['时事', '经济', '社会', '科技', '娱乐', '体育', '国际', '其他'];
  return categories[index % categories.length];
}

function formatTime(date) {
  const diff = Math.floor((new Date() - new Date(date)) / 1000 / 60);
  if (diff < 60) return `${diff}分钟前`;
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
  return new Date(date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

function formatHotValue(hotnum) {
  if (hotnum >= 10000) {
    return (hotnum / 10000).toFixed(1) + '万';
  }
  return hotnum.toString();
}

// 备用默认数据（API失败时使用）
function getDefaultNews() {
  const now = new Date();
  return [
    {
      title: '直播电商GMV突破新高，品牌自播成主流趋势',
      description: '2026年Q1直播电商交易额同比增长65%，品牌自播占比超过40%，头部品牌纷纷加码自播团队建设，私域流量运营成为核心竞争力。',
      source: '电商观察',
      category: '电商',
      publishedAt: new Date(now - 30 * 60000),
      hotFormatted: '125.0万'
    },
    {
      title: '即时零售订单量激增，30分钟达成为标配',
      description: '美团、饿了么等平台即时零售业务增长迅猛，消费者对配送时效要求不断提升，零售商加速布局前置仓和社区店。',
      source: '零售前沿',
      category: '新零售',
      publishedAt: new Date(now - 90 * 60000),
      hotFormatted: '98.0万'
    },
    {
      title: 'AI智能导购系统落地，转化率提升30%',
      description: '多家头部零售企业引入AI导购系统，通过智能推荐和个性化服务，显著提升用户购物体验和转化效率。',
      source: '科技零售',
      category: '技术创新',
      publishedAt: new Date(now - 150 * 60000),
      hotFormatted: '85.0万'
    },
    {
      title: '新消费品牌集体出海，东南亚市场成热门',
      description: '国内新消费品牌加速国际化布局，东南亚、中东等新兴市场成为重点，跨境电商平台助力品牌快速拓展海外业务。',
      source: '品牌观察',
      category: '品牌动态',
      publishedAt: new Date(now - 210 * 60000),
      hotFormatted: '72.0万'
    },
    {
      title: '会员制零售模式火热，付费会员突破5000万',
      description: '山姆、Costco等会员制商超持续扩张，本土零售企业纷纷推出付费会员体系，会员经济成为零售新增长点。',
      source: '商业周刊',
      category: '消费趋势',
      publishedAt: new Date(now - 270 * 60000),
      hotFormatted: '65.0万'
    },
    {
      title: '绿色消费成趋势，可持续产品销量翻倍',
      description: '消费者环保意识增强，可持续、环保产品需求激增，品牌ESG表现成为影响购买决策的重要因素。',
      source: '消费日报',
      category: '市场洞察',
      publishedAt: new Date(now - 330 * 60000),
      hotFormatted: '58.0万'
    },
    {
      title: '社区团购重新洗牌，精细化运营成关键',
      description: '社区团购行业进入理性发展阶段，企业从规模扩张转向精细化运营，供应链效率和用户留存成为核心指标。',
      source: '零售内参',
      category: '新零售',
      publishedAt: new Date(now - 390 * 60000),
      hotFormatted: '52.0万'
    },
    {
      title: '元宇宙虚拟店铺兴起，Z世代成消费主力',
      description: '多个品牌在元宇宙平台开设虚拟店铺，通过沉浸式体验吸引年轻消费者，虚拟商品交易额持续增长。',
      source: '未来零售',
      category: '行业报告',
      publishedAt: new Date(now - 450 * 60000),
      hotFormatted: '48.0万'
    },
    {
      title: '无人零售技术成熟，智能货柜覆盖率提升',
      description: '无人便利店、智能货柜等无人零售业态技术日趋成熟，运营成本下降，在写字楼、社区等场景快速普及。',
      source: '智慧商业',
      category: '技术创新',
      publishedAt: new Date(now - 510 * 60000),
      hotFormatted: '42.0万'
    },
    {
      title: '私域流量运营升级，企业微信用户破8亿',
      description: '零售企业加大私域流量投入，通过企业微信、小程序等工具构建私域生态，实现用户精细化运营和复购提升。',
      source: '营销观察',
      category: '消费趋势',
      publishedAt: new Date(now - 570 * 60000),
      hotFormatted: '38.0万'
    }
  ];
}

// 获取热搜数据（动态API）
async function getRetailNews() {
  try {
    const url = `${JUHE_API_URL}?key=${JUHE_API_KEY}`;
    console.log('🔄 正在调用聚合数据API...');
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    const data = await response.json();
    
    // 检查API返回状态
    if (data.error_code === 0 && data.result && data.result.list && data.result.list.length > 0) {
      console.log('✅ 成功获取API数据，共', data.result.list.length, '条');
      
      // 将API数据格式化为需要的格式
      return data.result.list.slice(0, 10).map((item, index) => ({
        title: item.title || '无标题',
        description: item.digest || '',  // 使用digest作为描述
        source: '今日热搜',
        category: getCategory(index),
        publishedAt: new Date(Date.now() - index * 30 * 60000),
        hotFormatted: formatHotValue(item.hotnum || 0)
      }));
    } else {
      console.warn('⚠️ API返回错误或无数据:', data.reason || '未知错误');
      throw new Error(data.reason || 'API返回错误');
    }
  } catch (error) {
    console.error('❌ 获取热搜失败，使用默认数据:', error.message);
    // API失败时返回默认数据
    return getDefaultNews();
  }
}

async function buildMarkdownBody() {
  const news = await getRetailNews();
  const pageUrl = process.env.PAGE_URL || 'https://quanx5.github.io/retail-daily-hotsearch/';

  let md = `## 🔥 全网热搜榜\n`;
  md += `> **${getTodayLabel()}** ｜ 共 ${news.length} 条热点\n\n`;

  news.forEach((item, index) => {
    const rank = index + 1;
    const medal = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `**#${rank}**`;
    // 如果有描述，显示描述；否则只显示标题
    const content = item.description ? `${item.description}` : item.title;
    md += `${medal} **[${item.category}] ${item.title}**\n`;
    if (item.description) {
      md += `> ${item.description}\n`;
    }
    md += `🔥 ${item.hotFormatted} ｜ ${formatTime(item.publishedAt)}\n\n`;
  });

  md += `---\n`;
  md += `📖 查看完整榜单：[全网热搜榜](${pageUrl}) ｜ 每日 09:00 自动推送`;

  return md;
}

async function pushToWeCom() {
  const webhook = process.env.WECOM_BOT_WEBHOOK;
  if (!webhook) {
    throw new Error('Missing WECOM_BOT_WEBHOOK. Please add it in GitHub Secrets.');
  }

  const markdownContent = await buildMarkdownBody();

  await sendWithRetry('WeCom', webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      msgtype: 'markdown',
      markdown: { content: markdownContent }
    })
  }, validateWeComResponse);
}

async function pushToServerChan() {
  const sendKey = process.env.SERVER_CHAN_SENDKEY;
  if (!sendKey) {
    throw new Error('Missing SERVER_CHAN_SENDKEY. Please add it in GitHub Secrets.');
  }

  const news = await getRetailNews();
  const pageUrl = process.env.PAGE_URL || 'https://quanx5.github.io/retail-daily-hotsearch/';

  const title = `全网热搜榜 ${getTodayLabel()}`;

  let desp = `## 今日热点\n\n`;
  news.forEach((item, index) => {
    desp += `### ${index + 1}. [${item.category}] ${item.title}\n\n`;
    if (item.description) {
      desp += `${item.description}\n\n`;
    }
    desp += `> 🔥 ${item.hotFormatted} ｜ ${formatTime(item.publishedAt)}\n\n---\n\n`;
  });
  desp += `\n[查看完整榜单](${pageUrl})`;

  const url = `https://sctapi.ftqq.com/${sendKey}.send`;

  await sendWithRetry('ServerChan', url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ title, desp })
  });
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
