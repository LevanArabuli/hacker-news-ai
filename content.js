;(() => {
	const Theme = Object.freeze({
		LIGHT: 'light',
		DARK: 'dark',
	})

	const Selectors = Object.freeze({
		storyRow: 'tr.athing',
		titleLine: '.titleline',
		commentRow: 'tr.athing.comtr',
		commentTree: '.comment-tree',
		score: '.score',
		commentsLink: 'a',
		toggle: '.togg',
		user: '.hnuser',
		commentText: '.commtext',
		commentHeader: '.comhead',
		commentAge: '.age',
		indentImg: '.ind img',
	})

	const StyleIds = Object.freeze({
		stories: 'hn-highlight-styles',
		comments: 'hn-comment-highlight-styles',
	})

	const RetryDefaults = Object.freeze({
		attempts: 3,
		delayMs: 400,
	})

	const StoryHighlightStyles = `
		.hn-top-upvotes td {
			background: linear-gradient(90deg, rgba(255, 165, 0, 0.25) 0%, transparent 100%) !important;
		}
		.hn-top-upvotes .titleline a {
			color: #d4740c !important;
			font-weight: bold;
		}
		.dark-theme .hn-top-upvotes td {
			background: linear-gradient(90deg, rgba(255, 200, 100, 0.2) 0%, transparent 100%) !important;
		}
		.dark-theme .hn-top-upvotes .titleline a {
			color: cyan !important;
		}
		.hn-top-comments td {
			background: linear-gradient(90deg, rgba(74, 144, 226, 0.25) 0%, transparent 100%) !important;
		}
		.hn-top-comments .titleline a {
			color: #2563eb !important;
			font-weight: bold;
		}
		.dark-theme .hn-top-comments td {
			background: linear-gradient(90deg, rgba(100, 180, 255, 0.15) 0%, transparent 100%) !important;
		}
		.dark-theme .hn-top-comments .titleline a {
			color: #7dd3fc !important;
		}
		.hn-hottest td {
			background: linear-gradient(90deg, rgba(168, 85, 247, 0.35) 0%, transparent 100%) !important;
		}
		.hn-hottest .titleline a {
			color: #7c3aed !important;
			font-weight: bold;
		}
		.dark-theme .hn-hottest td {
			background: linear-gradient(90deg, rgba(200, 150, 255, 0.2) 0%, transparent 100%) !important;
		}
		.dark-theme .hn-hottest .titleline a {
			color: #d8b4fe !important;
		}
		.hn-badge {
			display: inline-block;
			font-size: 9px;
			padding: 1px 5px;
			border-radius: 3px;
			margin-left: 6px;
			font-weight: bold;
			vertical-align: middle;
		}
		.hn-badge-upvotes {
			background: #f97316;
			color: white;
		}
		.hn-badge-comments {
			background: #3b82f6;
			color: white;
		}
		.hn-badge-hottest {
			background: #8b5cf6;
			color: white;
		}
	`

	const CommentHighlightStyles = `
		.hn-top-comment {
			position: relative;
		}
		.hn-top-comment > td {
			background: linear-gradient(90deg, rgba(255, 165, 0, 0.15) 0%, transparent 60%) !important;
		}
		.dark-theme .hn-top-comment > td {
			background: linear-gradient(90deg, rgba(255, 165, 0, 0.2) 0%, transparent 60%) !important;
		}
		.hn-comment-badge {
			display: inline-block;
			font-size: 9px;
			padding: 1px 5px;
			border-radius: 3px;
			margin-left: 6px;
			font-weight: bold;
			vertical-align: middle;
		}
		.hn-comment-badge-gold {
			background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
			color: #1a1a1a;
		}
		.hn-comment-badge-silver {
			background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
			color: #1a1a1a;
		}
		.hn-comment-badge-bronze {
			background: linear-gradient(135deg, #cd7f32 0%, #a0522d 100%);
			color: white;
		}
		.hn-top-comments-nav {
			background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%);
			border: 1px solid #ffcccc;
			border-radius: 8px;
			padding: 12px 16px;
			margin: 12px 0;
			font-size: 13px;
		}
		.dark-theme .hn-top-comments-nav {
			background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
			border-color: #0f3460;
		}
		.hn-top-comments-nav-title {
			font-weight: bold;
			color: #ff6600;
			margin-bottom: 8px;
			font-size: 12px;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}
		.dark-theme .hn-top-comments-nav-title {
			color: #cf6679;
		}
		.hn-top-comments-nav-list {
			display: flex;
			flex-direction: column;
			gap: 6px;
		}
		.hn-top-comments-nav-item {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 6px 10px;
			background: rgba(0, 0, 0, 0.03);
			border-radius: 4px;
			cursor: pointer;
			transition: background 0.2s;
			text-decoration: none;
			color: #666;
		}
		.dark-theme .hn-top-comments-nav-item {
			background: rgba(255, 255, 255, 0.05);
			color: #a0a0a0;
		}
		.hn-top-comments-nav-item:hover {
			background: rgba(0, 0, 0, 0.08);
			color: #333;
		}
		.dark-theme .hn-top-comments-nav-item:hover {
			background: rgba(255, 255, 255, 0.1);
			color: #ffffff;
		}
		.hn-top-comments-nav-item:visited {
			color: #666;
		}
		.dark-theme .hn-top-comments-nav-item:visited {
			color: #a0a0a0;
		}
		.hn-nav-medal {
			font-size: 14px;
		}
		.hn-nav-author {
			font-weight: 600;
			color: #ff6600;
		}
		.dark-theme .hn-nav-author {
			color: #4da8da;
		}
		.hn-nav-replies {
			color: #888;
			font-size: 11px;
		}
		.hn-nav-preview {
			color: #999;
			font-size: 11px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 400px;
		}
		.dark-theme .hn-nav-preview {
			color: #666;
		}
	`

	class ThemeService {
		constructor(root = document.documentElement) {
			this.root = root
		}

		apply(theme) {
			this.root.classList.toggle('dark-theme', theme === Theme.DARK)
		}
	}

	class StyleInjector {
		ensure(id, cssText) {
			if (document.getElementById(id)) return
			const style = document.createElement('style')
			style.id = id
			style.textContent = cssText
			document.head.appendChild(style)
		}
	}

	class StoryHighlighter {
		constructor(styleInjector) {
			this.styleInjector = styleInjector
		}

		highlightTopStories() {
			const storyRows = Array.from(document.querySelectorAll(Selectors.storyRow))
			const titleRows = storyRows.filter((row) => row.querySelector(Selectors.titleLine))
			if (titleRows.length < 5) return false

			this.styleInjector.ensure(StyleIds.stories, StoryHighlightStyles)
			this.resetStoryMarks()

			const stories = titleRows.map((titleRow) => this.buildStory(titleRow))
			const sortedByUpvotes = [...stories].sort((a, b) => b.points - a.points)
			const hottestTitle = sortedByUpvotes[0]?.titleRow
			const topByUpvotes = sortedByUpvotes.slice(1, 6).map((s) => s.titleRow)

			const topByComments = [...stories]
				.sort((a, b) => b.comments - a.comments)
				.slice(0, 5)
				.map((s) => s.titleRow)

			stories.forEach(({ titleRow, subtextRow }) => {
				const isHottest = titleRow === hottestTitle
				const hasUpvotes = topByUpvotes.includes(titleRow)
				const hasComments = topByComments.includes(titleRow)

				if (isHottest) {
					this.addStoryHighlight(titleRow, subtextRow, 'hn-hottest', 'hottest')
				} else if (hasUpvotes) {
					this.addStoryHighlight(titleRow, subtextRow, 'hn-top-upvotes', 'upvotes')
				}

				if (hasComments && !isHottest) {
					this.addStoryHighlight(titleRow, subtextRow, 'hn-top-comments', 'comments')
				}
			})

			return true
		}

		resetStoryMarks() {
			document.querySelectorAll('.hn-top-upvotes, .hn-top-comments, .hn-hottest').forEach((el) => {
				el.classList.remove('hn-top-upvotes', 'hn-top-comments', 'hn-hottest')
			})
			document.querySelectorAll('.hn-badge').forEach((el) => el.remove())
		}

		buildStory(titleRow) {
			const subtextRow = titleRow.nextElementSibling
			return {
				titleRow,
				subtextRow,
				points: this.extractPoints(subtextRow),
				comments: this.extractComments(subtextRow),
			}
		}

		extractPoints(subtextRow) {
			const scoreSpan = subtextRow?.querySelector(Selectors.score)
			if (!scoreSpan) return 0
			const match = scoreSpan.textContent.match(/(\d+)/)
			return match ? parseInt(match[1], 10) : 0
		}

		extractComments(subtextRow) {
			if (!subtextRow) return 0
			const links = subtextRow.querySelectorAll(Selectors.commentsLink)
			for (const link of links) {
				const match = link.textContent.match(/(\d+)\s*comment/)
				if (match) return parseInt(match[1], 10)
			}
			return 0
		}

		addStoryHighlight(titleRow, subtextRow, highlightClass, badgeType) {
			titleRow.classList.add(highlightClass)
			subtextRow?.classList.add(highlightClass)
			this.addBadge(titleRow, badgeType)
		}

		addBadge(titleRow, type) {
			const titleLine = titleRow.querySelector(Selectors.titleLine)
			if (!titleLine) return

			const badge = document.createElement('span')
			badge.className = 'hn-badge'

			if (type === 'hottest') {
				badge.classList.add('hn-badge-hottest')
				badge.textContent = '🔥 HOTTEST'
			} else if (type === 'upvotes') {
				badge.classList.add('hn-badge-upvotes')
				badge.textContent = '⬆ TOP 5'
			} else {
				badge.classList.add('hn-badge-comments')
				badge.textContent = '💬 TOP 5'
			}

			titleLine.appendChild(badge)
		}
	}

	class CommentHighlighter {
		constructor(styleInjector) {
			this.styleInjector = styleInjector
			this.medals = ['🥇', '🥈', '🥉']
		}

		highlightTopComments() {
			const commentRows = Array.from(document.querySelectorAll(Selectors.commentRow))
			if (commentRows.length < 3) return false

			this.styleInjector.ensure(StyleIds.comments, CommentHighlightStyles)
			this.resetCommentMarks()

			const comments = commentRows.map((row) => this.buildComment(row))
			const topComments = comments
				.sort((a, b) => b.replyCount - a.replyCount)
				.slice(0, 3)
				.filter((comment) => comment.replyCount > 0)

			if (topComments.length === 0) return false

			this.collapseRootComments()
			topComments.forEach((comment) => this.expandComment(comment.row))

			const nav = this.createNavigation(topComments)
			this.insertNavigation(nav)

			topComments.forEach((comment, index) => this.applyCommentHighlight(comment, index))

			return true
		}

		resetCommentMarks() {
			document.querySelectorAll('.hn-top-comment').forEach((el) => el.classList.remove('hn-top-comment'))
			document.querySelectorAll('.hn-comment-badge').forEach((el) => el.remove())
			document.querySelectorAll('.hn-top-comments-nav').forEach((el) => el.remove())
		}

		buildComment(row) {
			return {
				row,
				replyCount: this.extractReplyCount(row),
				author: this.extractAuthor(row),
				preview: this.extractPreview(row),
			}
		}

		extractReplyCount(row) {
			const toggleButton = row.querySelector(Selectors.toggle)
			const replyCount = toggleButton?.getAttribute('n')
			return replyCount ? parseInt(replyCount, 10) : 0
		}

		extractAuthor(row) {
			const link = row.querySelector(Selectors.user)
			return link?.textContent ?? ''
		}

		extractPreview(row) {
			const text = row.querySelector(Selectors.commentText)?.textContent ?? ''
			if (!text) return ''
			const preview = text.trim().slice(0, 80)
			return text.length > 80 ? `${preview}...` : preview
		}

		collapseRootComments() {
			document.querySelectorAll(Selectors.commentRow).forEach((comment) => {
				const indentImg = comment.querySelector(Selectors.indentImg)
				const indentWidth = indentImg ? parseInt(indentImg.getAttribute('width') || '0', 10) : 0

				if (indentWidth === 0) {
					const toggle = comment.querySelector(Selectors.toggle)
					if (toggle && !toggle.classList.contains('c')) {
						toggle.click()
					}
				}
			})
		}

		expandComment(commentRow) {
			const toggle = commentRow.querySelector(Selectors.toggle)
			if (toggle && toggle.classList.contains('c')) {
				toggle.click()
			}
		}

		createNavigation(topComments) {
			const nav = document.createElement('div')
			nav.className = 'hn-top-comments-nav'
			nav.innerHTML = `
				<div class="hn-top-comments-nav-title">🔥 Most Discussed Comments</div>
				<div class="hn-top-comments-nav-list"></div>
			`

			const navList = nav.querySelector('.hn-top-comments-nav-list')
			topComments.forEach((comment, index) => {
				const navItem = this.createNavItem(comment, index)
				navList?.appendChild(navItem)
			})

			return nav
		}

		createNavItem(comment, index) {
			const originalId = comment.row.id
			const navItem = document.createElement('a')
			navItem.className = 'hn-top-comments-nav-item'
			navItem.href = `#${originalId}`
			navItem.innerHTML = `
				<span class="hn-nav-medal">${this.medals[index]}</span>
				<span class="hn-nav-author">${comment.author}</span>
				<span class="hn-nav-replies">(${comment.replyCount} replies)</span>
				<span class="hn-nav-preview">${comment.preview}</span>
			`

			navItem.addEventListener('click', (event) => {
				event.preventDefault()
				comment.row.scrollIntoView({ behavior: 'smooth', block: 'center' })
				comment.row.style.transition = 'background 0.3s'
				comment.row.style.background = 'rgba(255, 165, 0, 0.3)'
				setTimeout(() => {
					comment.row.style.background = ''
				}, 1000)
			})

			return navItem
		}

		insertNavigation(nav) {
			const commentTree = document.querySelector(Selectors.commentTree)
			if (commentTree && commentTree.parentNode) {
				commentTree.parentNode.insertBefore(nav, commentTree)
			}
		}

		applyCommentHighlight(comment, index) {
			comment.row.dataset.hnTopComment = index
			comment.row.classList.add('hn-top-comment')
			this.addCommentBadge(comment.row, index, comment.replyCount)
		}

		addCommentBadge(commentRow, rank, replyCount) {
			const header = commentRow.querySelector(Selectors.commentHeader)
			if (!header) return

			const badge = document.createElement('span')
			badge.className = 'hn-comment-badge'

			if (rank === 0) {
				badge.classList.add('hn-comment-badge-gold')
				badge.textContent = `🥇 #1 (${replyCount} replies)`
			} else if (rank === 1) {
				badge.classList.add('hn-comment-badge-silver')
				badge.textContent = `🥈 #2 (${replyCount} replies)`
			} else {
				badge.classList.add('hn-comment-badge-bronze')
				badge.textContent = `🥉 #3 (${replyCount} replies)`
			}

			const ageLink = header.querySelector(Selectors.commentAge)
			if (ageLink?.parentNode) {
				ageLink.parentNode.insertBefore(badge, ageLink.nextSibling)
			} else {
				header.appendChild(badge)
			}
		}
	}

	class StorageService {
		async loadTheme() {
			return new Promise((resolve) => {
				chrome.storage.sync.get({ theme: Theme.LIGHT }, (result) => {
					resolve(result.theme)
				})
			})
		}
	}

	class RetryExecutor {
		static run(fn, attempts = RetryDefaults.attempts, delayMs = RetryDefaults.delayMs) {
			const attempt = (remaining) => {
				const success = fn()
				if (!success && remaining > 1) {
					setTimeout(() => attempt(remaining - 1), delayMs)
				}
			}
			attempt(attempts)
		}
	}

	class DocumentReady {
		static run(callback) {
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', callback, { once: true })
			} else {
				callback()
			}
		}
	}

	class HackerNewsEnhancer {
		constructor({ themeService, storyHighlighter, commentHighlighter, storage }) {
			this.themeService = themeService
			this.storyHighlighter = storyHighlighter
			this.commentHighlighter = commentHighlighter
			this.storage = storage
		}

		init() {
			this.applySavedTheme()
			this.initializeAutoHighlights()
			this.listenForMessages()
		}

		async applySavedTheme() {
			try {
				const savedTheme = await this.storage.loadTheme()
				this.themeService.apply(savedTheme)
			} catch (error) {
				console.error('Failed to apply saved theme', error)
			}
		}

		initializeAutoHighlights() {
			DocumentReady.run(() => {
				RetryExecutor.run(() => this.safeHighlight(() => this.storyHighlighter.highlightTopStories()))
				RetryExecutor.run(() => this.safeHighlight(() => this.commentHighlighter.highlightTopComments()))
			})
		}

		listenForMessages() {
			chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
				if (request.action === 'setTheme') {
					this.themeService.apply(request.theme)
					sendResponse({ success: true })
				} else if (request.action === 'highlightTopPosts') {
					const success = this.safeHighlight(() => this.storyHighlighter.highlightTopStories())
					sendResponse({ success })
				} else if (request.action === 'highlightTopComments') {
					const success = this.safeHighlight(() => this.commentHighlighter.highlightTopComments())
					sendResponse({ success })
				}

				return true
			})
		}

		safeHighlight(operation) {
			try {
				return operation()
			} catch (error) {
				console.error('Highlight error:', error)
				return false
			}
		}
	}

	const enhancer = new HackerNewsEnhancer({
		themeService: new ThemeService(),
		storyHighlighter: new StoryHighlighter(new StyleInjector()),
		commentHighlighter: new CommentHighlighter(new StyleInjector()),
		storage: new StorageService(),
	})

	enhancer.init()
})()
