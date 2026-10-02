 ; ============================================
; Konversi Desimal ke Biner 
; ============================================
ORG 100h

; --- Proses Hitung Nyata (Dibagi 2 berulang kali) ---
MOV AX, 0        ; <--- Angka desimal yang akan dihitung
MOV BX, 2           ; <--- Angka pembagi (karena biner berbasis 2)
MOV CX, 16          ; Kita akan membagi 16 kali agar pas menjadi 16-bit

BAGI_DUA:
    XOR DX, DX      ; (Penting!) Bersihkan register sisa bagi sebelum pembagian
    DIV BX          ; Bagi AX dengan 2. Hasil bagi masuk ke AX, sisa masuk ke DX.
    PUSH DX         ; Simpan sisa bagi (0 atau 1) ke dalam memori Stack
    LOOP BAGI_DUA   ; Ulangi perhitungan ini 16 kali 

; --- Proses Mencetak Hasil ke Layar ---
MOV CX, 16          ; Atur counter untuk mencetak 16 digit bit

CETAK_BIT:
    POP DX          ; Ambil sisa bagi dari stack (otomatis membalik urutan angka)
    ADD DL, '0'     ; Ubah angka mesin (0/1) menjadi teks ASCII ('0'/'1')
    MOV AH, 02h     ; Perintah cetak 1 karakter
    INT 21h
    LOOP CETAK_BIT  ; Ulangi sampai 16 digit tercetak

; --- Cetak huruf 'b' di akhir ---
MOV DL, 'b'
MOV AH, 02h
INT 21h

; --- Program Selesai ---
MOV AX, 4C00h       ; Exit code
INT 21h

; AX sekarang berisi 8