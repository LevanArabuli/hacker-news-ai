;(() => {
	const Theme = Object.freeze({
		LIGHT: 'light',
		DARK: 'dark',
	})

	const Site = Object.freeze({
		HN: 'hn',
		PH: 'ph',
		UNKNOWN: 'unknown',
	})

	const SiteConfig = {
		[Site.HN]: {
			name: 'Hacker News',
			storageKey: 'theme',
			urlPattern: 'news.ycombinator.com',
		},
		[Site.PH]: {
			name: 'Product Hunt',
			storageKey: 'phTheme',
			urlPattern: 'producthunt.com',
		},
	}

	class ThemeStorage {
		async load(storageKey) {
			return new Promise((resolve) => {
				chrome.storage.sync.get({ [storageKey]: Theme.LIGHT }, (result) => {
					resolve(result[storageKey])
				})
			})
		}

		async save(storageKey, theme) {
			return new Promise((resolve, reject) => {
				chrome.storage.sync.set({ [storageKey]: theme }, () => {
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
		async getActiveTab() {
			return new Promise((resolve, reject) => {
				chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					const error = chrome.runtime.lastError
					if (error) {
						reject(error)
						return
					}

					const [tab] = tabs
					resolve(tab || null)
				})
			})
		}

		detectSite(url) {
			if (!url) return Site.UNKNOWN
			if (url.includes(SiteConfig[Site.HN].urlPattern)) return Site.HN
			if (url.includes(SiteConfig[Site.PH].urlPattern)) return Site.PH
			return Site.UNKNOWN
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

	class SiteLabelView {
		constructor(element) {
			this.element = element
		}

		update(site) {
			if (!this.element) return

			if (site === Site.UNKNOWN) {
				this.element.textContent = 'Visit HN or Product Hunt to apply themes.'
			} else {
				const config = SiteConfig[site]
				this.element.textContent = `Currently on ${config.name}`
			}
		}
	}

	class ThemePopupController {
		constructor({ storage, messenger, statusView, siteLabelView }) {
			this.storage = storage
			this.messenger = messenger
			this.statusView = statusView
			this.siteLabelView = siteLabelView
			this.currentSite = Site.UNKNOWN
			this.currentTab = null
		}

		async init() {
			this.bindUi()
			await this.detectCurrentSite()
			this.showCurrentTheme()
		}

		bindUi() {
			document.getElementById('light-btn')?.addEventListener('click', () => this.applyTheme(Theme.LIGHT))
			document.getElementById('dark-btn')?.addEventListener('click', () => this.applyTheme(Theme.DARK))
		}

		async detectCurrentSite() {
			try {
				this.currentTab = await this.messenger.getActiveTab()
				this.currentSite = this.messenger.detectSite(this.currentTab?.url)
				this.siteLabelView.update(this.currentSite)
			} catch (error) {
				console.error('Failed to detect site', error)
				this.currentSite = Site.UNKNOWN
			}
		}

		async showCurrentTheme() {
			try {
				if (this.currentSite === Site.UNKNOWN) {
					this.statusView.show('Open a supported site')
					return
				}

				const config = SiteConfig[this.currentSite]
				const currentTheme = await this.storage.load(config.storageKey)
				this.statusView.show(`Current: ${currentTheme}`)
			} catch (error) {
				console.error('Failed to load saved theme', error)
				this.statusView.show('Unable to read saved theme.')
			}
		}

		async applyTheme(theme) {
			try {
				if (this.currentSite === Site.UNKNOWN) {
					this.statusView.show('Please open HN or Product Hunt first.')
					return
				}

				const config = SiteConfig[this.currentSite]
				await this.storage.save(config.storageKey, theme)

				if (this.currentTab) {
					await this.messenger.sendTheme(this.currentTab.id, theme)
					this.statusView.show(`${capitalize(theme)} theme applied.`)
				} else {
					this.statusView.show(`Saved ${theme}. Reload the page to apply.`)
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
			siteLabelView: new SiteLabelView(document.getElementById('site-label')),
		})

		controller.init()
	})
})()
