;(() => {
	const Theme = Object.freeze({
		LIGHT: 'light',
		DARK: 'dark',
	})

	const STORAGE_KEY = 'phTheme'

	class ThemeService {
		constructor(root = document.documentElement) {
			this.root = root
		}

		apply(theme) {
			const isDark = theme === Theme.DARK
			// Add both 'dark-theme' (our custom) and 'dark' (Tailwind's) classes
			this.root.classList.toggle('dark-theme', isDark)
			this.root.classList.toggle('dark', isDark)
		}

		get current() {
			return this.root.classList.contains('dark-theme') ? Theme.DARK : Theme.LIGHT
		}
	}

	class StorageService {
		async loadTheme() {
			return new Promise((resolve) => {
				chrome.storage.sync.get({ [STORAGE_KEY]: Theme.LIGHT }, (result) => {
					resolve(result[STORAGE_KEY])
				})
			})
		}
	}

	class ProductHuntEnhancer {
		constructor({ themeService, storage }) {
			this.themeService = themeService
			this.storage = storage
		}

		init() {
			this.applySavedTheme()
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

		listenForMessages() {
			chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
				if (request.action === 'setTheme') {
					this.themeService.apply(request.theme)
					sendResponse({ success: true })
				} else if (request.action === 'getTheme') {
					sendResponse({ theme: this.themeService.current })
				}

				return true
			})
		}
	}

	const enhancer = new ProductHuntEnhancer({
		themeService: new ThemeService(),
		storage: new StorageService(),
	})

	enhancer.init()
})()

