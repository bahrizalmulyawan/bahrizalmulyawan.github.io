; binary.asm — x86 32-bit, ASM Studio Browser Emulator
; Decimal -> 16-bit binary. Uses real x86 DIV (EAX/EBX), then prints the original value in binary.

.386
.model flat, stdcall
option casemap:none

.data
message     db "Binary 8 = ", 0
messageLen  equ 11
newline     db 13, 10

.code
main PROC
    mov eax, 8
    mov esi, eax
    mov ebx, 2
    mov ecx, 0

divide_loop:
    xor edx, edx
    div eax, ebx
    inc ecx
    test eax, eax
    jnz divide_loop

    mov eax, 4
    mov ebx, 1
    mov ecx, offset message
    mov edx, messageLen
    int 80h

    mov ebx, esi
    mov ecx, 16
    mov eax, 3
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
