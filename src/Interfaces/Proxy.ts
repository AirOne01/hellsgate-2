/**
 * Represents a proxy.
 * @param host Proxy address
 * @param privacy Not required. Represents proxy anonimity level. Can be 'transparent', 'anonymous' or 'elite'.
 * @remark transparent The proxy will forward the original IP with the request via the X-Forwarded-Host header.
 * @remark anonymous   The original IP will not be forwarded, but the proxy will inform the receiver that the call was proxied.
 * @remark elite       Behaves like a normal request. This is "fully" anonymous.
 */
interface Proxy {
  host: string;
  privacy?: 'transparent' | 'anonymous' | 'elite';
}

export { Proxy }