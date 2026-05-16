#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <time.h>

const char* WIFI_SSID = "Ishaq";
const char* WIFI_PASSWORD = "atomiccee";

// Run Flask locally, or use your deployed backend URL later.
// Local computer IP example: http://192.168.1.25:5000
const char* API_BASE_URL = "http://10.56.145.196:5000";

// This should match the Firestore device id.
// Format: <firebase-user-uid>_default
const char* DEVICE_ID = "cmOZ6LIrXydUFSxD38FnElbkEyK2_default";

// Must match DEVICE_API_KEY in backend/.env
const char* DEVICE_API_KEY = "chrono-pill-local-test-key-12345";

// Current pin setup from your code.
// NOTE: GPIO 2, 4, and 15 are boot-sensitive. They can work, but if boot issues happen later, we should remap them.
const int REED_PINS[5] = {15, 2, 4, 5, 18};
const int LED_PINS[5] = {27, 26, 25, 33, 32};
const int BUZZER_PIN = 21;
const int MOTOR_1_PIN = 23;
const int MOTOR_2_PIN = 22;

// Development/testing value: fetch schedule every 5 seconds.
// Later production value can be 60000.
const unsigned long SCHEDULE_FETCH_MS = 5000;
const unsigned long SENSOR_PRINT_MS = 1500;
const unsigned long LIGHT_DURATION_MS = 60000;
const unsigned long SECOND_ALERT_AFTER_MS = 15UL * 60UL * 1000UL;
const unsigned long MISSED_AFTER_MS = 2UL * 60UL * 60UL * 1000UL;

struct CompartmentSchedule {
  int id = 0;
  bool enabled = false;
  String medicationName = "";
  String time = ""; // Must be 24-hour HH:MM, example: 22:03
};

struct ActiveDose {
  bool active = false;
  bool secondAlertSent = false;
  bool eventPosted = false;
  int index = -1;
  String dateKey = "";
  unsigned long startedAt = 0;
};

CompartmentSchedule schedules[5];
ActiveDose activeDoses[5];
String lastTriggeredDateKeys[5] = {"", "", "", "", ""};
unsigned long lastScheduleFetch = 0;
unsigned long lastSensorPrint = 0;

void setupPins() {
  for (int index = 0; index < 5; index++) {
    pinMode(REED_PINS[index], INPUT_PULLUP);
    pinMode(LED_PINS[index], OUTPUT);
    digitalWrite(LED_PINS[index], LOW);
  }

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(MOTOR_1_PIN, OUTPUT);
  pinMode(MOTOR_2_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(MOTOR_1_PIN, LOW);
  digitalWrite(MOTOR_2_PIN, LOW);
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.print("Connecting to Wi-Fi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("Connected. ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

void syncTime() {
  // Waterloo, Ontario uses the same timezone rules as Toronto/New York.
  // This automatically handles daylight saving time.
  configTzTime(
    "EST5EDT,M3.2.0/2,M11.1.0/2",
    "pool.ntp.org",
    "time.nist.gov"
  );

  Serial.print("Syncing Waterloo local time");

  struct tm timeInfo;

  while (!getLocalTime(&timeInfo)) {
    Serial.print(".");
    delay(500);
  }

  char buffer[30];
  strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", &timeInfo);

  Serial.println();
  Serial.print("Time synced: ");
  Serial.println(buffer);
}

String currentDateKey() {
  struct tm timeInfo;
  if (!getLocalTime(&timeInfo)) {
    return "";
  }

  char buffer[11];
  strftime(buffer, sizeof(buffer), "%Y-%m-%d", &timeInfo);
  return String(buffer);
}

String currentTimeHHMM() {
  struct tm timeInfo;
  if (!getLocalTime(&timeInfo)) {
    return "";
  }

  char buffer[6];
  strftime(buffer, sizeof(buffer), "%H:%M", &timeInfo);
  return String(buffer);
}

int minutesFromHHMM(String timeValue) {
  timeValue.trim();

  if (timeValue.length() < 5) {
    return -1;
  }

  int colonIndex = timeValue.indexOf(":");

  if (colonIndex < 0) {
    return -1;
  }

  int hour = timeValue.substring(0, colonIndex).toInt();
  int minute = timeValue.substring(colonIndex + 1, colonIndex + 3).toInt();

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return -1;
  }

  return hour * 60 + minute;
}

bool isCompartmentOpened(int index) {
  return digitalRead(REED_PINS[index]) == LOW;
}

void pulseAlerts(int pulses = 10) {
  for (int pulse = 0; pulse < pulses; pulse++) {
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(MOTOR_1_PIN, HIGH);
    digitalWrite(MOTOR_2_PIN, HIGH);
    delay(180);
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(MOTOR_1_PIN, LOW);
    digitalWrite(MOTOR_2_PIN, LOW);
    delay(180);
  }
}

void startCompartmentAlert(int index) {
  Serial.print("Starting physical alert for compartment ");
  Serial.println(index + 1);

  digitalWrite(LED_PINS[index], HIGH);
  pulseAlerts(10);
}

void stopCompartmentAlert(int index) {
  digitalWrite(LED_PINS[index], LOW);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(MOTOR_1_PIN, LOW);
  digitalWrite(MOTOR_2_PIN, LOW);
}

void addDeviceHeaders(HTTPClient &http) {
  http.addHeader("Content-Type", "application/json");

  if (String(DEVICE_API_KEY).length() > 0) {
    http.addHeader("X-Device-Key", DEVICE_API_KEY);
  }
}

void printLoadedSchedules() {
  Serial.println("Loaded schedules:");

  for (int index = 0; index < 5; index++) {
    Serial.print("  Compartment ");
    Serial.print(index + 1);
    Serial.print(" | id=");
    Serial.print(schedules[index].id);
    Serial.print(" | enabled=");
    Serial.print(schedules[index].enabled);
    Serial.print(" | time=");
    Serial.print(schedules[index].time);
    Serial.print(" | medication=");
    Serial.println(schedules[index].medicationName);
  }
}

void fetchSchedule() {
  connectWiFi();

  String url = String(API_BASE_URL) + "/api/devices/" + DEVICE_ID + "/schedule";
  HTTPClient http;
  http.begin(url);

  if (String(DEVICE_API_KEY).length() > 0) {
    http.addHeader("X-Device-Key", DEVICE_API_KEY);
  }

  int statusCode = http.GET();

  Serial.print("Schedule fetch HTTP ");
  Serial.println(statusCode);

  if (statusCode != 200) {
    Serial.print("Schedule fetch failed. URL: ");
    Serial.println(url);
    http.end();
    return;
  }

  String response = http.getString();

  Serial.println("RAW SCHEDULE RESPONSE:");
  Serial.println(response);

  StaticJsonDocument<4096> document;
  DeserializationError error = deserializeJson(document, response);

  if (error) {
    Serial.print("JSON parse failed: ");
    Serial.println(error.c_str());
    Serial.println(response);
    http.end();
    return;
  }

  JsonArray compartments = document["compartments"].as<JsonArray>();

  for (JsonObject compartment : compartments) {
    int id = compartment["id"] | 0;

    if (id < 1 || id > 5) {
      continue;
    }

    int index = id - 1;
    schedules[index].id = id;
    schedules[index].enabled = compartment["enabled"] | false;
    schedules[index].medicationName = String((const char*) (compartment["medicationName"] | ""));
    schedules[index].time = String((const char*) (compartment["time"] | ""));
    schedules[index].time.trim();
  }

  Serial.println("Schedule updated.");
  printLoadedSchedules();
  http.end();
}

void postDoseEvent(int index, const char* status) {
  if (activeDoses[index].eventPosted) {
    return;
  }

  connectWiFi();

  String url = String(API_BASE_URL) + "/api/devices/" + DEVICE_ID + "/dose-events";
  HTTPClient http;
  http.begin(url);
  addDeviceHeaders(http);

  StaticJsonDocument<512> payload;
  payload["compartmentId"] = schedules[index].id;
  payload["medicationName"] = schedules[index].medicationName;
  payload["scheduledTime"] = schedules[index].time;
  payload["status"] = status;

  String body;
  serializeJson(payload, body);

  int statusCode = http.POST(body);
  Serial.print("Dose event POST ");
  Serial.print(status);
  Serial.print(" -> HTTP ");
  Serial.println(statusCode);

  if (statusCode < 200 || statusCode >= 300) {
    Serial.print("Dose event failed response: ");
    Serial.println(http.getString());
  }

  activeDoses[index].eventPosted = statusCode >= 200 && statusCode < 300;
  http.end();
}

void beginDoseWindow(int index, String dateKey) {
  activeDoses[index].active = true;
  activeDoses[index].secondAlertSent = false;
  activeDoses[index].eventPosted = false;
  activeDoses[index].index = index;
  activeDoses[index].dateKey = dateKey;
  activeDoses[index].startedAt = millis();
  lastTriggeredDateKeys[index] = dateKey;

  Serial.print("Starting alert window for compartment ");
  Serial.println(index + 1);
  startCompartmentAlert(index);
}

void checkSchedules() {
  String nowTime = currentTimeHHMM();
  String dateKey = currentDateKey();

  if (nowTime == "" || dateKey == "") {
    return;
  }

  int nowMinutes = minutesFromHHMM(nowTime);

  Serial.print("ESP Current Time: ");
  Serial.println(nowTime);

  for (int index = 0; index < 5; index++) {
    Serial.print("Compartment ");
    Serial.print(index + 1);
    Serial.print(" | enabled=");
    Serial.print(schedules[index].enabled);
    Serial.print(" | saved time=");
    Serial.println(schedules[index].time);

    if (!schedules[index].enabled || schedules[index].time == "") {
      continue;
    }

    int scheduleMinutes = minutesFromHHMM(schedules[index].time);

    if (scheduleMinutes < 0 || nowMinutes < 0) {
      Serial.print("Invalid time format for compartment ");
      Serial.println(index + 1);
      continue;
    }

    int difference = nowMinutes - scheduleMinutes;

    // Trigger if now is exactly the scheduled minute or up to 1 minute after.
    // This prevents missing a dose because fetch/check happened slightly late.
    if (difference >= 0 && difference <= 1 && lastTriggeredDateKeys[index] != dateKey) {
      Serial.print("MATCH FOUND FOR COMPARTMENT ");
      Serial.println(index + 1);
      beginDoseWindow(index, dateKey);
    }
  }
}

void checkActiveDoseWindows() {
  unsigned long now = millis();

  for (int index = 0; index < 5; index++) {
    if (!activeDoses[index].active) {
      continue;
    }

    if (now - activeDoses[index].startedAt >= LIGHT_DURATION_MS) {
      digitalWrite(LED_PINS[index], LOW);
    }

    if (isCompartmentOpened(index)) {
      stopCompartmentAlert(index);
      postDoseEvent(index, "taken");
      activeDoses[index].active = false;
      continue;
    }

    if (!activeDoses[index].secondAlertSent && now - activeDoses[index].startedAt >= SECOND_ALERT_AFTER_MS) {
      Serial.print("Second alert for compartment ");
      Serial.println(index + 1);
      pulseAlerts(10);
      activeDoses[index].secondAlertSent = true;
    }

    if (now - activeDoses[index].startedAt >= MISSED_AFTER_MS) {
      stopCompartmentAlert(index);
      postDoseEvent(index, "missed");
      activeDoses[index].active = false;
    }
  }
}

void printSensorStates() {
  Serial.print("Reed switches: ");
  for (int index = 0; index < 5; index++) {
    Serial.print(isCompartmentOpened(index) ? "OPEN" : "closed");
    if (index < 4) {
      Serial.print(" | ");
    }
  }
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("Chrono-Pill ESP32 starting...");

  setupPins();
  connectWiFi();
  syncTime();
  fetchSchedule();
}

void loop() {
  unsigned long now = millis();

  if (now - lastScheduleFetch >= SCHEDULE_FETCH_MS) {
    lastScheduleFetch = now;
    fetchSchedule();
  }

  checkSchedules();
  checkActiveDoseWindows();

  if (now - lastSensorPrint >= SENSOR_PRINT_MS) {
    lastSensorPrint = now;
    printSensorStates();
  }
}
