// WireGuard configuration types

export interface PeerConfig {
  publicKey: string;
  allowedIPs: string[];
  endpoint?: string;
  persistentKeepalive?: number;
  presharedKey?: string;
}

export interface InterfaceConfig {
  privateKey: string;
  address: string[];
  listenPort?: number;
  dns?: string[];
}

export interface WireGuardConfig {
  id: string;
  name: string;
  interface: InterfaceConfig;
  peers: PeerConfig[];
  createdAt: Date;
  updatedAt: Date;
}