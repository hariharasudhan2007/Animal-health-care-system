// ═══════════════════════════════════════════════════════════
//   VetCare — Frontend Application Script
//   Connects to FastAPI backend at http://127.0.0.1:8000
//   Implements: FR-01 Pet CRUD, FR-02 Appointments, FR-03 Health,
//               FR-04 Billing, FR-05 Dashboard, FR-06 Events,
//               Reports & Analytics, Security & Validation
// ════════════════════════════════════════════════════════════

// Intelligent API URL resolution:
const API = '/api';

// ─── Global State ──────────────────────────────────────────
let currentUser = JSON.parse(localStorage.getItem('vetcare_user') || 'null');
let currentPortalMode = 'user'; // 'user' or 'doctor'
let currentLang = localStorage.getItem('vetcare_lang') || 'ta'; // Default to Tamil
let selectedDoctorId = null;
let selectedSlot = null;
let petSearchTimeout = null;
let isServerOnline = false;

// ─── i18n Multi-Language Support (English & தமிழ்) ─────────
const TRANSLATIONS = {
    en: {
        brandName: "VetCare",
        brandSub: "Animal Health Care Management System",
        clinicManagement: "Clinic Management",
        tabOwner: "🐾 Pet Owner",
        tabDoctor: "🩺 Doctor / Staff",
        emailLabel: "Email Address",
        passwordLabel: "Password",
        signInBtn: "Sign In",
        quickOwner: "⚡ 1-Click Owner",
        quickDoctor: "🩺 1-Click Doctor",
        demoText: "Demo:",
        createAccount: "✨ Create New Account",
        orText: "or",
        regNameLabel: "Full Name *",
        regEmailLabel: "Email Address *",
        regPasswordLabel: "Password * (min 4 chars)",
        regPhoneLabel: "Phone Number",
        regAddressLabel: "Home Residence Address",
        regSubmitBtn: "🎉 Create Account",
        backToLogin: "← Back to Login",
        portalOwner: "🐾 Owner",
        portalDoctor: "🩺 Doctor",
        ownerBadge: "🐾 Pet Owner",
        doctorBadge: "🩺 Doctor & Staff",
        ownerMenuTitle: "🐾 Pet Owner Menu",
        doctorMenuTitle: "🩺 Doctor & Staff Menu",
        navDashboard: "Staff Dashboard",
        navPets: "My Pets",
        navAppointments: "Book Appointment",
        navHealth: "Health Records",
        navBilling: "Billing & Invoices",
        navReports: "Reports & Analytics",
        navEvents: "Wellness Events",
        navProfile: "My Profile",
        btnBookAppointment: "📅 Book Appointment",
        btnStaffQueue: "📋 Staff Queue",
        fabQuickBook: "Book Consultation",
        fabStaffQueue: "Staff Queue",
        statPets: "Total Pets Registered",
        statPending: "Pending Approvals",
        statConfirmed: "Confirmed Appointments",
        statRevenue: "Total Revenue Collected",
        announcementsTitle: "📢 Clinic Announcements",
        postAnnBtn: "+ Post Announcement",
        queueTitle: "📋 Appointment Approval & Consultation Queue",
        searchPetPlaceholder: "🔍 Search pets by name, breed, owner, species…",
        allSpecies: "All Species",
        btnFullForm: "📝 Full Form",
        btnRegisterPet: "➕ Register New Pet",
        availDocsTitle: "🩺 Available Veterinary Specialists & Time Slots",
        apptRecordsTitle: "📅 Appointment Records",
        editProfileBtn: "✏️ Edit Profile",
        changePassBtn: "🔑 Change Password",
        signOutBtn: "🚪 Sign Out",
        bookModalTitle: "📅 Book Veterinary Appointment Consultation",
        petNameLabel: "Pet Name *",
        petNamePlaceholder: "Enter pet name (e.g. Buddy)",
        petBreedLabel: "Pet Breed *",
        petBreedPlaceholder: "Enter pet breed (e.g. Golden Retriever, Persian)",
        selectDoctorLabel: "Select Veterinary Doctor *",
        consultTypeLabel: "Consultation Type",
        prefDateLabel: "Preferred Date *",
        timeSlotLabel: "Time Slot *",
        reasonLabel: "Reason for Visit / Symptoms",
        reasonPlaceholder: "Describe symptoms or purpose of appointment…",
        confirmBookingBtn: "📅 Confirm Booking",
        cancelBtn: "Cancel",
        closeBtn: "Close",
        langToggle: "தமிழ்",
        langSwitched: "Language changed to English"
    },
    ta: {
        brandName: "வெட்கேர்",
        brandSub: "விலங்கு நல்வாழ்வு மேலாண்மை அமைப்பு",
        clinicManagement: "கிளினிக் மேலாண்மை",
        tabOwner: "🐾 செல்லப்பிராணி உரிமையாளர்",
        tabDoctor: "🩺 மருத்துவர் / பணியாளர்",
        emailLabel: "மின்னஞ்சல் முகவரி",
        passwordLabel: "கடவுச்சொல்",
        signInBtn: "உள்நுழைக",
        quickOwner: "⚡ 1-கிளிக் உரிமையாளர்",
        quickDoctor: "🩺 1-கிளிக் மருத்துவர்",
        demoText: "டெமோ:",
        createAccount: "✨ புதிய கணக்கு தொடங்க",
        orText: "அல்லது",
        regNameLabel: "முழு பெயர் *",
        regEmailLabel: "மின்னஞ்சல் முகவரி *",
        regPasswordLabel: "கடவுச்சொல் * (குறைந்தது 4 எழுத்துகள்)",
        regPhoneLabel: "தொலைபேசி எண்",
        regAddressLabel: "வீட்டு முகவரி",
        regSubmitBtn: "🎉 கணக்கு தொடங்குக",
        backToLogin: "← மீண்டும் உள்நுழைய",
        portalOwner: "🐾 உரிமையாளர்",
        portalDoctor: "🩺 மருத்துவர்",
        ownerBadge: "🐾 செல்லப்பிராணி உரிமையாளர்",
        doctorBadge: "🩺 மருத்துவர் & பணியாளர்",
        ownerMenuTitle: "🐾 செல்லப்பிராணி உரிமையாளர் பட்டி",
        doctorMenuTitle: "🩺 மருத்துவர் & பணியாளர் பட்டி",
        navDashboard: "பணியாளர் கட்டுப்பாட்டறை",
        navPets: "என் செல்லப்பிராணிகள்",
        navAppointments: "முன்பதிவு செய்ய",
        navHealth: "மருத்துவ பதிவுகள்",
        navBilling: "கட்டணம் & ரசீதுகள்",
        navReports: "அறிக்கைகள் & பகுப்பாய்வு",
        navEvents: "நலவாழ்வு முகாம்கள்",
        navProfile: "என் சுயவிவரம்",
        btnBookAppointment: "📅 முன்பதிவு செய்ய",
        btnStaffQueue: "📋 பணியாளர் வரிசை",
        fabQuickBook: "ஆலோசனை முன்பதிவு",
        fabStaffQueue: "பணியாளர் வரிசை",
        statPets: "மொத்த செல்லப்பிராணிகள்",
        statPending: "நிலுவை ஒப்புதல்கள்",
        statConfirmed: "உறுதிசெய்யப்பட்ட முன்பதிவுகள்",
        statRevenue: "மொத்த வருவாய் வசூல்",
        announcementsTitle: "📢 கிளினிக் அறிவிப்புகள்",
        postAnnBtn: "+ அறிவிப்பு வெளியிடு",
        queueTitle: "📋 முன்பதிவு ஒப்புதல் & ஆலோசனை வரிசை",
        searchPetPlaceholder: "🔍 செல்லப்பிராணி பெயர், இனம், உரிமையாளர் மூலம் தேடுங்கள்…",
        allSpecies: "அனைத்து விலங்குகள்",
        btnFullForm: "📝 முழு படிவம்",
        btnRegisterPet: "➕ புதிய செல்லப்பிராணி பதிவு",
        availDocsTitle: "🩺 கிடைக்கும் கால்நடை மருத்துவர்கள் & நேரங்கள்",
        apptRecordsTitle: "📅 முன்பதிவு பதிவுகள்",
        editProfileBtn: "✏️ சுயவிவரம் திருத்து",
        changePassBtn: "🔑 கடவுச்சொல் மாற்ற",
        signOutBtn: "🚪 வெளியேறு",
        bookModalTitle: "📅 மருத்துவ ஆலோசனை முன்பதிவு",
        petNameLabel: "செல்லப்பிராணி பெயர் *",
        petNamePlaceholder: "செல்லப்பிராணி பெயரை உள்ளிடவும் (எ.கா: Buddy)",
        petBreedLabel: "செல்லப்பிராணி இனம் *",
        petBreedPlaceholder: "இனத்தை உள்ளிடவும் (எ.கா: Golden Retriever, Persian)",
        selectDoctorLabel: "மருத்துவரை தேர்ந்தெடுக்கவும் *",
        consultTypeLabel: "ஆலோசனை வகை",
        prefDateLabel: "விருப்பமான தேதி *",
        timeSlotLabel: "நேர இடைவெளி *",
        reasonLabel: "வருகைக்கான காரணம் / அறிகுறிகள்",
        reasonPlaceholder: "அறிகுறிகள் அல்லது ஆலோசனையின் நோக்கத்தை விவரிக்கவும்…",
        confirmBookingBtn: "📅 முன்பதிவை உறுதிசெய்",
        cancelBtn: "ரத்து செய்",
        closeBtn: "மூடு",
        langToggle: "English",
        langSwitched: "மொழி தமிழுக்கு மாற்றப்பட்டது"
    }
};

function t(key, defaultVal) {
    const lang = currentLang || 'ta';
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key] !== undefined) {
        return TRANSLATIONS[lang][key];
    }
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key] !== undefined) {
        return TRANSLATIONS['en'][key];
    }
    return defaultVal !== undefined ? defaultVal : key;
}

function toggleLanguage() {
    const nextLang = currentLang === 'ta' ? 'en' : 'ta';
    setLanguage(nextLang);
    showToast(t('langSwitched'), 'info');
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('vetcare_lang', lang);
    document.documentElement.lang = lang;

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);
        if (text) el.textContent = text;
    });

    // Update all elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = t(key);
        if (text) el.placeholder = text;
    });

    // Update language switch button labels
    const targetLabel = currentLang === 'ta' ? 'English' : 'தமிழ்';
    ['sidebarLangText', 'headerLangText', 'mobileLangText', 'loginLangText'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = targetLabel;
    });

    // Update active section title & subtitle
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        const target = activeSection.id;
        const meta = (sectionMeta[currentLang] && sectionMeta[currentLang][target]) || (sectionMeta['en'] && sectionMeta['en'][target]);
        if (meta) {
            const pt = document.getElementById('page-title');
            const ps = document.getElementById('page-subtitle');
            if (pt) pt.textContent = meta.title;
            if (ps) ps.textContent = meta.subtitle;
        }
    }

    if (typeof updateRoleUI === 'function') {
        updateRoleUI();
    }
}

// ─── In-Memory Cache (TTL = 60s) ───────────────────────────
const _cache = {};
function cacheGet(key) {
    const entry = _cache[key];
    if (!entry) return null;
    if (Date.now() - entry.ts > 60000) { delete _cache[key]; return null; }
    return entry.data;
}
function cacheSet(key, data) { _cache[key] = { data, ts: Date.now() }; }
function cacheClear(key) { delete _cache[key]; }

async function apiGetCached(path) {
    const cached = cacheGet(path);
    if (cached !== null) return cached;
    const data = await apiGet(path);
    cacheSet(path, data);
    return data;
}

// ─── DOM Ready ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    initMockDatabase();
    initTheme();
    setLanguage(currentLang);
    initNav();
    initMobile();
    await checkServerStatus();

    // Periodic health probe every 30s (reduced from 15s)
    setInterval(checkServerStatus, 30000);

    // Restore session
    if (currentUser) {
        applyLogin(currentUser, false);
    } else {
        document.getElementById('loginOverlay').classList.add('active');
    }
});

// ════════════════════════════════════════════════════════════
//   THEME MANAGEMENT
// ════════════════════════════════════════════════════════════
function initTheme() {
    const saved = localStorage.getItem('vetcare_theme') || 'light';
    setTheme(saved);
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            const cur = document.documentElement.getAttribute('data-theme') || 'light';
            setTheme(cur === 'dark' ? 'light' : 'dark');
        });
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vetcare_theme', theme);
    const icon = document.getElementById('themeToggleIcon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ════════════════════════════════════════════════════════════
//   NAVIGATION
// ════════════════════════════════════════════════════════════
const sectionMeta = {
    en: {
        dashboard: { title: 'Staff Dashboard', subtitle: 'Manage appointments, patient records, announcements & clinic analytics.' },
        pets: { title: 'Pet Owner & Record Management', subtitle: 'Register animals, view medical history, and manage pet profiles.' },
        appointments: { title: 'Book Veterinary Appointment', subtitle: 'View doctor schedules and available slots, then book a consultation.' },
        health: { title: 'Vaccination & Health Tracking', subtitle: 'Record medical checkups, update vaccination statuses, and treatment histories.' },
        billing: { title: 'Billing & Invoice Management', subtitle: 'Calculate fees, generate invoices, and track payment status.' },
        reports: { title: 'Reports & Analytics', subtitle: 'Comprehensive clinic statistics, revenue breakdown, and patient demographics.' },
        events: { title: 'Pet Health Camps & Wellness Events', subtitle: 'Browse upcoming vaccination drives and wellness workshops, then register.' },
        profile: { title: 'My Profile & Settings', subtitle: 'Manage your personal information, security credentials, and account activity.' }
    },
    ta: {
        dashboard: { title: 'பணியாளர் கட்டுப்பாட்டு அறை (Dashboard)', subtitle: 'முன்பதிவுகள், நோயாளி பதிவுகள், அறிவிப்புகள் மற்றும் பகுப்பாய்வுகளை நிர்வகிக்கவும்.' },
        pets: { title: 'செல்லப்பிராணி & மருத்துவ விவர மேலாண்மை', subtitle: 'செல்லப்பிராணிகளை பதிவு செய்யவும், மருத்துவ வரலாற்றைக் காணவும், சுயவிவரங்களை நிர்வகிக்கவும்.' },
        appointments: { title: 'மருத்துவ ஆலோசனை முன்பதிவு', subtitle: 'மருத்துவர்களின் நேரம் மற்றும் கால அட்டவணையை பார்த்து ஆலோசனையை முன்பதிவு செய்யவும்.' },
        health: { title: 'தடுப்பூசி & உடல்நல கண்காணிப்பு', subtitle: 'மருத்துவ பரிசோதனைகள், தடுப்பூசி நிலை மற்றும் சிகிச்சை வரலாற்றை பதிவு செய்யவும்.' },
        billing: { title: 'கட்டணம் & ரசீது மேலாண்மை', subtitle: 'கட்டணத்தை கணக்கிடவும், ரசீதுகளை உருவாக்கவும், கட்டண நிலையை கண்காணிக்கவும்.' },
        reports: { title: 'அறிக்கைகள் & பகுப்பாய்வு', subtitle: 'முழுமையான கிளினிக் புள்ளிவிவரங்கள், வருவாய் விவரங்கள் மற்றும் நோயாளிகள் விபரம்.' },
        events: { title: 'செல்லப்பிராணி நலவாழ்வு முகாம்கள்', subtitle: 'வரவிருக்கும் இலவச தடுப்பூசி முகாம்கள் மற்றும் கருத்தரங்குகளில் பங்கேற்க பதிவு செய்யவும்.' },
        profile: { title: 'என் சுயவிவரம் & அமைப்புகள்', subtitle: 'உங்கள் தனிப்பட்ட தகவல்கள் மற்றும் கணக்கு செயல்பாடுகளை நிர்வகிக்கவும்.' }
    }
};

function initNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navigateTo(link.dataset.target);
            if (window.innerWidth <= 992) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });
    });
}

function navigateTo(target) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

    const link = document.querySelector(`.nav-link[data-target="${target}"]`);
    const section = document.getElementById(target);
    if (link) link.classList.add('active');
    if (section) section.classList.add('active');

    const meta = (sectionMeta[currentLang] && sectionMeta[currentLang][target]) || (sectionMeta['en'] && sectionMeta['en'][target]);
    if (meta) {
        document.getElementById('page-title').textContent = meta.title;
        document.getElementById('page-subtitle').textContent = meta.subtitle;
    }

    // Lazy load data per section
    if (target === 'pets') loadPets();
    if (target === 'appointments') { loadDoctors(); loadMyAppointments(); }
    if (target === 'health') { loadHealthRecords(); populateHealthPetFilter(); }
    if (target === 'billing') { loadInvoices(); recalcFees(); }
    if (target === 'reports') loadReports();
    if (target === 'events') loadEvents();
    if (target === 'dashboard') { loadDashboardStats(); loadDashboardAppointments(); loadAnnouncements(); }
    if (target === 'profile') loadProfilePage();
}

function initMobile() {
    const toggle = document.getElementById('mobileMenuToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }
    const profileItem = document.getElementById('sidebarUserProfile');
    if (profileItem) {
        profileItem.addEventListener('click', () => navigateTo('profile'));
    }
}

// ════════════════════════════════════════════════════════════
//   AUTHENTICATION (FR-01, NFR-02)
// ════════════════════════════════════════════════════════════
let loginRole = 'owner';

function switchLoginRole(role) {
    loginRole = role;
    document.getElementById('loginRoleInput').value = role;
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`roleTab${role === 'owner' ? 'Owner' : 'Doctor'}`).classList.add('active');
    const hint = document.getElementById('loginDemoHint');
    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPassword');

    if (role === 'owner') {
        hint.textContent = 'alice.johnson@example.com / owner123';
        emailInput.value = 'alice.johnson@example.com';
        passInput.value = 'owner123';
    } else {
        hint.textContent = 'sarah.jenkins@vetcare.com / doctor123';
        emailInput.value = 'sarah.jenkins@vetcare.com';
        passInput.value = 'doctor123';
    }
}

async function quickLogin(role) {
    if (role === 'doctor') {
        switchLoginRole('doctor');
        document.getElementById('loginEmail').value = 'sarah.jenkins@vetcare.com';
        document.getElementById('loginPassword').value = 'doctor123';
    } else {
        switchLoginRole('owner');
        document.getElementById('loginEmail').value = 'alice.johnson@example.com';
        document.getElementById('loginPassword').value = 'owner123';
    }
    const fakeEvent = { preventDefault: () => {} };
    await handleLogin(fakeEvent);
}

function showRegisterPanel() {
    document.getElementById('loginFormSection').style.display = 'none';
    document.getElementById('registerFormSection').style.display = 'block';
}

function showLoginPanel() {
    document.getElementById('loginFormSection').style.display = 'block';
    document.getElementById('registerFormSection').style.display = 'none';
}

async function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    if (btn) {
        btn.textContent = 'Signing in…';
        btn.disabled = true;
    }

    try {
        const res = await apiPost('/auth/login', { email, password });
        applyLogin(res.user, true);
        showToast(`👋 ${res.message}`, 'success');
    } catch (err) {
        showToast(err.message || 'Login failed. Check email & password.', 'error');
    } finally {
        if (btn) {
            btn.textContent = 'Sign In';
            btn.disabled = false;
        }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value.trim();
    const address = document.getElementById('regAddress').value.trim();

    try {
        const user = await apiPost('/auth/register', { name, email, password, role: loginRole, phone, address });
        applyLogin(user, true);
        showToast(`🎉 Account created! Welcome to VetCare, ${name}!`, 'success');
    } catch (err) {
        showToast(err.message || 'Registration failed.', 'error');
    }
}

function applyLogin(user, isNew) {
    currentUser = user;
    localStorage.setItem('vetcare_user', JSON.stringify(user));

    document.getElementById('loginOverlay').classList.remove('active');

    const isDoctor = user.role === 'doctor' || user.role === 'staff';
    switchPortalMode(isDoctor ? 'doctor' : 'user');
    updateSidebarUser(user);

    navigateTo(isDoctor ? 'dashboard' : 'pets');
}

function updateSidebarUser(user) {
    document.getElementById('sidebarUserName').textContent = user.name;
    document.getElementById('sidebarUserRole').textContent = user.role === 'doctor' ? 'Veterinary Doctor' : (user.role === 'staff' ? 'Clinic Staff' : 'Pet Owner');
    document.getElementById('sidebarAvatarLetter').textContent = user.name.charAt(0).toUpperCase();
}

function performLogout() {
    currentUser = null;
    localStorage.removeItem('vetcare_user');
    document.getElementById('loginOverlay').classList.add('active');
    switchLoginRole('owner');
    showToast('Logged out successfully.', 'info');
}

// ════════════════════════════════════════════════════════════
//   PORTAL ROLE SWITCHING
// ════════════════════════════════════════════════════════════
function confirmSwitchMode(mode) {
    if (mode === 'doctor' && (!currentUser || (currentUser.role !== 'doctor' && currentUser.role !== 'staff'))) {
        showToast('ℹ️ Switched to Doctor Demo preview. Log in as Doctor for full privileges.', 'info');
    }
    switchPortalMode(mode);
}

function switchPortalMode(mode) {
    currentPortalMode = mode;
    const isDoc = mode === 'doctor';

    document.body.classList.toggle('role-doctor', isDoc);
    document.body.classList.toggle('role-user', !isDoc);

    document.getElementById('portalUserBtn').classList.toggle('active', !isDoc);
    document.getElementById('portalDoctorBtn').classList.toggle('active', isDoc);

    const badge = document.getElementById('portalModeBadge');
    const mobBadge = document.getElementById('mobileBadge');
    const navTitle = document.getElementById('navSectionTitle');

    if (isDoc) {
        badge.textContent = currentLang === 'ta' ? '🩺 மருத்துவர் & பணியாளர்' : '🩺 Doctor & Staff';
        badge.className = 'status-badge status-pending';
        if (mobBadge) { mobBadge.textContent = currentLang === 'ta' ? '🩺 மருத்துவர்' : '🩺 Doctor'; mobBadge.className = 'status-badge status-pending'; }
        navTitle.textContent = currentLang === 'ta' ? '🩺 மருத்துவர் & பணியாளர் பட்டி' : '🩺 Doctor & Staff Menu';
    } else {
        badge.textContent = currentLang === 'ta' ? '🐾 செல்லப்பிராணி உரிமையாளர்' : '🐾 Pet Owner';
        badge.className = 'status-badge status-confirmed';
        if (mobBadge) { mobBadge.textContent = currentLang === 'ta' ? '🐾 உரிமையாளர்' : '🐾 Owner'; mobBadge.className = 'status-badge status-confirmed'; }
        navTitle.textContent = currentLang === 'ta' ? '🐾 செல்லப்பிராணி உரிமையாளர் பட்டி' : '🐾 Pet Owner Menu';
    }

    // Show/hide doctor nav items
    document.querySelectorAll('[data-role-access="doctor"]').forEach(el => {
        el.style.display = isDoc ? '' : 'none';
    });

    // Update FAB & quick action button
    const fab = document.getElementById('fabQuickBook');
    const qbtn = document.getElementById('btnQuickAction');
    if (isDoc) {
        if (fab) { fab.querySelector('.fab-text').textContent = currentLang === 'ta' ? 'பணியாளர் வரிசை' : 'Staff Queue'; fab.onclick = () => navigateTo('dashboard'); }
        if (qbtn) { qbtn.textContent = currentLang === 'ta' ? '📋 பணியாளர் வரிசை' : '📋 Staff Queue'; qbtn.onclick = () => navigateTo('dashboard'); }
    } else {
        if (fab) { fab.querySelector('.fab-text').textContent = currentLang === 'ta' ? 'ஆலோசனை முன்பதிவு' : 'Book Consultation'; fab.onclick = () => openBookingModal(); }
        if (qbtn) { qbtn.textContent = currentLang === 'ta' ? '📅 முன்பதிவு செய்ய' : '📅 Book Appointment'; qbtn.onclick = () => openBookingModal(); }
    }

    // Navigate appropriately
    if (isDoc) {
        navigateTo('dashboard');
    } else {
        const activeSection = document.querySelector('.content-section.active');
        if (!activeSection || activeSection.id === 'dashboard' || activeSection.id === 'health') {
            navigateTo('pets');
        } else {
            loadPets();
        }
    }
}

// ════════════════════════════════════════════════════════════
//   FR-05: STAFF DASHBOARD & ANNOUNCEMENTS
// ════════════════════════════════════════════════════════════
async function loadDashboardStats() {
    try {
        const stats = await apiGet('/dashboard/stats');
        document.getElementById('statPets').textContent = stats.total_pets;
        document.getElementById('statPending').textContent = stats.pending_appointments;
        document.getElementById('statConfirmed').textContent = stats.confirmed_appointments;
        document.getElementById('statRevenue').textContent = '$' + stats.total_revenue.toFixed(2);
    } catch {
        // ignore
    }
}

async function loadAnnouncements() {
    try {
        const anns = await apiGet('/announcements');
        const el = document.getElementById('announcementsList');
        if (!anns.length) {
            el.innerHTML = '<div class="loading-placeholder">No clinic announcements posted yet.</div>';
            return;
        }
        const catClass = { 'Vaccination': 'cat-vaccination', 'Facility': 'cat-facility' };
        el.innerHTML = anns.map(a => `
            <div class="announcement-item ${catClass[a.category] || ''}">
                <div class="announcement-title">${esc(a.title)}</div>
                <div class="announcement-author">📌 ${esc(a.author)} · <strong>${esc(a.category)}</strong> · ${fmtDate(a.created_at)}</div>
                <div class="announcement-content">${esc(a.content)}</div>
                <button type="button" class="announcement-delete" onclick="deleteAnnouncement(${a.id})" title="Delete announcement">✕</button>
            </div>
        `).join('');
    } catch {
        document.getElementById('announcementsList').innerHTML = '<div class="loading-placeholder">Failed to load announcements.</div>';
    }
}

async function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
        await apiDel(`/announcements/${id}`);
        showToast('Announcement deleted.', 'info');
        loadAnnouncements();
    } catch (err) {
        showToast(err.message || 'Failed to delete.', 'error');
    }
}

function openPostAnnouncementModal() {
    openModal('📢 Post Clinic Announcement', `
        <div class="form-group">
            <label>Announcement Title *</label>
            <input id="annTitle" class="form-control" placeholder="e.g. Free Rabies Camp this Weekend" required>
        </div>
        <div class="form-group">
            <label>Category</label>
            <select id="annCategory" class="form-control">
                <option value="General">General</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Facility">Facility</option>
                <option value="Pet Wellness">Pet Wellness</option>
            </select>
        </div>
        <div class="form-group">
            <label>Content *</label>
            <textarea id="annContent" class="form-control" placeholder="Write the announcement details here…" rows="4" required></textarea>
        </div>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="submitAnnouncement()">📢 Post Announcement</button>
    `);
}

async function submitAnnouncement() {
    const title = document.getElementById('annTitle').value.trim();
    const content = document.getElementById('annContent').value.trim();
    const category = document.getElementById('annCategory').value;
    const author = currentUser?.name || 'Dr. Sarah Jenkins';

    if (!title || !content) {
        showToast('Title and content are required.', 'warning');
        return;
    }

    try {
        await apiPost('/announcements', { title, author, category, content });
        closeModal();
        showToast('📢 Announcement published successfully!', 'success');
        loadAnnouncements();
    } catch (err) {
        showToast(err.message || 'Failed to post announcement.', 'error');
    }
}

// ─── Dashboard Appointments Queue ─────────────────────────
async function loadDashboardAppointments() {
    const query = document.getElementById('dashSearch')?.value.trim() || '';
    const status = document.getElementById('dashFilter')?.value || 'all';
    const tbody = document.getElementById('dashboardTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row">Loading…</td></tr>';

    try {
        const params = new URLSearchParams();
        if (query) params.set('query', query);
        if (status !== 'all') params.set('status', status);
        // Pet owner login-ல own appointments மட்டும் காட்டு
        if (currentPortalMode === 'user' && currentUser && currentUser.role === 'owner') {
            params.set('owner_id', currentUser.id);
        }
        const appts = await apiGet(`/appointments?${params}`);
        renderDashboardAppts(appts, tbody);
    } catch {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-row">Failed to load appointments.</td></tr>';
    }
}

function renderDashboardAppts(appts, tbody) {
    if (!appts.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-row">No appointments matching criteria.</td></tr>';
        return;
    }
    tbody.innerHTML = appts.map(a => {
        const statusBadge = getStatusBadge(a.status);
        const actions = buildDashboardActions(a);
        return `<tr id="dash-row-${a.id}">
            <td><strong>${esc(a.apt_code)}</strong></td>
            <td>
                <div class="pet-cell">
                    <div class="pet-thumb-placeholder">${speciesEmoji(a.species)}</div>
                    <div>
                        <div><strong>${esc(a.pet_name || 'Unknown')}</strong></div>
                        <small style="color:var(--text-muted)">${esc(a.owner_name || '')}</small>
                    </div>
                </div>
            </td>
            <td>${esc(a.doctor_name || 'TBD')}</td>
            <td>${esc(a.appointment_date)}<br><small style="color:var(--text-muted)">${esc(formatSlotRange(a.time_slot))}</small></td>
            <td>${esc(a.consultation_type || 'General')}</td>
            <td>${statusBadge}</td>
            <td>${actions}</td>
        </tr>`;
    }).join('');
}

function buildDashboardActions(a) {
    const btns = [];
    if (a.status === 'Pending Review') {
        btns.push(`<button type="button" class="btn btn-accent btn-sm" onclick="approveAppointment(${a.id})">✅ Approve</button>`);
        btns.push(`<button type="button" class="btn btn-secondary btn-sm" style="color:var(--brand-danger)" onclick="cancelAppointment(${a.id})">✕ Cancel</button>`);
    } else if (a.status === 'Confirmed') {
        btns.push(`<button type="button" class="btn btn-primary btn-sm" onclick="openCompleteConsultationModal(${a.id}, '${esc(a.pet_name)}', '${esc(a.doctor_name)}')">✨ Complete</button>`);
        btns.push(`<button type="button" class="btn btn-secondary btn-sm" style="color:var(--brand-danger)" onclick="cancelAppointment(${a.id})">✕ Cancel</button>`);
    }
    btns.push(`<button type="button" class="btn btn-secondary btn-sm" onclick="viewAppointmentDetails(${a.id})">Details</button>`);
    return `<div style="display:flex;gap:6px;flex-wrap:wrap;">${btns.join('')}</div>`;
}

async function approveAppointment(aptId) {
    try {
        await apiPut(`/appointments/${aptId}/status`, { status: 'Confirmed', doctor_notes: 'Approved by veterinary staff.' });
        showToast('✅ Appointment confirmed!', 'success');
        loadDashboardAppointments();
        loadDashboardStats();
    } catch (err) {
        showToast(err.message || 'Failed to approve.', 'error');
    }
}

async function cancelAppointment(aptId) {
    if (!confirm('Cancel this appointment?')) return;
    try {
        await apiPut(`/appointments/${aptId}/status`, { status: 'Cancelled', doctor_notes: 'Cancelled by staff.' });
        showToast('Appointment cancelled.', 'info');
        loadDashboardAppointments();
        loadMyAppointments();
        loadDashboardStats();
    } catch (err) {
        showToast(err.message || 'Failed to cancel.', 'error');
    }
}

function openCompleteConsultationModal(aptId, petName, doctorName) {
    openModal(`✨ Complete Consultation — ${petName}`, `
        <div class="form-group">
            <label>Clinical Diagnosis / Findings *</label>
            <input id="complDiag" class="form-control" placeholder="e.g. Routine healthy exam, clean teeth, mild ear wax" required>
        </div>
        <div class="form-group">
            <label>Prescribed Medications / Treatment *</label>
            <textarea id="complMeds" class="form-control" placeholder="e.g. Topical ear drops 2 drops BID for 5 days" rows="2" required></textarea>
        </div>
        <div class="form-group">
            <label>Clinical Notes</label>
            <textarea id="complNotes" class="form-control" placeholder="Additional treatment notes…" rows="2"></textarea>
        </div>
        <div class="form-group">
            <label>Next Follow-Up Date</label>
            <input type="date" id="complFollowUp" class="form-control">
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>Consultation Fee ($)</label>
                <input type="number" id="complConsult" class="form-control" value="50" min="0">
            </div>
            <div class="form-group">
                <label>Treatment Fee ($)</label>
                <input type="number" id="complTreatment" class="form-control" value="20" min="0">
            </div>
            <div class="form-group">
                <label>Medication Fee ($)</label>
                <input type="number" id="complMedFee" class="form-control" value="15" min="0">
            </div>
        </div>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="submitCompleteConsultation(${aptId})">💾 Complete & Generate Bill</button>
    `);
}

async function submitCompleteConsultation(aptId) {
    const diagnosis = document.getElementById('complDiag').value.trim();
    const medications = document.getElementById('complMeds').value.trim();
    const treatment_notes = document.getElementById('complNotes').value.trim();
    const follow_up_date = document.getElementById('complFollowUp').value;
    const consultation_fee = parseFloat(document.getElementById('complConsult').value) || 50;
    const treatment_fee = parseFloat(document.getElementById('complTreatment').value) || 0;
    const medication_fee = parseFloat(document.getElementById('complMedFee').value) || 0;

    if (!diagnosis || !medications) {
        showToast('Diagnosis and medications are required.', 'warning');
        return;
    }

    try {
        const result = await apiPost(`/appointments/${aptId}/complete`, {
            diagnosis, medications, treatment_notes, follow_up_date,
            consultation_fee, treatment_fee, medication_fee
        });
        closeModal();
        showToast('✨ Consultation saved, health passport updated & invoice generated!', 'success');
        loadDashboardAppointments();
        loadDashboardStats();
    } catch (err) {
        showToast(err.message || 'Failed to complete consultation.', 'error');
    }
}

function viewAppointmentDetails(aptId) {
    openModal('📋 Appointment Details', `<div class="loading-placeholder">Loading…</div>`, '');
    apiGet(`/appointments/${aptId}`).then(a => {
        document.getElementById('modalBody').innerHTML = `
            <div style="display:flex;flex-direction:column;gap:14px;">
                <div class="form-grid">
                    <div><strong>Appointment Code:</strong><br>${esc(a.apt_code)}</div>
                    <div><strong>Status:</strong><br>${getStatusBadge(a.status)}</div>
                    <div><strong>Pet:</strong><br>${esc(a.pet_name || 'Unknown')} (${esc(a.species || '')})</div>
                    <div><strong>Owner:</strong><br>${esc(a.owner_name || 'Unknown')}</div>
                    <div><strong>Doctor:</strong><br>${esc(a.doctor_name || 'TBD')}</div>
                    <div><strong>Type:</strong><br>${esc(a.consultation_type || 'General')}</div>
                    <div><strong>Date:</strong><br>${esc(a.appointment_date)}</div>
                    <div><strong>Time Slot:</strong><br>${esc(formatSlotRange(a.time_slot))}</div>
                </div>
                ${a.reason ? `<div style="background:var(--bg-hover);padding:12px;border-radius:var(--radius-sm)"><strong>Reason for Visit:</strong><br><span style="color:var(--text-secondary)">${esc(a.reason)}</span></div>` : ''}
                ${a.doctor_notes ? `<div style="background:var(--bg-hover);padding:12px;border-radius:var(--radius-sm)"><strong>🩺 Clinical Notes:</strong><br><span style="color:var(--text-secondary)">${esc(a.doctor_notes)}</span></div>` : ''}
            </div>
        `;
        document.getElementById('modalFooter').innerHTML = `<button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>`;
    }).catch(() => {
        document.getElementById('modalBody').innerHTML = '<div class="loading-placeholder">Failed to load appointment details.</div>';
    });
}

// ════════════════════════════════════════════════════════════
//   FR-01: PET CRUD & PASSPORT
// ════════════════════════════════════════════════════════════
async function loadPets() {
    const query = document.getElementById('petSearch')?.value.trim() || '';
    const species = document.getElementById('petSpeciesFilter')?.value || '';
    const grid = document.getElementById('petsGrid');
    grid.innerHTML = '<div class="loading-placeholder">Loading pets…</div>';

    try {
        const params = new URLSearchParams();
        if (query) params.set('query', query);
        if (species) params.set('species', species);
        if (currentPortalMode === 'user' && currentUser && currentUser.role === 'owner') {
            params.set('owner_id', currentUser.id);
        }
        const pets = await apiGet(`/pets?${params}`);
        renderPets(pets, grid);
    } catch {
        grid.innerHTML = '<div class="loading-placeholder">Failed to load pets.</div>';
    }
}

function renderPets(pets, grid) {
    const isDoc = currentPortalMode === 'doctor';
    if (!pets.length) {
        grid.innerHTML = '<div class="loading-placeholder">No pets found. Click "Register New Pet" to add one!</div>';
        return;
    }
    grid.innerHTML = pets.map(p => {
        const statusBadge = getPetStatusBadge(p.status);
        const avatar = p.species === 'Cat'
            ? `<img src="assets/cat.jpg" alt="${esc(p.name)}" class="pet-card-avatar">`
            : p.species === 'Dog'
                ? `<img src="assets/dog.jpg" alt="${esc(p.name)}" class="pet-card-avatar">`
                : `<div class="pet-card-avatar-placeholder">${speciesEmoji(p.species)}</div>`;

        return `
        <div class="pet-card" id="petcard-${p.id}">
            ${avatar}
            <div class="pet-card-body">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                    <div class="pet-card-name">${esc(p.name)}</div>
                    ${statusBadge}
                </div>
                <div class="pet-card-meta">${esc(p.species)} (${esc(p.breed)}) · ${esc(p.age)} yrs · ${p.gender || 'Unknown'}</div>
                <div class="pet-card-owner">Owner: <strong>${esc(p.owner_name || 'Clinic Patient')}</strong></div>
                ${p.medical_history ? `<div class="pet-card-history">🩺 ${esc(p.medical_history)}</div>` : ''}
            </div>
            <div class="pet-card-actions">
                <button type="button" class="btn btn-secondary btn-sm" onclick="viewPetPassport(${p.id})">${currentLang === 'ta' ? '📖 பாஸ்போர்ட்' : '📖 Passport'}</button>
                <button type="button" class="btn btn-primary btn-sm" onclick="openBookingModal(${p.id})">${currentLang === 'ta' ? '📅 முன்பதிவு' : '📅 Book'}</button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="openEditPetModal(${p.id})" title="${currentLang === 'ta' ? 'திருத்து' : 'Edit Pet'}">✏️</button>
                <button type="button" class="btn btn-danger btn-sm" onclick="deletePet(${p.id})" title="${currentLang === 'ta' ? 'நீக்கு' : 'Delete Pet'}">🗑️</button>
            </div>
        </div>`;
    }).join('');
}

function debouncedPetSearch() {
    clearTimeout(petSearchTimeout);
    petSearchTimeout = setTimeout(loadPets, 300);
}

function openRegisterPetModal() {
    const isTa = currentLang === 'ta';
    openModal(isTa ? '🐾 புதிய செல்லப்பிராணி பதிவு' : '🐾 Register New Pet Patient', `
        <div class="form-grid">
            <div class="form-group">
                <label>${isTa ? 'செல்லப்பிராணி பெயர் *' : 'Pet Name *'}</label>
                <input id="newPetName" class="form-control" placeholder="${isTa ? 'எ.கா: Buddy' : 'e.g. Buddy'}" required>
            </div>
            <div class="form-group">
                <label>${isTa ? 'உரிமையாளர் பெயர் *' : 'Owner Name *'}</label>
                <input id="newOwnerName" class="form-control" placeholder="${isTa ? 'எ.கா: Alice Johnson' : 'e.g. Alice Johnson'}" value="${currentUser?.name || ''}" required>
            </div>
        </div>
        <div class="form-group">
            <label>${isTa ? 'விலங்கு இனம்' : 'Species'}</label>
            <div class="species-chips" id="speciesChips">
                ${['🐶 Dog','🐱 Cat','🐰 Rabbit','🦜 Bird','🐄 Cow','🐐 Goat','🦎 Exotic'].map((s,i) => {
                    const val = s.split(' ')[1];
                    const label = isTa ? {
                        'Dog': '🐶 நாய்', 'Cat': '🐱 பூனை', 'Rabbit': '🐰 முயல்',
                        'Bird': '🦜 பறவை', 'Cow': '🐄 மாடு', 'Goat': '🐐 ஆடு', 'Exotic': '🦎 பிற'
                    }[val] || s : s;
                    return `<div class="species-chip${i===0?' selected':''}" onclick="selectSpecies(this, '${val}')">${label}</div>`;
                }).join('')}
            </div>
            <input type="hidden" id="newPetSpecies" value="Dog">
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>${isTa ? 'இனம்' : 'Breed'}</label>
                <input id="newPetBreed" class="form-control" placeholder="${isTa ? 'எ.கா: Golden Retriever' : 'e.g. Golden Retriever'}" value="Golden Retriever">
            </div>
            <div class="form-group">
                <label>${isTa ? 'வயது (ஆண்டுகள்) *' : 'Age (Years) *'}</label>
                <input type="number" id="newPetAge" class="form-control" value="2" min="0" max="40" required>
            </div>
            <div class="form-group">
                <label>${isTa ? 'பாலினம்' : 'Gender'}</label>
                <select id="newPetGender" class="form-control">
                    <option value="Male">${isTa ? 'ஆண் ♂️' : 'Male ♂️'}</option>
                    <option value="Female">${isTa ? 'பெண் ♀️' : 'Female ♀️'}</option>
                    <option value="Unknown">${isTa ? 'தெரியவில்லை' : 'Unknown'}</option>
                </select>
            </div>
            <div class="form-group">
                <label>${isTa ? 'எடை' : 'Weight'}</label>
                <input id="newPetWeight" class="form-control" placeholder="${isTa ? 'எ.கா: 14 kg' : 'e.g. 14 kg'}" value="12 kg">
            </div>
        </div>
        <div class="form-group">
            <label>${isTa ? 'உடல்நல & மருத்துவ வரலாறு' : 'Health & Medical History'}</label>
            <textarea id="newPetHistory" class="form-control" placeholder="${isTa ? 'முந்தைய தடுப்பூசிகள், ஒவ்வாமைகள், சிகிச்சைகள்…' : 'Previous vaccinations, allergies, surgeries, dietary notes…'}" rows="3"></textarea>
        </div>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">${t('cancelBtn', 'Cancel')}</button>
        <button type="button" class="btn btn-primary" onclick="submitRegisterPet()">${isTa ? '✨ செல்லப்பிராணியை பதிவு செய்' : '✨ Register Pet'}</button>
    `);
}

async function submitRegisterPet() {
    const name = document.getElementById('newPetName').value.trim();
    const owner_name = document.getElementById('newOwnerName').value.trim();
    if (!name || !owner_name) {
        showToast('Pet name and owner name are required.', 'warning');
        return;
    }

    const payload = {
        name,
        owner_name,
        owner_id: currentUser?.id || null,
        species: document.getElementById('newPetSpecies').value,
        breed: document.getElementById('newPetBreed').value.trim() || 'Mix',
        age: document.getElementById('newPetAge').value || '1',
        gender: document.getElementById('newPetGender').value,
        weight: document.getElementById('newPetWeight').value.trim(),
        medical_history: document.getElementById('newPetHistory').value.trim(),
        status: 'Healthy 🟢'
    };

    try {
        await apiPost('/pets', payload);
        closeModal();
        showToast(`🎉 ${name} registered successfully!`, 'success');
        loadPets();
    } catch (err) {
        showToast(err.message || 'Registration failed.', 'error');
    }
}

function openEditPetModal(petId) {
    apiGet(`/pets/${petId}`).then(pet => {
        openModal(`✏️ Edit Pet Record — ${pet.name}`, `
            <div class="form-grid">
                <div class="form-group">
                    <label>Pet Name *</label>
                    <input id="editPetName" class="form-control" value="${esc(pet.name)}" required>
                </div>
                <div class="form-group">
                    <label>Species *</label>
                    <input id="editPetSpecies" class="form-control" value="${esc(pet.species)}" required>
                </div>
                <div class="form-group">
                    <label>Breed</label>
                    <input id="editPetBreed" class="form-control" value="${esc(pet.breed)}">
                </div>
                <div class="form-group">
                    <label>Age (Years)</label>
                    <input type="number" id="editPetAge" class="form-control" value="${pet.age}" min="0">
                </div>
                <div class="form-group">
                    <label>Gender</label>
                    <select id="editPetGender" class="form-control">
                        <option value="Male" ${pet.gender === 'Male' ? 'selected' : ''}>Male ♂️</option>
                        <option value="Female" ${pet.gender === 'Female' ? 'selected' : ''}>Female ♀️</option>
                        <option value="Unknown" ${pet.gender === 'Unknown' ? 'selected' : ''}>Unknown</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Health Status</label>
                    <select id="editPetStatus" class="form-control">
                        <option ${pet.status === 'Healthy 🟢' ? 'selected' : ''}>Healthy 🟢</option>
                        <option ${pet.status === 'Booster Due 🟡' ? 'selected' : ''}>Booster Due 🟡</option>
                        <option ${pet.status === 'Vaccination Overdue 🔴' ? 'selected' : ''}>Vaccination Overdue 🔴</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Medical History & Clinical Notes</label>
                <textarea id="editPetHistory" class="form-control" rows="4">${esc(pet.medical_history || '')}</textarea>
            </div>
        `, `
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="submitEditPet(${petId})">💾 Save Changes</button>
        `);
    });
}

async function submitEditPet(petId) {
    const payload = {
        name: document.getElementById('editPetName').value.trim(),
        species: document.getElementById('editPetSpecies').value.trim(),
        breed: document.getElementById('editPetBreed').value.trim(),
        age: document.getElementById('editPetAge').value,
        gender: document.getElementById('editPetGender').value,
        status: document.getElementById('editPetStatus').value,
        medical_history: document.getElementById('editPetHistory').value.trim()
    };

    try {
        await apiPut(`/pets/${petId}`, payload);
        closeModal();
        showToast('✅ Pet details updated!', 'success');
        loadPets();
    } catch (err) {
        showToast(err.message || 'Failed to update pet.', 'error');
    }
}

async function deletePet(petId) {
    if (!confirm('Are you sure you want to delete this pet record?')) return;
    try {
        await apiDel(`/pets/${petId}`);
        showToast('Pet record deleted.', 'info');
        loadPets();
    } catch (err) {
        showToast(err.message || 'Failed to delete pet.', 'error');
    }
}

async function viewPetPassport(petId) {
    try {
        const pet = await apiGet(`/pets/${petId}`);
        const records = await apiGet(`/health-logs?pet_id=${petId}`);
        const avatar = pet.species === 'Cat' ? 'assets/cat.jpg' : 'assets/dog.jpg';

        openModal(`📖 Digital Pet Passport — ${pet.name}`, `
            <div class="passport-card" id="printablePassport">
                <div class="passport-header">
                    <img src="${avatar}" alt="${esc(pet.name)}" class="passport-avatar" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><text y=\\'.9em\\' font-size=\\'90\\'>🐾</text></svg>'">
                    <div>
                        <h3 style="font-size:1.35rem;font-weight:800">${esc(pet.name)}</h3>
                        <span class="passport-chip">${esc(pet.species)} · ${esc(pet.breed)}</span>
                        <p style="font-size:0.85rem;color:var(--text-muted);margin-top:4px">
                            Owner: <strong>${esc(pet.owner_name || 'Clinic Patient')}</strong> · Age: ${esc(pet.age)} yrs · ${pet.gender || ''}
                        </p>
                        <p style="font-size:0.75rem;color:var(--text-muted)">🆔 Animal Record ID: #VET-${petId.toString().padStart(4,'0')}</p>
                    </div>
                </div>
                <div>
                    <strong>Health Status:</strong> ${getPetStatusBadge(pet.status)}
                </div>
                ${pet.medical_history ? `<div><strong>Medical History & Allergies:</strong><p style="font-size:0.88rem;color:var(--text-secondary);margin-top:4px;background:var(--bg-hover);padding:10px;border-radius:var(--radius-sm)">${esc(pet.medical_history)}</p></div>` : ''}
                <div>
                    <strong>Vaccination & Checkup Logs:</strong>
                    <div class="passport-timeline" style="margin-top:8px;">
                        ${records.length ? records.map(r => `
                            <div class="passport-timeline-row">
                                <div>
                                    <strong>💉 ${esc(r.vaccine_name || 'Checkup')}</strong> · ${esc(r.checkup_date)}<br>
                                    <small style="color:var(--text-muted)">${esc(r.diagnosis || '')}</small>
                                </div>
                                <span class="${getVaxBadgeClass(r.vaccination_status)} status-badge">${esc(r.vaccination_status)}</span>
                            </div>
                        `).join('') : '<div class="loading-placeholder" style="padding:12px">No vaccination records logged yet.</div>'}
                    </div>
                </div>
            </div>
        `, `
            <button type="button" class="btn btn-secondary" onclick="window.print()">🖨️ Print Passport</button>
            <button type="button" class="btn btn-primary" onclick="closeModal()">Close</button>
        `);
    } catch (err) {
        showToast('Failed to load passport.', 'error');
    }
}

// ════════════════════════════════════════════════════════════
//   FR-02: DOCTOR SCHEDULES & APPOINTMENT BOOKING
// ════════════════════════════════════════════════════════════
function formatSlotRange(slot) {
    if (!slot) return '';
    const s = String(slot).trim();
    if (s.includes('-')) return s;
    const rangeMap = {
        '09:00 AM': '09:00 AM - 10:00 AM',
        '10:00 AM': '10:00 AM - 11:00 AM',
        '11:30 AM': '11:30 AM - 12:30 PM',
        '01:30 PM': '01:30 PM - 02:30 PM',
        '02:00 PM': '02:00 PM - 03:00 PM',
        '03:00 PM': '03:00 PM - 04:00 PM',
        '03:30 PM': '03:30 PM - 04:30 PM',
        '04:30 PM': '04:30 PM - 05:30 PM'
    };
    return rangeMap[s] || s;
}

function onBookingDoctorChange(docId) {
    const slotSelect = document.getElementById('bookSlot');
    if (!slotSelect || !window._cachedBookingDoctors) return;
    const doc = window._cachedBookingDoctors.find(d => String(d.id) === String(docId));
    if (doc && doc.time_slots) {
        const slots = doc.time_slots.split(',').map(s => formatSlotRange(s.trim())).filter(Boolean);
        if (slots.length) {
            slotSelect.innerHTML = slots.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
        }
    }
}

async function loadDoctors() {
    const grid = document.getElementById('doctorsGrid');
    grid.innerHTML = '<div class="loading-placeholder">Loading doctors…</div>';

    try {
        const doctors = await apiGetCached('/doctors');
        if (!doctors.length) {
            grid.innerHTML = '<div class="loading-placeholder">No doctors available.</div>';
            return;
        }
        grid.innerHTML = doctors.map(d => {
            const slots = (d.time_slots || '').split(',').map(s => formatSlotRange(s.trim())).filter(Boolean);
            const slotsHtml = slots.map(s => `<div class="slot-pill" onclick="selectDoctorSlot(this, ${d.id}, '${esc(s)}')">${esc(s)}</div>`).join('');
            return `
            <div class="doctor-card">
                <div class="doctor-header">
                    <img src="${d.avatar || 'assets/dr_sarah.jpg'}" alt="${esc(d.name)}" class="doctor-avatar">
                    <div>
                        <div class="doctor-name">${esc(d.name)}</div>
                        <div class="doctor-specialty">🩺 ${esc(d.specialty)}</div>
                        <div class="doctor-meta">${esc(d.experience || '')} · <span class="doctor-rating">⭐ ${d.rating}</span></div>
                        <div class="doctor-meta" style="margin-top:4px">📅 ${esc(d.available_days || 'Mon - Sat')} · 💵 $${d.consultation_fee} / consultation</div>
                    </div>
                </div>
                <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:6px">Select an open time slot:</p>
                <div class="time-slots-wrap">${slotsHtml}</div>
                <button type="button" class="btn btn-primary" style="width:100%;margin-top:10px" onclick="openBookingModal(null, ${d.id})">📅 Select & Book</button>
            </div>`;
        }).join('');
    } catch {
        grid.innerHTML = '<div class="loading-placeholder">Failed to load doctors.</div>';
    }
}

function selectDoctorSlot(el, docId, slot) {
    document.querySelectorAll('.slot-pill').forEach(p => p.classList.remove('selected'));
    el.classList.add('selected');
    selectedDoctorId = docId;
    selectedSlot = formatSlotRange(slot);
    openBookingModal(null, docId);
}

async function openBookingModal(petId = null, doctorId = null) {
    const params = new URLSearchParams();
    if (currentPortalMode === 'user' && currentUser && currentUser.role === 'owner') {
        params.set('owner_id', currentUser.id);
    }
    const pets = await apiGet(`/pets?${params}`);
    window._cachedBookingPets = pets;
    const doctors = await apiGetCached('/doctors');
    window._cachedBookingDoctors = doctors;

    let initialPetName = '';
    let initialPetBreed = '';
    if (petId) {
        const found = pets.find(p => p.id === petId);
        if (found) {
            initialPetName = found.name || '';
            initialPetBreed = found.breed || '';
        }
    }

    const chosenDocId = doctorId || selectedDoctorId || (doctors[0] ? doctors[0].id : null);
    const docOptions = doctors.map(d => `<option value="${d.id}"${chosenDocId === d.id ? ' selected' : ''}>${esc(d.name)} — ${esc(d.specialty)}</option>`).join('');

    const activeDoc = doctors.find(d => d.id === chosenDocId) || doctors[0];
    let docSlots = [];
    if (activeDoc && activeDoc.time_slots) {
        docSlots = activeDoc.time_slots.split(',').map(s => formatSlotRange(s.trim())).filter(Boolean);
    }
    const defaultRangeSlots = [
        '09:00 AM - 10:00 AM',
        '10:00 AM - 11:00 AM',
        '11:30 AM - 12:30 PM',
        '01:30 PM - 02:30 PM',
        '02:00 PM - 03:00 PM',
        '03:00 PM - 04:00 PM',
        '03:30 PM - 04:30 PM',
        '04:30 PM - 05:30 PM'
    ];
    const availableSlots = docSlots.length ? docSlots : defaultRangeSlots;
    const currentChosenSlot = formatSlotRange(selectedSlot) || availableSlots[0];
    if (currentChosenSlot && !availableSlots.includes(currentChosenSlot)) {
        availableSlots.unshift(currentChosenSlot);
    }

    const today = new Date().toISOString().split('T')[0];

    const consultOptions = currentLang === 'ta' ? `
        <option>பொது உடல்நல பரிசோதனை (Routine Health Checkup)</option>
        <option>தடுப்பூசி செலுத்துதல் (Booster Immunization)</option>
        <option>பல் பராமரிப்பு பரிசோதனை (Dental Scaling Review)</option>
        <option>அறுவைசிகிச்சை ஆலோசனை (Surgical Consultation)</option>
        <option>ஒவ்வாமை & தோல் சிகிச்சை (Allergy & Dermatology)</option>
        <option>அவசர சிகிச்சை ஆலோசனை (Emergency Consultation)</option>
    ` : `
        <option>Routine Health Checkup</option>
        <option>Booster Immunization</option>
        <option>Dental Scaling Review</option>
        <option>Surgical Consultation</option>
        <option>Allergy & Dermatology</option>
        <option>Emergency Consultation</option>
    `;

    openModal(t('bookModalTitle', '📅 Book Veterinary Appointment Consultation'), `
        <div class="form-group">
            <label>${t('petNameLabel', 'Pet Name *')}</label>
            <input type="text" id="bookPetName" class="form-control" placeholder="${t('petNamePlaceholder', 'Enter pet name (e.g. Buddy)')}" value="${esc(initialPetName)}" list="bookingPetsList" oninput="onBookingPetNameChange(this.value)" required>
            <datalist id="bookingPetsList">
                ${pets.map(p => `<option value="${esc(p.name)}">${esc(p.name)} (${esc(p.species)} - ${esc(p.breed)})</option>`).join('')}
            </datalist>
        </div>
        <div class="form-group">
            <label>${t('petBreedLabel', 'Pet Breed *')}</label>
            <input type="text" id="bookPetBreed" class="form-control" placeholder="${t('petBreedPlaceholder', 'Enter pet breed (e.g. Golden Retriever, Persian)')}" value="${esc(initialPetBreed)}" required>
        </div>
        <div class="form-group">
            <label>${t('selectDoctorLabel', 'Select Veterinary Doctor *')}</label>
            <select id="bookDoctorId" class="form-control" onchange="onBookingDoctorChange(this.value)">
                ${docOptions}
            </select>
        </div>
        <div class="form-group">
            <label>${t('consultTypeLabel', 'Consultation Type')}</label>
            <select id="bookType" class="form-control">
                ${consultOptions}
            </select>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>${t('prefDateLabel', 'Preferred Date *')}</label>
                <input type="date" id="bookDate" class="form-control" value="${today}" min="${today}" required>
            </div>
            <div class="form-group">
                <label>${t('timeSlotLabel', 'Time Slot *')}</label>
                <select id="bookSlot" class="form-control">
                    ${availableSlots.map(s => `<option value="${esc(s)}"${s === currentChosenSlot ? ' selected' : ''}>${esc(s)}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>${t('reasonLabel', 'Reason for Visit / Symptoms')}</label>
            <textarea id="bookReason" class="form-control" placeholder="${t('reasonPlaceholder', 'Describe symptoms or purpose of appointment…')}" rows="2"></textarea>
        </div>
        <div style="background:var(--bg-hover);padding:12px;border-radius:var(--radius-sm);font-size:0.83rem;color:var(--text-muted)">
            ℹ️ Usability Guarantee (NFR-03): Bookings are submitted directly in 5 clicks or fewer.
        </div>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">${t('cancelBtn', 'Cancel')}</button>
        <button type="button" class="btn btn-primary" onclick="submitBookAppointment()">${t('confirmBookingBtn', '📅 Confirm Booking')}</button>
    `);
}

function onBookingPetNameChange(val) {
    if (!window._cachedBookingPets || !val) return;
    const match = window._cachedBookingPets.find(p => p.name.toLowerCase() === val.trim().toLowerCase());
    const breedInput = document.getElementById('bookPetBreed');
    if (match && breedInput && (!breedInput.value || match.breed)) {
        breedInput.value = match.breed || '';
    }
}

async function submitBookAppointment() {
    const pet_name = document.getElementById('bookPetName')?.value.trim();
    const pet_breed = document.getElementById('bookPetBreed')?.value.trim();
    const doctor_id = parseInt(document.getElementById('bookDoctorId').value);
    const appointment_date = document.getElementById('bookDate').value;
    const time_slot = document.getElementById('bookSlot').value;
    const consultation_type = document.getElementById('bookType').value;
    const reason = document.getElementById('bookReason').value.trim();

    if (!pet_name) { showToast(currentLang === 'ta' ? 'தயவுசெய்து செல்லப்பிராணி பெயரை உள்ளிடவும்.' : 'Please enter pet name.', 'warning'); return; }
    if (!pet_breed) { showToast(currentLang === 'ta' ? 'தயவுசெய்து செல்லப்பிராணி இனத்தை உள்ளிடவும்.' : 'Please enter pet breed.', 'warning'); return; }
    if (!doctor_id) { showToast(currentLang === 'ta' ? 'தயவுசெய்து மருத்துவரை தேர்ந்தெடுக்கவும்.' : 'Please select a doctor.', 'warning'); return; }
    if (!appointment_date) { showToast(currentLang === 'ta' ? 'தயவுசெய்து தேதியை தேர்ந்தெடுக்கவும்.' : 'Please select a date.', 'warning'); return; }

    let pet_id = null;
    if (window._cachedBookingPets && window._cachedBookingPets.length) {
        const match = window._cachedBookingPets.find(p => p.name.toLowerCase() === pet_name.toLowerCase());
        if (match) {
            pet_id = match.id;
        }
    }

    try {
        await apiPost('/appointments', {
            pet_id,
            pet_name,
            pet_breed,
            doctor_id,
            consultation_type,
            appointment_date,
            time_slot,
            reason,
            owner_id: currentUser?.id || null
        });
        closeModal();
        showToast(currentLang === 'ta' ? '📅 சந்திப்பு முன்பதிவு செய்யப்பட்டது! மருத்துவர் ஒப்புதலுக்கு காத்திருக்கிறது.' : '📅 Appointment booked! Awaiting doctor review.', 'success');
        loadMyAppointments();
        loadPets();
    } catch (err) {
        showToast(err.message || (currentLang === 'ta' ? 'முன்பதிவு தோல்வியடைந்தது.' : 'Booking failed.'), 'error');
    }
}

async function loadMyAppointments() {
    const status = document.getElementById('myApptFilter')?.value || 'all';
    const tbody = document.getElementById('myAppointmentsBody');
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row">Loading…</td></tr>';

    try {
        const params = new URLSearchParams();
        if (status !== 'all') params.set('status', status);
        if (currentPortalMode === 'user' && currentUser && currentUser.role === 'owner') {
            params.set('owner_id', currentUser.id);
        }
        const appts = await apiGet(`/appointments?${params}`);

        if (!appts.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-row">No appointments recorded.</td></tr>';
            return;
        }
        tbody.innerHTML = appts.map(a => `
            <tr>
                <td><strong>${esc(a.apt_code)}</strong></td>
                <td>${esc(a.pet_name || 'Unknown')} (${esc(a.species || '')})</td>
                <td>${esc(a.doctor_name || 'TBD')}</td>
                <td>${esc(a.appointment_date)}<br><small style="color:var(--text-muted)">${esc(formatSlotRange(a.time_slot))}</small></td>
                <td>${esc(a.consultation_type || 'General')}</td>
                <td>${getStatusBadge(a.status)}</td>
                <td>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="viewAppointmentDetails(${a.id})">Details</button>
                    ${a.status === 'Pending Review' ? `<button type="button" class="btn btn-secondary btn-sm" style="color:var(--brand-danger)" onclick="cancelAppointment(${a.id})">Cancel</button>` : ''}
                </td>
            </tr>
        `).join('');
    } catch {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-row">Failed to load appointments.</td></tr>';
    }
}

// ════════════════════════════════════════════════════════════
//   FR-03: HEALTH RECORDS & VACCINATIONS
// ════════════════════════════════════════════════════════════
async function loadHealthRecords() {
    const petId = document.getElementById('healthPetFilter')?.value || '';
    const vaxStatus = document.getElementById('healthStatusFilter')?.value || '';
    const tbody = document.getElementById('healthRecordsBody');
    tbody.innerHTML = '<tr><td colspan="8" class="empty-row">Loading…</td></tr>';

    try {
        const params = new URLSearchParams();
        if (petId) params.set('pet_id', petId);
        if (vaxStatus) params.set('vaccination_status', vaxStatus);

        const records = await apiGet(`/health-logs?${params}`);
        if (!records.length) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-row">No health records found.</td></tr>';
            return;
        }
        tbody.innerHTML = records.map(r => `
            <tr>
                <td>
                    <div class="pet-cell">
                        <div class="pet-thumb-placeholder">${speciesEmoji(r.species)}</div>
                        <div><strong>${esc(r.pet_name || 'Unknown')}</strong><br><small style="color:var(--text-muted)">${esc(r.breed || '')}</small></div>
                    </div>
                </td>
                <td>${esc(r.checkup_date)}</td>
                <td>${esc(r.vaccine_name || '—')}</td>
                <td><span class="${getVaxBadgeClass(r.vaccination_status)} status-badge">${esc(r.vaccination_status)}</span></td>
                <td style="max-width:220px">${esc(r.diagnosis || '—')}</td>
                <td>${esc(r.next_due_date || '—')}</td>
                <td>${esc(r.recorded_by || '—')}</td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm" onclick="deleteHealthRecord(${r.id})" title="Delete log">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-row">Failed to load records.</td></tr>';
    }
}

async function populateHealthPetFilter() {
    const sel = document.getElementById('healthPetFilter');
    if (!sel) return;
    try {
        const pets = await apiGet('/pets');
        sel.innerHTML = '<option value="">All Pets</option>' + pets.map(p =>
            `<option value="${p.id}">${esc(p.name)} (${esc(p.species)})</option>`
        ).join('');
    } catch {}
}

function openHealthLogModal() {
    apiGet('/pets').then(pets => {
        const petOpts = pets.map(p => `<option value="${p.id}">${esc(p.name)} (${esc(p.species)} - ${esc(p.owner_name || 'Patient')})</option>`).join('');
        const today = new Date().toISOString().split('T')[0];
        openModal('🩺 Record Medical Checkup & Vaccination', `
            <div class="form-group">
                <label>Select Animal Patient *</label>
                <select id="hlPet" class="form-control"><option value="">-- Select Pet --</option>${petOpts}</select>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Checkup Date *</label>
                    <input type="date" id="hlDate" class="form-control" value="${today}">
                </div>
                <div class="form-group">
                    <label>Vaccination Status *</label>
                    <select id="hlVaxStatus" class="form-control">
                        <option value="Up to Date">Up to Date 🟢</option>
                        <option value="Due Soon">Due Soon 🟡</option>
                        <option value="Overdue">Overdue 🔴</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Vaccine Administered</label>
                    <input id="hlVaccine" class="form-control" placeholder="e.g. Rabies Booster #RB-9021">
                </div>
                <div class="form-group">
                    <label>Next Due Date</label>
                    <input type="date" id="hlNextDue" class="form-control">
                </div>
            </div>
            <div class="form-group">
                <label>Clinical Diagnosis / Examination *</label>
                <input id="hlDiag" class="form-control" placeholder="e.g. Healthy physical exam, temp 38.5°C, coat clean" required>
            </div>
            <div class="form-group">
                <label>Treatment Notes & Prescriptions</label>
                <textarea id="hlNotes" class="form-control" rows="3" placeholder="Describe clinical treatment, medications administered…"></textarea>
            </div>
        `, `
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="submitHealthLog()">💾 Save Health Record</button>
        `);
    });
}

async function submitHealthLog() {
    const pet_id = parseInt(document.getElementById('hlPet').value);
    const checkup_date = document.getElementById('hlDate').value;
    const diagnosis = document.getElementById('hlDiag').value.trim();
    if (!pet_id) { showToast('Please select a pet.', 'warning'); return; }
    if (!diagnosis) { showToast('Diagnosis is required.', 'warning'); return; }

    const payload = {
        pet_id,
        checkup_date,
        vaccine_name: document.getElementById('hlVaccine').value.trim(),
        vaccination_status: document.getElementById('hlVaxStatus').value,
        diagnosis,
        treatment_notes: document.getElementById('hlNotes').value.trim(),
        next_due_date: document.getElementById('hlNextDue').value,
        recorded_by: currentUser?.name || 'Veterinary Staff'
    };

    try {
        await apiPost('/health-logs', payload);
        closeModal();
        showToast('💉 Health & vaccination log saved!', 'success');
        loadHealthRecords();
    } catch (err) {
        showToast(err.message || 'Failed to save health record.', 'error');
    }
}

async function deleteHealthRecord(recordId) {
    if (!confirm('Delete this health log entry?')) return;
    try {
        await apiDel(`/health-logs/${recordId}`);
        showToast('Health log deleted.', 'info');
        loadHealthRecords();
    } catch (err) {
        showToast(err.message || 'Failed to delete record.', 'error');
    }
}

// ════════════════════════════════════════════════════════════
//   FR-04: BILLING & INVOICES
// ════════════════════════════════════════════════════════════
function recalcFees() {
    const c = parseFloat(document.getElementById('calcConsult')?.value) || 0;
    const t = parseFloat(document.getElementById('calcTreatment')?.value) || 0;
    const m = parseFloat(document.getElementById('calcMedication')?.value) || 0;
    const total = c + t + m;
    const el = document.getElementById('calcTotal');
    if (el) el.textContent = '$' + total.toFixed(2);
}

async function loadInvoices() {
    const query = document.getElementById('invoiceSearch')?.value.trim() || '';
    const status = document.getElementById('invoiceStatusFilter')?.value || 'all';
    const tbody = document.getElementById('invoiceTableBody');
    tbody.innerHTML = '<tr><td colspan="8" class="empty-row">Loading…</td></tr>';

    try {
        const params = new URLSearchParams();
        if (query) params.set('query', query);
        if (status !== 'all') params.set('status', status);
        if (currentPortalMode === 'user' && currentUser && currentUser.role === 'owner') {
            params.set('owner_id', currentUser.id);
        }
        const invoices = await apiGet(`/invoices?${params}`);

        if (!invoices.length) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-row">No invoice records found.</td></tr>';
            return;
        }
        tbody.innerHTML = invoices.map(inv => {
            const paidBadge = inv.payment_status === 'Paid'
                ? '<span class="status-badge status-paid">✅ Paid</span>'
                : inv.payment_status === 'Cancelled'
                    ? '<span class="status-badge status-cancelled">Cancelled</span>'
                    : '<span class="status-badge status-pending">⏳ Pending</span>';
            return `<tr>
                <td><strong>${esc(inv.invoice_code)}</strong></td>
                <td>${esc(inv.owner_name || 'Patient')}<br><small style="color:var(--text-muted)">${esc(inv.pet_name || '—')} (${esc(inv.pet_species || '')})</small></td>
                <td>$${inv.consultation_fee?.toFixed(2) || '0.00'}</td>
                <td>$${inv.treatment_fee?.toFixed(2) || '0.00'}</td>
                <td>$${inv.medication_fee?.toFixed(2) || '0.00'}</td>
                <td><strong>$${inv.total_amount?.toFixed(2) || '0.00'}</strong></td>
                <td>${paidBadge}</td>
                <td>
                    ${inv.payment_status === 'Pending'
                        ? `<button type="button" class="btn btn-accent btn-sm" onclick="markInvoicePaid(${inv.id})">✅ Mark Paid</button>`
                        : ''}
                    <button type="button" class="btn btn-secondary btn-sm" onclick="openPrintInvoiceModal(${inv.id})">🖨️ Receipt</button>
                </td>
            </tr>`;
        }).join('');
    } catch {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-row">Failed to load invoices.</td></tr>';
    }
}

async function markInvoicePaid(invId) {
    try {
        await apiPut(`/invoices/${invId}/status`, { payment_status: 'Paid' });
        showToast('✅ Invoice marked as Paid!', 'success');
        loadInvoices();
    } catch (err) {
        showToast(err.message || 'Failed to update invoice.', 'error');
    }
}

function openCreateInvoiceModal() {
    apiGet('/pets').then(pets => {
        const petOpts = pets.map(p => `<option value="${p.id}">${esc(p.name)} (${esc(p.species)} - ${esc(p.owner_name || '')})</option>`).join('');
        openModal('💳 Generate New Invoice', `
            <div class="form-group">
                <label>Animal Patient</label>
                <select id="invPetId" class="form-control"><option value="">-- Select Pet (Optional) --</option>${petOpts}</select>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Consultation Fee ($)</label>
                    <input type="number" id="invConsult" class="form-control" value="${document.getElementById('calcConsult')?.value || 50}" min="0">
                </div>
                <div class="form-group">
                    <label>Treatment Fee ($)</label>
                    <input type="number" id="invTreatment" class="form-control" value="${document.getElementById('calcTreatment')?.value || 20}" min="0">
                </div>
                <div class="form-group">
                    <label>Medication Fee ($)</label>
                    <input type="number" id="invMedFee" class="form-control" value="${document.getElementById('calcMedication')?.value || 25}" min="0">
                </div>
                <div class="form-group">
                    <label>Payment Status</label>
                    <select id="invStatus" class="form-control">
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <select id="invMethod" class="form-control">
                    <option>Cash at Clinic</option>
                    <option>Card at Desk</option>
                    <option>Online Transfer</option>
                </select>
            </div>
        `, `
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="submitCreateInvoice()">💳 Generate Invoice</button>
        `);
    });
}

async function submitCreateInvoice() {
    const pet_id = parseInt(document.getElementById('invPetId').value) || null;
    const consultation_fee = parseFloat(document.getElementById('invConsult').value) || 0;
    const treatment_fee = parseFloat(document.getElementById('invTreatment').value) || 0;
    const medication_fee = parseFloat(document.getElementById('invMedFee').value) || 0;
    const payment_status = document.getElementById('invStatus').value;
    const payment_method = document.getElementById('invMethod').value;

    try {
        await apiPost('/invoices', {
            owner_id: currentUser?.id || null,
            pet_id,
            consultation_fee, treatment_fee, medication_fee,
            payment_status, payment_method
        });
        closeModal();
        showToast('💳 Invoice generated successfully!', 'success');
        loadInvoices();
    } catch (err) {
        showToast(err.message || 'Failed to generate invoice.', 'error');
    }
}

async function openPrintInvoiceModal(invId) {
    try {
        const inv = await apiGet(`/invoices/${invId}`);
        openModal(`🖨️ Invoice Receipt — ${inv.invoice_code}`, `
            <div class="printable-invoice" id="printableReceipt">
                <div class="printable-invoice-header">
                    <div>
                        <h2 style="font-size:1.4rem;color:#4f46e5;">🐾 VetCare Animal Clinic</h2>
                        <p style="font-size:0.8rem;color:#64748b;">Central Veterinary Hospital & Surgery Center</p>
                        <p style="font-size:0.75rem;color:#64748b;">Phone: +1 (555) 234-5678 · contact@vetcare.com</p>
                    </div>
                    <div style="text-align:right;">
                        <h3 style="font-size:1.15rem;font-weight:800;">INVOICE</h3>
                        <p style="font-size:0.85rem;font-weight:700;">${esc(inv.invoice_code)}</p>
                        <p style="font-size:0.75rem;color:#64748b;">Date: ${fmtDate(inv.created_at)}</p>
                        <span class="status-badge ${inv.payment_status === 'Paid' ? 'status-paid' : 'status-pending'}" style="margin-top:4px;">${esc(inv.payment_status)}</span>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:0.85rem;margin-bottom:16px;">
                    <div>
                        <strong>Billed To:</strong><br>
                        ${esc(inv.owner_name || 'Valued Client')}<br>
                        ${inv.owner_phone ? `Phone: ${esc(inv.owner_phone)}<br>` : ''}
                        ${inv.owner_address ? `Address: ${esc(inv.owner_address)}` : ''}
                    </div>
                    <div>
                        <strong>Patient Record:</strong><br>
                        Pet Name: <strong>${esc(inv.pet_name || 'N/A')}</strong><br>
                        Species / Breed: ${esc(inv.pet_species || '—')} (${esc(inv.pet_breed || 'Mix')})<br>
                        ${inv.apt_code ? `Consultation: ${esc(inv.apt_code)}` : ''}
                    </div>
                </div>

                <table class="printable-invoice-table">
                    <thead>
                        <tr>
                            <th>Item Description</th>
                            <th style="text-align:right;">Amount ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Veterinary Doctor Consultation Fee</td>
                            <td style="text-align:right;">$${inv.consultation_fee?.toFixed(2) || '0.00'}</td>
                        </tr>
                        <tr>
                            <td>Clinical Treatment & Procedures</td>
                            <td style="text-align:right;">$${inv.treatment_fee?.toFixed(2) || '0.00'}</td>
                        </tr>
                        <tr>
                            <td>Prescribed Medications & Pharmacy</td>
                            <td style="text-align:right;">$${inv.medication_fee?.toFixed(2) || '0.00'}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="printable-invoice-total">
                    Total Settled Amount: <span style="color:#4f46e5;">$${inv.total_amount?.toFixed(2) || '0.00'}</span>
                </div>

                <div style="margin-top:24px;border-top:1px dashed #cbd5e1;padding-top:12px;font-size:0.75rem;color:#64748b;text-align:center;">
                    Thank you for trusting VetCare with your animal's health! All consultations adhere to SRS medical standards.
                </div>
            </div>
        `, `
            <button type="button" class="btn btn-secondary" onclick="window.print()">🖨️ Print Receipt</button>
            <button type="button" class="btn btn-primary" onclick="closeModal()">Close</button>
        `);
    } catch {
        showToast('Failed to load invoice receipt.', 'error');
    }
}

// ════════════════════════════════════════════════════════════
//   REPORTS & ANALYTICS
// ════════════════════════════════════════════════════════════
async function loadReports() {
    try {
        const data = await apiGet('/reports/summary');

        document.getElementById('repTotalRev').textContent = '$' + data.total_revenue.toFixed(2);
        document.getElementById('repPendingRev').textContent = '$' + data.pending_revenue.toFixed(2);
        document.getElementById('repTotalAppts').textContent = data.total_appointments;
        document.getElementById('repTotalPets').textContent = data.total_pets;

        // Fee Breakdown
        const fb = data.fee_breakdown || { consultation: 0, treatment: 0, medication: 0 };
        const feeTotal = (fb.consultation + fb.treatment + fb.medication) || 1;
        const cPct = Math.round((fb.consultation / feeTotal) * 100);
        const tPct = Math.round((fb.treatment / feeTotal) * 100);
        const mPct = Math.round((fb.medication / feeTotal) * 100);

        document.getElementById('repFeeBars').innerHTML = `
            <div class="report-bar-item">
                <div class="report-bar-label"><span>Consultations ($${fb.consultation.toFixed(2)})</span><span>${cPct}%</span></div>
                <div class="report-bar-track"><div class="report-bar-fill" style="width:${cPct}%;background:var(--brand-primary)"></div></div>
            </div>
            <div class="report-bar-item">
                <div class="report-bar-label"><span>Treatments ($${fb.treatment.toFixed(2)})</span><span>${tPct}%</span></div>
                <div class="report-bar-track"><div class="report-bar-fill" style="width:${tPct}%;background:var(--brand-accent)"></div></div>
            </div>
            <div class="report-bar-item">
                <div class="report-bar-label"><span>Pharmacy / Meds ($${fb.medication.toFixed(2)})</span><span>${mPct}%</span></div>
                <div class="report-bar-track"><div class="report-bar-fill" style="width:${mPct}%;background:var(--brand-secondary)"></div></div>
            </div>
        `;

        // Vaccine Compliance
        const vc = data.vaccine_compliance || {};
        const vaxTotal = Object.values(vc).reduce((a, b) => a + b, 0) || 1;
        const upToDate = vc['Up to Date'] || 0;
        const dueSoon = vc['Due Soon'] || 0;
        const overdue = vc['Overdue'] || 0;

        document.getElementById('repVaxBars').innerHTML = `
            <div class="report-bar-item">
                <div class="report-bar-label"><span>Up to Date (${upToDate})</span><span>${Math.round((upToDate/vaxTotal)*100)}%</span></div>
                <div class="report-bar-track"><div class="report-bar-fill" style="width:${Math.round((upToDate/vaxTotal)*100)}%;background:var(--brand-accent)"></div></div>
            </div>
            <div class="report-bar-item">
                <div class="report-bar-label"><span>Due Soon (${dueSoon})</span><span>${Math.round((dueSoon/vaxTotal)*100)}%</span></div>
                <div class="report-bar-track"><div class="report-bar-fill" style="width:${Math.round((dueSoon/vaxTotal)*100)}%;background:var(--brand-warn)"></div></div>
            </div>
            <div class="report-bar-item">
                <div class="report-bar-label"><span>Overdue (${overdue})</span><span>${Math.round((overdue/vaxTotal)*100)}%</span></div>
                <div class="report-bar-track"><div class="report-bar-fill" style="width:${Math.round((overdue/vaxTotal)*100)}%;background:var(--brand-danger)"></div></div>
            </div>
        `;

        // Species Distribution
        const spec = data.species_distribution || [];
        const maxSpec = Math.max(...spec.map(s => s.count), 1);
        document.getElementById('repSpeciesBars').innerHTML = spec.map(s => `
            <div class="report-bar-item">
                <div class="report-bar-label"><span>${speciesEmoji(s.species)} ${esc(s.species)} (${s.count})</span><span>${s.count} registered</span></div>
                <div class="report-bar-track"><div class="report-bar-fill" style="width:${Math.round((s.count/maxSpec)*100)}%;background:var(--brand-primary)"></div></div>
            </div>
        `).join('') || '<div class="loading-placeholder">No species data recorded.</div>';

    } catch {
        // ignore
    }
}

function printClinicReport() {
    window.print();
}

// ════════════════════════════════════════════════════════════
//   FR-06: WELLNESS EVENTS & CAMPS
// ════════════════════════════════════════════════════════════
async function loadEvents() {
    const grid = document.getElementById('eventsGrid');
    grid.innerHTML = '<div class="loading-placeholder">Loading events…</div>';

    try {
        const events = await apiGet('/events');
        if (!events.length) {
            grid.innerHTML = '<div class="loading-placeholder">No upcoming wellness events found.</div>';
            return;
        }
        const bannerGradients = [
            'linear-gradient(135deg, #4f46e5, #0ea5e9)',
            'linear-gradient(135deg, #10b981, #06b6d4)',
            'linear-gradient(135deg, #f59e0b, #ef4444)'
        ];
        grid.innerHTML = events.map((ev, i) => {
            const fill = Math.min(100, Math.round((ev.registered_count / ev.capacity) * 100));
            return `
            <div class="event-card">
                <div class="event-card-banner" style="background:${bannerGradients[i % bannerGradients.length]}"></div>
                <div class="event-card-body">
                    <div class="event-card-type">${esc(ev.event_type)}</div>
                    <div class="event-card-title">${esc(ev.title)}</div>
                    <div class="event-card-meta">
                        <span>📅 <strong>Date:</strong> ${esc(ev.event_date)}</span>
                        <span>🕐 <strong>Time:</strong> ${esc(ev.time_range)}</span>
                        <span>📍 <strong>Location:</strong> ${esc(ev.location)}</span>
                    </div>
                    <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:14px">${esc(ev.description || '')}</p>
                    <div class="event-progress-bar">
                        <div class="event-progress-fill" style="width:${fill}%"></div>
                    </div>
                    <div class="event-capacity-text">${ev.registered_count} / ${ev.capacity} spots filled (${fill}% capacity)</div>
                    <button type="button" class="btn btn-primary" style="width:100%" onclick="openEventRegistrationModal(${ev.id}, '${esc(ev.title)}')">
                        🎪 Register for Camp
                    </button>
                </div>
            </div>`;
        }).join('');
    } catch {
        grid.innerHTML = '<div class="loading-placeholder">Failed to load wellness events.</div>';
    }
}

function openEventRegistrationModal(eventId, eventTitle) {
    openModal(`🎪 Register for: ${eventTitle}`, `
        <div class="form-group">
            <label>Pet Owner Full Name *</label>
            <input id="evtOwner" class="form-control" placeholder="e.g. Alice Johnson" value="${currentUser?.name || ''}" required>
        </div>
        <div class="form-group">
            <label>Pet Name *</label>
            <input id="evtPet" class="form-control" placeholder="e.g. Buddy" required>
        </div>
        <div class="form-group">
            <label>Contact Phone Number *</label>
            <input type="tel" id="evtPhone" class="form-control" placeholder="+1 (555) 000-0000" value="${currentUser?.phone || ''}" required>
        </div>
        <div style="background:var(--bg-hover);padding:12px;border-radius:var(--radius-sm);font-size:0.83rem;color:var(--text-muted)">
            ✅ Registration for wellness camps & health drives is complimentary. Please present this confirmation at the venue.
        </div>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="submitEventRegistration(${eventId})">🎪 Confirm Registration</button>
    `);
}

async function submitEventRegistration(eventId) {
    const owner_name = document.getElementById('evtOwner').value.trim();
    const pet_name = document.getElementById('evtPet').value.trim();
    const phone = document.getElementById('evtPhone').value.trim();

    if (!owner_name || !pet_name || !phone) {
        showToast('Please fill all required fields.', 'warning');
        return;
    }

    try {
        await apiPost('/events/register', { event_id: eventId, owner_name, pet_name, phone, owner_id: currentUser?.id });
        closeModal();
        showToast(`🎉 ${pet_name} successfully registered for the wellness event!`, 'success');
        loadEvents();
    } catch (err) {
        showToast(err.message || 'Registration failed.', 'error');
    }
}

// ════════════════════════════════════════════════════════════
//   PROFILE & ACCOUNT MANAGEMENT
// ════════════════════════════════════════════════════════════
async function loadProfilePage() {
    if (!currentUser) return;
    const u = currentUser;
    document.getElementById('profileName').textContent = u.name;
    document.getElementById('profileEmail').textContent = u.email;
    document.getElementById('profilePhone').textContent = u.phone || 'Not provided';
    document.getElementById('profileAddress').textContent = u.address || 'Not provided';
    document.getElementById('profileAvatarLetter').textContent = u.name.charAt(0).toUpperCase();
    document.getElementById('profileRoleBadge').textContent = u.role === 'doctor' ? '🩺 Veterinary Doctor' : (u.role === 'staff' ? 'Clinic Staff' : '🐾 Pet Owner');
    document.getElementById('profileRoleBadge').className = `status-badge ${u.role === 'doctor' ? 'status-pending' : 'status-confirmed'}`;

    // Load summary stats
    const params = u.role === 'owner' ? `?owner_id=${u.id}` : '';
    const [pets, appts, invoices] = await Promise.all([
        apiGet(`/pets${params}`).catch(() => []),
        apiGet(`/appointments${params}`).catch(() => []),
        apiGet(`/invoices${params}`).catch(() => [])
    ]);
    document.getElementById('sumPets').textContent = pets.length;
    document.getElementById('sumAppts').textContent = appts.length;
    document.getElementById('sumPaid').textContent = invoices.filter(i => i.payment_status === 'Paid').length;
}

function openEditProfileModal() {
    if (!currentUser) return;
    openModal('✏️ Edit Profile Information', `
        <div class="form-group">
            <label>Full Name *</label>
            <input id="editProfileName" class="form-control" value="${esc(currentUser.name)}" required>
        </div>
        <div class="form-group">
            <label>Phone Number</label>
            <input id="editProfilePhone" class="form-control" value="${esc(currentUser.phone || '')}">
        </div>
        <div class="form-group">
            <label>Residence Address</label>
            <textarea id="editProfileAddress" class="form-control" rows="2">${esc(currentUser.address || '')}</textarea>
        </div>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="submitEditProfile()">💾 Save Profile</button>
    `);
}

async function submitEditProfile() {
    const name = document.getElementById('editProfileName').value.trim();
    const phone = document.getElementById('editProfilePhone').value.trim();
    const address = document.getElementById('editProfileAddress').value.trim();

    if (!name) {
        showToast('Name is required.', 'warning');
        return;
    }

    try {
        const updated = await apiPut(`/auth/profile/${currentUser.id}`, { name, phone, address });
        currentUser = { ...currentUser, ...updated };
        localStorage.setItem('vetcare_user', JSON.stringify(currentUser));
        updateSidebarUser(currentUser);
        closeModal();
        showToast('✅ Profile updated successfully!', 'success');
        loadProfilePage();
    } catch (err) {
        showToast(err.message || 'Failed to update profile.', 'error');
    }
}

function openChangePasswordModal() {
    openModal('🔑 Change Password', `
        <div class="form-group">
            <label>Current Password *</label>
            <input type="password" id="curPassword" class="form-control" placeholder="Current password" required>
        </div>
        <div class="form-group">
            <label>New Password * (min 4 characters)</label>
            <input type="password" id="newPassword" class="form-control" placeholder="New password" required minlength="4">
        </div>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="submitChangePassword()">🔑 Update Password</button>
    `);
}

async function submitChangePassword() {
    const current_password = document.getElementById('curPassword').value;
    const new_password = document.getElementById('newPassword').value;

    if (!current_password || !new_password) {
        showToast('Both fields are required.', 'warning');
        return;
    }

    try {
        await apiPost(`/auth/change-password/${currentUser.id}`, { current_password, new_password });
        closeModal();
        showToast('✅ Password changed successfully!', 'success');
    } catch (err) {
        showToast(err.message || 'Failed to change password.', 'error');
    }
}

// ════════════════════════════════════════════════════════════
//   HELPERS — MODALS, TOASTS, BADGES, API
// ════════════════════════════════════════════════════════════
function openModal(title, bodyHtml, footerHtml) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml || '<button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>';
    document.getElementById('appModalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('appModalOverlay').classList.remove('active');
}

function handleOverlayClick(e) {
    if (e.target === document.getElementById('appModalOverlay')) closeModal();
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const icon = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }[type] || 'ℹ️';
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

function speciesEmoji(species) {
    const map = {
        Dog: '🐶', Cat: '🐱', Rabbit: '🐰', Bird: '🦜',
        Cow: '🐄', Goat: '🐐', Horse: '🐎', Exotic: '🦎', Sheep: '🐑'
    };
    return map[species] || '🐾';
}

function getStatusBadge(status) {
    const map = {
        'Confirmed': 'status-confirmed',
        'Pending Review': 'status-pending',
        'Completed': 'status-completed',
        'Cancelled': 'status-cancelled'
    };
    const taMap = {
        'Confirmed': 'உறுதிசெய்யப்பட்டது',
        'Pending Review': 'ஒப்புதல் நிலுவையில்',
        'Completed': 'நிறைவடைந்தது',
        'Cancelled': 'ரத்து செய்யப்பட்டது'
    };
    const text = currentLang === 'ta' ? (taMap[status] || status) : status;
    return `<span class="status-badge ${map[status] || 'status-pending'}">${esc(text)}</span>`;
}

function getPetStatusBadge(status) {
    let cls = 'status-up-to-date';
    if (status?.includes('Due') || status?.includes('🟡')) cls = 'status-due-soon';
    if (status?.includes('Overdue') || status?.includes('🔴')) cls = 'status-overdue';
    let text = status || 'Healthy 🟢';
    if (currentLang === 'ta') {
        if (text.includes('Healthy')) text = 'ஆரோக்கியமானது 🟢';
        else if (text.includes('Booster Due')) text = 'தடுப்பூசி செலுத்த வேண்டும் 🟡';
        else if (text.includes('Overdue')) text = 'தடுப்பூசி காலம் கடந்தது 🔴';
    }
    return `<span class="status-badge ${cls}">${esc(text)}</span>`;
}

function getVaxBadgeClass(status) {
    if (status === 'Up to Date') return 'status-up-to-date';
    if (status === 'Due Soon') return 'status-due-soon';
    return 'status-overdue';
}

function selectSpecies(el, val) {
    document.querySelectorAll('.species-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('newPetSpecies').value = val;
}

function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function fmtDate(dateStr) {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return dateStr; }
}

function extractErrorMessage(data) {
    if (!data) return 'Request failed.';
    if (typeof data === 'string') return data;
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
        return data.detail.map(d => d.msg || (typeof d === 'string' ? d : JSON.stringify(d))).join(', ');
    }
    if (data.message) return data.message;
    return 'Request failed.';
}

// ════════════════════════════════════════════════════════════
//   SERVER CONNECTIVITY & HEALTH PROBE
// ════════════════════════════════════════════════════════════
async function checkServerStatus() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600);
        const res = await fetch(`${API}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
            isServerOnline = true;
            updateServerStatusUI(true);
            return true;
        }
    } catch {
        // server is offline
    }
    isServerOnline = false;
    updateServerStatusUI(false);
    return false;
}

function updateServerStatusUI(online) {
    const statusText = document.getElementById('serverStatusText');
    const statusDot = document.getElementById('serverStatusDot');
    const headerText = document.getElementById('headerServerStatusText');
    const headerDot = document.getElementById('headerServerDot');

    if (online) {
        if (statusText) statusText.textContent = '🟢 Server Online (SQLite Connected)';
        if (statusDot) statusDot.style.background = '#10b981';
        if (headerText) headerText.textContent = 'SQLite Online';
        if (headerDot) headerDot.style.background = '#10b981';
    } else {
        if (statusText) statusText.textContent = '⚡ Standalone Demo Ready (Offline Mode)';
        if (statusDot) statusDot.style.background = '#f59e0b';
        if (headerText) headerText.textContent = 'Demo Mode (Offline)';
        if (headerDot) headerDot.style.background = '#f59e0b';
    }
}

// ════════════════════════════════════════════════════════════
//   OFFLINE / STANDALONE MOCK DATABASE STORE
// ════════════════════════════════════════════════════════════
function initMockDatabase() {
    if (!localStorage.getItem('vetcare_mock_users')) {
        const mockUsers = [
            { id: 1, name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@vetcare.com', password: 'doctor123', role: 'doctor', phone: '+1 (555) 234-5678', address: 'VetCare Central Clinic, Suite 402, Metro Park' },
            { id: 2, name: 'Dr. Alan Grant', email: 'alan.grant@vetcare.com', password: 'doctor123', role: 'doctor', phone: '+1 (555) 876-5432', address: 'VetCare Exotic & Surgery Unit, Building B' },
            { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', password: 'owner123', role: 'owner', phone: '+1 (555) 019-2834', address: '742 Evergreen Terrace, Springfield' },
            { id: 4, name: 'Robert Smith', email: 'robert.smith@example.com', password: 'owner123', role: 'owner', phone: '+1 (555) 432-1098', address: '124 Conch Street, Oakville' }
        ];
        localStorage.setItem('vetcare_mock_users', JSON.stringify(mockUsers));
    }

    if (!localStorage.getItem('vetcare_mock_pets')) {
        const mockPets = [
            { id: 1, owner_id: 3, owner_name: 'Alice Johnson', name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: '3', gender: 'Male', weight: '31 kg', medical_history: 'Rabies booster up to date. Routine checkup clean. Active and healthy.', status: 'Healthy 🟢' },
            { id: 2, owner_id: 3, owner_name: 'Alice Johnson', name: 'Milo', species: 'Cat', breed: 'Tabby Cat', age: '2', gender: 'Male', weight: '4.5 kg', medical_history: 'Requires FVRCP vaccine booster & dental scaling check. Mild ear wax.', status: 'Booster Due 🟡' },
            { id: 3, owner_id: 3, owner_name: 'Alice Johnson', name: 'Luna', species: 'Rabbit', breed: 'Angora Rabbit', age: '1', gender: 'Female', weight: '2.1 kg', medical_history: 'Routine digestive monitoring. Annual checkup scheduled.', status: 'Healthy 🟢' },
            { id: 4, owner_id: 4, owner_name: 'Robert Smith', name: 'Charlie', species: 'Dog', breed: 'Beagle', age: '4', gender: 'Male', weight: '14 kg', medical_history: 'Seasonal skin allergies in summer. Prescribed hypoallergenic shampoo.', status: 'Healthy 🟢' },
            { id: 5, owner_id: 4, owner_name: 'Robert Smith', name: 'Bella', species: 'Cow', breed: 'Jersey Dairy', age: '5', gender: 'Female', weight: '420 kg', medical_history: 'Routine lactation and hoof health checkup. Deworming completed.', status: 'Healthy 🟢' }
        ];
        localStorage.setItem('vetcare_mock_pets', JSON.stringify(mockPets));
    }

    if (!localStorage.getItem('vetcare_mock_doctors')) {
        const mockDoctors = [
            { id: 1, user_id: 1, name: 'Dr. Sarah Jenkins', specialty: 'Canine & Feline Medicine', experience: '12+ Years Experience', consultation_fee: 50.0, rating: 4.95, avatar: 'assets/dr_sarah.jpg', available_days: 'Mon - Sat', time_slots: '09:00 AM - 10:00 AM, 10:00 AM - 11:00 AM, 11:30 AM - 12:30 PM, 02:00 PM - 03:00 PM, 03:30 PM - 04:30 PM, 04:30 PM - 05:30 PM' },
            { id: 2, user_id: 2, name: 'Dr. Alan Grant', specialty: 'Avian, Reptile & Exotic Surgery', experience: '15+ Years Experience', consultation_fee: 75.0, rating: 4.88, avatar: 'assets/dr_alan.jpg', available_days: 'Mon - Fri', time_slots: '10:00 AM - 11:00 AM, 11:30 AM - 12:30 PM, 01:30 PM - 02:30 PM, 03:00 PM - 04:00 PM, 04:30 PM - 05:30 PM' }
        ];
        localStorage.setItem('vetcare_mock_doctors', JSON.stringify(mockDoctors));
    } else {
        try {
            const existingDocs = JSON.parse(localStorage.getItem('vetcare_mock_doctors') || '[]');
            if (existingDocs.some(d => d.time_slots && !d.time_slots.includes('-'))) {
                existingDocs.forEach(d => {
                    if (d.time_slots) {
                        d.time_slots = d.time_slots.split(',').map(s => formatSlotRange(s.trim())).join(', ');
                    }
                });
            }
            const harihara = existingDocs.find(d => d.name === 'Dr. L. Harihara Sudhan');
            const hariharaProfile = {
                id: 3,
                user_id: 6,
                name: 'Dr. L. Harihara Sudhan',
                specialty: 'Pachyderm Veterinarian',
                experience: '10+ Years Experience',
                consultation_fee: 60.0,
                rating: 4.90,
                avatar: 'assets/dr_alan.jpg',
                available_days: 'Mon - Sat',
                time_slots: '09:00 AM - 10:00 AM, 11:30 AM - 12:30 PM, 02:00 PM - 03:00 PM, 04:00 PM - 05:00 PM'
            };
            if (harihara) {
                Object.assign(harihara, hariharaProfile);
            } else {
                existingDocs.push(hariharaProfile);
            }
            localStorage.setItem('vetcare_mock_doctors', JSON.stringify(existingDocs));
        } catch (_) {}
    }

    if (!localStorage.getItem('vetcare_mock_appointments')) {
        const mockAppts = [
            { id: 1, apt_code: '#APT-101', pet_id: 1, pet_name: 'Buddy', pet_species: 'Dog', owner_id: 3, owner_name: 'Alice Johnson', doctor_id: 1, doctor_name: 'Dr. Sarah Jenkins', consultation_type: 'Routine Health Checkup', appointment_date: '2026-09-15', time_slot: '10:00 AM - 11:00 AM', reason: 'Annual core vaccination & dental check', status: 'Confirmed', doctor_notes: 'Patient is active, clean coat, no signs of distress.' },
            { id: 2, apt_code: '#APT-102', pet_id: 2, pet_name: 'Milo', pet_species: 'Cat', owner_id: 3, owner_name: 'Alice Johnson', doctor_id: 2, doctor_name: 'Dr. Alan Grant', consultation_type: 'Booster Immunization', appointment_date: '2026-09-16', time_slot: '11:30 AM - 12:30 PM', reason: 'FVRCP Booster due & mild ear scratching', status: 'Pending Review', doctor_notes: 'Awaiting doctor review of feline history.' },
            { id: 3, apt_code: '#APT-103', pet_id: 3, pet_name: 'Luna', pet_species: 'Rabbit', owner_id: 3, owner_name: 'Alice Johnson', doctor_id: 1, doctor_name: 'Dr. Sarah Jenkins', consultation_type: 'Dental Scaling Review', appointment_date: '2026-09-17', time_slot: '02:00 PM - 03:00 PM', reason: 'Checkup for Angora rabbit diet & teeth', status: 'Confirmed', doctor_notes: 'Scheduled with Dr. Sarah Jenkins.' },
            { id: 4, apt_code: '#APT-104', pet_id: 4, pet_name: 'Charlie', pet_species: 'Dog', owner_id: 4, owner_name: 'Robert Smith', doctor_id: 1, doctor_name: 'Dr. Sarah Jenkins', consultation_type: 'Allergy Consultation', appointment_date: '2026-09-18', time_slot: '03:30 PM - 04:30 PM', reason: 'Skin allergy inspection and booster evaluation', status: 'Pending Review', doctor_notes: 'Pending confirmation.' }
        ];
        localStorage.setItem('vetcare_mock_appointments', JSON.stringify(mockAppts));
    }

    if (!localStorage.getItem('vetcare_mock_health_records')) {
        const mockHealth = [
            { id: 1, pet_id: 1, pet_name: 'Buddy', pet_species: 'Dog', owner_name: 'Alice Johnson', checkup_date: '2026-08-15', vaccine_name: 'Rabies Core Vaccine', vaccination_status: 'Up to Date', diagnosis: 'Healthy physical exam, normal temperature (38.5°C)', treatment_notes: 'Administered Rabies Batch #RB-9021. No adverse reactions observed.', next_due_date: '2027-08-15', recorded_by: 'Dr. Sarah Jenkins' },
            { id: 2, pet_id: 2, pet_name: 'Milo', pet_species: 'Cat', owner_name: 'Alice Johnson', checkup_date: '2026-05-10', vaccine_name: 'FVRCP Combination', vaccination_status: 'Due Soon', diagnosis: 'Mild gingivitis stage 1, clean ears', treatment_notes: 'Recommended dental gel and booster shot in Sept 2026.', next_due_date: '2026-09-15', recorded_by: 'Dr. Alan Grant' },
            { id: 3, pet_id: 3, pet_name: 'Luna', pet_species: 'Rabbit', owner_name: 'Alice Johnson', checkup_date: '2026-07-20', vaccine_name: 'Rabbit Hemorrhagic (RHDV2)', vaccination_status: 'Up to Date', diagnosis: 'Excellent weight and coat condition', treatment_notes: 'Routine vaccine administered smoothly.', next_due_date: '2027-07-20', recorded_by: 'Dr. Sarah Jenkins' },
            { id: 4, pet_id: 4, pet_name: 'Charlie', pet_species: 'Dog', owner_name: 'Robert Smith', checkup_date: '2026-06-12', vaccine_name: 'Canine Distemper / Parvo (DHPP)', vaccination_status: 'Up to Date', diagnosis: 'Clear lungs and heart rhythm, weight optimal', treatment_notes: 'Administered 5-in-1 combo vaccine. Next booster due next year.', next_due_date: '2027-06-12', recorded_by: 'Dr. Sarah Jenkins' }
        ];
        localStorage.setItem('vetcare_mock_health_records', JSON.stringify(mockHealth));
    }

    if (!localStorage.getItem('vetcare_mock_invoices')) {
        const mockInvoices = [
            { id: 1, invoice_code: '#INV-1001', appointment_id: 1, owner_id: 3, owner_name: 'Alice Johnson', pet_id: 1, pet_name: 'Buddy', pet_species: 'Dog', consultation_fee: 50.0, treatment_fee: 20.0, medication_fee: 25.0, total_amount: 95.0, payment_status: 'Paid', payment_method: 'Card at Desk', created_at: '2026-09-10' },
            { id: 2, invoice_code: '#INV-1002', appointment_id: 2, owner_id: 3, owner_name: 'Alice Johnson', pet_id: 2, pet_name: 'Milo', pet_species: 'Cat', consultation_fee: 50.0, treatment_fee: 15.0, medication_fee: 0.0, total_amount: 65.0, payment_status: 'Pending', payment_method: 'Cash at Clinic', created_at: '2026-09-11' },
            { id: 3, invoice_code: '#INV-1003', appointment_id: 3, owner_id: 3, owner_name: 'Alice Johnson', pet_id: 3, pet_name: 'Luna', pet_species: 'Rabbit', consultation_fee: 75.0, treatment_fee: 30.0, medication_fee: 40.0, total_amount: 145.0, payment_status: 'Paid', payment_method: 'Online Transfer', created_at: '2026-09-11' },
            { id: 4, invoice_code: '#INV-1004', appointment_id: 4, owner_id: 4, owner_name: 'Robert Smith', pet_id: 4, pet_name: 'Charlie', pet_species: 'Dog', consultation_fee: 50.0, treatment_fee: 25.0, medication_fee: 15.0, total_amount: 90.0, payment_status: 'Pending', payment_method: 'Cash at Clinic', created_at: '2026-09-11' }
        ];
        localStorage.setItem('vetcare_mock_invoices', JSON.stringify(mockInvoices));
    }

    if (!localStorage.getItem('vetcare_mock_announcements')) {
        const mockAnn = [
            { id: 1, title: 'Clinic Operating Theater Laser Upgrade', author: 'Clinic Admin', category: 'Facility', content: 'Our clinic is now equipped with state-of-the-art cold laser therapy for rapid post-operative recovery and pain relief.', created_at: '2026-09-08' },
            { id: 2, title: 'Free Anti-Rabies Vaccination Drive (Sept 28)', author: 'Dr. Sarah Jenkins', category: 'Vaccination', content: 'Join our community health initiative on Sunday, September 28. Free rabies shots & wellness checkups for all rescue and community pets.', created_at: '2026-09-09' },
            { id: 3, title: 'Seasonal Tick & Flea Warning for Dogs', author: 'Dr. Alan Grant', category: 'General', content: 'With warm weather approaching, tick infestations are on the rise. Apply topical antiparasitics and inspect fur after outdoor walks.', created_at: '2026-09-10' }
        ];
        localStorage.setItem('vetcare_mock_announcements', JSON.stringify(mockAnn));
    }

    if (!localStorage.getItem('vetcare_mock_events')) {
        const mockEvents = [
            { id: 1, title: 'Mega Pet Vaccination & Microchipping Camp', event_type: 'Vaccination Camp', event_date: '2026-09-28', time_range: '09:00 AM - 04:00 PM', location: 'VetCare Central Lawn & Clinic Pavilion', description: 'Annual comprehensive pet immunization drive. Free physical checks, Rabies & DHPP boosters, and discounted microchip implantation.', capacity: 100, registered_count: 38, status: 'Upcoming' },
            { id: 2, title: 'Canine Nutrition & Weight Management Workshop', event_type: 'Health Seminar', event_date: '2026-10-05', time_range: '10:30 AM - 01:00 PM', location: 'Seminar Hall A, 2nd Floor', description: 'Expert talk by Dr. Sarah Jenkins on breed-specific balanced diets, raw feeding safety, and obesity prevention.', capacity: 40, registered_count: 22, status: 'Upcoming' },
            { id: 3, title: 'Feline Senior Care & Kidney Health Awareness', event_type: 'Wellness Workshop', event_date: '2026-10-12', time_range: '02:00 PM - 05:00 PM', location: 'VetCare Exotic & Feline Wing', description: 'Comprehensive guide to caring for cats aged 7+. Early signs of chronic kidney disease, dental management, and home comfort modifications.', capacity: 35, registered_count: 14, status: 'Upcoming' }
        ];
        localStorage.setItem('vetcare_mock_events', JSON.stringify(mockEvents));
    }
}

// ─── Mock CRUD Handlers ────────────────────────────────────
function apiGetMock(path) {
    const [rawPath, rawQuery] = path.split('?');
    const params = new URLSearchParams(rawQuery || '');

    if (rawPath === '/health') {
        return { status: 'ok', service: 'vetcare', database: 'local_mock' };
    }
    if (rawPath === '/doctors') {
        return JSON.parse(localStorage.getItem('vetcare_mock_doctors') || '[]');
    }
    if (rawPath.startsWith('/doctors/')) {
        const id = parseInt(rawPath.split('/')[2], 10);
        const docs = JSON.parse(localStorage.getItem('vetcare_mock_doctors') || '[]');
        return docs.find(d => d.id === id) || null;
    }
    if (rawPath === '/pets') {
        let pets = JSON.parse(localStorage.getItem('vetcare_mock_pets') || '[]');
        const q = (params.get('query') || '').toLowerCase().trim();
        const species = (params.get('species') || '').toLowerCase().trim();
        const ownerId = params.get('owner_id');

        if (ownerId) pets = pets.filter(p => String(p.owner_id) === String(ownerId));
        if (species && species !== 'all') pets = pets.filter(p => p.species.toLowerCase() === species);
        if (q) {
            pets = pets.filter(p => 
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.breed && p.breed.toLowerCase().includes(q)) ||
                (p.species && p.species.toLowerCase().includes(q)) ||
                (p.owner_name && p.owner_name.toLowerCase().includes(q))
            );
        }
        return pets;
    }
    if (rawPath.startsWith('/pets/')) {
        const id = parseInt(rawPath.split('/')[2], 10);
        const pets = JSON.parse(localStorage.getItem('vetcare_mock_pets') || '[]');
        return pets.find(p => p.id === id) || null;
    }
    if (rawPath === '/appointments') {
        let appts = JSON.parse(localStorage.getItem('vetcare_mock_appointments') || '[]');
        const ownerId = params.get('owner_id');
        const doctorId = params.get('doctor_id');
        const status = params.get('status');

        if (ownerId) appts = appts.filter(a => String(a.owner_id) === String(ownerId));
        if (doctorId) appts = appts.filter(a => String(a.doctor_id) === String(doctorId));
        if (status && status !== 'All') appts = appts.filter(a => a.status === status);
        return appts.sort((a, b) => b.id - a.id);
    }
    if (rawPath.startsWith('/appointments/')) {
        const id = parseInt(rawPath.split('/')[2], 10);
        const appts = JSON.parse(localStorage.getItem('vetcare_mock_appointments') || '[]');
        return appts.find(a => a.id === id) || null;
    }
    if (rawPath === '/health-logs') {
        let logs = JSON.parse(localStorage.getItem('vetcare_mock_health_records') || '[]');
        const petId = params.get('pet_id');
        if (petId) logs = logs.filter(l => String(l.pet_id) === String(petId));
        return logs.sort((a, b) => b.id - a.id);
    }
    if (rawPath === '/invoices') {
        let invs = JSON.parse(localStorage.getItem('vetcare_mock_invoices') || '[]');
        const ownerId = params.get('owner_id');
        const status = params.get('status');
        if (ownerId) invs = invs.filter(i => String(i.owner_id) === String(ownerId));
        if (status && status !== 'All') invs = invs.filter(i => i.payment_status === status);
        return invs.sort((a, b) => b.id - a.id);
    }
    if (rawPath === '/announcements') {
        return JSON.parse(localStorage.getItem('vetcare_mock_announcements') || '[]').sort((a, b) => b.id - a.id);
    }
    if (rawPath === '/events') {
        return JSON.parse(localStorage.getItem('vetcare_mock_events') || '[]');
    }
    if (rawPath.startsWith('/events/')) {
        const id = parseInt(rawPath.split('/')[2], 10);
        const evs = JSON.parse(localStorage.getItem('vetcare_mock_events') || '[]');
        return evs.find(e => e.id === id) || null;
    }
    if (rawPath === '/dashboard/stats') {
        const pets = JSON.parse(localStorage.getItem('vetcare_mock_pets') || '[]');
        const appts = JSON.parse(localStorage.getItem('vetcare_mock_appointments') || '[]');
        const invoices = JSON.parse(localStorage.getItem('vetcare_mock_invoices') || '[]');
        const revenue = invoices.filter(i => i.payment_status === 'Paid').reduce((s, i) => s + (Number(i.total_amount) || 0), 0);

        return {
            total_pets: pets.length,
            total_appointments: appts.length,
            pending_appointments: appts.filter(a => a.status === 'Pending Review').length,
            confirmed_appointments: appts.filter(a => a.status === 'Confirmed').length,
            completed_appointments: appts.filter(a => a.status === 'Completed').length,
            total_revenue: revenue,
            recent_appointments: appts.slice(0, 5)
        };
    }
    if (rawPath === '/reports/summary') {
        const pets = JSON.parse(localStorage.getItem('vetcare_mock_pets') || '[]');
        const appts = JSON.parse(localStorage.getItem('vetcare_mock_appointments') || '[]');
        const invoices = JSON.parse(localStorage.getItem('vetcare_mock_invoices') || '[]');

        const speciesCounts = {};
        pets.forEach(p => {
            speciesCounts[p.species] = (speciesCounts[p.species] || 0) + 1;
        });
        const speciesDist = Object.entries(speciesCounts).map(([species, count]) => ({ species, count }));

        const totalRevenue = invoices.filter(i => i.payment_status === 'Paid').reduce((s, i) => s + (Number(i.total_amount) || 0), 0);
        const consultSum = invoices.reduce((s, i) => s + (Number(i.consultation_fee) || 0), 0);
        const treatSum = invoices.reduce((s, i) => s + (Number(i.treatment_fee) || 0), 0);
        const medSum = invoices.reduce((s, i) => s + (Number(i.medication_fee) || 0), 0);

        return {
            total_pets: pets.length,
            total_appointments: appts.length,
            total_invoices: invoices.length,
            total_revenue: totalRevenue,
            appointments_by_status: {
                confirmed: appts.filter(a => a.status === 'Confirmed').length,
                pending: appts.filter(a => a.status === 'Pending Review').length,
                completed: appts.filter(a => a.status === 'Completed').length,
                cancelled: appts.filter(a => a.status === 'Cancelled').length
            },
            fee_breakdown: {
                consultation: consultSum,
                treatment: treatSum,
                medication: medSum
            },
            species_distribution: speciesDist
        };
    }
    return {};
}

function apiPostMock(path, body) {
    if (path === '/auth/login') {
        const users = JSON.parse(localStorage.getItem('vetcare_mock_users') || '[]');
        const email = (body.email || '').toLowerCase().trim();
        const password = body.password || '';

        const user = users.find(u => u.email.toLowerCase() === email && u.password === password);
        if (!user) {
            // Check default demo credentials
            if (email === 'sarah.jenkins@vetcare.com' && password === 'doctor123') {
                return {
                    success: true,
                    message: "Welcome back, Dr. Sarah Jenkins!",
                    user: { id: 1, name: "Dr. Sarah Jenkins", email: "sarah.jenkins@vetcare.com", role: "doctor", phone: "+1 (555) 234-5678", address: "VetCare Central Clinic" }
                };
            }
            if (email === 'alice.johnson@example.com' && password === 'owner123') {
                return {
                    success: true,
                    message: "Welcome back, Alice Johnson!",
                    user: { id: 3, name: "Alice Johnson", email: "alice.johnson@example.com", role: "owner", phone: "+1 (555) 019-2834", address: "742 Evergreen Terrace" }
                };
            }
            throw new Error('Invalid email or password.');
        }
        return {
            success: true,
            message: `Welcome back, ${user.name}!`,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '', address: user.address || '' }
        };
    }

    if (path === '/auth/register') {
        const users = JSON.parse(localStorage.getItem('vetcare_mock_users') || '[]');
        const email = (body.email || '').toLowerCase().trim();
        if (users.some(u => u.email.toLowerCase() === email)) {
            throw new Error('An account with this email already exists.');
        }
        const newUser = {
            id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name: body.name,
            email: email,
            password: body.password,
            role: body.role || 'owner',
            phone: body.phone || '',
            address: body.address || ''
        };
        users.push(newUser);
        localStorage.setItem('vetcare_mock_users', JSON.stringify(users));
        return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone, address: newUser.address };
    }

    if (path === '/pets') {
        const pets = JSON.parse(localStorage.getItem('vetcare_mock_pets') || '[]');
        const newPet = {
            id: pets.length ? Math.max(...pets.map(p => p.id)) + 1 : 1,
            owner_id: body.owner_id || (currentUser ? currentUser.id : 3),
            owner_name: body.owner_name || (currentUser ? currentUser.name : 'Alice Johnson'),
            name: body.name,
            species: body.species,
            breed: body.breed || 'Mix',
            age: String(body.age || '1'),
            gender: body.gender || 'Unknown',
            weight: body.weight || '',
            medical_history: body.medical_history || '',
            status: body.status || 'Healthy 🟢'
        };
        pets.unshift(newPet);
        localStorage.setItem('vetcare_mock_pets', JSON.stringify(pets));
        return newPet;
    }

    if (path === '/appointments') {
        const appts = JSON.parse(localStorage.getItem('vetcare_mock_appointments') || '[]');
        const pets = JSON.parse(localStorage.getItem('vetcare_mock_pets') || '[]');
        const doctors = JSON.parse(localStorage.getItem('vetcare_mock_doctors') || '[]');

        const pet = pets.find(p => p.id === body.pet_id);
        const doc = doctors.find(d => d.id === body.doctor_id);

        const newId = appts.length ? Math.max(...appts.map(a => a.id)) + 1 : 1;
        const newApt = {
            id: newId,
            apt_code: `#APT-${100 + newId}`,
            pet_id: body.pet_id,
            pet_name: pet ? pet.name : 'Patient Pet',
            pet_species: pet ? pet.species : 'Pet',
            owner_id: currentUser ? currentUser.id : 3,
            owner_name: currentUser ? currentUser.name : 'Alice Johnson',
            doctor_id: body.doctor_id,
            doctor_name: doc ? doc.name : 'Dr. Sarah Jenkins',
            consultation_type: body.consultation_type || 'Routine Health Checkup',
            appointment_date: body.appointment_date,
            time_slot: body.time_slot,
            reason: body.reason || '',
            status: 'Pending Review',
            doctor_notes: ''
        };
        appts.unshift(newApt);
        localStorage.setItem('vetcare_mock_appointments', JSON.stringify(appts));
        return newApt;
    }

    if (path.includes('/complete')) {
        const aptId = parseInt(path.split('/')[2], 10);
        const appts = JSON.parse(localStorage.getItem('vetcare_mock_appointments') || '[]');
        const apt = appts.find(a => a.id === aptId);
        if (apt) {
            apt.status = 'Completed';
            apt.doctor_notes = body.treatment_notes || 'Consultation completed.';
            localStorage.setItem('vetcare_mock_appointments', JSON.stringify(appts));

            // Add Health Record
            const health = JSON.parse(localStorage.getItem('vetcare_mock_health_records') || '[]');
            const newHealthId = health.length ? Math.max(...health.map(h => h.id)) + 1 : 1;
            health.unshift({
                id: newHealthId,
                pet_id: apt.pet_id,
                pet_name: apt.pet_name,
                pet_species: apt.pet_species,
                owner_name: apt.owner_name,
                checkup_date: new Date().toISOString().split('T')[0],
                vaccine_name: body.diagnosis || 'Clinical Checkup',
                vaccination_status: 'Up to Date',
                diagnosis: body.diagnosis || 'Healthy',
                treatment_notes: body.treatment_notes || '',
                next_due_date: body.follow_up_date || '',
                recorded_by: apt.doctor_name
            });
            localStorage.setItem('vetcare_mock_health_records', JSON.stringify(health));

            // Add Invoice
            const invoices = JSON.parse(localStorage.getItem('vetcare_mock_invoices') || '[]');
            const newInvId = invoices.length ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
            const cFee = Number(body.consultation_fee) || 50;
            const tFee = Number(body.treatment_fee) || 0;
            const mFee = Number(body.medication_fee) || 0;
            invoices.unshift({
                id: newInvId,
                invoice_code: `#INV-${1000 + newInvId}`,
                appointment_id: apt.id,
                owner_id: apt.owner_id,
                owner_name: apt.owner_name,
                pet_id: apt.pet_id,
                pet_name: apt.pet_name,
                pet_species: apt.pet_species,
                consultation_fee: cFee,
                treatment_fee: tFee,
                medication_fee: mFee,
                total_amount: cFee + tFee + mFee,
                payment_status: 'Pending',
                payment_method: 'Cash at Clinic',
                created_at: new Date().toISOString().split('T')[0]
            });
            localStorage.setItem('vetcare_mock_invoices', JSON.stringify(invoices));
        }
        return { success: true, message: 'Consultation completed and medical record generated.' };
    }

    if (path === '/health-logs') {
        const health = JSON.parse(localStorage.getItem('vetcare_mock_health_records') || '[]');
        const newId = health.length ? Math.max(...health.map(h => h.id)) + 1 : 1;
        const newRecord = {
            id: newId,
            pet_id: body.pet_id,
            pet_name: body.pet_name || 'Pet',
            checkup_date: body.checkup_date || new Date().toISOString().split('T')[0],
            vaccine_name: body.vaccine_name || '',
            vaccination_status: body.vaccination_status || 'Up to Date',
            diagnosis: body.diagnosis || '',
            treatment_notes: body.treatment_notes || '',
            next_due_date: body.next_due_date || '',
            recorded_by: body.recorded_by || (currentUser ? currentUser.name : 'Dr. Sarah Jenkins')
        };
        health.unshift(newRecord);
        localStorage.setItem('vetcare_mock_health_records', JSON.stringify(health));
        return newRecord;
    }

    if (path === '/invoices') {
        const invoices = JSON.parse(localStorage.getItem('vetcare_mock_invoices') || '[]');
        const newId = invoices.length ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
        const cFee = Number(body.consultation_fee) || 0;
        const tFee = Number(body.treatment_fee) || 0;
        const mFee = Number(body.medication_fee) || 0;
        const newInv = {
            id: newId,
            invoice_code: `#INV-${1000 + newId}`,
            appointment_id: body.appointment_id || null,
            owner_id: body.owner_id || (currentUser ? currentUser.id : 3),
            owner_name: body.owner_name || (currentUser ? currentUser.name : 'Alice Johnson'),
            pet_id: body.pet_id || 1,
            pet_name: body.pet_name || 'Pet',
            consultation_fee: cFee,
            treatment_fee: tFee,
            medication_fee: mFee,
            total_amount: cFee + tFee + mFee,
            payment_status: body.payment_status || 'Pending',
            payment_method: body.payment_method || 'Cash at Clinic',
            created_at: new Date().toISOString().split('T')[0]
        };
        invoices.unshift(newInv);
        localStorage.setItem('vetcare_mock_invoices', JSON.stringify(invoices));
        return newInv;
    }

    if (path === '/announcements') {
        const anns = JSON.parse(localStorage.getItem('vetcare_mock_announcements') || '[]');
        const newId = anns.length ? Math.max(...anns.map(a => a.id)) + 1 : 1;
        const newAnn = {
            id: newId,
            title: body.title,
            author: body.author || (currentUser ? currentUser.name : 'Clinic Staff'),
            category: body.category || 'General',
            content: body.content,
            created_at: new Date().toISOString().split('T')[0]
        };
        anns.unshift(newAnn);
        localStorage.setItem('vetcare_mock_announcements', JSON.stringify(anns));
        return newAnn;
    }

    if (path === '/events/register') {
        const events = JSON.parse(localStorage.getItem('vetcare_mock_events') || '[]');
        const ev = events.find(e => e.id === body.event_id);
        if (ev) {
            ev.registered_count = (ev.registered_count || 0) + 1;
            localStorage.setItem('vetcare_mock_events', JSON.stringify(events));
        }
        return { success: true, message: `Successfully registered for the event!` };
    }

    return { success: true };
}

function apiPutMock(path, body) {
    if (path.startsWith('/pets/')) {
        const id = parseInt(path.split('/')[2], 10);
        const pets = JSON.parse(localStorage.getItem('vetcare_mock_pets') || '[]');
        const pet = pets.find(p => p.id === id);
        if (pet) {
            Object.assign(pet, body);
            localStorage.setItem('vetcare_mock_pets', JSON.stringify(pets));
            return pet;
        }
    }
    if (path.includes('/status') && path.startsWith('/appointments/')) {
        const id = parseInt(path.split('/')[2], 10);
        const appts = JSON.parse(localStorage.getItem('vetcare_mock_appointments') || '[]');
        const apt = appts.find(a => a.id === id);
        if (apt) {
            if (body.status) apt.status = body.status;
            if (body.doctor_notes) apt.doctor_notes = body.doctor_notes;
            localStorage.setItem('vetcare_mock_appointments', JSON.stringify(appts));
            return apt;
        }
    }
    if (path.includes('/status') && path.startsWith('/invoices/')) {
        const id = parseInt(path.split('/')[2], 10);
        const invoices = JSON.parse(localStorage.getItem('vetcare_mock_invoices') || '[]');
        const inv = invoices.find(i => i.id === id);
        if (inv) {
            if (body.payment_status) inv.payment_status = body.payment_status;
            localStorage.setItem('vetcare_mock_invoices', JSON.stringify(invoices));
            return inv;
        }
    }
    if (path.startsWith('/auth/profile/')) {
        const id = parseInt(path.split('/')[3], 10);
        const users = JSON.parse(localStorage.getItem('vetcare_mock_users') || '[]');
        const user = users.find(u => u.id === id);
        if (user) {
            if (body.name) user.name = body.name;
            if (body.phone) user.phone = body.phone;
            if (body.address) user.address = body.address;
            localStorage.setItem('vetcare_mock_users', JSON.stringify(users));
            if (currentUser && currentUser.id === id) {
                currentUser = { ...currentUser, ...body };
                localStorage.setItem('vetcare_user', JSON.stringify(currentUser));
                updateSidebarUser(currentUser);
            }
            return user;
        }
    }
    return { success: true };
}

function apiDelMock(path) {
    if (path.startsWith('/pets/')) {
        const id = parseInt(path.split('/')[2], 10);
        let pets = JSON.parse(localStorage.getItem('vetcare_mock_pets') || '[]');
        pets = pets.filter(p => p.id !== id);
        localStorage.setItem('vetcare_mock_pets', JSON.stringify(pets));
        return { success: true, message: 'Pet deleted.' };
    }
    if (path.startsWith('/health-logs/')) {
        const id = parseInt(path.split('/')[2], 10);
        let health = JSON.parse(localStorage.getItem('vetcare_mock_health_records') || '[]');
        health = health.filter(h => h.id !== id);
        localStorage.setItem('vetcare_mock_health_records', JSON.stringify(health));
        return { success: true, message: 'Record deleted.' };
    }
    if (path.startsWith('/announcements/')) {
        const id = parseInt(path.split('/')[2], 10);
        let anns = JSON.parse(localStorage.getItem('vetcare_mock_announcements') || '[]');
        anns = anns.filter(a => a.id !== id);
        localStorage.setItem('vetcare_mock_announcements', JSON.stringify(anns));
        return { success: true, message: 'Announcement deleted.' };
    }
    return { success: true };
}

// ─── Fetch API Wrappers (With Dual-Mode Offline Resilience) ────
async function apiGet(path) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800);
        const res = await fetch(API + path, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: `Request failed with status ${res.status}` }));
            throw new Error(extractErrorMessage(err));
        }
        isServerOnline = true;
        updateServerStatusUI(true);
        return await res.json();
    } catch (err) {
        if (err.name === 'AbortError' || (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('status 404')))) {
            isServerOnline = false;
            updateServerStatusUI(false);
            return apiGetMock(path);
        }
        throw err;
    }
}

async function apiPost(path, body) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800);
        const res = await fetch(API + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: `Request failed with status ${res.status}` }));
            // If it's a specific auth/validation error from the live server (like wrong password), throw it directly
            if (res.status === 401 || res.status === 400) {
                throw new Error(extractErrorMessage(err));
            }
            throw new Error(extractErrorMessage(err));
        }
        isServerOnline = true;
        updateServerStatusUI(true);
        return await res.json();
    } catch (err) {
        if (err.name === 'AbortError' || (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('status 404')))) {
            isServerOnline = false;
            updateServerStatusUI(false);
            return apiPostMock(path, body);
        }
        throw err;
    }
}

async function apiPut(path, body) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800);
        const res = await fetch(API + path, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: `Request failed with status ${res.status}` }));
            throw new Error(extractErrorMessage(err));
        }
        isServerOnline = true;
        updateServerStatusUI(true);
        return await res.json();
    } catch (err) {
        if (err.name === 'AbortError' || (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('status 404')))) {
            isServerOnline = false;
            updateServerStatusUI(false);
            return apiPutMock(path, body);
        }
        throw err;
    }
}

async function apiDel(path) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800);
        const res = await fetch(API + path, {
            method: 'DELETE',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: `Request failed with status ${res.status}` }));
            throw new Error(extractErrorMessage(err));
        }
        isServerOnline = true;
        updateServerStatusUI(true);
        return await res.json();
    } catch (err) {
        if (err.name === 'AbortError' || (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('status 404')))) {
            isServerOnline = false;
            updateServerStatusUI(false);
            return apiDelMock(path);
        }
        throw err;
    }
}