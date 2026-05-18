// app.js
document.addEventListener('DOMContentLoaded', async () => {
    // جلب إعدادات الموقع من Firestore
    const siteDoc = await db.collection('settings').doc('site').get();
    const settings = siteDoc.exists ? siteDoc.data() : {};

    // بناء الهيدر
    const header = document.getElementById('site-header');
    const headerName = settings.header_name || 'اسم الموقع';
    const headerSub = settings.header_subtext || '';
    const headerFont = settings.header_font || 'Arial';
    const headerColor = settings.header_color || '#333';
    const headerCode = settings.header_custom_code || '';

    header.style.fontFamily = headerFont;
    header.style.color = headerColor;
    header.innerHTML = `
        <h1>${headerName}</h1>
        ${headerSub ? `<p>${headerSub}</p>` : ''}
        <div class="custom-code">${headerCode}</div>
    `;

    // بناء البدي (منطقة المحتوى الوسطى)
    const bodySection = document.getElementById('site-body');
    const bodyCode = settings.body_custom_code || '';
    if (bodyCode) {
        const customDiv = document.createElement('div');
        customDiv.className = 'body-custom';
        customDiv.innerHTML = bodyCode;
        bodySection.insertBefore(customDiv, bodySection.firstChild);
    }

    // بناء الفوتر
    const footer = document.getElementById('site-footer');
    const footerText = settings.footer_text || '© 2026 جميع الحقوق محفوظة.';
    const footerFont = settings.footer_font || 'Arial';
    const footerColor = settings.footer_color || '#777';
    const footerCode = settings.footer_custom_code || '';

    footer.style.fontFamily = footerFont;
    footer.style.color = footerColor;
    footer.innerHTML = `
        <p>${footerText}</p>
        <div class="custom-code">${footerCode}</div>
    `;

    // سر الدخول للوحة التحكم (ضغط 3 مرات على السنة)
    const yearSpan = document.getElementById('year');
    let clickCount = 0;
    yearSpan.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 3) {
            window.location.href = 'admin.html';
        }
        setTimeout(() => { clickCount = 0; }, 1000);
    });

    // جلب المنشورات
    const postsContainer = document.getElementById('posts-container');
    const postsSnapshot = await db.collection('posts').orderBy('date','desc').limit(10).get();
    if (!postsSnapshot.empty) {
        postsSnapshot.forEach(doc => {
            const post = doc.data();
            postsContainer.innerHTML += `
                <article>
                    <h3>${post.title}</h3>
                    <p>${post.content.substring(0,200)}...</p>
                </article>`;
        });
    } else {
        postsContainer.innerHTML = '<p>لا توجد منشورات بعد.</p>';
    }

    // جلب الروابط الخارجية والتبويبات
    const linksContainer = document.getElementById('links-container');
    const categoriesSnapshot = await db.collection('link_categories').get();
    for (const catDoc of categoriesSnapshot.docs) {
        const cat = catDoc.data();
        const catDiv = document.createElement('div');
        catDiv.innerHTML = `<h3>${cat.name}</h3>`;
        const linksSnapshot = await db.collection('links').where('categoryId','==', catDoc.id).get();
        const ul = document.createElement('ul');
        linksSnapshot.forEach(linkDoc => {
            const link = linkDoc.data();
            ul.innerHTML += `<li><a href="${link.url}" target="_blank"><i class="fa ${link.icon || 'fa-link'}"></i> ${link.title}</a> - ${link.description || ''}</li>`;
        });
        catDiv.appendChild(ul);
        linksContainer.appendChild(catDiv);
    }
});
