// Global Theme Manager - Initializes and applies theme on every page load
(function() {
    // Initialize theme on page load
    function initializeTheme() {
        // Try to load saved theme from localStorage
        let settings = {};
        try {
            const savedSettings = localStorage.getItem('appSettings');
            if (savedSettings) {
                settings = JSON.parse(savedSettings);
            }
        } catch (e) {
            console.log('Could not parse saved settings');
        }

        const theme = settings.theme || 'light'; // Default to light mode

        // Apply the saved theme
        applyTheme(theme);
    }

    // Apply theme to the page
    function applyTheme(theme) {
        const body = document.body;
        
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
        } else if (theme === 'light') {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
        } else if (theme === 'auto') {
            // Auto: Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                body.classList.add('dark-mode');
                body.classList.remove('light-mode');
            } else {
                body.classList.remove('dark-mode');
                body.classList.add('light-mode');
            }
        }
    }

    // Listen for storage changes (when settings are changed in another tab/window)
    window.addEventListener('storage', (event) => {
        if (event.key === 'appSettings') {
            try {
                const settings = JSON.parse(event.newValue);
                if (settings && settings.theme) {
                    applyTheme(settings.theme);
                }
            } catch (e) {
                console.log('Could not parse storage change');
            }
        }
    });

    // Initialize theme when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTheme);
    } else {
        initializeTheme();
    }

    // Expose functions globally for external use
    window.applyTheme = applyTheme;
    window.initializeTheme = initializeTheme;
})();
