# STM32F401RE — Bare-metal project template

Minimal bare-metal project layout for the STM32F401RE (Cortex-M4).
Adjust memory sizes, CPU flags and vendor headers for your specific part and toolchain.

Quickstart:
- Requirements: arm-none-eabi-gcc, arm-none-eabi-ld, arm-none-eabi-objcopy, openocd
- Build:
  make
- Flash (example using OpenOCD):
  ./scripts/flash.sh build/firmware.bin

Files of interest:
- startup/startup_stm32f401re.s — vector table + reset startup
- ld/stm32f401re.ld — linker script (adjust MEMORY sizes if necessary)
- src/main.c — simple main loop
- Makefile — build rules

Adjust includes in `inc/` and add CMSIS / device headers under `inc/` or `cmsis/` as you prefer.
