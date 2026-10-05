# Extension UI Optimizer · 扩展界面优化

An [Obsidian](https://obsidian.md) plugin that makes the plugin settings sidebar your own: attach notes, group entries with icons, and jump straight to any plugin's settings.

[中文说明见下方](#中文说明)

## Features

- **Notes on any plugin** — attach a personal note to a plugin; shown in the manager, on hover in the settings sidebar, and synced into the native "Community plugins" list
- **Grouped, icon-decorated sidebar** — organize plugins into groups in the settings sidebar; each group picks its own icon (40 built-in choices), and plugins with a native icon keep it
- **Quick access to settings** — jump to a plugin's settings in one click, plus right-click for hotkeys, view details, check updates, open the plugin folder, and uninstall
- **Chinese localization** — built-in Chinese names & descriptions for common community plugins, with a toggle between localized and original display
- **Enable / disable with one click** — changes are saved and automatically synced with the [Lazy Loader](https://github.com/running-grass/obsidian-lazy-plugins) plugin so disabled plugins stay disabled after restart
- **Sidebar hiding** — hide plugins from the settings sidebar; they remain manageable in the manager
- **No flicker** — all row operations update the DOM in place and preserve scroll position

## Install

Search for **Extension UI Optimizer** in *Settings → Community plugins*, or see the [Obsidian Community directory](https://community.obsidian.md/plugins/extension-ui-optimizer).

For manual installation, grab `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/icecode825/obsidian-plugin-hub/releases) and place them in `<vault>/.obsidian/plugins/extension-ui-optimizer/`.

## Usage

Open **Settings → Extension UI Optimizer** (or the grid icon in the left ribbon). Hover a sidebar entry to read its note; right-click any plugin row or sidebar item for more actions.

## Notes

- Desktop only (uses Node.js `fs` and Electron APIs).
- No network access; everything runs locally.

---

## 中文说明

一个用来改造 Obsidian 插件界面的插件：让设置侧边栏变成你自己的样子。

### 功能

- **插件备注**：给任意插件写备注，管理中心、侧边栏悬浮、原生第三方插件列表三处同步显示
- **侧边栏美化**：插件按分组显示在设置侧边栏，每组可自定义图标（内置 40 种），插件自带图标优先
- **设置快捷入口**：一键跳转到插件设置；右键还可设置快捷键、查看详情、检查更新、打开插件文件夹、卸载
- **汉化**：内置常见社区插件的中文名称与描述，可在汉化/原生之间一键切换
- **一键启停**：启用/禁用即时生效，并自动同步 Lazy Loader 的启动类型（禁用后重启不会被拉起）
- **侧边栏隐藏**：把插件从设置侧边栏收起（仍可在管理中心管理）
- **无闪烁**：所有行内操作就地更新DOM，保持滚动位置

### 安装

在 *设置 → 第三方插件* 搜索 **Extension UI Optimizer**（已上架 [Obsidian 社区目录](https://community.obsidian.md/plugins/extension-ui-optimizer)）。

手动安装：从 [Releases](https://github.com/icecode825/obsidian-plugin-hub/releases) 下载 `main.js`、`manifest.json`、`styles.css`，放入 `<仓库>/.obsidian/plugins/extension-ui-optimizer/`。

### 使用

打开 *设置 → Extension UI Optimizer*（或左侧栏的网格图标）。侧边栏条目悬浮可看备注；右键任意插件行或侧边栏项有更多操作。

### 说明

- 仅桌面端（使用了 Node.js fs 与 Electron API）
- 不访问网络，全部本地运行
