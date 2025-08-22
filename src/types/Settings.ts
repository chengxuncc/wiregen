// Network-wide settings for WireGuard configurations

export interface AmneziaWGSettings {
  enabled?: boolean;
  H1?: number;
  H2?: number;
  H3?: number;
  H4?: number;
  S1?: number;
  S2?: number;
  Jc?: number;
  Jmin?: number;
  Jmax?: number;
  I1?: string;
  I2?: string;
  I3?: string;
  I4?: string;
  I5?: string;
}

export interface Settings {
  mtu?: number; // Maximum Transmission Unit (default: 1380 for WireGuard)
  IPv4CIDR?: string; // IPv4 CIDR for new configurations
  IPv6CIDR?: string; // IPv6 CIDR for new configurations
  persistentKeepalive?: number; // persistent keepalive in seconds
  listenPort?: number; // listen port for new configurations
  amneziaWG?: AmneziaWGSettings; // AmneziaWG protocol imitation / obfuscation parameters
}

export const DEFAULT_SETTINGS: Settings = {
  IPv4CIDR: '10.0.10.0/24',
  IPv6CIDR: 'fd10::/64',
  mtu: 1380,
  listenPort: 51821,
  persistentKeepalive: undefined,
  amneziaWG: {
    enabled: false,
    H1: undefined,
    H2: undefined,
    H3: undefined,
    H4: undefined,
    S1: undefined,
    S2: undefined,
    Jc: undefined,
    Jmin: undefined,
    Jmax: undefined,
    I1: undefined,
    I2: undefined,
    I3: undefined,
    I4: undefined,
    I5: undefined,
  }
};