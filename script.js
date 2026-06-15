/* ========================================================
   Tech Innovation Summit 2025 — Main JavaScript
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ===================== INIT AOS =====================
    AOS.init({
        duration: 700,
        easing: 'ease-out-cubic',
        once: true,
        offset: 60
    });

    // ===================== HERO PARTICLES =====================
    const particlesContainer = document.getElementById('heroParticles');
    if (particlesContainer) {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = (50 + Math.random() * 50) + '%';
            const size = (2 + Math.random() * 5) + 'px';
            particle.style.width = size;
            particle.style.height = size;
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.animationDuration = (5 + Math.random() * 8) + 's';
            const colors = [
                'hsl(250, 90%, 65%)',
                'hsl(330, 85%, 60%)',
                'hsl(200, 80%, 60%)',
                'hsl(280, 70%, 55%)',
                'hsl(170, 70%, 50%)'
            ];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particlesContainer.appendChild(particle);
        }
    }

    // ===================== NAVBAR =====================
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const allNavLinks = document.querySelectorAll('.nav-link');

    // Scroll behavior
    let lastScroll = 0;
    function handleNavScroll() {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }
    window.addEventListener('scroll', handleNavScroll);
    handleNavScroll();

    // Hamburger toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    function highlightNavOnScroll() {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (navLink) {
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    allNavLinks.forEach(l => l.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    }
    window.addEventListener('scroll', highlightNavOnScroll);

    // ===================== DARK / LIGHT THEME =====================
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('tis-theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('tis-theme', next);
        updateThemeIcon(next);

        // Rotation animation on toggle
        themeIcon.style.transform = 'rotate(360deg) scale(0)';
        setTimeout(() => {
            themeIcon.style.transition = 'none';
            themeIcon.style.transform = 'rotate(0) scale(1)';
            setTimeout(() => { themeIcon.style.transition = ''; }, 50);
        }, 300);
    });

    function updateThemeIcon(theme) {
        themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // ===================== COUNTDOWN TIMER =====================
    const eventDate = new Date('2025-08-15T09:00:00+05:30').getTime();
    const countDays = document.getElementById('countDays');
    const countHours = document.getElementById('countHours');
    const countMinutes = document.getElementById('countMinutes');
    const countSeconds = document.getElementById('countSeconds');

    function updateCountdown() {
        const now = new Date().getTime();
        let diff = eventDate - now;

        if (diff <= 0) {
            countDays.textContent = '00';
            countHours.textContent = '00';
            countMinutes.textContent = '00';
            countSeconds.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Animate the flip effect on seconds change
        animateCountdownValue(countDays, String(days).padStart(2, '0'));
        animateCountdownValue(countHours, String(hours).padStart(2, '0'));
        animateCountdownValue(countMinutes, String(minutes).padStart(2, '0'));
        animateCountdownValue(countSeconds, String(seconds).padStart(2, '0'));
    }

    function animateCountdownValue(el, newValue) {
        if (el.textContent !== newValue) {
            el.style.transform = 'translateY(-4px) scale(1.05)';
            el.style.transition = 'transform 0.15s ease';
            el.textContent = newValue;
            setTimeout(() => {
                el.style.transform = 'translateY(0) scale(1)';
            }, 150);
        }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ===================== ANIMATED STATS (Count-Up) =====================
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;

        const statsBar = document.getElementById('statsBar');
        const rect = statsBar.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
            statsAnimated = true;

            statNumbers.forEach(el => {
                const target = parseInt(el.getAttribute('data-target'));
                const duration = 2200;
                const start = performance.now();

                function step(timestamp) {
                    const progress = Math.min((timestamp - start) / duration, 1);
                    // Ease out quart
                    const eased = 1 - Math.pow(1 - progress, 4);
                    el.textContent = Math.floor(target * eased);
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        el.textContent = target;
                        // Pop effect on complete
                        el.style.transform = 'scale(1.15)';
                        el.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
                        setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
                    }
                }
                requestAnimationFrame(step);
            });
        }
    }
    window.addEventListener('scroll', animateStats);
    animateStats();

    // ===================== EVENT FILTER =====================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const timelineItems = document.querySelectorAll('.timeline-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            timelineItems.forEach((item, i) => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.classList.remove('hidden');
                    item.style.animation = 'none';
                    item.offsetHeight; // trigger reflow
                    item.style.animation = `fadeInUp 0.5s ${i * 0.08}s ease both`;
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    // ===================== SPEAKER SEARCH =====================
    const speakerSearch = document.getElementById('speakerSearch');
    const searchClear = document.getElementById('searchClear');
    const speakerCards = document.querySelectorAll('.speaker-card');
    const noSpeakerResults = document.getElementById('noSpeakerResults');

    speakerSearch.addEventListener('input', () => {
        const query = speakerSearch.value.toLowerCase().trim();
        searchClear.style.display = query ? 'flex' : 'none';

        let visibleCount = 0;
        speakerCards.forEach(card => {
            const name = card.getAttribute('data-name').toLowerCase();
            const expertise = card.getAttribute('data-expertise').toLowerCase();
            if (name.includes(query) || expertise.includes(query)) {
                card.classList.remove('hidden');
                card.style.animation = 'none';
                card.offsetHeight;
                card.style.animation = 'staggerFadeUp 0.4s ease both';
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        noSpeakerResults.style.display = visibleCount === 0 ? 'block' : 'none';
    });

    searchClear.addEventListener('click', () => {
        speakerSearch.value = '';
        searchClear.style.display = 'none';
        speakerCards.forEach(card => {
            card.classList.remove('hidden');
            card.style.animation = 'staggerFadeUp 0.4s ease both';
        });
        noSpeakerResults.style.display = 'none';
        speakerSearch.focus();
    });

    // ===================== REGISTRATION FORM VALIDATION =====================
    const registrationForm = document.getElementById('registrationForm');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModal');

    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearFormErrors(registrationForm);

        const name = document.getElementById('regName');
        const email = document.getElementById('regEmail');
        const phone = document.getElementById('regPhone');
        const org = document.getElementById('regOrg');
        const event = document.getElementById('regEvent');
        let valid = true;

        // Name validation
        if (!name.value.trim()) {
            showError('nameError', 'Please enter your full name.', name);
            valid = false;
        } else if (name.value.trim().length < 2) {
            showError('nameError', 'Name must be at least 2 characters.', name);
            valid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            showError('emailError', 'Please enter your email address.', email);
            valid = false;
        } else if (!emailRegex.test(email.value.trim())) {
            showError('emailError', 'Please enter a valid email address.', email);
            valid = false;
        }

        // Phone validation
        const phoneClean = phone.value.replace(/[\s\-\+\(\)]/g, '');
        if (!phone.value.trim()) {
            showError('phoneError', 'Please enter your phone number.', phone);
            valid = false;
        } else if (phoneClean.length < 10 || phoneClean.length > 13 || !/^\d+$/.test(phoneClean)) {
            showError('phoneError', 'Please enter a valid phone number (10-13 digits).', phone);
            valid = false;
        }

        // Event selection
        if (!event.value) {
            showError('eventError', 'Please select an event.', event);
            valid = false;
        }

        if (valid) {
            const btn = document.getElementById('registerSubmitBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
            btn.disabled = true;

            const payload = {
                name: name.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                organization: org.value.trim(),
                event: event.value
            };

            fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => { throw new Error(data.error || 'Server error occurred'); });
                }
                return response.json();
            })
            .then(data => {
                const ticketNumber = data.registration.ticket_number;
                const eventNames = {
                    'full-day': 'Full Day Pass',
                    'ai-workshop': 'AI & LLM Workshop',
                    'cybersecurity-ctf': 'Cybersecurity CTF',
                    'startup-pitch': 'Startup Pitch Competition',
                    'networking-only': 'Networking & After-Party'
                };

                document.getElementById('ticketName').textContent = data.registration.name;
                document.getElementById('ticketEmail').textContent = data.registration.email;
                document.getElementById('ticketEvent').textContent = eventNames[data.registration.event] || data.registration.event;
                document.getElementById('ticketNumber').textContent = ticketNumber;

                openModal(successModal);
                registrationForm.reset();
            })
            .catch(error => {
                console.error('Registration failed:', error);
                alert('Registration failed: ' + error.message + '\n\nMake sure the Flask backend is running (python app.py).');
            })
            .finally(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
        }
    });

    closeModalBtn.addEventListener('click', () => closeModal(successModal));
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) closeModal(successModal);
    });

    // ===================== CONTACT FORM VALIDATION =====================
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearFormErrors(contactForm);

        const name = document.getElementById('contactName');
        const email = document.getElementById('contactEmail');
        const subject = document.getElementById('contactSubject');
        const message = document.getElementById('contactMessage');
        let valid = true;

        if (!name.value.trim()) {
            showError('contactNameError', 'Please enter your name.', name);
            valid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            showError('contactEmailError', 'Please enter your email.', email);
            valid = false;
        } else if (!emailRegex.test(email.value.trim())) {
            showError('contactEmailError', 'Please enter a valid email.', email);
            valid = false;
        }

        if (!subject.value.trim()) {
            showError('contactSubjectError', 'Please enter a subject.', subject);
            valid = false;
        }

        if (!message.value.trim()) {
            showError('contactMessageError', 'Please enter your message.', message);
            valid = false;
        } else if (message.value.trim().length < 10) {
            showError('contactMessageError', 'Message must be at least 10 characters.', message);
            valid = false;
        }

        if (valid) {
            const btn = document.getElementById('contactSubmitBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            const payload = {
                name: name.value.trim(),
                email: email.value.trim(),
                subject: subject.value.trim(),
                message: message.value.trim()
            };

            fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => { throw new Error(data.error || 'Server error occurred'); });
                }
                return response.json();
            })
            .then(data => {
                btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                btn.style.background = 'linear-gradient(135deg, hsl(155, 70%, 45%), hsl(170, 70%, 40%))';
                
                // Confetti-like particles
                createSuccessParticles(btn);

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                    contactForm.reset();
                }, 3000);
            })
            .catch(error => {
                console.error('Contact submit failed:', error);
                alert('Failed to send message: ' + error.message + '\n\nMake sure the Flask backend is running (python app.py).');
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
        }
    });

    // ===================== FORM HELPERS =====================
    function showError(errorId, message, input) {
        const errorEl = document.getElementById(errorId);
        errorEl.textContent = message;
        errorEl.style.animation = 'none';
        errorEl.offsetHeight;
        errorEl.style.animation = 'shakeError 0.4s ease';
        if (input) {
            input.closest('.form-group').classList.add('error');
            // Shake animation
            input.style.animation = 'none';
            input.offsetHeight;
            input.style.animation = 'shakeInput 0.4s ease';
        }
    }

    function clearFormErrors(form) {
        form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        form.querySelectorAll('.form-group').forEach(el => el.classList.remove('error'));
    }

    // Live clear error on input
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.form-group');
            if (group) {
                group.classList.remove('error');
                const errorEl = group.querySelector('.form-error');
                if (errorEl) errorEl.textContent = '';
            }
        });
    });

    // ===================== MODAL HELPERS =====================
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ===================== FAQ ACCORDION =====================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items (accordion mode)
            faqItems.forEach(other => {
                other.classList.remove('active');
                other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Toggle current
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ===================== LEGAL PAGE MODALS =====================
    const legalLinks = document.querySelectorAll('.legal-link');
    const allLegalModals = document.querySelectorAll('.legal-modal');

    legalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = link.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) openModal(modal);
        });
    });

    // Close legal modals
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) closeModal(modal);
        });
    });

    // Close on overlay click
    allLegalModals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    // ===================== BUTTON RIPPLE EFFECT =====================
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = this.querySelector('.btn-ripple');
            if (!ripple) return;

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            ripple.classList.remove('animate');
            ripple.offsetHeight; // trigger reflow
            ripple.classList.add('animate');
        });

        // Magnetic hover effect
        btn.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) * 0.15;
            const deltaY = (e.clientY - centerY) * 0.15;
            this.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });

        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // ===================== TILT CARD EFFECT =====================
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
            this.style.boxShadow = `${-rotateY}px ${rotateX}px 30px var(--accent-glow)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });

    // ===================== SUCCESS PARTICLES =====================
    function createSuccessParticles(element) {
        const rect = element.getBoundingClientRect();
        const colors = ['#4ade80', '#22d3ee', '#a78bfa', '#f472b6', '#fbbf24'];

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: ${4 + Math.random() * 6}px;
                height: ${4 + Math.random() * 6}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                z-index: 99999;
                pointer-events: none;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
            `;
            document.body.appendChild(particle);

            const angle = (Math.PI * 2 * i) / 20;
            const velocity = 60 + Math.random() * 80;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity - 40;

            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
            ], {
                duration: 700 + Math.random() * 300,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                fill: 'forwards'
            }).onfinish = () => particle.remove();
        }
    }

    // ===================== PARALLAX ON MOUSE MOVE (HERO) =====================
    const heroContent = document.querySelector('.hero-content');
    const heroOrbs = document.querySelectorAll('.hero-orb');

    document.querySelector('.hero').addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const moveX = (clientX - centerX) / centerX;
        const moveY = (clientY - centerY) / centerY;

        heroContent.style.transform = `translate(${moveX * 5}px, ${moveY * 5}px)`;

        heroOrbs.forEach((orb, i) => {
            const speed = (i + 1) * 12;
            orb.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
        });
    });

    document.querySelector('.hero').addEventListener('mouseleave', () => {
        heroContent.style.transform = '';
        heroOrbs.forEach(orb => { orb.style.transform = ''; });
    });

    // ===================== SCROLL PROGRESS BAR =====================
    const scrollProgressBar = document.createElement('div');
    scrollProgressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--accent), var(--secondary));
        z-index: 9999;
        transition: width 0.05s linear;
        border-radius: 0 2px 2px 0;
    `;
    document.body.appendChild(scrollProgressBar);

    window.addEventListener('scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = (window.scrollY / scrollHeight) * 100;
        scrollProgressBar.style.width = scrollProgress + '%';
    });

    // ===================== BACK TO TOP =====================
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===================== SMOOTH SCROLL (fallback) =====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ===================== KEYBOARD: ESCAPE CLOSES ALL MODALS =====================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close success modal
            if (successModal.classList.contains('active')) {
                closeModal(successModal);
            }
            // Close legal modals
            allLegalModals.forEach(modal => {
                if (modal.classList.contains('active')) closeModal(modal);
            });
            // Close mobile nav
            if (navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // ===================== ADMIN LOGIN FORM HANDLER =====================
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminLoginError = document.getElementById('adminLoginError');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            adminLoginError.innerHTML = '';
            
            const usernameInput = document.getElementById('adminUsername');
            const passwordInput = document.getElementById('adminPassword');
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            const submitBtn = document.getElementById('adminLoginSubmitBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('http://localhost:5000/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Invalid credentials');
                }

                // Authentication succeeded
                sessionStorage.setItem('adminToken', data.token);
                
                // Redirect to admin dashboard
                window.location.href = 'admin.html';
                
            } catch (err) {
                console.error('Admin authentication failed:', err);
                adminLoginError.innerHTML = `<i class="fas fa-times-circle"></i> ${err.message}`;
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ===================== CSS SHAKE KEYFRAMES (inject) =====================
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shakeInput {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
        }
        @keyframes shakeError {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-3px); }
            40% { transform: translateX(3px); }
            60% { transform: translateX(-2px); }
            80% { transform: translateX(2px); }
        }
    `;
    document.head.appendChild(shakeStyle);

});
