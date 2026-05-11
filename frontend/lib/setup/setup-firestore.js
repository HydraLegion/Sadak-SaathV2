/**
 * Sadak Saathi — Firebase Setup & Firestore Initialization
 *
 * This script initializes the Firestore database with required collections,
 * security rules, and sample data for development.
 *
 * Run with: node --experimental-modules setup-firestore.js
 * Or use Firebase CLI: firebase firestore:indexes && firebase firestore:rules
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp, batch } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration (same as frontend)
const firebaseConfig = {
  apiKey: "AIzaSyAJaCk7n1_gkEAYJiT7_Pfy_7iqsHP7Cu4",
  authDomain: "bsp-excelviewer.firebaseapp.com",
  projectId: "bsp-excelviewer",
  storageBucket: "bsp-excelviewer.firebasestorage.app",
  messagingSenderId: "601994430473",
  appId: "1:601994430473:web:5588669db43df8ef8c10d8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ========================================
// Firestore Collections & Sample Data
// ========================================

async function setupFirestore() {
  console.log('🚀 Setting up Sadak Saathi Firestore...\n');

  try {
    // 1. Create Users Collection
    console.log('📝 Creating users...');
    await createUsers(db);
    console.log('   ✓ Users collection ready\n');

    // 2. Create Jurisdictions Collection
    console.log('📍 Creating jurisdictions...');
    await createJurisdictions(db);
    console.log('   ✓ Jurisdictions collection ready\n');

    // 3. Create Departments Collection
    console.log('🏢 Creating departments...');
    await createDepartments(db);
    console.log('   ✓ Departments collection ready\n');

    // 4. Create Potholes Collection (sample data)
    console.log('🕳️ Creating sample potholes...');
    await createPotholes(db);
    console.log('   ✓ Potholes collection ready\n');

    // 5. Create Detections Collection (sample data)
    console.log('🔍 Creating sample detections...');
    await createDetections(db);
    console.log('   ✓ Detections collection ready\n');

    // 6. Create Complaints Collection (sample data)
    console.log('📋 Creating sample complaints...');
    await createComplaints(db);
    console.log('   ✓ Complaints collection ready\n');

    console.log('✅ Firestore setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Set Firestore security rules (see below)');
    console.log('   2. Enable Authentication providers in Firebase Console');
    console.log('   3. Create admin user with role "admin"');
    console.log('\n📜 Recommended Firestore Rules:');
    console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: Anyone can read, only admins can write
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Potholes: Public read, authenticated write
    match /potholes/{potholeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'inspector', 'officer'];
    }

    // Detections: Admin only
    match /detections/{detectionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Complaints: Authenticated users can read their own
    match /complaints/{complaintId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'officer']);
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'officer'];
    }

    // Jurisdictions: Public read
    match /jurisdictions/{jurisdictionId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Departments: Public read
    match /departments/{departmentId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Notifications: User can only read their own
    match /notifications/{notificationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null;
    }

    // Audit Logs: Admin only
    match /audit_logs/{logId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
`);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Create sample users
async function createUsers(db) {
  const users = [
    {
      uid: 'demo-citizen-001',
      email: 'citizen@example.com',
      phone: '+919876543210',
      displayName: 'Demo Citizen',
      role: 'citizen',
      jurisdictionId: 'dl-central',
      language: 'en',
      isActive: true,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
    {
      uid: 'demo-inspector-001',
      email: 'inspector@pwd.gov.in',
      phone: '+919876543211',
      displayName: 'Ramesh Kumar',
      role: 'inspector',
      jurisdictionId: 'dl-central',
      departmentId: 'pwd-dl',
      language: 'en',
      isActive: true,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
    {
      uid: 'demo-officer-001',
      email: 'officer@pwd.gov.in',
      phone: '+919876543212',
      displayName: 'Sunita Singh',
      role: 'officer',
      jurisdictionId: 'dl-central',
      departmentId: 'pwd-dl',
      language: 'en',
      isActive: true,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
    {
      uid: 'demo-admin-001',
      email: 'admin@sadaksaathi.gov.in',
      phone: '+919876543213',
      displayName: 'System Admin',
      role: 'admin',
      language: 'en',
      isActive: true,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
  ];

  for (const user of users) {
    await setDoc(doc(db, 'users', user.uid), user);
  }
}

// Create jurisdictions (Delhi zones)
async function createJurisdictions(db) {
  const jurisdictions = [
    {
      name: 'Central Delhi',
      code: 'DL-Central',
      type: 'zone',
      center: { lat: 28.6289, lng: 77.2195 },
      bounds: [
        { lat: 28.62, lng: 77.21 },
        { lat: 28.64, lng: 77.23 },
        { lat: 28.65, lng: 77.22 },
        { lat: 28.63, lng: 77.20 },
      ],
      parentId: 'delhi',
      departmentId: 'pwd-dl',
      isActive: true,
      createdAt: serverTimestamp(),
    },
    {
      name: 'North Delhi',
      code: 'DL-North',
      type: 'zone',
      center: { lat: 28.7189, lng: 77.2067 },
      bounds: [
        { lat: 28.70, lng: 77.19 },
        { lat: 28.74, lng: 77.22 },
        { lat: 28.75, lng: 77.21 },
        { lat: 28.71, lng: 77.18 },
      ],
      parentId: 'delhi',
      departmentId: 'pwd-dl',
      isActive: true,
      createdAt: serverTimestamp(),
    },
    {
      name: 'South Delhi',
      code: 'DL-South',
      type: 'zone',
      center: { lat: 28.5355, lng: 77.2500 },
      bounds: [
        { lat: 28.50, lng: 77.23 },
        { lat: 28.57, lng: 77.27 },
        { lat: 28.58, lng: 77.26 },
        { lat: 28.51, lng: 77.22 },
      ],
      parentId: 'delhi',
      departmentId: 'pwd-dl',
      isActive: true,
      createdAt: serverTimestamp(),
    },
    {
      name: 'East Delhi',
      code: 'DL-East',
      type: 'zone',
      center: { lat: 28.6220, lng: 77.2880 },
      bounds: [
        { lat: 28.60, lng: 77.27 },
        { lat: 28.64, lng: 77.30 },
        { lat: 28.65, lng: 77.29 },
        { lat: 28.61, lng: 77.26 },
      ],
      parentId: 'delhi',
      departmentId: 'pwd-dl',
      isActive: true,
      createdAt: serverTimestamp(),
    },
    {
      name: 'West Delhi',
      code: 'DL-West',
      type: 'zone',
      center: { lat: 28.6519, lng: 77.0974 },
      bounds: [
        { lat: 28.62, lng: 77.07 },
        { lat: 28.68, lng: 77.12 },
        { lat: 28.69, lng: 77.11 },
        { lat: 28.63, lng: 77.06 },
      ],
      parentId: 'delhi',
      departmentId: 'pwd-dl',
      isActive: true,
      createdAt: serverTimestamp(),
    },
  ];

  for (const jur of jurisdictions) {
    await setDoc(doc(db, 'jurisdictions', jur.code), jur);
  }
}

// Create departments
async function createDepartments(db) {
  const departments = [
    {
      name: 'Public Works Department',
      code: 'PWD-DL',
      jurisdictionId: 'delhi',
      contactEmail: 'pwd-delhi@gov.in',
      contactPhone: '+91-11-23456789',
      isActive: true,
      createdAt: serverTimestamp(),
    },
    {
      name: 'Municipal Corporation of Delhi',
      code: 'MCD-DL',
      jurisdictionId: 'delhi',
      contactEmail: 'mcd-delhi@gov.in',
      contactPhone: '+91-11-23456790',
      isActive: true,
      createdAt: serverTimestamp(),
    },
  ];

  for (const dept of departments) {
    await setDoc(doc(db, 'departments', dept.code), dept);
  }
}

// Create sample potholes
async function createPotholes(db) {
  const potholes = [
    {
      lat: 28.6139,
      lng: 77.209,
      severity: 'critical',
      confidence: 0.94,
      status: 'pending',
      jurisdictionId: 'DL-Central',
      departmentId: 'PWD-DL',
      address: 'MG Road, Connaught Place',
      description: 'Large pothole causing traffic disruption',
      mediaUrls: [],
      thumbnailUrl: null,
      detectedAt: new Date(Date.now() - 1000 * 60 * 15),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      lat: 28.6189,
      lng: 77.214,
      severity: 'high',
      confidence: 0.87,
      status: 'verified',
      jurisdictionId: 'DL-Central',
      departmentId: 'PWD-DL',
      address: 'Barakhamba Road',
      description: 'Multiple potholes near metro station',
      mediaUrls: [],
      thumbnailUrl: null,
      detectedAt: new Date(Date.now() - 1000 * 60 * 45),
      verifiedAt: new Date(Date.now() - 1000 * 60 * 30),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      lat: 28.6239,
      lng: 77.219,
      severity: 'medium',
      confidence: 0.76,
      status: 'in_progress',
      jurisdictionId: 'DL-Central',
      departmentId: 'PWD-DL',
      address: 'Janpath',
      description: 'Road damage reported by citizen',
      mediaUrls: [],
      thumbnailUrl: null,
      detectedAt: new Date(Date.now() - 1000 * 60 * 120),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      lat: 28.6339,
      lng: 77.224,
      severity: 'low',
      confidence: 0.68,
      status: 'resolved',
      jurisdictionId: 'DL-Central',
      departmentId: 'PWD-DL',
      address: 'Sansad Marg',
      description: 'Minor road damage, recently repaired',
      mediaUrls: [],
      thumbnailUrl: null,
      detectedAt: new Date(Date.now() - 1000 * 60 * 180),
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      lat: 28.6289,
      lng: 77.204,
      severity: 'critical',
      confidence: 0.92,
      status: 'pending',
      jurisdictionId: 'DL-Central',
      departmentId: 'PWD-DL',
      address: 'Parliament Street',
      description: 'Deep pothole near government building',
      mediaUrls: [],
      thumbnailUrl: null,
      detectedAt: new Date(Date.now() - 1000 * 60 * 60),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ];

  for (let i = 0; i < potholes.length; i++) {
    await setDoc(doc(db, 'potholes', `pothole-${String(i + 1).padStart(3, '0')}`), potholes[i]);
  }
}

// Create sample detections
async function createDetections(db) {
  const detections = [
    {
      mediaUrl: 'https://example.com/detections/det-001.jpg',
      mediaType: 'image',
      location: { lat: 28.6139, lng: 77.209 },
      status: 'completed',
      confidence: 0.94,
      potholeCount: 1,
      severityScores: { critical: 0.94, high: 0.06, medium: 0, low: 0 },
      processedAt: new Date(Date.now() - 1000 * 60 * 15),
      processedBy: 'ai',
      createdAt: serverTimestamp(),
    },
    {
      mediaUrl: 'https://example.com/detections/det-002.jpg',
      mediaType: 'image',
      location: { lat: 28.6189, lng: 77.214 },
      status: 'completed',
      confidence: 0.87,
      potholeCount: 2,
      severityScores: { critical: 0, high: 0.87, medium: 0.13, low: 0 },
      processedAt: new Date(Date.now() - 1000 * 60 * 45),
      processedBy: 'ai',
      createdAt: serverTimestamp(),
    },
  ];

  for (let i = 0; i < detections.length; i++) {
    await setDoc(doc(db, 'detections', `detection-${String(i + 1).padStart(3, '0')}`), detections[i]);
  }
}

// Create sample complaints
async function createComplaints(db) {
  const complaints = [
    {
      potholeId: 'pothole-0001',
      userId: 'demo-citizen-001',
      status: 'submitted',
      priority: 'critical',
      referenceNumber: 'CMP/DL-Central/26/001234',
      title: 'Large pothole near metro station',
      description: 'A large pothole near Rajiv Chowk Metro Station is causing accidents. Immediate attention required.',
      jurisdictionId: 'DL-Central',
      departmentId: 'PWD-DL',
      mediaUrls: [],
      slaDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      slaBreached: false,
      timeline: [
        {
          id: 'tl-001',
          action: 'created',
          description: 'Complaint submitted',
          performedBy: 'demo-citizen-001',
          performedAt: serverTimestamp(),
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      potholeId: 'pothole-0002',
      userId: 'demo-citizen-001',
      status: 'acknowledged',
      priority: 'high',
      referenceNumber: 'CMP/DL-Central/26/001235',
      title: 'Multiple potholes on main road',
      description: 'There are multiple potholes on Lajpat Nagar Ring Road making driving dangerous.',
      jurisdictionId: 'DL-Central',
      departmentId: 'PWD-DL',
      mediaUrls: [],
      slaDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      slaBreached: false,
      timeline: [
        {
          id: 'tl-002',
          action: 'created',
          description: 'Complaint submitted',
          performedBy: 'demo-citizen-001',
          performedAt: serverTimestamp(),
        },
        {
          id: 'tl-003',
          action: 'acknowledged',
          description: 'Complaint acknowledged by department',
          performedBy: 'demo-officer-001',
          performedAt: serverTimestamp(),
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ];

  for (let i = 0; i < complaints.length; i++) {
    await setDoc(doc(db, 'complaints', `complaint-${String(i + 1).padStart(3, '0')}`), complaints[i]);
  }
}

// Run setup
setupFirestore();
