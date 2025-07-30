// Network-wide settings for WireGuard configurations

export interface Settings {
  mtu?: number; // Maximum Transmission Unit (default: 1380 for WireGuard)
  IPv4CIDR?: string; // IPv4 CIDR for new configurations
  IPv6CIDR?: string; // IPv6 CIDR for new configurations
  persistentKeepalive?: number; // persistent keepalive in seconds
  listenPort?: number; // listen port for new configurations
}

export const DEFAULT_SETTINGS: Settings = {
  IPv4CIDR: '10.0.10.0/24',
  IPv6CIDR: 'fd10::/64',
  mtu: 1380,
  listenPort: 51821,
  persistentKeepalive: 15,
};