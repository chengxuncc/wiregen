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
  host?: string;
  address: string[];
  dns: string[];
  postUp?: string;
  postDown?: string;
}

export interface AmneziaWGConfig {
  Jc?: number;
  Jmin?: number;
  Jmax?: number;
  I1?: string;
  I2?: string;
  I3?: string;
  I4?: string;
  I5?: string;
}

export interface WireGuardConfig {
  id: string;
  name: string;
  interface: InterfaceConfig;
  peers: PeerConfig[];
  enableAllPeers?: boolean;
  createdAt: Date;
  updatedAt: Date;
  amneziaWG?: AmneziaWGConfig; // Per-config override for subset of AmneziaWG params
}