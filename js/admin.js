// Admin Panel - BMS BANK Premium
class BMSAdmin {
    constructor() {
        this.isLoggedIn = false;
        this.resources = [];
        this.init();
    }

    init() {
        this.loadWeeks();
        this.loadCategories();
        this.loadTimeSlots();
        this.setupEventListeners();
        this.checkLoginStatus();
    }

    checkLoginStatus() {
        const saved = localStorage.getItem('bms-admin-logged-in');
        if (saved === 'true') {
            this.login();
        }
    }

    loadWeeks() {
        const select = document.getElementById('weekNumber');
        if (!select) return;
        for (let week = 1; week <= 19; week++) {
            const option = document.createElement('option');
            option.value = week;
            option.textContent = `Week ${week}`;
            select.appendChild(option);
        }
    }

    async loadCategories() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/categories`);
            const categories = await response.json();
            
            const select = document.getElementById('category');
            if (!select) return;
            
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = `${cat.icon} ${cat.name}`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    loadTimeSlots() {
        const select = document.getElementById('timeSlot');
        if (!select) return;
        CONFIG.TIME_SLOTS.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = slot;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                if (e.dataTransfer.files.length) {
                    fileInput.files = e.dataTransfer.files;
                    this.handleFileSelect(e.dataTransfer.files[0]);
                }
            });
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }

        const form = document.getElementById('uploadForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpload(e);
            });
        }

        const searchInput = document.getElementById('adminSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterAdminResources(e.target.value);
            });
        }
    }

    handleFileSelect(file) {
        const preview = document.getElementById('filePreview');
        const fileName = document.getElementById('fileName');
        if (preview && fileName) {
            fileName.textContent = file.name;
            preview.style.display = 'block';
        }
    }

    removeFile() {
        document.getElementById('fileInput').value = '';
        document.getElementById('filePreview').style.display = 'none';
    }

    async handleUpload(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const uploadBtn = document.getElementById('uploadBtn');
        const progressBar = document.getElementById('uploadProgressBar');
        const btnContent = document.getElementById('uploadBtnContent');
        
        const weekNumber = document.getElementById('weekNumber').value;
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const fileInput = document.getElementById('fileInput');
        
        if (!weekNumber) {
            this.showToast('❌ Please select a week number', 'error');
            return;
        }
        if (!title) {
            this.showToast('❌ Please enter a title', 'error');
            return;
        }
        if (!category) {
            this.showToast('❌ Please select a category', 'error');
            return;
        }
        if (fileInput.files.length === 0) {
            this.showToast('⚠️ No file selected. Upload a file or use Google Drive link.', 'error');
            return;
        }
        
        btnContent.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading... 0%';
        uploadBtn.disabled = true;
        progressBar.style.width = '0%';
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressBar.style.width = progress + '%';
            btnContent.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading... ${Math.round(progress)}%`;
        }, 300);
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'X-Admin-Password': CONFIG.ADMIN_PASSWORD,
                },
                body: formData
            });

            const result = await response.json();
            
            clearInterval(progressInterval);
            progressBar.style.width = '100%';
            
            if (result.success) {
                btnContent.innerHTML = '<i class="fas fa-check-circle"></i> Upload Complete!';
                this.showToast('✅ Resource uploaded successfully!', 'success');
                form.reset();
                document.getElementById('filePreview').style.display = 'none';
                this.loadAdminResources();
                
                setTimeout(() => {
                    btnContent.innerHTML = '<i class="fas fa-upload"></i> Upload Resource';
                    uploadBtn.disabled = false;
                    progressBar.style.width = '0%';
                }, 1500);
            } else {
                this.showToast('❌ Upload failed: ' + (result.error || 'Unknown error'), 'error');
                btnContent.innerHTML = '<i class="fas fa-upload"></i> Upload Resource';
                uploadBtn.disabled = false;
                progressBar.style.width = '0%';
            }
        } catch (error) {
            clearInterval(progressInterval);
            console.error('Upload error:', error);
            this.showToast('❌ Error uploading: ' + error.message, 'error');
            btnContent.innerHTML = '<i class="fas fa-upload"></i> Upload Resource';
            uploadBtn.disabled = false;
            progressBar.style.width = '0%';
        }
    }

    async loadAdminResources() {
        const container = document.getElementById('adminResourcesList');
        if (!container) return;
        
        container.innerHTML = `
            <div class="loading-state" style="text-align:center;padding:2rem;">
                <div class="loading-spinner" style="display:inline-block;width:30px;height:30px;border:2px solid var(--border);border-top:2px solid var(--secondary);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
                <p style="margin-top:0.5rem;color:var(--text-muted);">Loading resources...</p>
            </div>
        `;
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/resources?limit=100`);
            this.resources = await response.json();
            this.renderAdminResources();
            this.updateAdminStats();
        } catch (error) {
            console.error('Error loading admin resources:', error);
            container.innerHTML = `
                <div class="empty-state" style="text-align:center;padding:2rem;">
                    <i class="fas fa-exclamation-circle" style="font-size:2rem;opacity:0.3;"></i>
                    <h3 style="margin:0.5rem 0;color:var(--text);">Failed to load resources</h3>
                    <p style="color:var(--text-muted);">Please refresh and try again</p>
                </div>
            `;
        }
    }

    renderAdminResources() {
        const container = document.getElementById('adminResourcesList');
        if (!container) return;
        
        if (!this.resources || this.resources.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align:center;padding:2rem;">
                    <i class="fas fa-inbox" style="font-size:2rem;opacity:0.3;"></i>
                    <h3 style="margin:0.5rem 0;color:var(--text);">No resources yet</h3>
                    <p style="color:var(--text-muted);">Start uploading resources using the form above</p>
                </div>
            `;
            return;
        }

        const items = this.resources.map(resource => `
            <div class="admin-resource-item" data-id="${resource.id}">
                <div class="admin-resource-info">
                    <span class="week-badge">Week ${resource.week_number || 'N/A'}</span>
                    <span class="title">${resource.title || 'Untitled'}</span>
                    ${resource.lecturer_name ? `<span class="lecturer"><i class="fas fa-user-tie"></i> ${resource.lecturer_name}</span>` : ''}
                    <span class="category-tag">${resource.category || 'Uncategorized'}</span>
                </div>
                <div class="admin-resource-actions">
                    <button class="btn-small btn-small-danger" onclick="admin.deleteResource('${resource.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = `<div class="admin-resources-list">${items}</div>`;
    }

    filterAdminResources(search) {
        const items = document.querySelectorAll('.admin-resource-item');
        const query = search.toLowerCase();
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? 'flex' : 'none';
        });
    }

    updateAdminStats() {
        document.getElementById('adminTotalResources').textContent = this.resources?.length || 0;
        
        const today = new Date().toDateString();
        const todayUploads = this.resources?.filter(r => {
            const date = new Date(r.created_at).toDateString();
            return date === today;
        }) || [];
        document.getElementById('adminTodayUploads').textContent = todayUploads.length;
    }

    async deleteResource(id) {
        if (!confirm('Are you sure you want to delete this resource?')) return;
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/resources/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-Admin-Password': CONFIG.ADMIN_PASSWORD,
                }
            });

            const result = await response.json();
            if (result.success) {
                this.showToast('✅ Resource deleted successfully', 'success');
                this.loadAdminResources();
            } else {
                this.showToast('❌ Delete failed: ' + result.error, 'error');
            }
        } catch (error) {
            this.showToast('❌ Error deleting resource', 'error');
        }
    }

    login() {
        this.isLoggedIn = true;
        localStorage.setItem('bms-admin-logged-in', 'true');
        document.getElementById('loginOverlay').classList.add('hidden');
        document.getElementById('adminContent').classList.remove('hidden');
        document.getElementById('loginError').classList.remove('visible');
        this.loadAdminResources();
    }

    logout() {
        this.isLoggedIn = false;
        localStorage.removeItem('bms-admin-logged-in');
        document.getElementById('loginOverlay').classList.remove('hidden');
        document.getElementById('adminContent').classList.add('hidden');
        document.getElementById('adminPassword').value = '';
        this.showToast('✅ Logged out successfully', 'success');
    }

    showToast(message, type = 'success') {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                width: 90%;
            `;
            document.body.appendChild(container);
        }
        
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

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    if (password === CONFIG.ADMIN_PASSWORD) {
        admin.login();
    } else {
        document.getElementById('loginError').classList.add('visible');
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

// Remove file
function removeFile() {
    if (admin) admin.removeFile();
}

// Bulk upload
function bulkUpload() {
    const textarea = document.getElementById('bulkLinks');
    if (!textarea) return;
    
    const links = textarea.value.split('\n').filter(link => link.trim());
    if (links.length === 0) {
        admin.showToast('Please paste at least one Google Drive link', 'error');
        return;
    }
    
    admin.showToast(`📥 Found ${links.length} links. Importing...`, 'info');
}

// Global admin instance
let admin;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    admin = new BMSAdmin();
});