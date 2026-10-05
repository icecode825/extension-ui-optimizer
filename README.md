# Community Extension Hub · 插件管理中心

An [Obsidian](https://obsidian.md) plugin that provides a unified management center for all your community plugins.

[中文说明见下方](#中文说明)

## Features

- **Chinese localization** — built-in Chinese names & descriptions for common community plugins, with a toggle between localized and original display
- **Enable / disable with one click** — changes are saved and automatically synced with the [Lazy Loader](https://github.com/running-grass/obsidian-lazy-plugins) plugin so disabled plugins stay disabled after restart
- **Per-group icons** — organize plugins into groups shown in the settings sidebar; each group can pick its own icon (40 built-in choices); plugins with a native icon keep it
- **Notes** — attach a personal note to any plugin; shown in the manager, on hover in the settings sidebar, and synced into the native "Community plugins" list
- **Sidebar hiding** — hide plugins from the settings sidebar; they remain manageable in the manager (note: they still appear in the native community plugins list page)
- **Context menus** — right-click a plugin (in the manager or the settings sidebar) for: reveal in plugin list, hotkeys, view details (community marketplace), check updates, open plugin folder, uninstall
- **No flicker** — all row operations update the DOM in place and preserve scroll position

## Install

- Community plugins marketplace: *coming after review*
- [BRAT](https://github.com/TfTHacker/obsidian42-brat): add `sss66666666/obsidian-plugin-hub`

### Manual

Pick whichever you prefer — both produce the exact same files in your vault.

**Option A — download the zip (easiest)**

1. Download `plugin-hub.zip` from the [latest release](https://github.com/sss66666666/obsidian-plugin-hub/releases)
2. Unzip it directly into `<vault>/.obsidian/plugins/plugin-hub/`

The archive already contains the three files at its top level, so the result should be:

```
<vault>/.obsidian/plugins/plugin-hub/
├── main.js
├── manifest.json
└── styles.css
```

> If you see a `plugin-hub/plugin-hub/` nesting after unzipping, the archive was extracted into a subfolder — move the three files up one level.

**Option B — download the files individually**

Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/sss66666666/obsidian-plugin-hub/releases) and place them into `<vault>/.obsidian/plugins/plugin-hub/`.

Then enable **Community Extension Hub** under *Settings → Community plugins*.

## Usage

Open **Settings → Community Extension Hub** (or the grid icon in the left ribbon). See the feature list above; right-click any plugin row or sidebar item for more actions.

## Notes

- Desktop only (uses Node.js `fs` and Electron APIs).
- No network access; everything runs locally.

---

## 中文说明

一个为 Obsidian 提供社区插件**统一管理中心**的插件。

### 功能

- **汉化**：内置常见社区插件的中文名称与描述，可在汉化/原生之间一键切换
- **一键启停**：启用/禁用即时生效，并自动同步 Lazy Loader 的启动类型（禁用后重启不会被拉起）
- **分组与图标**：插件按分组显示在设置侧边栏；每组可自定义图标（内置 40 种），插件自带图标优先
- **备注**：给任意插件写备注，管理中心、侧边栏悬浮、原生第三方插件列表三处同步显示
- **侧边栏隐藏**：把插件从设置侧边栏收起（原生第三方插件列表页仍会显示，仅侧边栏隐藏）
- **右键菜单**：右键插件（管理中心或侧边栏）可在插件列表中显示、设置快捷键、查看详情（社区市场）、检查更新、打开插件文件夹、卸载
- **无闪烁**：所有行内操作就地更新 DOM，保持滚动位置

### 安装

- 社区插件市场：审核通过后可用
- BRAT：添加 `sss66666666/obsidian-plugin-hub`

### 手动安装

两种方式任选其一 —— 最终放进仓库的文件完全相同。

**方式一：下载 zip（推荐）**

1. 从 [Releases](https://github.com/sss66666666/obsidian-plugin-hub/releases) 下载 `plugin-hub.zip`
2. 直接解压到 `<仓库>/.obsidian/plugins/plugin-hub/`

压缩包内三个文件已经在根目录，解压后应当是：

```
<仓库>/.obsidian/plugins/plugin-hub/
├── main.js
├── manifest.json
└── styles.css
```

> 如果解压后出现 `plugin-hub/plugin-hub/` 两层嵌套，说明文件多套了一层目录，把三个文件上移一级即可。

**方式二：分别下载三个文件**

从 [Releases](https://github.com/sss66666666/obsidian-plugin-hub/releases) 下载 `main.js`、`manifest.json`、`styles.css`，放入 `<仓库>/.obsidian/plugins/plugin-hub/`。

完成后到 *设置 → 第三方插件* 启用 **插件管理中心**。

### 使用

打开 **设置 → 插件管理中心**（或左侧栏的网格图标）。右键任意插件行或侧边栏项有更多操作。

### 说明

- 仅桌面端（使用了 Node.js fs 与 Electron API）
- 不访问网络，全部本地运行
