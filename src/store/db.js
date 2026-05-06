// ============================================================
//  Deals For Loan – localStorage "DB" + Auth + CRM
// ============================================================

const DB_KEY  = 'dfl_submissions';
const AUTH_KEY = 'dfl_auth_user';
const ONB_KEY  = 'dfl_onboardings';

// ---------- Onboarding CRUD -----------------------------------
export function getAllOnboardings() {
  try { return JSON.parse(localStorage.getItem(ONB_KEY) || '[]'); } catch { return []; }
}

export function saveOnboarding(data) {
  const all = getAllOnboardings();
  const entry = { ...data, id: `ONB-${Date.now()}`, submittedAt: new Date().toISOString(), grantedTo: [] };
  all.unshift(entry);
  localStorage.setItem(ONB_KEY, JSON.stringify(all));
  return entry;
}

export function grantOnboardingAccess(onbId, managerId) {
  const all = getAllOnboardings();
  const idx = all.findIndex(o => o.id === onbId);
  if (idx === -1) return;
  if (!all[idx].grantedTo) all[idx].grantedTo = [];
  if (!all[idx].grantedTo.includes(managerId)) all[idx].grantedTo.push(managerId);
  localStorage.setItem(ONB_KEY, JSON.stringify(all));
}

export function revokeOnboardingAccess(onbId, managerId) {
  const all = getAllOnboardings();
  const idx = all.findIndex(o => o.id === onbId);
  if (idx === -1) return;
  all[idx].grantedTo = (all[idx].grantedTo || []).filter(id => id !== managerId);
  localStorage.setItem(ONB_KEY, JSON.stringify(all));
}

export function updateOnboardingStatus(onbId, status) {
  const all = getAllOnboardings();
  const idx = all.findIndex(o => o.id === onbId);
  if (idx === -1) return;
  all[idx].status = status;
  all[idx].statusUpdatedAt = new Date().toISOString();
  localStorage.setItem(ONB_KEY, JSON.stringify(all));
}

export function closeDeal(onbId, dealAmount, dealFollowUpDate) {
  const all = getAllOnboardings();
  const idx = all.findIndex(o => o.id === onbId);
  if (idx === -1) return;
  all[idx].status = 'Completed';
  all[idx].dealAmount = dealAmount;
  all[idx].dealFollowUpDate = dealFollowUpDate || null;
  all[idx].statusUpdatedAt = new Date().toISOString();
  localStorage.setItem(ONB_KEY, JSON.stringify(all));
}

export function updateOnboardingCoApplicant(onbId, coApplicant, coDocuments) {
  const all = getAllOnboardings();
  const idx = all.findIndex(o => o.id === onbId);
  if (idx === -1) return;
  all[idx].coApplicant = coApplicant;
  if (coDocuments) all[idx].coDocuments = coDocuments;
  localStorage.setItem(ONB_KEY, JSON.stringify(all));
}

/**
 * Update (replace) or delete a single document slot for an onboarding record.
 * @param {string} onbId - The ONB-xxx ID
 * @param {'documents'|'coDocuments'} docKey - Which document set to mutate
 * @param {string} section - e.g. 'ID Proof'
 * @param {number} slotIndex - Index inside the section's slots array
 * @param {object|null} newSlot - Replacement slot data, or null to delete the slot
 */
export function updateOnboardingDoc(onbId, docKey, section, slotIndex, newSlot) {
  const all = getAllOnboardings();
  const idx = all.findIndex(o => o.id === onbId);
  if (idx === -1) return;
  if (!all[idx][docKey] || !all[idx][docKey][section]) return;
  if (newSlot === null) {
    const updated = all[idx][docKey][section].filter((_, i) => i !== slotIndex);
    all[idx][docKey][section] = updated.length > 0
      ? updated
      : [{ displayName: '', uploaded: false, base64: null, fileType: null }];
  } else {
    all[idx][docKey][section][slotIndex] = newSlot;
  }
  all[idx].updatedAt = new Date().toISOString();
  localStorage.setItem(ONB_KEY, JSON.stringify(all));
}

/**
 * Add a new empty document slot to a specific section.
 */
export function addDocumentSlot(onbId, docKey, section) {
  const all = getAllOnboardings();
  const idx = all.findIndex(o => o.id === onbId);
  if (idx === -1) return;
  if (!all[idx][docKey]) all[idx][docKey] = {};
  if (!all[idx][docKey][section]) all[idx][docKey][section] = [];
  all[idx][docKey][section].push({ displayName: '', uploaded: false, base64: null, fileType: null });
  all[idx].updatedAt = new Date().toISOString();
  localStorage.setItem(ONB_KEY, JSON.stringify(all));
}

// ---------- CRM Users (1 Owner + 10 Employees) ----------------
export const MOCK_USERS = [
  { id: 'u0', name: 'Admin Owner', email: 'owner@dealsforloan.in', role: 'owner', password: 'password123' },
  { id: 'm1', name: 'Madurai Manager', email: 'manager.madurai@dealsforloan.in', role: 'manager', password: 'password123' },
  { id: 'm2', name: 'Theni Manager', email: 'manager.theni@dealsforloan.in', role: 'manager', password: 'password123' },
  { id: 'm3', name: 'Cumbum Manager', email: 'manager.cumbum@dealsforloan.in', role: 'manager', password: 'password123' }

];

export const LEAD_STATUSES = [
  "New", "Interested", "Converted", "Not Converted"
];

export const SALES_PERSONS = [
  "Sakthivel S",
  "Sethu Arun Kumar M",
  "Arun R",
  "Karthik",
  "Raja",
  "Sriram"
];

// ---------- Auth Helpers ------------------------------------
export const loginUser = (email, password) => {
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  if (user) {
    // Clear any old localStorage session (migration safety)
    localStorage.removeItem(AUTH_KEY);
    // Use sessionStorage — clears when tab/browser closes
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

export const logoutUser = () => {
  sessionStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_KEY); // clear legacy too
};

export const getLoggedInUser = () => {
  // Check sessionStorage first (new), fallback removes any old localStorage session
  const session = sessionStorage.getItem(AUTH_KEY);
  if (session) {
    try { return JSON.parse(session); } catch { return null; }
  }
  // If old localStorage session exists, clear it and force re-login
  if (localStorage.getItem(AUTH_KEY)) {
    localStorage.removeItem(AUTH_KEY);
  }
  return null;
};

export const getAllEmployees = () => {
  return MOCK_USERS.filter(u => u.role === 'manager');
};

// ---------- helpers -----------------------------------------
export function generateUID() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DFL-${ts}-${rand}`;
}

// ---------- Cloud Sync Helpers ------------------------------
export const syncToCloud = async (data) => {
  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leads: data })
    });
  } catch (e) {
    console.error('Cloud sync error:', e);
  }
};

// Placeholder for Google Apps Script Webhook URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzoO4-oWGgg6z4GzWvbgMyhgySt2yBLP0iSyXVrAsEPc9IHQ-wijU9fV7BL1tuRJLM/exec';

export const syncToSpreadsheet = async (lead) => {
  // Only sync if status is New, Interested, or Converted
  if (!['New', 'Interested', 'Converted'].includes(lead.status)) return;
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
  } catch (e) {
    console.error('Spreadsheet sync error:', e);
  }
};

export const fetchFromCloud = async () => {
  try {
    const res = await fetch('/api/sync');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (e) {
    console.error('Cloud fetch error (ignoring for local dev):', e);
  }
  return null;
};

// ---------- CRUD --------------------------------------------
export function getAllSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getAllEstimates() {
  try {
    return JSON.parse(localStorage.getItem('dfl_estimates') || '[]');
  } catch {
    return [];
  }
}

export function saveEstimate(data) {
  const all = getAllEstimates();
  all.unshift({
    ...data,
    id: `EST-${Date.now()}`,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('dfl_estimates', JSON.stringify(all));
  return data;
}

export function getSubmissionById(id) {
  return getAllSubmissions().find((s) => s.uid === id) || null;
}

export function saveSubmission(data) {
  const all = getAllSubmissions();
  const existing = all.findIndex((s) => s.uid === data.uid);

  if (existing > -1) {
    all[existing] = { ...all[existing], ...data, updatedAt: new Date().toISOString() };
  } else {
    // New submission: randomly assign to a manager if no owner specified
    const employees = getAllEmployees();
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)];

    // If a remark was provided at lead creation, seed it as first meeting note
    const initialNotes = data.remark
      ? [{ date: new Date().toISOString(), note: `Initial Remark: ${data.remark}`, isWhatsApp: false }]
      : [];

    all.unshift({
      ...data,
      status: data.status || 'New',
      assignedTo: data.assignedTo || (randomEmployee ? randomEmployee.id : 'Admin'),
      meetingNotes: initialNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  localStorage.setItem(DB_KEY, JSON.stringify(all));
  syncToCloud(all);
  syncToSpreadsheet(existing > -1 ? all[existing] : all[0]);
  return data;
}

export function updateLeadStatus(uid, newStatus, assignedTo, followUpDate) {
  const all = getAllSubmissions();
  const idx = all.findIndex((s) => s.uid === uid);
  if (idx > -1) {
    if (newStatus) all[idx].status = newStatus;
    if (assignedTo) all[idx].assignedTo = assignedTo;
    if (followUpDate !== undefined) all[idx].followUpDate = followUpDate;
    all[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(DB_KEY, JSON.stringify(all));
    syncToCloud(all);
    syncToSpreadsheet(all[idx]);
  }
}

export function addMeetingNote(uid, note, isWhatsApp = false) {
  const all = getAllSubmissions();
  const idx = all.findIndex((s) => s.uid === uid);
  if (idx > -1) {
    if (!all[idx].meetingNotes) all[idx].meetingNotes = [];
    all[idx].meetingNotes.push({
      date: new Date().toISOString(),
      note: note,
      isWhatsApp: isWhatsApp
    });
    all[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(DB_KEY, JSON.stringify(all));
  }
}

export function deleteSubmission(uid) {
  const all = getAllSubmissions().filter((s) => s.uid !== uid);
  localStorage.setItem(DB_KEY, JSON.stringify(all));
  syncToCloud(all);
}

// ---------- Spreadsheet / CSV export ------------------------
export function exportToCSV(submissions) {
  const headers = [
    'UID', 'Full Name', 'Date of Birth', 'Age', 'Gender',
    'Phone', 'Email', 'Address', 'City', 'State', 'Pincode',
    'Aadhar Number', 'PAN Number', 'Loan Type', 'Loan Amount',
    'Status', 'Assigned To', 'Submitted At',
  ];

  const rows = submissions.map((s) => [
    s.uid, s.fullName, s.dob, s.age, s.gender,
    s.phone, s.email, s.address, s.city, s.state, s.pincode,
    s.aadharNumber, s.panNumber, s.loanType, s.loanAmount,
    s.status || 'Pending', s.assignedTo || 'Unassigned', s.createdAt,
  ]);

  const csvContent = [headers, ...rows]
    .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DFL_Submissions_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------- File → base64 -----------------------------------
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- Loan types & required docs ----------------------
export const LOAN_TYPES = [
  'Home Loan', 'Personal Loan', 'Business Loan',
  'Car / Vehicle Loan', 'Education Loan', 'Gold Loan',
  'Mortgage Loan', 'Loan Against Property',
];

export const REQUIRED_DOCUMENTS = [
  { key: 'aadharFront', label: 'Aadhar Card – Front' },
  { key: 'aadharBack', label: 'Aadhar Card – Back' },
  { key: 'panCard', label: 'PAN Card' },
  { key: 'photo', label: 'Passport Size Photo' },
  { key: 'bankStatement', label: 'Bank Statement (6 months)' },
  { key: 'salarySlip', label: 'Latest Salary Slip / ITR' },
  { key: 'addressProof', label: 'Address Proof' },
];
