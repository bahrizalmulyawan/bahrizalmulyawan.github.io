; Perkalian.asm — menghitung 12 * 12 secara nyata.
; Menggunakan penjumlahan berulang agar kompatibel dengan emulator ASM Studio.
.386
.model flat, stdcall
option casemap:none

.data
msgResult db "Perkalian 12 x 12 = "
msgResultLen equ 20
newline db 13, 10

.code
main PROC
    mov eax, 12              ; angka pertama
    mov ebx, 12              ; angka kedua
    mov ecx, ebx              ; jumlah pengulangan
    xor esi, esi              ; akumulator hasil = 0

multiply_loop:
    test ecx, ecx
    jz multiply_done
    add esi, eax              ; hasil += angka pertama
    dec ecx
    jmp multiply_loop

multiply_done:
    mov eax, 4
    mov ecx, offset msgResult
    mov edx, msgResultLen
    int 80h

    mov ebx, esi
    mov eax, 2
    int 80h

    mov eax, 4
    mov ecx, offset newline
    mov edx, 2
    int 80h

    mov eax, 1
    xor ebx, ebx
    int 80h
main ENDP
END main
