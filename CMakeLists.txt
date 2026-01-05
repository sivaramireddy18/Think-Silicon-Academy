cmake_minimum_required(VERSION 3.13)
project(stm32f401re-baremetal C ASM)
enable_language(C ASM)

set(CMAKE_SYSTEM_NAME Generic)
set(CMAKE_C_COMPILER arm-none-eabi-gcc)
set(CMAKE_ASM_COMPILER arm-none-eabi-gcc)
set(CMAKE_C_FLAGS "-mcpu=cortex-m4 -mthumb -mfpu=fpv4-sp-d16 -mfloat-abi=hard -Os -g -ffreestanding -fno-common -Wall")
set(CMAKE_EXE_LINKER_FLAGS "-T${CMAKE_SOURCE_DIR}/ld/stm32f401re.ld -nostartfiles")

file(GLOB_RECURSE SRC src/*.c)
add_executable(build/firmware.elf ${SRC} startup/startup_stm32f401re.s)
add_custom_command(TARGET build/firmware.elf POST_BUILD
  COMMAND arm-none-eabi-objcopy -O binary $<TARGET_FILE:build/firmware.elf> build/firmware.bin)
