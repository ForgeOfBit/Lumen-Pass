import { useState, useEffect } from 'react';
import { deriveKeyFromPassword, encryptData, decryptData, generateRandomSalt } from '../utils/crypto';

export type ItemType = 'login' | 'card' | 'note' | 'totp' | 'passkey';

export interface VaultItem {
  id: string;
  type: ItemType;
  title: string;
  // Login fields
  username?: string;
  password?: string;
  url?: string;
  urls?: string[];
  // Card fields
  cardHolder?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  // Note fields
  noteContent?: string;
  // TOTP fields
  issuer?: string;
  totpSecret?: string;
  linkedAccountId?: string; // links to a login item's id
  // Passkey fields (WebAuthn)
  rpId?: string;
  rpName?: string;
  passkeyUsername?: string;
  credentialId?: string;    // base64url encoded credential ID
  userHandle?: string;      // base64url encoded user handle
  publicKeyAlgorithm?: number; // -7 ES256, -257 RS256
  transports?: string[];
  createdAt?: string;
}

export function useVault() {
  const [isLocked, setIsLocked] = useState(true);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const salt = localStorage.getItem('lumenpass_salt');
    const encryptedVault = localStorage.getItem('lumenpass_encrypted_vault');
    setIsInitialized(!!(salt && encryptedVault));
  }, []);

  const saveVault = async (items: VaultItem[], key: CryptoKey) => {
    try {
      const rawJSON = JSON.stringify(items);
      const encryptedBase64 = await encryptData(rawJSON, key);
      localStorage.setItem('lumenpass_encrypted_vault', encryptedBase64);
      setVaultItems(items);
    } catch (err) {
      console.error(err);
      setError('Failed to auto-save encrypted vault data.');
    }
  };

  const initializeVault = async (password: string) => {
    try {
      setError(null);
      const salt = generateRandomSalt(16);
      localStorage.setItem('lumenpass_salt', salt);
      const key = await deriveKeyFromPassword(password, salt);
      setMasterKey(key);
      setVaultItems([]);
      setIsLocked(false);
      setIsInitialized(true);
      await saveVault([], key);
    } catch (err: any) {
      setError(`Initialization failed: ${err.message}`);
    }
  };

  const unlockVault = async (password: string) => {
    try {
      setError(null);
      const salt = localStorage.getItem('lumenpass_salt');
      const encryptedBase64 = localStorage.getItem('lumenpass_encrypted_vault');
      if (!salt || !encryptedBase64) throw new Error("Vault not found.");

      const key = await deriveKeyFromPassword(password, salt);
      const rawJSON = await decryptData(encryptedBase64, key);
      const items = JSON.parse(rawJSON);
      
      setMasterKey(key);
      setVaultItems(items);
      setIsLocked(false);
    } catch (err: any) {
      console.error(err);
      setError('Failed to decrypt vault. Please double-check your master password.');
    }
  };

  const lockVault = () => {
    setIsLocked(true);
    setMasterKey(null);
    setVaultItems([]);
    setError(null);
  };

  const addItem = async (item: VaultItem) => {
    if (!masterKey) return;
    const newItems = [...vaultItems, item];
    await saveVault(newItems, masterKey);
  };

  const updateItem = async (updatedItem: VaultItem) => {
    if (!masterKey) return;
    const newItems = vaultItems.map(item => item.id === updatedItem.id ? updatedItem : item);
    await saveVault(newItems, masterKey);
  };

  const deleteItem = async (id: string) => {
    if (!masterKey) return;
    const newItems = vaultItems.filter(item => item.id !== id);
    await saveVault(newItems, masterKey);
  };

  return {
    isLocked, isInitialized, masterKey, vaultItems, error,
    initializeVault, unlockVault, lockVault, addItem, updateItem, deleteItem
  };
}
