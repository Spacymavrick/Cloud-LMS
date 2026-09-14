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

  // Global Toast Notification
  window.showToast = function (message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    if (type === 'warning') icon = '🔔';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  };

  // Sign out listener
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.signout-btn');
    if (btn) {
      e.preventDefault();
      if (confirm('Are you sure you want to sign out of CloudLearn LMS?')) {
        window.CloudStore.logout();
      }
    }
  });

})();
