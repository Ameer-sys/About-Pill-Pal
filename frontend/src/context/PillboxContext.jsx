import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultCompartments, defaultEvents, defaultSettings } from "../data/defaults";
import { getDefaultDeviceId } from "../data/defaults";
import {
  clearCompartmentSchedule,
  createDoseEvent,
  ensureDefaultPillbox,
  saveCompartmentSchedule,
  subscribeToCompartments,
  subscribeToDevice,
  subscribeToDoseEvents,
  updateDeviceSettings,
} from "../services/pillboxService";
import { useAuth } from "./useAuth";
import { PillboxContext } from "./pillboxContextValue";

function mapDeviceToSettings(deviceData) {
  if (!deviceData) {
    return defaultSettings;
  }

  return {
    deviceName: deviceData.name || defaultSettings.deviceName,
    caregiverEnabled: Boolean(deviceData.caregiverEnabled),
    caregiverEmail: deviceData.caregiverEmail || "",
    userNotifications: deviceData.userNotifications ?? true,
    emailNotifications: deviceData.emailNotifications ?? true,
  };
}

function normalizeCompartments(snapshot) {
  const firestoreCompartments = snapshot.docs.map((item) => item.data());

  return defaultCompartments.map((defaultCompartment) => {
    const savedCompartment = firestoreCompartments.find(
      (compartment) => Number(compartment.id) === defaultCompartment.id,
    );

    return {
      ...defaultCompartment,
      ...savedCompartment,
      id: defaultCompartment.id,
    };
  });
}

function normalizeEvents(snapshot) {
  return snapshot.docs.map((item) => {
    const data = item.data();
    const createdAt = data.createdAt?.toDate?.();

    return {
      id: item.id,
      compartmentId: data.compartmentId,
      medicationName: data.medicationName || "",
      scheduledTime: data.scheduledTime || "",
      status: data.status || "missed",
      occurredAt: createdAt
        ? new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }).format(createdAt)
        : data.occurredAt || "Recently",
    };
  });
}

export function PillboxProvider({ children }) {
  const { user, isAuthLoading } = useAuth();
  const [deviceId, setDeviceId] = useState("");
  const [compartments, setCompartments] = useState(defaultCompartments);
  const [events, setEvents] = useState(defaultEvents);
  const [settings, setSettings] = useState(defaultSettings);
  const [feedback, setFeedback] = useState("");
  const [isPillboxLoading, setIsPillboxLoading] = useState(true);
  const [pillboxError, setPillboxError] = useState("");

  const showFeedback = useCallback((message) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 3200);
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return undefined;
    }

    if (!user) {
      queueMicrotask(() => {
        setDeviceId("");
        setCompartments(defaultCompartments);
        setEvents(defaultEvents);
        setSettings(defaultSettings);
        setIsPillboxLoading(false);
      });
      return undefined;
    }

    let didCancel = false;
    let unsubscribeDevice = () => {};
    let unsubscribeCompartments = () => {};
    let unsubscribeEvents = () => {};

    queueMicrotask(() => {
      setIsPillboxLoading(true);
      setPillboxError("");
    });

    ensureDefaultPillbox(user)
      .then((resolvedDeviceId) => {
        if (didCancel || !resolvedDeviceId) {
          return;
        }

        setDeviceId(resolvedDeviceId);

        unsubscribeDevice = subscribeToDevice(
          resolvedDeviceId,
          (snapshot) => {
            setSettings(mapDeviceToSettings(snapshot.data()));
            setIsPillboxLoading(false);
          },
          (error) => {
            setPillboxError(error.message);
            setIsPillboxLoading(false);
          },
        );

        unsubscribeCompartments = subscribeToCompartments(
          resolvedDeviceId,
          (snapshot) => setCompartments(normalizeCompartments(snapshot)),
          (error) => setPillboxError(error.message),
        );

        unsubscribeEvents = subscribeToDoseEvents(
          resolvedDeviceId,
          (snapshot) => setEvents(normalizeEvents(snapshot)),
          (error) => setPillboxError(error.message),
        );
      })
      .catch((error) => {
        if (!didCancel) {
          setPillboxError(error.message);
          setIsPillboxLoading(false);
        }
      });

    return () => {
      didCancel = true;
      unsubscribeDevice();
      unsubscribeCompartments();
      unsubscribeEvents();
    };
  }, [user, isAuthLoading]);

  const saveCompartment = useCallback(
    async (compartmentId, updates) => {
      if (!user) {
        showFeedback("Please log in before saving a schedule.");
        return;
      }

      try {
        const targetDeviceId = deviceId || (await ensureDefaultPillbox(user)) || getDefaultDeviceId(user.uid);
        setDeviceId(targetDeviceId);
        await saveCompartmentSchedule(targetDeviceId, compartmentId, updates);
        showFeedback(`Compartment ${compartmentId} schedule saved.`);
      } catch (error) {
        setPillboxError(error.message);
        showFeedback("We could not save that schedule. Please check Firestore rules.");
      }
    },
    [deviceId, user, showFeedback],
  );

  const clearCompartment = useCallback(
    async (compartmentId) => {
      if (!user) {
        showFeedback("Please log in before clearing a schedule.");
        return;
      }

      try {
        const targetDeviceId = deviceId || (await ensureDefaultPillbox(user)) || getDefaultDeviceId(user.uid);
        setDeviceId(targetDeviceId);
        await clearCompartmentSchedule(targetDeviceId, compartmentId);
        showFeedback(`Compartment ${compartmentId} cleared.`);
      } catch (error) {
        setPillboxError(error.message);
        showFeedback("We could not clear that schedule. Please check Firestore rules.");
      }
    },
    [deviceId, user, showFeedback],
  );

  const updateSettings = useCallback(
    async (updates) => {
      if (!user) {
        showFeedback("Please log in before saving settings.");
        return;
      }

      try {
        const targetDeviceId = deviceId || (await ensureDefaultPillbox(user)) || getDefaultDeviceId(user.uid);
        setDeviceId(targetDeviceId);
        await updateDeviceSettings(targetDeviceId, updates);
        showFeedback("Settings saved.");
      } catch (error) {
        setPillboxError(error.message);
        showFeedback("We could not save settings. Please check Firestore rules.");
      }
    },
    [deviceId, user, showFeedback],
  );

  const recordDoseEvent = useCallback(
    async (event) => {
      if (!user) {
        showFeedback("Please log in before recording a device event.");
        return;
      }

      try {
        const targetDeviceId = deviceId || (await ensureDefaultPillbox(user)) || getDefaultDeviceId(user.uid);
        setDeviceId(targetDeviceId);
        await createDoseEvent(targetDeviceId, event);
        showFeedback(event.status === "taken" ? "Dose recorded as taken." : "Dose recorded as missed.");
      } catch (error) {
        setPillboxError(error.message);
        showFeedback("We could not record that device event.");
      }
    },
    [deviceId, user, showFeedback],
  );

  const value = useMemo(
    () => ({
      deviceId,
      compartments,
      events,
      settings,
      feedback,
      isPillboxLoading,
      pillboxError,
      saveCompartment,
      clearCompartment,
      updateSettings,
      recordDoseEvent,
      showFeedback,
    }),
    [
      deviceId,
      compartments,
      events,
      settings,
      feedback,
      isPillboxLoading,
      pillboxError,
      saveCompartment,
      clearCompartment,
      updateSettings,
      recordDoseEvent,
      showFeedback,
    ],
  );

  return <PillboxContext.Provider value={value}>{children}</PillboxContext.Provider>;
}
