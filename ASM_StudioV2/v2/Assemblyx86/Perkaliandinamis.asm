; Perkaliandinamis.asm — perkalian dari nilai yang dapat diedit di skrip.
; Ganti nilai pada dua instruksi MOV di bawah. Contoh: 12 * 12 = 144.
; Penjumlahan berulang menghitung hasil secara nyata dan kompatibel dengan emulator.
.386
.model flat, stdcall
option casemap:none

.data
msgTitle db "Perkalian dinamis dari skrip", 13, 10
msgTitleLen equ 29
msgExpr db "Hasil perkalian = "
msgExprLen equ 18
newline db 13, 10

.code
main PROC
    mov eax, 4
    mov ecx, offset msgTitle
    mov edx, msgTitleLen
    int 80h

    ; Ubah dua nilai ini untuk menghitung perkalian yang berbeda.
    mov eax, 12              ; angka pertama
    mov ebx, 12              ; angka kedua
    mov ecx, ebx              ; jumlah pengulangan (angka kedua)
    xor esi, esi              ; hasil sementara = 0

multiply_loop:
    test ecx, ecx
    jz multiply_done
    add esi, eax
    dec ecx
    jmp multiply_loop

multiply_done:
    mov eax, 4
    mov ecx, offset msgExpr
    mov edx, msgExprLen
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
