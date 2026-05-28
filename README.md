<div align="center">
  
# 🔐 Lumen-Pass

**Secure, Premium, Local-First Password Manager**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-Fast-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![License](https://img.shields.io/badge/License-GPL_v3-blue.svg?style=for-the-badge)

<br/>

Lumen-Pass is a highly secure, feature-rich password manager built with modern web technologies. It encrypts all your sensitive data locally in the browser using the **Web Crypto API**, ensuring absolute zero-knowledge privacy.

[Features](#-features) • [Installation](#-installation) • [Security](#-security) • [License](#-license)

</div>

<hr/>

## ✨ Features

### 💎 Premium Glassmorphism Design
Experience a beautiful dark-mode interface featuring dynamic blurs, sleek animations, and Apple-inspired UI elements that make managing passwords a joy.

### 💳 Smart Credit Card Wallet
Store your credit cards securely. The app auto-detects brands (**Visa, Mastercard, Amex, Troy, Discover, UnionPay**) and generates stunning, realistic premium metal & glass card mockups.

### 🛡️ Built-in TOTP Authenticator
Never need a separate 2FA app again. 
- Generates standard RFC-6238 TOTP codes. 
- See live countdown rings, current, and upcoming codes instantly. 
- Link 2FA codes directly to your stored login credentials.

### 👆 Passkey (WebAuthn) Support
Create, store, and manage modern Passkeys internally. Enjoy passwordless authentication right from your vault without relying on external providers.

### 🔐 Advanced Password Generator
Generate cryptographically secure passwords up to **512 characters**. Configure specific requirements like *"minimum numbers"* and *"minimum symbols"* to satisfy the most strict website policies.

### 🌐 Smart URL Management
Link multiple website URLs to a single login entry. Includes built-in **HTTP insecure link detection** with visual warnings to keep you safe from phishing.

### 🖱️ Intelligent Context Menus
Right-click anywhere or on specific items to quickly copy specialized fields (like a Card's CVV, a Login's URL, or a TOTP Secret) or to add new items instantly.

---

## 🚀 Installation & Usage

Lumen-Pass is designed to be easily spun up in any Node.js environment.

### Prerequisites
- Node.js (v18 or higher recommended)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/lumen-pass.git

# 2. Navigate into the directory
cd lumen-pass

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

---

## 🛠 Tech Stack

| Technology | Description |
| --- | --- |
| **React 19 & Vite** | Lightning-fast UI rendering and blazing fast build tooling. |
| **TypeScript** | Strongly typed, robust codebase. |
| **Vanilla CSS** | Pure CSS variables and Glassmorphism design system without heavy styling libraries. |
| **Web Crypto API** | Native `SubtleCrypto` for PBKDF2 key derivation and AES-256-GCM encryption. |
| **Lucide React** | Beautiful, consistent iconography. |

---

## 🔒 Security

Lumen-Pass is a **local-first** password manager designed to run entirely inside your browser. 
- **No Data Collection:** Your master password and vault data never leave your local machine.
- **AES-256-GCM Encryption:** State-of-the-art encryption standards.
- **Client-Side Only:** Because there is no backend, you are fully in control of your own data and security environment.

> **Note:** As a local-first application, its security relies on the integrity of your local operating system and browser. Always keep your OS updated and free of malware.

---

## 📜 License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**. 
See the `LICENSE` file for more details.

<div align="center">
  <i>Built with ❤️ for privacy and security.</i>
</div>
