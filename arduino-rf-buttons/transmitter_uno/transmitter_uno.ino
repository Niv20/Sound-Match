#include <VirtualWire.h>

const int buttonPin1 = 7;
const int buttonPin2 = 8;

const int ledPin1 = 2;
const int ledPin2 = 3;

const int rfTxPin = 12;

int lastStableState1 = HIGH;
int lastStableState2 = HIGH;

int lastReading1 = HIGH;
int lastReading2 = HIGH;

int lastSentState1 = HIGH;
int lastSentState2 = HIGH;

unsigned long lastDebounceTime1 = 0;
unsigned long lastDebounceTime2 = 0;

const unsigned long debounceDelay = 80;

void setup()
{
  pinMode(buttonPin1, INPUT_PULLUP);
  pinMode(buttonPin2, INPUT_PULLUP);

  pinMode(ledPin1, OUTPUT);
  pinMode(ledPin2, OUTPUT);

  vw_set_ptt_inverted(true);
  vw_set_tx_pin(rfTxPin);
  vw_setup(4000);
}

void loop()
{
  handleButton(buttonPin1, ledPin1, lastStableState1, lastReading1, lastSentState1, lastDebounceTime1, 'a');
  handleButton(buttonPin2, ledPin2, lastStableState2, lastReading2, lastSentState2, lastDebounceTime2, 'd');
}

void handleButton(
  int buttonPin,
  int ledPin,
  int &lastStableState,
  int &lastReading,
  int &lastSentState,
  unsigned long &lastDebounceTime,
  char player
) {
  int reading = digitalRead(buttonPin);

  if (reading != lastReading)
  {
    lastDebounceTime = millis();
    lastReading = reading;
  }

  if (millis() - lastDebounceTime >= debounceDelay)
  {
    if (reading != lastStableState)
    {
      lastStableState = reading;
    }

    if (lastStableState != lastSentState)
    {
      lastSentState = lastStableState;

      if (lastStableState == LOW)
      {
        digitalWrite(ledPin, HIGH);
        sendLeonardo(player, '1');
      }
      else
      {
        digitalWrite(ledPin, LOW);
        sendLeonardo(player, '0');
      }
    }
  }
}

void sendLeonardo(char player, char state)
{
  char message[3];

  message[0] = player;
  message[1] = state;
  message[2] = '\0';

  vw_send((uint8_t *)message, strlen(message));
  vw_wait_tx();
}
