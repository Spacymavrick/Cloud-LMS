/**
 * CloudLearn LMS - Shared Application UI Logic
 * Handles themes, active tabs, modals, notifications, user profiles, and session checks
 */

(function () {
  // Ensure theme is applied on load
  document.addEventListener('DOMContentLoaded', () => {
    if (window.CloudStore) {
      window.CloudStore.applyTheme();
    }
    setupThemeToggleButtons();
    initUserProfileHeader();
  });

  // Setup Theme Toggle buttons
  function setupThemeToggleButtons() {
    const toggleBtns = document.querySelectorAll('.theme-pill-btn, .theme-toggle-trigger');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.CloudStore) {
          const nextTheme = window.CloudStore.toggleTheme();
          showToast(`Switched to ${nextTheme.toUpperCase()} mode`, 'info');
        }
      });
    });
  }

  // Populate Header Profile & Avatar Initials
  function initUserProfileHeader() {
    if (!window.CloudStore) return;
    const user = window.CloudStore.getCurrentUser();
    if (!user) return;

    // Set User Name
    const nameEls = document.querySelectorAll('.user-name-text');
    nameEls.forEach(el => {
      el.textContent = user.name;
    });

    // Set Initials
    const initials = user.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const avatarEls = document.querySelectorAll('.user-avatar-circle');
    avatarEls.forEach(el => {
      el.textContent = initials || 'CL';
    });
  }

  // Section / View Switcher for Sidebars
  window.initSectionNavigation = function (defaultSectionId) {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-section]');
    const sections = document.querySelectorAll('.app-section');
    const headerTitle = document.querySelector('.top-header .page-title');

    function switchSection(targetId) {
      // Update nav links
      navLinks.forEach(link => {
        if (link.getAttribute('data-section') === targetId) {
          link.classList.add('active');
          if (headerTitle) {
            headerTitle.textContent = link.getAttribute('data-title') || link.textContent.trim();
          }
        } else {
          link.classList.remove('active');
        }
      });

      // Update sections
      sections.forEach(sec => {
        if (sec.id === targetId) {
          sec.classList.add('active');
        } else {
          sec.classList.remove('active');
        }
      });
    }

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        if (sectionId) switchSection(sectionId);
      });
    });

    if (defaultSectionId) {
      switchSection(defaultSectionId);
    }
  };

  // Session guard
  window.checkSession = function (expectedRole) {
    if (!window.CloudStore) return null;
    const user = window.CloudStore.getCurrentUser();
    if (!user) {
      window.location.href = '../index.html';
      return null;
    }
    if (expectedRole && user.role !== expectedRole) {
      // Direct user to their matching portal
      if (user.role === 'admin') window.location.href = 'admin.html';
      else if (user.role === 'teacher') window.location.href = 'facilitator.html';
      else if (user.role === 'student') window.location.href = 'student.html';
      return null;
    }
    return user;
  };

  // Modal helpers
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  };

  // Close modals when clicking overlay
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('open');
    }
  });

  // Customized Global Toast Notification System
  window.showToast = function (message, type = 'info', customTitle = null) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const lowerMsg = (message || '').toLowerCase();

    // Auto-detect deletion / removal actions
    if (type === 'delete' || (type === 'warning' && (lowerMsg.includes('delete') || lowerMsg.includes('removed')))) {
      type = 'delete';
    }
    // Auto-detect logout / signout actions
    if (type === 'logout' || type === 'signout' || lowerMsg.includes('signed out') || lowerMsg.includes('logged out') || lowerMsg.includes('signing out')) {
      type = 'logout';
    }

    let title = customTitle;
    let pillText = '';
    let iconSvg = '';

    if (type === 'delete') {
      title = title || 'Item Deleted';
      pillText = 'DELETED';
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
      </svg>`;
    } else if (type === 'logout') {
      title = title || 'Signed Out';
      pillText = 'SESSION';
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>`;
    } else if (type === 'success') {
      title = title || 'Success';
      pillText = 'SUCCESS';
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>`;
    } else if (type === 'error') {
      title = title || 'Error';
      pillText = 'ALERT';
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>`;
    } else if (type === 'warning') {
      title = title || 'Warning';
      pillText = 'NOTICE';
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>`;
    } else {
      title = title || 'Information';
      pillText = 'INFO';
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>`;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const duration = 3600;

    toast.innerHTML = `
      <div class="toast-icon-wrap">
        ${iconSvg}
      </div>
      <div class="toast-content">
        <div class="toast-header-row">
          <div class="toast-title-group">
            <span class="toast-title">${title}</span>
            <span class="toast-pill">${pillText}</span>
          </div>
          <button type="button" class="toast-close" aria-label="Dismiss">&times;</button>
        </div>
        <div class="toast-message">${message}</div>
      </div>
      <div class="toast-progress">
        <div class="toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
      </div>
    `;

    container.appendChild(toast);

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(14px) scale(0.96)';
      toast.style.transition = 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => toast.remove(), 260);
    };

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismiss();
      });
    }

    setTimeout(dismiss, duration);
  };

  // Customized Themed Deletion Confirmation Modal
  window.showDeleteConfirm = function (message, title = 'Confirm Deletion') {
    return new Promise((resolve) => {
      const existing = document.getElementById('customDeleteConfirmModal');
      if (existing) existing.remove();

      const modalOverlay = document.createElement('div');
      modalOverlay.id = 'customDeleteConfirmModal';
      modalOverlay.className = 'modal-overlay open';
      modalOverlay.style.zIndex = '10005';

      modalOverlay.innerHTML = `
        <div class="modal-box" style="max-width: 440px; text-align: center; border-left: 4px solid var(--danger); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(239, 68, 68, 0.25);">
          <div style="width: 52px; height: 52px; border-radius: 14px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #EF4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </div>
          <span class="badge" style="background: rgba(239, 68, 68, 0.18); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.4); margin-bottom: 10px; font-size: 10px; letter-spacing: 0.5px;">CONFIRM DELETION</span>
          <h3 class="modal-title" style="margin-bottom: 8px; font-size: 18px; color: var(--text-heading);">${title}</h3>
          <p class="modal-subtitle" style="margin-bottom: 24px; font-size: 13.5px; color: var(--text-muted); line-height: 1.5;">${message}</p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button type="button" id="confirmDeleteCancelBtn" style="padding: 10px 22px; font-size: 13.5px; font-weight: 600; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-main); cursor: pointer; transition: var(--transition);">
              Cancel
            </button>
            <button type="button" id="confirmDeleteActionBtn" style="padding: 10px 24px; font-size: 13.5px; font-weight: 700; border-radius: var(--radius-sm); border: none; background: #EF4444; color: #FFFFFF; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35); transition: var(--transition);">
              <span>🗑️</span>
              <span>Delete</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modalOverlay);

      const cleanup = (result) => {
        modalOverlay.classList.remove('open');
        setTimeout(() => modalOverlay.remove(), 200);
        resolve(result);
      };

      const cancelBtn = modalOverlay.querySelector('#confirmDeleteCancelBtn');
      const actionBtn = modalOverlay.querySelector('#confirmDeleteActionBtn');

      cancelBtn.addEventListener('click', () => cleanup(false));
      actionBtn.addEventListener('click', () => cleanup(true));

      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) cleanup(false);
      });

      const keyHandler = (e) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', keyHandler);
          cleanup(false);
        }
      };
      document.addEventListener('keydown', keyHandler);
    });
  };

  // Sign out listener - triggers customized signout toast and smoothly transitions for all users
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.signout-btn');
    if (btn) {
      e.preventDefault();

      const currentUser = (window.CloudStore && typeof window.CloudStore.getCurrentUser === 'function')
        ? window.CloudStore.getCurrentUser()
        : null;
      const userName = currentUser ? currentUser.name : '';
      const logoutMsg = userName
        ? `Goodbye, ${userName}! You have been safely signed out.`
        : 'You have been safely signed out of CloudLearn LMS.';

      // Display customized signout toast immediately
      window.showToast(logoutMsg, 'logout', 'Signing Out');

      // Save pending toast for landing screen confirmation
      try {
        sessionStorage.setItem('lms_pending_toast', JSON.stringify({
          message: 'You have been successfully signed out.',
          type: 'logout',
          title: 'Session Ended'
        }));
      } catch (err) { }

      // Clear current user session
      try {
        sessionStorage.removeItem('cloud_lms_current_user');
        localStorage.removeItem('cloud_lms_current_user');
      } catch (err) { }

      setTimeout(() => {
        const target = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
        window.location.href = target;
      }, 600);
    }
  });

  // Check for pending toast notification across page navigation (e.g. after logout)
  try {
    const pending = sessionStorage.getItem('lms_pending_toast');
    if (pending) {
      sessionStorage.removeItem('lms_pending_toast');
      const data = JSON.parse(pending);
      setTimeout(() => {
        if (window.showToast) {
          window.showToast(data.message, data.type, data.title);
        }
      }, 250);
    }
  } catch (err) { }

})();
