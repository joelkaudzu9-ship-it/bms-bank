// Main Application - BMS BANK Premium with Study Tracker
class BMSBank {
    constructor() {
        this.resources = [];
        this.categories = [];
        this.currentWeek = 'all';
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.currentSort = 'newest';
        this.page = 1;
        this.hasMore = true;
        this.loading = false;
        this.totalResources = 0;
        this.isFirstLoad = true;
        this.showTracker = false;
        
        // Point to the PDF file in assets folder
        this.trackerPDFUrl = 'assets/Accountability Tracker.pdf';
        
        // Week date mapping
        this.WEEK_DATES = {
            1: "15-19 June 2026",
            2: "22-26 June 2026",
            3: "29 June - 3 July 2026",
            4: "6-10 July 2026",
            5: "13-17 July 2026",
            6: "20-24 July 2026",
            7: "27-31 July 2026",
            8: "3-7 August 2026",
            9: "10-14 August 2026",
            10: "17-23 August 2026",
            11: "24-28 August 2026",
            12: "31 August - 4 September 2026",
            13: "7-11 September 2026",
            14: "14-18 September 2026",
            15: "21-25 September 2026",
            16: "28 September - 2 October 2026",
            17: "5-9 October 2026",
            18: "12-16 October 2026",
            19: "19-23 October 2026",
        };
        
        // Load timetable data from global variable
        this.TIMETABLE = typeof TIMETABLE_DATA !== 'undefined' ? TIMETABLE_DATA : {};
        
        // Download stats - tracks PDF downloads
        this.downloadStats = JSON.parse(localStorage.getItem('bms-tracker-downloads') || '{"count":0,"history":[]}');
        
        this.init();
    }

    async init() {
        this.showLoadingScreen();
        await this.loadCategories();
        await this.loadResources();
        
        // Set default sort dropdown
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.value = 'newest';
        }
        
        this.setupEventListeners();
        this.setupWeekNavigation();
        this.setupThemeToggle();
        this.setupKeyboardShortcuts();
        this.setupQuickAccess();
        this.setupHeroParticles();
        this.setupTrackerToggle();
        this.setupScrollToTop();
        this.hideLoadingScreen();
        this.updateStats();
        this.updateProgressBar();
        this.updateDownloadStats();
    }

    // ============================================
    // SCROLL TO RESOURCES
    // ============================================
    scrollToResources() {
        const container = document.getElementById('resourcesContainer');
        if (container) {
            const headerOffset = 80;
            const elementPosition = container.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    // ============================================
    // SCROLL TO TOP BUTTON
    // ============================================
    setupScrollToTop() {
        const btn = document.getElementById('scrollTopBtn');
        if (!btn) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
    }

    // ============================================
    // TRACK POPULAR RESOURCES
    // ============================================
    trackResourceView(resourceId) {
        let views = JSON.parse(localStorage.getItem('bms-resource-views') || '{}');
        views[resourceId] = (views[resourceId] || 0) + 1;
        localStorage.setItem('bms-resource-views', JSON.stringify(views));
        this.updatePopularBadge(resourceId, views[resourceId]);
    }

    updatePopularBadge(resourceId, viewCount) {
        const card = document.querySelector(`.resource-card[data-id="${resourceId}"]`);
        if (!card) return;
        
        if (viewCount > 10) {
            const badge = card.querySelector('.popular-badge');
            if (!badge) {
                const badgeContainer = card.querySelector('.resource-card-badge');
                if (badgeContainer) {
                    const span = document.createElement('span');
                    span.className = 'popular-badge';
                    span.innerHTML = `<i class="fas fa-fire" style="color: #f59e0b;"></i> Popular`;
                    badgeContainer.appendChild(span);
                }
            }
        }
    }

    // ============================================
    // DOWNLOAD STATS
    // ============================================
    updateDownloadStats() {
        const stats = this.downloadStats;
        const countEl = document.getElementById('trackerDownloadCount');
        const historyEl = document.getElementById('trackerDownloadHistory');
        
        if (countEl) {
            countEl.textContent = stats.count;
        }
        
        if (historyEl) {
            if (stats.history && stats.history.length > 0) {
                const recent = stats.history.slice(-5).reverse();
                historyEl.innerHTML = recent.map(entry => 
                    `<span class="download-entry"><i class="fas fa-clock"></i> ${entry}</span>`
                ).join('');
            } else {
                historyEl.innerHTML = `<span class="download-entry" style="opacity:0.5;">No downloads yet</span>`;
            }
        }
    }

    trackDownload() {
        this.downloadStats.count++;
        const now = new Date();
        const timestamp = now.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        this.downloadStats.history.push(timestamp);
        localStorage.setItem('bms-tracker-downloads', JSON.stringify(this.downloadStats));
        this.updateDownloadStats();
    }

    // ============================================
    // DOWNLOAD TRACKER PDF
    // ============================================
    downloadTrackerPDF() {
        this.trackDownload();
        const printWindow = window.open(this.trackerPDFUrl, '_blank');
        if (printWindow) {
            printWindow.onload = function() {
                setTimeout(function() {
                    printWindow.print();
                }, 1000);
            };
        }
        this.showToast('📄 Opening PDF for printing...', 'info');
    }

    // ============================================
    // TRACKER TOGGLE
    // ============================================
    setupTrackerToggle() {
        const toggleBtn = document.getElementById('trackerToggle');
        if (!toggleBtn) return;
        
        toggleBtn.addEventListener('click', () => {
            this.toggleStudyTracker();
        });
    }

    toggleStudyTracker() {
        this.showTracker = !this.showTracker;
        const toggleBtn = document.getElementById('trackerToggle');
        if (toggleBtn) {
            toggleBtn.classList.toggle('active', this.showTracker);
            toggleBtn.innerHTML = this.showTracker 
                ? '<i class="fas fa-th-list"></i>' 
                : '<i class="fas fa-check-double"></i>';
            toggleBtn.title = this.showTracker ? 'View Resources' : 'Study Tracker';
        }
        
        if (this.showTracker) {
            this.renderStudyTracker();
        } else {
            this.renderResources();
        }
        
        setTimeout(() => this.scrollToResources(), 300);
    }

    // ============================================
    // STUDY TRACKER
    // ============================================
    renderStudyTracker() {
        const container = document.getElementById('resourcesContainer');
        let week = this.currentWeek === 'all' ? 1 : parseInt(this.currentWeek);
        
        if (this.currentWeek === 'all') {
            const weeks = Object.keys(this.TIMETABLE);
            if (weeks.length > 0) {
                week = parseInt(weeks[0]);
            }
        }
        
        const weekData = this.TIMETABLE[week];
        
        if (!weekData || !weekData.days) {
            container.innerHTML = `
                <div class="empty-state" style="text-align:center;padding:4rem 1rem;">
                    <div style="font-size:3rem;margin-bottom:1rem;opacity:0.3;">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <h3 style="font-size:1.2rem;margin-bottom:0.25rem;color:var(--text);">No timetable data for Week ${week}</h3>
                    <p style="color:var(--text-muted);margin-bottom:1rem;">The timetable data is being loaded. Please check back later.</p>
                    <button class="btn-premium" onclick="window.bmsBank.toggleStudyTracker()">
                        <i class="fas fa-arrow-left"></i> Back to Resources
                    </button>
                </div>
            `;
            return;
        }

        const weekDate = this.WEEK_DATES[week] || '';
        const days = Object.keys(weekData.days).filter(day => 
            weekData.days[day] && weekData.days[day].length > 0
        );
        
        let total = 0;
        let studied = 0;
        let revised = 0;
        
        Object.keys(weekData.days).forEach(day => {
            const activities = weekData.days[day].filter(a => 
                a.activity && !a.activity.includes('NO') && !a.activity.includes('PUBLIC HOLIDAY') && !a.activity.includes('BREAK')
            );
            activities.forEach((activity, idx) => {
                const id = `tracker_${week}_${day}_${idx}`;
                total++;
                if (localStorage.getItem(id + '_studied') === 'true') studied++;
                if (localStorage.getItem(id + '_revised') === 'true') revised++;
            });
        });
        
        const pct = total > 0 ? Math.round((studied / total) * 100) : 0;
        const stats = this.downloadStats;
        
        let html = `
            <div class="tracker-header">
                <div class="tracker-header-left">
                    <h2><i class="fas fa-check-double" style="color: var(--secondary);"></i> Week ${week} Study Tracker</h2>
                    <span class="week-date">${weekDate}</span>
                </div>
                <div class="tracker-header-actions">
                    <button class="btn-premium btn-tracker-download" onclick="window.bmsBank.downloadTrackerPDF()">
                        <i class="fas fa-file-pdf"></i> Download PDF
                        <span class="download-badge" id="trackerDownloadCount">${stats.count}</span>
                    </button>
                    <button class="btn-premium-outline btn-tracker-reset" onclick="window.bmsBank.resetTracker(${week})">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                </div>
            </div>
            <div class="tracker-stats-bar glass">
                <div class="tracker-stat-item">
                    <span class="tracker-stat-value">${total}</span>
                    <span class="tracker-stat-label">Total Activities</span>
                </div>
                <div class="tracker-stat-divider"></div>
                <div class="tracker-stat-item">
                    <span class="tracker-stat-value" style="color: var(--secondary);">${studied}</span>
                    <span class="tracker-stat-label">Studied</span>
                </div>
                <div class="tracker-stat-divider"></div>
                <div class="tracker-stat-item">
                    <span class="tracker-stat-value" style="color: var(--success);">${revised}</span>
                    <span class="tracker-stat-label">Revised</span>
                </div>
                <div class="tracker-stat-divider"></div>
                <div class="tracker-stat-item">
                    <span class="tracker-stat-value">${pct}%</span>
                    <span class="tracker-stat-label">Complete</span>
                </div>
                <div class="tracker-stat-divider"></div>
                <div class="tracker-stat-item">
                    <span class="tracker-stat-value"><i class="fas fa-download" style="font-size:0.9rem;"></i> ${stats.count}</span>
                    <span class="tracker-stat-label">PDF Downloads</span>
                </div>
            </div>
            <div class="tracker-progress glass">
                <div class="tracker-progress-bar">
                    <div class="tracker-progress-fill" id="trackerProgressFill" style="width: ${pct}%;"></div>
                </div>
                <span class="tracker-progress-text">${pct}% Complete (${studied}/${total} studied, ${revised} revised)</span>
            </div>
            <div class="tracker-grid">
        `;

        days.forEach(day => {
            const activities = weekData.days[day].filter(a => 
                a.activity && !a.activity.includes('NO') && !a.activity.includes('PUBLIC HOLIDAY') && !a.activity.includes('BREAK')
            );
            if (activities.length === 0) return;
            
            let dayStudied = 0;
            activities.forEach((activity, idx) => {
                const id = `tracker_${week}_${day}_${idx}`;
                if (localStorage.getItem(id + '_studied') === 'true') dayStudied++;
            });
            
            html += `
                <div class="tracker-day glass">
                    <div class="tracker-day-header">
                        <h3><i class="fas fa-calendar-day"></i> ${day}</h3>
                        <span class="tracker-day-count">${dayStudied}/${activities.length}</span>
                    </div>
                    <div class="tracker-activities">
            `;
            
            activities.forEach((activity, idx) => {
                const id = `tracker_${week}_${day}_${idx}`;
                const studiedVal = localStorage.getItem(id + '_studied') === 'true';
                const revisedVal = localStorage.getItem(id + '_revised') === 'true';
                
                let statusClass = '';
                if (studiedVal && revisedVal) statusClass = 'complete';
                else if (studiedVal) statusClass = 'studied';
                
                const isExam = activity.activity.includes('EXAM') || activity.activity.includes('BREAK');
                const isStudyWeek = activity.activity.includes('WEEK OF PEACE') || activity.activity.includes('STUDY WEEK');
                const isRevision = activity.activity.includes('REVISION') || activity.activity.includes('MAKE-UP');
                
                let activityClass = '';
                if (isExam) activityClass = 'exam';
                else if (isStudyWeek) activityClass = 'study-week';
                else if (isRevision) activityClass = 'revision';
                
                if (!activity.activity || activity.activity.trim() === '') return;
                
                html += `
                    <div class="tracker-activity ${statusClass} ${activityClass}" data-id="${id}">
                        <div class="tracker-activity-info">
                            ${activity.time && activity.time !== '00:00' ? `<span class="tracker-time">${activity.time}</span>` : ''}
                            <span class="tracker-activity-name">${this.escapeHtml(activity.activity)}</span>
                        </div>
                        ${!isExam && !isStudyWeek && !isRevision ? `
                            <div class="tracker-activity-actions">
                                <button class="tracker-btn studied ${studiedVal ? 'active' : ''}" onclick="window.bmsBank.toggleTrackerStatus('${id}', 'studied')" title="Mark as Studied">
                                    <i class="fas fa-book"></i>
                                </button>
                                <button class="tracker-btn revised ${revisedVal ? 'active' : ''}" onclick="window.bmsBank.toggleTrackerStatus('${id}', 'revised')" title="Mark as Revised">
                                    <i class="fas fa-sync-alt"></i>
                                </button>
                            </div>
                        ` : `
                            <div class="tracker-activity-actions">
                                <span class="tracker-status-label">${isExam ? '📝 Exam' : isStudyWeek ? '📚 Study Week' : '📖 Revision'}</span>
                            </div>
                        `}
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });

        html += `
            </div>
            <div class="tracker-legend glass">
                <span><span class="legend-dot studied"></span> Studied</span>
                <span><span class="legend-dot revised"></span> Revised</span>
                <span><span class="legend-dot complete"></span> Complete</span>
                <span><span class="legend-dot incomplete"></span> Not Started</span>
                <span style="margin-left:auto;font-size:0.65rem;opacity:0.4;">
                    <i class="fas fa-print"></i> Download PDF for printing
                </span>
            </div>
            <div class="download-history glass">
                <div class="download-history-title">
                    <i class="fas fa-history"></i> Download History (last 5)
                </div>
                <div id="trackerDownloadHistory">
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.updateDownloadStats();
    }

    toggleTrackerStatus(id, type) {
        const key = id + '_' + type;
        const current = localStorage.getItem(key) === 'true';
        localStorage.setItem(key, String(!current));
        
        const activity = document.querySelector(`.tracker-activity[data-id="${id}"]`);
        if (activity) {
            const btn = activity.querySelector(`.tracker-btn.${type}`);
            if (btn) {
                btn.classList.toggle('active');
            }
            const studied = localStorage.getItem(id + '_studied') === 'true';
            const revised = localStorage.getItem(id + '_revised') === 'true';
            activity.classList.remove('studied', 'complete');
            if (studied && revised) activity.classList.add('complete');
            else if (studied) activity.classList.add('studied');
        }
        
        const week = parseInt(id.split('_')[1]);
        setTimeout(() => this.renderStudyTracker(), 100);
    }

    resetTracker(week) {
        if (!confirm(`Reset all progress for Week ${week}?`)) return;
        
        const weekData = this.TIMETABLE[week];
        if (!weekData || !weekData.days) return;
        
        Object.keys(weekData.days).forEach(day => {
            const activities = weekData.days[day].filter(a => 
                a.activity && !a.activity.includes('NO') && !a.activity.includes('PUBLIC HOLIDAY')
            );
            activities.forEach((activity, idx) => {
                const id = `tracker_${week}_${day}_${idx}`;
                localStorage.removeItem(id + '_studied');
                localStorage.removeItem(id + '_revised');
            });
        });
        
        this.renderStudyTracker();
        this.showToast('✅ Progress reset for Week ' + week, 'success');
    }

    // ============================================
    // LOADING SCREEN
    // ============================================
    showLoadingScreen() {
        const screen = document.getElementById('loadingScreen');
        screen.classList.remove('hidden');
        this.animateLoader();
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 1000);
    }

    animateLoader() {
        const progress = document.getElementById('loaderProgress');
        const percent = document.getElementById('loaderPercent');
        let value = 0;
        const interval = setInterval(() => {
            value += Math.random() * 12;
            if (value > 100) value = 100;
            progress.style.width = value + '%';
            percent.textContent = Math.round(value) + '%';
            if (value >= 100) clearInterval(interval);
        }, 150);
    }

    setupHeroParticles() {
        const container = document.getElementById('heroParticles');
        if (!container) return;
        for (let i = 0; i < 20; i++) {
            const span = document.createElement('span');
            const size = Math.random() * 3 + 2;
            span.style.width = size + 'px';
            span.style.height = size + 'px';
            span.style.left = Math.random() * 100 + '%';
            span.style.top = Math.random() * 100 + '%';
            span.style.animationDelay = Math.random() * 6 + 's';
            span.style.animationDuration = (Math.random() * 4 + 4) + 's';
            container.appendChild(span);
        }
    }

    // ============================================
    // CATEGORIES
    // ============================================
    async loadCategories() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/categories`);
            this.categories = await response.json();
            
            const filter = document.getElementById('categoryFilter');
            if (filter) {
                this.categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.name;
                    option.textContent = `${cat.icon} ${cat.name}`;
                    filter.appendChild(option);
                });
            }

            document.getElementById('totalCategories').textContent = this.categories.length;
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // ============================================
    // RESOURCES
    // ============================================
    async loadResources(append = false) {
        if (this.loading) return;
        this.loading = true;

        if (this.isFirstLoad) {
            const skeleton = document.getElementById('skeletonGrid');
            if (skeleton) skeleton.style.display = 'grid';
            const oldGrid = document.getElementById('resourcesContainer').querySelector('.resources-grid');
            if (oldGrid) oldGrid.remove();
        }

        try {
            let url = `${CONFIG.API_URL}/resources?limit=200&page=${this.page}`;
            
            if (this.currentWeek !== 'all' && this.currentWeek !== '') {
                url += `&week=${this.currentWeek}`;
            }
            
            if (this.currentCategory !== 'all' && this.currentCategory !== '') {
                url += `&category=${encodeURIComponent(this.currentCategory)}`;
            }
            
            if (this.currentSearch && this.currentSearch.trim() !== '') {
                url += `&search=${encodeURIComponent(this.currentSearch.trim())}`;
            }
            
            console.log('📡 Fetching:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            console.log('📦 Received:', data.length, 'resources');
            
            if (append) {
                this.resources = [...this.resources, ...data];
            } else {
                this.resources = data;
            }
            
            this.hasMore = false;
            this.totalResources = this.resources.length;
            this.isFirstLoad = false;
            
            const skeleton = document.getElementById('skeletonGrid');
            if (skeleton) skeleton.style.display = 'none';
            
            if (this.showTracker) {
                this.renderStudyTracker();
            } else {
                this.renderResources();
            }
            
            this.updateStats();
            this.updateProgressBar();
            
            const loadMore = document.getElementById('loadMoreContainer');
            if (loadMore) {
                loadMore.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading resources:', error);
            const skeleton = document.getElementById('skeletonGrid');
            if (skeleton) skeleton.style.display = 'none';
            this.showError('Failed to load resources. Please refresh and try again.');
        } finally {
            this.loading = false;
        }
    }

    renderResources() {
        const container = document.getElementById('resourcesContainer');
        
        const oldGrid = container.querySelector('.resources-grid');
        if (oldGrid) oldGrid.remove();
        
        if (!this.resources || this.resources.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align:center;padding:4rem 1rem;">
                    <div style="font-size:3rem;margin-bottom:1rem;opacity:0.3;">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h3 style="font-size:1.2rem;margin-bottom:0.25rem;color:var(--text);">No resources found</h3>
                    <p style="color:var(--text-muted);margin-bottom:1rem;">Try adjusting your search or filters</p>
                    <button class="btn-load-more glass" onclick="location.reload()">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                </div>
            `;
            return;
        }

        let sorted = [...this.resources];
        switch(this.currentSort) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'week':
                sorted.sort((a, b) => (a.week_number || 0) - (b.week_number || 0));
                break;
            case 'alpha':
                sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            default:
                sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        const cards = sorted.map((resource, index) => this.createResourceCard(resource, index)).join('');
        
        const grid = document.createElement('div');
        grid.className = 'resources-grid';
        grid.innerHTML = cards;
        
        const header = document.createElement('div');
        header.className = 'resources-header';
        header.innerHTML = `<span class="result-count">${this.resources.length} resources found</span>`;
        
        container.innerHTML = '';
        container.appendChild(header);
        container.appendChild(grid);

        const cardsEl = grid.querySelectorAll('.resource-card');
        cardsEl.forEach((card, i) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, 60 * i);
        });

        const count = container.querySelector('.result-count');
        if (count) {
            count.classList.add('update');
            setTimeout(() => count.classList.remove('update'), 300);
        }
    }

    createResourceCard(resource, index) {
        const category = this.categories.find(c => c.name === resource.category);
        const icon = category ? category.icon : '📄';
        const date = resource.created_at ? new Date(resource.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) : 'Unknown';
        
        const weekDate = this.WEEK_DATES[resource.week_number] || '';
        
        let fileIcon = 'fa-file';
        let fileColor = '#ef4444';
        let fileType = 'File';
        let downloadText = 'Download';
        
        if (resource.file_url) {
            const ext = resource.file_url.split('.').pop().toLowerCase();
            if (['pdf'].includes(ext)) {
                fileIcon = 'fa-file-pdf';
                fileColor = '#ef4444';
                fileType = 'PDF';
                downloadText = 'Download PDF';
            } else if (['ppt', 'pptx'].includes(ext)) {
                fileIcon = 'fa-file-powerpoint';
                fileColor = '#f59e0b';
                fileType = 'PPT';
                downloadText = 'Download PPT';
            } else if (['doc', 'docx'].includes(ext)) {
                fileIcon = 'fa-file-word';
                fileColor = '#3b82f6';
                fileType = 'DOC';
                downloadText = 'Download DOC';
            } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                fileIcon = 'fa-file-image';
                fileColor = '#8b5cf6';
                fileType = 'Image';
                downloadText = 'Download Image';
            } else if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) {
                fileIcon = 'fa-file-video';
                fileColor = '#ec4899';
                fileType = 'Video';
                downloadText = 'Download Video';
            } else if (['zip', 'rar', '7z'].includes(ext)) {
                fileIcon = 'fa-file-archive';
                fileColor = '#f59e0b';
                fileType = 'Archive';
                downloadText = 'Download Archive';
            } else {
                fileIcon = 'fa-file';
                fileColor = '#6b7280';
                fileType = 'File';
                downloadText = 'Download File';
            }
        }
        
        let linkHtml = '';
        if (resource.file_url) {
            const cleanTitle = resource.title ? resource.title.replace(/[^a-zA-Z0-9]/g, '_') : 'document';
            const ext = resource.file_url.split('.').pop().toLowerCase();
            
            let downloadUrl = resource.file_url;
            
            if (!downloadUrl.includes('fl_attachment')) {
                downloadUrl = downloadUrl.includes('?') 
                    ? downloadUrl + '&fl_attachment=1' 
                    : downloadUrl + '?fl_attachment=1';
            }
            
            if (ext === 'pdf') {
                downloadUrl = downloadUrl + '&filename=' + encodeURIComponent(cleanTitle + '.pdf');
            }
            
            if (ext === 'pdf') {
                linkHtml = `
                    <button class="download-btn" style="background: ${fileColor}; color: white;" onclick="window.bmsBank.downloadPDF('${resource.id}', '${resource.file_url}', '${cleanTitle}')">
                        <i class="fas ${fileIcon}"></i>
                        ${downloadText}
                        <i class="fas fa-arrow-down" style="font-size:0.7rem;"></i>
                    </button>
                `;
            } else {
                linkHtml = `
                    <a href="${downloadUrl}" target="_blank" class="download-btn" style="background: ${fileColor}; color: white;" onclick="window.bmsBank.markDownloaded('${resource.id}')">
                        <i class="fas ${fileIcon}"></i>
                        ${downloadText}
                        <i class="fas fa-arrow-down" style="font-size:0.7rem;"></i>
                    </a>
                `;
            }
        } else if (resource.google_drive_link) {
            linkHtml = `
                <a href="${resource.google_drive_link}" target="_blank" class="download-btn" style="background: #4285f4; color: white;">
                    <i class="fab fa-google-drive"></i>
                    Open in Drive
                    <i class="fas fa-external-link-alt" style="font-size:0.7rem;"></i>
                </a>
            `;
        }

        // Track view when card is clicked
        const cardId = resource.id;
        setTimeout(() => this.trackResourceView(cardId), 100);

        return `
            <div class="resource-card" data-id="${resource.id}" onclick="window.bmsBank.trackResourceView('${resource.id}')">
                <div class="resource-card-badge">
                    <span class="week-badge"><i class="fas fa-calendar-week"></i> Week ${resource.week_number || 'N/A'}</span>
                    ${resource.file_url ? `<span class="file-type-badge" style="background: ${fileColor}22; color: ${fileColor}; border-color: ${fileColor}44;"><i class="fas ${fileIcon}"></i> ${fileType}</span>` : ''}
                    ${this.isDownloaded(resource.id) ? `<span class="downloaded-badge">✓ Downloaded</span>` : ''}
                </div>
                <div class="resource-card-header">
                    <h3 class="resource-card-title">${this.escapeHtml(resource.title || 'Untitled')}</h3>
                    <span class="resource-card-category">${icon} ${resource.category || 'Uncategorized'}</span>
                </div>
                <div class="resource-card-body">
                    ${resource.lecturer_name ? `
                        <div class="resource-card-meta">
                            <span><i class="fas fa-user-tie"></i> ${this.escapeHtml(resource.lecturer_name)}</span>
                            ${weekDate ? `<span><i class="fas fa-calendar-alt"></i> ${weekDate}</span>` : ''}
                            ${resource.day_of_week ? `<span><i class="fas fa-calendar-day"></i> ${resource.day_of_week}</span>` : ''}
                        </div>
                    ` : ''}
                    ${resource.description ? `
                        <p class="resource-card-description">${this.escapeHtml(resource.description)}</p>
                    ` : ''}
                </div>
                <div class="resource-card-footer">
                    <div class="resource-card-actions">
                        ${linkHtml}
                    </div>
                    <span class="resource-card-date"><i class="far fa-calendar-alt"></i> ${date}</span>
                </div>
            </div>
        `;
    }

    // ============================================
    // PDF DOWNLOAD
    // ============================================
    downloadPDF(resourceId, fileUrl, title) {
        this.showToast('📄 Downloading PDF...', 'info');
        
        fetch(fileUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.download = title ? title + '.pdf' : 'document.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                this.markDownloaded(resourceId);
                this.showToast('✅ PDF downloaded successfully!', 'success');
            })
            .catch(error => {
                console.error('PDF download failed:', error);
                const fallbackUrl = fileUrl.includes('?') 
                    ? fileUrl + '&fl_attachment=1&filename=' + encodeURIComponent((title || 'document') + '.pdf')
                    : fileUrl + '?fl_attachment=1&filename=' + encodeURIComponent((title || 'document') + '.pdf');
                window.open(fallbackUrl, '_blank');
                this.markDownloaded(resourceId);
                this.showToast('⚠️ PDF opening in new tab', 'info');
            });
    }

    // ============================================
    // PROGRESS TRACKER (Download Progress)
    // ============================================
    getProgress() {
        const total = this.totalResources || 1;
        const downloaded = this.getDownloadedCount();
        const progress = Math.min(Math.round((downloaded / total) * 100), 100);
        return { total, downloaded, progress };
    }

    getDownloadedCount() {
        const ids = JSON.parse(localStorage.getItem('bms-downloaded-ids') || '[]');
        return ids.length;
    }

    isDownloaded(resourceId) {
        const ids = JSON.parse(localStorage.getItem('bms-downloaded-ids') || '[]');
        return ids.includes(resourceId);
    }

    markDownloaded(resourceId) {
        let ids = JSON.parse(localStorage.getItem('bms-downloaded-ids') || '[]');
        if (!ids.includes(resourceId)) {
            ids.push(resourceId);
            localStorage.setItem('bms-downloaded-ids', JSON.stringify(ids));
            
            const card = document.querySelector(`.resource-card[data-id="${resourceId}"]`);
            if (card) {
                const badge = card.querySelector('.downloaded-badge');
                if (!badge) {
                    const badgeContainer = card.querySelector('.resource-card-badge');
                    const span = document.createElement('span');
                    span.className = 'downloaded-badge';
                    span.textContent = '✓ Downloaded';
                    badgeContainer.appendChild(span);
                }
            }
            this.updateProgressBar();
            this.showToast('✅ Resource downloaded!', 'success');
        }
    }

    updateProgressBar() {
        const progress = this.getProgress();
        const bar = document.getElementById('progressBar');
        const text = document.getElementById('progressText');
        if (bar) {
            bar.style.width = progress.progress + '%';
        }
        if (text) {
            text.textContent = `${progress.downloaded}/${progress.total} downloaded (${progress.progress}%)`;
        }
    }

    // ============================================
    // QUICK ACCESS
    // ============================================
    setupQuickAccess() {
        const container = document.getElementById('quickAccess');
        if (!container) return;
        
        const weeks = [1, 4, 8, 12, 16, 19];
        weeks.forEach(week => {
            const btn = document.createElement('button');
            btn.className = 'quick-access-btn';
            btn.textContent = `Week ${week}`;
            btn.onclick = () => this.goToWeek(week);
            container.appendChild(btn);
        });
    }

    goToWeek(week) {
        this.currentWeek = week;
        document.getElementById('weekFilter').value = week;
        this.updateWeekButtons();
        this.page = 1;
        this.isFirstLoad = true;
        this.showTracker = false;
        
        const toggleBtn = document.getElementById('trackerToggle');
        if (toggleBtn) {
            toggleBtn.classList.remove('active');
            toggleBtn.innerHTML = '<i class="fas fa-check-double"></i>';
            toggleBtn.title = 'Study Tracker';
        }
        
        this.loadResources();
        this.scrollToResources();
    }

    // ============================================
    // DOWNLOAD ALL
    // ============================================
    downloadAllResources() {
        const resources = this.resources;
        if (resources.length === 0) {
            this.showToast('No resources to download', 'error');
            return;
        }
        
        const downloadable = resources.filter(r => r.file_url);
        if (downloadable.length === 0) {
            this.showToast('No downloadable files found', 'error');
            return;
        }
        
        this.showToast(`📦 Preparing ${downloadable.length} files...`, 'info');
        
        downloadable.forEach((r, index) => {
            setTimeout(() => {
                const ext = r.file_url.split('.').pop().toLowerCase();
                if (ext === 'pdf') {
                    const cleanTitle = r.title ? r.title.replace(/[^a-zA-Z0-9]/g, '_') : 'document';
                    this.downloadPDF(r.id, r.file_url, cleanTitle);
                } else {
                    const downloadUrl = r.file_url.includes('?') 
                        ? r.file_url + '&fl_attachment=1' 
                        : r.file_url + '?fl_attachment=1';
                    window.open(downloadUrl, '_blank');
                    this.markDownloaded(r.id);
                }
            }, index * 500);
        });
        
        this.showToast(`✅ Started downloading ${downloadable.length} files`, 'success');
    }

    // ============================================
    // ESCAPE HTML
    // ============================================
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    setupEventListeners() {
        let searchTimeout;
        const searchInput = document.getElementById('searchInput');
        const heroSearch = document.getElementById('heroSearch');
        
        const performSearch = () => {
            const activeElement = document.activeElement;
            let value = '';
            
            if (activeElement === searchInput) {
                value = searchInput ? searchInput.value : '';
            } else if (activeElement === heroSearch) {
                value = heroSearch ? heroSearch.value : '';
            } else {
                value = searchInput ? searchInput.value : '';
            }
            
            if (searchInput && heroSearch) {
                searchInput.value = value;
                heroSearch.value = value;
            }
            
            const clearBtn = document.getElementById('searchClear');
            if (clearBtn) {
                clearBtn.style.display = value.trim() ? 'flex' : 'none';
            }
            
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.currentSearch = value.trim();
                this.page = 1;
                this.isFirstLoad = true;
                this.loadResources();
                this.scrollToResources();
                console.log('🔍 Searching for:', this.currentSearch);
            }, 400);
        };

        if (searchInput) {
            searchInput.addEventListener('input', performSearch);
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clearTimeout(searchTimeout);
                    const value = searchInput.value.trim();
                    this.currentSearch = value;
                    this.page = 1;
                    this.isFirstLoad = true;
                    this.loadResources();
                    if (heroSearch) heroSearch.value = value;
                    this.scrollToResources();
                    console.log('🔍 Enter search:', this.currentSearch);
                }
            });
        }

        if (heroSearch) {
            heroSearch.addEventListener('input', performSearch);
            heroSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clearTimeout(searchTimeout);
                    const value = heroSearch.value.trim();
                    this.currentSearch = value;
                    this.page = 1;
                    this.isFirstLoad = true;
                    this.loadResources();
                    if (searchInput) searchInput.value = value;
                    this.scrollToResources();
                    console.log('🔍 Hero Enter search:', this.currentSearch);
                }
            });
        }

        const heroSearchBtn = document.getElementById('heroSearchBtn');
        if (heroSearchBtn) {
            heroSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const value = heroSearch ? heroSearch.value.trim() : '';
                console.log('🔍 Search button clicked with:', value);
                
                if (value) {
                    if (searchInput) searchInput.value = value;
                    this.currentSearch = value;
                    this.page = 1;
                    this.isFirstLoad = true;
                    this.loadResources();
                    this.scrollToResources();
                } else {
                    if (searchInput) searchInput.value = '';
                    if (heroSearch) heroSearch.value = '';
                    this.currentSearch = '';
                    this.page = 1;
                    this.isFirstLoad = true;
                    this.loadResources();
                    this.scrollToResources();
                    this.showToast('Please enter a search term', 'info');
                }
            });
        }

        const clearBtn = document.getElementById('searchClear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (heroSearch) heroSearch.value = '';
                clearBtn.style.display = 'none';
                this.currentSearch = '';
                this.page = 1;
                this.isFirstLoad = true;
                this.loadResources();
                this.scrollToResources();
                console.log('🧹 Search cleared');
            });
        }

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.page = 1;
                this.isFirstLoad = true;
                this.loadResources();
                this.scrollToResources();
                console.log('📂 Category filter:', this.currentCategory);
            });
        }

        const weekFilter = document.getElementById('weekFilter');
        if (weekFilter) {
            weekFilter.addEventListener('change', (e) => {
                this.currentWeek = e.target.value;
                this.updateWeekButtons();
                this.page = 1;
                this.isFirstLoad = true;
                this.loadResources();
                this.scrollToResources();
                console.log('📅 Week filter:', this.currentWeek);
            });
        }

        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderResources();
                console.log('🔀 Sort:', this.currentSort);
            });
        }

        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.page++;
                this.loadResources(true);
            });
        }

        const downloadAllBtn = document.getElementById('downloadAllBtn');
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', () => this.downloadAllResources());
        }

        // ============================================
        // SECRET ADMIN TRIGGER
        // ============================================
        let adminClickCount = 0;
        let adminClickTimer = null;
        const adminDot = document.getElementById('adminTriggerDot');
        
        if (adminDot) {
            adminDot.addEventListener('dblclick', (e) => {
                e.preventDefault();
                this.triggerAdminAccess();
            });
            
            adminDot.addEventListener('click', (e) => {
                e.preventDefault();
                adminClickCount++;
                clearTimeout(adminClickTimer);
                adminClickTimer = setTimeout(() => {
                    adminClickCount = 0;
                }, 2000);
                if (adminClickCount >= 5) {
                    adminClickCount = 0;
                    clearTimeout(adminClickTimer);
                    this.triggerAdminAccess();
                }
            });
            
            adminDot.addEventListener('mouseenter', () => {
                adminDot.style.transition = 'all 0.3s ease';
                adminDot.style.color = 'var(--secondary)';
                adminDot.style.textShadow = '0 0 30px rgba(201, 168, 76, 0.2)';
            });
            
            adminDot.addEventListener('mouseleave', () => {
                adminDot.style.color = 'rgba(255,255,255,0.1)';
                adminDot.style.textShadow = 'none';
            });
        }
    }

    triggerAdminAccess() {
        this.showToast('🔐 Admin access granted', 'info');
        setTimeout(() => {
            window.location.href = '/admin';
        }, 500);
    }

    // ============================================
    // WEEK NAVIGATION
    // ============================================
    setupWeekNavigation() {
        const nav = document.getElementById('weekNav');
        if (!nav) return;
        
        for (let week = 1; week <= 19; week++) {
            const btn = document.createElement('button');
            btn.className = 'week-btn';
            btn.dataset.week = week;
            btn.innerHTML = `<i class="fas fa-calendar-week"></i> Week ${week}`;
            btn.addEventListener('click', () => {
                this.currentWeek = week;
                document.getElementById('weekFilter').value = week;
                this.updateWeekButtons();
                this.page = 1;
                this.isFirstLoad = true;
                this.showTracker = false;
                
                const toggleBtn = document.getElementById('trackerToggle');
                if (toggleBtn) {
                    toggleBtn.classList.remove('active');
                    toggleBtn.innerHTML = '<i class="fas fa-check-double"></i>';
                    toggleBtn.title = 'Study Tracker';
                }
                
                this.loadResources();
                this.scrollToResources();
                console.log('📅 Week nav clicked:', week);
            });
            nav.appendChild(btn);
        }
        
        const allBtn = document.querySelector('.week-btn[data-week="all"]');
        if (allBtn) {
            allBtn.addEventListener('click', () => {
                this.currentWeek = 'all';
                document.getElementById('weekFilter').value = 'all';
                this.updateWeekButtons();
                this.page = 1;
                this.isFirstLoad = true;
                this.showTracker = false;
                
                const toggleBtn = document.getElementById('trackerToggle');
                if (toggleBtn) {
                    toggleBtn.classList.remove('active');
                    toggleBtn.innerHTML = '<i class="fas fa-check-double"></i>';
                    toggleBtn.title = 'Study Tracker';
                }
                
                this.loadResources();
                this.scrollToResources();
                console.log('📅 All Weeks clicked');
            });
        }
    }

    updateWeekButtons() {
        document.querySelectorAll('.week-btn').forEach(btn => {
            const week = btn.dataset.week;
            btn.classList.toggle('active', week == this.currentWeek || 
                (this.currentWeek === 'all' && week === 'all'));
        });
    }

    // ============================================
    // THEME TOGGLE
    // ============================================
    setupThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (!toggle) return;
        
        const icon = toggle.querySelector('i');
        
        const savedTheme = localStorage.getItem('bms-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', initialTheme);
        
        if (icon) {
            icon.className = initialTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            }
            
            localStorage.setItem('bms-theme', newTheme);
            console.log('🌓 Theme switched to:', newTheme);
        });
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.focus();
            }
            if (e.key === 'Escape') {
                document.getElementById('searchInput')?.blur();
                document.getElementById('heroSearch')?.blur();
            }
            if (e.ctrlKey && !e.shiftKey) {
                const weekNum = parseInt(e.key);
                if (weekNum >= 1 && weekNum <= 9) {
                    e.preventDefault();
                    this.goToWeek(weekNum);
                }
            }
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.downloadAllResources();
            }
        });
    }

    // ============================================
    // STATS
    // ============================================
    updateStats() {
        const total = this.resources.length || 0;
        document.getElementById('totalResources').textContent = total;
        document.getElementById('heroResources').textContent = total;
        
        const lecturers = new Set(this.resources.map(r => r.lecturer_name).filter(Boolean));
        document.getElementById('totalLecturers').textContent = lecturers.size;
        document.getElementById('heroLecturers').textContent = lecturers.size;
    }

    // ============================================
    // ERROR & TOAST
    // ============================================
    showError(message) {
        const container = document.getElementById('resourcesContainer');
        if (container) {
            container.innerHTML = `
                <div class="empty-state" style="text-align:center;padding:4rem 1rem;">
                    <div style="font-size:3rem;margin-bottom:1rem;opacity:0.3;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 style="font-size:1.2rem;margin-bottom:0.25rem;color:var(--text);">Oops!</h3>
                    <p style="color:var(--text-muted);margin-bottom:1rem;">${message}</p>
                    <button class="btn-load-more glass" onclick="location.reload()">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                </div>
            `;
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.bmsBank = new BMSBank();
});