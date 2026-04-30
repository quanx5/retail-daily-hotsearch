# 零售行业每日热搜 H5 页面

一个专为零售行业打造的每日热搜展示页面，支持一键生成分享图片，并可通过 GitHub Actions 每天自动截图推送到微信/企业微信群。

## 功能特点

- 🛍️ **零售行业专属**：聚焦零售行业热点，涵盖新零售、电商、消费趋势等领域
- 📸 **一键生成图片**：支持将页面导出为高清 PNG，方便分享到微信、朋友圈
- 🔥 **热度排行**：每条热搜显示排名和热度值，直观展示关注度
- 🎨 **专业设计**：商务蓝配色，高级感排版，适合行业分享
- 📱 **响应式布局**：适配手机、平板、电脑
- 🚀 **GitHub Pages 发布**：推送到 GitHub 后自动发布静态页面
- ⏰ **每日自动推送**：每天北京时间 09:00 自动生成图片并推送

## 文件结构

```text
.
├── index.html                              # H5 页面
├── package.json                            # 自动截图/推送依赖
├── scripts/
│   └── generate-and-push.js                # 生成截图并推送微信的脚本
└── .github/
    └── workflows/
        └── daily-retail-hotsearch.yml      # GitHub Pages + 每日推送工作流
```

## 本地使用

直接打开 `index.html` 即可查看页面。

如需在本地测试截图生成：

```bash
npm install
npx playwright install chromium
npm run screenshot
```

截图会生成到：

```text
dist/retail-hotsearch.png
```

## 发布到 GitHub Pages

### 1. 创建 GitHub 仓库

在 GitHub 新建一个仓库，例如：

```text
retail-daily-hotsearch
```

### 2. 上传代码

在本地执行：

```bash
git init
git add .
git commit -m "Add retail daily hotsearch page"
git branch -M main
git remote add origin https://github.com/你的用户名/retail-daily-hotsearch.git
git push -u origin main
```

### 3. 开启 GitHub Pages

进入仓库：

```text
Settings → Pages → Source
```

选择：

```text
GitHub Actions
```

之后每次推送 `main` 分支，工作流会自动发布页面。

## 每天微信推送图片

当前自动化支持两种方式：

1. **企业微信群机器人 Webhook（推荐）**：能直接推送图片到企业微信群。
2. **Server酱**：适合推送到个人微信，但通常是消息通知，不是直接把图片文件发到微信聊天里。

> 如果你说的「我的微信」是个人微信，微信官方没有开放普通个人号直接收图片的稳定接口。最可靠的方式是：
> - 用企业微信群机器人，把自己拉进企业微信群；或
> - 用 Server酱 / PushPlus 等服务推送通知，再打开 GitHub Actions artifact 或页面查看图片。

## 方式一：企业微信群机器人推送图片（推荐）

### 1. 创建企业微信群机器人

在企业微信群中：

```text
右上角群设置 → 群机器人 → 添加机器人 → 复制 Webhook 地址
```

Webhook 类似：

```text
https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 2. 配置 GitHub Secrets

进入 GitHub 仓库：

```text
Settings → Secrets and variables → Actions → New repository secret
```

新增：

| Secret 名称 | 值 |
|---|---|
| `PUSH_CHANNEL` | `wecom` |
| `WECOM_BOT_WEBHOOK` | 你的企业微信群机器人 Webhook |
| `PAGE_URL` | 发布后的 GitHub Pages 地址，例如 `https://你的用户名.github.io/retail-daily-hotsearch/` |

### 3. 测试推送

进入：

```text
Actions → Deploy and Push Daily Retail Hotsearch → Run workflow
```

手动运行一次。成功后，企业微信群会收到当天热搜图片。

### 4. 自动推送时间

工作流默认每天北京时间 **09:00** 执行。

如需改时间，编辑：

```yaml
schedule:
  - cron: '0 1 * * *'
```

GitHub Actions 的 cron 使用 UTC 时间。北京时间 = UTC + 8。

## 方式二：Server酱推送到个人微信

### 1. 获取 SendKey

访问 Server酱：

```text
https://sct.ftqq.com/
```

登录后获取 `SendKey`。

### 2. 配置 GitHub Secrets

| Secret 名称 | 值 |
|---|---|
| `PUSH_CHANNEL` | `serverchan` |
| `SERVER_CHAN_SENDKEY` | 你的 Server酱 SendKey |
| `PAGE_URL` | 发布后的 GitHub Pages 地址 |

### 3. 说明

Server酱更适合给个人微信发文字/Markdown 通知。由于普通个人微信限制，它通常不会像企业微信群机器人那样直接发送图片文件。本项目会生成图片并上传到 GitHub Actions Artifact，你可以在通知中根据页面地址查看内容。

## 自动化脚本说明

`scripts/generate-and-push.js` 支持三种模式：

```bash
npm run screenshot  # 只生成图片
npm run push        # 推送已有 dist/retail-hotsearch.png
npm run daily       # 生成图片并推送
```

环境变量：

| 变量 | 说明 |
|---|---|
| `PUSH_CHANNEL` | 推送渠道：`wecom` 或 `serverchan` |
| `WECOM_BOT_WEBHOOK` | 企业微信群机器人 Webhook |
| `SERVER_CHAN_SENDKEY` | Server酱 SendKey |
| `PAGE_URL` | GitHub Pages 页面地址；不填时脚本会截图本地 `index.html` |

## 分享图片功能

页面内仍保留手动「生成分享图片」按钮：

- 点击「📸 生成分享图片」
- 自动将页面转换成高清 PNG
- 下载到本地后可手动分享至微信、朋友圈、企业群

## 接入真实零售行业数据

目前页面使用示例热搜数据。生产使用可替换为真实接口：

- 聚合数据：https://www.juhe.cn
- 天行数据：https://www.tianapi.com
- 自建后端接口：定时抓取零售行业资讯，并输出 JSON

修改 `index.html` 中的 `getRetailNews()` 函数即可。

## 注意事项

1. **GitHub Actions 定时任务可能有延迟**：通常几分钟到几十分钟不等。
2. **企业微信群机器人图片限制**：图片大小需在微信接口限制内。本项目只截取移动端宽度，通常不会超限。
3. **Secrets 不要写进代码**：Webhook、SendKey 都要放在 GitHub Secrets 中。
4. **普通个人微信限制**：个人微信不提供稳定的直接收图片接口，推荐使用企业微信群机器人方案。

## 后续优化建议

- [ ] 接入真实行业热搜 API
- [ ] 支持不同图片尺寸：朋友圈、公众号首图、群分享长图
- [ ] 添加品牌 Logo 和自定义水印
- [ ] 增加多渠道推送：PushPlus、飞书、钉钉
- [ ] 将历史图片自动归档到 GitHub Pages

## 许可证

MIT License - 可自由使用和修改
