// ============================================================
//  Deals For Loan – localStorage "DB" + spreadsheet helpers
// ============================================================

const DB_KEY = 'dfl_submissions';

// ---------- helpers -----------------------------------------
export function generateUID() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DFL-${ts}-${rand}`;
}

// ---------- CRUD --------------------------------------------
export function getAllSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  } catch {
    return [];
  }
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
    all.unshift({ ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  localStorage.setItem(DB_KEY, JSON.stringify(all));
  return data;
}

export function deleteSubmission(uid) {
  const all = getAllSubmissions().filter((s) => s.uid !== uid);
  localStorage.setItem(DB_KEY, JSON.stringify(all));
}

// ---------- Spreadsheet / CSV export ------------------------
export function exportToCSV(submissions) {
  const headers = [
    'UID', 'Full Name', 'Date of Birth', 'Age', 'Gender',
    'Phone', 'Email', 'Address', 'City', 'State', 'Pincode',
    'Aadhar Number', 'PAN Number', 'Loan Type', 'Loan Amount',
    'Status', 'Submitted At',
  ];

  const rows = submissions.map((s) => [
    s.uid, s.fullName, s.dob, s.age, s.gender,
    s.phone, s.email, s.address, s.city, s.state, s.pincode,
    s.aadharNumber, s.panNumber, s.loanType, s.loanAmount,
    s.status || 'Pending', s.createdAt,
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
  { key: 'aadharFront',    label: 'Aadhar Card – Front' },
  { key: 'aadharBack',     label: 'Aadhar Card – Back' },
  { key: 'panCard',        label: 'PAN Card' },
  { key: 'photo',          label: 'Passport Size Photo' },
  { key: 'bankStatement',  label: 'Bank Statement (6 months)' },
  { key: 'salarySlip',     label: 'Latest Salary Slip / ITR' },
  { key: 'addressProof',   label: 'Address Proof' },
];
