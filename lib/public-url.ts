type HeaderSource = Pick<Headers, "get">;

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || undefined;
}

export function getPublicOrigin(headers: HeaderSource, fallback?: string) {
  const forwardedHost = firstHeaderValue(headers.get("x-forwarded-host"));
  const forwardedProtocol = firstHeaderValue(headers.get("x-forwarded-proto"));

  if (forwardedHost) {
    return `${forwardedProtocol ?? "https"}://${forwardedHost}`;
  }

  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const host = firstHeaderValue(headers.get("host"));
  if (host) {
    const protocol = forwardedProtocol ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    return `${protocol}://${host}`;
  }

  return fallback ?? "http://localhost:3000";
}

export function getPublicUrl(path: string, headers: HeaderSource, fallback?: string) {
  return new URL(path, getPublicOrigin(headers, fallback));
}
