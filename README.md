# wertherlab

维特404 的个人主页。

## 这是什么

一个静态站，没有构建步骤、没有依赖、没有任何后端。丢到任何一个能放静态文件的地方就能开。

- `index.html` —— 首页（含照片墙 / 大事记入口 / 涌泉录 / 小v）
- `pages/milestones.html` —— 项目总览
- `pages/diary.html` —— 十七岁的日记（带口令门）

## 怎么改内容

**不用碰 HTML。**

### 加一张照片

1. 把图片放进 `assets/img/`（建议长边压到 1800px 以内）
2. 打开 `assets/data/photos.json`，照着现有格式加一条：

```json
{ "file": "photo7.jpg", "title": "这里写标题", "alt": "给看不见图的人", "size": "wide", "date": "" }
```

`size` 可以填 `wide` / `tall` / `panorama`，决定它在版面里占多宽。

### 加一首诗

打开 `assets/data/poems.json`，加一条：

```json
{
  "title": "诗名",
  "image": "photo5.jpg",
  "lines": ["第一行，", "第二行。", "第三行。"],
  "date": ""
}
```

`lines` 里一行一个字符串。没有配图就把 `image` 留空。

### 加一个项目

打开 `assets/data/projects.json`，加一条：

```json
{
  "slug": "my-project",
  "name": "项目名",
  "cn": "中文名",
  "status": "进行中",
  "since": "2026-11",
  "summary": "一句话介绍。",
  "tags": ["标签"],
  "highlight": false,
  "timeline": [
    { "date": "11·21", "phase": "阶段", "what": "做了什么", "detail": "细节", "big": false }
  ]
}
```

`big: true` 会让那个节点在时间线上显得更大。

## 日记

`pages/diary.html` 里的数据是**直接写在文件里的**（不走 fetch，这样本地双击也能看）。
要更新日记，得重新生成那一页，或者直接编辑文件里的 `DIARY_DATA`。

口令不存明文，只存 salted SHA-256 的前 16 位，在 `assets/js/main.js` 的 `GATE_HASH`。
改口令：算出 `sha256("werther-404-diary::新口令")` 的前 16 位，替换掉 `GATE_HASH`。

**注意：** 这只是道门，不是加密。静态站挡不住真想看的人。要更严得加后端验证。

## 部署

- **Altare App Hosting**：连这个仓库，静态站运行时，根目录就是仓库根目录
- **GitHub Pages**：仓库 Settings → Pages → 选分支根目录
- **任何静态托管**：把整个目录传上去

## 许可

内容（照片、诗、日记）版权归作者所有，不要转载。
代码部分随便用。
