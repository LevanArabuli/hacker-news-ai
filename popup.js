document.getElementById('light-btn').addEventListener('click', () => {
	setTheme('light')
})

document.getElementById('dark-btn').addEventListener('click', () => {
	setTheme('dark')
})

document.getElementById('highlight-btn').addEventListener('click', () => {
	highlightTopPosts()
})

function setTheme(theme) {
	chrome.storage.sync.set({ theme: theme }, () => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]?.url.includes('news.ycombinator.com')) {
				chrome.tabs.sendMessage(tabs[0].id, { action: 'setTheme', theme: theme })
				document.getElementById('status').textContent = `${theme} theme applied!`
			}
		})
	})
}

function highlightTopPosts() {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs[0]?.url.includes('news.ycombinator.com')) {
			chrome.tabs.sendMessage(tabs[0].id, { action: 'highlightTopPosts' }, (response) => {
				if (response?.success) {
					document.getElementById('status').textContent = 'Top posts highlighted!'
				} else {
					document.getElementById('status').textContent = 'Failed - reload page'
				}
			})
		}
	})
}

// Show current theme on popup open
chrome.storage.sync.get(['theme'], (result) => {
	const currentTheme = result.theme || 'light'
	document.getElementById('status').textContent = `Current: ${currentTheme}`
})
