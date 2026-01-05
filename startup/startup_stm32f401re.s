/* Minimal startup for STM32F401RE (vector table + reset handler)
   Produces: .isr_vector and a Reset_Handler that calls C entry point main.
   Adjust stack pointer value if needed.
*/
	.syntax unified
	.cpu cortex-m4
	.fpu fpv4-sp-d16
	.thumb

	.section .isr_vector, "a", %progbits
	.align  2
	.global g_pfnVectors
g_pfnVectors:
	.word   _estack                 /* Top of stack (set by linker) */
	.word   Reset_Handler
	.word   NMI_Handler
	.word   HardFault_Handler
	.word   MemManage_Handler
	.word   BusFault_Handler
	.word   UsageFault_Handler
	.word   0
	.word   0
	.word   0
	.word   0
	.word   SVC_Handler
	.word   DebugMon_Handler
	.word   0
	.word   PendSV_Handler
	.word   SysTick_Handler

/* Default weak handlers */
	.thumb_set NMI_Handler, Default_Handler
	.thumb_set HardFault_Handler, Default_Handler
	.thumb_set MemManage_Handler, Default_Handler
	.thumb_set BusFault_Handler, Default_Handler
	.thumb_set UsageFault_Handler, Default_Handler
	.thumb_set SVC_Handler, Default_Handler
	.thumb_set DebugMon_Handler, Default_Handler
	.thumb_set PendSV_Handler, Default_Handler
	.thumb_set SysTick_Handler, Default_Handler

	.extern main

	.section .text.Reset_Handler
	.global Reset_Handler
	.type Reset_Handler, %function
Reset_Handler:
	/* Copy .data from flash to SRAM */
	ldr   r0, =_sidata
	ldr   r1, =_sdata
	ldr   r2, =_edata
1:
	cmp   r1, r2
	it    lt
	ldrlt r3, [r0], #4
	strlt r3, [r1], #4
	blt   1b

	/* Zero fill .bss */
	ldr   r0, =_sbss
	ldr   r1, =_ebss
	movs  r2, #0
2:
	cmp   r0, r1
	it    lt
	strlt r2, [r0], #4
	blt   2b

	/* Call main() */
	bl    main

/* If main returns we hang here */
	b     .

/* Default handler: infinite loop */
	.section .text.Default_Handler
Default_Handler:
	b .

	.size Reset_Handler, . - Reset_Handler
