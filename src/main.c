#include <stdint.h>
#include "main.h"

/* Simple bare-metal example: blink loop placeholder */
int main(void)
{
    /* If you have RCC and GPIO init, do it here to toggle an LED */
    volatile uint32_t n = 0;
    while (1) {
        /* Busy delay */
        for (uint32_t i = 0; i < 1000000; ++i) {
            n++;
        }
        /* Use debugger to inspect `n` or toggle a pin using direct register access */
    }
    return 0;
}
