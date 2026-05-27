# 💡 LumenPass

LumenPass is a lightweight, web-based, **zero-knowledge** password manager designed with security and transparency at its core.

### 🛡️ Security Philosophy
- **Zero-Knowledge:** Your master password and decrypted data never leave your browser.
- **Client-Side Encryption:** All data is encrypted locally using `AES-256-GCM` before being sent to the server.
- **Key Derivation:** We use `PBKDF2` with high iteration counts to derive encryption keys from your master password.

### 📜 License
This project is licensed under the **GPLv3** - see the [LICENSE](LICENSE) file for details.
