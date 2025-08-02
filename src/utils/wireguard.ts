// Utility functions for WireGuard key handling
import {x25519} from '@noble/curves/ed25519';
import {WireGuardConfig} from "../types/WireGuardConfig";
import {Settings} from "../types/Settings";

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

export function generateWireGuardConfig(settings: Settings, config: WireGuardConfig): string {
  let content = '[Interface]\n';
  content += `PrivateKey = ${config.interface.privateKey}\n`;
  content += `# PublicKey = ${getPublicKey(config.interface.privateKey)}\n`;
  if (config.interface.address && config.interface.address.length > 0) {
    content += `Address = ${config.interface.address.join(', ')}\n`;
  }
  if (config.interface.endpoint) {
    content += `# Endpoint = ${config.interface.endpoint}\n`;
  }

  if (config.interface.listenPort) {
    content += `ListenPort = ${config.interface.listenPort}\n`;
  }

  if (config.interface.dns && config.interface.dns.length > 0) {
    content += `DNS = ${config.interface.dns.join(', ')}\n`;
  }

  // Remove interface MTU from config text, use only settings.mtu
  const mtu = settings.mtu;
  if (mtu) {
    content += `MTU = ${mtu}\n`;
  }

  if (config.interface.postUp) {
    content += `PostUp = ${config.interface.postUp.replace(/\r?\n/g, '; ')}\n`;
  }
  if (config.interface.postDown) {
    content += `PostDown = ${config.interface.postDown.replace(/\r?\n/g, '; ')}\n`;
  }

  config.peers.forEach(peer => {
    content += '\n[Peer]\n';
    content += `PublicKey = ${peer.publicKey}\n`;
    if (peer.allowedIPs && peer.allowedIPs.length > 0) {
      content += `AllowedIPs = ${peer.allowedIPs.join(', ')}\n`;
    }

    if (peer.endpoint) {
      content += `Endpoint = ${peer.endpoint}\n`;
    }

    if (peer.persistentKeepalive !== undefined && peer.persistentKeepalive > 0) {
      content += `PersistentKeepalive = ${peer.persistentKeepalive}\n`;
    }

    if (peer.presharedKey) {
      content += `PresharedKey = ${peer.presharedKey}\n`;
    }
  });

  return content;
}