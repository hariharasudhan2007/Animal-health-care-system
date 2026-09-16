from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# --- Auth & User Schemas ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of user")
    email: str = Field(..., min_length=3, max_length=150, description="User email address")
    password: str = Field(..., min_length=4, max_length=100, description="User password")
    role: str = Field(default="owner", description="'owner', 'doctor', or 'staff'")
    phone: Optional[str] = Field(default="", max_length=30)
    address: Optional[str] = Field(default="", max_length=255)

class UserLogin(BaseModel):
    email: str
    password: str
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str] = ""
    address: Optional[str] = ""
    created_at: Optional[str] = None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=4)

# --- Pet Schemas (FR-01) ---
class PetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    species: str = Field(..., min_length=1, max_length=50)
    breed: str = Field(default="Mix", max_length=100)
    age: str = Field(default="1", max_length=20)
    gender: Optional[str] = "Unknown"
    weight: Optional[str] = ""
    medical_history: Optional[str] = ""
    status: Optional[str] = "Healthy 🟢"
    owner_id: Optional[int] = None
    owner_name: Optional[str] = None

class PetUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    weight: Optional[str] = None
    medical_history: Optional[str] = None
    status: Optional[str] = None
    owner_id: Optional[int] = None

# --- Doctor & Appointment Schemas (FR-02) ---
class AppointmentCreate(BaseModel):
    pet_id: Optional[int] = None
    pet_name: Optional[str] = None
    pet_breed: Optional[str] = None
    owner_name: Optional[str] = None
    owner_id: Optional[int] = None
    doctor_id: int
    consultation_type: Optional[str] = "General Checkup"
    appointment_date: str = Field(..., description="YYYY-MM-DD format")
    time_slot: str = Field(..., description="e.g. 10:00 AM")
    reason: Optional[str] = ""

class AppointmentStatusUpdate(BaseModel):
    status: str = Field(..., description="'Pending Review', 'Confirmed', 'Completed', 'Cancelled'")
    doctor_notes: Optional[str] = None

class AppointmentCompleteRequest(BaseModel):
    diagnosis: str = Field(..., min_length=2)
    medications: str = Field(..., min_length=2)
    treatment_notes: Optional[str] = ""
    follow_up_date: Optional[str] = None
    consultation_fee: Optional[float] = Field(default=50.0, ge=0.0)
    treatment_fee: Optional[float] = Field(default=0.0, ge=0.0)
    medication_fee: Optional[float] = Field(default=0.0, ge=0.0)

# --- Health Record Schemas (FR-03) ---
class HealthRecordCreate(BaseModel):
    pet_id: int
    checkup_date: str
    vaccine_name: Optional[str] = ""
    vaccination_status: str = Field(default="Up to Date", description="'Up to Date', 'Due Soon', 'Overdue'")
    diagnosis: Optional[str] = ""
    treatment_notes: Optional[str] = ""
    next_due_date: Optional[str] = ""
    recorded_by: Optional[str] = "Veterinary Staff"

# --- Billing Schemas (FR-04) ---
class InvoiceCreate(BaseModel):
    owner_id: Optional[int] = None
    owner_name: Optional[str] = None
    pet_id: Optional[int] = None
    appointment_id: Optional[int] = None
    consultation_fee: float = Field(default=0.0, ge=0.0)
    treatment_fee: float = Field(default=0.0, ge=0.0)
    medication_fee: float = Field(default=0.0, ge=0.0)
    payment_status: Optional[str] = Field(default="Pending", description="'Pending', 'Paid', 'Cancelled'")
    payment_method: Optional[str] = Field(default="Cash at Clinic")

class InvoiceStatusUpdate(BaseModel):
    payment_status: str = Field(..., description="'Paid', 'Pending', 'Cancelled'")

# --- Announcement Schemas (FR-05) ---
class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    author: Optional[str] = "Dr. Sarah Jenkins"
    category: Optional[str] = "General"
    content: str = Field(..., min_length=5)

# --- Wellness Event Schemas (FR-06) ---
class EventRegistrationCreate(BaseModel):
    event_id: int
    owner_name: str = Field(..., min_length=2)
    pet_name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=5)
    owner_id: Optional[int] = None

# --- Reports & Analytics Schemas ---
class ReportsSummary(BaseModel):
    total_pets: int
    total_appointments: int
    total_revenue: float
    pending_revenue: float
    appointments_by_status: Dict[str, int]
    invoices_by_status: Dict[str, int]
    vaccine_compliance: Dict[str, int]
    species_distribution: List[Dict[str, Any]]
    monthly_revenue: List[Dict[str, Any]]
