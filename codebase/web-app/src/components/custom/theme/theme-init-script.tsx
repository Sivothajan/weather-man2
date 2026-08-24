function themeInit() {
  try {
    const root = document.documentElement;
    if (!root) return;

    const applyTheme = () => {
      try {
        const storedTheme = localStorage.getItem('theme');
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const systemPrefersDark = mediaQuery.matches;
        const useDarkTheme =
          storedTheme === 'dark' ||
          (storedTheme !== 'light' && systemPrefersDark);
        root.classList.toggle('dark', useDarkTheme);
      } catch {
        // Fail silently if access to localStorage or matchMedia is blocked.
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', applyTheme);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(applyTheme);
    }

    window.addEventListener('storage', (event) => {
      if (event.key === 'theme') {
        applyTheme();
      }
    });
  } catch {
    // If anything goes wrong, fail gracefully without blocking render.
  }
}

const themeInitScript = `(${themeInit.toString()})();`;

export function ThemeInitScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />;
}
