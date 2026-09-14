/**
 * CloudLearn LMS - Central Data Store & State Management
 * Persistent via localStorage with pre-seeded data for Cloud Learners
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
    THEME: 'cloudlms_theme'
  };

  // Pre-seeded Users
  const DEFAULT_USERS = [
    {
      id: 'u_admin',
      name: 'Admin User',
      email: 'admin@lms.com',
      password: 'admin123',
      role: 'admin',
      status: 'Active',
      joinedDate: '2024-01-10',
      cloudTrack: 'Administration'
    },
    {
      id: 'u_sarah',
      name: 'Dr. Sarah Johnson',
      email: 'sarah@lms.com',
      password: 'teacher123',
      role: 'teacher',
      status: 'Active',
      joinedDate: '2024-02-01',
      cloudTrack: 'AWS Solutions & Architecture'
    },
    {
      id: 'u_david',
      name: 'David Chen',
      email: 'david@lms.com',
      password: 'teacher123',
      role: 'teacher',
      status: 'Active',
      joinedDate: '2024-02-15',
      cloudTrack: 'Kubernetes & DevOps'
    },
    {
      id: 'u_emily',
      name: 'Emily Williams',
      email: 'emily@lms.com',
      password: 'student123',
      role: 'student',
      status: 'Active',
      joinedDate: '2024-03-01',
      cloudTrack: 'AWS Solutions Architect'
    },
    {
      id: 'u_marcus',
      name: 'Marcus Vance',
      email: 'marcus@lms.com',
      password: 'student123',
      role: 'student',
      status: 'Active',
      joinedDate: '2024-03-05',
      cloudTrack: 'DevOps & Containers'
    },
    {
      id: 'u_sophia',
      name: 'Sophia Martinez',
      email: 'sophia@lms.com',
      password: 'student123',
      role: 'student',
      status: 'Active',
      joinedDate: '2024-03-12',
      cloudTrack: 'Azure Cloud Fundamentals'
    },
    {
      id: 'u_alex',
      name: 'Alex Kumar',
      email: 'alex@lms.com',
      password: 'student123',
      role: 'student',
      status: 'Active',
      joinedDate: '2024-03-20',
      cloudTrack: 'GCP Cloud Infrastructure'
    },
    {
      id: 'u_chloe',
      name: 'Chloe Bennett',
      email: 'chloe@lms.com',
      password: 'student123',
      role: 'student',
      status: 'Active',
      joinedDate: '2024-04-02',
      cloudTrack: 'Cloud Security & IAM'
    }
  ];

  // Pre-seeded Courses
  const DEFAULT_COURSES = [
    {
      id: 'c1',
      code: 'AWS-SAA-C03',
      title: 'AWS Certified Solutions Architect Associate',
      track: 'AWS',
      facilitatorId: 'u_sarah',
      facilitatorName: 'Dr. Sarah Johnson',
      enrolledCount: 5,
      duration: '10 Weeks',
      description: 'Master VPC architecture, EC2 autoscaling, S3 lifecycle policies, IAM zero-trust access, and fault-tolerant cloud design.'
    },
    {
      id: 'c2',
      code: 'GCP-ACE-201',
      title: 'Google Cloud Platform (GCP) Cloud Engineer',
      track: 'GCP',
      facilitatorId: 'u_david',
      facilitatorName: 'David Chen',
      enrolledCount: 4,
      duration: '8 Weeks',
      description: 'Deploy real-world infrastructure using gcloud CLI, Compute Engine, Google Kubernetes Engine (GKE), and BigQuery.'
    },
    {
      id: 'c3',
      code: 'AZ-104',
      title: 'Microsoft Azure Administrator & Fundamentals',
      track: 'Azure',
      facilitatorId: 'u_sarah',
      facilitatorName: 'Dr. Sarah Johnson',
      enrolledCount: 4,
      duration: '8 Weeks',
      description: 'Implement storage accounts, virtual networks, Azure Active Directory tenant management, and governance RBAC.'
    },
    {
      id: 'c4',
      code: 'K8S-CKA',
      title: 'Cloud DevOps with Docker & Kubernetes',
      track: 'DevOps',
      facilitatorId: 'u_david',
      facilitatorName: 'David Chen',
      enrolledCount: 5,
      duration: '12 Weeks',
      description: 'Hands-on containerization, multi-pod microservices, Helm package management, CI/CD automation, and cloud deployments.'
    }
  ];

  // Pre-seeded Learning Materials (Documents)
  const DEFAULT_MATERIALS = [
    {
      id: 'm1',
      courseId: 'c1',
      courseTitle: 'AWS Certified Solutions Architect',
      title: 'AWS Well-Architected Framework Whitepaper',
      docType: 'PDF Document',
      fileSize: '4.2 MB',
      uploadDate: '2024-03-10',
      description: 'Comprehensive guide covering Reliability, Security, Cost Optimization, Operational Excellence, and Performance Efficiency pillars.'
    },
    {
      id: 'm2',
      courseId: 'c1',
      courseTitle: 'AWS Certified Solutions Architect',
      title: 'Terraform Multi-Tier VPC Reference Architecture',
      docType: 'Architecture Code Spec',
      fileSize: '1.8 MB',
      uploadDate: '2024-03-14',
      description: 'Production-ready Infrastructure as Code template detailing Public/Private subnet splits, NAT Gateways, and route tables.'
    },
    {
      id: 'm3',
      courseId: 'c4',
      courseTitle: 'Cloud DevOps with Docker & Kubernetes',
      title: 'Kubernetes Pod Manifests & Kubectl Cheatsheet',
      docType: 'Lab Reference Guide',
      fileSize: '2.5 MB',
      uploadDate: '2024-03-18',
      description: 'Essential kubectl commands, YAML manifest structures for Deployments, Services, ConfigMaps, and Ingress routing rules.'
    },
    {
      id: 'm4',
      courseId: 'c3',
      courseTitle: 'Microsoft Azure Administrator',
      title: 'Azure RBAC and Governance Blueprint',
      docType: 'PDF Document',
      fileSize: '3.1 MB',
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
      uploadDate: '2024-03-25',
      description: 'Hands-on steps for configuring custom VPC networks, firewall rules, Cloud Router, and external gateway connectivity.'
    }
  ];

  // Pre-seeded Assessments & Workbooks (Submissions only - NO grading)
  const DEFAULT_ASSESSMENTS = [
    {
      id: 'a1',
      courseId: 'c1',
      courseTitle: 'AWS Certified Solutions Architect',
      title: 'Lab Workbook 1: Design Multi-AZ High-Availability VPC',
      type: 'Workbook',
      dueDate: '2026-09-25',
      instructions: 'Submit your network topology diagram, CIDR block allocation rationale, and complete Terraform/CloudFormation code.'
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
      courseTitle: 'Microsoft Azure Administrator',
      title: 'Lab Workbook 2: Azure Virtual Network Peering & Security Rules',
      type: 'Workbook',
      dueDate: '2026-10-02',
      instructions: 'Configure Hub-and-Spoke VNet peering, Network Security Group (NSG) rules, and verify connectivity between virtual networks.'
    }
  ];

  // Pre-seeded Submissions (NO grading)
  const DEFAULT_SUBMISSIONS = [
    {
      id: 'sub_1',
      assessmentId: 'a1',
      assessmentTitle: 'Lab Workbook 1: Design Multi-AZ High-Availability VPC',
      studentId: 'u_emily',
      studentName: 'Emily Williams',
      studentEmail: 'emily@lms.com',
      submittedAt: '2026-09-05 14:32',
      repoUrl: 'https://github.com/emily-cloud/aws-vpc-terraform',
      notes: 'Configured 2 public subnets and 2 private subnets across us-east-1a and us-east-1b with elastic IP NAT Gateways.',
      fileName: 'aws_vpc_multi_az_submission.zip',
      status: 'Reviewed',
      facilitatorRemarks: 'Excellent architecture diagram and clean Terraform modularization. Approved with commendations.'
    },
    {
      id: 'sub_2',
      assessmentId: 'a2',
      assessmentTitle: 'Practical Assessment: Containerized App Deployment to EKS/GKE',
      studentId: 'u_marcus',
      studentName: 'Marcus Vance',
      studentEmail: 'marcus@lms.com',
      submittedAt: '2026-09-06 09:15',
      repoUrl: 'https://github.com/marcus-v/k8s-ingress-app',
      notes: 'Included cluster ingress yaml, secret configurations, and load balancer annotations.',
      fileName: 'k8s_deployment_manifests.yaml',
      status: 'Under Review',
      facilitatorRemarks: 'Manifests received. Checking service loadbalancer ingress setup.'
    }
  ];

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

  // Store Initialization Helper
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
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(DEFAULT_SUBMISSIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PASSWORD_REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.PASSWORD_REQUESTS, JSON.stringify(DEFAULT_PASSWORD_REQUESTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    }
  }

  initStore();

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

  function set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('Storage Write Error', e);
    }
  }

  // Public Store API
  window.CloudStore = {
    // Current User / Session
    getCurrentUser: function () {
      try {
        const u = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return u ? JSON.parse(u) : null;
      } catch (e) {
        return null;
      }
    },
    setCurrentUser: function (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    },
    logout: function () {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      window.location.href = '../index.html';
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
      users.push(user);
      set(STORAGE_KEYS.USERS, users);
      return user;
    },
    updateUser: function (id, updates) {
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        set(STORAGE_KEYS.USERS, users);
        // If updating current user
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
      set(STORAGE_KEYS.USERS, users);
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
      courses.push(course);
      set(STORAGE_KEYS.COURSES, courses);
      return course;
    },
    deleteCourse: function (id) {
      let courses = this.getCourses();
      courses = courses.filter(c => c.id !== id);
      set(STORAGE_KEYS.COURSES, courses);
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
      set(STORAGE_KEYS.MATERIALS, materials);
      return material;
    },
    deleteMaterial: function (id) {
      let materials = this.getMaterials();
      materials = materials.filter(m => m.id !== id);
      set(STORAGE_KEYS.MATERIALS, materials);
    },

    // Assessments & Workbooks (NO grading)
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
      set(STORAGE_KEYS.ASSESSMENTS, assessments);
      return item;
    },
    deleteAssessment: function (id) {
      let assessments = this.getAssessments();
      assessments = assessments.filter(a => a.id !== id);
      set(STORAGE_KEYS.ASSESSMENTS, assessments);
    },

    // Submissions (NO grading - status and remarks only)
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
      // Remove any prior submission for same student & assessment to update
      const filtered = subs.filter(s => !(s.assessmentId === sub.assessmentId && s.studentId === sub.studentId));
      sub.id = 'sub_' + Date.now();
      sub.submittedAt = new Date().toLocaleString();
      sub.status = 'Submitted';
      sub.facilitatorRemarks = 'Submission received. Awaiting facilitator review.';
      filtered.push(sub);
      set(STORAGE_KEYS.SUBMISSIONS, filtered);
      return sub;
    },
    reviewSubmission: function (subId, status, remarks) {
      const subs = this.getSubmissions();
      const idx = subs.findIndex(s => s.id === subId);
      if (idx !== -1) {
        subs[idx].status = status || 'Reviewed';
        subs[idx].facilitatorRemarks = remarks || '';
        subs[idx].reviewedAt = new Date().toLocaleString();
        set(STORAGE_KEYS.SUBMISSIONS, subs);
        return subs[idx];
      }
      return null;
    },

    // Password Request Approval Workflow
    getPasswordRequests: function () {
      return get(STORAGE_KEYS.PASSWORD_REQUESTS);
    },
    getUserPasswordRequest: function (userId) {
      const requests = this.getPasswordRequests();
      // Look for latest request by this user
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
      set(STORAGE_KEYS.PASSWORD_REQUESTS, requests);
      return newReq;
    },
    approvePasswordRequest: function (requestId, adminName) {
      const requests = this.getPasswordRequests();
      const idx = requests.findIndex(r => r.id === requestId);
      if (idx !== -1) {
        requests[idx].status = 'APPROVED';
        requests[idx].reviewedAt = new Date().toLocaleString();
        requests[idx].reviewedBy = adminName || 'Admin User';
        set(STORAGE_KEYS.PASSWORD_REQUESTS, requests);
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
        set(STORAGE_KEYS.PASSWORD_REQUESTS, requests);
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
      // Update user password
      this.updateUser(userId, { password: newPassword });

      // Mark request as COMPLETED so permission resets
      const requests = this.getPasswordRequests();
      const req = requests.find(r => r.userId === userId && r.status === 'APPROVED');
      if (req) {
        req.status = 'COMPLETED';
        req.completedAt = new Date().toLocaleString();
        set(STORAGE_KEYS.PASSWORD_REQUESTS, requests);
      }

      return { success: true, message: 'Password successfully changed!' };
    }
  };
})();
