; factorial.asm — x86 32-bit, ASM Studio Browser Emulator
; Calculates 6! with the x86 MUL instruction.
.386
.model flat, stdcall
option casemap:none

.data
msgName db "Bahrizal Helmi Mulyawan", 13, 10
msgNameLen equ 25
msgTitle db "Program Menghitung Faktorial Dinamis", 13, 10
msgTitleLen equ 38
msgResult db "Hasil perhitungan = "
msgResultLen equ 20
newline db 13, 10

.code
main PROC
    mov eax, 4
    mov ebx, 1
    mov ecx, offset msgName
    mov edx, msgNameLen
    int 80h

    mov eax, 4
    mov ebx, 1
    mov ecx, offset msgTitle
    mov edx, msgTitleLen
    int 80h

    mov ecx, 6
    mov eax, 1

factorial_loop:
    test ecx, ecx
    jz factorial_done
    mov ebx, ecx
    mul ebx
    dec ecx
    jmp factorial_loop

factorial_done:
    mov esi, eax
    mov eax, 4
    mov ebx, 1
    mov ecx, offset msgResult
    mov edx, msgResultLen
    int 80h

    mov ebx, esi
    mov eax, 2
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
