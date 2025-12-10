// Apply saved theme on page load
chrome.storage.sync.get(['theme'], (result) => {
	const theme = result.theme || 'light'
	applyTheme(theme)
})

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

function highlightTopPosts() {
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

	// Get all story rows
	const storyRows = Array.from(document.querySelectorAll('tr.athing'))
	if (storyRows.length === 0) return false

	// Build story data
	const stories = storyRows.map((titleRow) => {
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
