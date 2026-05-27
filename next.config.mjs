/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  // Imagens do Supabase Storage e avatars públicos podem ser hospedadas em
  // domínios variáveis; permitir genericamente via NEXT_PUBLIC_SUPABASE_URL.
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [
          {
            protocol: "https",
            hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sentry.io https://*.vercel-insights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; font-src 'self'; connect-src 'self' https://*.supabase.co https://*.sentry.io wss://*.supabase.co; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

// PWA opcional. Habilita quando ENABLE_PWA=true.
async function withMaybePWA(cfg) {
  if (process.env.ENABLE_PWA !== "true" || process.env.NODE_ENV !== "production") {
    return cfg;
  }
  try {
    const { default: nextPwa } = await import("next-pwa");
    const withPWA = nextPwa({
      dest: "public",
      register: true,
      skipWaiting: true,
    });
    return withPWA(cfg);
  } catch (err) {
    console.warn("[next-pwa] não foi possível carregar, seguindo sem service worker.", err);
    return cfg;
  }
}

export default await withMaybePWA(baseConfig);
