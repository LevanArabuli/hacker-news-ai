;(() => {
	const Theme = Object.freeze({
		LIGHT: 'light',
		DARK: 'dark',
	})

	class ThemeStorage {
		async load() {
			return new Promise((resolve) => {
				chrome.storage.sync.get({ theme: Theme.LIGHT }, (result) => {
					resolve(result.theme)
				})
			})
		}

		async save(theme) {
			return new Promise((resolve, reject) => {
				chrome.storage.sync.set({ theme }, () => {
					const error = chrome.runtime.lastError
					if (error) {
						reject(error)
						return
					}
					resolve()
				})
			})
		}
	}

	class ActiveTabMessenger {
		async getActiveHnTab() {
			return new Promise((resolve, reject) => {
				chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					const error = chrome.runtime.lastError
					if (error) {
						reject(error)
						return
					}

					const [tab] = tabs
					if (tab?.url && tab.url.includes('news.ycombinator.com')) {
						resolve(tab)
					} else {
						resolve(null)
					}
				})
			})
		}

		async sendTheme(tabId, theme) {
			return new Promise((resolve, reject) => {
				chrome.tabs.sendMessage(tabId, { action: 'setTheme', theme }, (response) => {
					const error = chrome.runtime.lastError
					if (error) {
						reject(error)
						return
					}
					resolve(response)
				})
			})
		}
	}

	class StatusView {
		constructor(element) {
			this.element = element
		}

		show(message) {
			if (this.element) {
				this.element.textContent = message
			}
		}
	}

	class ThemePopupController {
		constructor({ storage, messenger, statusView }) {
			this.storage = storage
			this.messenger = messenger
			this.statusView = statusView
		}

		init() {
			this.bindUi()
			this.showCurrentTheme()
		}

		bindUi() {
			document.getElementById('light-btn')?.addEventListener('click', () => this.applyTheme(Theme.LIGHT))
			document.getElementById('dark-btn')?.addEventListener('click', () => this.applyTheme(Theme.DARK))
		}

		async showCurrentTheme() {
			try {
				const currentTheme = await this.storage.load()
				this.statusView.show(`Current: ${currentTheme}`)
			} catch (error) {
				console.error('Failed to load saved theme', error)
				this.statusView.show('Unable to read saved theme.')
			}
		}

		async applyTheme(theme) {
			try {
				await this.storage.save(theme)
				const hnTab = await this.messenger.getActiveHnTab()

				if (hnTab) {
					await this.messenger.sendTheme(hnTab.id, theme)
					this.statusView.show(`${capitalize(theme)} theme applied.`)
				} else {
					this.statusView.show(`Saved ${theme}. Open Hacker News to apply.`)
				}
			} catch (error) {
				console.error('Failed to apply theme', error)
				this.statusView.show('Unable to apply theme right now.')
			}
		}
	}

	function capitalize(text) {
		if (!text) return ''
		return text.charAt(0).toUpperCase() + text.slice(1)
	}

	document.addEventListener('DOMContentLoaded', () => {
		const controller = new ThemePopupController({
			storage: new ThemeStorage(),
			messenger: new ActiveTabMessenger(),
			statusView: new StatusView(document.getElementById('status')),
		})

		controller.init()
	})
})()
