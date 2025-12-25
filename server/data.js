const tests = [
  { id: 1, name: "Complete Blood Count (CBC)", category: "Hematology", description: "Measures blood cells", price: 12.5, fasting: false, sample: "Blood" },
  { id: 2, name: "Lipid Profile", category: "Cardiac", description: "Cholesterol & triglycerides", price: 25, fasting: true, sample: "Blood" },
  { id: 3, name: "Blood Sugar (FBS)", category: "Diabetes", description: "Fasting blood glucose", price: 8, fasting: true, sample: "Blood" },
  { id: 4, name: "Thyroid Panel (T3/T4/TSH)", category: "Endocrine", description: "Thyroid hormones", price: 30, fasting: false, sample: "Blood" },
  { id: 5, name: "Vitamin D", category: "Vitamins", description: "Vitamin D level", price: 22, fasting: false, sample: "Blood" },
  { id: 6, name: "HbA1c", category: "Diabetes", description: "3-month average blood sugar", price: 18, fasting: false, sample: "Blood" },
  { id: 7, name: "Liver Function Test (LFT)", category: "Biochemistry", description: "Liver enzymes", price: 28, fasting: true, sample: "Blood" },
  { id: 8, name: "Renal Function Test (RFT)", category: "Biochemistry", description: "Kidney function", price: 26, fasting: false, sample: "Blood" },
  { id: 9, name: "Iron Studies", category: "Micronutrients", description: "Iron, ferritin", price: 20, fasting: false, sample: "Blood" },
  { id: 10, name: "CRP", category: "Inflammation", description: "C-reactive protein", price: 15, fasting: false, sample: "Blood" }
];

const users = [
  { id: 1, name: "Admin User", email: "admin@lab.com", password: "Admin@123", role: "admin", token: null },
];

let bookings = [
  {
    id: 1,
    userId: 1,
    tests: [{ id: 1, name: "Complete Blood Count (CBC)", price: 12.5 }],
    patient: { name: "Demo Patient", age: 35, gender: "Male", phone: "9999999999", email: "demo@patient.test" },
    address: {
      addressLine1: "12 Demo Street",
      addressLine2: "Near Lab Center",
      landmark: "Opp. City Park",
      city: "DemoCity",
      state: "DemoState",
      pincode: "560001",
      country: "India"
    },
    collectionType: "Home Collection",
    datetime: "2025-01-10 07:00-09:00",
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    total: 12.5,
    status: "Pending"
  }
];

let nextTestId = tests.length + 1;
let nextUserId = users.length + 1;
let nextBookingId = bookings.length + 1;
let payments = [];
let nextPaymentId = 1;

module.exports = {
  tests,
  users,
  bookings,
  payments,
  getNextTestId: () => nextTestId++,
  getNextUserId: () => nextUserId++,
  getNextBookingId: () => nextBookingId++,
  getNextPaymentId: () => nextPaymentId++
};
