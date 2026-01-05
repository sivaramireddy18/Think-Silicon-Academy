#!/usr/bin/env bash
set -e
BIN="$1"
if [ -z "$BIN" ]; then
  echo "Usage: $0 build/firmware.bin"
  exit 1
fi
openocd -f openocd.cfg -c "program $BIN 0x08000000 verify reset exit"
