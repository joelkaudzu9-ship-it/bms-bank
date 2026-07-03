// Main Application - BMS BANK Premium
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
        
        this.init();
    }

    async init() {
        this.showLoadingScreen();
        await this.loadCategories();
        await this.loadResources();
        this.setupEventListeners();
        this.setupWeekNavigation();
        this.setupThemeToggle();
        this.setupKeyboardShortcuts();
        this.setupQuickAccess();
        this.setupHeroParticles();
        this.hideLoadingScreen();
        this.updateStats();
        this.updateProgressBar();
    }

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

    async loadResources(append = false) {
        if (this.loading) return;
        this.loading = true;

        // Show skeleton on first load
        if (this.isFirstLoad) {
            document.getElementById('skeletonGrid').style.display = 'grid';
            document.getElementById('resourcesContainer').querySelector('.resources-grid')?.remove();
        }

        try {
            let url = `${CONFIG.API_URL}/resources?limit=50&page=${this.page}`;
            if (this.currentWeek !== 'all') url += `&week=${this.currentWeek}`;
            if (this.currentCategory !== 'all') url += `&category=${this.currentCategory}`;
            if (this.currentSearch) url += `&search=${encodeURIComponent(this.currentSearch)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (append) {
                this.resources = [...this.resources, ...data];
            } else {
                this.resources = data;
            }
            
            this.hasMore = data.length === 50;
            this.totalResources = this.resources.length;
            this.isFirstLoad = false;
            
            // Hide skeleton
            document.getElementById('skeletonGrid').style.display = 'none';
            
            this.renderResources();
            this.updateStats();
            this.updateProgressBar();
            
            document.getElementById('loadMoreContainer').style.display = this.hasMore ? 'block' : 'none';
        } catch (error) {
            console.error('Error loading resources:', error);
            document.getElementById('skeletonGrid').style.display = 'none';
            this.showError('Failed to load resources. Please refresh and try again.');
        } finally {
            this.loading = false;
        }
    }

    renderResources() {
        const container = document.getElementById('resourcesContainer');
        
        // Remove old grid if exists
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
        }

        const cards = sorted.map((resource, index) => this.createResourceCard(resource, index)).join('');
        
        // Remove skeleton and add content
        const skeleton = container.querySelector('#skeletonGrid');
        if (skeleton) skeleton.style.display = 'none';
        
        const grid = document.createElement('div');
        grid.className = 'resources-grid';
        grid.innerHTML = cards;
        
        // Add header
        const header = document.createElement('div');
        header.className = 'resources-header';
        header.innerHTML = `<span class="result-count">${this.resources.length} resources found</span>`;
        
        container.innerHTML = '';
        container.appendChild(header);
        container.appendChild(grid);

        // Animate cards with stagger
        const cardsEl = grid.querySelectorAll('.resource-card');
        cardsEl.forEach((card, i) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, 60 * i);
        });

        // Animate result count
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
        
        // Get week date from mapping
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
            // Get the clean title for filename
            const cleanTitle = resource.title ? resource.title.replace(/[^a-zA-Z0-9]/g, '_') : 'document';
            const ext = resource.file_url.split('.').pop().toLowerCase();
            
            // Build the download URL with proper flags
            let downloadUrl = resource.file_url;
            
            // Add fl_attachment if not present
            if (!downloadUrl.includes('fl_attachment')) {
                downloadUrl = downloadUrl.includes('?') 
                    ? downloadUrl + '&fl_attachment=1' 
                    : downloadUrl + '?fl_attachment=1';
            }
            
            // For PDFs, add filename parameter for proper download naming
            if (ext === 'pdf') {
                downloadUrl = downloadUrl + '&filename=' + encodeURIComponent(cleanTitle + '.pdf');
            }
            
            // For direct download, use onclick with fetch for PDFs, direct for others
            if (ext === 'pdf') {
                // PDF: Use fetch to download as blob (forces download)
                linkHtml = `
                    <button class="download-btn" style="background: ${fileColor}; color: white;" onclick="window.bmsBank.downloadPDF('${resource.id}', '${resource.file_url}', '${cleanTitle}')">
                        <i class="fas ${fileIcon}"></i>
                        ${downloadText}
                        <i class="fas fa-arrow-down" style="font-size:0.7rem;"></i>
                    </button>
                `;
            } else {
                // Other files: Direct download with fl_attachment
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

        return `
            <div class="resource-card" data-id="${resource.id}">
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
    // PDF DOWNLOAD - FIXED
    // ============================================
    downloadPDF(resourceId, fileUrl, title) {
        // Show loading toast
        this.showToast('📄 Downloading PDF...', 'info');
        
        // Use fetch to get the PDF as a blob
        fetch(fileUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                // Create a download link
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.download = title ? title + '.pdf' : 'document.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                // Mark as downloaded
                this.markDownloaded(resourceId);
                this.showToast('✅ PDF downloaded successfully!', 'success');
            })
            .catch(error => {
                console.error('PDF download failed:', error);
                // Fallback: Try with fl_attachment
                const fallbackUrl = fileUrl.includes('?') 
                    ? fileUrl + '&fl_attachment=1&filename=' + encodeURIComponent((title || 'document') + '.pdf')
                    : fileUrl + '?fl_attachment=1&filename=' + encodeURIComponent((title || 'document') + '.pdf');
                window.open(fallbackUrl, '_blank');
                this.markDownloaded(resourceId);
                this.showToast('⚠️ PDF opening in new tab', 'info');
            });
    }

    // ============================================
    // PROGRESS TRACKER
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
        this.loadResources();
        
        // Scroll to resources section
        const resourcesContainer = document.getElementById('resourcesContainer');
        if (resourcesContainer) {
            const headerOffset = 80;
            const elementPosition = resourcesContainer.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
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
                    // PDF: Use downloadPDF method
                    const cleanTitle = r.title ? r.title.replace(/[^a-zA-Z0-9]/g, '_') : 'document';
                    this.downloadPDF(r.id, r.file_url, cleanTitle);
                } else {
                    // Other files: Direct download
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
    // EVENT LISTENERS - FIXED SEARCH
    // ============================================
    setupEventListeners() {
        let searchTimeout;
        const searchInput = document.getElementById('searchInput');
        const heroSearch = document.getElementById('heroSearch');
        
        // Proper search handler
        const performSearch = (value) => {
            clearTimeout(searchTimeout);
            const val = value.trim();
            // Update clear button visibility
            const clearBtn = document.getElementById('searchClear');
            if (clearBtn) {
                clearBtn.style.display = val ? 'flex' : 'none';
            }
            searchTimeout = setTimeout(() => {
                this.currentSearch = val;
                this.page = 1;
                this.isFirstLoad = true;
                this.loadResources();
            }, 400);
        };

        // Main search input
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const value = e.target.value;
                // Sync hero search
                if (heroSearch && heroSearch !== document.activeElement) {
                    heroSearch.value = value;
                }
                performSearch(value);
            });

            // Enter key support
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.target.value.trim();
                    if (value) {
                        clearTimeout(searchTimeout);
                        this.currentSearch = value;
                        this.page = 1;
                        this.isFirstLoad = true;
                        this.loadResources();
                    }
                }
            });
        }

        // Hero search input
        if (heroSearch) {
            heroSearch.addEventListener('input', (e) => {
                const value = e.target.value;
                // Sync main search
                if (searchInput && searchInput !== document.activeElement) {
                    searchInput.value = value;
                }
                performSearch(value);
            });

            // Enter key support for hero search
            heroSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.target.value.trim();
                    if (value) {
                        clearTimeout(searchTimeout);
                        this.currentSearch = value;
                        this.page = 1;
                        this.isFirstLoad = true;
                        this.loadResources();
                    }
                }
            });
        }

        // Hero search button
        const heroSearchBtn = document.getElementById('heroSearchBtn');
        if (heroSearchBtn) {
            heroSearchBtn.addEventListener('click', () => {
                const value = heroSearch ? heroSearch.value.trim() : '';
                if (value) {
                    if (searchInput) searchInput.value = value;
                    this.currentSearch = value;
                    this.page = 1;
                    this.isFirstLoad = true;
                    this.loadResources();
                } else {
                    this.showToast('Please enter a search term', 'info');
                }
            });
        }

        // Search clear button
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
            });
        }

        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.page = 1;
            this.isFirstLoad = true;
            this.loadResources();
        });

        // Week filter
        document.getElementById('weekFilter').addEventListener('change', (e) => {
            this.currentWeek = e.target.value;
            this.updateWeekButtons();
            this.page = 1;
            this.isFirstLoad = true;
            this.loadResources();
        });

        // Sort filter
        document.getElementById('sortFilter').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderResources();
        });

        // Load more
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            this.page++;
            this.loadResources(true);
        });

        // Download all
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
    // WEEK NAVIGATION - FIXED SCROLL
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
                this.loadResources();
                
                // Scroll to resources section
                const resourcesContainer = document.getElementById('resourcesContainer');
                if (resourcesContainer) {
                    const headerOffset = 80;
                    const elementPosition = resourcesContainer.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
            nav.appendChild(btn);
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
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            if (icon) icon.className = 'fas fa-sun';
        }

        toggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
            if (icon) icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
            localStorage.setItem('bms-theme', isDark ? 'light' : 'dark');
        });
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or Cmd+K → Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.focus();
            }
            // Escape → Clear search
            if (e.key === 'Escape') {
                document.getElementById('searchInput')?.blur();
                document.getElementById('heroSearch')?.blur();
            }
            // Ctrl+1 to Ctrl+9 → Go to Week 1-9
            if (e.ctrlKey && !e.shiftKey) {
                const weekNum = parseInt(e.key);
                if (weekNum >= 1 && weekNum <= 9) {
                    e.preventDefault();
                    this.goToWeek(weekNum);
                }
            }
            // Ctrl+D → Download all
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