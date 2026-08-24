#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>
#include <WiFiClientSecureBearSSL.h>

#include "config.h"

#define MEGA_RX_PIN D6
#define MEGA_TX_PIN D5

SoftwareSerial megaSerial(MEGA_RX_PIN, MEGA_TX_PIN);

String inputBuffer = "";

String buildReadingsUrl() {
  String baseUrl = String(API_BASE_URL);
  String path = String(API_READINGS_PATH);

  if (baseUrl.endsWith("/") && path.startsWith("/")) {
    baseUrl.remove(baseUrl.length() - 1);
  } else if (!baseUrl.endsWith("/") && !path.startsWith("/")) {
    baseUrl += "/";
  }

  return baseUrl + path;
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("WiFi connected: ");
  Serial.println(WiFi.localIP());
}

bool beginRequest(HTTPClient &http, WiFiClient &plainClient,
                  BearSSL::WiFiClientSecure &secureClient,
                  const String &url) {
  if (url.startsWith("https://")) {
    if (API_INSECURE_TLS) {
      secureClient.setInsecure();
    }

    return http.begin(secureClient, url);
  }

  return http.begin(plainClient, url);
}

bool postReading(const String &json) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected; reconnecting");
    connectWiFi();
  }

  WiFiClient plainClient;
  BearSSL::WiFiClientSecure secureClient;
  HTTPClient http;
  String url = buildReadingsUrl();

  Serial.println("POST " + url);
  Serial.println("Payload: " + json);

  if (!beginRequest(http, plainClient, secureClient, url)) {
    Serial.println("HTTP begin failed");
    return false;
  }

  http.setTimeout(HTTP_TIMEOUT_MS);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Accept", "application/json");
  http.addHeader("X-Station-Id", STATION_ID);
  http.addHeader("X-Station-Key", STATION_API_KEY);

  int responseCode = http.POST(json);
  String responseBody = http.getString();

  Serial.print("HTTP status: ");
  Serial.println(responseCode);
  Serial.println("Response:");
  Serial.println(responseBody);

  http.end();

  return responseCode >= 200 && responseCode < 300;
}

void handleJsonLine(String line) {
  line.trim();

  if (!line.startsWith("{") || !line.endsWith("}")) {
    Serial.println("Invalid JSON line");
    megaSerial.println("NACK");
    return;
  }

  bool posted = postReading(line);
  megaSerial.println(posted ? "ACK" : "NACK");
}

void readMegaSerial() {
  while (megaSerial.available()) {
    char inChar = (char)megaSerial.read();

    if (inChar == '\n') {
      handleJsonLine(inputBuffer);
      inputBuffer = "";
      return;
    }

    if (inChar != '\r') {
      inputBuffer += inChar;
    }

    if (inputBuffer.length() > 512) {
      Serial.println("Input too long; dropping buffer");
      inputBuffer = "";
      megaSerial.println("NACK");
    }
  }
}

void setup() {
  Serial.begin(9600);
  megaSerial.begin(9600);

  Serial.println();
  Serial.println("Weather Man NodeMCU ready");
  Serial.println("API path: " + String(API_READINGS_PATH));

  connectWiFi();
}

void loop() {
  readMegaSerial();
}
