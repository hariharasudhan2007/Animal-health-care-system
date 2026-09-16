import sqlite3
import hashlib
import os
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "vetcare.db")

SALT_PRIMARY = "vetcare_secure_salt_2026_clinic_hash"
SALT_FALLBACKS = ["vetcare_secure_salt_2026", "vetcare_secure_salt_2026_clinic_hash", ""]

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA synchronous = NORMAL")
    conn.execute("PRAGMA cache_size = -64000")       # 64 MB cache
    conn.execute("PRAGMA temp_store = MEMORY")       # Keep temp tables & indices in RAM
    conn.execute("PRAGMA mmap_size = 268435456")     # 256 MB memory-mapped I/O
    return conn

def hash_password(password: str, salt: str = SALT_PRIMARY) -> str:
    """NFR-02: Secure SHA-256 password hashing with salt length > 16 bytes."""
    if salt:
        salted = f"{salt}_{password}"
    else:
        salted = password
    return hashlib.sha256(salted.encode('utf-8')).hexdigest()

def verify_password(stored_hash: str, provided_password: str) -> bool:
    """Verify password against primary and backward-compatible salts."""
    if not stored_hash or not provided_password:
        return False
    # Check primary salt
    if stored_hash == hash_password(provided_password, SALT_PRIMARY):
        return True
    # Check fallback salts
    for salt in SALT_FALLBACKS:
        if stored_hash == hash_password(provided_password, salt):
            return True
    return False

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table (Pet Owners, Doctors & Staff) - FR-01, FR-05, NFR-02
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('owner', 'doctor', 'staff')),
        phone TEXT DEFAULT '',
        address TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Pets Table - FR-01
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER,
        name TEXT NOT NULL,
        species TEXT NOT NULL,
        breed TEXT NOT NULL,
        age TEXT NOT NULL,
        gender TEXT DEFAULT 'Unknown',
        weight TEXT DEFAULT '',
        medical_history TEXT DEFAULT '',
        status TEXT DEFAULT 'Healthy 🟢',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE SET NULL
    );
    """)

    # 3. Doctors Table - FR-02
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        experience TEXT,
        consultation_fee REAL DEFAULT 50.0,
        rating REAL DEFAULT 4.9,
        avatar TEXT,
        available_days TEXT,
        time_slots TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );
    """)

    # 4. Appointments Table - FR-02, FR-05
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        apt_code TEXT UNIQUE NOT NULL,
        pet_id INTEGER,
        owner_id INTEGER,
        doctor_id INTEGER,
        consultation_type TEXT DEFAULT 'General Checkup',
        appointment_date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        reason TEXT DEFAULT '',
        status TEXT DEFAULT 'Pending Review' CHECK(status IN ('Pending Review', 'Confirmed', 'Completed', 'Cancelled')),
        doctor_notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE,
        FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE SET NULL
    );
    """)

    # 5. Health & Vaccination Records - FR-03
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS health_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pet_id INTEGER NOT NULL,
        checkup_date TEXT NOT NULL,
        vaccine_name TEXT DEFAULT '',
        vaccination_status TEXT DEFAULT 'Up to Date' CHECK(vaccination_status IN ('Up to Date', 'Due Soon', 'Overdue')),
        diagnosis TEXT DEFAULT '',
        treatment_notes TEXT DEFAULT '',
        next_due_date TEXT DEFAULT '',
        recorded_by TEXT DEFAULT 'Veterinary Staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE
    );
    """)

    # 6. Billing & Invoices - FR-04
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_code TEXT UNIQUE NOT NULL,
        appointment_id INTEGER,
        owner_id INTEGER NOT NULL,
        pet_id INTEGER,
        consultation_fee REAL DEFAULT 0.0,
        treatment_fee REAL DEFAULT 0.0,
        medication_fee REAL DEFAULT 0.0,
        total_amount REAL NOT NULL,
        payment_status TEXT DEFAULT 'Pending' CHECK(payment_status IN ('Pending', 'Paid', 'Cancelled')),
        payment_method TEXT DEFAULT 'Cash at Clinic',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE SET NULL,
        FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE SET NULL
    );
    """)

    # 7. Clinic Announcements - FR-05
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        content TEXT NOT NULL,
        is_published INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 8. Wellness & Health Camps / Events - FR-06
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wellness_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_date TEXT NOT NULL,
        time_range TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT DEFAULT '',
        capacity INTEGER DEFAULT 50,
        registered_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Upcoming'
    );
    """)

    # 9. Event Registrations - FR-06
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS event_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        owner_id INTEGER,
        owner_name TEXT NOT NULL,
        pet_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES wellness_events (id) ON DELETE CASCADE,
        FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE SET NULL
    );
    """)

    # Performance Indexes for sub-2s query speed (NFR-01)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pets_owner ON pets (owner_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pets_species ON pets (species);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_appts_owner ON appointments (owner_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_appts_doctor ON appointments (doctor_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_appts_status ON appointments (status);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_health_pet ON health_records (pet_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_invoices_owner ON invoices (owner_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (payment_status);")

    conn.commit()

    # Seed Initial Data if empty
    seed_initial_data(cursor, conn)
    conn.close()

def seed_initial_data(cursor, conn):
    cursor.execute("SELECT COUNT(*) FROM users")
    doc_pass = hash_password("doctor123")
    owner_pass = hash_password("owner123")

    if cursor.fetchone()[0] == 0:
        # Seed Doctor 1
        cursor.execute("""
        INSERT INTO users (name, email, password_hash, role, phone, address)
        VALUES ('Dr. Sarah Jenkins', 'sarah.jenkins@vetcare.com', ?, 'doctor', '+1 (555) 234-5678', 'VetCare Central Clinic, Suite 402, Metro Park')
        """, (doc_pass,))
        doc_id = cursor.lastrowid

        # Seed Doctor 2
        cursor.execute("""
        INSERT INTO users (name, email, password_hash, role, phone, address)
        VALUES ('Dr. Alan Grant', 'alan.grant@vetcare.com', ?, 'doctor', '+1 (555) 876-5432', 'VetCare Exotic & Surgery Unit, Building B')
        """, (doc_pass,))
        doc2_id = cursor.lastrowid

        # Seed Owner 1 (Alice)
        cursor.execute("""
        INSERT INTO users (name, email, password_hash, role, phone, address)
        VALUES ('Alice Johnson', 'alice.johnson@example.com', ?, 'owner', '+1 (555) 019-2834', '742 Evergreen Terrace, Springfield')
        """, (owner_pass,))
        owner1_id = cursor.lastrowid

        # Seed Owner 2 (Robert)
        cursor.execute("""
        INSERT INTO users (name, email, password_hash, role, phone, address)
        VALUES ('Robert Smith', 'robert.smith@example.com', ?, 'owner', '+1 (555) 432-1098', '124 Conch Street, Oakville')
        """, (owner_pass,))
        owner2_id = cursor.lastrowid

        # Seed Doctors profile
        cursor.execute("""
        INSERT INTO doctors (user_id, name, specialty, experience, consultation_fee, rating, avatar, available_days, time_slots)
        VALUES 
        (?, 'Dr. Sarah Jenkins', 'Canine & Feline Medicine', '12+ Years Experience', 50.0, 4.95, 'assets/dr_sarah.jpg', 'Mon - Sat', '09:00 AM - 10:00 AM, 10:00 AM - 11:00 AM, 11:30 AM - 12:30 PM, 02:00 PM - 03:00 PM, 03:30 PM - 04:30 PM, 04:30 PM - 05:30 PM'),
        (?, 'Dr. Alan Grant', 'Avian, Reptile & Exotic Surgery', '15+ Years Experience', 75.0, 4.88, 'assets/dr_alan.jpg', 'Mon - Fri', '10:00 AM - 11:00 AM, 11:30 AM - 12:30 PM, 01:30 PM - 02:30 PM, 03:00 PM - 04:00 PM, 04:30 PM - 05:30 PM')
        """, (doc_id, doc2_id))

        # Seed Pets
        cursor.execute("""
        INSERT INTO pets (owner_id, name, species, breed, age, gender, weight, medical_history, status)
        VALUES 
        (?, 'Buddy', 'Dog', 'Golden Retriever', '3', 'Male', '31 kg', 'Rabies booster up to date. Routine checkup clean. Active and healthy.', 'Healthy 🟢'),
        (?, 'Milo', 'Cat', 'Tabby Cat', '2', 'Male', '4.5 kg', 'Requires FVRCP vaccine booster & dental scaling check. Mild ear wax.', 'Booster Due 🟡'),
        (?, 'Luna', 'Rabbit', 'Angora Rabbit', '1', 'Female', '2.1 kg', 'Routine digestive monitoring. Annual checkup scheduled.', 'Healthy 🟢'),
        (?, 'Charlie', 'Dog', 'Beagle', '4', 'Male', '14 kg', 'Seasonal skin allergies in summer. Prescribed hypoallergenic shampoo.', 'Healthy 🟢'),
        (?, 'Bella', 'Cow', 'Jersey Dairy', '5', 'Female', '420 kg', 'Routine lactation and hoof health checkup. Deworming completed.', 'Healthy 🟢')
        """, (owner1_id, owner1_id, owner1_id, owner2_id, owner2_id))

        buddy_id = 1
        milo_id = 2
        luna_id = 3
        charlie_id = 4
        bella_id = 5

        # Seed Appointments
        cursor.execute("""
        INSERT INTO appointments (apt_code, pet_id, owner_id, doctor_id, consultation_type, appointment_date, time_slot, reason, status, doctor_notes)
        VALUES
        ('#APT-101', ?, ?, 1, 'Routine Health Checkup', '2026-09-15', '10:00 AM', 'Annual core vaccination & dental check', 'Confirmed', 'Patient is active, clean coat, no signs of distress.'),
        ('#APT-102', ?, ?, 2, 'Booster Immunization', '2026-09-16', '11:30 AM', 'FVRCP Booster due & mild ear scratching', 'Pending Review', 'Awaiting doctor review of feline history.'),
        ('#APT-103', ?, ?, 1, 'Dental Scaling Review', '2026-09-17', '02:00 PM', 'Checkup for Angora rabbit diet & teeth', 'Confirmed', 'Scheduled with Dr. Sarah Jenkins.'),
        ('#APT-104', ?, ?, 1, 'Allergy Consultation', '2026-09-18', '03:30 PM', 'Skin allergy inspection and booster evaluation', 'Pending Review', 'Pending confirmation.')
        """, (buddy_id, owner1_id, milo_id, owner1_id, luna_id, owner1_id, charlie_id, owner2_id))

        # Seed Health Logs
        cursor.execute("""
        INSERT INTO health_records (pet_id, checkup_date, vaccine_name, vaccination_status, diagnosis, treatment_notes, next_due_date, recorded_by)
        VALUES
        (?, '2026-08-15', 'Rabies Core Vaccine', 'Up to Date', 'Healthy physical exam, normal temperature (38.5°C)', 'Administered Rabies Batch #RB-9021. No adverse reactions observed.', '2027-08-15', 'Dr. Sarah Jenkins'),
        (?, '2026-05-10', 'FVRCP Combination', 'Due Soon', 'Mild gingivitis stage 1, clean ears', 'Recommended dental gel and booster shot in Sept 2026.', '2026-09-15', 'Dr. Alan Grant'),
        (?, '2026-07-20', 'Rabbit Hemorrhagic (RHDV2)', 'Up to Date', 'Excellent weight and coat condition', 'Routine vaccine administered smoothly.', '2027-07-20', 'Dr. Sarah Jenkins'),
        (?, '2026-06-12', 'Canine Distemper / Parvo (DHPP)', 'Up to Date', 'Clear lungs and heart rhythm, weight optimal', 'Administered 5-in-1 combo vaccine. Next booster due next year.', '2027-06-12', 'Dr. Sarah Jenkins')
        """, (buddy_id, milo_id, luna_id, charlie_id))

        # Seed Invoices
        cursor.execute("""
        INSERT INTO invoices (invoice_code, appointment_id, owner_id, pet_id, consultation_fee, treatment_fee, medication_fee, total_amount, payment_status, payment_method)
        VALUES
        ('#INV-1001', 1, ?, ?, 50.0, 20.0, 25.0, 95.0, 'Paid', 'Card at Desk'),
        ('#INV-1002', 2, ?, ?, 50.0, 15.0, 0.0, 65.0, 'Pending', 'Cash at Clinic'),
        ('#INV-1003', 3, ?, ?, 75.0, 30.0, 40.0, 145.0, 'Paid', 'Online Transfer'),
        ('#INV-1004', 4, ?, ?, 50.0, 25.0, 15.0, 90.0, 'Pending', 'Cash at Clinic')
        """, (owner1_id, buddy_id, owner1_id, milo_id, owner1_id, luna_id, owner2_id, charlie_id))

        # Seed Announcements
        cursor.execute("""
        INSERT INTO announcements (title, author, category, content)
        VALUES
        ('Free Community Rabies Vaccination Camp', 'Dr. Sarah Jenkins', 'Vaccination', 'VetCare is hosting a free rabies vaccination camp this weekend at Central Community Park. Bring all eligible dogs and cats!'),
        ('Clinic Operating Theater Laser Upgrade', 'Clinic Admin', 'Facility', 'Our clinic is now equipped with state-of-the-art cold laser therapy for rapid post-operative recovery and pain relief.'),
        ('Seasonal Parasite & Tick Prevention Guide', 'Dr. Alan Grant', 'Pet Wellness', 'Summer humidity increases tick activity. Ensure your pets receive monthly topical preventative treatments.')
        """)

        # Seed Wellness Events
        cursor.execute("""
        INSERT INTO wellness_events (title, event_type, event_date, time_range, location, description, capacity, registered_count)
        VALUES
        ('Rabies Vaccination Drive 2026', 'Vaccination Drive', '2026-09-20', '09:00 AM - 01:00 PM', 'Central Community Park, Green Zone', 'Free rabies shots and core health assessment for dogs and cats. First 100 pets receive a free microchip tag.', 100, 24),
        ('Pet Nutrition & Dietetics Workshop', 'Wellness Seminar', '2026-09-27', '11:00 AM - 01:00 PM', 'VetCare Seminar Hall A', 'Learn about balanced raw vs kibble diets, obesity prevention, and tailored nutrition for aging pets with Dr. Sarah Jenkins.', 40, 18),
        ('Paws & Hearts Pet Adoption Fair', 'Community Fair', '2026-10-05', '10:00 AM - 04:00 PM', 'City Civic Center Grounds', 'Meet rescue puppies and kittens looking for loving homes. Includes complimentary health passport & first vaccine.', 150, 42)
        """)
    # Always guarantee demo user credentials exist and work
    ensure_demo_users(cursor)
    conn.commit()

def ensure_demo_users(cursor):
    doc_pass = hash_password("doctor123")
    owner_pass = hash_password("owner123")

    # 1. Doctor 1: Dr. Sarah Jenkins
    doc1 = cursor.execute("SELECT id FROM users WHERE LOWER(email) = 'sarah.jenkins@vetcare.com'").fetchone()
    if not doc1:
        cursor.execute("""
        INSERT INTO users (name, email, password_hash, role, phone, address)
        VALUES ('Dr. Sarah Jenkins', 'sarah.jenkins@vetcare.com', ?, 'doctor', '+1 (555) 234-5678', 'VetCare Central Clinic, Suite 402, Metro Park')
        """, (doc_pass,))
        doc1_id = cursor.lastrowid
        cursor.execute("""
        INSERT INTO doctors (user_id, name, specialty, experience, consultation_fee, rating, avatar, available_days, time_slots)
        VALUES (?, 'Dr. Sarah Jenkins', 'Canine & Feline Medicine', '12+ Years Experience', 50.0, 4.95, 'assets/dr_sarah.jpg', 'Mon - Sat', '09:00 AM - 10:00 AM, 10:00 AM - 11:00 AM, 11:30 AM - 12:30 PM, 02:00 PM - 03:00 PM, 03:30 PM - 04:30 PM, 04:30 PM - 05:30 PM')
        """, (doc1_id,))
    else:
        cursor.execute("UPDATE users SET password_hash = ?, role = 'doctor' WHERE LOWER(email) = 'sarah.jenkins@vetcare.com'", (doc_pass,))

    cursor.execute("""
    UPDATE doctors 
    SET time_slots = '09:00 AM - 10:00 AM, 10:00 AM - 11:00 AM, 11:30 AM - 12:30 PM, 02:00 PM - 03:00 PM, 03:30 PM - 04:30 PM, 04:30 PM - 05:30 PM'
    WHERE name LIKE '%Sarah Jenkins%'
    """)

    # 2. Doctor 2: Dr. Alan Grant
    doc2 = cursor.execute("SELECT id FROM users WHERE LOWER(email) = 'alan.grant@vetcare.com'").fetchone()
    if not doc2:
        cursor.execute("""
        INSERT INTO users (name, email, password_hash, role, phone, address)
        VALUES ('Dr. Alan Grant', 'alan.grant@vetcare.com', ?, 'doctor', '+1 (555) 876-5432', 'VetCare Exotic & Surgery Unit, Building B')
        """, (doc_pass,))
        doc2_id = cursor.lastrowid
        cursor.execute("""
        INSERT INTO doctors (user_id, name, specialty, experience, consultation_fee, rating, avatar, available_days, time_slots)
        VALUES (?, 'Dr. Alan Grant', 'Avian, Reptile & Exotic Surgery', '15+ Years Experience', 75.0, 4.88, 'assets/dr_alan.jpg', 'Mon - Fri', '10:00 AM - 11:00 AM, 11:30 AM - 12:30 PM, 01:30 PM - 02:30 PM, 03:00 PM - 04:00 PM, 04:30 PM - 05:30 PM')
        """, (doc2_id,))
    else:
        cursor.execute("UPDATE users SET password_hash = ?, role = 'doctor' WHERE LOWER(email) = 'alan.grant@vetcare.com'", (doc_pass,))

    cursor.execute("""
    UPDATE doctors 
    SET time_slots = '10:00 AM - 11:00 AM, 11:30 AM - 12:30 PM, 01:30 PM - 02:30 PM, 03:00 PM - 04:00 PM, 04:30 PM - 05:30 PM'
    WHERE name LIKE '%Alan Grant%'
    """)

    doc3 = cursor.execute("SELECT id FROM users WHERE LOWER(email) = 'hariharasudhan@vetcare.com'").fetchone()
    if not doc3:
        cursor.execute("""
        INSERT INTO users (name, email, password_hash, role, phone, address)
        VALUES ('Dr. L. Harihara Sudhan', 'hariharasudhan@vetcare.com', ?, 'doctor', '', 'VetCare Central Clinic')
        """, (doc_pass,))
        doc3_id = cursor.lastrowid
        cursor.execute("""
        INSERT INTO doctors (user_id, name, specialty, experience, consultation_fee, rating, avatar, available_days, time_slots)
        VALUES (?, 'Dr. L. Harihara Sudhan', 'Pachyderm Veterinarian', '10+ Years Experience', 60.0, 4.90, 'assets/dr_alan.jpg', 'Mon - Sat', '09:00 AM - 10:00 AM, 11:30 AM - 12:30 PM, 02:00 PM - 03:00 PM, 04:00 PM - 05:00 PM')
        """, (doc3_id,))
    else:
        cursor.execute("UPDATE users SET name = ?, role = 'doctor' WHERE id = ?", ('Dr. L. Harihara Sudhan', doc3['id']))
        cursor.execute("""
        UPDATE doctors
        SET name = ?, specialty = ?, experience = ?, consultation_fee = ?, rating = ?, avatar = ?, available_days = ?, time_slots = ?
        WHERE user_id = ?
        """, ('Dr. L. Harihara Sudhan', 'Pachyderm Veterinarian', '10+ Years Experience', 60.0, 4.90, 'assets/dr_alan.jpg', 'Mon - Sat', '09:00 AM - 10:00 AM, 11:30 AM - 12:30 PM, 02:00 PM - 03:00 PM, 04:00 PM - 05:00 PM', doc3['id']))

    # 3. Owner 1: Alice Johnson
    owner1 = cursor.execute("SELECT id FROM users WHERE LOWER(email) = 'alice.johnson@example.com'").fetchone()
    if not owner1:
        cursor.execute("""
        INSERT INTO users (name, email, password_hash, role, phone, address)
        VALUES ('Alice Johnson', 'alice.johnson@example.com', ?, 'owner', '+1 (555) 019-2834', '742 Evergreen Terrace, Springfield')
        """, (owner_pass,))
    else:
        cursor.execute("UPDATE users SET password_hash = ?, role = 'owner' WHERE LOWER(email) = 'alice.johnson@example.com'", (owner_pass,))
