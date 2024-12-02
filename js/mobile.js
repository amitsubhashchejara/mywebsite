// Mobile-specific animations and interactions
document.addEventListener('DOMContentLoaded', () => {
    // Only run on mobile devices
    if (window.innerWidth <= 768) {
        const cards = document.querySelectorAll('.experience-card, .article-card, .opensource-card');
        
        const observerOptions = {
            root: null, // use viewport
            rootMargin: '0px',
            threshold: 0.3 // trigger when 30% of the card is visible
        };

        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('card-animate');
                    entry.target.style.transform = 'translateY(-5px) rotate(1deg)';
                    entry.target.style.borderColor = 'rgba(0, 65, 116, 0.2)';
                    entry.target.style.boxShadow = 'var(--shadow-md)';
                } else {
                    entry.target.classList.remove('card-animate');
                    entry.target.style.transform = 'none';
                    entry.target.style.borderColor = 'rgba(0, 65, 116, 0.1)';
                    entry.target.style.boxShadow = 'none';
                }
            });
        }, observerOptions);

        // Observe each card
        cards.forEach(card => {
            cardObserver.observe(card);
            
            // Remove hover effects on mobile
            card.style.transition = 'all 0.3s ease';
            
            // Prevent stuck hover states on touch
            card.addEventListener('touchstart', () => {
                card.style.transform = 'none';
                card.style.borderColor = 'rgba(0, 65, 116, 0.1)';
                card.style.boxShadow = 'none';
            });
        });

        // Clean up on resize if screen becomes larger than mobile
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                cards.forEach(card => {
                    cardObserver.unobserve(card);
                    card.style.transform = '';
                    card.style.borderColor = '';
                    card.style.boxShadow = '';
                });
            }
        });

        // Observe section headings
        const sectionHeadings = document.querySelectorAll('.section h2');
        
        const headingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class when heading is in view
                    entry.target.classList.add('heading-animate');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                    
                    // Animate the underline
                    setTimeout(() => {
                        entry.target.classList.add('heading-line-animate');
                    }, 300);
                } else {
                    // Reset animations when heading is out of view
                    entry.target.classList.remove('heading-animate', 'heading-line-animate');
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(20px) scale(0.95)';
                }
            });
        }, {
            root: null,
            rootMargin: '-10% 0px',
            threshold: 0.1
        });

        // Observe each heading
        sectionHeadings.forEach(heading => {
            // Set initial state
            heading.style.opacity = '0';
            heading.style.transform = 'translateY(20px) scale(0.95)';
            heading.style.transition = 'all 0.5s ease';
            
            // Start observing
            headingObserver.observe(heading);
        });

        // Clean up on resize if screen becomes larger than mobile
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sectionHeadings.forEach(heading => {
                    headingObserver.unobserve(heading);
                    heading.style.opacity = '';
                    heading.style.transform = '';
                    heading.classList.remove('heading-animate', 'heading-line-animate');
                });
            }
        });
    }
});
