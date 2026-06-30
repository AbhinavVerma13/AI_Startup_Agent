document.addEventListener('DOMContentLoaded', () => {
    // Wallpaper/Theme Configs
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

    // DOM Elements
    const bgWrapper = document.getElementById('bg-wrapper');
    const activeThemeName = document.getElementById('active-theme-name');
    const mindsetWidgetBg = document.getElementById('mindset-widget-bg');
    const mindsetTag = document.getElementById('mindset-tag');
    const mindsetQuote = document.getElementById('mindset-quote');
    const form = document.getElementById('composer-form');
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');
    const loadingWrapper = document.getElementById('loading-wrapper');
    const dashboardGrid = document.getElementById('dashboard-grid');
    const ideaTextarea = document.getElementById('startup-idea');
    const nameInput = document.getElementById('startup-name');
    const industrySelect = document.getElementById('startup-industry');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');
    
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

    // Theme Management
    function setTheme(wallpaperId) {
        const theme = wallpapers.find(w => w.id === wallpaperId) || wallpapers[0];
        
        // Fullscreen blurred background
        bgWrapper.style.backgroundImage = `url('${theme.url}')`;
        activeThemeName.textContent = theme.name;
        
        // Mindset card background & text
        if (mindsetWidgetBg) {
            mindsetWidgetBg.style.backgroundImage = `url('${theme.url}')`;
            mindsetTag.textContent = theme.tag;
            mindsetQuote.textContent = theme.quote;
        }

        // Update active class on gallery buttons
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

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('selected_theme') || 'think_bigger';
    setTheme(savedTheme);

    // Bind Gallery Theme Buttons
    document.querySelectorAll('.apply-theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const themeId = e.currentTarget.getAttribute('data-id');
            setTheme(themeId);
            showToast(`Theme changed to "${themeId.replace('_', ' ')}"`);
        });
    });

    // Suggestion Tag Clicks
    suggestionTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            const name = e.currentTarget.getAttribute('data-name');
            const industry = e.currentTarget.getAttribute('data-industry');
            const idea = e.currentTarget.getAttribute('data-idea');
            
            nameInput.value = name;
            industrySelect.value = industry;
            ideaTextarea.value = idea;
            
            // Highlight the text area
            ideaTextarea.focus();
            showToast(`Loaded template: "${name}"`);
        });
    });

    // Tabs Switcher
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.currentTarget.getAttribute('data-tab');
            
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            e.currentTarget.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Score Gauge Animater
    function animateScoreGauges(scores) {
        // Circumference of our circles is 2 * PI * 22 = ~138.2
        const circumference = 138;
        
        const gauges = [
            { id: 'gauge-overall', val: scores.overall },
            { id: 'gauge-market', val: scores.market },
            { id: 'gauge-problem', val: scores.problem },
            { id: 'gauge-revenue', val: scores.revenue }
        ];

        gauges.forEach(g => {
            const element = document.getElementById(g.id);
            const circle = element.querySelector('.val-circle');
            const text = element.parentElement.querySelector('.score-value');
            
            // Calculate dashoffset
            const offset = circumference - (g.val / 10) * circumference;
            circle.style.strokeDashoffset = offset;
            
            // Animate text count up
            let currentVal = 0;
            const targetVal = g.val;
            const duration = 1000; // 1 second
            const interval = 20;
            const step = targetVal / (duration / interval);
            
            const timer = setInterval(() => {
                currentVal += step;
                if (currentVal >= targetVal) {
                    currentVal = targetVal;
                    clearInterval(timer);
                }
                text.textContent = currentVal.toFixed(1);
            }, interval);
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

    // Submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const industry = industrySelect.value;
        const idea = ideaTextarea.value.trim();

        if (!name || !idea) {
            showToast('Please enter both name and idea description!');
            return;
        }

        // UI State: Loading
        submitBtn.disabled = true;
        submitText.textContent = 'Analyzing...';
        submitSpinner.style.display = 'block';
        
        dashboardGrid.style.display = 'none';
        loadingWrapper.style.display = 'block';
        
        // Scroll to loading wrapper
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
                // Safeguard keys from any variations in LLM JSON format
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

                // Store cleaned data in state
                currentData = {
                    biz_plan: bizPlan,
                    marketing: marketing,
                    html_code: htmlCode,
                    evaluation: scores
                };
                
                // Show offline mode notification if key wasn't present
                if (data.offline_fallback) {
                    showToast('💡 Running in demo mode. Add Groq key to .env for real-time AI.');
                } else {
                    showToast('🎉 Startup Package Generated Successfully!');
                }

                // Render deliverables using safe markdown parser
                bizContent.innerHTML = markdownParse(bizPlan);
                mktContent.innerHTML = markdownParse(marketing);
                
                // Load HTML in iframe safely using srcdoc (avoids cross-origin access blocks)
                livePreviewFrame.srcdoc = htmlCode;

                // Load HTML in Code block
                htmlCodeBox.textContent = htmlCode;

                // Set download data URIs
                setupDownload(dlBizBtn, `${name}_business_plan.md`, bizPlan, 'text/markdown');
                setupDownload(dlMktBtn, `${name}_marketing_strategy.md`, marketing, 'text/markdown');
                setupDownload(dlHtmlBtn, 'index.html', htmlCode, 'text/html');

                // Animate gauges & set detailed analysis
                document.getElementById('analysis-text').textContent = scores.analysis;
                animateScoreGauges(scores);

                // Show UI State: Complete
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
            
            // Set fallback local data so app remains fully responsive
            const fallbackData = {
                biz_plan: `# Business Plan for ${name}\n\n## 1. Executive Summary\n${name} is a new venture in the ${industry} sector focusing on solving: "${idea}". Our primary goal is to address immediate consumer paint points and scale operations efficiently.\n\n## 2. Target Market\nIdeal customer profile includes tech-savvy individuals and businesses seeking instant delivery/solutions in the ${industry} space.\n\n## 3. Revenue Model\nDirect transaction fees and tiered subscription access.`,
                marketing: `# Marketing Strategy for ${name}\n\n## 1. Social Media Campaign\nLaunch awareness campaigns on Instagram and LinkedIn addressing: "${idea}".\n\n## 2. Referral Promotion\nOffer early-bird discounts for waitlist subscribers to boost initial virality.`,
                html_code: `<!DOCTYPE html><html><head><title>${name}</title><style>body { font-family: sans-serif; background-color: #0f172a; color: white; text-align: center; padding: 50px; } h1 { color: #38bdf8; }</style></head><body><h1>Welcome to ${name}</h1><p>${idea}</p><button style="background-color: #0284c7; color: white; border: none; padding: 12px 24px; border-radius: 9999px; font-weight: bold; cursor: pointer; margin-top: 20px;">Join Waitlist</button></body></html>`,
                evaluation: { overall: 7.8, market: 8.0, problem: 7.0, revenue: 8.5, analysis: "Local fallback assessment generated due to server interface mismatch." }
            };
            
            currentData = fallbackData;
            bizContent.innerHTML = markdownParse(fallbackData.biz_plan);
            mktContent.innerHTML = markdownParse(fallbackData.marketing);
            
            // Load HTML in iframe safely using srcdoc (avoids cross-origin access blocks)
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

    // Helper: Setup downloads using blobs
    function setupDownload(element, filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        element.setAttribute('href', url);
        element.setAttribute('download', filename);
    }

    // Helper: Toast Notifications
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.querySelector('.toast-message').textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    // Clipboard Copy Helper
    async function copyToClipboard(text, successMsg) {
        try {
            await navigator.clipboard.writeText(text);
            showToast(successMsg);
        } catch (err) {
            showToast('Failed to copy code to clipboard.');
        }
    }

    // Bind copy actions
    copyBizBtn.addEventListener('click', () => {
        if (currentData) copyToClipboard(currentData.biz_plan, '📋 Business Plan copied to clipboard!');
    });

    copyMktBtn.addEventListener('click', () => {
        if (currentData) copyToClipboard(currentData.marketing, '📋 Marketing Strategy copied to clipboard!');
    });

    copyHtmlBtn.addEventListener('click', () => {
        if (currentData) copyToClipboard(currentData.html_code, '📋 HTML Code copied to clipboard!');
    });
});
