#!/usr/bin/env python3
"""Simulatore DLMS completo."""
import socket, sys, argparse, threading
from datetime import datetime

HOST, PORT = "127.0.0.1", 4059

FCS16Table = [
    0x0000, 0x1189, 0x2312, 0x329B, 0x4624, 0x57AD, 0x6536, 0x74BF,
    0x8C48, 0x9DC1, 0xAF5A, 0xBED3, 0xCA6C, 0xDBE5, 0xE97E, 0xF8F7,
    0x1081, 0x0108, 0x3393, 0x221A, 0x56A5, 0x472C, 0x75B7, 0x643E,
    0x9CC9, 0x8D40, 0xBFDB, 0xAE52, 0xDAED, 0xCB64, 0xF9FF, 0xE876,
    0x2102, 0x308B, 0x0210, 0x1399, 0x6726, 0x76AF, 0x4434, 0x55BD,
    0xAD4A, 0xBCC3, 0x8E58, 0x9FD1, 0xEB6E, 0xFAE7, 0xC87C, 0xD9F5,
    0x3183, 0x200A, 0x1291, 0x0318, 0x77A7, 0x662E, 0x54B5, 0x453C,
    0xBDCB, 0xAC42, 0x9ED9, 0x8F50, 0xFBEF, 0xEA66, 0xD8FD, 0xC974,
    0x4204, 0x538D, 0x6116, 0x709F, 0x0420, 0x15A9, 0x2732, 0x36BB,
    0xCE4C, 0xDFC5, 0xED5E, 0xFCD7, 0x8868, 0x99E1, 0xAB7A, 0xBAF3,
    0x5285, 0x430C, 0x7197, 0x601E, 0x14A1, 0x0528, 0x37B3, 0x263A,
    0xDECD, 0xCF44, 0xFDDF, 0xEC56, 0x98E9, 0x8960, 0xBBFB, 0xAA72,
    0x6306, 0x728F, 0x4014, 0x519D, 0x2522, 0x34AB, 0x0630, 0x17B9,
    0xEF4E, 0xFEC7, 0xCC5C, 0xDDD5, 0xA96A, 0xB8E3, 0x8A78, 0x9BF1,
    0x7387, 0x620E, 0x5095, 0x411C, 0x35A3, 0x242A, 0x16B1, 0x0738,
    0xFFCF, 0xEE46, 0xDCDD, 0xCD54, 0xB9EB, 0xA862, 0x9AF9, 0x8B70,
    0x8408, 0x9581, 0xA71A, 0xB693, 0xC22C, 0xD3A5, 0xE13E, 0xF0B7,
    0x0840, 0x19C9, 0x2B52, 0x3ADB, 0x4E64, 0x5FED, 0x6D76, 0x7CFF,
    0x9489, 0x8500, 0xB79B, 0xA612, 0xD2AD, 0xC324, 0xF1BF, 0xE036,
    0x18C1, 0x0948, 0x3BD3, 0x2A5A, 0x5EE5, 0x4F6C, 0x7DF7, 0x6C7E,
    0xA50A, 0xB483, 0x8618, 0x9791, 0xE32E, 0xF2A7, 0xC03C, 0xD1B5,
    0x2942, 0x38CB, 0x0A50, 0x1BD9, 0x6F66, 0x7EEF, 0x4C74, 0x5DFD,
    0xB58B, 0xA402, 0x9699, 0x8710, 0xF3AF, 0xE226, 0xD0BD, 0xC134,
    0x39C3, 0x284A, 0x1AD1, 0x0B58, 0x7FE7, 0x6E6E, 0x5CF5, 0x4D7C,
    0xC60C, 0xD785, 0xE51E, 0xF497, 0x8028, 0x91A1, 0xA33A, 0xB2B3,
    0x4A44, 0x5BCD, 0x6956, 0x78DF, 0x0C60, 0x1DE9, 0x2F72, 0x3EFB,
    0xD68D, 0xC704, 0xF59F, 0xE416, 0x90A9, 0x8120, 0xB3BB, 0xA232,
    0x5AC5, 0x4B4C, 0x79D7, 0x685E, 0x1CE1, 0x0D68, 0x3FF3, 0x2E7A,
    0xE70E, 0xF687, 0xC41C, 0xD595, 0xA12A, 0xB0A3, 0x8238, 0x93B1,
    0x6B46, 0x7ACF, 0x4854, 0x59DD, 0x2D62, 0x3CEB, 0x0E70, 0x1FF9,
    0xF78F, 0xE606, 0xD49D, 0xC514, 0xB1AB, 0xA022, 0x92B9, 0x8330,
    0x7BC7, 0x6A4E, 0x58D5, 0x495C, 0x3DE3, 0x2C6A, 0x1EF1, 0x0F78,
]

CSEQ = 0  # server send sequence
RSEQ = 0  # expected receive sequence

def ts(): return datetime.now().strftime("%H:%M:%S.%f")[:-3]

def dump(data, label=""):
    s = f"[{ts()}] [{label}] {len(data)} byte:"
    asc = ""
    for i, b in enumerate(data):
        if i % 16 == 0:
            if asc: s += f"   {asc}"; asc = ""
            s += f"\n  {i:04x}  "
        s += f"{b:02x} "
        asc += chr(b) if 0x20 <= b <= 0x7e else "."
    if asc: s += "   " * (16 - len(data) % 16) + f"   {asc}"
    return s

def fcs16(data):
    fcs = 0xFFFF
    for b in data:
        fcs = (fcs >> 8) ^ FCS16Table[(fcs ^ b) & 0xFF]
    fcs = (~fcs) & 0xFFFF
    return ((fcs >> 8) & 0xFF) | ((fcs & 0xFF) << 8)

def hdlc_frame(prim, sec, ctrl, apdu):
    fmt = 0xA0
    llc = bytes([0xE6, 0xE6, 0x00]) if apdu else b""
    data_len = len(llc) + len(apdu)
    if data_len:
        length = 7 + 1 + 1 + data_len  # fmt+len+ctrl+hcs+fcs + addrs + data
    else:
        length = 5 + 1 + 1  # fmt+len+ctrl+hcs + addrs
    hdr = bytes([fmt, length, prim, sec, ctrl])
    hcs = fcs16(hdr)
    body = hdr + hcs.to_bytes(2, "big") + llc + apdu
    fcs = fcs16(body) if data_len else 0
    if data_len:
        return b"\x7e" + body + fcs.to_bytes(2, "big") + b"\x7e"
    return b"\x7e" + body + b"\x7e"

def extract_calling_auth(aarq):
    """Extract calling-authentication OCTET STRING from AARQ, returns raw bytes or None."""
    i = 0
    while i < len(aarq):
        tag = aarq[i]
        if tag == 0xBE:
            # calling-authentication [30]
            length = aarq[i + 1]
            if i + 2 + length <= len(aarq):
                auth_container = aarq[i + 2 : i + 2 + length]
                # OCTET STRING inside: 04 <len> <data>
                if auth_container and auth_container[0] == 0x04:
                    inner_len = auth_container[1]
                    return auth_container[2:2 + inner_len]
                return auth_container
            break
        elif tag in (0x60, 0x61):
            i += 1
        elif tag in (0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87):
            # Primitive context tag
            i += 2 + aarq[i + 1]
        elif tag in (0xA0, 0xA1, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7,
                      0xA8, 0xA9, 0xAA, 0xAB, 0xAC, 0xAD, 0xAE, 0xAF,
                      0xBE, 0xBF):
            # Constructed context tag
            length = aarq[i + 1]
            i += 2 + length
        elif tag == 0x04:
            i += 2 + aarq[i + 1]
        elif tag == 0x06:
            i += 2 + aarq[i + 1]
        elif tag == 0x02:
            i += 2 + aarq[i + 1]
        else:
            i += 1
    return None

def build_aare(aarq_data=None):
    inner = bytes([
        0x80, 0x01, 0x00,                          # protocol-version = 0
        0xA1, 0x09, 0x06, 0x07,                    # app-context-name
        0x60, 0x85, 0x74, 0x05, 0x08, 0x01, 0x01, # DLMS UA OID
        0xA2, 0x03, 0x02, 0x01, 0x00,              # result = accepted(0)
        0xA3, 0x05, 0xA0, 0x03, 0x02, 0x01, 0x00, # diag: provider [0], no-reason
    ])
    # Add responder-authentication if calling-authentication was present
    if aarq_data:
        auth = extract_calling_auth(aarq_data)
        if auth:
            resp_auth = bytes([0x89, len(auth)]) + auth
            inner += resp_auth
    apdu = bytes([0x61, len(inner)]) + inner
    return apdu

METER_VALUES = {
    "1.0.32.7.0.255": 23040,   # L1 voltage (230.40 V)
    "1.0.31.7.0.255": 500,     # L1 current (5.00 A)
    "1.0.1.8.0.255": 12345,    # Total active energy +
}

def build_get_response():
    # Build GET.response with simulated values
    data = bytes([0x01, 0x00, 0x00, 0x00, 0x06, 0x5F, 0x1F, 0x04, 0x00, 0x00, 0x1E, 0x5D])
    # Simulated voltage reading
    val = bytes([0x06, 0x5F, 0x1F, 0x04, 0x00, 0x00, 0x1E, 0x5D])
    apdu = bytes([0xC4, 0x01, 0x01, 0x02, 0x09, 0x06, 0x00, 0x01, 0x00, 0x00, 0x00, 0xFF, 0x0A, 0x00, 0x00])
    return apdu

def handle_apdu(conn, apdu, prim, sec, ns):
    global CSEQ, RSEQ
    if len(apdu) == 0:
        return False
    tag = apdu[0]
    print(f"[{ts()}] [APDU] tag=0x{tag:02x} len={len(apdu)}")
    
    if tag == 0x60:
        # AARQ -> AARE
        aarq_data = apdu
        aare = build_aare(aarq_data)
        resp = hdlc_frame(sec, prim, 0x30, aare)  # N(R)=1, F=1, N(S)=0
        conn.sendall(resp)
        print(dump(resp, "TX: AARE"))
        CSEQ = 0
        RSEQ = 0  # reset after association
        # After AARE, send RR with P=1 to poll the client
        prim_srv, sec_srv = sec, prim
        rr_ctrl = 0x01 | (0x01 << 1) | (1 << 4) | (0 << 5)  # N(R)=0, P=1
        hdr_rr = bytes([0xA0, 0x07, prim_srv, sec_srv, rr_ctrl])
        crc_rr = fcs16(hdr_rr)
        rr = b"\x7e" + hdr_rr + crc_rr.to_bytes(2, "big") + b"\x7e"
        conn.sendall(rr)
        print(dump(rr, "TX: RR-Poll"))
        return True
    
    elif tag == 0xC0 or tag == 0x30:
        # GET.request -> GET.response (swap addresses)
        get_resp = build_get_response()
        ns = CSEQ + 1
        nr = ns + 1
        ctrl = (nr << 5) | (1 << 4) | (ns << 1) | 0  # N(R)=nr, F=1, N(S)=ns
        resp = hdlc_frame(sec, prim, ctrl, get_resp)
        conn.sendall(resp)
        print(dump(resp, "TX: GET.response"))
        CSEQ = ns
        return True
    
    else:
        print(f"[{ts()}] [APDU] tag sconosciuto 0x{tag:02x}")
        return False

def client(conn, addr):
    global CSEQ, RSEQ
    CSEQ = 0; RSEQ = 0
    print(f"[{ts()}] [OK] {addr[0]}:{addr[1]}")
    buf = b""
    conn.settimeout(10)
    try:
        while True:
            d = conn.recv(4096)
            if not d: break
            print(dump(d, "RX"))
            buf += d
            while True:
                i = buf.find(b"\x7e")
                if i < 0: buf = b""; break
                if i > 0: buf = buf[i:]
                j = buf.find(b"\x7e", 1)
                if j < 0: break
                raw = buf[1:j]
                buf = buf[j+1:]
                print(f"[{ts()}] [FRAME] raw = {' '.join(f'{b:02x}' for b in raw)}")
                if len(raw) < 5:
                    continue
                fmt = raw[0]
                if (fmt & 0xF0) != 0xA0:
                    continue
                addr1 = raw[2]; addr2 = raw[3]; ctrl = raw[4]
                print(f"[{ts()}] [HDLC] fmt=0x{fmt:02x} len={raw[1]} a1=0x{addr1:02x} a2=0x{addr2:02x} ctrl=0x{ctrl:02x}")
                
                if ctrl == 0x93 or ctrl == 0x83:
                    # SNRM -> UA
                    prim, sec = addr2, addr1
                    hdr = bytes([0xA0, 0x07, prim, sec, 0x73])
                    crc = fcs16(hdr)
                    ua = b"\x7e" + hdr + crc.to_bytes(2, "big") + b"\x7e"
                    conn.sendall(ua)
                    print(dump(ua, "TX: UA"))
                elif (ctrl & 1) == 1:
                    # S-frame
                    pf = (ctrl >> 4) & 1
                    nr = (ctrl >> 5) & 7
                    print(f"[{ts()}] [S-frame] P/F={pf} N(R)={nr}")
                    if pf:
                        # RR P=1: respond with RR F=1, N(R)=nr
                        prim_srv, sec_srv = addr2, addr1
                        resp_ctrl = 0x01 | (0x01 << 1) | (1 << 4) | (nr << 5)
                        hdr = bytes([0xA0, 0x07, prim_srv, sec_srv, resp_ctrl])
                        crc = fcs16(hdr)
                        rr = b"\x7e" + hdr + crc.to_bytes(2, "big") + b"\x7e"
                        conn.sendall(rr)
                        print(dump(rr, "TX: RR"))
                elif ctrl in (0x10, 0x30, 0x00, 0x20, 0x50, 0x70):
                    # I-frame (bit 0 = 0): extract APDU after LLC (E6 E6 00)
                    # Find LLC marker
                    llc_pos = raw.find(b"\xe6\xe6\x00")
                    if llc_pos > 0:
                        apdu_start = llc_pos + 3
                        apdu = raw[apdu_start:]
                        handle_apdu(conn, apdu, raw[2], raw[3], (ctrl >> 1) & 7)
                    else:
                        print(f"[{ts()}] [I-frame] no LLC")
                else:
                    print(f"[{ts()}] ? ctrl 0x{ctrl:02x}")
    except socket.timeout:
        print(f"[{ts()}] [TIMEOUT]")
    except Exception as e:
        print(f"[{ts()}] [ERR] {e}")
    finally:
        conn.close()
        print(f"[{ts()}] [CHIUSO] {addr[0]}:{addr[1]}")

def run(port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind((HOST, port)); s.listen(5)
    print(f"[{ts()}] Server su {HOST}:{port}")
    try:
        while True:
            c, a = s.accept()
            threading.Thread(target=client, args=(c, a), daemon=True).start()
    except KeyboardInterrupt:
        print(f"\n[{ts()}] Stop")
    finally:
        s.close()

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--listen", type=int, default=0)
    p.add_argument("--connect-port", type=int, default=PORT)
    a = p.parse_args()
    print("=== Simulatore DLMS ===")
    run(a.listen) if a.listen else None

if __name__ == "__main__":
    main()
