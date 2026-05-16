#pragma once

// Copy this file to config.h and fill in your local values before uploading.

const char* WIFI_SSID = "Ishaq";
const char* WIFI_PASSWORD = "atomiccee";

// Run Flask locally, or use your deployed backend URL later.
// Local computer IP example: http://192.168.1.25:5000
const char* API_BASE_URL = "http://YOUR_COMPUTER_IP:5000";

// This should match the Firestore device id. For the default device:
// <firebase-user-uid>_default
const char* DEVICE_ID = "PASTE_DEVICE_ID_HERE";

// Optional. If DEVICE_API_KEY is set in backend/.env, put the same value here.
const char* DEVICE_API_KEY = "";

// America/New_York examples:
// Standard time: -5 * 3600
// Daylight time: -4 * 3600
const long GMT_OFFSET_SECONDS = -4 * 3600;
const int DAYLIGHT_OFFSET_SECONDS = 0;
