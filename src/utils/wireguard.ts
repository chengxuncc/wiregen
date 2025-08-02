// Utility functions for WireGuard key handling
import {x25519} from '@noble/curves/ed25519';
import {InterfaceConfig, PeerConfig, WireGuardConfig} from "../types/WireGuardConfig";
import {Settings} from "../types/Settings";
import {v4 as uuidv4} from "uuid";

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

export function parseWireGuardConfig(content: string, configName: string): WireGuardConfig {
  const lines = content.split('\n').map(line => line.trim());
  let currentSection: 'interface' | 'peer' | null = null;

  const interfaceConfig: InterfaceConfig = {
    privateKey: '',
    address: [],
    listenPort: undefined,
    dns: [],
  };

  const peers: PeerConfig[] = [];
  let currentPeer: PeerConfig | null = null;

  for (const line of lines) {
    if (line === '') continue;
    if (line.startsWith('#') && currentSection === 'interface' && line.includes('=')) {
      const i = line.indexOf('=');
      const key = line.slice(1, i).trim();
      const value = line.slice(i + 1).trim();
      switch (key.toLowerCase()) {
        case 'endpoint':
          interfaceConfig.endpoint = value;
          break;
      }
    }

    if (line === '[Interface]') {
      currentSection = 'interface';
      continue;
    }

    if (line === '[Peer]') {
      currentSection = 'peer';
      if (currentPeer) {
        peers.push(currentPeer);
      }
      currentPeer = {
        publicKey: '',
        allowedIPs: [],
        endpoint: undefined,
        persistentKeepalive: undefined,
        presharedKey: undefined,
      };
      continue;
    }

    if (!currentSection) {
      if (line.includes('=')) {
        throw new Error(`Configuration line "${line}" found outside of [Interface] or [Peer] section`);
      }
      continue;
    }

    if (!line.includes('=')) {
      throw new Error(`Invalid configuration line: "${line}". Expected format: Key = Value`);
    }
    const i = line.indexOf('=');
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (currentSection === 'interface') {
      switch (key.toLowerCase()) {
        case 'privatekey':
          interfaceConfig.privateKey = value;
          break;
        case 'address':
          interfaceConfig.address = value.split(',').map(addr => addr.trim());
          break;
        case 'listenport':
          interfaceConfig.listenPort = parseInt(value);
          break;
        case 'dns':
          interfaceConfig.dns = value.split(',').map(dns => dns.trim());
          break;
        case 'mtu':
          // MTU is optional, we can ignore it or store it
          break;
        case 'postup':
          interfaceConfig.postUp = value.replaceAll(";", "\n");
          break;
        case 'postdown':
          interfaceConfig.postDown = value.replaceAll(";", "\n");
          break;
        default:
          console.warn(`Unknown interface key: ${key}`);
      }
    } else if (currentSection === 'peer' && currentPeer) {
      switch (key.toLowerCase()) {
        case 'publickey':
          currentPeer.publicKey = value;
          break;
        case 'allowedips':
          currentPeer.allowedIPs = value.split(',').map(ip => ip.trim());
          break;
        case 'endpoint':
          currentPeer.endpoint = value;
          break;
        case 'persistentkeepalive':
          const keepalive = parseInt(value);
          if (isNaN(keepalive) || keepalive < 0) {
            throw new Error(`Invalid persistent keepalive: ${value}. Must be a non-negative number`);
          }
          currentPeer.persistentKeepalive = keepalive;
          break;
        case 'presharedkey':
          currentPeer.presharedKey = value;
          break;
        default:
          console.warn(`Unknown peer key: ${key}`);
      }
    }
  }

  // Add the last peer if there is one
  if (currentPeer) {
    peers.push(currentPeer);
  }

  return {
    id: uuidv4(),
    name: configName || 'Imported Configuration',
    interface: interfaceConfig,
    peers,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export function generateWireGuardConfig(settings: Settings, config: WireGuardConfig, allConfigs?: {
  [id: string]: WireGuardConfig
}): string {
  let content = '[Interface]\n';
  content += `PrivateKey = ${config.interface.privateKey}\n`;
  content += `# PublicKey = ${getPublicKey(config.interface.privateKey)}\n`;
  if (config.interface.endpoint) {
    content += `# Endpoint = ${config.interface.endpoint}\n`;
  }
  if (config.interface.address && config.interface.address.length > 0) {
    content += `Address = ${config.interface.address.join(', ')}\n`;
  }
  if (config.interface.listenPort) {
    content += `ListenPort = ${config.interface.listenPort}\n`;
  }
  if (config.interface.dns && config.interface.dns.length > 0) {
    content += `DNS = ${config.interface.dns.join(', ')}\n`;
  }
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

  let peers: PeerConfig[] = config.peers;
  if (config.enableAllPeers && allConfigs) {
    peers = peers.concat(Object.values(allConfigs)
      .filter(c => c.id !== config.id && c.interface.privateKey !== config.interface.privateKey)
      .filter(c => {
        const publicKey = getPublicKey(c.interface.privateKey);
        return peers.every(peer => peer.publicKey !== publicKey);
      })
      .map(c => peerFromConfig(c, settings)));
  }

  peers.forEach(peer => {
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

export function peerFromConfig(config: WireGuardConfig, settings: Settings): PeerConfig {
  // Map allowedIPs to /32 for IPv4 and /128 for IPv6
  const mappedAllowedIPs = (config.interface.address || []).map(addr => {
    if (addr.includes('.')) {
      // IPv4
      return addr.replace(/\/(\d+)$/, '/32');
    } else if (addr.includes(':')) {
      // IPv6
      return addr.replace(/\/(\d+)$/, '/128');
    }
    return addr;
  });
  return {
    publicKey: getPublicKey(config.interface.privateKey),
    allowedIPs: mappedAllowedIPs,
    endpoint: config.interface.endpoint,
    presharedKey: '',
    persistentKeepalive: settings.persistentKeepalive,
    configId: config.id
  };
}