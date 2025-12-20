// Apply saved theme on page load
chrome.storage.sync.get(['theme'], (result) => {
	const theme = result.theme || 'light'
	applyTheme(theme)
})

// Automatically highlight top posts/comments once the page DOM is ready
runAutoHighlight()
runAutoHighlightComments()

// Listen for theme changes and highlight command
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
	if (request.action === 'setTheme') {
		applyTheme(request.theme)
		sendResponse({ success: true })
	} else if (request.action === 'highlightTopPosts') {
		try {
			const success = highlightTopPosts()
			sendResponse({ success: success })
		} catch (error) {
			console.error('Highlight error:', error)
			sendResponse({ success: false, error: error.message })
		}
	} else if (request.action === 'highlightTopComments') {
		try {
			const success = highlightTopComments()
			sendResponse({ success: success })
		} catch (error) {
			console.error('Highlight comments error:', error)
			sendResponse({ success: false, error: error.message })
		}
	}
	return true // Keep message channel open for async response
})

function applyTheme(theme) {
	if (theme === 'dark') {
		document.documentElement.classList.add('dark-theme')
	} else {
		document.documentElement.classList.remove('dark-theme')
	}
}

function runAutoHighlight() {
	const triggerHighlight = (attemptsLeft = 3) => {
		try {
			const success = highlightTopPosts()
			// Retry a few times in case rows are not yet on the page
			if (!success && attemptsLeft > 0) {
				setTimeout(() => triggerHighlight(attemptsLeft - 1), 400)
			}
		} catch (error) {
			console.error('Auto highlight error:', error)
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => triggerHighlight(), { once: true })
	} else {
		triggerHighlight()
	}
}

function runAutoHighlightComments() {
	const triggerHighlight = (attemptsLeft = 3) => {
		try {
			const success = highlightTopComments()
			// Retry a few times in case comments are not yet on the page
			if (!success && attemptsLeft > 0) {
				setTimeout(() => triggerHighlight(attemptsLeft - 1), 400)
			}
		} catch (error) {
			console.error('Auto highlight comments error:', error)
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => triggerHighlight(), { once: true })
	} else {
		triggerHighlight()
	}
}

function highlightTopPosts() {
	// Only run on list-style pages (skip item/comment pages)
	const storyRows = Array.from(document.querySelectorAll('tr.athing'))
	const titleRows = storyRows.filter((row) => row.querySelector('.titleline'))
	if (titleRows.length < 5) return false

	// Inject highlight styles if not already present
	if (!document.getElementById('hn-highlight-styles')) {
		const style = document.createElement('style')
		style.id = 'hn-highlight-styles'
		style.textContent = `
			.hn-top-upvotes td {
				background: linear-gradient(90deg, rgba(255, 165, 0, 0.25) 0%, transparent 100%) !important;
			}
			.hn-top-upvotes .titleline a {
				color: #d4740c !important;
				font-weight: bold;
			}
			.dark-theme .hn-top-upvotes .titleline a {
				color: #ffb347 !important;
			}
			.hn-top-comments td {
				background: linear-gradient(90deg, rgba(74, 144, 226, 0.25) 0%, transparent 100%) !important;
			}
			.hn-top-comments .titleline a {
				color: #2563eb !important;
				font-weight: bold;
			}
			.dark-theme .hn-top-comments .titleline a {
				color: #60a5fa !important;
			}
			.hn-hottest td {
				background: linear-gradient(90deg, rgba(168, 85, 247, 0.35) 0%, transparent 100%) !important;
			}
			.hn-hottest .titleline a {
				color: #7c3aed !important;
				font-weight: bold;
			}
			.dark-theme .hn-hottest .titleline a {
				color: #c084fc !important;
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
		document.head.appendChild(style)
	}

	// Clear any existing highlights
	document.querySelectorAll('.hn-top-upvotes, .hn-top-comments, .hn-hottest').forEach((el) => {
		el.classList.remove('hn-top-upvotes', 'hn-top-comments', 'hn-hottest')
	})
	document.querySelectorAll('.hn-badge').forEach((el) => {
		el.remove()
	})

	// Build story data
	const stories = titleRows.map((titleRow) => {
		const subtextRow = titleRow.nextElementSibling
		let points = 0
		let comments = 0

		if (subtextRow) {
			// Get points
			const scoreSpan = subtextRow.querySelector('.score')
			if (scoreSpan) {
				const match = scoreSpan.textContent.match(/(\d+)/)
				if (match) points = parseInt(match[1])
			}

			// Get comments - find the last link that contains a number
			const links = subtextRow.querySelectorAll('a')
			for (const link of links) {
				const match = link.textContent.match(/(\d+)\s*comment/)
				if (match) {
					comments = parseInt(match[1])
					break
				}
			}
		}

		return { titleRow, subtextRow, points, comments }
	})

	// Sort by upvotes to find top posts
	const sortedByUpvotes = [...stories].sort((a, b) => b.points - a.points)
	const hottestPost = sortedByUpvotes[0]?.titleRow
	const topByUpvotes = sortedByUpvotes.slice(1, 6).map((s) => s.titleRow) // Top 2-6 (excluding #1)

	// Get top 5 by comments
	const topByComments = [...stories]
		.sort((a, b) => b.comments - a.comments)
		.slice(0, 5)
		.map((s) => s.titleRow)

	// Apply highlights
	stories.forEach(({ titleRow, subtextRow }) => {
		const isHottest = titleRow === hottestPost
		const inUpvotes = topByUpvotes.includes(titleRow)
		const inComments = topByComments.includes(titleRow)

		// #1 upvoted post gets special "hottest" treatment
		if (isHottest) {
			titleRow.classList.add('hn-hottest')
			subtextRow?.classList.add('hn-hottest')
			addBadge(titleRow, 'hottest')
		} else if (inUpvotes) {
			titleRow.classList.add('hn-top-upvotes')
			subtextRow?.classList.add('hn-top-upvotes')
			addBadge(titleRow, 'upvotes')
		}

		// Comments badge is separate - can be added alongside upvotes
		if (inComments && !isHottest) {
			titleRow.classList.add('hn-top-comments')
			subtextRow?.classList.add('hn-top-comments')
			addBadge(titleRow, 'comments')
		}
	})

	return true
}

function highlightTopComments() {
	// Only run on item/comment pages (check for comment tree)
	const commentRows = Array.from(document.querySelectorAll('tr.athing.comtr'))
	if (commentRows.length < 3) return false

	// Inject comment highlight styles if not already present
	if (!document.getElementById('hn-comment-highlight-styles')) {
		const style = document.createElement('style')
		style.id = 'hn-comment-highlight-styles'
		style.textContent = `
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
				background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
				border: 1px solid #0f3460;
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
				color: #e94560;
				margin-bottom: 8px;
				font-size: 12px;
				text-transform: uppercase;
				letter-spacing: 0.5px;
			}
			.dark-theme .hn-top-comments-nav-title {
				color: #e94560;
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
				background: rgba(255, 255, 255, 0.05);
				border-radius: 4px;
				cursor: pointer;
				transition: background 0.2s;
				text-decoration: none;
				color: #a0a0a0;
			}
			.hn-top-comments-nav-item:hover {
				background: rgba(255, 255, 255, 0.1);
				color: #ffffff;
			}
			.hn-top-comments-nav-item:visited {
				color: #a0a0a0;
			}
			.hn-top-comments-nav-item:hover:visited {
				color: #ffffff;
			}
			.hn-nav-medal {
				font-size: 14px;
			}
			.hn-nav-author {
				font-weight: 600;
				color: #4da8da;
			}
			.hn-nav-replies {
				color: #888;
				font-size: 11px;
			}
			.hn-nav-preview {
				color: #666;
				font-size: 11px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				max-width: 400px;
			}
		`
		document.head.appendChild(style)
	}

	// Clear any existing comment highlights and nav
	document.querySelectorAll('.hn-top-comment').forEach((el) => {
		el.classList.remove('hn-top-comment')
	})
	document.querySelectorAll('.hn-comment-badge').forEach((el) => {
		el.remove()
	})
	document.querySelectorAll('.hn-top-comments-nav').forEach((el) => {
		el.remove()
	})

	// Build comment data with reply counts
	// Note: HN doesn't show comment scores publicly, so we use reply count
	// The 'n' attribute on the toggle button shows number of child comments
	const comments = commentRows.map((row) => {
		let replyCount = 0
		let author = ''
		let preview = ''

		// Find the toggle button which has 'n' attribute for reply count
		const toggleButton = row.querySelector('.togg')
		if (toggleButton) {
			const n = toggleButton.getAttribute('n')
			if (n) replyCount = parseInt(n)
		}

		// Get author name
		const authorLink = row.querySelector('.hnuser')
		if (authorLink) {
			author = authorLink.textContent
		}

		// Get comment preview
		const commtext = row.querySelector('.commtext')
		if (commtext) {
			preview = commtext.textContent.slice(0, 80).trim()
			if (commtext.textContent.length > 80) preview += '...'
		}

		return { row, replyCount, author, preview }
	})

	// Sort by reply count and get top 3
	const topComments = [...comments]
		.sort((a, b) => b.replyCount - a.replyCount)
		.slice(0, 3)
		.filter((c) => c.replyCount > 0) // Only highlight if they have replies

	if (topComments.length === 0) return false

	// Collapse all root-level comments first, then expand only top 3
	collapseAllComments()
	topComments.forEach((comment) => {
		expandComment(comment.row)
	})

	// Create navigation panel
	const nav = document.createElement('div')
	nav.className = 'hn-top-comments-nav'
	nav.innerHTML = `
		<div class="hn-top-comments-nav-title">🔥 Most Discussed Comments</div>
		<div class="hn-top-comments-nav-list"></div>
	`
	const navList = nav.querySelector('.hn-top-comments-nav-list')

	const medals = ['🥇', '🥈', '🥉']

	// Apply highlights with ranking badges and build nav
	topComments.forEach((comment, index) => {
		// Use data attribute instead of overwriting the id (HN needs the original id for toggle)
		comment.row.dataset.hnTopComment = index
		comment.row.classList.add('hn-top-comment')
		addCommentBadge(comment.row, index, comment.replyCount)

		// Add nav item - use the existing HN comment id for the anchor
		const originalId = comment.row.id
		const navItem = document.createElement('a')
		navItem.className = 'hn-top-comments-nav-item'
		navItem.href = `#${originalId}`
		navItem.innerHTML = `
			<span class="hn-nav-medal">${medals[index]}</span>
			<span class="hn-nav-author">${comment.author}</span>
			<span class="hn-nav-replies">(${comment.replyCount} replies)</span>
			<span class="hn-nav-preview">${comment.preview}</span>
		`
		navItem.addEventListener('click', (e) => {
			e.preventDefault()
			comment.row.scrollIntoView({ behavior: 'smooth', block: 'center' })
			// Flash effect
			comment.row.style.transition = 'background 0.3s'
			comment.row.style.background = 'rgba(255, 165, 0, 0.3)'
			setTimeout(() => {
				comment.row.style.background = ''
			}, 1000)
		})
		navList.appendChild(navItem)
	})

	// Insert nav before the comment tree
	const commentTree = document.querySelector('.comment-tree')
	if (commentTree) {
		commentTree.parentNode.insertBefore(nav, commentTree)
	}

	return topComments.length > 0
}

function addCommentBadge(commentRow, rank, replyCount) {
	const comhead = commentRow.querySelector('.comhead')
	if (!comhead) return

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

	// Insert badge after the age link
	const ageLink = comhead.querySelector('.age')
	if (ageLink) {
		ageLink.parentNode.insertBefore(badge, ageLink.nextSibling)
	} else {
		comhead.appendChild(badge)
	}
}

function addBadge(titleRow, type) {
	const titleLink = titleRow.querySelector('.titleline')
	if (!titleLink) return

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

	titleLink.appendChild(badge)
}

function collapseAllComments() {
	// Find all root-level comments (indent level 0) and collapse them
	// Root comments have an indent img with width=0
	const allComments = document.querySelectorAll('tr.athing.comtr')

	allComments.forEach((comment) => {
		const indentImg = comment.querySelector('.ind img')
		const indentWidth = indentImg ? parseInt(indentImg.getAttribute('width') || '0') : 0

		// Only collapse root-level comments (indent = 0)
		if (indentWidth === 0) {
			const toggle = comment.querySelector('.togg')
			// Only click if not already collapsed (doesn't have 'c' class)
			if (toggle && !toggle.classList.contains('c')) {
				toggle.click()
			}
		}
	})
}

function expandComment(commentRow) {
	// Expand this specific comment if it's collapsed
	const toggle = commentRow.querySelector('.togg')
	if (toggle && toggle.classList.contains('c')) {
		toggle.click()
	}
}
