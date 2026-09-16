from database import get_db_connection, hash_password, verify_password
from typing import List, Optional, Dict, Any
import random

# --- Auth Queries ---
def get_user_by_email(email: str):
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),)).fetchone()
    conn.close()
    return dict(user) if user else None

def get_user_by_id(user_id: int):
    conn = get_db_connection()
    user = conn.execute("SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(user) if user else None

def create_user(name: str, email: str, password: str, role: str = "owner", phone: str = "", address: str = ""):
    conn = get_db_connection()
    pwd_hash = hash_password(password)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO users (name, email, password_hash, role, phone, address)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (name.strip(), email.strip().lower(), pwd_hash, role, phone.strip(), address.strip()))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return get_user_by_id(user_id)

def update_user_profile(user_id: int, name: Optional[str] = None, phone: Optional[str] = None, address: Optional[str] = None):
    conn = get_db_connection()
    fields = []
    values = []
    if name is not None:
        fields.append("name = ?")
        values.append(name.strip())
    if phone is not None:
        fields.append("phone = ?")
        values.append(phone.strip())
    if address is not None:
        fields.append("address = ?")
        values.append(address.strip())
    
    if fields:
        values.append(user_id)
        conn.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()
    conn.close()
    return get_user_by_id(user_id)

def change_user_password(user_id: int, old_password: str, new_password: str):
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        conn.close()
        return False, "User not found."
    if not verify_password(user["password_hash"], old_password):
        conn.close()
        return False, "Current password is incorrect."
    
    new_hash = hash_password(new_password)
    conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
    conn.commit()
    conn.close()
    return True, "Password updated successfully."

# --- Pet CRUD Queries (FR-01) ---
def get_all_pets(query: Optional[str] = None, species: Optional[str] = None, owner_id: Optional[int] = None):
    conn = get_db_connection()
    sql = """
    SELECT p.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
    FROM pets p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE 1=1
    """
    params = []
    if owner_id:
        sql += " AND p.owner_id = ?"
        params.append(owner_id)
    if species and species.lower() != "all" and species.strip():
        sql += " AND LOWER(p.species) = LOWER(?)"
        params.append(species.strip())
    if query and query.strip():
        sql += " AND (LOWER(p.name) LIKE ? OR LOWER(p.breed) LIKE ? OR LOWER(u.name) LIKE ? OR LOWER(p.species) LIKE ?)"
        q_param = f"%{query.strip().lower()}%"
        params.extend([q_param, q_param, q_param, q_param])
    
    sql += " ORDER BY p.id DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_pet_by_id(pet_id: int):
    conn = get_db_connection()
    row = conn.execute("""
    SELECT p.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
    FROM pets p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE p.id = ?
    """, (pet_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def create_pet(data: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO pets (owner_id, name, species, breed, age, gender, weight, medical_history, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("owner_id"),
        data.get("name", "").strip(),
        data.get("species", "").strip(),
        data.get("breed", "Mix").strip(),
        str(data.get("age", "1")).strip(),
        data.get("gender", "Unknown"),
        data.get("weight", "").strip(),
        data.get("medical_history", "").strip(),
        data.get("status", "Healthy 🟢")
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return get_pet_by_id(new_id)

def update_pet(pet_id: int, data: dict):
    conn = get_db_connection()
    fields = []
    values = []
    for k in ["name", "species", "breed", "age", "gender", "weight", "medical_history", "status", "owner_id"]:
        if k in data and data[k] is not None:
            fields.append(f"{k} = ?")
            values.append(str(data[k]).strip() if k == "age" else (data[k].strip() if isinstance(data[k], str) else data[k]))
    
    if fields:
        values.append(pet_id)
        conn.execute(f"UPDATE pets SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()
    conn.close()
    return get_pet_by_id(pet_id)

def delete_pet(pet_id: int):
    conn = get_db_connection()
    conn.execute("DELETE FROM pets WHERE id = ?", (pet_id,))
    conn.commit()
    conn.close()
    return True

# --- Doctor & Appointment Queries (FR-02) ---
def get_all_doctors():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM doctors ORDER BY id ASC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_doctor_by_id(doc_id: int):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM doctors WHERE id = ?", (doc_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def get_all_appointments(query: Optional[str] = None, status: Optional[str] = None, doctor_id: Optional[int] = None, owner_id: Optional[int] = None):
    conn = get_db_connection()
    sql = """
    SELECT a.*, p.name as pet_name, p.species, p.breed, u.name as owner_name, u.phone as owner_phone, d.name as doctor_name, d.specialty as doctor_specialty
    FROM appointments a
    LEFT JOIN pets p ON a.pet_id = p.id
    LEFT JOIN users u ON a.owner_id = u.id
    LEFT JOIN doctors d ON a.doctor_id = d.id
    WHERE 1=1
    """
    params = []
    if status and status.lower() != "all" and status.strip():
        sql += " AND a.status = ?"
        params.append(status.strip())
    if doctor_id:
        sql += " AND a.doctor_id = ?"
        params.append(doctor_id)
    if owner_id:
        sql += " AND a.owner_id = ?"
        params.append(owner_id)
    if query and query.strip():
        sql += " AND (LOWER(a.apt_code) LIKE ? OR LOWER(p.name) LIKE ? OR LOWER(u.name) LIKE ? OR LOWER(d.name) LIKE ? OR LOWER(a.consultation_type) LIKE ?)"
        qp = f"%{query.strip().lower()}%"
        params.extend([qp, qp, qp, qp, qp])
    
    sql += " ORDER BY a.id DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_appointment_by_id(apt_id: int):
    conn = get_db_connection()
    row = conn.execute("""
    SELECT a.*, p.name as pet_name, p.species, p.breed, u.name as owner_name, u.phone as owner_phone, d.name as doctor_name, d.specialty as doctor_specialty
    FROM appointments a
    LEFT JOIN pets p ON a.pet_id = p.id
    LEFT JOIN users u ON a.owner_id = u.id
    LEFT JOIN doctors d ON a.doctor_id = d.id
    WHERE a.id = ?
    """, (apt_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def create_appointment(data: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    code_num = random.randint(105, 9999)
    apt_code = f"#APT-{code_num}"

    cursor.execute("""
    INSERT INTO appointments (apt_code, pet_id, owner_id, doctor_id, consultation_type, appointment_date, time_slot, reason, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending Review')
    """, (
        apt_code,
        data.get("pet_id"),
        data.get("owner_id"),
        data.get("doctor_id"),
        data.get("consultation_type", "General Checkup"),
        data.get("appointment_date"),
        data.get("time_slot"),
        data.get("reason", "")
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return get_appointment_by_id(new_id)

def update_appointment_status(apt_id: int, status: str, doctor_notes: Optional[str] = None):
    conn = get_db_connection()
    if doctor_notes is not None:
        conn.execute("UPDATE appointments SET status = ?, doctor_notes = ? WHERE id = ?", (status, doctor_notes, apt_id))
    else:
        conn.execute("UPDATE appointments SET status = ? WHERE id = ?", (status, apt_id))
    conn.commit()
    conn.close()
    return get_appointment_by_id(apt_id)

# --- Health Record Queries (FR-03) ---
def get_health_records(pet_id: Optional[int] = None, vaccination_status: Optional[str] = None):
    conn = get_db_connection()
    sql = """
    SELECT h.*, p.name as pet_name, p.species, p.breed, u.name as owner_name
    FROM health_records h
    LEFT JOIN pets p ON h.pet_id = p.id
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE 1=1
    """
    params = []
    if pet_id:
        sql += " AND h.pet_id = ?"
        params.append(pet_id)
    if vaccination_status and vaccination_status.lower() != "all" and vaccination_status.strip():
        sql += " AND h.vaccination_status = ?"
        params.append(vaccination_status.strip())
    sql += " ORDER BY h.id DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create_health_record(data: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO health_records (pet_id, checkup_date, vaccine_name, vaccination_status, diagnosis, treatment_notes, next_due_date, recorded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("pet_id"),
        data.get("checkup_date"),
        data.get("vaccine_name", ""),
        data.get("vaccination_status", "Up to Date"),
        data.get("diagnosis", ""),
        data.get("treatment_notes", ""),
        data.get("next_due_date", ""),
        data.get("recorded_by", "Veterinary Staff")
    ))
    
    # Also update pet's status and medical history
    status_str = "Healthy 🟢"
    v_stat = data.get("vaccination_status", "Up to Date")
    if v_stat == "Due Soon":
        status_str = "Booster Due 🟡"
    elif v_stat == "Overdue":
        status_str = "Vaccination Overdue 🔴"
    
    conn.execute("UPDATE pets SET status = ? WHERE id = ?", (status_str, data.get("pet_id")))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return new_id

def delete_health_record(record_id: int):
    conn = get_db_connection()
    conn.execute("DELETE FROM health_records WHERE id = ?", (record_id,))
    conn.commit()
    conn.close()
    return True

# --- Billing & Invoices (FR-04) ---
def get_all_invoices(query: Optional[str] = None, payment_status: Optional[str] = None, owner_id: Optional[int] = None):
    conn = get_db_connection()
    sql = """
    SELECT i.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email, p.name as pet_name, p.species as pet_species, a.apt_code, a.consultation_type
    FROM invoices i
    LEFT JOIN users u ON i.owner_id = u.id
    LEFT JOIN pets p ON i.pet_id = p.id
    LEFT JOIN appointments a ON i.appointment_id = a.id
    WHERE 1=1
    """
    params = []
    if payment_status and payment_status.lower() != "all" and payment_status.strip():
        sql += " AND i.payment_status = ?"
        params.append(payment_status.strip())
    if owner_id:
        sql += " AND i.owner_id = ?"
        params.append(owner_id)
    if query and query.strip():
        sql += " AND (LOWER(i.invoice_code) LIKE ? OR LOWER(u.name) LIKE ? OR LOWER(p.name) LIKE ?)"
        qp = f"%{query.strip().lower()}%"
        params.extend([qp, qp, qp])
    
    sql += " ORDER BY i.id DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_invoice_by_id(inv_id: int):
    conn = get_db_connection()
    row = conn.execute("""
    SELECT i.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email, u.address as owner_address, p.name as pet_name, p.species as pet_species, p.breed as pet_breed, a.apt_code, a.consultation_type, a.appointment_date
    FROM invoices i
    LEFT JOIN users u ON i.owner_id = u.id
    LEFT JOIN pets p ON i.pet_id = p.id
    LEFT JOIN appointments a ON i.appointment_id = a.id
    WHERE i.id = ?
    """, (inv_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def create_invoice(data: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    code_num = random.randint(1005, 9999)
    inv_code = f"#INV-{code_num}"
    
    consult = max(0.0, float(data.get("consultation_fee", 0.0)))
    treatment = max(0.0, float(data.get("treatment_fee", 0.0)))
    med = max(0.0, float(data.get("medication_fee", 0.0)))
    total = consult + treatment + med

    cursor.execute("""
    INSERT INTO invoices (invoice_code, appointment_id, owner_id, pet_id, consultation_fee, treatment_fee, medication_fee, total_amount, payment_status, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        inv_code,
        data.get("appointment_id"),
        data.get("owner_id"),
        data.get("pet_id"),
        consult,
        treatment,
        med,
        total,
        data.get("payment_status", "Pending"),
        data.get("payment_method", "Cash at Clinic")
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return get_invoice_by_id(new_id)

def update_invoice_status(inv_id: int, status: str):
    conn = get_db_connection()
    conn.execute("UPDATE invoices SET payment_status = ? WHERE id = ?", (status, inv_id))
    conn.commit()
    conn.close()
    return get_invoice_by_id(inv_id)

# --- Announcements (FR-05) ---
def get_all_announcements():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM announcements ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create_announcement(data: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO announcements (title, author, category, content)
    VALUES (?, ?, ?, ?)
    """, (
        data.get("title", "").strip(),
        data.get("author", "Dr. Sarah Jenkins").strip(),
        data.get("category", "General").strip(),
        data.get("content", "").strip()
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    anns = get_all_announcements()
    return next((a for a in anns if a["id"] == new_id), None)

def delete_announcement(ann_id: int):
    conn = get_db_connection()
    conn.execute("DELETE FROM announcements WHERE id = ?", (ann_id,))
    conn.commit()
    conn.close()
    return True

# --- Wellness Events (FR-06) ---
def get_all_wellness_events():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM wellness_events ORDER BY id ASC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_event_by_id(event_id: int):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM wellness_events WHERE id = ?", (event_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def register_for_event(event_id: int, owner_name: str, pet_name: str, phone: str, owner_id: Optional[int] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check event capacity
    ev = conn.execute("SELECT capacity, registered_count FROM wellness_events WHERE id = ?", (event_id,)).fetchone()
    if ev and ev["registered_count"] >= ev["capacity"]:
        conn.close()
        return False, "This event has reached full capacity."

    cursor.execute("""
    INSERT INTO event_registrations (event_id, owner_id, owner_name, pet_name, phone)
    VALUES (?, ?, ?, ?, ?)
    """, (event_id, owner_id, owner_name.strip(), pet_name.strip(), phone.strip()))
    
    cursor.execute("UPDATE wellness_events SET registered_count = registered_count + 1 WHERE id = ?", (event_id,))
    conn.commit()
    conn.close()
    return True, "Registered successfully."

def get_event_registrations(event_id: Optional[int] = None):
    conn = get_db_connection()
    sql = "SELECT r.*, e.title as event_title FROM event_registrations r LEFT JOIN wellness_events e ON r.event_id = e.id"
    params = []
    if event_id:
        sql += " WHERE r.event_id = ?"
        params.append(event_id)
    sql += " ORDER BY r.id DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# --- Dashboard Overview Stats (FR-05) ---
def get_dashboard_stats():
    conn = get_db_connection()
    total_pets = conn.execute("SELECT COUNT(*) FROM pets").fetchone()[0]
    total_appts = conn.execute("SELECT COUNT(*) FROM appointments").fetchone()[0]
    pending_appts = conn.execute("SELECT COUNT(*) FROM appointments WHERE status = 'Pending Review'").fetchone()[0]
    confirmed_appts = conn.execute("SELECT COUNT(*) FROM appointments WHERE status = 'Confirmed'").fetchone()[0]
    completed_appts = conn.execute("SELECT COUNT(*) FROM appointments WHERE status = 'Completed'").fetchone()[0]
    
    total_revenue = conn.execute("SELECT COALESCE(SUM(total_amount), 0.0) FROM invoices WHERE payment_status = 'Paid'").fetchone()[0]
    pending_revenue = conn.execute("SELECT COALESCE(SUM(total_amount), 0.0) FROM invoices WHERE payment_status = 'Pending'").fetchone()[0]
    
    due_vaccines = conn.execute("SELECT COUNT(*) FROM pets WHERE status LIKE '%Due%' OR status LIKE '%Overdue%'").fetchone()[0]
    conn.close()
    
    return {
        "total_pets": total_pets,
        "total_appointments": total_appts,
        "pending_appointments": pending_appts,
        "confirmed_appointments": confirmed_appts,
        "completed_appointments": completed_appts,
        "total_revenue": float(total_revenue),
        "pending_revenue": float(pending_revenue),
        "due_vaccines": due_vaccines
    }

# --- Reports & Analytics Aggregations ---
def get_reports_summary():
    conn = get_db_connection()
    
    # 1. Total counts
    total_pets = conn.execute("SELECT COUNT(*) FROM pets").fetchone()[0]
    total_appts = conn.execute("SELECT COUNT(*) FROM appointments").fetchone()[0]
    total_revenue = conn.execute("SELECT COALESCE(SUM(total_amount), 0.0) FROM invoices WHERE payment_status = 'Paid'").fetchone()[0]
    pending_revenue = conn.execute("SELECT COALESCE(SUM(total_amount), 0.0) FROM invoices WHERE payment_status = 'Pending'").fetchone()[0]

    # 2. Appointments by status
    appt_status_rows = conn.execute("SELECT status, COUNT(*) as cnt FROM appointments GROUP BY status").fetchall()
    appointments_by_status = {r["status"]: r["cnt"] for r in appt_status_rows}

    # 3. Invoices by status
    inv_status_rows = conn.execute("SELECT payment_status, COUNT(*) as cnt FROM invoices GROUP BY payment_status").fetchall()
    invoices_by_status = {r["payment_status"]: r["cnt"] for r in inv_status_rows}

    # 4. Vaccine compliance
    vax_rows = conn.execute("SELECT vaccination_status, COUNT(*) as cnt FROM health_records GROUP BY vaccination_status").fetchall()
    vaccine_compliance = {r["vaccination_status"]: r["cnt"] for r in vax_rows}

    # 5. Species distribution
    species_rows = conn.execute("SELECT species, COUNT(*) as count FROM pets GROUP BY species ORDER BY count DESC").fetchall()
    species_distribution = [{"species": r["species"], "count": r["count"]} for r in species_rows]

    # 6. Monthly revenue / fee distribution
    fee_breakdown = conn.execute("""
    SELECT 
        COALESCE(SUM(consultation_fee), 0.0) as total_consult,
        COALESCE(SUM(treatment_fee), 0.0) as total_treatment,
        COALESCE(SUM(medication_fee), 0.0) as total_medication
    FROM invoices WHERE payment_status = 'Paid'
    """).fetchone()

    conn.close()

    return {
        "total_pets": total_pets,
        "total_appointments": total_appts,
        "total_revenue": float(total_revenue),
        "pending_revenue": float(pending_revenue),
        "appointments_by_status": appointments_by_status,
        "invoices_by_status": invoices_by_status,
        "vaccine_compliance": vaccine_compliance,
        "species_distribution": species_distribution,
        "fee_breakdown": {
            "consultation": float(fee_breakdown["total_consult"]),
            "treatment": float(fee_breakdown["total_treatment"]),
            "medication": float(fee_breakdown["total_medication"])
        }
    }
