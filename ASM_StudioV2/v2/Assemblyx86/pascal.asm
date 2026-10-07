; pascal.asm — x86 32-bit, ASM Studio Browser Emulator
; Pascal Triangle generated with multiplication and division.

.386
.model flat, stdcall
option casemap:none

.data
heading     db "Pascal Triangle (10 rows):", 13, 10
headingLen  equ 28
space       db " "
newline     db 13, 10

.code
main PROC
    mov eax, 4
    mov ebx, 1
    mov ecx, offset heading
    mov edx, headingLen
    int 80h

    mov esi, 1

row_loop:
    mov ebx, 10
    cmp esi, ebx
    ja done

    mov edi, 1
    mov eax, 1

element_loop:
    ; Print current value: syscall 2, EBX=value.
    mov ebx, eax
    mov edx, 0
    mov ecx, 0
    mov ebx, eax
    mov eax, 2
    int 80h

    ; Print a space while preserving the current value in EBP.
    mov ebp, ebx
    mov eax, 4
    mov ebx, 1
    mov ecx, offset space
    mov edx, 1
    int 80h
    mov eax, ebp

    cmp edi, esi
    je next_row

    ; next = current * (row - position) / position
    mov ebx, esi
    sub ebx, edi
    mov ebp, edi
    mul eax, ebx
    div eax, ebp

    inc edi
    jmp element_loop

next_row:
    mov eax, 4
    mov ebx, 1
    mov ecx, offset newline
    mov edx, 2
    int 80h

    inc esi
    jmp row_loop

done:
    mov eax, 1
    xor ebx, ebx
    int 80h
main ENDP
END main
