document.addEventListener('DOMContentLoaded', () => {
    // Toast Notification Helper
    function showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.querySelector('.toast-message').textContent = message;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 5000);
        }
    }

    // Check if user is authenticated (composer form only renders when logged in)
    const form = document.getElementById('composer-form');
    const isUserLoggedIn = (form !== null);

    if (isUserLoggedIn) {
        // =========================================================
        // 1. DASHBOARD & WORKSPACE LOGIC (Only runs when logged in)
        // =========================================================
        const wallpapers = [
            {
                id: 'think_bigger',
                name: 'Think Bigger',
                url: '/static/images/wallpaper_think_bigger.jpg',
                tag: 'Aspiration',
                quote: '“Think bigger, think higher. Your limits are only where you decide to place them.”'
            },
            {
                id: 'staircase_success',
                name: 'Staircase of Success',
                url: '/static/images/wallpaper_staircase_success.jpg',
                tag: 'Execution',
                quote: '“Success is built on risks, focus, hustle, patience, and consistency.”'
            },
            {
                id: 'focus',
                name: 'Ultimate Focus',
                url: '/static/images/wallpaper_focus.jpg',
                tag: 'Focus',
                quote: '“Focus is the ultimate force multiplier. Keep your eyes on the goal.”'
            },
            {
                id: 'starts_small',
                name: 'Starts Small',
                url: '/static/images/wallpaper_starts_small.jpg',
                tag: 'Vision',
                quote: '“A big business starts small. Great things have humble beginnings.”'
            },
            {
                id: 'strong_mindset',
                name: 'Strong Mindset',
                url: '/static/images/wallpaper_strong_mindset.jpg',
                tag: 'Mindset',
                quote: '“A successful business starts with a strong mindset.”'
            },
            {
                id: 'master_yourself',
                name: 'Master Yourself',
                url: '/static/images/wallpaper_master_yourself.jpg',
                tag: 'Self Mastery',
                quote: '“Master yourself. Every pawn is a potential king or queen.”'
            }
        ];

        // Fetch dashboard elements
        const bgWrapper = document.getElementById('bg-wrapper');
        const activeThemeName = document.getElementById('active-theme-name');
        const mindsetWidgetBg = document.getElementById('mindset-widget-bg');
        const mindsetTag = document.getElementById('mindset-tag');
        const mindsetQuote = document.getElementById('mindset-quote');
        const submitBtn = document.getElementById('submit-btn');
        const submitText = document.getElementById('submit-text');
        const submitSpinner = document.getElementById('submit-spinner');
        const loadingWrapper = document.getElementById('loading-wrapper');
        const dashboardGrid = document.getElementById('dashboard-grid');
        const ideaTextarea = document.getElementById('startup-idea');
        const nameInput = document.getElementById('startup-name');
        const industryInput = document.getElementById('startup-industry');
        const suggestionTags = document.querySelectorAll('.suggestion-tag');
        
        // Profile dropdown menu elements
        const userAvatarTrigger = document.getElementById('user-avatar-trigger');
        const userDropdown = document.getElementById('user-dropdown');

        // Tab Elements
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Result Content Elements
        const bizContent = document.getElementById('biz-content');
        const mktContent = document.getElementById('mkt-content');
        const livePreviewFrame = document.getElementById('live-preview-frame');
        const htmlCodeBox = document.getElementById('html-code-box');
        
        // Downloads Elements
        const dlBizBtn = document.getElementById('dl-biz-btn');
        const dlMktBtn = document.getElementById('dl-mkt-btn');
        const dlHtmlBtn = document.getElementById('dl-html-btn');
        
        // Copy buttons
        const copyBizBtn = document.getElementById('copy-biz-btn');
        const copyMktBtn = document.getElementById('copy-mkt-btn');
        const copyHtmlBtn = document.getElementById('copy-html-btn');

        // State Variables
        let currentData = null;

        // Theme management helper
        function setTheme(wallpaperId) {
            const theme = wallpapers.find(w => w.id === wallpaperId) || wallpapers[0];
            
            if (bgWrapper) bgWrapper.style.backgroundImage = `url('${theme.url}')`;
            if (activeThemeName) activeThemeName.textContent = theme.name;
            
            if (mindsetWidgetBg) {
                mindsetWidgetBg.style.backgroundImage = `url('${theme.url}')`;
                mindsetTag.textContent = theme.tag;
                mindsetQuote.textContent = theme.quote;
            }

            document.querySelectorAll('.apply-theme-btn').forEach(btn => {
                if (btn.getAttribute('data-id') === theme.id) {
                    btn.classList.add('active-theme');
                    btn.innerHTML = '<span class="status-dot"></span> Active';
                } else {
                    btn.classList.remove('active-theme');
                    btn.textContent = 'Apply Theme';
                }
            });

            localStorage.setItem('selected_theme', theme.id);
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('selected_theme') || 'think_bigger';
        setTheme(savedTheme);

        // Bind Theme Click actions
        document.querySelectorAll('.apply-theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const themeId = e.currentTarget.getAttribute('data-id');
                setTheme(themeId);
                showToast(`Theme changed to "${themeId.replace('_', ' ')}"`);
            });
        });

        // User Avatar Dropdown Toggle
        if (userAvatarTrigger && userDropdown) {
            userAvatarTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
            
            document.addEventListener('click', () => {
                userDropdown.classList.remove('show');
            });
        }

        // Suggestion autofill handler
        suggestionTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const name = e.currentTarget.getAttribute('data-name');
                const industry = e.currentTarget.getAttribute('data-industry');
                const idea = e.currentTarget.getAttribute('data-idea');
                
                nameInput.value = name;
                industryInput.value = industry;
                ideaTextarea.value = idea;
                
                ideaTextarea.focus();
                showToast(`Loaded template: "${name}"`);
            });
        });

        // Tab switches
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.getAttribute('data-tab');
                
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                e.currentTarget.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // SVG gauge rings offset math
        function animateScoreGauges(scores) {
            const circumference = 138;
            const gauges = [
                { id: 'gauge-overall', val: scores.overall },
                { id: 'gauge-market', val: scores.market },
                { id: 'gauge-problem', val: scores.problem },
                { id: 'gauge-revenue', val: scores.revenue }
            ];

            gauges.forEach(g => {
                const element = document.getElementById(g.id);
                if (element) {
                    const circle = element.querySelector('.val-circle');
                    const text = element.querySelector('.score-value');
                    
                    const offset = circumference - (g.val / 10) * circumference;
                    circle.style.strokeDashoffset = offset;
                    
                    let currentVal = 0;
                    const targetVal = g.val;
                    const timer = setInterval(() => {
                        currentVal += targetVal / 50;
                        if (currentVal >= targetVal) {
                            currentVal = targetVal;
                            clearInterval(timer);
                        }
                        text.textContent = currentVal.toFixed(1);
                    }, 20);
                }
            });
        }

        // Helper to safely parse markdown even if marked.js is blocked by a CDN blocker
        function markdownParse(text) {
            if (typeof marked !== 'undefined' && marked && marked.parse) {
                return marked.parse(text);
            }
            // Fallback markdown parsing
            return String(text || '')
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n\n/g, "</p><p>")
                .replace(/\n/g, "<br>")
                .replace(/#\s+(.+)/g, "<h1>$1</h1>")
                .replace(/##\s+(.+)/g, "<h2>$1</h2>")
                .replace(/###\s+(.+)/g, "<h3>$1</h3>")
                .replace(/\*\s+(.+)/g, "<li>$1</li>");
        }

        // Submit form (Generate)
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const industry = industryInput.value.trim();
            const idea = ideaTextarea.value.trim();

            if (!name || !idea) {
                showToast('Please enter both name and idea description!');
                return;
            }

            submitBtn.disabled = true;
            submitText.textContent = 'Analyzing...';
            submitSpinner.style.display = 'block';
            
            dashboardGrid.style.display = 'none';
            loadingWrapper.style.display = 'block';
            loadingWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });

            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, industry, idea })
                });

                const data = await response.json();
                
                if (response.ok) {
                    const bizPlan = data.biz_plan || data.business_plan || data.bizPlan || '';
                    const marketing = data.marketing || data.marketing_strategy || data.marketingStrategy || '';
                    const htmlCode = data.html_code || data.html || data.landing_page || data.landingPage || '';
                    const evalData = data.evaluation || data.eval || data.scores || {};

                    const scores = {
                        overall: parseFloat(evalData.overall || evalData.overall_score || 7.5),
                        market: parseFloat(evalData.market || evalData.market_score || 7.5),
                        problem: parseFloat(evalData.problem || evalData.problem_score || 7.5),
                        revenue: parseFloat(evalData.revenue || evalData.revenue_score || 7.5),
                        analysis: evalData.analysis || evalData.summary || 'Venture viability assessment completed.'
                    };

                    currentData = {
                        biz_plan: bizPlan,
                        marketing: marketing,
                        html_code: htmlCode,
                        evaluation: scores
                    };
                    
                    if (data.offline_fallback) {
                        showToast('💡 Running in demo mode. Add Groq key to .env for real-time AI.');
                    } else {
                        showToast('🎉 Startup Package Generated Successfully!');
                    }

                    bizContent.innerHTML = markdownParse(bizPlan);
                    mktContent.innerHTML = markdownParse(marketing);
                    livePreviewFrame.srcdoc = htmlCode;
                    htmlCodeBox.textContent = htmlCode;

                    setupDownload(dlBizBtn, `${name}_business_plan.md`, bizPlan, 'text/markdown');
                    setupDownload(dlMktBtn, `${name}_marketing_strategy.md`, marketing, 'text/markdown');
                    setupDownload(dlHtmlBtn, 'index.html', htmlCode, 'text/html');

                    document.getElementById('analysis-text').textContent = scores.analysis;
                    animateScoreGauges(scores);

                    loadingWrapper.style.display = 'none';
                    dashboardGrid.style.display = 'grid';
                    dashboardGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    throw new Error(data.error || 'Server error occurred');
                }
            } catch (error) {
                console.error(error);
                showToast(`❌ Error: ${error.message}`);
                loadingWrapper.style.display = 'none';
                
                const fallbackData = {
                    biz_plan: `# Business Plan for ${name}\n\n## 1. Executive Summary\n${name} is a new venture in the ${industry} sector focusing on solving: "${idea}". Our primary goal is to address immediate consumer paint points and scale operations efficiently.\n\n## 2. Target Market\nIdeal customer profile includes tech-savvy individuals and businesses seeking instant delivery/solutions in the ${industry} space.\n\n## 3. Revenue Model\nDirect transaction fees and tiered subscription access.`,
                    marketing: `# Marketing Strategy for ${name}\n\n## 1. Social Media Campaign\nLaunch awareness campaigns on Instagram and LinkedIn addressing: "${idea}".\n\n## 2. Referral Promotion\nOffer early-bird discounts for waitlist subscribers to boost initial virality.`,
                    html_code: `<!DOCTYPE html><html><head><title>${name}</title><style>body { font-family: sans-serif; background-color: #0f172a; color: white; text-align: center; padding: 50px; } h1 { color: #38bdf8; }</style></head><body><h1>Welcome to {name}</h1><p>${idea}</p><button style="background-color: #0284c7; color: white; border: none; padding: 12px 24px; border-radius: 9999px; font-weight: bold; cursor: pointer; margin-top: 20px;">Join Waitlist</button></body></html>`,
                    evaluation: { overall: 7.8, market: 8.0, problem: 7.0, revenue: 8.5, analysis: "Local fallback assessment generated due to server interface mismatch." }
                };
                
                currentData = fallbackData;
                bizContent.innerHTML = markdownParse(fallbackData.biz_plan);
                mktContent.innerHTML = markdownParse(fallbackData.marketing);
                livePreviewFrame.srcdoc = fallbackData.html_code;
                htmlCodeBox.textContent = fallbackData.html_code;
                
                setupDownload(dlBizBtn, `${name}_business_plan.md`, fallbackData.biz_plan, 'text/markdown');
                setupDownload(dlMktBtn, `${name}_marketing_strategy.md`, fallbackData.marketing, 'text/markdown');
                setupDownload(dlHtmlBtn, 'index.html', fallbackData.html_code, 'text/html');
                
                document.getElementById('analysis-text').textContent = fallbackData.evaluation.analysis;
                animateScoreGauges(fallbackData.evaluation);
                
                dashboardGrid.style.display = 'grid';
                dashboardGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                showToast('Loaded local fallback details.');
            } finally {
                submitBtn.disabled = false;
                submitText.textContent = '🚀 Generate Startup Package';
                submitSpinner.style.display = 'none';
            }
        });

        // Helper: Downloads
        function setupDownload(element, filename, content, mimeType) {
            if (element) {
                const blob = new Blob([content], { type: mimeType });
                const url = URL.createObjectURL(blob);
                element.setAttribute('href', url);
                element.setAttribute('download', filename);
            }
        }

        // Helper: Copying
        async function copyToClipboard(text, successMsg) {
            try {
                await navigator.clipboard.writeText(text);
                showToast(successMsg);
            } catch (err) {
                showToast('Failed to copy code to clipboard.');
            }
        }

        if (copyBizBtn) copyBizBtn.addEventListener('click', () => {
            if (currentData) copyToClipboard(currentData.biz_plan, '📋 Business Plan copied to clipboard!');
        });

        if (copyMktBtn) copyMktBtn.addEventListener('click', () => {
            if (currentData) copyToClipboard(currentData.marketing, '📋 Marketing Strategy copied to clipboard!');
        });

        if (copyHtmlBtn) copyHtmlBtn.addEventListener('click', () => {
            if (currentData) copyToClipboard(currentData.html_code, '📋 HTML Code copied to clipboard!');
        });

    } else {
        // =========================================================
        // 2. AUTHENTICATION FLOW (Only runs when logged out)
        // =========================================================
        const authForm = document.getElementById('auth-form');
        const authSwitchLink = document.getElementById('auth-switch-link');
        const authSubmitText = document.getElementById('auth-submit-text');
        const authHeaderText = document.getElementById('auth-header-text');
        const authSubText = document.getElementById('auth-sub-text');
        const authSwitchPrompt = document.getElementById('auth-switch-prompt');
        const googleSigninMock = document.getElementById('google-signin-mock');
        const authSpinner = document.getElementById('auth-spinner');
        
        let isLoginMode = false; // Starts in Sign Up (Register) mode

        if (authSwitchLink) {
            authSwitchLink.addEventListener('click', () => {
                isLoginMode = !isLoginMode;
                if (isLoginMode) {
                    authHeaderText.textContent = 'Sign in to your account';
                    authSubText.textContent = 'Welcome back! Enter your credentials to continue.';
                    authSubmitText.textContent = 'Sign In';
                    authSwitchPrompt.textContent = "Don't have an account?";
                    authSwitchLink.textContent = 'Sign up';
                } else {
                    authHeaderText.textContent = 'Create your account';
                    authSubText.textContent = 'Welcome! Please fill in the details to get started.';
                    authSubmitText.textContent = 'Continue';
                    authSwitchPrompt.textContent = 'Already have an account?';
                    authSwitchLink.textContent = 'Sign in';
                }
            });
        }

        if (authForm) {
            authForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('auth-email').value.trim();
                const password = document.getElementById('auth-password').value;

                const endpoint = isLoginMode ? '/api/login' : '/api/register';
                
                document.getElementById('auth-submit-btn').disabled = true;
                if (authSpinner) authSpinner.style.display = 'block';
                authSubmitText.textContent = isLoginMode ? 'Signing in...' : 'Registering...';

                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();
                    if (response.ok && data.success) {
                        showToast(data.message);
                        setTimeout(() => {
                            window.location.reload();
                        }, 800);
                    } else {
                        showToast(`❌ ${data.error || 'Authentication failed'}`);
                    }
                } catch (err) {
                    showToast(`❌ Network error: ${err.message}`);
                } finally {
                    document.getElementById('auth-submit-btn').disabled = false;
                    if (authSpinner) authSpinner.style.display = 'none';
                    authSubmitText.textContent = isLoginMode ? 'Sign In' : 'Continue';
                }
            });
        }

        if (googleSigninMock) {
            googleSigninMock.addEventListener('click', async () => {
                showToast('🌐 Authenticating via Google Sign-In...');
                
                const email = '1217abhinav@gmail.com';
                const password = 'google-signin-mocked-password-12345';
                
                try {
                    let response = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    let data = await response.json();
                    
                    if (!response.ok) {
                        // Register since user doesn't exist yet
                        response = await fetch('/api/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password })
                        });
                        data = await response.json();
                    }
                    
                    if (data.success) {
                        showToast('🎉 Signed in with Google as Abhinav Verma!');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } else {
                        showToast(`❌ Google Auth Mock failed: ${data.error}`);
                    }
                } catch (err) {
                    showToast(`❌ Connection error during Google Sign-In.`);
                }
            });
        }
    }
});
