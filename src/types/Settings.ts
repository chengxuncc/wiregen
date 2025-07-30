// Network-wide settings for WireGuard configurations

export interface Settings {
  mtu?: number; // Maximum Transmission Unit (default: 1380 for WireGuard)
  defaultIPv4CIDR?: string; // Default IPv4 CIDR for new configurations
  defaultIPv6CIDR?: string; // Default IPv6 CIDR for new configurations
  defaultPersistentKeepalive?: number; // Default persistent keepalive in seconds
}

export const DEFAULT_SETTINGS: Settings = {
  mtu: 1380, // Standard WireGuard MTU
  defaultIPv4CIDR: '10.0.10.0/24', // Common private network
  defaultIPv6CIDR: 'fd10::/64', // ULA (Unique Local Address) range
  defaultPersistentKeepalive: 25, // Common default value
};