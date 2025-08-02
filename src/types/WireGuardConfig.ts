// WireGuard configuration types

export interface PeerConfig {
  publicKey: string;
  allowedIPs: string[];
  endpoint?: string;
  persistentKeepalive?: number;
  presharedKey?: string;
  // Optionally reference another config as a peer
  configId?: string;
}

export interface InterfaceConfig {
  privateKey: string;
  listenPort?: number;
  endpoint?: string;
  address: string[];
  dns: string[];
  postUp?: string;
  postDown?: string;
}

export interface WireGuardConfig {
  id: string;
  name: string;
  interface: InterfaceConfig;
  peers: PeerConfig[];
  enableAllPeers?: boolean;
  createdAt: Date;
  updatedAt: Date;
}