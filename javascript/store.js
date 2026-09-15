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

  // Pre-seeded Users with unified "Cloud Admin" track
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
      cloudTrack: 'Cloud Admin'
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
      id: 'u_marcus',
      name: 'Marcus Vance',
      email: 'marcus@lms.com',
      password: 'student123',
      role: 'student',
      status: 'Active',
      joinedDate: '2024-03-05',
      cloudTrack: 'Cloud Admin'
    },
    {
      id: 'u_sophia',
      name: 'Sophia Martinez',
      email: 'sophia@lms.com',
      password: 'student123',
      role: 'student',
      status: 'Active',
      joinedDate: '2024-03-12',
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
      cloudTrack: 'Cloud Admin'
    },
    {
      id: 'u_chloe',
      name: 'Chloe Bennett',
      email: 'chloe@lms.com',
      password: 'student123',
      role: 'student',
      status: 'Active',
      joinedDate: '2024-04-02',
      cloudTrack: 'Cloud Admin'
    }
  ];

  // Pre-seeded Courses with unified "Cloud Admin" track
  const DEFAULT_COURSES = [
    {
      id: 'c1',
      title: 'AWS Certified Solutions Architect Associate',
      track: 'Cloud Admin',
      facilitatorId: 'u_sarah',
      facilitatorName: 'Dr. Sarah Johnson',
      enrolledCount: 5
    },
    {
      id: 'c2',
      title: 'Google Cloud Platform (GCP) Cloud Engineer',
      track: 'Cloud Admin',
      facilitatorId: 'u_david',
      facilitatorName: 'David Chen',
      enrolledCount: 4
    },
    {
      id: 'c3',
      title: 'Microsoft Azure Administrator & Fundamentals',
      track: 'Cloud Admin',
      facilitatorId: 'u_sarah',
      facilitatorName: 'Dr. Sarah Johnson',
      enrolledCount: 4
    },
    {
      id: 'c4',
      title: 'Cloud DevOps with Docker & Kubernetes',
      track: 'Cloud Admin',
      facilitatorId: 'u_david',
      facilitatorName: 'David Chen',
      enrolledCount: 5
    }
  ];

  // Pre-seeded Learning Materials (Documents)
  const DEFAULT_MATERIALS = [
    {
      id: 'm1',
      courseId: 'c1',
      courseTitle: 'AWS Certified Solutions Architect Associate',
      title: 'AWS Well-Architected Framework Whitepaper',
      docType: 'PDF Document',
      fileSize: '4.2 MB',
      fileName: 'AWS_Well_Architected_Whitepaper.pdf',
      fileData: null,
      uploadDate: '2024-03-10',
      description: 'Comprehensive guide covering Reliability, Security, Cost Optimization, Operational Excellence, and Performance Efficiency pillars.'
    },
    {
      id: 'm2',
      courseId: 'c1',
      courseTitle: 'AWS Certified Solutions Architect Associate',
      title: 'Terraform Multi-Tier VPC Reference Architecture',
      docType: 'Architecture Spec',
      fileSize: '1.8 MB',
      fileName: 'Terraform_MultiTier_VPC.tf',
      fileData: null,
      uploadDate: '2024-03-14',
      description: 'Production-ready Infrastructure as Code template detailing Public/Private subnet splits, NAT Gateways, and route tables.'
    },
    {
      id: 'm3',
      courseId: 'c4',
      courseTitle: 'Cloud DevOps with Docker & Kubernetes',
      title: 'Kubernetes Pod Manifests & Kubectl Cheatsheet',
      docType: 'Lab Manual',
      fileSize: '2.5 MB',
      fileName: 'Kubernetes_Lab_Manual.pdf',
      fileData: null,
      uploadDate: '2024-03-18',
      description: 'Essential kubectl commands, YAML manifest structures for Deployments, Services, ConfigMaps, and Ingress routing rules.'
    },
    {
      id: 'm4',
      courseId: 'c3',
      courseTitle: 'Microsoft Azure Administrator & Fundamentals',
      title: 'Azure RBAC and Governance Blueprint',
      docType: 'PDF Document',
      fileSize: '3.1 MB',
      fileName: 'Azure_RBAC_Governance.pdf',
      fileData: null,
      uploadDate: '2024-03-22',
      description: 'Enterprise access controls guide, policy assignment definitions, management group hierarchies, and secure identity federation.'
    },
    {
      id: 'm5',
      courseId: 'c2',
      courseTitle: 'Google Cloud Platform (GCP) Cloud Engineer',
      title: 'GCP VPC Peering & Cloud NAT Lab Guide',
      docType: 'Lab Manual',
      fileSize: '2.9 MB',
      fileName: 'GCP_VPC_Peering_Guide.pdf',
      fileData: null,
      uploadDate: '2024-03-25',
      description: 'Hands-on steps for configuring custom VPC networks, firewall rules, Cloud Router, and external gateway connectivity.'
    }
  ];

  // Pre-seeded Assessments & Workbooks
  const DEFAULT_ASSESSMENTS = [
    {
      id: 'a1',
      courseId: 'c1',
      courseTitle: 'AWS Certified Solutions Architect Associate',
      title: 'Lab Workbook 1: Design Multi-AZ High-Availability VPC',
      type: 'Workbook',
      dueDate: '2026-09-25',
      instructions: 'Submit your network topology diagram, CIDR block allocation rationale, and complete Terraform/CloudFormation code or document.'
    },
    {
      id: 'a2',
      courseId: 'c4',
      courseTitle: 'Cloud DevOps with Docker & Kubernetes',
      title: 'Practical Assessment: Containerized App Deployment to EKS/GKE',
      type: 'Assessment',
      dueDate: '2026-09-28',
      instructions: 'Upload your deployment YAML manifests, ingress rule specifications, and deployment verification logs.'
    },
    {
      id: 'a3',
      courseId: 'c3',
      courseTitle: 'Microsoft Azure Administrator & Fundamentals',
      title: 'Lab Workbook 2: Azure Virtual Network Peering & Security Rules',
      type: 'Workbook',
      dueDate: '2026-10-02',
      instructions: 'Configure Hub-and-Spoke VNet peering, Network Security Group (NSG) rules, and verify connectivity between virtual networks.'
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

  // Helper read/write functions
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
      console.error('Storage Write Error', e);
    }
  }

  // Store Initialization & Migration
  function initStore() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(DEFAULT_COURSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATERIALS)) {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(DEFAULT_MATERIALS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSESSMENTS)) {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(DEFAULT_ASSESSMENTS));
    }
    // Ensure submissions start empty by default, clearing any old mock submissions (sub_1, sub_2)
    const storedSubs = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!storedSubs || storedSubs.includes('sub_1') || storedSubs.includes('sub_2')) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
    }

    // Strip course code and duration from existing stored courses so they match the new format
    try {
      const courses = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]');
      let courseUpdated = false;
      courses.forEach(c => {
        if (c.code !== undefined || c.duration !== undefined) {
          delete c.code;
          delete c.duration;
          courseUpdated = true;
        }
      });
      if (courseUpdated) {
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
      }
    } catch (e) { }
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
      let users = this.getUsers();
      users = users.filter(u => u.id !== id);
      set(STORAGE_KEYS.USERS, users, true, 'USERS_CHANGED');
    },

    // Courses
    getCourses: function () {
      return get(STORAGE_KEYS.COURSES);
    },
    getCoursesForFacilitator: function (facId) {
      return this.getCourses().filter(c => c.facilitatorId === facId);
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
      let courses = this.getCourses();
      courses = courses.filter(c => c.id !== id);
      set(STORAGE_KEYS.COURSES, courses, true, 'COURSES_CHANGED');
    },

    // Materials (Documents)
    getMaterials: function () {
      return get(STORAGE_KEYS.MATERIALS);
    },
    getMaterialsByCourse: function (courseId) {
      if (!courseId || courseId === 'ALL') return this.getMaterials();
      return this.getMaterials().filter(m => m.courseId === courseId);
    },
    addMaterial: function (material) {
      const materials = this.getMaterials();
      material.id = 'm_' + Date.now();
      material.uploadDate = new Date().toISOString().split('T')[0];
      materials.push(material);
      set(STORAGE_KEYS.MATERIALS, materials, true, 'MATERIALS_CHANGED');
      return material;
    },
    deleteMaterial: function (id) {
      let materials = this.getMaterials();
      materials = materials.filter(m => m.id !== id);
      set(STORAGE_KEYS.MATERIALS, materials, true, 'MATERIALS_CHANGED');
    },

    // Assessments & Workbooks
    getAssessments: function () {
      return get(STORAGE_KEYS.ASSESSMENTS);
    },
    getAssessmentsByCourse: function (courseId) {
      if (!courseId || courseId === 'ALL') return this.getAssessments();
      return this.getAssessments().filter(a => a.courseId === courseId);
    },
    addAssessment: function (item) {
      const assessments = this.getAssessments();
      item.id = 'a_' + Date.now();
      assessments.push(item);
      set(STORAGE_KEYS.ASSESSMENTS, assessments, true, 'ASSESSMENTS_CHANGED');
      return item;
    },
    deleteAssessment: function (id) {
      let assessments = this.getAssessments();
      assessments = assessments.filter(a => a.id !== id);
      set(STORAGE_KEYS.ASSESSMENTS, assessments, true, 'ASSESSMENTS_CHANGED');
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
    addSubmission: function (sub) {
      const subs = this.getSubmissions();
      const filtered = subs.filter(s => !(s.assessmentId === sub.assessmentId && s.studentId === sub.studentId));
      sub.id = 'sub_' + Date.now();
      sub.submittedAt = new Date().toLocaleString();
      sub.status = 'Submitted';
      sub.facilitatorRemarks = 'Submission received. Awaiting facilitator review.';
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

    // File Utilities: Reading & Downloading Actual Documents
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

    downloadFile: function (fileName, fileData, fallbackType = 'text/plain') {
      const name = fileName || 'cloudlearn_document.txt';
      if (fileData && typeof fileData === 'string' && fileData.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = fileData;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
      } else {
        // Create an informative demonstration document if no binary stream is present
        const sampleText = `==========================================================\nCloudLearn LMS - Document Download\n==========================================================\nFile Name: ${name}\nGenerated: ${new Date().toLocaleString()}\nPlatform: CloudLearn LMS (Cloud Admin Track)\n==========================================================\nThis document was successfully retrieved from CloudLearn LMS storage.\n`;
        const blob = new Blob([sampleText], { type: fallbackType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name.endsWith('.txt') ? name : name + (name.includes('.') ? '' : '.txt');
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 120);
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
