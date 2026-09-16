from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional, List
import os

from database import init_db, hash_password, verify_password
import crud
import schemas

app = FastAPI(
    title="VetCare - Animal Health Care Management System",
    description="FastAPI Backend for Veterinary Clinic Operations compliant with SRS.md and REQUIREMENTS.md",
    version="1.0.0"
)

# Enable response compression for sub-second network payloads
app.add_middleware(GZipMiddleware, minimum_size=500)

# Enable CORS for local API access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schemas and seed data on startup
@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "vetcare", "database": "sqlite"}

# ═══════════════════════════════════════════════════════════════════
# AUTH ENDPOINTS
# ═══════════════════════════════════════════════════════════════════
@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register_user(user_in: schemas.UserRegister):
    existing = crud.get_user_by_email(user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    user = crud.create_user(
        name=user_in.name,
        email=user_in.email,
        password=user_in.password,
        role=user_in.role,
        phone=user_in.phone or "",
        address=user_in.address or ""
    )
    return user

@app.post("/api/auth/login")
def login_user(login_in: schemas.UserLogin):
    user = crud.get_user_by_email(login_in.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # Verify hashed password with multiple salt fallback support (NFR-02)
    if not verify_password(user["password_hash"], login_in.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    return {
        "success": True,
        "message": f"Welcome back, {user['name']}!",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "phone": user["phone"],
            "address": user["address"]
        }
    }

@app.get("/api/auth/user/{user_id}", response_model=schemas.UserResponse)
def get_user_profile(user_id: int):
    user = crud.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user

@app.put("/api/auth/profile/{user_id}", response_model=schemas.UserResponse)
def update_profile(user_id: int, profile_in: schemas.ProfileUpdate):
    user = crud.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    updated = crud.update_user_profile(user_id, profile_in.name, profile_in.phone, profile_in.address)
    return updated

@app.post("/api/auth/change-password/{user_id}")
def change_password(user_id: int, pass_in: schemas.PasswordChange):
    success, msg = crud.change_user_password(user_id, pass_in.current_password, pass_in.new_password)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg}

# ═══════════════════════════════════════════════════════════════════
# PET ENDPOINTS (FR-01)
# ═══════════════════════════════════════════════════════════════════
@app.get("/api/pets")
def list_pets(
    query: Optional[str] = Query(None),
    species: Optional[str] = Query(None),
    owner_id: Optional[int] = Query(None)
):
    return crud.get_all_pets(query=query, species=species, owner_id=owner_id)

@app.get("/api/pets/{pet_id}")
def get_pet(pet_id: int):
    pet = crud.get_pet_by_id(pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found.")
    return pet

@app.post("/api/pets")
def add_pet(pet_in: schemas.PetCreate):
    owner_id = pet_in.owner_id
    if not owner_id and pet_in.owner_name:
        owner = crud.get_user_by_email(f"{pet_in.owner_name.lower().replace(' ', '.')}@example.com")
        if not owner:
            owner = crud.create_user(
                name=pet_in.owner_name,
                email=f"{pet_in.owner_name.lower().replace(' ', '.')}@example.com",
                password="password123",
                role="owner"
            )
        owner_id = owner["id"]

    data = pet_in.model_dump()
    data["owner_id"] = owner_id or 3 # fallback to demo owner
    new_pet = crud.create_pet(data)
    return new_pet

@app.put("/api/pets/{pet_id}")
def update_pet(pet_id: int, pet_in: schemas.PetUpdate):
    existing = crud.get_pet_by_id(pet_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Pet not found.")
    updated = crud.update_pet(pet_id, pet_in.model_dump(exclude_unset=True))
    return updated

@app.delete("/api/pets/{pet_id}")
def delete_pet(pet_id: int):
    existing = crud.get_pet_by_id(pet_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Pet not found.")
    crud.delete_pet(pet_id)
    return {"success": True, "message": "Pet deleted successfully."}

# ═══════════════════════════════════════════════════════════════════
# DOCTOR & APPOINTMENT ENDPOINTS (FR-02)
# ═══════════════════════════════════════════════════════════════════
@app.get("/api/doctors")
def list_doctors():
    return crud.get_all_doctors()

@app.get("/api/doctors/{doc_id}")
def get_doctor(doc_id: int):
    doc = crud.get_doctor_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found.")
    return doc

@app.get("/api/appointments")
def list_appointments(
    query: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    doctor_id: Optional[int] = Query(None),
    owner_id: Optional[int] = Query(None)
):
    return crud.get_all_appointments(query=query, status=status, doctor_id=doctor_id, owner_id=owner_id)

@app.get("/api/appointments/{apt_id}")
def get_appointment(apt_id: int):
    apt = crud.get_appointment_by_id(apt_id)
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    return apt

@app.post("/api/appointments")
def book_appointment(appt_in: schemas.AppointmentCreate):
    pet_id = appt_in.pet_id
    owner_id = appt_in.owner_id or 3  # default demo owner

    if pet_id:
        pet = crud.get_pet_by_id(pet_id)
        if pet and pet.get("owner_id"):
            if not appt_in.owner_id:
                owner_id = pet["owner_id"]
        if appt_in.pet_breed and appt_in.pet_breed.strip():
            crud.update_pet(pet_id, {"breed": appt_in.pet_breed.strip()})
    elif appt_in.pet_name:
        all_pets = crud.get_all_pets()
        pet_name_clean = appt_in.pet_name.strip()
        pet_breed_clean = (appt_in.pet_breed or "Mix").strip()
        found_pet = next((p for p in all_pets if p.get("owner_id") == owner_id and p["name"].lower() == pet_name_clean.lower()), None)
        if not found_pet:
            found_pet = next((p for p in all_pets if p["name"].lower() == pet_name_clean.lower()), None)

        if found_pet:
            pet_id = found_pet["id"]
            owner_id = appt_in.owner_id or found_pet["owner_id"] or 3
            if appt_in.pet_breed and appt_in.pet_breed.strip():
                crud.update_pet(pet_id, {"breed": pet_breed_clean})
        else:
            new_p = crud.create_pet({
                "name": pet_name_clean,
                "species": "Dog",
                "breed": pet_breed_clean,
                "age": "2",
                "owner_id": owner_id
            })
            pet_id = new_p["id"]
            owner_id = appt_in.owner_id or 3

    data = appt_in.model_dump()
    data["pet_id"] = pet_id
    data["owner_id"] = owner_id
    created = crud.create_appointment(data)
    return created

@app.put("/api/appointments/{apt_id}/status")
def change_appointment_status(apt_id: int, status_in: schemas.AppointmentStatusUpdate):
    updated = crud.update_appointment_status(apt_id, status_in.status, status_in.doctor_notes)
    if not updated:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    return updated

@app.post("/api/appointments/{apt_id}/complete")
def complete_consultation(apt_id: int, complete_in: schemas.AppointmentCompleteRequest):
    apt = crud.get_appointment_by_id(apt_id)
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    doc_notes = f"Diagnosis: {complete_in.diagnosis} | Prescriptions: {complete_in.medications}"
    crud.update_appointment_status(apt_id, "Completed", doc_notes)

    # 2. Record Health Log (FR-03)
    if apt.get("pet_id"):
        crud.create_health_record({
            "pet_id": apt["pet_id"],
            "checkup_date": apt["appointment_date"],
            "vaccine_name": "Routine Consultation",
            "vaccination_status": "Up to Date",
            "diagnosis": complete_in.diagnosis,
            "treatment_notes": f"Prescribed: {complete_in.medications}. {complete_in.treatment_notes}".strip(),
            "next_due_date": complete_in.follow_up_date or "",
            "recorded_by": apt.get("doctor_name") or "Veterinary Doctor"
        })

    # 3. Generate Billing Invoice (FR-04)
    invoice = crud.create_invoice({
        "appointment_id": apt_id,
        "owner_id": apt.get("owner_id") or 3,
        "pet_id": apt.get("pet_id"),
        "consultation_fee": complete_in.consultation_fee or 50.0,
        "treatment_fee": complete_in.treatment_fee or 0.0,
        "medication_fee": complete_in.medication_fee or 0.0,
        "payment_status": "Paid",
        "payment_method": "Card at Desk"
    })

    return {
        "success": True,
        "message": "Consultation completed, medical log saved, and invoice generated!",
        "invoice": invoice
    }

# ═══════════════════════════════════════════════════════════════════
# HEALTH RECORDS ENDPOINTS (FR-03)
# ═══════════════════════════════════════════════════════════════════
@app.get("/api/health-logs")
def list_health_logs(
    pet_id: Optional[int] = Query(None),
    vaccination_status: Optional[str] = Query(None)
):
    return crud.get_health_records(pet_id=pet_id, vaccination_status=vaccination_status)

@app.post("/api/health-logs")
def add_health_log(log_in: schemas.HealthRecordCreate):
    log_id = crud.create_health_record(log_in.model_dump())
    return {"success": True, "id": log_id, "message": "Health record logged successfully."}

@app.delete("/api/health-logs/{record_id}")
def delete_health_log(record_id: int):
    crud.delete_health_record(record_id)
    return {"success": True, "message": "Health record deleted."}

# ═══════════════════════════════════════════════════════════════════
# BILLING & INVOICES (FR-04)
# ═══════════════════════════════════════════════════════════════════
@app.get("/api/invoices")
def list_invoices(
    query: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    owner_id: Optional[int] = Query(None)
):
    return crud.get_all_invoices(query=query, payment_status=status, owner_id=owner_id)

@app.get("/api/invoices/{inv_id}")
def get_single_invoice(inv_id: int):
    invoice = crud.get_invoice_by_id(inv_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    return invoice

@app.post("/api/invoices")
def create_new_invoice(inv_in: schemas.InvoiceCreate):
    owner_id = inv_in.owner_id
    if not owner_id and inv_in.pet_id:
        pet = crud.get_pet_by_id(inv_in.pet_id)
        if pet and pet.get("owner_id"):
            owner_id = pet["owner_id"]
    
    data = inv_in.model_dump()
    data["owner_id"] = owner_id or 3
    invoice = crud.create_invoice(data)
    return invoice

@app.put("/api/invoices/{inv_id}/status")
def update_invoice_payment(inv_id: int, status_in: schemas.InvoiceStatusUpdate):
    updated = crud.update_invoice_status(inv_id, status_in.payment_status)
    if not updated:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    return updated

# ═══════════════════════════════════════════════════════════════════
# ANNOUNCEMENTS (FR-05)
# ═══════════════════════════════════════════════════════════════════
@app.get("/api/announcements")
def list_announcements():
    return crud.get_all_announcements()

@app.post("/api/announcements")
def add_announcement(ann_in: schemas.AnnouncementCreate):
    created = crud.create_announcement(ann_in.model_dump())
    return created

@app.delete("/api/announcements/{ann_id}")
def remove_announcement(ann_id: int):
    crud.delete_announcement(ann_id)
    return {"success": True, "message": "Announcement deleted."}

# ═══════════════════════════════════════════════════════════════════
# WELLNESS EVENTS (FR-06)
# ═══════════════════════════════════════════════════════════════════
@app.get("/api/events")
def list_events():
    return crud.get_all_wellness_events()

@app.get("/api/events/{event_id}")
def get_event(event_id: int):
    ev = crud.get_event_by_id(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found.")
    return ev

@app.post("/api/events/register")
def register_event(reg_in: schemas.EventRegistrationCreate):
    success, msg = crud.register_for_event(
        event_id=reg_in.event_id,
        owner_name=reg_in.owner_name,
        pet_name=reg_in.pet_name,
        phone=reg_in.phone,
        owner_id=reg_in.owner_id
    )
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": f"Successfully registered {reg_in.pet_name} for the event!"}

@app.get("/api/events/registrations")
def list_event_registrations(event_id: Optional[int] = Query(None)):
    return crud.get_event_registrations(event_id=event_id)

# ═══════════════════════════════════════════════════════════════════
# DASHBOARD & REPORTS (FR-05)
# ═══════════════════════════════════════════════════════════════════
@app.get("/api/dashboard/stats")
def dashboard_stats():
    return crud.get_dashboard_stats()

@app.get("/api/reports/summary")
def reports_summary():
    return crud.get_reports_summary()

# ═══════════════════════════════════════════════════════════════════
# STATIC UI FILE SERVING
# ═══════════════════════════════════════════════════════════════════
BASE_DIR = os.path.dirname(__file__)
app.mount("/assets", StaticFiles(directory=os.path.join(BASE_DIR, "assets")), name="assets")

@app.get("/")
def serve_index():
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

@app.get("/index.html")
def serve_index_html():
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

@app.get("/register-pet.html")
def serve_register_pet():
    return FileResponse(os.path.join(BASE_DIR, "register-pet.html"))

@app.get("/style.css")
def serve_css():
    return FileResponse(os.path.join(BASE_DIR, "style.css"), media_type="text/css")

@app.get("/script.js")
def serve_js():
    return FileResponse(os.path.join(BASE_DIR, "script.js"), media_type="application/javascript")
