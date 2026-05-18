// admin.js
let currentUser = null;

// مراقب حالة المصادقة
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-screen').style.display = 'flex';
        loadSection('header'); // عرض قسم الهيدر أولاً
    } else {
        currentUser = null;
        document.getElementById('login-screen').style.display = 'block';
        document.getElementById('admin-screen').style.display = 'none';
    }
});

// تسجيل الدخول
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        alert('خطأ في الدخول: ' + error.message);
    }
});

// التنقل بين الأقسام
document.getElementById('sidebar').addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        loadSection(e.target.dataset.section);
    }
});

// تحميل الأقسام
async function loadSection(section) {
    const panel = document.getElementById('content-panel');
    switch (section) {
        case 'header':
            panel.innerHTML = await getHeaderForm();
            attachHeaderEvents();
            break;
        case 'body':
            panel.innerHTML = await getBodyForm();
            attachBodyEvents();
            break;
        case 'footer':
            panel.innerHTML = await getFooterForm();
            attachFooterEvents();
            break;
        case 'posts':
            panel.innerHTML = await getPostsManager();
            attachPostsEvents();
            break;
        case 'categories':
            panel.innerHTML = await getCategoriesManager();
            attachCategoriesEvents();
            break;
        case 'links':
            panel.innerHTML = await getLinksManager();
            attachLinksEvents();
            break;
    }
}
