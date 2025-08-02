
export const validateIPAddress = (ip: string): string | undefined => {
  if (!ip) {
    return 'IP address is required';
  }
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    return 'Invalid IP address format';
  }
  return undefined;
};

export const validateCIDR = (cidr: string): string | undefined => {
  if (!cidr) {
    return 'CIDR is required';
  }
  const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
  const ipv6CidrRegex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}\/(?:[0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$/;
  if (!ipv4CidrRegex.test(cidr) && !ipv6CidrRegex.test(cidr)) {
    return 'Invalid CIDR format (e.g., 192.168.1.0/24 or fd00::/64)';
  }
  return undefined;
};

export const validateIPv4CIDR = (cidr: string): string | undefined => {
  if (!cidr) return undefined;
  const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
  if (!ipv4CidrRegex.test(cidr)) {
    return 'Invalid IPv4 CIDR format (e.g., 192.168.1.0/24)';
  }
  return undefined;
};

export const validateIPv6CIDR = (cidr: string): string | undefined => {
  if (!cidr) return undefined;
  const ipv6CidrRegex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}\/(?:[0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$/;
  if (!ipv6CidrRegex.test(cidr)) {
    return 'Invalid IPv6 CIDR format (e.g., fd00::/64)';
  }
  return undefined;
};

export const validatePort = (port?: number): string | undefined => {
  if (port === undefined) {
    return undefined;
  }
  if (port < 1 || port > 65535) {
    return 'Port must be between 1 and 65535';
  }
  return undefined;
};

export const validateMTU = (mtu: number): string | undefined => {
  if (mtu < 1280 || mtu > 9000) {
    return 'MTU must be between 1280 and 9000';
  }
  return undefined;
};

export const validatePublicKey = (key: string): string | undefined => {
  if (!key) {
    return 'Public key is required';
  }
  const keyRegex = /^[A-Za-z0-9+/]{43}=$/;
  if (!keyRegex.test(key)) {
    return 'Invalid WireGuard public key format';
  }
  return undefined;
};

export const validatePrivateKey = (key: string): string | undefined => {
  if (!key) {
    return 'Private key is required';
  }
  const keyRegex = /^[A-Za-z0-9+/]{43}=$/;
  if (!keyRegex.test(key)) {
    return 'Invalid WireGuard private key format';
  }
  return undefined;
};

export const validatePresharedKey = (key?: string): string | undefined => {
  if (!key) {
    return undefined;
  }
  const keyRegex = /^[A-Za-z0-9+/]{43}=$/;
  if (!keyRegex.test(key)) {
    return 'Invalid WireGuard preshared key format';
  }
  return undefined;
};

export const validateEndpoint = (endpoint?: string): string | undefined => {
  if (!endpoint) {
    return undefined;
  }
  const endpointRegex = /^[^:]+:\d+$/;
  if (!endpointRegex.test(endpoint)) {
    return 'Invalid endpoint format (e.g., example.com:51820)';
  }
  return undefined;
};

export const validatePersistentKeepalive = (value: number): string | undefined => {
  if (value < 0 || value > 65535) {
    return 'Persistent keepalive must be between 0 and 65535';
  }
  return undefined;
};
