; pascal.asm — x86 32-bit, ASM Studio Browser Emulator
; Pascal Triangle 10 baris. Koefisien disimpan di EBP agar tidak hilang
; saat EAX dipakai memilih syscall output.
; Rumus koefisien berikutnya: current * (row - position) / position

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
    ; Syscall 4: ECX=alamat string, EDX=panjang
    mov eax, 4
    mov ecx, offset heading
    mov edx, headingLen
    int 80h

    mov esi, 1                  ; nomor baris: 1..10

row_loop:
    cmp esi, 10
    ja done

    mov edi, 1                  ; posisi dalam baris
    mov ebp, 1                  ; koefisien pertama selalu 1

element_loop:
    ; Syscall 2 mencetak EBX sebagai bilangan desimal.
    ; EBP menjaga koefisien agar tetap aman saat EAX dipakai syscall.
    mov ebx, ebp
    mov eax, 2
    int 80h

    ; Cetak spasi
    mov eax, 4
    mov ecx, offset space
    mov edx, 1
    int 80h

    cmp edi, esi
    je next_row

    ; Hitung koefisien berikutnya: current * (row-position) / position
    mov eax, ebp
    mov ebx, esi
    sub ebx, edi
    mul ebx                     ; EDX:EAX = current * (row-position)
    div edi                     ; EAX = koefisien berikutnya
    mov ebp, eax                ; simpan koefisien berikutnya

    inc edi
    jmp element_loop

next_row:
    mov eax, 4
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
