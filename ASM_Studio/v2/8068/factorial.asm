
ORG 100h

; --- Cetak Nama ---
MOV DX, MSG_NAME
MOV AH, 09h
INT 21h

MOV DL, 0Dh
MOV AH, 02h
INT 21h
MOV DL, 0Ah
MOV AH, 02h
INT 21h

; --- Cetak Judul ---
MOV DX, MSG_TITLE
MOV AH, 09h
INT 21h

MOV DL, 0Dh
MOV AH, 02h
INT 21h
MOV DL, 0Ah
MOV AH, 02h
INT 21h

; ============================================

; ============================================
MOV CX, 6               ; UBAH ANGKA 6 INI untuk menghitung faktorial angka lain (misal 5 atau 7)
MOV AX, 1               ; Nilai awal faktorial selalu 1

HITUNG_FAKTORIAL:
    MUL CX              ; Kalikan AX dengan CX (AX = AX * CX)
    LOOP HITUNG_FAKTORIAL ; Kurangi CX dengan 1, lalu ulang sampai CX = 0

MOV BX, AX              ; Simpan hasil akhir hitungan nyata ke BX

; ============================================

; --- Cetak Teks "Hasil perhitungan = " ---
MOV DX, MSG_HASIL
MOV AH, 09h
INT 21h

; --- Proses Mencetak Angka Nyata ke Layar ---
MOV AX, BX              ; Pindahkan hasil hitungan kembali ke AX
MOV CX, 0               ; Reset counter digit
MOV BX, 10              ; Angka pembagi desimal

BAGI_DIGIT:
    XOR DX, DX          ; Bersihkan sisa bagi sebelumnya
    DIV BX              ; Bagi AX dengan 10. Hasil di AX, sisa di DX.
    PUSH DX             ; Simpan digit terakhir (sisa) ke stack
    INC CX              ; Tambah penghitung digit
    CMP AX, 0           ; Apakah hasil bagi sudah nol?
    JNE BAGI_DIGIT      ; Jika belum, bagi lagi

CETAK_DIGIT:
    POP DX              ; Ambil digit dari stack (membalik urutan angka agar benar)
    ADD DL, '0'         ; Tambah 30h agar menjadi teks ASCII
    MOV AH, 02h         ; Perintah cetak 1 karakter
    INT 21h
    LOOP CETAK_DIGIT    ; Ulangi sebanyak jumlah digit

; --- Program Selesai ---
MOV AX, 4C00h           ; Exit code
INT 21h

; --- Data Variabel String (TANPA ANGKA STATIS) ---
MSG_NAME:  DB "Bahrizal Helmi Mulyawan$"
MSG_TITLE: DB "Program Menghitung Faktorial Dinamis$"
MSG_HASIL: DB "Hasil perhitungan = $"
