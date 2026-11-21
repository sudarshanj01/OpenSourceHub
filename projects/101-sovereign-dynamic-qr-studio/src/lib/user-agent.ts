export interface ClientInfo {
  device: "Mobile" | "Tablet" | "Desktop" | "Bot";
  os: "iOS" | "Android" | "macOS" | "Windows" | "Linux" | "Unknown";
  browser: "Safari" | "Chrome" | "Firefox" | "Edge" | "Other";
}

export function parseUserAgent(ua: string | null): ClientInfo {
  if (!ua) {
    return { device: "Desktop", os: "Unknown", browser: "Other" };
  }

  const uaLower = ua.toLowerCase();

  // Detect Device
  let device: ClientInfo["device"] = "Desktop";
  if (/bot|crawler|spider|crawling/i.test(ua)) {
    device = "Bot";
  } else if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    device = "Tablet";
  } else if (/mobile|iphone|ipod|android/i.test(ua)) {
    device = "Mobile";
  }

  // Detect OS
  let os: ClientInfo["os"] = "Unknown";
  if (/iphone|ipad|ipod/i.test(ua)) {
    os = "iOS";
  } else if (/android/i.test(ua)) {
    os = "Android";
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macOS";
  } else if (/windows nt/i.test(ua)) {
    os = "Windows";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  }

  // Detect Browser
  let browser: ClientInfo["browser"] = "Other";
  if (/edg\//i.test(ua)) {
    browser = "Edge";
  } else if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) {
    browser = "Chrome";
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = "Safari";
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "Firefox";
  }

  return { device, os, browser };
}
