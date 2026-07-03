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
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadResources();
        this.setupEventListeners();
        this.setupWeekNavigation();
        this.setupThemeToggle();
        this.setupAdminTrigger();
    }

    async loadCategories() {
        try {
            const response = await fetch(CONFIG.API_URL + '/categories');
            this.categories = await response.json();
            
            const filter = document.getElementById('categoryFilter');
            if (filter) {
                this.categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.name;
                    option.textContent = cat.icon + ' ' + cat.name;
                    filter.appendChild(option);
                });
            }
            document.getElementById('totalCategories').textContent = this.categories.length;
        } catch(e) {
            console.log('Categories error:', e);
            this.categories = CONFIG.CATEGORIES || [];
        }
    }

    async loadResources() {
        if (this.loading) return;
        this.loading = true;

        const container = document.getElementById('resourcesContainer');
        container.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Loading...</p></div>';

        try {
            let url = CONFIG.API_URL + '/resources?limit=50&page=' + this.page;
            if (this.currentWeek !== 'all') url += '&week=' + this.currentWeek;
            if (this.currentCategory !== 'all') url += '&category=' + this.currentCategory;
            if (this.currentSearch) url += '&search=' + encodeURIComponent(this.currentSearch);
            
            const response = await fetch(url);
            const data = await response.json();
            
            this.resources = data;
            this.renderResources();
            this.updateStats();
        } catch(e) {
            console.log('Resources error:', e);
            container.innerHTML = '<div class="empty-state"><h3>Error loading</h3><button onclick="location.reload()">Retry</button></div>';
        }
        this.loading = false;
    }

    renderResources() {
        const container = document.getElementById('resourcesContainer');
        
        if (!this.resources || this.resources.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3>No resources found</h3>
                    <p>Add resources via admin panel</p>
                </div>
            `;
            return;
        }

        let html = '<div class="resources-grid">';
        this.resources.forEach(r => {
            const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB') : 'Unknown';
            const category = this.categories.find(c => c.name === r.category);
            const icon = category ? category.icon : '📄';
            
            let downloadBtn = '';
            if (r.file_url) {
                // DIRECT DOWNLOAD FROM CLOUDINARY
                downloadBtn = `
                    <a href="${r.file_url}" download target="_blank" class="download-btn" style="background:#ef4444;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;border:none;cursor:pointer;">
                        📥 Download
                    </a>
                `;
            } else if (r.google_drive_link) {
                downloadBtn = `
                    <a href="${r.google_drive_link}" target="_blank" class="download-btn" style="background:#4285f4;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;">
                        📂 Open in Drive
                    </a>
                `;
            }

            html += `
                <div class="resource-card" style="background:white;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);border:1px solid #e2e8f0;margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                        <h3 style="margin:0;font-size:1.1rem;">${r.title || 'Untitled'}</h3>
                        <span style="background:#f59e0b;padding:2px 10px;border-radius:12px;font-size:0.75rem;font-weight:600;">${icon} ${r.category || 'Uncategorized'}</span>
                    </div>
                    ${r.lecturer_name ? `<p style="margin:4px 0;color:#4a5568;">👨‍🏫 ${r.lecturer_name}</p>` : ''}
                    ${r.week_number ? `<p style="margin:4px 0;color:#4a5568;">📅 Week ${r.week_number}</p>` : ''}
                    ${r.description ? `<p style="margin:8px 0;color:#6b7280;font-size:0.9rem;">${r.description}</p>` : ''}
                    <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                        ${downloadBtn}
                        <span style="color:#a0aec0;font-size:0.8rem;">📅 ${date}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    setupEventListeners() {
        let timeout;
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.currentSearch = e.target.value.trim();
                this.page = 1;
                this.loadResources();
            }, 400);
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.page = 1;
            this.loadResources();
        });

        document.getElementById('weekFilter').addEventListener('change', (e) => {
            this.currentWeek = e.target.value;
            this.page = 1;
            this.loadResources();
        });

        document.getElementById('sortFilter').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderResources();
        });
    }

    setupWeekNavigation() {
        const nav = document.getElementById('weekNav');
        for (let week = 1; week <= 19; week++) {
            const btn = document.createElement('button');
            btn.className = 'week-btn';
            btn.textContent = 'Week ' + week;
            btn.onclick = () => {
                this.currentWeek = week;
                document.getElementById('weekFilter').value = week;
                document.querySelectorAll('.week-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.page = 1;
                this.loadResources();
            };
            nav.appendChild(btn);
        }
    }

    setupThemeToggle() {
        document.getElementById('themeToggle').addEventListener('click', () => {
            document.documentElement.setAttribute('data-theme', 
                document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
            );
        });
    }

    setupAdminTrigger() {
        let count = 0;
        document.getElementById('adminTriggerDot').addEventListener('click', () => {
            count++;
            if (count >= 5) {
                count = 0;
                window.location.href = '/admin';
            }
            setTimeout(() => count = 0, 2000);
        });
    }

    updateStats() {
        document.getElementById('totalResources').textContent = this.resources.length || 0;
        document.getElementById('heroResources').textContent = this.resources.length || 0;
        const lecturers = new Set(this.resources.map(r => r.lecturer_name).filter(Boolean));
        document.getElementById('totalLecturers').textContent = lecturers.size;
        document.getElementById('heroLecturers').textContent = lecturers.size;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.bmsBank = new BMSBank();
});