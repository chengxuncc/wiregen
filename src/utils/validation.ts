export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateRequired = (value: string, fieldName: string): string[] => {
  if (!value || value.trim() === '') {
    return [`${fieldName} is required`];
  }
  return [];
};

export const validateIPAddress = (ip: string): string[] => {
  const errors: string[] = [];
  
  if (!ip) {
    errors.push('IP address is required');
    return errors;
  }

  // Basic IP validation (IPv4 or IPv6)
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    errors.push('Invalid IP address format');
  }
  
  return errors;
};

export const validateCIDR = (cidr: string): string[] => {
  const errors: string[] = [];
  
  if (!cidr) {
    errors.push('CIDR is required');
    return errors;
  }

  const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]|[1-2][0-9]|3[0-2])$/;
  const ipv6CidrRegex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$/;
  
  if (!ipv4CidrRegex.test(cidr) && !ipv6CidrRegex.test(cidr)) {
    errors.push('Invalid CIDR format (e.g., 192.168.1.0/24 or fd00::/64)');
  }
  
  return errors;
};

export const validateIPv4CIDR = (cidr: string): string[] => {
  const errors: string[] = [];
  
  if (!cidr) return errors; // Optional field
  
  const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]|[1-2][0-9]|3[0-2])$/;
  
  if (!ipv4CidrRegex.test(cidr)) {
    errors.push('Invalid IPv4 CIDR format (e.g., 192.168.1.0/24)');
  }
  
  return errors;
};

export const validateIPv6CIDR = (cidr: string): string[] => {
  const errors: string[] = [];
  
  if (!cidr) return errors; // Optional field
  
  const ipv6CidrRegex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8])$/;
  
  if (!ipv6CidrRegex.test(cidr)) {
    errors.push('Invalid IPv6 CIDR format (e.g., fd00::/64)');
  }
  
  return errors;
};

export const validatePort = (port: number): string[] => {
  const errors: string[] = [];
  
  if (port < 1 || port > 65535) {
    errors.push('Port must be between 1 and 65535');
  }
  
  return errors;
};

export const validateMTU = (mtu: number): string[] => {
  const errors: string[] = [];
  
  if (mtu < 1280 || mtu > 9000) {
    errors.push('MTU must be between 1280 and 9000');
  }
  
  return errors;
};

export const validatePublicKey = (key: string): string[] => {
  const errors: string[] = [];
  
  if (!key) {
    errors.push('Public key is required');
    return errors;
  }

  // WireGuard public key validation (base64, 32 bytes)
  const keyRegex = /^[A-Za-z0-9+/]{43}=$/;
  
  if (!keyRegex.test(key)) {
    errors.push('Invalid WireGuard public key format');
  }
  
  return errors;
};

export const validatePrivateKey = (key: string): string[] => {
  const errors: string[] = [];
  
  if (!key) {
    errors.push('Private key is required');
    return errors;
  }

  // WireGuard private key validation (base64, 32 bytes)
  const keyRegex = /^[A-Za-z0-9+/]{43}=$/;
  
  if (!keyRegex.test(key)) {
    errors.push('Invalid WireGuard private key format');
  }
  
  return errors;
};

export const validateEndpoint = (endpoint: string): string[] => {
  const errors: string[] = [];
  
  if (!endpoint) {
    return errors; // Endpoint is optional
  }

  // Basic endpoint validation (host:port)
  const endpointRegex = /^[^:]+:\d+$/;
  
  if (!endpointRegex.test(endpoint)) {
    errors.push('Invalid endpoint format (e.g., example.com:51820)');
  }
  
  return errors;
};

export const validatePersistentKeepalive = (value: number): string[] => {
  const errors: string[] = [];
  
  if (value < 0 || value > 65535) {
    errors.push('Persistent keepalive must be between 0 and 65535');
  }
  
  return errors;
};

export const combineValidationResults = (results: ValidationResult[]): ValidationResult => {
  const allErrors = results.flatMap(result => result.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}; 