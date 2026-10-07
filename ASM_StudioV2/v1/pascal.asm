
ORG 100h

; =====================================
; SEGITIGA PASCAL
; Ubah DI untuk jumlah baris
; =====================================

MOV BP, 1              ; baris sekarang
MOV DI, 10             ; jumlah baris

ROW:
    MOV SI, 1          ; posisi elemen
    MOV AX, 1          ; angka pertama

ELEMENT:

    ; ---------------------------------
    ; Cetak nilai AX
    ; ---------------------------------
    PUSH AX
    CALL PRINT_NUM
    POP AX

    ; Cetak spasi
    PUSH AX
    MOV DL, 32
    MOV AH, 02h
    INT 21h
    POP AX

    ; ---------------------------------
    ; Cek akhir baris
    ; ---------------------------------
    CMP SI, BP
    JE NEXT_ROW

    ; ---------------------------------
    ; Rumus Pascal:
    ;
    ; next = current * (row - position)
    ;        / position
    ; ---------------------------------

    MOV BX, BP
    SUB BX, SI

    MUL BX

    XOR DX, DX
    DIV SI

    INC SI
    JMP ELEMENT


NEXT_ROW:

    ; CR
    MOV DL, 13
    MOV AH, 02h
    INT 21h

    ; LF
    MOV DL, 10
    MOV AH, 02h
    INT 21h

    INC BP
    CMP BP, DI
    JBE ROW

; =====================================
; Selesai
; =====================================

MOV AX, 4C00h
INT 21h


; =====================================
; PRINT_NUM
; Input : AX
; Mencetak AX dalam bentuk desimal
; Contoh:
; AX = 1   -> 1
; AX = 21  -> 21
; AX = 126 -> 126
; =====================================

PRINT_NUM:
    PUSH AX
    PUSH BX
    PUSH CX
    PUSH DX

    MOV BX, 10
    XOR CX, CX

    ; Jika AX = 0
    CMP AX, 0
    JNE CONVERT

    MOV DL, 48
    MOV AH, 02h
    INT 21h
    JMP PRINT_DONE


CONVERT:
    XOR DX, DX
    DIV BX

    PUSH DX
    INC CX

    CMP AX, 0
    JNE CONVERT


DISPLAY:
    POP DX

    ADD DL, 48

    MOV AH, 02h
    INT 21h

    LOOP DISPLAY


PRINT_DONE:
    POP DX
    POP CX
    POP BX
    POP AX
    RET