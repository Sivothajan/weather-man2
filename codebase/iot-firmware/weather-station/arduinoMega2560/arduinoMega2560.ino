#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <SD.h>
#include <SPI.h>
#include <Wire.h>

#define DHT_PIN 2
#define DHT_TYPE DHT11
#define SOIL_PIN A0
#define RAIN_PIN A1
#define FIRE_PIN 6
#define SD_CS_PIN 10

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

const unsigned long SAMPLE_INTERVAL_MS = 10000;
const unsigned long ACK_TIMEOUT_MS = 2000;
const int RAIN_THRESHOLD = 500;

DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

unsigned long lastSampleAt = 0;
bool sdReady = false;
bool displayReady = false;

void setDisplayContrast(uint8_t contrastValue) {
  display.ssd1306_command(0x81);
  display.ssd1306_command(contrastValue);
}

bool waitForAck(unsigned long timeoutMs) {
  unsigned long start = millis();

  while (millis() - start < timeoutMs) {
    if (Serial1.available()) {
      String reply = Serial1.readStringUntil('\n');
      reply.trim();

      if (reply.length() == 0) {
        continue;
      }

      Serial.print("NodeMCU reply: ");
      Serial.println(reply);

      return reply == "ACK";
    }

    delay(10);
  }

  return false;
}

void queueUnsentPayload(const String &json) {
  if (!sdReady) {
    Serial.println("SD unavailable; payload was not queued");
    return;
  }

  File unsentFile = SD.open("unsent.txt", FILE_WRITE);
  if (!unsentFile) {
    Serial.println("Failed to open unsent.txt");
    return;
  }

  unsentFile.println(json);
  unsentFile.close();
  Serial.println("Queued payload to unsent.txt");
}

void resendUnsentPayloads() {
  if (!sdReady || !SD.exists("unsent.txt")) {
    Serial.println("No unsent queue to resend");
    return;
  }

  if (SD.exists("unsent_tmp.txt")) {
    SD.remove("unsent_tmp.txt");
  }

  File inFile = SD.open("unsent.txt", FILE_READ);
  File tmpFile = SD.open("unsent_tmp.txt", FILE_WRITE);

  if (!inFile || !tmpFile) {
    Serial.println("Could not process unsent queue");
    if (inFile) inFile.close();
    if (tmpFile) tmpFile.close();
    return;
  }

  Serial.println("Retrying queued payloads");

  while (inFile.available()) {
    String line = inFile.readStringUntil('\n');
    line.trim();

    if (line.length() == 0) {
      continue;
    }

    Serial1.println(line);
    Serial.println("Retried queued payload: " + line);

    if (!waitForAck(ACK_TIMEOUT_MS)) {
      tmpFile.println(line);
      Serial.println("Keeping queued payload");
    }

    delay(50);
  }

  inFile.close();
  tmpFile.close();
  SD.remove("unsent.txt");

  File checkTmp = SD.open("unsent_tmp.txt", FILE_READ);
  if (!checkTmp) {
    Serial.println("Queue temp file missing");
    return;
  }

  if (checkTmp.size() == 0) {
    checkTmp.close();
    SD.remove("unsent_tmp.txt");
    Serial.println("Unsent queue cleared");
    return;
  }

  File newUnsent = SD.open("unsent.txt", FILE_WRITE);
  if (!newUnsent) {
    checkTmp.close();
    Serial.println("Could not rebuild unsent queue");
    return;
  }

  while (checkTmp.available()) {
    newUnsent.println(checkTmp.readStringUntil('\n'));
  }

  checkTmp.close();
  newUnsent.close();
  SD.remove("unsent_tmp.txt");
  Serial.println("Unsent queue rebuilt");
}

void showStartupScreen(const char *line1, const char *line2) {
  if (!displayReady) {
    return;
  }

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.println(line1);
  display.println(line2);
  display.display();
}

void displayReading(float temperature, float humidity, int soilMoisture,
                    bool rain, bool fire) {
  if (!displayReady) {
    return;
  }

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 0);

  display.print("Temp: ");
  display.print(temperature, 1);
  display.println(" C");

  display.print("Hum : ");
  display.print(humidity, 1);
  display.println(" %");

  display.print("Soil: ");
  display.print(soilMoisture);
  display.println(" %");

  display.print("Rain: ");
  display.println(rain ? "YES" : "NO");

  display.print("Fire: ");
  display.println(fire ? "YES" : "NO");

  display.display();
}

void logReading(float temperature, float humidity, int soilMoisture,
                int soilRaw, bool rain, int rainRaw, bool fire) {
  if (!sdReady) {
    return;
  }

  File logFile = SD.open("datalog.txt", FILE_WRITE);
  if (!logFile) {
    Serial.println("Failed to open datalog.txt");
    return;
  }

  logFile.print("T:");
  logFile.print(temperature, 2);
  logFile.print(", H:");
  logFile.print(humidity, 2);
  logFile.print(", Soil:");
  logFile.print(soilMoisture);
  logFile.print(", SoilRaw:");
  logFile.print(soilRaw);
  logFile.print(", Rain:");
  logFile.print(rain ? "1" : "0");
  logFile.print(", RainRaw:");
  logFile.print(rainRaw);
  logFile.print(", Fire:");
  logFile.println(fire ? "1" : "0");
  logFile.close();
}

String buildReadingJson(float temperature, float humidity, int soilMoisture,
                        int soilRaw, bool rain, int rainRaw, bool fire) {
  String json = "{";
  json += "\"temperature\":" + String(temperature, 2) + ",";
  json += "\"humidity\":" + String(humidity, 2) + ",";
  json += "\"soilMoisture\":" + String(soilMoisture) + ",";
  json += "\"soilRaw\":" + String(soilRaw) + ",";
  json += "\"rain\":" + String(rain ? "true" : "false") + ",";
  json += "\"rainRaw\":" + String(rainRaw) + ",";
  json += "\"fire\":" + String(fire ? "true" : "false");
  json += "}";

  return json;
}

void sampleAndSend() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature)) {
    temperature = 25.0;
  }

  if (isnan(humidity)) {
    humidity = 50.0;
  }

  int soilRaw = analogRead(SOIL_PIN);
  int rainRaw = analogRead(RAIN_PIN);
  int soilMoisture = constrain(map(soilRaw, 1023, 0, 0, 100), 0, 100);
  bool rain = rainRaw < RAIN_THRESHOLD;
  bool fire = digitalRead(FIRE_PIN) == LOW;

  logReading(temperature, humidity, soilMoisture, soilRaw, rain, rainRaw, fire);
  displayReading(temperature, humidity, soilMoisture, rain, fire);

  String json = buildReadingJson(temperature, humidity, soilMoisture, soilRaw,
                                 rain, rainRaw, fire);

  Serial1.println(json);
  Serial.println("Sent payload: " + json);

  if (waitForAck(ACK_TIMEOUT_MS)) {
    Serial.println("Upload acknowledged");
  } else {
    Serial.println("No ACK; queueing payload");
    queueUnsentPayload(json);
  }
}

void setup() {
  Serial.begin(9600);
  Serial1.begin(9600);
  dht.begin();
  pinMode(FIRE_PIN, INPUT_PULLUP);

  sdReady = SD.begin(SD_CS_PIN);
  Serial.println(sdReady ? "SD ready" : "SD init failed");

  displayReady = display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  if (!displayReady) {
    Serial.println("OLED init failed");
  } else {
    setDisplayContrast(128);
    showStartupScreen("Weather", "Man");
  }

  delay(1500);
  resendUnsentPayloads();
}

void loop() {
  if (millis() - lastSampleAt >= SAMPLE_INTERVAL_MS || lastSampleAt == 0) {
    lastSampleAt = millis();
    sampleAndSend();
  }
}
