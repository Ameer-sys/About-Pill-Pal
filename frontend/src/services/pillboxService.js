import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { defaultCompartments, defaultSettings, getDefaultDeviceId } from "../data/defaults";

export async function ensureDefaultPillbox(user) {
  if (!user) {
    return null;
  }

  const deviceId = getDefaultDeviceId(user.uid);
  const userRef = doc(db, "users", user.uid);
  const deviceRef = doc(db, "devices", deviceId);
  const userSnap = await getDoc(userRef);
  const deviceSnap = await getDoc(deviceRef);

  await setDoc(
    userRef,
    {
      email: user.email,
      displayName: user.displayName || "",
      defaultDeviceId: deviceId,
      updatedAt: serverTimestamp(),
      ...(!userSnap.exists() ? { createdAt: serverTimestamp() } : {}),
    },
    { merge: true },
  );

  if (!deviceSnap.exists()) {
    await setDoc(deviceRef, {
      ownerId: user.uid,
      name: defaultSettings.deviceName,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
      online: false,
      lastSeen: null,
      caregiverEnabled: defaultSettings.caregiverEnabled,
      caregiverEmail: defaultSettings.caregiverEmail,
      userNotifications: defaultSettings.userNotifications,
      emailNotifications: defaultSettings.emailNotifications,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await Promise.all(
      defaultCompartments.map((compartment) =>
        setDoc(doc(db, "devices", deviceId, "compartments", String(compartment.id)), {
          ...compartment,
          updatedAt: serverTimestamp(),
        }),
      ),
    );
  }

  return deviceId;
}

export function subscribeToDevice(deviceId, onData, onError) {
  return onSnapshot(doc(db, "devices", deviceId), onData, onError);
}

export function subscribeToCompartments(deviceId, onData, onError) {
  return onSnapshot(collection(db, "devices", deviceId, "compartments"), onData, onError);
}

export function subscribeToDoseEvents(deviceId, onData, onError) {
  const eventsQuery = query(
    collection(db, "devices", deviceId, "doseEvents"),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(eventsQuery, onData, onError);
}

export async function saveCompartmentSchedule(deviceId, compartmentId, updates) {
  const isEnabled = Boolean(updates.medicationName && updates.time);

  await setDoc(
    doc(db, "devices", deviceId, "compartments", String(compartmentId)),
    {
      id: compartmentId,
      medicationName: updates.medicationName,
      time: updates.time,
      enabled: isEnabled,
      status: isEnabled ? "scheduled" : "empty",
      lastTaken: "",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function clearCompartmentSchedule(deviceId, compartmentId) {
  await setDoc(
    doc(db, "devices", deviceId, "compartments", String(compartmentId)),
    {
      id: compartmentId,
      medicationName: "",
      time: "",
      enabled: false,
      status: "empty",
      lastTaken: "",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateDeviceSettings(deviceId, updates) {
  await setDoc(
    doc(db, "devices", deviceId),
    {
      name: updates.deviceName,
      caregiverEnabled: updates.caregiverEnabled,
      caregiverEmail: updates.caregiverEmail,
      userNotifications: updates.userNotifications,
      emailNotifications: updates.emailNotifications,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function createDoseEvent(deviceId, event) {
  const eventData = {
    compartmentId: event.compartmentId,
    medicationName: event.medicationName || "",
    scheduledTime: event.scheduledTime || "",
    status: event.status,
    occurredAt: new Date().toISOString(),
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, "devices", deviceId, "doseEvents"), eventData);
  await setDoc(
    doc(db, "devices", deviceId, "compartments", String(event.compartmentId)),
    {
      status: event.status,
      lastTaken: event.status === "taken" ? eventData.occurredAt : "",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
