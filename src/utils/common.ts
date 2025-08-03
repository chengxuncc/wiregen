export const validateIPAddress = (ip: string): string | undefined => {
  if (!ip) {
    return 'IP address is required';
  }
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^([0-9a-fA-F0-9:]+:+)+[0-9a-fA-F]+$/;
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
    return 'Invalid Public key';
  }
  return undefined;
};

export const validatePrivateKey = (key: string): string | undefined => {
  if (!key) {
    return 'Private key is required';
  }
  const keyRegex = /^[A-Za-z0-9+/]{43}=$/;
  if (!keyRegex.test(key)) {
    return 'Invalid Private key';
  }
  return undefined;
};

export const validatePresharedKey = (key?: string): string | undefined => {
  if (!key) {
    return undefined;
  }
  const keyRegex = /^[A-Za-z0-9+/]{43}=$/;
  if (!keyRegex.test(key)) {
    return 'Invalid Preshared key';
  }
  return undefined;
};

export const validateEndpoint = (endpoint?: string): string | undefined => {
  if (!endpoint) {
    return undefined;
  }
  const endpointRegex = /^([^:]+|\[[0-9a-fA-F0-9:]+\]):\d{1,5}$/;
  if (!endpointRegex.test(endpoint)) {
    return 'Invalid endpoint format (e.g., example.com:51820)';
  }
  return undefined;
};

export const validateHost = (host?: string): string | undefined => {
  if (!host) {
    return undefined;
  }
  const hostRegex = /^[^:]+|([0-9a-fA-F0-9:]+:+)+[0-9a-fA-F]+$/;
  if (!hostRegex.test(host)) {
    return 'Invalid host format (e.g., example.com, 1.1.1.1, 2001:db8::1)';
  }
  return undefined;
};

export const validatePersistentKeepalive = (value: number): string | undefined => {
  if (value < 0 || value > 65535) {
    return 'Persistent keepalive must be between 0 and 65535';
  }
  return undefined;
};

export function dateToLocalISO(date: Date) {
  const off = date.getTimezoneOffset()
  const absoff = Math.abs(off)
  return (new Date(date.getTime() - off * 60 * 1000).toISOString().substr(0, 23) +
    (off > 0 ? '-' : '+') +
    Math.floor(absoff / 60).toFixed(0).padStart(2, '0') + ':' +
    (absoff % 60).toString().padStart(2, '0'))
}

export function concatHostPort(host?: string, port?: number): string | undefined {
  if (!host || !port) return undefined;
  if (host.includes(':')) {
    return `[${host}]:${port.toString()}`;
  }
  return `${host}:${port.toString()}`;
}