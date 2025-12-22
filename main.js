class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        this.init();
    }

    init() {
        this.themeToggle?.addEventListener('click', () => this.toggleTheme());
        this.prefersDark.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'de';
        this.langBtn = document.getElementById('langBtn');
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadTranslations(this.currentLang);
        this.applyTranslations();
        this.langBtn?.addEventListener('click', () => this.toggleLanguage());
        this.updateLangButton();
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) return;
            this.translations = await response.json();
        } catch {}
    }

    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getNestedTranslation(key);
            if (translation) element.textContent = translation;
        });
    }

    getNestedTranslation(key) {
        return key.split('.').reduce((obj, k) => obj?.[k], this.translations);
    }

    async toggleLanguage() {
        this.currentLang = this.currentLang === 'de' ? 'en' : 'de';
        localStorage.setItem('language', this.currentLang);
        await this.loadTranslations(this.currentLang);
        this.applyTranslations();
        this.updateLangButton();
    }

    updateLangButton() {
        const langText = this.langBtn?.querySelector('.lang-text');
        if (langText) langText.textContent = this.currentLang.toUpperCase();
    }
}

class MobileNav {
    constructor() {
        this.toggle = document.getElementById('mobileToggle');
        this.navLinks = document.getElementById('navLinks');
        this.init();
    }

    init() {
        this.toggle?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });
        this.navLinks?.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen() && !this.isClickInside(e.target)) this.closeMenu();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen()) this.closeMenu();
        });
    }

    isMenuOpen() {
        return this.navLinks?.classList.contains('active');
    }

    isClickInside(target) {
        return this.navLinks?.contains(target) || this.toggle?.contains(target);
    }

    toggleMenu() {
        this.navLinks?.classList.toggle('active');
        this.toggle?.classList.toggle('active');
    }

    closeMenu() {
        this.navLinks?.classList.remove('active');
        this.toggle?.classList.remove('active');
    }
}

class ScrollEffects {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.init();
    }

    init() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
        this.observeElements();
    }

    handleScroll() {
        const scrolled = window.scrollY > 20;
        this.navbar?.classList.toggle('scrolled', scrolled);
    }

    observeElements() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        const animatedElements = document.querySelectorAll(
            '.feature-card, .download-card, .edition-card, .post-card, .team-member, .sponsor-link'
        );

        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = `opacity 0.3s ease ${index * 0.03}s, transform 0.3s ease ${index * 0.03}s`;
            observer.observe(el);
        });
    }
}

class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            });
        });
    }
}

class ActiveNav {
    constructor() {
        this.init();
    }

    init() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
}

class DonateModal {
    constructor() {
        this.modal = document.getElementById('donateModal');
        this.init();
    }

    init() {
        document.querySelectorAll('[data-donate]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        });
        this.modal?.querySelector('.modal-close')?.addEventListener('click', () => this.close());
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) this.close();
        });
        this.modal?.querySelectorAll('.donate-value[data-copy]').forEach(btn => {
            btn.addEventListener('click', () => this.copyToClipboard(btn));
        });
    }

    isOpen() {
        return this.modal?.classList.contains('active');
    }

    open() {
        this.resetCopyButtons();
        this.modal?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal?.classList.remove('active');
        document.body.style.overflow = '';
    }

    resetCopyButtons() {
        this.modal?.querySelectorAll('.donate-value[data-copy]').forEach(btn => {
            btn.classList.remove('copied');
        });
    }

    copyToClipboard(btn) {
        const text = btn.dataset.copy;
        if (!text || btn.classList.contains('copied')) return;
        navigator.clipboard.writeText(text).then(() => {
            this.modal?.querySelectorAll('.donate-value[data-copy]').forEach(b => {
                b.classList.remove('copied');
            });
            btn.classList.add('copied');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new LanguageManager();
    new MobileNav();
    new ScrollEffects();
    new SmoothScroll();
    new ActiveNav();
    new DonateModal();
});
