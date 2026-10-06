/*
 * 插件管理中心 (Plugin Hub) v1.6
 * - 统一管理社区插件：汉化列表、启用/禁用（同步 Lazy Loader）、右键菜单（更新/打开文件夹/卸载）
 * - 备注：迁移自 Plugins Annotations，可在此编辑；显示在描述区（前缀随编辑框内容），
 *   同步到原生"第三方插件"列表行，并在设置侧边栏悬浮时显示
 * - 分组：设置侧边栏按组归类，支持排序与每组自定义图标（无原生图标的插件显示分组图标）
 * - 隐藏：从设置侧边栏隐藏指定插件（仅侧边栏）
 * - 所有行内操作就地更新 DOM，不重建页面，不闪烁、不跳动
 */

const { Plugin, PluginSettingTab, Setting, Modal, Menu, setIcon } = require('obsidian');
const fs = require('fs');
const path = require('path');

/* ---------------- 内置汉化表 ---------------- */
const ZH = {
	'attachment-management': { name: '附件整理', desc: '自定义笔记附件的存放路径并整理附件链接。' },
	'better-live-preview-image': { name: '图片显示增强', desc: '改进实时预览中的图片对齐与尺寸标记。' },
	'cmdr': { name: 'Commander 命令按钮', desc: '把任意命令添加到标题栏、侧边栏、编辑器菜单等位置。' },
	'dataview': { name: '数据视图 Dataview', desc: '把笔记当作数据库，用查询语句生成列表和表格。' },
	'docx-importer': { name: 'DOCX 导入导出', desc: '把 Word 文档导入为 Markdown，也可导出为 DOCX。' },
	'editing-toolbar': { name: '编辑工具栏', desc: '浮动/固定式格式工具栏，含大量文本处理与 AI 辅助功能。' },
	'excalidraw-extras': { name: '画板辅助', desc: 'Excalidraw 画板的增强配套功能。' },
	'export-img': { name: '导出图片', desc: '把整篇笔记或选区导出为长图片。' },
	'lazy-plugins': { name: '插件延迟加载', desc: '启动时延迟启用插件，加快 Obsidian 打开速度。' },
	'notebook-navigator': { name: '笔记导航器', desc: '双栏文件浏览器，替代默认文件列表，支持标签与快捷方式。' },
	'nutstore-sync': { name: '坚果云同步', desc: '通过 WebDAV 与坚果云同步整个仓库。' },
	'obshare': { name: '分享到飞书', desc: '基于飞书的笔记同步与分享方案。' },
	'obsid-link': { name: '本地链接', desc: '复制/打开 obsid.net 链接，从资源管理器等外部直接打开笔记。' },
	'obsidian-excalidraw-plugin': { name: '画板 Excalidraw', desc: '手绘风白板/画板，支持思维导图、OCR、嵌入笔记。' },
	'obsidian-excel-to-markdown-table': { name: '表格粘贴', desc: '把 Excel/网页表格直接粘贴为 Markdown 表格。' },
	'obsidian-linter': { name: '排版优化 Linter', desc: '按规则自动整理笔记格式（YAML、标题、空行等）。' },
	'obsidian-local-rest-api': { name: 'MCP 服务 (本机 API)', desc: '为 AI 助手提供本机 REST API 与 MCP 接口。' },
	'obsidian-meta-bind-plugin': { name: '交互式元数据', desc: '在笔记里放按钮、输入框、下拉框来编辑笔记属性。' },
	'obsidian-style-settings': { name: '主题微调', desc: '为当前主题、插件 CSS 提供图形化调节面板。' },
	'pixel-perfect-image': { name: '图片编辑', desc: '图片 100% 缩放显示、复制到剪贴板、快速编辑。' },
	'plugins-annotations': { name: '插件备注', desc: '给每个已安装插件添加个人备注。' },
	'pt-popup': { name: '弹窗 (自研)', desc: '赋予指定文字一个弹窗。' },
	'settings-sidebar-organizer': { name: '设置侧边栏分组', desc: '把社区插件设置按文件夹分组、重命名、排序。' },
	'share-note': { name: '发布到网页', desc: '一键把笔记连同主题发布为网页并得到链接。' },
	'templater-obsidian': { name: '模板引擎 Templater', desc: '高级模板：动态日期、光标跳转、脚本自动化。' },
	'extension-ui-optimizer': { name: '插件管理中心', desc: '统一管理插件：汉化、启停、分组、隐藏、备注。' },
	'obsidian-tasks-plugin': { name: 'Tasks', desc: '任务管理：截止日期、重复任务、子任务' },
	'table-editor-obsidian': { name: 'Advanced Tables', desc: '增强表格导航、格式化与编辑' },
	'obsidian-git': { name: 'Git', desc: 'Git 版本控制与自动备份' },
	'calendar': { name: 'Calendar', desc: '日历视图，浏览日记笔记' },
	'obsidian-kanban': { name: 'Kanban', desc: '基于 Markdown 的看板' },
	'copilot': { name: 'Copilot', desc: '在仓库内运行 Claude Code 等 AI 智能体' },
	'realclaudian': { name: 'Claudian', desc: '把 Claude Code 等智能体嵌入仓库协作' },
	'remotely-save': { name: 'Remotely Save', desc: '云同步：S3、Dropbox、WebDAV、OneDrive 等' },
	'obsidian-icon-folder': { name: 'Iconize', desc: '给文件、文件夹和文本添加图标' },
	'quickadd': { name: 'QuickAdd', desc: '快速添加笔记与内容' },
	'omnisearch': { name: 'Omnisearch', desc: '全库智能搜索，支持 PDF 与图片 OCR' },
	'tasknotes': { name: 'TaskNotes', desc: '基于笔记的任务管理，含日历与番茄钟' },
	'obsidian-minimal-settings': { name: 'Minimal Theme Settings', desc: 'Minimal 主题的颜色与字体设置' },
	'obsidian-importer': { name: 'Importer', desc: '从 Notion、Evernote 等导入为 Markdown' },
	'obsidian-outliner': { name: 'Outliner', desc: '像 Workflowy 一样编辑列表' },
	'homepage': { name: 'Homepage', desc: '启动时打开指定笔记或工作区' },
	'smart-connections': { name: 'Smart Connections', desc: 'AI 关联笔记与段落推荐' },
	'recent-files-obsidian': { name: 'Recent Files', desc: '显示最近打开的文件' },
	'tag-wrangler': { name: 'Tag Wrangler', desc: '重命名、合并与管理标签' },
	'obsidian42-brat': { name: 'BRAT', desc: '安装测试版插件' },
	'obsidian-admonition': { name: 'Admonition', desc: '标注块样式内容' },
	'obsidian-livesync': { name: 'Self-hosted LiveSync', desc: '同步到自建服务器的安全方案' },
	'obsidian-day-planner': { name: 'Day Planner', desc: '把任务变成可编辑的日程时间块' },
	'obsidian-mind-map': { name: 'Mind Map', desc: '用 Markmap 把笔记变成思维导图' },
	'advanced-canvas': { name: 'Advanced Canvas', desc: '增强白板：演示、流程图等' },
	'make-md': { name: 'make.md', desc: '无代码数据库与自定义工作区' },
	'obsidian-advanced-slides': { name: 'Advanced Slides', desc: '基于 Markdown 的幻灯片' },
	'pdf-plus': { name: 'PDF++', desc: '最原生的 PDF 标注工具' },
	'periodic-notes': { name: 'Periodic Notes', desc: '管理日记、周记、月记' },
	'highlightr-plugin': { name: 'Highlightr', desc: '美观的高亮配色菜单' },
	'obsidian-advanced-uri': { name: 'Advanced URI', desc: '用 URI 控制一切' },
	'obsidian-latex-suite': { name: 'Latex Suite', desc: '片段补全让 LaTeX 快如手写' },
	'better-word-count': { name: 'Better Word Count', desc: '统计选中文字的字数' },
	'various-complements': { name: 'Various Complements', desc: 'IDE 式自动补全' },
	'obsidian-markmind': { name: 'Markmind', desc: '思维导图、大纲与 PDF 标注（闭源）' },
	'obsidian-spaced-repetition': { name: 'Spaced Repetition', desc: '记忆卡片复习，对抗遗忘曲线' },
	'obsidian-hover-editor': { name: 'Hover Editor', desc: '悬浮预览变身完整编辑器' },
	'obsidian-annotator': { name: 'Annotator', desc: '标注 PDF 与 EPUB' },
	'obsidian-textgenerator-plugin': { name: 'Text Generator', desc: 'AI 生成文本内容' },
	'obsidian-zotero-desktop-connector': { name: 'Zotero Integration', desc: '从 Zotero 插入文献与标注' },
	'obsidian-pandoc': { name: 'Pandoc Plugin', desc: '导出为 DOCX、ePub、PDF 等格式' },
	'image-converter': { name: 'Image Converter', desc: '转换、压缩、裁剪、标注图片' },
	'nldates-obsidian': { name: 'Natural Language Dates', desc: '自然语言生成日期链接' },
	'obsidian-emoji-toolbar': { name: 'Emoji Toolbar', desc: '快速搜索并插入表情' },
	'url-into-selection': { name: 'Paste URL into selection', desc: '粘贴链接到选中文字' },
	'darlal-switcher-plus': { name: 'Quick Switcher++', desc: '增强版快速切换器' },
	'buttons': { name: 'Buttons', desc: '在笔记里创建按钮' },
	'obsidian-hider': { name: 'Hider', desc: '隐藏界面元素' },
	'obsidian-full-calendar': { name: 'Full Calendar', desc: '在仓库内管理日历事件' },
	'obsidian-checklist-plugin': { name: 'Checklist', desc: '汇总所有清单到单一视图' },
	'folder-notes': { name: 'Folder notes', desc: '文件夹笔记，不折叠也能打开' },
	'obsidian-enhancing-export': { name: 'Enhancing Export', desc: '基于 Pandoc 的增强导出' },
	'obsidian-memos': { name: 'Thino', desc: '快速记录随笔，热力图展示' },
	'terminal': { name: 'Terminal', desc: '在 Obsidian 里使用终端' },
	'note-toolbar': { name: 'Note Toolbar', desc: '为笔记添加自定义工具栏' },
	'media-extended': { name: 'Media Extended', desc: '笔记中集成视频音频与时间戳' },
	'obsidian-auto-link-title': { name: 'Auto Link Title', desc: '自动抓取网页链接标题' },
	'breadcrumbs': { name: 'Breadcrumbs', desc: '可视化仓库层级结构' },
	'obsidian-tracker': { name: 'Tracker', desc: '追踪笔记中的数据变化' },
	'oz-image-plugin': { name: 'Image in Editor', desc: '在编辑器内查看图片与 PDF' },
	'easy-typing-obsidian': { name: 'Easy Typing', desc: '打字时自动格式化中英文' },
	'obsidian-banners': { name: 'Banners', desc: '给笔记添加横幅图片' },
	'file-tree-alternative': { name: 'File Tree Alternative', desc: '分栏式替代文件树' },
	'metadata-menu': { name: 'Metadata Menu', desc: '管理笔记元数据字段' },
	'excalibrain': { name: 'ExcaliBrain', desc: '交互式层级思维导图' },
	'better-export-pdf': { name: 'Better Export PDF', desc: '导出 PDF，支持书签与页眉页脚' },
	'mermaid-tools': { name: 'Mermaid Tools', desc: '增强 Mermaid 图表体验' },
	'note-refactor-obsidian': { name: 'Note Refactor', desc: '提取与拆分笔记内容' },
	'obsidian-quiet-outline': { name: 'Quiet Outline', desc: '增强大纲，支持搜索' },
	'datacore': { name: 'Datacore', desc: '更快的响应式查询引擎' },
	'obsidian-5e-statblocks': { name: 'Fantasy Statblocks', desc: '龙与地下城风格怪物图鉴' },
	'obsidian-reminder-plugin': { name: 'Reminder', desc: 'Markdown 待办提醒' },
	'text-extractor': { name: 'Text Extractor', desc: '图片 OCR 与 PDF 文本提取' },
	'pretty-properties': { name: 'Pretty Properties', desc: '美化笔记属性显示' },
	'obsidian-charts': { name: 'Charts', desc: '在笔记里创建交互图表' },
	'obsidian-languagetool-plugin': { name: 'LanguageTool', desc: '语法与拼写检查' },
	'obsidian-leaflet-plugin': { name: 'Leaflet', desc: '笔记中的交互地图' },
	'file-explorer-note-count': { name: 'File Explorer Note Count', desc: '文件列表显示笔记数量' },
	'colored-text': { name: 'Colored Text', desc: '给选中文字上色' },
	'agent-client': { name: 'Agent Client', desc: '对接 Claude Code 等 AI 命令行' },
	'obsidian-dice-roller': { name: 'Dice Roller', desc: '在笔记里掷骰子' },
	'obsidian-custom-frames': { name: 'Custom Frames', desc: '把网页应用变成面板' },
	'obsidian-tagfolder': { name: 'TagFolder', desc: '以文件夹形式展示标签' },
	'readwise-official': { name: 'Readwise Official', desc: '同步 Readwise 高亮' },
	'iconic': { name: 'Iconic', desc: '界面图标与颜色自定义' },
	'code-styler': { name: 'Code Styler', desc: '美化代码块样式' },
	'cmenu-plugin': { name: 'cMenu', desc: '极简格式工具栏' },
	'obsidian-another-quick-switcher': { name: 'Another Quick Switcher', desc: '另一个快速切换器' },
	'obsidian-enhancing-mindmap': { name: 'Enhancing Mindmap', desc: '用 Markdown 编辑思维导图' },
	'colored-tags': { name: 'Colored Tags', desc: '标签着色区分' },
	'obsidian-citation-plugin': { name: 'Citations', desc: '从 Zotero 搜索插入文献' },
	'obsidian-book-search-plugin': { name: 'Book Search', desc: '图书检索与元数据导入' },
	'obsidian-text-format': { name: 'Text Format', desc: '英文大小写格式转换' },
	'find-unlinked-files': { name: 'Find orphaned files', desc: '查找孤立文件与坏链' },
	'obsidian-dictionary-plugin': { name: 'Dictionary', desc: '多语言词典与同义词' },
	'obsidian-file-color': { name: 'File Color', desc: '给文件与文件夹设置颜色' },
	'obsidian-plugin-toc': { name: 'Table of Contents', desc: '生成笔记目录' },
	'multi-column-markdown': { name: 'Multi-Column Markdown', desc: '多栏 Markdown 排版' },
	'supercharged-links-obsidian': { name: 'Supercharged Links', desc: '内链样式随属性变化' },
	'callout-manager': { name: 'Callout Manager', desc: '自定义 Callout 标注块' },
	'drawio-obsidian': { name: 'Diagrams', desc: '创建 Draw.io 图表' },
	'system3-relay': { name: 'Relay', desc: '实时协作与光标共享' },
	'custom-sort': { name: 'Custom File Explorer sorting', desc: '自定义文件排序' },
	'quick-latex': { name: 'Quick Latex', desc: '快速输入 LaTeX' },
	'sheet-plus': { name: 'Sheet Plus', desc: 'Excel 式电子表格' },
	'ink': { name: 'Ink', desc: '手写与绘图' },
	'obsidian-weread-plugin': { name: 'Weread', desc: '微信读书高亮同步' },
	'google-calendar': { name: 'Google Calendar', desc: '对接谷歌日历' },
	'novel-word-count': { name: 'Novel word count', desc: '每个文件的字数统计' },
	'calendarium': { name: 'Calendarium', desc: '自定义架空日历' },
	'meld-encrypt': { name: 'Meld Encrypt', desc: '笔记内容加密' },
	'remember-cursor-position': { name: 'Remember cursor position', desc: '记住光标位置' },
	'longform': { name: 'Longform', desc: '长篇小说写作助手' },
	'google-drive-sync': { name: 'Google Drive Sync', desc: '同步到 Google Drive' },
	'todoist-sync-plugin': { name: 'Todoist Sync', desc: 'Todoist 任务同步' },
	'card-board': { name: 'CardBoard', desc: '任务看板' },
	'pexels-banner': { name: 'Pixel Banner', desc: '自定义横幅图片' },
	'heatmap-calendar': { name: 'Heatmap Calendar', desc: '年度热力图打卡' },
	'smart-composer': { name: 'Smart Composer', desc: 'AI 对话与写作助手' },
	'obsidian-map-view': { name: 'Map View', desc: '笔记地图视图' },
	'obsidian-smart-typography': { name: 'Smart Typography', desc: '智能标点排版' },
	'obsidian-task-progress-bar': { name: 'Task Genius', desc: '任务进度条与高级管理' },
	'mousewheel-image-zoom': { name: 'Mousewheel Image zoom', desc: '滚轮缩放图片' },
	'obsidian-plugin-update-tracker': { name: 'Plugin Update Tracker', desc: '插件更新提醒' },
	'obsidian-kindle-plugin': { name: 'Kindle Highlights', desc: '同步 Kindle 高亮' },
	'quick-explorer': { name: 'Quick Explorer', desc: '标题栏文件操作' },
	'execute-code': { name: 'Execute Code', desc: '在笔记里执行代码' },
	'obsidian-paste-image-rename': { name: 'Paste image rename', desc: '粘贴图片自动重命名' },
	'automatic-table-of-contents': { name: 'Automatic Table Of Contents', desc: '自动生成目录' },
	'pane-relief': { name: 'Pane Relief', desc: '面板历史与导航增强' },
	'obsidian-local-images-plus': { name: 'Local Images Plus', desc: '下载网络图片到本地' },
	'initiative-tracker': { name: 'Initiative Tracker', desc: '跑团先攻追踪器' },
	'obsidian-plantuml': { name: 'PlantUML', desc: '生成 PlantUML 图' },
	'fast-note-sync': { name: 'Fast Note Sync', desc: '多端实时同步与分享' },
	'canvas-mindmap': { name: 'Canvas Mindmap', desc: '白板变思维导图' },
	'webpage-html-export': { name: 'Webpage HTML Export', desc: '导出为 HTML 网页' },
	'oz-clear-unused-images': { name: 'Clear Unused Images', desc: '清理未使用图片' },
	'obsidian-vimrc-support': { name: 'Vimrc Support', desc: '自动加载 Vim 配置' },
};

/* 分组可选图标（Lucide 图标名 -> 中文标签） */
const GROUP_ICONS = {
	'puzzle': '拼图（默认）',
	'palette': '调色板',
	'wrench': '扳手',
	'toolbox': '工具箱',
	'layout-grid': '网格',
	'sparkles': '星光',
	'brush': '画笔',
	'package': '包裹',
	'layers': '图层',
	'download': '下载',
	'upload': '上传',
	'share-2': '分享',
	'cloud': '云朵',
	'file-text': '文档',
	'table': '表格',
	'image': '图片',
	'search': '搜索',
	'archive': '归档',
	'shield': '盾牌',
	'zap': '闪电',
	'globe': '地球',
	'star': '星标',
	'folder': '文件夹',
	'settings': '齿轮',
	'book-open': '书本',
	'clock': '时钟',
	'tag': '标签',
	'link': '链接',
	'bot': '机器人',
	'database': '数据库',
	'eye': '眼睛',
	'pencil': '铅笔',
	'folder-open': '打开文件夹',
	'hard-drive': '硬盘',
	'rocket': '火箭',
	'flame': '火焰',
	'gem': '宝石',
	'feather': '羽毛',
	'compass': '指南针',
	'bell': '铃铛',
};

/* 设置窗口文档内部的样式（styles.css 无法作用到该文档，故运行时注入） */
const MODAL_CSS = [
	'.extension-ui-optimizer-hidden { display: none !important; }',
	'.extension-ui-optimizer-note { color: var(--text-faint); font-size: 12px; margin-top: 2px; }',
	'.extension-ui-optimizer-note-input { resize: vertical; }',
	'.extension-ui-optimizer-count { color: var(--text-faint); font-size: 12px; margin-left: 6px; }',
	'.extension-ui-optimizer-lang-label { margin-right: 6px; font-size: 13px; }',
	'.vertical-tab-header .extension-ui-optimizer-group { margin-top: 2px; padding-top: 0; }',
	'.vertical-tab-header .extension-ui-optimizer-group .vertical-tab-header-group-title { margin: 6px 0 2px 8px; padding: 0; font-size: 11px; font-weight: 600; color: var(--text-faint); }',
	'.vertical-tab-header .extension-ui-optimizer-group:first-of-type { margin-top: 0; }',
	'.extension-ui-optimizer-icon-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; }',
	'.extension-ui-optimizer-icon-cell { display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 6px; cursor: pointer; border: 1px solid transparent; }',
	'.extension-ui-optimizer-icon-cell:hover { background: var(--background-modifier-hover); }',
	'.extension-ui-optimizer-icon-cell.is-active { border-color: var(--interactive-accent); }',
	'.extension-ui-optimizer-icon-swatch { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }',
	'.extension-ui-optimizer-icon-swatch svg { width: 18px; height: 18px; }',
].join('\n');

const DEFAULT_SETTINGS = {
	lang: 'zh',
	hiddenPlugins: [],
	notes: {},
	groups: [],
	pluginGroup: {},
	groupIcons: {},
	groupsMigrated: false,
	notesPrefixed: false,
};

module.exports = class PluginHub extends Plugin {
	async onload() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		await this.migrateExternalData();

		this.tab = new HubTab(this.app, this);
		this.addSettingTab(this.tab);
		this.addRibbonIcon('layout-grid', '插件管理中心', () => this.open());
		this.addCommand({ id: 'open-hub', name: '打开插件管理中心', callback: () => this.open() });
		this.addCommand({ id: 'open-community-tab', name: '打开第三方插件设置页', callback: () => {
			this.app.setting.open();
			this.app.setting.openTabById('community-plugins');
		} });

		this._debounce = null;
		this._settingsObs = null;
		this._settingsObsTarget = null;
		// 设置窗口渲染在独立文档中（isConnected 恒为 false），
		// DOM 挂在 app.setting.modalEl 上，用轮询检测开关、观察器监视内部变化
		this._poll = setInterval(() => this.pollSettings(), 400);
	}

	onunload() {
		clearInterval(this._poll);
		if (this._settingsObs) this._settingsObs.disconnect();
		this.stopRefresher();
		document.querySelectorAll('.extension-ui-optimizer-hidden').forEach((el) => {
			el.classList.remove('extension-ui-optimizer-hidden');
			el.style.removeProperty('display');
		});
		document.querySelectorAll('.extension-ui-optimizer-group').forEach((el) => el.remove());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	open() {
		this.app.setting.open();
		this.app.setting.openTabById('extension-ui-optimizer');
	}

	pluginConfigPath(pid, file) {
		const adapter = this.app.vault.adapter;
		if (!adapter || !adapter.basePath) return null;
		return path.join(adapter.basePath, '.obsidian', 'plugins', pid, file);
	}

	/* 迁移 Plugins Annotations 的备注和 Settings Sidebar Organizer 的分组 */
	async migrateExternalData() {
		let changed = false;

		// 备注：一次性给已有备注加 "# " 前缀（之后以编辑框内容为准，可删）
		if (!this.settings.notesPrefixed) {
			for (const [pid, note] of Object.entries(this.settings.notes || {})) {
				if (note && !note.startsWith('#')) this.settings.notes[pid] = '# ' + note;
			}
			this.settings.notesPrefixed = true;
			changed = true;
		}

		// 备注来源文件（若仍存在）
		try {
			const p = this.pluginConfigPath('plugins-annotations', 'data.json');
			if (p && fs.existsSync(p)) {
				const raw = JSON.parse(fs.readFileSync(p, 'utf-8'));
				for (const [pid, v] of Object.entries(raw.annotations || {})) {
					const note = (v && v.desc) || '';
					if (note && !(pid in this.settings.notes)) {
						this.settings.notes[pid] = '# ' + note;
						changed = true;
					}
				}
			}
		} catch (e) { /* ignore */ }

		// 分组（仅首次迁移，之后以本插件数据为准）
		if (!this.settings.groupsMigrated) {
			try {
				const p = this.pluginConfigPath('settings-sidebar-organizer', 'data.json');
				if (p && fs.existsSync(p)) {
					const raw = JSON.parse(fs.readFileSync(p, 'utf-8'));
					const nameById = {};
					for (const [id, m] of Object.entries(this.app.plugins.manifests || {})) {
						nameById[m.name] = id;
						nameById[id] = id;
					}
					const groups = [];
					const assign = {};
					for (const g of raw.groups || []) {
						if (!g.title) continue;
						groups.push(g.title);
						const ids = new Set();
						for (const it of g.items || []) if (it && it.id) ids.add(it.id);
						for (const kw of String(g.keywords || '').split(',')) {
							const id = nameById[kw.trim()];
							if (id) ids.add(id);
						}
						for (const id of ids) {
							if (id === 'extension-ui-optimizer' || id === 'settings-sidebar-organizer') continue;
							assign[id] = g.title;
						}
					}
					if (groups.length) {
						this.settings.groups = groups;
						this.settings.pluginGroup = assign;
					}
				}
			} catch (e) { /* ignore */ }
			this.settings.groupsMigrated = true;
			changed = true;
		}

		if (changed) await this.saveData(this.settings);
	}

	displayName(pid, originalName) {
		if (this.settings.lang === 'zh' && ZH[pid]) return ZH[pid].name;
		return originalName;
	}

	displayDesc(pid, originalDesc) {
		return (this.settings.lang === 'zh' && ZH[pid]) ? ZH[pid].desc : (originalDesc || '');
	}

	communityManifests() {
		const mans = [];
		for (const [id, m] of Object.entries(this.app.plugins.manifests || {})) {
			if (id === 'extension-ui-optimizer') continue;
			mans.push(m);
		}
		mans.sort((a, b) => this.displayName(a.id, a.name).localeCompare(this.displayName(b.id, b.name), 'zh'));
		return mans;
	}

	/* 判定插件是否处于启用状态：优先查实例表（最可靠），兜底 enabledPlugins */
	isEnabled(id) {
		const pm = this.app.plugins;
		if (pm.plugins && typeof pm.plugins === 'object') return id in pm.plugins;
		if (pm.enabledPlugins && typeof pm.enabledPlugins.has === 'function') return pm.enabledPlugins.has(id);
		return false;
	}

	setEnabled(pid, enabled) {
		const pm = this.app.plugins;
		if (enabled) {
			pm.enablePluginAndSave(pid);
			this.syncLazyLoader(pid, 'short');
		} else {
			pm.disablePluginAndSave(pid);
			this.syncLazyLoader(pid, 'disabled');
		}
	}

	syncLazyLoader(pid, startupType) {
		try {
			const lz = this.app.plugins.plugins['lazy-plugins'];
			if (!lz || !lz.settings) return;
			if (!lz.settings.plugins) lz.settings.plugins = {};
			lz.settings.plugins[pid] = { startupType };
			lz.saveSettings();
		} catch (e) { /* ignore */ }
	}

	/* 从任意元素向上收集整条滚动链 */
	getScrollChain(el) {
		const boxes = [];
		let cur = el;
		let guard = 0;
		while (cur && guard++ < 12) {
			try {
				const st = getComputedStyle(cur);
				if (/(auto|scroll)/.test(st.overflowY) && cur.scrollHeight > cur.clientHeight + 2) boxes.push(cur);
			} catch (e) { /* ignore */ }
			cur = cur.parentElement;
		}
		return boxes;
	}

	/* ---------- 插件右键菜单（管理中心列表行与侧边栏导航项共用） ---------- */
	showPluginMenu(ev, pid) {
		const hidden = (this.settings.hiddenPlugins || []).includes(pid);
		const note = this.settings.notes[pid] || '';
		const menu = new Menu();
		menu.addItem((item) => item
			.setTitle('在插件列表中显示')
			.setIcon('list')
			.onClick(() => {
				const tab = this.app.setting.openTabById('community-plugins');
				if (tab && typeof tab.revealPlugin === 'function') tab.revealPlugin(pid);
			}));
		menu.addItem((item) => item
			.setTitle('快捷键')
			.setIcon('command')
			.onClick(() => {
				const tab = this.app.setting.openTabById('hotkeys');
				if (tab && typeof tab.setQuery === 'function') tab.setQuery(pid);
			}));
		menu.addItem((item) => item
			.setTitle('查看详情')
			.setIcon('info')
			.onClick(() => {
				try {
					const setting = this.app.setting;
					const chain = setting && setting.modalEl ? this.getScrollChain(setting.modalEl) : [];
					const prev = chain.map((el) => el.scrollTop);
					window.open('obsidian://show-plugin?id=' + pid);
					[300, 800, 1500, 2500].forEach((d) => setTimeout(() => {
						chain.forEach((el, i) => { if (prev[i]) el.scrollTop = prev[i]; });
					}, d));
				} catch (e) { /* ignore */ }
			}));
		menu.addSeparator();
		menu.addItem((item) => item
			.setTitle('编辑备注')
			.setIcon('pencil')
			.onClick(() => {
				new NoteModal(this.app, note, async (val) => {
					if (val) this.settings.notes[pid] = val;
					else delete this.settings.notes[pid];
					await this.saveSettings();
					this.applyToSettingsDom();
					if (this.tab) this.tab.display();
				}).open();
			}));
		menu.addItem((item) => item
			.setTitle(hidden ? '取消隐藏（在侧边栏显示）' : '从侧边栏隐藏')
			.setIcon(hidden ? 'eye-off' : 'eye')
			.onClick(async () => {
				if (hidden) this.settings.hiddenPlugins = this.settings.hiddenPlugins.filter((x) => x !== pid);
				else this.settings.hiddenPlugins = [...(this.settings.hiddenPlugins || []), pid];
				await this.saveSettings();
				this.applyToSettingsDom();
				if (this.tab) this.tab.display();
			}));
		menu.addSeparator();
		menu.addItem((item) => item
			.setTitle('检查更新')
			.setIcon('refresh-cw')
			.onClick(() => this.app.plugins.checkForUpdates()));
		menu.addItem((item) => item
			.setTitle('打开插件文件夹')
			.setIcon('folder-open')
			.onClick(() => {
				try {
					require('electron').shell.openPath(this.pluginConfigPath(pid, ''));
				} catch (e) { /* ignore */ }
			}));
		menu.addSeparator();
		menu.addItem((item) => item
			.setTitle('卸载')
			.setIcon('trash-2')
			.onClick(() => {
				new ConfirmModal(this.app, '确定卸载「' + this.displayName(pid, pid) + '」吗？', async () => {
					try {
						await this.app.plugins.uninstallPlugin(pid);
						if (this.tab) this.tab.display();
					} catch (e) { /* ignore */ }
				}).open();
			}));
		menu.showAtMouseEvent(ev);
	}

	/* ---------- 设置窗口轮询与 DOM 增强 ---------- */
	pollSettings() {
		try {
			const setting = this.app.setting;
			if (!setting || !setting.modalEl) return;
			const root = setting.modalEl;
			const open = root.querySelector('.vertical-tab-header') !== null;
			if (open) {
				if (this._settingsObsTarget !== root) {
					if (this._settingsObs) this._settingsObs.disconnect();
					this._settingsObs = new MutationObserver(() => {
						clearTimeout(this._debounce);
						this._debounce = setTimeout(() => this.applyToSettingsDom(), 80);
					});
					this._settingsObs.observe(root, { childList: true, subtree: true });
					// 捕获阶段拦截导航项右键，弹出自定义菜单（阻止原生菜单）
					if (!this._ctxHandler) {
						this._ctxHandler = (ev) => {
							try {
								const item = ev.target.closest('.vertical-tab-nav-item[data-setting-id]');
								if (!item) return;
								const pid = item.getAttribute('data-setting-id');
								if (!pid || !this.app.plugins.manifests[pid]) return; // 核心插件走原生菜单
								ev.preventDefault();
								ev.stopPropagation();
								this.showPluginMenu(ev, pid);
							} catch (e) { /* ignore */ }
						};
					}
					root.addEventListener('contextmenu', this._ctxHandler, true);
					this._settingsObsTarget = root;
				}
				this.applyToSettingsDom();
			} else if (this._settingsObs) {
				this._settingsObs.disconnect();
				root.removeEventListener('contextmenu', this._ctxHandler, true);
				this._settingsObs = null;
				this._settingsObsTarget = null;
			}
		} catch (e) { /* ignore */ }
	}

	applyToSettingsDom() {
		const setting = this.app.setting;
		if (!setting || !setting.modalEl) return;
		const root = setting.modalEl;
		if (!root.querySelector('.vertical-tab-header')) return;
		// 把样式注入设置窗口文档（styles.css 作用不到这里）
		if (!root.querySelector('#extension-ui-optimizer-modal-styles')) {
			const st = document.createElement('style');
			st.id = 'extension-ui-optimizer-modal-styles';
			st.textContent = MODAL_CSS;
			root.appendChild(st);
		}
		const hidden = new Set(this.settings.hiddenPlugins || []);

		// 1. 隐藏左侧导航项
		root.querySelectorAll('.vertical-tab-nav-item[data-setting-id]').forEach((el) => {
			const id = el.getAttribute('data-setting-id');
			if (hidden.has(id)) {
				el.classList.add('extension-ui-optimizer-hidden');
				el.style.display = 'none';
			} else if (el.classList.contains('extension-ui-optimizer-hidden')) {
				el.classList.remove('extension-ui-optimizer-hidden');
				el.style.removeProperty('display');
			}
		});

		// 2. 分组：把社区插件导航项按组归类 + 悬浮备注 + 图标统一
		try {
			this.applyNavGroups(root, hidden);
		} catch (e) { /* ignore */ }

		// 3. 在原生"第三方插件"列表行中同步显示备注
		root.querySelectorAll('[data-plugin-id]').forEach((el) => {
			const id = el.getAttribute('data-plugin-id');
			const note = (this.settings.notes && this.settings.notes[id]) || '';
			const info = el.querySelector('.setting-item-info') || el;
			let noteEl = info.querySelector(':scope > .extension-ui-optimizer-note');
			if (note) {
				if (!noteEl) {
					noteEl = info.createDiv({ cls: 'extension-ui-optimizer-note' });
				}
				if (noteEl.textContent !== note) noteEl.textContent = note;
			} else if (noteEl) {
				noteEl.remove();
			}
		});
	}

	applyNavGroups(root, hidden) {
		const commItems = root.querySelector('.vertical-tab-header-group-items[data-section="community-plugins"]');
		if (!commItems) return;
		const commGroup = commItems.closest('.vertical-tab-header-group');
		if (!commGroup) return;
		const header = commGroup.parentElement;

		const groups = this.settings.groups || [];
		const assign = this.settings.pluginGroup || {};
		const groupIcons = this.settings.groupIcons || {};

		// 确保每个使用中的分组有容器（按 settings 顺序插在社区插件组之后）
		const usedGroups = groups.filter((name) => Object.values(assign).includes(name));
		let anchor = commGroup;
		for (const name of usedGroups) {
			let grp = header.querySelector(`:scope > .extension-ui-optimizer-group[data-hub-group="${CSS.escape(name)}"]`);
			if (!grp) {
				grp = document.createElement('div');
				grp.className = 'vertical-tab-header-group extension-ui-optimizer-group';
				grp.dataset.hubGroup = name;
				const title = document.createElement('div');
				title.className = 'vertical-tab-header-group-title';
				title.textContent = name;
				const itemsDiv = document.createElement('div');
				itemsDiv.className = 'vertical-tab-header-group-items';
				grp.append(title, itemsDiv);
			}
			if (grp.previousElementSibling !== anchor) anchor.after(grp);
			anchor = grp;

			commItems.querySelectorAll(':scope > .vertical-tab-nav-item[data-setting-id]').forEach((el) => {
				const id = el.getAttribute('data-setting-id');
				if (assign[id] === name) grp.querySelector('.vertical-tab-header-group-items').appendChild(el);
			});
		}

		// 归属被删除/改动的项：从 hub 组容器移回社区组
		header.querySelectorAll(':scope > .extension-ui-optimizer-group').forEach((grp) => {
			const gname = grp.dataset.hubGroup;
			grp.querySelectorAll('.vertical-tab-nav-item[data-setting-id]').forEach((el) => {
				const id = el.getAttribute('data-setting-id');
				if (assign[id] !== gname) commItems.appendChild(el);
			});
		});

		// 移除已无成员/已删除的分组容器
		header.querySelectorAll(':scope > .extension-ui-optimizer-group').forEach((grp) => {
			if (!usedGroups.includes(grp.dataset.hubGroup)) grp.remove();
		});

		// 社区组空了就收起标题，否则显示
		const hasUngrouped = commItems.querySelector(':scope > .vertical-tab-nav-item[data-setting-id]') !== null;
		commGroup.style.display = hasUngrouped ? '' : 'none';

		// 悬浮备注 + 图标统一：插件自有图标优先，无原生图标的显示分组图标
		header.querySelectorAll('.vertical-tab-nav-item[data-setting-id]').forEach((el) => {
			const id = el.getAttribute('data-setting-id');
			const note = (this.settings.notes && this.settings.notes[id]) || '';
			if (note) el.title = note; else el.removeAttribute('title');
			if (!this.app.plugins.manifests[id]) return;
			const native = el.querySelector('.vertical-tab-nav-item-icon');
			if (native && native.dataset.hubIcon === undefined) return; // 插件自有图标，优先保留
			const desired = groupIcons[assign[id]] || 'puzzle';
			let wrap = el.querySelector('.vertical-tab-nav-item-icon');
			if (!wrap) {
				wrap = el.createDiv({ cls: 'vertical-tab-nav-item-icon' });
				wrap.dataset.hubIcon = '';
				el.insertBefore(wrap, el.firstChild);
			}
			if (wrap.dataset.hubIcon !== desired) {
				wrap.empty();
				setIcon(wrap, desired);
				wrap.dataset.hubIcon = desired;
			}
		});
	}
};

/* ---------------- 分组图标选择弹窗（纯图标网格） ---------------- */
class IconGridModal extends Modal {
	constructor(app, current, onPick) {
		super(app);
		this.current = current;
		this.onPick = onPick;
	}

	onOpen() {
		this.titleEl.setText('选择分组图标');
		const { contentEl } = this;
		const grid = contentEl.createDiv({ cls: 'extension-ui-optimizer-icon-grid' });
		for (const [icon, label] of Object.entries(GROUP_ICONS)) {
			const cell = grid.createDiv({ cls: 'extension-ui-optimizer-icon-cell' + (icon === this.current ? ' is-active' : '') });
			cell.title = label;
			const sw = cell.createDiv({ cls: 'extension-ui-optimizer-icon-swatch' });
			setIcon(sw, icon);
			cell.addEventListener('click', () => {
				this.onPick(icon);
				this.close();
			});
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}

/* ---------------- 备注编辑弹窗 ---------------- */
class NoteModal extends Modal {
	constructor(app, value, onSave) {
		super(app);
		this.value = value || '';
		this.onSave = onSave;
	}

	onOpen() {
		this.titleEl.setText('编辑备注');
		const { contentEl } = this;
		const input = contentEl.createEl('textarea', { cls: 'extension-ui-optimizer-note-input' });
		input.value = this.value || '# ';
		input.placeholder = '给这个插件写点什么…（# 开头会显示为备注标记）';
		input.rows = 4;
		input.style.width = '100%';
		new Setting(contentEl)
			.addButton((b) => b
				.setButtonText('取消')
				.onClick(() => this.close()))
			.addButton((b) => b
				.setButtonText('保存')
				.setCta()
				.onClick(() => {
					this.onSave(input.value.trim());
					this.close();
				}));
	}

	onClose() {
		this.contentEl.empty();
	}
}

/* ---------------- 确认弹窗 ---------------- */
class ConfirmModal extends Modal {
	constructor(app, title, onConfirm) {
		super(app);
		this.title = title;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		this.titleEl.setText(this.title);
		const { contentEl } = this;
		new Setting(contentEl)
			.addButton((b) => b
				.setButtonText('取消')
				.onClick(() => this.close()))
			.addButton((b) => b
				.setButtonText('确认')
				.setCta()
				.setWarning()
				.onClick(() => {
					this.onConfirm();
					this.close();
				}));
	}

	onClose() {
		this.contentEl.empty();
	}
}

/* ---------------- 设置页（管理中心界面） ---------------- */
class HubTab extends PluginSettingTab {
	constructor(app, plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/* 记录从设置窗口内容区到外层的整条滚动链 */
	getScrollChain(el) {
		const boxes = [];
		let cur = el;
		let guard = 0;
		while (cur && guard++ < 12) {
			try {
				const st = getComputedStyle(cur);
				if (/(auto|scroll)/.test(st.overflowY) && cur.scrollHeight > cur.clientHeight + 2) boxes.push(cur);
			} catch (e) { /* ignore */ }
			cur = cur.parentElement;
		}
		return boxes;
	}

	display() {
		const { containerEl } = this;
		const p = this.plugin;
		// 保留滚动位置（沿滚动链全部记录，任何操作后都不跳位置）
		const scrollChain = this.getScrollChain(containerEl);
		const prevScrolls = scrollChain.map((el) => el.scrollTop);

		containerEl.empty();
		this.stopRefresher();

		/* 分组管理 */
		containerEl.createEl('h3', { text: '分组管理' });
		const groupSection = containerEl.createDiv();
		this.renderGroups(groupSection);

		const listHeading = new Setting(containerEl)
			.setName('全部社区插件')
			.setClass('extension-ui-optimizer-list-heading')
			.setHeading()
			.addToggle((t) => t
				.setValue(p.settings.lang === 'zh')
				.setTooltip('汉化：内置下载量 Top 150 的热门插件中文名称与描述（第 150 名也有 15 万+ 下载）。开 = 汉化，关 = 原生')
				.onChange(async (v) => {
					p.settings.lang = v ? 'zh' : 'original';
					await p.saveSettings();
					for (const ref of this.rowRefs || []) ref.refreshNameDesc();
				}));
		const langLabel = listHeading.controlEl.createSpan({ cls: 'extension-ui-optimizer-lang-label' });
		langLabel.setText('汉化');
		listHeading.controlEl.insertBefore(langLabel, listHeading.controlEl.firstChild);
		this.toggleRefs = [];
		this.rowRefs = [];

		const pm = this.app.plugins;
		for (const m of p.communityManifests()) {
			const enabled = p.isEnabled(m.id);

			const desc = p.displayDesc(m.id, m.description || '');
			const hidden = (p.settings.hiddenPlugins || []).includes(m.id);

			const row = new Setting(containerEl)
				.setName(p.displayName(m.id, m.name))
				.setDesc(desc + (m.version ? `　· v${m.version}` : '') + (hidden ? '　· 已从侧边栏隐藏' : ''));

			// 备注独立一行显示（灰色小字）
			const renderNote = () => {
				row.descEl.querySelector('.extension-ui-optimizer-note')?.remove();
				const noteNow = p.settings.notes[m.id] || '';
				if (noteNow) {
					const noteEl = row.descEl.createDiv({ cls: 'extension-ui-optimizer-note' });
					noteEl.setText(noteNow);
					row.nameEl.title = noteNow;
				} else {
					row.nameEl.removeAttribute('title');
				}
			};
			renderNote();

			// 名称/描述/备注就地刷新（切语言、隐藏状态变化时用，不重建页面）
			const refreshNameDesc = () => {
				const hid = (p.settings.hiddenPlugins || []).includes(m.id);
				row.setName(p.displayName(m.id, m.name));
				row.setDesc(p.displayDesc(m.id, m.description || '') + (m.version ? `　· v${m.version}` : '') + (hid ? '　· 已从侧边栏隐藏' : ''));
				renderNote();
			};
			this.rowRefs.push({ m, refreshNameDesc });

			// 行内刷新（隐藏状态变化时用，避免整页重建闪烁）
			let eyeBtn;
			const refreshRow = () => {
				const hiddenNow = (p.settings.hiddenPlugins || []).includes(m.id);
				refreshNameDesc();
				if (eyeBtn) {
					eyeBtn.setIcon(hiddenNow ? 'eye-off' : 'eye');
					eyeBtn.setTooltip(hiddenNow ? '取消隐藏（在侧边栏显示）' : '从侧边栏隐藏');
				}
			};

			// 右键菜单：与侧边栏导航项共用
			if (row.settingEl) row.settingEl.addEventListener('contextmenu', (ev) => {
				ev.preventDefault();
				p.showPluginMenu(ev, m.id);
			});

			row.addButton((b) => b
				.setIcon('pencil')
				.setTooltip('编辑备注')
				.onClick(() => {
					new NoteModal(this.app, p.settings.notes[m.id], async (val) => {
						if (val) p.settings.notes[m.id] = val;
						else delete p.settings.notes[m.id];
						await p.saveSettings();
						p.applyToSettingsDom();
						refreshRow();
					}).open();
				}));

			row.addButton((b) => {
				eyeBtn = b;
				return b
					.setIcon(hidden ? 'eye-off' : 'eye')
					.setTooltip(hidden ? '取消隐藏（在侧边栏显示）' : '从侧边栏隐藏')
					.onClick(async () => {
						const nowHidden = (p.settings.hiddenPlugins || []).includes(m.id);
						if (nowHidden) p.settings.hiddenPlugins = p.settings.hiddenPlugins.filter((x) => x !== m.id);
						else p.settings.hiddenPlugins = [...(p.settings.hiddenPlugins || []), m.id];
						await p.saveSettings();
						p.applyToSettingsDom();
						refreshRow();
					});
			});

			// 分组下拉（归组后侧边栏即时变化，行内无需重建）
			row.addDropdown((d) => {
				d.addOption('', '未分组');
				for (const g of p.settings.groups || []) d.addOption(g, g);
				d.setValue(p.settings.pluginGroup[m.id] || '');
				d.onChange(async (v) => {
					if (v) p.settings.pluginGroup[m.id] = v;
					else delete p.settings.pluginGroup[m.id];
					await p.saveSettings();
					p.applyToSettingsDom();
				});
			});

			row.addToggle((t) => t
				.setValue(enabled)
				.setTooltip('启用/禁用')
				.onChange(async (v) => {
					p.setEnabled(m.id, v);
					// 开关状态由本行点击即时正确，无需重建页面
				}));

			this.toggleRefs.push({
				id: m.id,
				el: row.controlEl ? row.controlEl.querySelector('.checkbox-container') : null,
			});
		}

		/* 每 1.5 秒校准一次开关显示状态（只改 DOM，不触发 onChange） */
		this.startRefresher();

		const footer = containerEl.createEl('p', { cls: 'setting-item-description' });
		footer.setText('提示：在这里禁用的插件会同时被 Lazy Loader 记为“禁用”，重启后不会被自动拉起；右键插件行或侧边栏项有卸载、更新、打开文件夹等更多操作。');

		// 让"全部社区插件"标题与"分组管理"h3 的字重字号完全一致（内联样式，所见即所得）
		const syncHeading = () => {
			try {
				const h3 = containerEl.querySelector('h3');
				const nameEl = containerEl.querySelector('.extension-ui-optimizer-list-heading .setting-item-name');
				if (h3 && nameEl) {
					const cs = getComputedStyle(h3);
					nameEl.style.fontWeight = cs.fontWeight;
					nameEl.style.fontSize = cs.fontSize;
					nameEl.style.letterSpacing = cs.letterSpacing;
				}
			} catch (e) { /* ignore */ }
		};

		// 恢复滚动位置 + 标题样式校准（多次尝试，覆盖 Obsidian 自身延迟重渲染）
		[0, 120, 400, 900].forEach((delay) => {
			setTimeout(() => {
				scrollChain.forEach((el, i) => {
					if (prevScrolls[i]) el.scrollTop = prevScrolls[i];
				});
				syncHeading();
			}, delay);
		});
	}

	/* 分组管理区（独立重建，不影响下方插件列表） */
	renderGroups(section) {
		const p = this.plugin;
		section.empty();

		new Setting(section)
			.setName('新增分组')
			.setDesc('分组会显示在设置侧边栏里，把下方列表中的插件用下拉框归入即可。没有原生图标的插件会显示分组的图标。')
			.addText((t) => {
				this._newGroupInput = t;
				t.setPlaceholder('新分组名称');
			})
			.addButton((b) => b
				.setButtonText('添加')
				.setCta()
				.onClick(async () => {
					const name = (this._newGroupInput && this._newGroupInput.getValue() || '').trim();
					if (!name) return;
					if (!p.settings.groups.includes(name)) p.settings.groups.push(name);
					await p.saveSettings();
					p.applyToSettingsDom();
					this.renderGroups(section);
				}));

		const groups = p.settings.groups || [];
		groups.forEach((name, idx) => {
			const count = Object.values(p.settings.pluginGroup || {}).filter((g) => g === name).length;
			const groupRow = new Setting(section)
				.setName(name)
				.addExtraButton((b) => b
					.setIcon(p.settings.groupIcons[name] || 'puzzle')
					.setTooltip('分组图标（点击更换）')
					.onClick(() => {
						new IconGridModal(this.app, p.settings.groupIcons[name] || 'puzzle', async (v) => {
							p.settings.groupIcons[name] = v;
							await p.saveSettings();
							p.applyToSettingsDom();
							this.renderGroups(section);
						}).open();
					}))
				.addExtraButton((b) => b
					.setIcon('arrow-up')
					.setTooltip('上移分组')
					.setDisabled(idx === 0)
					.onClick(async () => {
						const g = p.settings.groups;
						[g[idx - 1], g[idx]] = [g[idx], g[idx - 1]];
						await p.saveSettings();
						p.applyToSettingsDom();
						this.renderGroups(section);
					}))
				.addExtraButton((b) => b
					.setIcon('arrow-down')
					.setTooltip('下移分组')
					.setDisabled(idx === groups.length - 1)
					.onClick(async () => {
						const g = p.settings.groups;
						[g[idx + 1], g[idx]] = [g[idx], g[idx + 1]];
						await p.saveSettings();
						p.applyToSettingsDom();
						this.renderGroups(section);
					}))
				.addExtraButton((b) => b
					.setIcon('trash')
					.setTooltip('删除分组（插件回到未分组）')
					.onClick(async () => {
						p.settings.groups = p.settings.groups.filter((g) => g !== name);
						for (const [pid, g] of Object.entries(p.settings.pluginGroup)) {
							if (g === name) delete p.settings.pluginGroup[pid];
						}
						await p.saveSettings();
						p.applyToSettingsDom();
						this.renderGroups(section);
					}));
			const countSpan = groupRow.nameEl.createSpan({ cls: 'extension-ui-optimizer-count' });
			countSpan.setText('· ' + count);
		});
	}

	stopRefresher() {
		if (this._refresher) { clearInterval(this._refresher); this._refresher = null; }
	}

	startRefresher() {
		this.stopRefresher();
		this._refresher = setInterval(() => {
			if (!this.containerEl || !this.containerEl.isConnected) return;
			for (const ref of this.toggleRefs || []) {
				try {
					if (!ref.el) continue;
					const on = this.plugin.isEnabled(ref.id);
					if (ref.el.classList.contains('is-enabled') === on) continue;
					ref.el.classList.toggle('is-enabled', on);
					const input = ref.el.querySelector('input[type="checkbox"]');
					if (input) input.checked = on;
				} catch (e) { /* ignore */ }
			}
		}, 1500);
	}
}

/* nosourcemap */
/* nosourcemap */