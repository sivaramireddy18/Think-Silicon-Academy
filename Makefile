# Minimal Makefile for STM32F401RE bare-metal
# Adjust CROSS, CPU, FPU, FLOAT-ABI and LD script path as needed.

CROSS = arm-none-eabi
CC = $(CROSS)-gcc
OBJCOPY = $(CROSS)-objcopy
SIZE = $(CROSS)-size

CPU = -mcpu=cortex-m4
FPU = -mfpu=fpv4-sp-d16
FLOAT = -mfloat-abi=hard
CFLAGS = $(CPU) $(FPU) $(FLOAT) -mthumb -Os -g -ffreestanding -fno-common -Wall -Wextra
LDFLAGS = -Tld/stm32f401re.ld -nostartfiles -Wl,-Map=build/firmware.map

SRCS = src/main.c src/system_stm32f4xx.c
ASMS = startup/startup_stm32f401re.s
OBJS = $(patsubst %.c,build/%.o,$(SRCS)) $(patsubst %.s,build/%.o,$(ASMS))

all: build/firmware.elf build/firmware.bin

build/%.o: %.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -Iinc -c $< -o $@

build/%.o: %.s
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

build/firmware.elf: $(OBJS)
	@mkdir -p build
	$(CC) $(CFLAGS) $(OBJS) -o $@ $(LDFLAGS)
	$(SIZE) $@

build/firmware.bin: build/firmware.elf
	$(OBJCOPY) -O binary $< $@

clean:
	rm -rf build

flash: build/firmware.bin
	./scripts/flash.sh $<

.PHONY: all clean flash
