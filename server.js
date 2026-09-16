import express from 'express';
import cors from 'cors';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Password Hashing (identical to Python database.py)
const SALT_PRIMARY = 'vetcare_secure_salt_2026_clinic_hash';
const SALT_FALLBACKS = ['vetcare_secure_salt_2026', 'vetcare_secure_salt_2026_clinic_hash', ''];

function hashPassword(password, salt = SALT_PRIMARY) {
  const salted = salt ? `${salt}_${password}` : password;
  return crypto.createHash('sha256').update(salted, 'utf8').digest('hex');
}

function verifyPassword(storedHash, providedPassword) {
  if (!storedHash || !providedPassword) return false;
  if (storedHash === hashPassword(providedPassword, SALT_PRIMARY)) return true;
  for (const salt of SALT_FALLBACKS) {
    if (storedHash === hashPassword(providedPassword, salt)) return true;
  }
  return false;
}

// In-Memory Database initialized with seed data
const docPass = hashPassword('doctor123');
const ownerPass = hashPassword('owner123');

let users = [
  { id: 1, name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@vetcare.com', password_hash: docPass, role: 'doctor', phone: '+1 (555) 234-5678', address: 'VetCare Central Clinic, Suite 402, Metro Park', created_at: new Date().toISOString() },
  { id: 2, name: 'Dr. Alan Grant', email: 'alan.grant@vetcare.com', password_hash: docPass, role: 'doctor', phone: '+1 (555) 876-5432', address: 'VetCare Exotic & Surgery Unit, Building B', created_at: new Date().toISOString() },
  { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', password_hash: ownerPass, role: 'owner', phone: '+1 (555) 019-2834', address: '742 Evergreen Terrace, Springfield', created_at: new Date().toISOString() },
  { id: 4, name: 'Robert Smith', email: 'robert.smith@example.com', password_hash: ownerPass, role: 'owner', phone: '+1 (555) 432-1098', address: '124 Conch Street, Oakville', created_at: new Date().toISOString() },
  { id: 5, name: 'Dr. L. Harihara Sudhan', email: 'hariharasudhan@vetcare.com', password_hash: docPass, role: 'doctor', phone: '', address: 'VetCare Central Clinic', created_at: new Date().toISOString() }
];

let doctors = [
  { id: 1, user_id: 1, name: 'Dr. Sarah Jenkins', specialty: 'Canine & Feline Medicine', experience: '12+ Years Experience', consultation_fee: 50.0, rating: 4.95, avatar: 'assets/dr_sarah.jpg', available_days: 'Mon - Sat', time_slots: '09:00 AM - 10:00 AM, 10:00 AM - 11:00 AM, 11:30 AM - 12:30 PM, 02:00 PM - 03:00 PM, 03:30 PM - 04:30 PM, 04:30 PM - 05:30 PM' },
  { id: 2, user_id: 2, name: 'Dr. Alan Grant', specialty: 'Avian, Reptile & Exotic Surgery', experience: '15+ Years Experience', consultation_fee: 75.0, rating: 4.88, avatar: 'assets/dr_alan.jpg', available_days: 'Mon - Fri', time_slots: '10:00 AM - 11:00 AM, 11:30 AM - 12:30 PM, 01:30 PM - 02:30 PM, 03:00 PM - 04:00 PM, 04:30 PM - 05:30 PM' },
  { id: 3, user_id: 5, name: 'Dr. L. Harihara Sudhan', specialty: 'Pachyderm Veterinarian', experience: '10+ Years Experience', consultation_fee: 60.0, rating: 4.90, avatar: 'assets/dr_alan.jpg', available_days: 'Mon - Sat', time_slots: '09:00 AM - 10:00 AM, 11:30 AM - 12:30 PM, 02:00 PM - 03:00 PM, 04:00 PM - 05:00 PM' }
];

let pets = [
  { id: 1, owner_id: 3, name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: '3', gender: 'Male', weight: '31 kg', medical_history: 'Rabies booster up to date. Routine checkup clean. Active and healthy.', status: 'Healthy 🟢', created_at: new Date().toISOString() },
  { id: 2, owner_id: 3, name: 'Milo', species: 'Cat', breed: 'Tabby Cat', age: '2', gender: 'Male', weight: '4.5 kg', medical_history: 'Requires FVRCP vaccine booster & dental scaling check. Mild ear wax.', status: 'Booster Due 🟡', created_at: new Date().toISOString() },
  { id: 3, owner_id: 3, name: 'Luna', species: 'Rabbit', breed: 'Angora Rabbit', age: '1', gender: 'Female', weight: '2.1 kg', medical_history: 'Routine digestive monitoring. Annual checkup scheduled.', status: 'Healthy 🟢', created_at: new Date().toISOString() },
  { id: 4, owner_id: 4, name: 'Charlie', species: 'Dog', breed: 'Beagle', age: '4', gender: 'Male', weight: '14 kg', medical_history: 'Seasonal skin allergies in summer. Prescribed hypoallergenic shampoo.', status: 'Healthy 🟢', created_at: new Date().toISOString() },
  { id: 5, owner_id: 4, name: 'Bella', species: 'Cow', breed: 'Jersey Dairy', age: '5', gender: 'Female', weight: '420 kg', medical_history: 'Routine lactation and hoof health checkup. Deworming completed.', status: 'Healthy 🟢', created_at: new Date().toISOString() }
];

let appointments = [
  { id: 1, apt_code: '#APT-101', pet_id: 1, owner_id: 3, doctor_id: 1, consultation_type: 'Routine Health Checkup', appointment_date: '2026-09-15', time_slot: '10:00 AM', reason: 'Annual core vaccination & dental check', status: 'Confirmed', doctor_notes: 'Patient is active, clean coat, no signs of distress.', created_at: new Date().toISOString() },
  { id: 2, apt_code: '#APT-102', pet_id: 2, owner_id: 3, doctor_id: 2, consultation_type: 'Booster Immunization', appointment_date: '2026-09-16', time_slot: '11:30 AM', reason: 'FVRCP Booster due & mild ear scratching', status: 'Pending Review', doctor_notes: 'Awaiting doctor review of feline history.', created_at: new Date().toISOString() },
  { id: 3, apt_code: '#APT-103', pet_id: 3, owner_id: 3, doctor_id: 1, consultation_type: 'Dental Scaling Review', appointment_date: '2026-09-17', time_slot: '02:00 PM', reason: 'Checkup for Angora rabbit diet & teeth', status: 'Confirmed', doctor_notes: 'Scheduled with Dr. Sarah Jenkins.', created_at: new Date().toISOString() },
  { id: 4, apt_code: '#APT-104', pet_id: 4, owner_id: 4, doctor_id: 1, consultation_type: 'Allergy Consultation', appointment_date: '2026-09-18', time_slot: '03:30 PM', reason: 'Skin allergy inspection and booster evaluation', status: 'Pending Review', doctor_notes: 'Pending confirmation.', created_at: new Date().toISOString() }
];

let health_records = [
  { id: 1, pet_id: 1, checkup_date: '2026-08-15', vaccine_name: 'Rabies Core Vaccine', vaccination_status: 'Up to Date', diagnosis: 'Healthy physical exam, normal temperature (38.5°C)', treatment_notes: 'Administered Rabies Batch #RB-9021. No adverse reactions observed.', next_due_date: '2027-08-15', recorded_by: 'Dr. Sarah Jenkins', created_at: new Date().toISOString() },
  { id: 2, pet_id: 2, checkup_date: '2026-05-10', vaccine_name: 'FVRCP Combination', vaccination_status: 'Due Soon', diagnosis: 'Mild gingivitis stage 1, clean ears', treatment_notes: 'Recommended dental gel and booster shot in Sept 2026.', next_due_date: '2026-09-15', recorded_by: 'Dr. Alan Grant', created_at: new Date().toISOString() },
  { id: 3, pet_id: 3, checkup_date: '2026-07-20', vaccine_name: 'Rabbit Hemorrhagic (RHDV2)', vaccination_status: 'Up to Date', diagnosis: 'Excellent weight and coat condition', treatment_notes: 'Routine vaccine administered smoothly.', next_due_date: '2027-07-20', recorded_by: 'Dr. Sarah Jenkins', created_at: new Date().toISOString() },
  { id: 4, pet_id: 4, checkup_date: '2026-06-12', vaccine_name: 'Canine Distemper / Parvo (DHPP)', vaccination_status: 'Up to Date', diagnosis: 'Clear lungs and heart rhythm, weight optimal', treatment_notes: 'Administered 5-in-1 combo vaccine. Next booster due next year.', next_due_date: '2027-06-12', recorded_by: 'Dr. Sarah Jenkins', created_at: new Date().toISOString() }
];

let invoices = [
  { id: 1, invoice_code: '#INV-1001', appointment_id: 1, owner_id: 3, pet_id: 1, consultation_fee: 50.0, treatment_fee: 20.0, medication_fee: 25.0, total_amount: 95.0, payment_status: 'Paid', payment_method: 'Card at Desk', created_at: new Date().toISOString() },
  { id: 2, invoice_code: '#INV-1002', appointment_id: 2, owner_id: 3, pet_id: 2, consultation_fee: 50.0, treatment_fee: 15.0, medication_fee: 0.0, total_amount: 65.0, payment_status: 'Pending', payment_method: 'Cash at Clinic', created_at: new Date().toISOString() },
  { id: 3, invoice_code: '#INV-1003', appointment_id: 3, owner_id: 3, pet_id: 3, consultation_fee: 75.0, treatment_fee: 30.0, medication_fee: 40.0, total_amount: 145.0, payment_status: 'Paid', payment_method: 'Online Transfer', created_at: new Date().toISOString() },
  { id: 4, invoice_code: '#INV-1004', appointment_id: 4, owner_id: 4, pet_id: 4, consultation_fee: 50.0, treatment_fee: 25.0, medication_fee: 15.0, total_amount: 90.0, payment_status: 'Pending', payment_method: 'Cash at Clinic', created_at: new Date().toISOString() }
];

let announcements = [
  { id: 1, title: 'Free Community Rabies Vaccination Camp', author: 'Dr. Sarah Jenkins', category: 'Vaccination', content: 'VetCare is hosting a free rabies vaccination camp this weekend at Central Community Park. Bring all eligible dogs and cats!', is_published: 1, created_at: new Date().toISOString() },
  { id: 2, title: 'Clinic Operating Theater Laser Upgrade', author: 'Clinic Admin', category: 'Facility', content: 'Our clinic is now equipped with state-of-the-art cold laser therapy for rapid post-operative recovery and pain relief.', is_published: 1, created_at: new Date().toISOString() },
  { id: 3, title: 'Seasonal Parasite & Tick Prevention Guide', author: 'Dr. Alan Grant', category: 'Pet Wellness', content: 'Summer humidity increases tick activity. Ensure your pets receive monthly topical preventative treatments.', is_published: 1, created_at: new Date().toISOString() }
];

let wellness_events = [
  { id: 1, title: 'Rabies Vaccination Drive 2026', event_type: 'Vaccination Drive', event_date: '2026-09-20', time_range: '09:00 AM - 01:00 PM', location: 'Central Community Park, Green Zone', description: 'Free rabies shots and core health assessment for dogs and cats. First 100 pets receive a free microchip tag.', capacity: 100, registered_count: 24, status: 'Upcoming' },
  { id: 2, title: 'Pet Nutrition & Dietetics Workshop', event_type: 'Wellness Seminar', event_date: '2026-09-27', time_range: '11:00 AM - 01:00 PM', location: 'VetCare Seminar Hall A', description: 'Learn about balanced raw vs kibble diets, obesity prevention, and tailored nutrition for aging pets with Dr. Sarah Jenkins.', capacity: 40, registered_count: 18, status: 'Upcoming' },
  { id: 3, title: 'Paws & Hearts Pet Adoption Fair', event_type: 'Community Fair', event_date: '2026-10-05', time_range: '10:00 AM - 04:00 PM', location: 'City Civic Center Grounds', description: 'Meet rescue puppies and kittens looking for loving homes. Includes complimentary health passport & first vaccine.', capacity: 150, registered_count: 42, status: 'Upcoming' }
];

let event_registrations = [];

// Helper ID generators
let nextUserId = 6;
let nextPetId = 6;
let nextAptId = 5;
let nextHealthId = 5;
let nextInvoiceId = 5;
let nextAnnId = 4;
let nextEventRegId = 1;

function getUserSafe(u) {
  if (!u) return null;
  const { password_hash, ...safe } = u;
  return safe;
}

function enrichPet(pet) {
  if (!pet) return null;
  const owner = users.find(u => u.id === pet.owner_id);
  return {
    ...pet,
    owner_name: owner ? owner.name : '',
    owner_phone: owner ? owner.phone : '',
    owner_email: owner ? owner.email : ''
  };
}

function enrichAppointment(apt) {
  if (!apt) return null;
  const pet = pets.find(p => p.id === apt.pet_id);
  const owner = users.find(u => u.id === apt.owner_id);
  const doctor = doctors.find(d => d.id === apt.doctor_id);
  return {
    ...apt,
    pet_name: pet ? pet.name : 'Unknown Pet',
    species: pet ? pet.species : '',
    breed: pet ? pet.breed : '',
    owner_name: owner ? owner.name : '',
    owner_phone: owner ? owner.phone : '',
    doctor_name: doctor ? doctor.name : '',
    doctor_specialty: doctor ? doctor.specialty : ''
  };
}

function enrichHealthRecord(rec) {
  if (!rec) return null;
  const pet = pets.find(p => p.id === rec.pet_id);
  const owner = pet ? users.find(u => u.id === pet.owner_id) : null;
  return {
    ...rec,
    pet_name: pet ? pet.name : '',
    species: pet ? pet.species : '',
    breed: pet ? pet.breed : '',
    owner_name: owner ? owner.name : ''
  };
}

function enrichInvoice(inv) {
  if (!inv) return null;
  const owner = users.find(u => u.id === inv.owner_id);
  const pet = pets.find(p => p.id === inv.pet_id);
  const apt = appointments.find(a => a.id === inv.appointment_id);
  return {
    ...inv,
    owner_name: owner ? owner.name : '',
    owner_phone: owner ? owner.phone : '',
    owner_email: owner ? owner.email : '',
    owner_address: owner ? owner.address : '',
    pet_name: pet ? pet.name : '',
    pet_species: pet ? pet.species : '',
    pet_breed: pet ? pet.breed : '',
    apt_code: apt ? apt.apt_code : '',
    consultation_type: apt ? apt.consultation_type : '',
    appointment_date: apt ? apt.appointment_date : ''
  };
}

// ═══════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'vetcare', database: 'in-memory' });
});

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'owner', phone = '', address = '' } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ detail: 'Name, email, and password are required.' });
  }
  const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ detail: 'An account with this email already exists.' });
  }
  const newUser = {
    id: nextUserId++,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password_hash: hashPassword(password),
    role,
    phone: phone.trim(),
    address: address.trim(),
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  return res.json(getUserSafe(newUser));
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').trim().toLowerCase());
  if (!user || !verifyPassword(user.password_hash, password)) {
    return res.status(401).json({ detail: 'Invalid email or password.' });
  }
  return res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    user: getUserSafe(user)
  });
});

app.get('/api/auth/user/:user_id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.user_id, 10));
  if (!user) return res.status(404).json({ detail: 'User not found.' });
  res.json(getUserSafe(user));
});

app.put('/api/auth/profile/:user_id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.user_id, 10));
  if (!user) return res.status(404).json({ detail: 'User not found.' });
  if (req.body.name !== undefined) user.name = req.body.name.trim();
  if (req.body.phone !== undefined) user.phone = req.body.phone.trim();
  if (req.body.address !== undefined) user.address = req.body.address.trim();
  res.json(getUserSafe(user));
});

app.post('/api/auth/change-password/:user_id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.user_id, 10));
  if (!user) return res.status(404).json({ detail: 'User not found.' });
  const { current_password, new_password } = req.body;
  if (!verifyPassword(user.password_hash, current_password)) {
    return res.status(400).json({ detail: 'Current password is incorrect.' });
  }
  user.password_hash = hashPassword(new_password);
  res.json({ success: true, message: 'Password updated successfully.' });
});

// Pets Routes
app.get('/api/pets', (req, res) => {
  let list = pets.map(enrichPet);
  const { query, species, owner_id } = req.query;
  if (owner_id) {
    list = list.filter(p => p.owner_id === parseInt(owner_id, 10));
  }
  if (species && species.toLowerCase() !== 'all' && species.trim()) {
    list = list.filter(p => p.species.toLowerCase() === species.trim().toLowerCase());
  }
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.breed && p.breed.toLowerCase().includes(q)) ||
      (p.owner_name && p.owner_name.toLowerCase().includes(q)) ||
      (p.species && p.species.toLowerCase().includes(q))
    );
  }
  list.sort((a, b) => b.id - a.id);
  res.json(list);
});

app.get('/api/pets/:pet_id', (req, res) => {
  const pet = pets.find(p => p.id === parseInt(req.params.pet_id, 10));
  if (!pet) return res.status(404).json({ detail: 'Pet not found.' });
  res.json(enrichPet(pet));
});

app.post('/api/pets', (req, res) => {
  let { owner_id, owner_name, name, species, breed = 'Mix', age = '1', gender = 'Unknown', weight = '', medical_history = '', status = 'Healthy 🟢' } = req.body;
  if (!owner_id && owner_name) {
    let owner = users.find(u => u.name.toLowerCase() === owner_name.trim().toLowerCase());
    if (!owner) {
      owner = {
        id: nextUserId++,
        name: owner_name.trim(),
        email: `${owner_name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        password_hash: hashPassword('password123'),
        role: 'owner',
        phone: '',
        address: '',
        created_at: new Date().toISOString()
      };
      users.push(owner);
    }
    owner_id = owner.id;
  }
  const newPet = {
    id: nextPetId++,
    owner_id: owner_id ? parseInt(owner_id, 10) : 3,
    name: (name || '').trim(),
    species: (species || '').trim(),
    breed: (breed || 'Mix').trim(),
    age: String(age || '1').trim(),
    gender: gender || 'Unknown',
    weight: (weight || '').trim(),
    medical_history: (medical_history || '').trim(),
    status: status || 'Healthy 🟢',
    created_at: new Date().toISOString()
  };
  pets.push(newPet);
  res.json(enrichPet(newPet));
});

app.put('/api/pets/:pet_id', (req, res) => {
  const pet = pets.find(p => p.id === parseInt(req.params.pet_id, 10));
  if (!pet) return res.status(404).json({ detail: 'Pet not found.' });
  const fields = ['name', 'species', 'breed', 'age', 'gender', 'weight', 'medical_history', 'status', 'owner_id'];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      pet[f] = f === 'age' ? String(req.body[f]).trim() : (typeof req.body[f] === 'string' ? req.body[f].trim() : req.body[f]);
    }
  }
  res.json(enrichPet(pet));
});

app.delete('/api/pets/:pet_id', (req, res) => {
  const id = parseInt(req.params.pet_id, 10);
  const idx = pets.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ detail: 'Pet not found.' });
  pets.splice(idx, 1);
  res.json({ success: true, message: 'Pet deleted successfully.' });
});

// Doctors Routes
app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

app.get('/api/doctors/:doc_id', (req, res) => {
  const doc = doctors.find(d => d.id === parseInt(req.params.doc_id, 10));
  if (!doc) return res.status(404).json({ detail: 'Doctor not found.' });
  res.json(doc);
});

// Appointments Routes
app.get('/api/appointments', (req, res) => {
  let list = appointments.map(enrichAppointment);
  const { query, status, doctor_id, owner_id } = req.query;
  if (status && status.toLowerCase() !== 'all' && status.trim()) {
    list = list.filter(a => a.status.toLowerCase() === status.trim().toLowerCase());
  }
  if (doctor_id) {
    list = list.filter(a => a.doctor_id === parseInt(doctor_id, 10));
  }
  if (owner_id) {
    list = list.filter(a => a.owner_id === parseInt(owner_id, 10));
  }
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(a =>
      (a.apt_code && a.apt_code.toLowerCase().includes(q)) ||
      (a.pet_name && a.pet_name.toLowerCase().includes(q)) ||
      (a.owner_name && a.owner_name.toLowerCase().includes(q)) ||
      (a.doctor_name && a.doctor_name.toLowerCase().includes(q)) ||
      (a.consultation_type && a.consultation_type.toLowerCase().includes(q))
    );
  }
  list.sort((a, b) => b.id - a.id);
  res.json(list);
});

app.get('/api/appointments/:apt_id', (req, res) => {
  const apt = appointments.find(a => a.id === parseInt(req.params.apt_id, 10));
  if (!apt) return res.status(404).json({ detail: 'Appointment not found.' });
  res.json(enrichAppointment(apt));
});

app.post('/api/appointments', (req, res) => {
  let { pet_id, pet_name, pet_breed, owner_id, owner_name, doctor_id, consultation_type = 'General Checkup', appointment_date, time_slot, reason = '' } = req.body;
  owner_id = owner_id ? parseInt(owner_id, 10) : 3;

  if (pet_id) {
    pet_id = parseInt(pet_id, 10);
    const pet = pets.find(p => p.id === pet_id);
    if (pet && pet.owner_id && !req.body.owner_id) {
      owner_id = pet.owner_id;
    }
    if (pet && pet_breed && pet_breed.trim()) {
      pet.breed = pet_breed.trim();
    }
  } else if (pet_name) {
    const cleanName = pet_name.trim();
    const cleanBreed = (pet_breed || 'Mix').trim();
    let foundPet = pets.find(p => p.owner_id === owner_id && p.name.toLowerCase() === cleanName.toLowerCase());
    if (!foundPet) {
      foundPet = pets.find(p => p.name.toLowerCase() === cleanName.toLowerCase());
    }
    if (foundPet) {
      pet_id = foundPet.id;
      owner_id = owner_id || foundPet.owner_id || 3;
      if (pet_breed && pet_breed.trim()) foundPet.breed = cleanBreed;
    } else {
      const newP = {
        id: nextPetId++,
        owner_id,
        name: cleanName,
        species: 'Dog',
        breed: cleanBreed,
        age: '2',
        gender: 'Unknown',
        weight: '',
        medical_history: '',
        status: 'Healthy 🟢',
        created_at: new Date().toISOString()
      };
      pets.push(newP);
      pet_id = newP.id;
    }
  }

  const codeNum = Math.floor(100 + Math.random() * 9000);
  const apt_code = `#APT-${codeNum}`;
  const newApt = {
    id: nextAptId++,
    apt_code,
    pet_id: pet_id || null,
    owner_id: owner_id || 3,
    doctor_id: parseInt(doctor_id, 10) || 1,
    consultation_type: consultation_type || 'General Checkup',
    appointment_date,
    time_slot,
    reason: reason || '',
    status: 'Pending Review',
    doctor_notes: '',
    created_at: new Date().toISOString()
  };
  appointments.push(newApt);
  res.json(enrichAppointment(newApt));
});

app.put('/api/appointments/:apt_id/status', (req, res) => {
  const apt = appointments.find(a => a.id === parseInt(req.params.apt_id, 10));
  if (!apt) return res.status(404).json({ detail: 'Appointment not found.' });
  if (req.body.status) apt.status = req.body.status;
  if (req.body.doctor_notes !== undefined) apt.doctor_notes = req.body.doctor_notes;
  res.json(enrichAppointment(apt));
});

app.post('/api/appointments/:apt_id/complete', (req, res) => {
  const apt_id = parseInt(req.params.apt_id, 10);
  const apt = appointments.find(a => a.id === apt_id);
  if (!apt) return res.status(404).json({ detail: 'Appointment not found.' });

  const { diagnosis, medications, treatment_notes = '', follow_up_date = '', consultation_fee = 50.0, treatment_fee = 0.0, medication_fee = 0.0 } = req.body;
  apt.status = 'Completed';
  apt.doctor_notes = `Diagnosis: ${diagnosis} | Prescriptions: ${medications}`;

  if (apt.pet_id) {
    health_records.push({
      id: nextHealthId++,
      pet_id: apt.pet_id,
      checkup_date: apt.appointment_date,
      vaccine_name: 'Routine Consultation',
      vaccination_status: 'Up to Date',
      diagnosis,
      treatment_notes: `Prescribed: ${medications}. ${treatment_notes}`.trim(),
      next_due_date: follow_up_date || '',
      recorded_by: 'Veterinary Doctor',
      created_at: new Date().toISOString()
    });
  }

  const cFee = parseFloat(consultation_fee) || 50.0;
  const tFee = parseFloat(treatment_fee) || 0.0;
  const mFee = parseFloat(medication_fee) || 0.0;
  const total = cFee + tFee + mFee;
  const codeNum = Math.floor(1000 + Math.random() * 9000);

  const invoice = {
    id: nextInvoiceId++,
    invoice_code: `#INV-${codeNum}`,
    appointment_id: apt_id,
    owner_id: apt.owner_id || 3,
    pet_id: apt.pet_id || null,
    consultation_fee: cFee,
    treatment_fee: tFee,
    medication_fee: mFee,
    total_amount: total,
    payment_status: 'Paid',
    payment_method: 'Card at Desk',
    created_at: new Date().toISOString()
  };
  invoices.push(invoice);

  res.json({
    success: true,
    message: 'Consultation completed, medical log saved, and invoice generated!',
    invoice: enrichInvoice(invoice)
  });
});

// Health Records Routes
app.get('/api/health-logs', (req, res) => {
  let list = health_records.map(enrichHealthRecord);
  const { pet_id, vaccination_status } = req.query;
  if (pet_id) {
    list = list.filter(h => h.pet_id === parseInt(pet_id, 10));
  }
  if (vaccination_status && vaccination_status.toLowerCase() !== 'all' && vaccination_status.trim()) {
    list = list.filter(h => h.vaccination_status.toLowerCase() === vaccination_status.trim().toLowerCase());
  }
  list.sort((a, b) => b.id - a.id);
  res.json(list);
});

app.post('/api/health-logs', (req, res) => {
  const { pet_id, checkup_date, vaccine_name = '', vaccination_status = 'Up to Date', diagnosis = '', treatment_notes = '', next_due_date = '', recorded_by = 'Veterinary Staff' } = req.body;
  const newRec = {
    id: nextHealthId++,
    pet_id: parseInt(pet_id, 10),
    checkup_date,
    vaccine_name,
    vaccination_status,
    diagnosis,
    treatment_notes,
    next_due_date,
    recorded_by,
    created_at: new Date().toISOString()
  };
  health_records.push(newRec);

  // Update pet status
  const pet = pets.find(p => p.id === parseInt(pet_id, 10));
  if (pet) {
    if (vaccination_status === 'Due Soon') pet.status = 'Booster Due 🟡';
    else if (vaccination_status === 'Overdue') pet.status = 'Vaccination Overdue 🔴';
    else pet.status = 'Healthy 🟢';
  }

  res.json({ success: true, id: newRec.id, message: 'Health record logged successfully.' });
});

app.delete('/api/health-logs/:record_id', (req, res) => {
  const id = parseInt(req.params.record_id, 10);
  const idx = health_records.findIndex(h => h.id === id);
  if (idx === -1) return res.status(404).json({ detail: 'Record not found.' });
  health_records.splice(idx, 1);
  res.json({ success: true, message: 'Health record deleted.' });
});

// Billing & Invoices Routes
app.get('/api/invoices', (req, res) => {
  let list = invoices.map(enrichInvoice);
  const { query, status, owner_id } = req.query;
  if (status && status.toLowerCase() !== 'all' && status.trim()) {
    list = list.filter(i => i.payment_status.toLowerCase() === status.trim().toLowerCase());
  }
  if (owner_id) {
    list = list.filter(i => i.owner_id === parseInt(owner_id, 10));
  }
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(i =>
      (i.invoice_code && i.invoice_code.toLowerCase().includes(q)) ||
      (i.owner_name && i.owner_name.toLowerCase().includes(q)) ||
      (i.pet_name && i.pet_name.toLowerCase().includes(q))
    );
  }
  list.sort((a, b) => b.id - a.id);
  res.json(list);
});

app.get('/api/invoices/:inv_id', (req, res) => {
  const inv = invoices.find(i => i.id === parseInt(req.params.inv_id, 10));
  if (!inv) return res.status(404).json({ detail: 'Invoice not found.' });
  res.json(enrichInvoice(inv));
});

app.post('/api/invoices', (req, res) => {
  let { appointment_id, owner_id, pet_id, consultation_fee = 0.0, treatment_fee = 0.0, medication_fee = 0.0, payment_status = 'Pending', payment_method = 'Cash at Clinic' } = req.body;
  if (!owner_id && pet_id) {
    const pet = pets.find(p => p.id === parseInt(pet_id, 10));
    if (pet && pet.owner_id) owner_id = pet.owner_id;
  }
  const cFee = parseFloat(consultation_fee) || 0.0;
  const tFee = parseFloat(treatment_fee) || 0.0;
  const mFee = parseFloat(medication_fee) || 0.0;
  const total = cFee + tFee + mFee;
  const codeNum = Math.floor(1000 + Math.random() * 9000);

  const newInv = {
    id: nextInvoiceId++,
    invoice_code: `#INV-${codeNum}`,
    appointment_id: appointment_id ? parseInt(appointment_id, 10) : null,
    owner_id: owner_id ? parseInt(owner_id, 10) : 3,
    pet_id: pet_id ? parseInt(pet_id, 10) : null,
    consultation_fee: cFee,
    treatment_fee: tFee,
    medication_fee: mFee,
    total_amount: total,
    payment_status,
    payment_method,
    created_at: new Date().toISOString()
  };
  invoices.push(newInv);
  res.json(enrichInvoice(newInv));
});

app.put('/api/invoices/:inv_id/status', (req, res) => {
  const inv = invoices.find(i => i.id === parseInt(req.params.inv_id, 10));
  if (!inv) return res.status(404).json({ detail: 'Invoice not found.' });
  inv.payment_status = req.body.payment_status || inv.payment_status;
  res.json(enrichInvoice(inv));
});

// Announcements Routes
app.get('/api/announcements', (req, res) => {
  const list = [...announcements].sort((a, b) => b.id - a.id);
  res.json(list);
});

app.post('/api/announcements', (req, res) => {
  const { title, author = 'Dr. Sarah Jenkins', category = 'General', content } = req.body;
  const newAnn = {
    id: nextAnnId++,
    title: (title || '').trim(),
    author: (author || 'Dr. Sarah Jenkins').trim(),
    category: (category || 'General').trim(),
    content: (content || '').trim(),
    is_published: 1,
    created_at: new Date().toISOString()
  };
  announcements.push(newAnn);
  res.json(newAnn);
});

app.delete('/api/announcements/:ann_id', (req, res) => {
  const id = parseInt(req.params.ann_id, 10);
  const idx = announcements.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ detail: 'Announcement not found.' });
  announcements.splice(idx, 1);
  res.json({ success: true, message: 'Announcement deleted.' });
});

// Wellness Events Routes
app.get('/api/events', (req, res) => {
  res.json(wellness_events);
});

app.get('/api/events/:event_id', (req, res) => {
  const ev = wellness_events.find(e => e.id === parseInt(req.params.event_id, 10));
  if (!ev) return res.status(404).json({ detail: 'Event not found.' });
  res.json(ev);
});

app.post('/api/events/register', (req, res) => {
  const { event_id, owner_name, pet_name, phone, owner_id } = req.body;
  const ev = wellness_events.find(e => e.id === parseInt(event_id, 10));
  if (!ev) return res.status(404).json({ detail: 'Event not found.' });
  if (ev.registered_count >= ev.capacity) {
    return res.status(400).json({ detail: 'This event has reached full capacity.' });
  }
  event_registrations.push({
    id: nextEventRegId++,
    event_id: parseInt(event_id, 10),
    owner_id: owner_id ? parseInt(owner_id, 10) : null,
    owner_name: (owner_name || '').trim(),
    pet_name: (pet_name || '').trim(),
    phone: (phone || '').trim(),
    registered_at: new Date().toISOString()
  });
  ev.registered_count += 1;
  res.json({ success: true, message: `Successfully registered ${pet_name} for the event!` });
});

app.get('/api/events/registrations', (req, res) => {
  let list = event_registrations.map(r => {
    const ev = wellness_events.find(e => e.id === r.event_id);
    return { ...r, event_title: ev ? ev.title : '' };
  });
  if (req.query.event_id) {
    list = list.filter(r => r.event_id === parseInt(req.query.event_id, 10));
  }
  res.json(list);
});

// Dashboard & Reports
app.get('/api/dashboard/stats', (req, res) => {
  const total_pets = pets.length;
  const total_appointments = appointments.length;
  const pending_appointments = appointments.filter(a => a.status === 'Pending Review').length;
  const confirmed_appointments = appointments.filter(a => a.status === 'Confirmed').length;
  const completed_appointments = appointments.filter(a => a.status === 'Completed').length;

  const total_revenue = invoices.filter(i => i.payment_status === 'Paid').reduce((acc, i) => acc + i.total_amount, 0);
  const pending_revenue = invoices.filter(i => i.payment_status === 'Pending').reduce((acc, i) => acc + i.total_amount, 0);
  const due_vaccines = pets.filter(p => (p.status || '').includes('Due') || (p.status || '').includes('Overdue')).length;

  res.json({
    total_pets,
    total_appointments,
    pending_appointments,
    confirmed_appointments,
    completed_appointments,
    total_revenue,
    pending_revenue,
    due_vaccines
  });
});

app.get('/api/reports/summary', (req, res) => {
  const total_pets = pets.length;
  const total_appointments = appointments.length;
  const total_revenue = invoices.filter(i => i.payment_status === 'Paid').reduce((acc, i) => acc + i.total_amount, 0);
  const pending_revenue = invoices.filter(i => i.payment_status === 'Pending').reduce((acc, i) => acc + i.total_amount, 0);

  const appointments_by_status = {};
  for (const a of appointments) {
    appointments_by_status[a.status] = (appointments_by_status[a.status] || 0) + 1;
  }

  const invoices_by_status = {};
  for (const i of invoices) {
    invoices_by_status[i.payment_status] = (invoices_by_status[i.payment_status] || 0) + 1;
  }

  const vaccine_compliance = {};
  for (const h of health_records) {
    vaccine_compliance[h.vaccination_status] = (vaccine_compliance[h.vaccination_status] || 0) + 1;
  }

  const speciesMap = {};
  for (const p of pets) {
    speciesMap[p.species] = (speciesMap[p.species] || 0) + 1;
  }
  const species_distribution = Object.entries(speciesMap).map(([species, count]) => ({ species, count }));

  const paidInvoices = invoices.filter(i => i.payment_status === 'Paid');
  const fee_breakdown = {
    consultation: paidInvoices.reduce((acc, i) => acc + (i.consultation_fee || 0), 0),
    treatment: paidInvoices.reduce((acc, i) => acc + (i.treatment_fee || 0), 0),
    medication: paidInvoices.reduce((acc, i) => acc + (i.medication_fee || 0), 0)
  };

  res.json({
    total_pets,
    total_appointments,
    total_revenue,
    pending_revenue,
    appointments_by_status,
    invoices_by_status,
    vaccine_compliance,
    species_distribution,
    fee_breakdown
  });
});

// ═══════════════════════════════════════════════════════════════════
// STATIC UI SERVING
// ═══════════════════════════════════════════════════════════════════
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VetCare server running on http://0.0.0.0:${PORT}`);
});
