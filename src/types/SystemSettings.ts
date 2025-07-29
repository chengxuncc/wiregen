// System-wide settings for WireGuard configurations

export interface SystemSettings {
  mtu?: number; // Maximum Transmission Unit (default: 1380 for WireGuard)
  defaultPersistentKeepalive?: number; // Default persistent keepalive in seconds
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  mtu: 1380, // Standard WireGuard MTU
  defaultPersistentKeepalive: 25, // Common default value
};