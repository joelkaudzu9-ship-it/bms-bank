const CONFIG = {
    API_URL: 'https://bms-bank.fly.dev/api',
    ADMIN_PASSWORD: 'BMS2026Admin',
    BANK_NAME: 'BMS BANK',
    WEEKS: Array.from({length: 19}, (_, i) => i + 1),
    TIME_SLOTS: [
        '08:00', '09:00', '10:00', '11:00', 
        '12:00-13:00', '14:00', '15:00', '16:00'
    ],
    DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    CATEGORIES: [
        { name: 'Lecture', icon: '📚' },
        { name: 'Practical', icon: '🔬' },
        { name: 'Clinical Skills', icon: '🏥' },
        { name: 'Anatomy', icon: '🧠' },
        { name: 'Physiology', icon: '❤️' },
        { name: 'Biochemistry', icon: '🧪' },
        { name: 'Pathology', icon: '🔍' },
        { name: 'Microbiology', icon: '🦠' },
        { name: 'Pharmacology', icon: '💊' },
        { name: 'Public Health', icon: '🌍' },
        { name: 'Life Skills', icon: '💡' }
    ]
};