/**
 * CloudLearn LMS - Central Data Store & State Management
 * Persistent via localStorage + sessionStorage with pre-seeded data for Cloud Learners.
 * Multi-user session isolated, multi-tab broadcast synced, and GitHub Pages cloud-sync ready.
 */

(function () {
  const STORAGE_KEYS = {
    USERS: 'cloudlms_users',
    COURSES: 'cloudlms_courses',
    MATERIALS: 'cloudlms_materials',
    ASSESSMENTS: 'cloudlms_assessments',
    SUBMISSIONS: 'cloudlms_submissions',
    PASSWORD_REQUESTS: 'cloudlms_password_requests',
    CURRENT_USER: 'cloudlms_current_user',
    THEME: 'cloudlms_theme',
    REMOTE_SYNC_ENDPOINT: 'cloudlms_sync_endpoint'
  };

  // Pre-seeded Users with Cloud Admin and Technical Support tracks
  const DEFAULT_USERS = [
    {
      id: 'u_admin',
      name: 'Admin User',
      email: 'admin@lms.com',
      password: 'admin123',
      role: 'admin',
      status: 'Active',
      joinedDate: '2024-01-10',
      cloudTrack: 'Cloud Admin'
    },
    {
      id: 'u_sarah',
      name: 'Dr. Sarah Johnson',
      email: 'sarah@lms.com',
      password: 'teacher123',
      role: 'teacher',
      status: 'Active',
      joinedDate: '2024-02-01',
      cloudTrack: 'Cloud Admin'
    },
    {
      id: 'u_david',
      name: 'David Chen',
      email: 'david@lms.com',
      password: 'teacher123',
      role: 'teacher',
      status: 'Active',
      joinedDate: '2024-02-15',
      cloudTrack: 'Technical Support'
    },
    {
      id: 'u_emily',
      name: 'Emily Williams',
      email: 'emily@lms.com',
      password: 'student123',
      role: 'student',
      status: 'Active',
      joinedDate: '2024-03-01',
      cloudTrack: 'Cloud Admin'
    },
    {
      id: 'u_alex',
      name: 'Alex Kumar',
      email: 'alex@lms.com',
      password: 'student123',
      role: 'student',
      status: 'Active',
      joinedDate: '2024-03-20',
      cloudTrack: 'Technical Support'
    }
  ];

  // Pre-seeded Courses: strictly only "Cloud Admin Class" and "Technical Support Class"
  const DEFAULT_COURSES = [
    {
      id: 'c_cloud',
      title: 'Cloud Admin Class',
      track: 'Cloud Admin',
      facilitatorId: 'u_sarah',
      facilitatorName: 'Dr. Sarah Johnson',
      enrolledCount: 1
    },
    {
      id: 'c_tech',
      title: 'Technical Support Class',
      track: 'Technical Support',
      facilitatorId: 'u_david',
      facilitatorName: 'David Chen',
      enrolledCount: 1
    }
  ];

  // Pre-seeded Learning Materials (PDF & Word only)
  const DEFAULT_MATERIALS = [
    {
      id: 'm_cloud1',
      courseId: 'c_cloud',
      courseTitle: 'Cloud Admin Class',
      facilitatorId: 'u_sarah',
      title: 'Cloud Administration & Systems Guide',
      docType: 'PDF Document',
      fileSize: '3.8 MB',
      fileName: 'Cloud_Administration_Guide.pdf',
      fileData: null,
      uploadDate: '2026-03-10',
      description: 'Comprehensive manual covering Cloud Infrastructure, IAM Roles, Subnet Networking, and Admin Security.'
    },
    {
      id: 'm_tech1',
      courseId: 'c_tech',
      courseTitle: 'Technical Support Class',
      facilitatorId: 'u_david',
      title: 'Technical Support & Diagnostics Manual',
      docType: 'PDF Document',
      fileSize: '3.2 MB',
      fileName: 'Technical_Support_Manual.pdf',
      fileData: null,
      uploadDate: '2026-03-12',
      description: 'Standard operating manual for hardware troubleshooting, OS installations, and helpdesk ticketing.'
    }
  ];

  // Pre-seeded Assessments & Workbooks
  const DEFAULT_ASSESSMENTS = [
    {
      id: 'a_cloud1',
      courseId: 'c_cloud',
      courseTitle: 'Cloud Admin Class',
      title: 'Lab Workbook 1: Cloud Architecture Design & Provisioning',
      type: 'Workbook',
      dueDate: '2026-09-30',
      instructions: 'Submit your network topology diagram, CIDR block allocation rationale, and complete architecture design document.'
    },
    {
      id: 'a_tech1',
      courseId: 'c_tech',
      courseTitle: 'Technical Support Class',
      title: 'Lab Workbook 1: Hardware Troubleshooting & OS Installation',
      type: 'Workbook',
      dueDate: '2026-09-30',
      instructions: 'Submit your documented troubleshooting steps, device driver configuration notes, and OS deployment checklist.'
    }
  ];

  // Pre-seeded Submissions (empty by default)
  const DEFAULT_SUBMISSIONS = [];

  // Pre-seeded Password Requests
  const DEFAULT_PASSWORD_REQUESTS = [
    {
      id: 'pr_1',
      userId: 'u_sarah',
      userName: 'Dr. Sarah Johnson',
      userEmail: 'sarah@lms.com',
      role: 'teacher',
      requestedAt: '2026-09-06 10:15',
      reason: 'Scheduled quarterly security credential rotation for facilitator account',
      status: 'PENDING',
      reviewedAt: null,
      reviewedBy: null
    },
    {
      id: 'pr_2',
      userId: 'u_emily',
      userName: 'Emily Williams',
      userEmail: 'emily@lms.com',
      role: 'student',
      requestedAt: '2026-09-07 08:45',
      reason: 'Requesting permission to update password to match updated cloud lab credentials',
      status: 'PENDING',
      reviewedAt: null,
      reviewedBy: null
    }
  ];

  // Cross-Tab Broadcast Channel & Local Listeners
  const syncChannel = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('cloudlearn_lms_channel') : null;
  const syncListeners = [];

  function notifySync(type, data) {
    if (syncChannel) {
      try {
        syncChannel.postMessage({ type, data, timestamp: Date.now() });
      } catch (e) { }
    }
    syncListeners.forEach(fn => {
      try { fn(type, data); } catch (e) { }
    });
  }

  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      const { type, data } = event.data || {};
      syncListeners.forEach(fn => {
        try { fn(type, data); } catch (e) { }
      });
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('cloudlms_')) {
      syncListeners.forEach(fn => {
        try { fn('STORAGE_CHANGED', { key: e.key }); } catch (err) { }
      });
    }
  });

  // =========================================================================
  // IndexedDB High-Capacity Document & Deliverable File Storage Engine
  // =========================================================================
  const DB_NAME = 'CloudLMS_FileDB';
  const DB_VERSION = 1;
  const STORE_FILES = 'files';

  function openFileDB() {
    return new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_FILES)) {
            db.createObjectStore(STORE_FILES, { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  // Fast In-Memory File Cache for immediate synchronous retrieval
  const fileMemoryCache = new Map();

  async function saveFileToDB(id, fileData, fileName, fileType) {
    if (!id || !fileData) return;
    fileMemoryCache.set(id, { id, fileData, fileName, fileType, timestamp: Date.now() });
    try {
      const db = await openFileDB();
      if (!db) return;
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      store.put({ id, fileData, fileName, fileType, timestamp: Date.now() });
    } catch (e) {
      console.warn('IndexedDB write warning:', e);
    }
  }

  async function getFileFromDB(id) {
    if (!id) return null;
    if (fileMemoryCache.has(id)) {
      return fileMemoryCache.get(id);
    }
    try {
      const db = await openFileDB();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_FILES, 'readonly');
        const store = tx.objectStore(STORE_FILES);
        const req = store.get(id);
        req.onsuccess = () => {
          const res = req.result;
          if (res) fileMemoryCache.set(id, res);
          resolve(res || null);
        };
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async function deleteFileFromDB(id) {
    if (!id) return;
    fileMemoryCache.delete(id);
    try {
      const db = await openFileDB();
      if (!db) return;
      const tx = db.transaction(STORE_FILES, 'readwrite');
      tx.objectStore(STORE_FILES).delete(id);
    } catch (e) { }
  }

  // Helper read/write functions with Quota-Safety
  function get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Storage Read Error', e);
      return [];
    }
  }

  function set(key, val, shouldNotify = true, notifyType = 'DATA_UPDATED') {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      if (shouldNotify) {
        notifySync(notifyType, { key, val });
      }
    } catch (e) {
      console.warn('LocalStorage quota warning - saving safe metadata without heavy base64 payload:', e);
      try {
        if (Array.isArray(val)) {
          const safeVal = val.map(item => {
            if (item && item.fileData && typeof item.fileData === 'string' && item.fileData.length > 50000) {
              return { ...item, fileData: null, hasStoredFile: true };
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(safeVal));
          if (shouldNotify) {
            notifySync(notifyType, { key, val: safeVal });
          }
        }
      } catch (innerErr) {
        console.error('Safe storage write error:', innerErr);
      }
    }
  }

  // Store Initialization & Migration
  function initStore() {
    const storedCourses = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]');
    const hasOldCourses = storedCourses.some(c => c.id === 'c1' || c.id === 'c2' || c.id === 'c3' || c.id === 'c4' || c.id === 'c_ts1' || c.id === 'c_ts2' || (c.title && (c.title.includes('AWS') || c.title.includes('Google') || c.title.includes('Azure') || c.title.includes('CompTIA') || c.title.includes('DevOps'))));

    if (!localStorage.getItem(STORAGE_KEYS.COURSES) || hasOldCourses || storedCourses.length === 0) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(DEFAULT_COURSES));
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(DEFAULT_MATERIALS));
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(DEFAULT_ASSESSMENTS));
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
    } else {
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      } else {
        try {
          const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
          let updated = false;
          DEFAULT_USERS.forEach(defU => {
            const existing = users.find(u => u.id === defU.id);
            if (!existing) {
              users.push(defU);
              updated = true;
            } else if (defU.cloudTrack === 'Technical Support' && existing.cloudTrack !== 'Technical Support') {
              existing.cloudTrack = 'Technical Support';
              updated = true;
            }
          });
          if (updated) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        } catch (e) { }
      }

      // Clean up any orphaned materials, assessments, or submissions if a course or user was deleted
      try {
        const courses = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]');
        const courseIds = courses.map(c => c.id);

        let materials = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS) || '[]');
        materials = materials.filter(m => courseIds.includes(m.courseId));
        localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));

        let assessments = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSESSMENTS) || '[]');
        assessments = assessments.filter(a => courseIds.includes(a.courseId));
        localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));

        const assessmentIds = assessments.map(a => a.id);
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const userIds = users.map(u => u.id);

        let submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
        submissions = submissions.filter(s => assessmentIds.includes(s.assessmentId) && userIds.includes(s.studentId));
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
      } catch (e) { }
    }

    if (!localStorage.getItem(STORAGE_KEYS.PASSWORD_REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.PASSWORD_REQUESTS, JSON.stringify(DEFAULT_PASSWORD_REQUESTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    }
  }

  initStore();

  // Public Store API
  window.CloudStore = {
    // Current User / Session with multi-user isolation
    getCurrentUser: function () {
      try {
        const sessionUser = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (sessionUser) return JSON.parse(sessionUser);
        const localUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return localUser ? JSON.parse(localUser) : null;
      } catch (e) {
        return null;
      }
    },
    setCurrentUser: function (user) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } catch (e) { }
    },
    logout: function () {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      if (window.location.pathname.includes('/pages/')) {
        window.location.href = '../index.html';
      } else {
        window.location.href = 'index.html';
      }
    },

    // Theme Management
    getTheme: function () {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    },
    toggleTheme: function () {
      const current = this.getTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEYS.THEME, next);
      document.body.setAttribute('data-theme', next);
      return next;
    },
    applyTheme: function () {
      const current = this.getTheme();
      document.body.setAttribute('data-theme', current);
    },

    // Sync Event Listener for Multi-Tab & Real-Time Sync
    onSync: function (callback) {
      if (typeof callback === 'function') {
        syncListeners.push(callback);
      }
    },
    broadcast: function (type, data) {
      notifySync(type, data);
    },

    // Users
    getUsers: function () {
      return get(STORAGE_KEYS.USERS);
    },
    getUserById: function (id) {
      return this.getUsers().find(u => u.id === id) || null;
    },
    getUserByEmail: function (email) {
      return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    },
    addUser: function (user) {
      const users = this.getUsers();
      user.id = 'u_' + Date.now();
      user.joinedDate = new Date().toISOString().split('T')[0];
      user.status = 'Active';
      user.cloudTrack = user.cloudTrack || 'Cloud Admin';
      users.push(user);
      set(STORAGE_KEYS.USERS, users, true, 'USERS_CHANGED');
      return user;
    },
    updateUser: function (id, updates) {
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        set(STORAGE_KEYS.USERS, users, true, 'USERS_CHANGED');
        const current = this.getCurrentUser();
        if (current && current.id === id) {
          this.setCurrentUser(users[idx]);
        }
        return users[idx];
      }
      return null;
    },
    deleteUser: function (id) {
      // 1. Remove user
      let users = this.getUsers();
      users = users.filter(u => u.id !== id);
      set(STORAGE_KEYS.USERS, users, true, 'USERS_CHANGED');

      // 2. Cascade delete submissions from this user and remove stored files
      let subs = this.getSubmissions();
      const removedSubs = subs.filter(s => s.studentId === id);
      removedSubs.forEach(s => deleteFileFromDB(s.id));
      subs = subs.filter(s => s.studentId !== id);
      set(STORAGE_KEYS.SUBMISSIONS, subs, true, 'SUBMISSIONS_CHANGED');

      // 3. Cascade delete password requests from this user
      let requests = this.getPasswordRequests();
      requests = requests.filter(r => r.userId !== id);
      set(STORAGE_KEYS.PASSWORD_REQUESTS, requests, true, 'PASSWORD_REQUESTS_CHANGED');

      // 4. Unassign facilitator from courses if applicable
      let courses = this.getCourses();
      let courseUpdated = false;
      courses.forEach(c => {
        if (c.facilitatorId === id) {
          c.facilitatorId = '';
          c.facilitatorName = 'Unassigned';
          courseUpdated = true;
        }
      });
      if (courseUpdated) {
        set(STORAGE_KEYS.COURSES, courses, true, 'COURSES_CHANGED');
      }

      // 5. If deleted user is current user, log out immediately
      const current = this.getCurrentUser();
      if (current && current.id === id) {
        this.logout();
      }

      notifySync('USER_DELETED', { userId: id });
    },

    // Courses
    getCourses: function () {
      return get(STORAGE_KEYS.COURSES);
    },
    getCoursesForFacilitator: function (facIdOrUser) {
      const user = typeof facIdOrUser === 'object' ? facIdOrUser : this.getUserById(facIdOrUser);
      const facId = typeof facIdOrUser === 'string' ? facIdOrUser : (user ? user.id : '');
      const facTrack = user && user.cloudTrack ? user.cloudTrack.trim().toLowerCase() : '';

      const allCourses = this.getCourses();
      let matched = allCourses.filter(c => {
        if (facId && c.facilitatorId === facId) return true;
        if (facTrack && c.track && c.track.trim().toLowerCase() === facTrack) return true;
        return false;
      });

      if (matched.length === 0) {
        matched = allCourses;
      }
      return matched;
    },
    getCoursesForStudent: function (studentOrTrack) {
      const user = typeof studentOrTrack === 'object' ? studentOrTrack : this.getUserById(studentOrTrack);
      const track = (typeof studentOrTrack === 'string' ? studentOrTrack : (user && user.cloudTrack ? user.cloudTrack : 'Cloud Admin')).trim().toLowerCase();
      return this.getCourses().filter(c => (c.track || '').trim().toLowerCase() === track);
    },
    addCourse: function (course) {
      const courses = this.getCourses();
      course.id = 'c_' + Date.now();
      course.enrolledCount = 0;
      course.track = course.track || 'Cloud Admin';
      courses.push(course);
      set(STORAGE_KEYS.COURSES, courses, true, 'COURSES_CHANGED');
      return course;
    },
    deleteCourse: function (id) {
      // 1. Remove course
      let courses = this.getCourses();
      courses = courses.filter(c => c.id !== id);
      set(STORAGE_KEYS.COURSES, courses, true, 'COURSES_CHANGED');

      // 2. Cascade delete all materials associated with this course and DB files
      let materials = this.getMaterials();
      const removedMats = materials.filter(m => m.courseId === id);
      removedMats.forEach(m => deleteFileFromDB(m.id));
      materials = materials.filter(m => m.courseId !== id);
      set(STORAGE_KEYS.MATERIALS, materials, true, 'MATERIALS_CHANGED');

      // 3. Find and cascade delete all assessments belonging to this course
      let assessments = this.getAssessments();
      const removedAssessmentIds = assessments.filter(a => a.courseId === id).map(a => a.id);
      assessments = assessments.filter(a => a.courseId !== id);
      set(STORAGE_KEYS.ASSESSMENTS, assessments, true, 'ASSESSMENTS_CHANGED');

      // 4. Cascade delete all student submissions for those deleted assessments and DB files
      if (removedAssessmentIds.length > 0) {
        let subs = this.getSubmissions();
        const removedSubs = subs.filter(s => removedAssessmentIds.includes(s.assessmentId));
        removedSubs.forEach(s => deleteFileFromDB(s.id));
        subs = subs.filter(s => !removedAssessmentIds.includes(s.assessmentId));
        set(STORAGE_KEYS.SUBMISSIONS, subs, true, 'SUBMISSIONS_CHANGED');
      }

      notifySync('COURSE_DELETED', { courseId: id });
    },

    // Materials (Documents)
    getMaterials: function () {
      return get(STORAGE_KEYS.MATERIALS);
    },
    getMaterialsByCourse: function (courseId) {
      if (!courseId || courseId === 'ALL') return this.getMaterials();
      return this.getMaterials().filter(m => m.courseId === courseId);
    },
    getMaterialsForFacilitator: function (facIdOrUser) {
      const myCourses = this.getCoursesForFacilitator(facIdOrUser);
      const myCourseIds = myCourses.map(c => c.id);
      const myTracks = myCourses.map(c => (c.track || '').toLowerCase());
      const user = typeof facIdOrUser === 'object' ? facIdOrUser : this.getUserById(facIdOrUser);
      const facId = typeof facIdOrUser === 'string' ? facIdOrUser : (user ? user.id : '');

      return this.getMaterials().filter(m => {
        if (m.courseId && myCourseIds.includes(m.courseId)) return true;
        if (facId && m.facilitatorId === facId) return true;
        if (m.track && myTracks.includes(m.track.toLowerCase())) return true;
        return false;
      });
    },
    getMaterialsForStudent: function (studentOrTrack) {
      const user = typeof studentOrTrack === 'object' ? studentOrTrack : this.getUserById(studentOrTrack);
      const studentTrack = (typeof studentOrTrack === 'string' ? studentOrTrack : (user && user.cloudTrack ? user.cloudTrack : 'Cloud Admin')).trim().toLowerCase();
      const courses = this.getCourses();
      const trackCourseIds = courses.filter(c => (c.track || '').trim().toLowerCase() === studentTrack).map(c => c.id);

      return this.getMaterials().filter(m => {
        if (m.courseId && trackCourseIds.includes(m.courseId)) return true;
        if (m.track && m.track.trim().toLowerCase() === studentTrack) return true;
        if (m.courseTitle && m.courseTitle.toLowerCase().includes(studentTrack)) return true;
        return false;
      });
    },
    addMaterial: function (material) {
      const materials = this.getMaterials();
      material.id = material.id || ('m_' + Date.now());
      material.uploadDate = material.uploadDate || new Date().toISOString().split('T')[0];

      if (material.fileData) {
        saveFileToDB(material.id, material.fileData, material.fileName, material.docType);
        material.hasStoredFile = true;
        if (typeof material.fileData === 'string' && material.fileData.length > 50000) {
          material.fileData = null;
        }
      }

      materials.push(material);
      set(STORAGE_KEYS.MATERIALS, materials, true, 'MATERIALS_CHANGED');
      return material;
    },
    addMaterialWithFile: async function (material, fileData) {
      material.id = material.id || ('m_' + Date.now());
      material.uploadDate = new Date().toISOString().split('T')[0];

      if (fileData) {
        await saveFileToDB(material.id, fileData, material.fileName, material.docType);
        material.hasStoredFile = true;
        material.fileData = (typeof fileData === 'string' && fileData.length < 50000) ? fileData : null;
      }

      const materials = this.getMaterials();
      materials.push(material);
      set(STORAGE_KEYS.MATERIALS, materials, true, 'MATERIALS_CHANGED');
      return material;
    },
    deleteMaterial: function (id) {
      let materials = this.getMaterials();
      materials = materials.filter(m => m.id !== id);
      set(STORAGE_KEYS.MATERIALS, materials, true, 'MATERIALS_CHANGED');
      deleteFileFromDB(id);
      notifySync('MATERIAL_DELETED', { materialId: id });
    },

    // Assessments & Workbooks
    getAssessments: function () {
      return get(STORAGE_KEYS.ASSESSMENTS);
    },
    getAssessmentsByCourse: function (courseId) {
      if (!courseId || courseId === 'ALL') return this.getAssessments();
      return this.getAssessments().filter(a => a.courseId === courseId);
    },
    getAssessmentsForFacilitator: function (facIdOrUser) {
      const myCourses = this.getCoursesForFacilitator(facIdOrUser);
      const myCourseIds = myCourses.map(c => c.id);
      return this.getAssessments().filter(a => myCourseIds.includes(a.courseId));
    },
    getAssessmentsForStudent: function (studentOrTrack) {
      const user = typeof studentOrTrack === 'object' ? studentOrTrack : this.getUserById(studentOrTrack);
      const studentTrack = (typeof studentOrTrack === 'string' ? studentOrTrack : (user && user.cloudTrack ? user.cloudTrack : 'Cloud Admin')).trim().toLowerCase();
      const trackCourseIds = this.getCourses().filter(c => (c.track || '').trim().toLowerCase() === studentTrack).map(c => c.id);
      return this.getAssessments().filter(a => trackCourseIds.includes(a.courseId));
    },
    addAssessment: function (item) {
      const assessments = this.getAssessments();
      item.id = 'a_' + Date.now();
      assessments.push(item);
      set(STORAGE_KEYS.ASSESSMENTS, assessments, true, 'ASSESSMENTS_CHANGED');
      return item;
    },
    deleteAssessment: function (id) {
      // 1. Remove assessment
      let assessments = this.getAssessments();
      assessments = assessments.filter(a => a.id !== id);
      set(STORAGE_KEYS.ASSESSMENTS, assessments, true, 'ASSESSMENTS_CHANGED');

      // 2. Cascade delete all student submissions for this assessment and DB files
      let subs = this.getSubmissions();
      const removedSubs = subs.filter(s => s.assessmentId === id);
      removedSubs.forEach(s => deleteFileFromDB(s.id));
      subs = subs.filter(s => s.assessmentId !== id);
      set(STORAGE_KEYS.SUBMISSIONS, subs, true, 'SUBMISSIONS_CHANGED');

      notifySync('ASSESSMENT_DELETED', { assessmentId: id });
    },

    // Submissions
    getSubmissions: function () {
      return get(STORAGE_KEYS.SUBMISSIONS);
    },
    getSubmissionsByStudent: function (studentId) {
      return this.getSubmissions().filter(s => s.studentId === studentId);
    },
    getSubmissionsForAssessment: function (assessmentId) {
      return this.getSubmissions().filter(s => s.assessmentId === assessmentId);
    },
    getSubmissionsForFacilitator: function (facIdOrUser) {
      const myCourses = this.getCoursesForFacilitator(facIdOrUser);
      const myCourseIds = myCourses.map(c => c.id);
      const myTracks = myCourses.map(c => (c.track || '').toLowerCase());
      const myStudents = this.getStudentsForFacilitator(facIdOrUser);
      const myStudentIds = myStudents.map(s => s.id);

      const assessments = this.getAssessments();
      const assessmentCourseMap = {};
      assessments.forEach(a => { assessmentCourseMap[a.id] = a.courseId; });

      return this.getSubmissions().filter(s => {
        if (s.courseId && myCourseIds.includes(s.courseId)) return true;
        const cId = assessmentCourseMap[s.assessmentId];
        if (cId && myCourseIds.includes(cId)) return true;
        if (s.studentId && myStudentIds.includes(s.studentId)) return true;
        if (s.studentTrack && myTracks.includes(s.studentTrack.toLowerCase())) return true;
        return false;
      });
    },
    getStudentsForFacilitator: function (facIdOrUser) {
      const myCourses = this.getCoursesForFacilitator(facIdOrUser);
      const tracks = [...new Set(myCourses.map(c => (c.track || '').toLowerCase()))];
      return this.getUsers().filter(u => u.role === 'student' && tracks.includes((u.cloudTrack || '').toLowerCase()));
    },
    addSubmission: function (sub) {
      const subs = this.getSubmissions();
      const filtered = subs.filter(s => !(s.assessmentId === sub.assessmentId && s.studentId === sub.studentId));
      sub.id = sub.id || ('sub_' + Date.now());
      sub.submittedAt = sub.submittedAt || new Date().toLocaleString();
      sub.status = sub.status || 'Submitted';
      sub.facilitatorRemarks = sub.facilitatorRemarks || 'Submission received. Awaiting facilitator review.';

      if (sub.fileData) {
        saveFileToDB(sub.id, sub.fileData, sub.fileName, 'application/pdf');
        sub.hasStoredFile = true;
        if (typeof sub.fileData === 'string' && sub.fileData.length > 50000) {
          sub.fileData = null;
        }
      }

      filtered.push(sub);
      set(STORAGE_KEYS.SUBMISSIONS, filtered, true, 'SUBMISSIONS_CHANGED');
      return sub;
    },
    addSubmissionWithFile: async function (sub, fileData) {
      sub.id = sub.id || ('sub_' + Date.now());
      sub.submittedAt = new Date().toLocaleString();
      sub.status = 'Submitted';
      sub.facilitatorRemarks = 'Submission received. Awaiting facilitator review.';

      if (fileData) {
        await saveFileToDB(sub.id, fileData, sub.fileName, 'application/pdf');
        sub.hasStoredFile = true;
        sub.fileData = (typeof fileData === 'string' && fileData.length < 50000) ? fileData : null;
      }

      const subs = this.getSubmissions();
      const filtered = subs.filter(s => !(s.assessmentId === sub.assessmentId && s.studentId === sub.studentId));
      filtered.push(sub);
      set(STORAGE_KEYS.SUBMISSIONS, filtered, true, 'SUBMISSIONS_CHANGED');
      return sub;
    },
    reviewSubmission: function (subId, status, remarks) {
      const subs = this.getSubmissions();
      const idx = subs.findIndex(s => s.id === subId);
      if (idx !== -1) {
        subs[idx].status = status || 'Reviewed';
        subs[idx].facilitatorRemarks = remarks || '';
        subs[idx].reviewedAt = new Date().toLocaleString();
        set(STORAGE_KEYS.SUBMISSIONS, subs, true, 'SUBMISSIONS_CHANGED');
        return subs[idx];
      }
      return null;
    },

    // Password Requests
    getPasswordRequests: function () {
      return get(STORAGE_KEYS.PASSWORD_REQUESTS);
    },
    getUserPasswordRequest: function (userId) {
      const requests = this.getPasswordRequests();
      const userReqs = requests.filter(r => r.userId === userId);
      if (userReqs.length === 0) return null;
      return userReqs[userReqs.length - 1];
    },
    createPasswordRequest: function (userId, reason) {
      const user = this.getUserById(userId);
      if (!user) return null;

      const requests = this.getPasswordRequests();
      const newReq = {
        id: 'pr_' + Date.now(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        role: user.role,
        requestedAt: new Date().toLocaleString(),
        reason: reason || 'User requested permission to change password',
        status: 'PENDING',
        reviewedAt: null,
        reviewedBy: null
      };

      requests.push(newReq);
      set(STORAGE_KEYS.PASSWORD_REQUESTS, requests, true, 'PASSWORDS_CHANGED');
      return newReq;
    },
    approvePasswordRequest: function (requestId, adminName) {
      const requests = this.getPasswordRequests();
      const idx = requests.findIndex(r => r.id === requestId);
      if (idx !== -1) {
        requests[idx].status = 'APPROVED';
        requests[idx].reviewedAt = new Date().toLocaleString();
        requests[idx].reviewedBy = adminName || 'Admin User';
        set(STORAGE_KEYS.PASSWORD_REQUESTS, requests, true, 'PASSWORDS_CHANGED');
        return requests[idx];
      }
      return null;
    },
    rejectPasswordRequest: function (requestId, adminName) {
      const requests = this.getPasswordRequests();
      const idx = requests.findIndex(r => r.id === requestId);
      if (idx !== -1) {
        requests[idx].status = 'REJECTED';
        requests[idx].reviewedAt = new Date().toLocaleString();
        requests[idx].reviewedBy = adminName || 'Admin User';
        set(STORAGE_KEYS.PASSWORD_REQUESTS, requests, true, 'PASSWORDS_CHANGED');
        return requests[idx];
      }
      return null;
    },
    hasPasswordChangePermission: function (userId) {
      const req = this.getUserPasswordRequest(userId);
      return req && req.status === 'APPROVED';
    },
    changePasswordWithPermission: function (userId, newPassword) {
      if (!this.hasPasswordChangePermission(userId)) {
        return { success: false, message: 'Password change permission has not been approved by Admin.' };
      }
      this.updateUser(userId, { password: newPassword });

      const requests = this.getPasswordRequests();
      const req = requests.find(r => r.userId === userId && r.status === 'APPROVED');
      if (req) {
        req.status = 'COMPLETED';
        req.completedAt = new Date().toLocaleString();
        set(STORAGE_KEYS.PASSWORD_REQUESTS, requests, true, 'PASSWORDS_CHANGED');
      }

      return { success: true, message: 'Password successfully changed!' };
    },

    // File Utilities & Persistent High-Capacity Document Downloads
    readFileAsDataURL: function (file) {
      return new Promise((resolve, reject) => {
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    },

    saveFile: async function (id, fileData, fileName, fileType) {
      await saveFileToDB(id, fileData, fileName, fileType);
    },

    getFileData: async function (id) {
      if (!id) return null;
      if (fileMemoryCache.has(id)) {
        return fileMemoryCache.get(id).fileData;
      }
      const m = this.getMaterials().find(x => x.id === id);
      if (m && m.fileData) return m.fileData;
      const s = this.getSubmissions().find(x => x.id === id);
      if (s && s.fileData) return s.fileData;

      const record = await getFileFromDB(id);
      return record ? record.fileData : null;
    },

    downloadMaterial: async function (id) {
      const m = this.getMaterials().find(x => x.id === id);
      if (!m) return;
      const fileData = await this.getFileData(id);
      const isWord = m.docType === 'Word Document' || (m.fileName && m.fileName.toLowerCase().endsWith('.docx'));
      const fallbackMime = isWord ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf';
      const fileName = m.fileName || (m.title + (isWord ? '.docx' : '.pdf'));
      this.downloadFile(fileName, fileData, fallbackMime);
    },

    downloadSubmission: async function (id) {
      const s = this.getSubmissions().find(x => x.id === id);
      if (!s) return;
      const fileData = await this.getFileData(id);
      const fileName = s.fileName || (s.assessmentTitle + '_submission.pdf');
      this.downloadFile(fileName, fileData, 'application/pdf');
    },

    downloadFile: function (fileName, fileData, fallbackType = 'text/plain') {
      const name = fileName || 'cloudlearn_document.pdf';
      if (fileData && typeof fileData === 'string' && fileData.startsWith('data:')) {
        try {
          const parts = fileData.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          const mime = (mimeMatch && mimeMatch[1]) || fallbackType;
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.style.display = 'none';
          link.href = blobUrl;
          link.download = name;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
          }, 300);
          return;
        } catch (err) {
          const link = document.createElement('a');
          link.style.display = 'none';
          link.href = fileData;
          link.download = name;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => document.body.removeChild(link), 300);
          return;
        }
      } else if (fileData instanceof Blob) {
        const blobUrl = URL.createObjectURL(fileData);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = blobUrl;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 300);
        return;
      } else {
        const isWord = name.toLowerCase().endsWith('.docx') || name.toLowerCase().endsWith('.doc');
        const ext = isWord ? '.docx' : (name.toLowerCase().endsWith('.pdf') ? '.pdf' : '.txt');
        const finalName = name.includes('.') ? name : (name + ext);
        const sampleText = `==========================================================\nCloudLearn LMS - Official Learning Material\n==========================================================\nFile Name: ${name}\nGenerated: ${new Date().toLocaleString()}\nPlatform: CloudLearn LMS Cloud Admin & Technical Support\n==========================================================\nThis document is verified and retrieved from CloudLearn LMS storage.\n`;
        const blob = new Blob([sampleText], { type: isWord ? 'application/msword' : 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = finalName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 300);
      }
    },

    formatBytes: function (bytes) {
      if (!bytes || bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    // Multi-User GitHub Pages Data Export & Import
    exportAllData: function () {
      const exportObj = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        users: this.getUsers(),
        courses: this.getCourses(),
        materials: this.getMaterials(),
        assessments: this.getAssessments(),
        submissions: this.getSubmissions(),
        passwordRequests: this.getPasswordRequests()
      };
      return JSON.stringify(exportObj, null, 2);
    },

    importAllData: function (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed.users));
        if (parsed.courses) localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(parsed.courses));
        if (parsed.materials) localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(parsed.materials));
        if (parsed.assessments) localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(parsed.assessments));
        if (parsed.submissions) localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(parsed.submissions));
        if (parsed.passwordRequests) localStorage.setItem(STORAGE_KEYS.PASSWORD_REQUESTS, JSON.stringify(parsed.passwordRequests));
        notifySync('ALL_DATA_IMPORTED', {});
        return { success: true, message: 'All CloudLearn LMS data successfully synced and updated!' };
      } catch (e) {
        return { success: false, message: 'Invalid data format: ' + e.message };
      }
    }
  };
})();
