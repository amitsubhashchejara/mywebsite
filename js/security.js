// Enhanced Security Measures

// Content Security Policy Report Handler
window.addEventListener('securitypolicyviolation', (e) => {
    console.warn('CSP Violation:', {
        'violatedDirective': e.violatedDirective,
        'blockedURI': e.blockedURI
    });
});

// Prevent XSS in dynamic content
const sanitizeHTML = (str) => {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

// Prevent Clickjacking
if (window.self !== window.top) {
    window.top.location = window.self.location;
}

// Disable console in production
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const noop = () => {};
    ['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
        console[method] = noop;
    });
}

// Enhanced DOM Security Monitor
const securityMonitor = {
    suspiciousPatterns: [
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
        /on\w+\s*=/i
    ],

    checkAttribute: function(attr) {
        return this.suspiciousPatterns.some(pattern => pattern.test(attr.value));
    },

    scanElement: function(element) {
        // Check for suspicious attributes
        Array.from(element.attributes || []).forEach(attr => {
            if (this.checkAttribute(attr)) {
                console.warn('Suspicious attribute detected:', attr.name, attr.value);
                element.removeAttribute(attr.name);
            }
        });

        // Check for suspicious inline scripts
        if (element.tagName === 'SCRIPT' && !element.src && element.textContent) {
            console.warn('Inline script detected');
        }
    },

    init: function() {
        // Initial scan
        document.querySelectorAll('*').forEach(element => this.scanElement(element));

        // Monitor for changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        this.scanElement(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'href', 'onclick']
        });
    }
};

// Prevent drag and drop file attacks
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

// Protect against browser auto-fill attacks
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.getElementsByTagName('input');
    Array.from(inputs).forEach(input => {
        if (input.type !== 'submit') {
            input.setAttribute('autocomplete', 'off');
        }
    });
});

// Initialize security monitoring
document.addEventListener('DOMContentLoaded', () => {
    securityMonitor.init();
});

// Protect sensitive content
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('protected')) {
        e.preventDefault();
    }
});

// Prevent form tampering
document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form.hasAttribute('data-secure')) {
        // Add additional form validation here
        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            if (typeof value === 'string') {
                formData.set(key, sanitizeHTML(value));
            }
        }
    }
});

// HTTP Security Headers check
(() => {
    const requiredHeaders = [
        'Content-Security-Policy',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'Referrer-Policy'
    ];

    // This is just a warning mechanism since we can't actually set HTTP headers client-side
    requiredHeaders.forEach(header => {
        const meta = document.querySelector(`meta[http-equiv="${header}"]`);
        if (!meta) {
            console.warn(`Security header ${header} is not set`);
        }
    });
})();
