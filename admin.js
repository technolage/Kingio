// دوال جلب الإعدادات
async function getSettings() {
    const doc = await db.collection('settings').doc('site').get();
    return doc.exists ? doc.data() : {};
}

// حفظ الإعدادات
async function saveSettings(data) {
    await db.collection('settings').doc('site').set(data, {merge: true});
}

// نموذج الهيدر
async function getHeaderForm() {
    const settings = await getSettings();
    return `
        <h2>إدارة الهيدر</h2>
        <form id="header-form">
            <label>اسم الموقع</label>
            <input id="header_name" value="${settings.header_name || ''}">
            <label>النص الفرعي</label>
            <input id="header_subtext" value="${settings.header_subtext || ''}">
            <label>الخط</label>
            <select id="header_font">
                <option value="Arial" ${settings.header_font=='Arial'?'selected':''}>Arial</option>
                <option value="Tahoma" ${settings.header_font=='Tahoma'?'selected':''}>Tahoma</option>
                <option value="Cairo" ${settings.header_font=='Cairo'?'selected':''}>Cairo</option>
            </select>
            <label>اللون</label>
            <input type="color" id="header_color" value="${settings.header_color || '#333'}">
            <label>كود مخصص (HTML/CSS/JS)</label>
            <textarea id="header_custom_code">${settings.header_custom_code || ''}</textarea>
            <button type="submit">حفظ</button>
        </form>
    `;
}
function attachHeaderEvents() {
    document.getElementById('header-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings({
            header_name: document.getElementById('header_name').value,
            header_subtext: document.getElementById('header_subtext').value,
            header_font: document.getElementById('header_font').value,
            header_color: document.getElementById('header_color').value,
            header_custom_code: document.getElementById('header_custom_code').value
        });
        alert('تم حفظ الهيدر');
    });
}

// نموذج البدي
async function getBodyForm() {
    const settings = await getSettings();
    return `
        <h2>إدارة البدي</h2>
        <form id="body-form">
            <label>كود مخصص للبدي</label>
            <textarea id="body_custom_code">${settings.body_custom_code || ''}</textarea>
            <button type="submit">حفظ</button>
        </form>
    `;
}
function attachBodyEvents() {
    document.getElementById('body-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings({ body_custom_code: document.getElementById('body_custom_code').value });
        alert('تم حفظ البدي');
    });
}

// نموذج الذيل
async function getFooterForm() {
    const settings = await getSettings();
    return `
        <h2>إدارة الذيل</h2>
        <form id="footer-form">
            <label>نص الحقوق</label>
            <input id="footer_text" value="${settings.footer_text || ''}">
            <label>الخط</label>
            <select id="footer_font">
                <option value="Arial" ${settings.footer_font=='Arial'?'selected':''}>Arial</option>
                <option value="Tahoma" ${settings.footer_font=='Tahoma'?'selected':''}>Tahoma</option>
                <option value="Cairo" ${settings.footer_font=='Cairo'?'selected':''}>Cairo</option>
            </select>
            <label>اللون</label>
            <input type="color" id="footer_color" value="${settings.footer_color || '#777'}">
            <label>كود مخصص</label>
            <textarea id="footer_custom_code">${settings.footer_custom_code || ''}</textarea>
            <button type="submit">حفظ</button>
        </form>
    `;
}
function attachFooterEvents() {
    document.getElementById('footer-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings({
            footer_text: document.getElementById('footer_text').value,
            footer_font: document.getElementById('footer_font').value,
            footer_color: document.getElementById('footer_color').value,
            footer_custom_code: document.getElementById('footer_custom_code').value
        });
        alert('تم حفظ الذيل');
    });
}

// ---------- المنشورات ----------
async function getPostsManager() {
    const snapshot = await db.collection('posts').orderBy('date','desc').get();
    let rows = '';
    snapshot.forEach(doc => {
        const post = doc.data();
        rows += `<tr>
            <td>${post.title}</td>
            <td>${new Date(post.date).toLocaleDateString()}</td>
            <td><button data-id="${doc.id}" class="delete-post">حذف</button></td>
        </tr>`;
    });
    return `
        <h2>إدارة المنشورات</h2>
        <button id="add-post-btn">إضافة منشور جديد</button>
        <table>${rows}</table>
        <div id="post-editor" style="display:none">
            <input id="post-title" placeholder="عنوان">
            <textarea id="post-content" placeholder="المحتوى"></textarea>
            <button id="save-post">حفظ</button>
            <button id="cancel-post">إلغاء</button>
        </div>
    `;
}
let editingPostId = null;
function attachPostsEvents() {
    document.getElementById('add-post-btn').addEventListener('click', () => {
        document.getElementById('post-editor').style.display = 'block';
        editingPostId = null;
    });
    document.getElementById('save-post').addEventListener('click', async () => {
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        if (editingPostId) {
            await db.collection('posts').doc(editingPostId).update({title, content});
        } else {
            await db.collection('posts').add({title, content, date: new Date().toISOString()});
        }
        loadSection('posts');
    });
    document.getElementById('cancel-post').addEventListener('click', () => loadSection('posts'));
    document.querySelectorAll('.delete-post').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm('حذف؟')) {
                await db.collection('posts').doc(e.target.dataset.id).delete();
                loadSection('posts');
            }
        });
    });
}

// ---------- التبويبات (فئات الروابط) ----------
async function getCategoriesManager() {
    const snapshot = await db.collection('link_categories').get();
    let rows = '';
    snapshot.forEach(doc => {
        const cat = doc.data();
        rows += `<tr><td>${cat.name}</td><td><button data-id="${doc.id}" class="delete-cat">حذف</button></td></tr>`;
    });
    return `
        <h2>إدارة التبويبات</h2>
        <input id="new-cat-name" placeholder="اسم التبويب">
        <button id="add-cat">إضافة</button>
        <table>${rows}</table>
    `;
}
function attachCategoriesEvents() {
    document.getElementById('add-cat').addEventListener('click', async () => {
        const name = document.getElementById('new-cat-name').value;
        if (name) {
            await db.collection('link_categories').add({name, slug: name.toLowerCase().replace(/ /g,'-')});
            loadSection('categories');
        }
    });
    document.querySelectorAll('.delete-cat').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm('حذف التبويب؟')) {
                await db.collection('link_categories').doc(e.target.dataset.id).delete();
                loadSection('categories');
            }
        });
    });
}

// ---------- الروابط ----------
async function getLinksManager() {
    const catsSnapshot = await db.collection('link_categories').get();
    let catsOptions = '';
    catsSnapshot.forEach(doc => catsOptions += `<option value="${doc.id}">${doc.data().name}</option>`);
    const linksSnapshot = await db.collection('links').get();
    let rows = '';
    linksSnapshot.forEach(doc => {
        const link = doc.data();
        rows += `<tr><td>${link.title}</td><td>${link.url}</td><td><button data-id="${doc.id}" class="delete-link">حذف</button></td></tr>`;
    });
    return `
        <h2>إدارة الروابط الخارجية</h2>
        <select id="link-category">${catsOptions}</select>
        <input id="link-title" placeholder="عنوان الرابط">
        <input id="link-url" placeholder="الرابط">
        <input id="link-desc" placeholder="وصف">
        <input id="link-icon" placeholder="أيقونة (fa-...)"><button id="add-link">إضافة</button>
        <table>${rows}</table>
    `;
}
function attachLinksEvents() {
    document.getElementById('add-link').addEventListener('click', async () => {
        const categoryId = document.getElementById('link-category').value;
        const title = document.getElementById('link-title').value;
        const url = document.getElementById('link-url').value;
        const description = document.getElementById('link-desc').value;
        const icon = document.getElementById('link-icon').value || 'fa-link';
        if (title && url) {
            await db.collection('links').add({categoryId, title, url, description, icon});
            loadSection('links');
        }
    });
    document.querySelectorAll('.delete-link').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm('حذف الرابط؟')) {
                await db.collection('links').doc(e.target.dataset.id).delete();
                loadSection('links');
            }
        });
    });
                                              }
