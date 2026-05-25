// Mock Firestore Database implementation using localStorage

const SEED_DATA = {
  // City Master Collection per PDF spec
  city_master: [
    { cityId: "city_bangalore", name: "Bangalore", stateId: "state_karnataka", status: "AA" },
    { cityId: "city_chennai", name: "Chennai", stateId: "state_tamilnadu", status: "AA" },
    { cityId: "city_mumbai", name: "Mumbai", stateId: "state_maharashtra", status: "AA" },
    { cityId: "city_hyderabad", name: "Hyderabad", stateId: "state_telangana", status: "AA" }
  ],
  // Area Master Collection per PDF spec
  area_master: [
    { areaId: "area_koramangala", name: "Koramangala", cityId: "city_bangalore", status: "AA" },
    { areaId: "area_hsr", name: "HSR Layout", cityId: "city_bangalore", status: "AA" },
    { areaId: "area_indiranagar", name: "Indiranagar", cityId: "city_bangalore", status: "AA" },
    { areaId: "area_whitefield", name: "Whitefield", cityId: "city_bangalore", status: "AA" },
    { areaId: "area_annanagar", name: "Anna Nagar", cityId: "city_chennai", status: "AA" },
    { areaId: "area_tnagar", name: "T. Nagar", cityId: "city_chennai", status: "AA" },
    { areaId: "area_bandra", name: "Bandra", cityId: "city_mumbai", status: "AA" },
    { areaId: "area_hitech", name: "Hitech City", cityId: "city_hyderabad", status: "AA" }
  ],
  // State Master Collection
  state_master: [
    { stateId: "state_karnataka", name: "Karnataka", status: "AA" },
    { stateId: "state_tamilnadu", name: "Tamil Nadu", status: "AA" },
    { stateId: "state_maharashtra", name: "Maharashtra", status: "AA" },
    { stateId: "state_telangana", name: "Telangana", status: "AA" }
  ],
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

// Initialize DB if not present
export const initDb = () => {
  Object.keys(SEED_DATA).forEach((key) => {
    if (!localStorage.getItem(`db_${key}`)) {
      localStorage.setItem(`db_${key}`, JSON.stringify(SEED_DATA[key]));
    }
  });
};

export const getCollection = (collectionName) => {
  initDb();
  const data = localStorage.getItem(`db_${collectionName}`);
  return data ? JSON.parse(data) : [];
};

export const saveCollection = (collectionName, data) => {
  localStorage.setItem(`db_${collectionName}`, JSON.stringify(data));
  // Dispatch a custom event to notify components about database updates
  window.dispatchEvent(new CustomEvent("mock-db-updated", { detail: { collectionName } }));
};

export const queryDocs = (collectionName, filterFn) => {
  const collection = getCollection(collectionName);
  return collection.filter(filterFn);
};

export const getDoc = (collectionName, docId, keyName = "id") => {
  const collection = getCollection(collectionName);
  return collection.find((doc) => doc[keyName] === docId);
};

export const insertDoc = (collectionName, doc) => {
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
  if (collectionName === "appointment" && !newDoc.Customer_id) {
    newDoc.Customer_id = docId;
  }
  if (collectionName === "appointments" && !newDoc.appointmentId) {
    newDoc.appointmentId = docId;
  }

  collection.push(newDoc);
  saveCollection(collectionName, collection);
  logSystemAction("INSERT", collectionName, newDoc);
  return newDoc;
};

export const updateDoc = (collectionName, docId, updates, keyName = "id") => {
  const collection = getCollection(collectionName);
  let updatedDoc = null;
  const newCollection = collection.map((doc) => {
    if (doc[keyName] === docId) {
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
