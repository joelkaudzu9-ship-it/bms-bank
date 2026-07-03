// Main Application - BMS BANK
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
        this.hideLoadingScreen();
        this.updateStats();
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

    async loadCategories() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/categories`);
            this.categories = await response.json();
            
            const filter = document.getElementById('categoryFilter');
            this.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = `${cat.icon} ${cat.name}`;
                filter.appendChild(option);
            });

            document.getElementById('totalCategories').textContent = this.categories.length;
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadResources(append = false) {
        if (this.loading) return;
        this.loading = true;

        try {
            let url = `${CONFIG.API_URL}/resources?limit=15&page=${this.page}`;
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
            
            this.hasMore = data.length === 15;
            this.totalResources = this.resources.length;
            this.renderResources();
            this.updateStats();
            
            document.getElementById('loadMoreContainer').style.display = this.hasMore ? 'block' : 'none';
        } catch (error) {
            console.error('Error loading resources:', error);
            this.showError('Failed to load resources. Please refresh and try again.');
        } finally {
            this.loading = false;
        }
    }

    renderResources() {
        const container = document.getElementById('resourcesContainer');
        
        if (!this.resources || this.resources.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h3>No resources found</h3>
                    <p>Try adjusting your search or filters</p>
                    <button class="btn-premium" onclick="location.reload()">
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
        
        container.innerHTML = `
            <div class="resources-header">
                <span class="result-count">${this.resources.length} resources found</span>
            </div>
            <div class="resources-grid">
                ${cards}
            </div>
        `;

        // Staggered animation
        document.querySelectorAll('.resource-card').forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 80 * i);
        });
    }

    createResourceCard(resource, index) {
        const category = this.categories.find(c => c.name === resource.category);
        const icon = category ? category.icon : '📄';
        const date = resource.created_at ? new Date(resource.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) : 'Unknown';
        
        // Determine file type for icon
        let fileIcon = 'fa-file';
        let fileColor = '#ef4444';
        let fileType = 'File';
        let downloadText = '📥 Download';
        
        if (resource.file_url) {
            const ext = resource.file_url.split('.').pop().toLowerCase();
            if (['pdf'].includes(ext)) {
                fileIcon = 'fa-file-pdf';
                fileColor = '#ef4444';
                fileType = 'PDF';
                downloadText = '📥 Download PDF';
            } else if (['ppt', 'pptx'].includes(ext)) {
                fileIcon = 'fa-file-powerpoint';
                fileColor = '#f59e0b';
                fileType = 'PPT';
                downloadText = '📥 Download PPT';
            } else if (['doc', 'docx'].includes(ext)) {
                fileIcon = 'fa-file-word';
                fileColor = '#3b82f6';
                fileType = 'DOC';
                downloadText = '📥 Download DOC';
            } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                fileIcon = 'fa-file-image';
                fileColor = '#8b5cf6';
                fileType = 'Image';
                downloadText = '📥 Download Image';
            } else if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) {
                fileIcon = 'fa-file-video';
                fileColor = '#ec4899';
                fileType = 'Video';
                downloadText = '📥 Download Video';
            } else if (['zip', 'rar', '7z'].includes(ext)) {
                fileIcon = 'fa-file-archive';
                fileColor = '#f59e0b';
                fileType = 'Archive';
                downloadText = '📥 Download Archive';
            } else {
                fileIcon = 'fa-file';
                fileColor = '#6b7280';
                fileType = 'File';
                downloadText = '📥 Download File';
            }
        }
        
        // BIG OBVIOUS DOWNLOAD BUTTON
        let linkHtml = '';
        if (resource.file_url) {
            linkHtml = `
                <a href="${resource.file_url}" download class="download-btn" style="background: ${fileColor}; color: white;">
                    <i class="fas ${fileIcon}"></i>
                    ${downloadText}
                    <i class="fas fa-arrow-down" style="margin-left: 4px;"></i>
                </a>
            `;
        } else if (resource.google_drive_link) {
            linkHtml = `
                <a href="${resource.google_drive_link}" target="_blank" class="download-btn" style="background: #4285f4; color: white;">
                    <i class="fab fa-google-drive"></i>
                    Open in Drive
                    <i class="fas fa-external-link-alt" style="margin-left: 4px; font-size: 0.7rem;"></i>
                </a>
            `;
        }

        return `
            <div class="resource-card" data-index="${index}">
                <div class="resource-card-badge">
                    <span class="week-badge">📅 Week ${resource.week_number || 'N/A'}</span>
                    ${resource.file_url ? `<span class="file-type-badge" style="background: ${fileColor}22; color: ${fileColor}; border: 1px solid ${fileColor}44;"><i class="fas ${fileIcon}"></i> ${fileType}</span>` : ''}
                </div>
                <div class="resource-card-header">
                    <h3 class="resource-card-title">${this.escapeHtml(resource.title || 'Untitled')}</h3>
                    <span class="resource-card-category">${icon} ${resource.category || 'Uncategorized'}</span>
                </div>
                <div class="resource-card-body">
                    ${resource.lecturer_name ? `
                        <div class="resource-card-meta">
                            <span><i class="fas fa-user-tie"></i> ${this.escapeHtml(resource.lecturer_name)}</span>
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupEventListeners() {
        let searchTimeout;
        const searchInput = document.getElementById('searchInput');
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const value = e.target.value.trim();
            document.getElementById('searchClear').style.display = value ? 'flex' : 'none';
            searchTimeout = setTimeout(() => {
                this.currentSearch = value;
                this.page = 1;
                this.loadResources();
            }, 400);
        });

        document.getElementById('searchClear').addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            document.getElementById('searchClear').style.display = 'none';
            this.currentSearch = '';
            this.page = 1;
            this.loadResources();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.page = 1;
            this.loadResources();
        });

        document.getElementById('weekFilter').addEventListener('change', (e) => {
            this.currentWeek = e.target.value;
            this.updateWeekButtons();
            this.page = 1;
            this.loadResources();
        });

        document.getElementById('sortFilter').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderResources();
        });

        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            this.page++;
            this.loadResources(true);
        });

        // ============================================
        // SECRET ADMIN TRIGGER - Hidden in Footer
        // ============================================
        let adminClickCount = 0;
        let adminClickTimer = null;
        const adminDot = document.getElementById('adminTriggerDot');
        
        if (adminDot) {
            // Double click to trigger admin
            adminDot.addEventListener('dblclick', (e) => {
                e.preventDefault();
                this.triggerAdminAccess();
            });
            
            // Secret sequence: Click the dot 5 times rapidly
            adminDot.addEventListener('click', (e) => {
                e.preventDefault();
                adminClickCount++;
                
                // Clear timer after 2 seconds of inactivity
                clearTimeout(adminClickTimer);
                adminClickTimer = setTimeout(() => {
                    adminClickCount = 0;
                }, 2000);
                
                // If clicked 5 times, trigger admin
                if (adminClickCount >= 5) {
                    adminClickCount = 0;
                    clearTimeout(adminClickTimer);
                    this.triggerAdminAccess();
                }
            });
            
            // Hover effect - subtle glow
            adminDot.addEventListener('mouseenter', () => {
                adminDot.style.transition = 'all 0.3s ease';
                adminDot.style.color = 'var(--secondary)';
                adminDot.style.textShadow = '0 0 20px rgba(245, 158, 11, 0.3)';
            });
            
            adminDot.addEventListener('mouseleave', () => {
                adminDot.style.color = 'rgba(255,255,255,0.2)';
                adminDot.style.textShadow = 'none';
            });
        }
    }

    triggerAdminAccess() {
        // Show a subtle notification
        this.showToast('🔐 Admin access granted', 'info');
        
        // Redirect to admin after a brief delay
        setTimeout(() => {
            window.location.href = '/admin';
        }, 500);
    }

    setupWeekNavigation() {
        const nav = document.getElementById('weekNav');
        
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
                this.loadResources();
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

    setupThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        const icon = toggle.querySelector('i');
        
        const savedTheme = localStorage.getItem('bms-theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            icon.className = 'fas fa-sun';
        }

        toggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
            icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
            localStorage.setItem('bms-theme', isDark ? 'light' : 'dark');
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or Cmd+K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
            // Escape to clear search
            if (e.key === 'Escape') {
                document.getElementById('searchInput').blur();
            }
        });
    }

    updateStats() {
        const total = this.resources.length || 0;
        document.getElementById('totalResources').textContent = total;
        document.getElementById('heroResources').textContent = total;
        
        const lecturers = new Set(this.resources.map(r => r.lecturer_name).filter(Boolean));
        document.getElementById('totalLecturers').textContent = lecturers.size;
        document.getElementById('heroLecturers').textContent = lecturers.size;
    }

    showError(message) {
        const container = document.getElementById('resourcesContainer');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Oops!</h3>
                <p>${message}</p>
                <button class="btn-premium" onclick="location.reload()">
                    <i class="fas fa-sync"></i> Refresh
                </button>
            </div>
        `;
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            ${message}
        `;
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