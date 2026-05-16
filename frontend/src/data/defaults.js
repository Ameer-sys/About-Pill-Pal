export const defaultCompartments = [1, 2, 3, 4, 5].map((id) => ({
  id,
  medicationName: "",
  time: "",
  enabled: false,
  status: "empty",
  lastTaken: "",
}));

export const defaultEvents = [];

export const defaultSettings = {
  deviceName: "My Pillbox",
  caregiverEnabled: false,
  caregiverEmail: "",
  userNotifications: true,
  emailNotifications: true,
};

export function getDefaultDeviceId(userId) {
  return `${userId}_default`;
}
