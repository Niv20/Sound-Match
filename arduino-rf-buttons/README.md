# Wireless RF Button Controller

Two Arduino boards talking over 433MHz RF: one board reads a pair of push buttons and beams their state over the air, the other catches the signal and turns it into keyboard presses. Built for a two-player setup where each side gets its own button, mapped to `A` and `D`.

## How it works

**Transmitter (Arduino Uno)** watches two buttons on pins 7 and 8, debounces them in software, and lights an LED whenever a button is held down. Every state change gets packed into a tiny 2-byte message (`player id` + `state`) and sent out over RF using the VirtualWire library.

**Receiver (Arduino Leonardo)** listens on the RF module, decodes the message, and simulates the matching key press on the connected computer via the Keyboard library. A press sends the lowercase key (`a`/`d`), a release sends the uppercase key (`A`/`D`) — that's used on the game/software side to tell "press" and "release" apart. There's also a safety pin: pull it low and the receiver processes input as normal, otherwise it releases every key and ignores incoming messages, so nothing gets stuck mid-game if the receiver boots up in a weird state or gets unplugged.

## Hardware

- Arduino Uno — transmitter
- Arduino Leonardo — receiver (needs native USB HID support for `Keyboard.h`, which is why it's a Leonardo and not an Uno)
- 2x 433MHz RF transmitter/receiver module pair
- 2x push buttons + 2x status LEDs
- A jumper/switch on the Leonardo's safety pin

## Wiring

**Transmitter**
| Pin | Function |
|-----|----------|
| 7 | Button 1 (player A) |
| 8 | Button 2 (player D) |
| 2 | LED 1 |
| 3 | LED 2 |
| 12 | RF TX data pin |

**Receiver**
| Pin | Function |
|-----|----------|
| 11 | RF RX data pin |
| 12 | Safety switch (pull LOW to enable) |

## Setup

1. Install the **VirtualWire** library (and **Keyboard**, which ships with the Arduino IDE) via the Library Manager.
2. Flash `transmitter_uno/transmitter_uno.ino` to the Uno.
3. Flash `receiver_leonardo/receiver_leonardo.ino` to the Leonardo.
4. Wire up the buttons, LEDs, and RF modules as above, power both boards, and press away — the Leonardo will show up as a keyboard sending `a`/`A` and `d`/`D`.

## Notes

- Both sketches run VirtualWire at 4000 bps — keep that matched on both ends or they won't understand each other.
- Debounce delay is 80ms; tweak `debounceDelay` in the transmitter sketch if your buttons are noisier or you want a snappier response.
- Final project for Leonardo Da Vinci school.
