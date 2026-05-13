# Firestore Setup Guide - Sadak Saathi

## Required Collections

### 1. `authorized_officers` Collection

This collection stores authorized government officers who can access the admin portal.

**Document Structure:**
```typescript
{
  uid: string;           // Unique officer ID
  name: string;          // Full name
  mobile: string;        // 10-digit mobile number (e.g., "9876543210")
  role: "officer" | "admin" | "super_admin" | "inspector";
  district: string;      // District name (e.g., "Delhi Central")
  department: string;    // Department (e.g., "PWD", "NHAI", "MCD")
  isActive: boolean;     // Must be true for access
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Officers collection - only readable by authenticated admins
    match /authorized_officers/{officerId} {
      allow read: if request.auth != null
        && get(/databases/$(database)/documents/authorized_officers/$(request.auth.uid)).data.isActive == true
        && (get(/databases/$(database)/documents/authorized_officers/$(request.auth.uid)).data.role in ['admin', 'super_admin']);
      allow write: if request.auth != null
        && get(/databases/$(database)/documents/authorized_officers/$(request.auth.uid)).data.role == 'super_admin';
    }
  }
}
```

**Sample Data:**
```json
{
  "uid": "officer_001",
  "name": "Rajesh Kumar",
  "mobile": "9876543210",
  "role": "admin",
  "district": "Delhi Central",
  "department": "PWD-DL",
  "isActive": true
}
```

---

### 2. Seed Script (Optional)

To quickly add sample officers during development:

```javascript
// scripts/seedOfficers.js
const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { db } = require('../lib/firebase');

const sampleOfficers = [
  {
    uid: 'admin_001',
    name: 'Chief Engineer',
    mobile: '9999999999',
    role: 'super_admin',
    district: 'All India',
    department: 'Ministry of Road Transport',
    isActive: true
  },
  {
    uid: 'admin_002',
    name: 'District Officer - Delhi',
    mobile: '8888888888',
    role: 'admin',
    district: 'Delhi Central',
    department: 'PWD-DL',
    isActive: true
  },
  {
    uid: 'officer_001',
    name: 'Road Inspector - South Delhi',
    mobile: '7777777777',
    role: 'officer',
    district: 'Delhi South',
    department: 'MCD',
    isActive: true
  }
];

async function seedOfficers() {
  for (const officer of sampleOfficers) {
    await addDoc(collection(db, 'authorized_officers'), {
      ...officer,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`Added: ${officer.name}`);
  }
}

seedOfficers().then(() => console.log('Done!'));
```

---

## Access Flow

1. **Officer enters mobile number**
2. **System queries `authorized_officers` collection** with `mobile == input` AND `isActive == true`
3. **If found:** Officer is authorized → proceed to OTP
4. **If not found:** Show "Access Denied" UI
5. **If found but inactive:** Show "Account Inactive" UI

---

## Firebase Console Steps

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → **Firestore Database**
3. Click **Create database** → Start in **test mode** (for dev)
4. Create collection: `authorized_officers`
5. Add documents with sample officer data
6. Update rules for production use