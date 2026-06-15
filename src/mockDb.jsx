// Mock Firestore Database implementation using localStorage
// + Background sync to MongoDB backend

const API_BASE = "http://localhost:5000/api";

// ---- Background sync helpers (fire-and-forget) ----
const syncToBackend = (method, collection, body) => {
  try {
    fetch(`${API_BASE}/${collection}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).catch(() => {
      // Silently fail — backend might not be running
    });
  } catch (e) {
    // ignore
  }
};

const syncInsert = (collection, doc) => syncToBackend("POST", collection, doc);

const SEED_DATA = {
  clinics: [
    {
      id: "clinic_01",
      Clinic_name: "Acne Clinic & Salon",
      Mobile_number: "9876543210",
      CityId: "city_bangalore",
      areaId: "area_koramangala",
      StateId: "state_karnataka",
      status: "AA"
    }
  ],
  branches: [
    {
      branchId: "branch_01",
      Clinic_id: "clinic_01",
      name: "Acne & Style Koramangala",
      stateId: "state_karnataka",
      cityId: "city_bangalore",
      areaId: "area_koramangala",
      Mobile_Number: 9876545678,
      Timings_from: "9:00 A.M",
      Timings_to: "10:00 P.M",
      Pan_Number: "PAhgsf57832",
      About_branch: "Premium hair care, skin treatments and clinical acne therapies in Koramangala.",
      Status: "AA"
    },
    {
      branchId: "branch_02",
      Clinic_id: "clinic_01",
      name: "Bounce Stylist League HSR",
      stateId: "state_karnataka",
      cityId: "city_bangalore",
      areaId: "area_hsr",
      Mobile_Number: 9876545679,
      Timings_from: "9:00 A.M",
      Timings_to: "10:00 P.M",
      Pan_Number: "PAhgsf57833",
      About_branch: "High-end luxury salon experience specializing in hair design and coloring.",
      Status: "AA"
    }
  ],
  staffs: [
    {
      StaffId: "stylist_01",
      branchId: "branch_01",
      name: "Ruchitha",
      mobile_number: 8765456789,
      qualification: "M.B.B.S / Hair Styling Master",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
      DesignationId: ["doctor", "stylist"],
      specializationId: ["Acne treatment", "Hair Coloring", "French cut"],
      years_of_experience: 5,
      rating: 4.8,
      status: "AA",
      certifications: ["Acne Therapy certified (USA)", "L'Oreal Professional Colorist Master", "Toni & Guy Advanced Styling"],
      gallery: [
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1605497746444-052d5b6bc34c?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400"
      ]
    },
    {
      StaffId: "stylist_02",
      branchId: "branch_02",
      name: "Putin",
      mobile_number: 8765456790,
      qualification: "Hair Design Expert",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
      DesignationId: ["stylist"],
      specializationId: ["French beard trim", "Hair dyeing", "Facial"],
      years_of_experience: 4,
      rating: 4.6,
      status: "AA",
      certifications: ["Schwarzkopf Master Sculptor", "Nivea Skin Masterclass"],
      gallery: [
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=400"
      ]
    },
    {
      StaffId: "stylist_03",
      branchId: "branch_02",
      name: "Adonis",
      mobile_number: 8765456791,
      qualification: "Skin & Beard Maestro",
      photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
      DesignationId: ["stylist"],
      specializationId: ["Beard styling", "Body care massage", "Head spa"],
      years_of_experience: 6,
      rating: 4.9,
      status: "AA",
      certifications: ["Barber Association Gold Seal", "Indian Spa Academy Specialist"],
      gallery: [
        "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=400"
      ]
    }
  ],
  patient: [],
  services: [
    { id: "service_01", name: "Hair dye", duration: "1 hour", price: 200, stylistId: "stylist_01" },
    { id: "service_02", name: "Facial", duration: "50 min", price: 150, stylistId: "stylist_02" },
    { id: "service_03", name: "Skin care", duration: "45 min", price: 400, stylistId: "stylist_01" },
    { id: "service_04", name: "Hair cut", duration: "1 hour", price: 600, stylistId: "stylist_03" }
  ],
  payments: [],
  patients: [
    {
      patient_id: "patient_default",
      clinic_id: "clinic_01",
      branch_id: "branch_01",
      name: "Rachana",
      dob: "1998-04-12",
      gender: "female",
      mobile_number: "9867543456",
      status: "AA"
    }
  ],
  customer: [],
  appointment: [],
  appointments: []
};

// Initialize DB if not present — also seed MongoDB backend
export const initDb = () => {
  Object.keys(SEED_DATA).forEach((key) => {
    if (!localStorage.getItem(`db_${key}`)) {
      localStorage.setItem(`db_${key}`, JSON.stringify(SEED_DATA[key]));
      // Also seed the backend with initial data
      SEED_DATA[key].forEach((doc) => {
        syncInsert(key, doc);
      });
    }
  });
};

export const getCollection = (collectionName) => {
  // Backward compatibility: treat 'appointment' as 'appointments'
  if (collectionName === "appointment") {
    collectionName = "appointments";
  }
  initDb();
  const data = localStorage.getItem(`db_${collectionName}`);
  return data ? JSON.parse(data) : [];
};

export const saveCollection = (collectionName, data) => {
  if (collectionName === "appointment") {
    collectionName = "appointments";
  }
  localStorage.setItem(`db_${collectionName}`, JSON.stringify(data));
  // Dispatch a custom event to notify components about database updates
  window.dispatchEvent(new CustomEvent("mock-db-updated", { detail: { collectionName } }));
};

export const queryDocs = (collectionName, filterFn) => {
  const collection = getCollection(collectionName);
  return collection.filter(filterFn);
};

export const getDoc = (collectionName, docId, keyName = "id") => {
  // Backward compatibility for 'appointment' collection
  if (collectionName === "appointment") {
    collectionName = "appointments";
  }
  const collection = getCollection(collectionName);
  return collection.find((doc) => {
    if (collectionName === "appointments" && (keyName === "id" || keyName === "appointmentId")) {
      return doc.id === docId || doc.appointmentId === docId;
    }
    return doc[keyName] === docId;
  });
};

export const insertDoc = (collectionName, doc) => {
  if (collectionName === "appointment") {
    collectionName = "appointments";
  }
  const collection = getCollection(collectionName);
  // Generate random id if not present
  const docId = doc.id || doc.customer_id || doc.patient_id || doc.appointmentId || Math.random().toString(36).substring(2, 11);
  const newDoc = {
    id: docId,
    Created_at: new Date().toISOString(),
    Created_by: "system_user",
    Modified_at: new Date().toISOString(),
    Modified_by: "system_user",
    ...doc
  };
  
  // Custom mapping for primary keys based on table requirements
  if (collectionName === "customer" && !newDoc.Customer_id) {
    newDoc.Customer_id = docId;
  }
  if ((collectionName === "appointment" || collectionName === "appointments") && !newDoc.Customer_id) {
    newDoc.Customer_id = docId;
  }
  if ((collectionName === "appointment" || collectionName === "appointments") && !newDoc.appointmentId) {
    newDoc.appointmentId = docId;
  }
  if ((collectionName === "patients" || collectionName === "patient") && !newDoc.patient_id) {
    newDoc.patient_id = docId;
  }

  collection.push(newDoc);
  saveCollection(collectionName, collection);
  logSystemAction("INSERT", collectionName, newDoc);

  // >>> Sync to MongoDB backend <<<
  syncInsert(collectionName, newDoc);

  return newDoc;
};

export const updateDoc = (collectionName, docId, updates, keyName = "id") => {
  // Backward compatibility for 'appointment' collection
  if (collectionName === "appointment") {
    collectionName = "appointments";
  }
  const collection = getCollection(collectionName);
  let updatedDoc = null;
  const newCollection = collection.map((doc) => {
    const isMatch = (collectionName === "appointments" && (keyName === "id" || keyName === "appointmentId"))
      ? (doc.id === docId || doc.appointmentId === docId)
      : (doc[keyName] === docId);

    if (isMatch) {
      updatedDoc = {
        ...doc,
        ...updates,
        Modified_at: new Date().toISOString(),
        Modified_by: "system_user"
      };
      return updatedDoc;
    }
    return doc;
  });

  if (updatedDoc) {
    saveCollection(collectionName, newCollection);
    logSystemAction("UPDATE", collectionName, updatedDoc);

    // >>> Sync to MongoDB backend <<<
    syncInsert(collectionName, updatedDoc);
  }
  return updatedDoc;
};

// System action logging to visualize in UI Console
export const logSystemAction = (action, collectionName, payload) => {
  const logs = JSON.parse(localStorage.getItem("system_logs") || "[]");
  const newLog = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    action,
    collection: collectionName,
    payload: JSON.stringify(payload)
  };
  logs.unshift(newLog);
  // Keep last 50 logs
  localStorage.setItem("system_logs", JSON.stringify(logs.slice(0, 50)));
  window.dispatchEvent(new CustomEvent("system-log-added"));
};

export const getSystemLogs = () => {
  return JSON.parse(localStorage.getItem("system_logs") || "[]");
};

export const clearSystemLogs = () => {
  localStorage.setItem("system_logs", JSON.stringify([]));
  window.dispatchEvent(new CustomEvent("system-log-added"));
};
