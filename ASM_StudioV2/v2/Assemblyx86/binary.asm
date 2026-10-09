; binary.asm — x86 32-bit, ASM Studio Browser Emulator
; Syscall 3 prints EBX as a zero-padded binary value; ECX is the bit width.
.386
.model flat, stdcall
option casemap:none

.data
message db "Binary 8 = "
messageLen equ 11
newline db 13, 10

.code
main PROC
    mov eax, 4
    mov ebx, 1
    mov ecx, offset message
    mov edx, messageLen
    int 80h

    mov eax, 3
    mov ebx, 8
    mov ecx, 8
    int 80h

    mov eax, 4
    mov ebx, 1
    mov ecx, offset newline
    mov edx, 2
    int 80h

    mov eax, 1
    xor ebx, ebx
    int 80h
main ENDP
END main
