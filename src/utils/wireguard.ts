// Utility functions for WireGuard key handling
import { x25519 } from '@noble/curves/ed25519';

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function getPublicKey(privateKeyBase64: string): string {
  try {
    const privateKeyRaw = base64ToUint8Array(privateKeyBase64);
    if (privateKeyRaw.length !== 32) return '';
    const publicKeyRaw = x25519.getPublicKey(privateKeyRaw);
    let binary = '';
    for (let i = 0; i < publicKeyRaw.length; i++) {
      binary += String.fromCharCode(publicKeyRaw[i]);
    }
    return btoa(binary);
  } catch (e) {
    console.error('Error generating public key:', privateKeyBase64, e);
    return '';
  }
}

export function generatePrivateKey(): string {
  // Generate a 32-byte random private key and return as base64
  const array = new Uint8Array(32);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    // fallback for environments without window.crypto
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  let binary = '';
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary);
}
