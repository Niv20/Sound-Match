#include <VirtualWire.h>
#include <Keyboard.h>

const int safetyPin = 12;
const int rfReceivePin = 11;

bool aIsPressed = false;
bool dIsPressed = false;

void setup()
{
  pinMode(safetyPin, INPUT_PULLUP);

  vw_set_ptt_inverted(true);
  vw_set_rx_pin(rfReceivePin);
  vw_setup(4000);
  vw_rx_start();
  Keyboard.begin();
}

void loop()
{
  if (digitalRead(safetyPin) == LOW)
  {
    readRfMessage();
  }
  else
  {
    releaseAllKeys();
  }
}

void readRfMessage()
{
  uint8_t buf[VW_MAX_MESSAGE_LEN];
  uint8_t buflen = VW_MAX_MESSAGE_LEN;

  if (vw_get_message(buf, &buflen))
  {
    if (buflen >= 2)
    {
      char key = buf[0];
      char state = buf[1];
      handleButtonMessage(key, state);
    }
  }
}

void handleButtonMessage(char key, char state)
{
  if (key == 'a')
  {
    if (state == '1' && !aIsPressed)
    {
      Keyboard.press('a');
      Keyboard.release('a');
      aIsPressed = true;
    }
    else if (state == '0' && aIsPressed)
    {
      Keyboard.press('A');
      Keyboard.release('A');
      aIsPressed = false;
    }
  }
  else if (key == 'd')
  {
    if (state == '1' && !dIsPressed)
    {
      Keyboard.press('d');
      Keyboard.release('d');
      dIsPressed = true;
    }
    else if (state == '0' && dIsPressed)
    {
      Keyboard.press('D');
      Keyboard.release('D');
      dIsPressed = false;
    }
  }
}

void releaseAllKeys()
{
  Keyboard.releaseAll();
  aIsPressed = false;
  dIsPressed = false;
}
