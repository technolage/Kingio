/**
 * 🏰 ALSHANFRICC - دوال مشتركة بين الصفحات
 * يمكن استخدام هذا الملف لتوحيد الدوال بين index.html و admin-working.html
 */

// دوال مساعدة عامة
const AppUtils = {
  // تنسيق التاريخ
  formatDate: (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  },

  // الوقت النسبي
  formatRelative: (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} ساعة`;
    const days = Math.floor(hrs / 24);
    return days < 7 ? `منذ ${days} يوم` : AppUtils.formatDate(dateStr);
  },

  // عرض إشعار
  showToast: (msg, type = 'success', duration = 4000) => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `padding:12px 18px;border-radius:8px;background:#fff;color:#111;box-shadow:0 4px 12px rgba(0,0,0,0.15);border-right:4px solid ${
      type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#002855'
    };animation:slideIn 0.3s`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  },

  // التحقق من جلسة المستخدم
  checkSession: () => {
    try {
      const session = JSON.parse(localStorage.getItem('af_session'));
      if (session && Date.now() < session.expiry) {
        return session.user;
      }
    } catch {}
    return null;
  },

  // تسجيل خروج
  logout: () => {
    localStorage.removeItem('af_session');
    AppUtils.showToast('👋 تم تسجيل الخروج', 'info');
    setTimeout(() => window.location.href = 'index.html', 1000);
  }
};

// إضافة أنماط الأنيميشن ديناميكياً
if (!document.getElementById('app-animations')) {
  const style = document.createElement('style');
  style.id = 'app-animations';
  style.textContent = `
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes modalIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// تصدير الدوال للاستخدام العالمي
window.AppUtils = AppUtils;

console.log('📦 ALSHANFRICC App Utils Loaded');
