// Configuration
const CONFIG = {
    ARTICLES_PER_PAGE: 6,
    SCROLL_OFFSET: 150,
    NAVBAR_HEIGHT: 74,
    DEBOUNCE_DELAY: 100
};

// Utility Functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const parseDateSafely = (dateStr) => {
    try {
        if (dateStr.includes('Present')) return new Date().getTime();
        const date = dateStr.includes('-') ? dateStr.split('-')[0].trim() : dateStr.trim();
        const timestamp = new Date(date).getTime();
        if (isNaN(timestamp)) throw new Error('Invalid date');
        return timestamp;
    } catch (error) {
        console.warn(`Invalid date format: ${dateStr}, using fallback date`);
        return new Date('2000-01-01').getTime(); // Fallback date
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Navigation Manager
    const NavigationManager = {
        init() {
            this.navToggle = document.querySelector('.nav-toggle');
            this.navLinks = document.querySelector('.nav-links');
            this.setupEventListeners();
            this.resetPagePosition();
        },

        resetPagePosition() {
            if (window.location.hash) {
                window.location.hash = '';
            }
            window.scrollTo(0, 0);
        },

        setupEventListeners() {
            // Mobile menu toggle
            this.navToggle?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navLinks?.classList.toggle('active');
                this.navToggle.classList.toggle('active');
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.navToggle?.contains(e.target) && !this.navLinks?.contains(e.target)) {
                    this.navLinks?.classList.remove('active');
                    this.navToggle?.classList.remove('active');
                }
            });

            // Close mobile menu when clicking a link
            this.navLinks?.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    this.navLinks.classList.remove('active');
                    this.navToggle?.classList.remove('active');
                }
            });

            // Close mobile menu on resize if screen becomes larger than mobile breakpoint
            window.addEventListener('resize', debounce(() => {
                if (window.innerWidth > 768) {
                    this.navLinks?.classList.remove('active');
                    this.navToggle?.classList.remove('active');
                }
            }, CONFIG.DEBOUNCE_DELAY));

            // Smooth scroll
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(this.getHash(anchor));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                        this.navLinks?.classList.remove('active');
                    }
                });
            });
        },

        getHash(anchor) {
            return anchor.getAttribute('href') || '#';
        }
    };

    // Articles Manager
    const ArticlesManager = {
        init() {
            this.currentPage = 1;
            this.articles = [];
            this.sortSelect = document.getElementById('sort-articles');
            this.articlesGrid = document.querySelector('.articles-grid');
            this.loadMoreBtn = document.getElementById('load-more');
            
            this.initializeArticles();
            this.setupEventListeners();
        },

        initializeArticles() {
            const articleElements = document.querySelectorAll('.article-card');
            if (!articleElements.length) return;

            this.articles = Array.from(articleElements).map(article => {
                const clone = article.cloneNode(true);
                return {
                    element: clone,
                    date: article.dataset.date || article.querySelector('.article-date')?.textContent || ''
                };
            });
            this.updateDisplay();
        },

        setupEventListeners() {
            this.sortSelect?.addEventListener('change', () => {
                this.currentPage = 1;
                this.updateDisplay();
            });

            this.loadMoreBtn?.addEventListener('click', () => {
                this.currentPage++;
                this.updateDisplay();
            });
        },

        updateDisplay() {
            if (!this.articlesGrid) return;

            const sortOrder = this.sortSelect?.value || 'newest';
            const startIndex = (this.currentPage - 1) * CONFIG.ARTICLES_PER_PAGE;
            const endIndex = startIndex + CONFIG.ARTICLES_PER_PAGE;

            // Sort articles
            const sortedArticles = [...this.articles].sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
            });

            // Update grid
            this.articlesGrid.innerHTML = '';
            sortedArticles.slice(startIndex, endIndex).forEach(article => {
                const newArticle = article.element.cloneNode(true);
                this.articlesGrid.appendChild(newArticle);
            });

            // Update counters and button
            this.updateCounters(endIndex);
            this.updateLoadMoreButton(endIndex);
        },

        updateCounters(endIndex) {
            const showingCount = document.getElementById('showing-count');
            const totalCount = document.getElementById('total-count');
            if (showingCount) showingCount.textContent = Math.min(endIndex, this.articles.length);
            if (totalCount) totalCount.textContent = this.articles.length;
        },

        updateLoadMoreButton(endIndex) {
            if (this.loadMoreBtn) {
                this.loadMoreBtn.style.display = endIndex < this.articles.length ? 'block' : 'none';
            }
        }
    };

    // Experience Timeline Manager
    const TimelineManager = {
        init() {
            this.sortTimeline();
        },

        sortTimeline() {
            const timelineTrack = document.querySelector('.timeline-track');
            if (!timelineTrack) return;

            const timelineItems = Array.from(timelineTrack.querySelectorAll('.timeline-item'));
            
            const sortedItems = [...timelineItems].sort((a, b) => {
                const dateA = a.querySelector('.duration')?.textContent.split('-')[0].trim() || '';
                const dateB = b.querySelector('.duration')?.textContent.split('-')[0].trim() || '';
                const timeA = new Date(dateA).getTime();
                const timeB = new Date(dateB).getTime();
                return timeB - timeA; // Sort by most recent first
            });

            // Preserve the timeline line
            const timelineLine = timelineTrack.querySelector('.timeline-line');
            timelineTrack.innerHTML = '';
            if (timelineLine) {
                timelineTrack.appendChild(timelineLine);
            }

            // Append sorted items
            sortedItems.forEach(item => timelineTrack.appendChild(item.cloneNode(true)));
        }
    };

    // Active Section Manager
    const SectionManager = {
        init() {
            this.sections = document.querySelectorAll('.section');
            this.navItems = document.querySelectorAll('.nav-links a');
            this.sectionHeadings = document.querySelectorAll('.section h2');
            this.setupScrollListener();
            this.setupHeadingAnimations();
        },

        setupScrollListener() {
            window.addEventListener('scroll', debounce(() => {
                this.updateActiveSection();
            }, CONFIG.DEBOUNCE_DELAY));
        },

        setupHeadingAnimations() {
            const options = {
                root: null,
                rootMargin: '0px',
                threshold: 0.5
            };

            const headingObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const heading = entry.target;
                    
                    if (entry.isIntersecting) {
                        // Start animation when scrolling into view
                        heading.style.opacity = '0';
                        heading.style.transform = 'translateY(20px)';
                        
                        setTimeout(() => {
                            heading.style.transition = 'all 0.5s ease';
                            heading.style.opacity = '1';
                            heading.style.transform = 'translateY(0)';
                            heading.style.color = 'transparent';
                        }, 100);

                        setTimeout(() => {
                            heading.style.setProperty('--scale', '1');
                        }, 300);
                    } else {
                        // Reset animation when scrolling out of view
                        heading.style.transition = 'none';
                        heading.style.opacity = '0';
                        heading.style.transform = 'translateY(20px)';
                        heading.style.color = 'var(--primary-color)';
                        heading.style.setProperty('--scale', '0');
                    }
                });
            }, options);

            this.sectionHeadings.forEach(heading => {
                heading.style.opacity = '0';
                heading.style.setProperty('--scale', '0');
                headingObserver.observe(heading);
            });
        },

        updateActiveSection() {
            let current = '';
            
            this.sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - CONFIG.SCROLL_OFFSET) {
                    current = section.getAttribute('id') || '';
                }
            });

            this.navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href')?.slice(1) === current) {
                    item.classList.add('active');
                }
            });
        }
    };

    // Initialize all managers
    NavigationManager.init();
    ArticlesManager.init();
    TimelineManager.init();
    SectionManager.init();
});
