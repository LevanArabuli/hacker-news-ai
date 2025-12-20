document.getElementById('light-btn').addEventListener('click', () => {
	setTheme('light')
})

document.getElementById('dark-btn').addEventListener('click', () => {
	setTheme('dark')
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

// Show current theme on popup open
chrome.storage.sync.get(['theme'], (result) => {
	const currentTheme = result.theme || 'light'
	document.getElementById('status').textContent = `Current: ${currentTheme}`
})
