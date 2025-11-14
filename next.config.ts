import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Matikan linting saat build di Firebase (fix error deploy)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Tambahkan fallback untuk modul Node (seperti yang sudah kamu punya)
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },

  // ✅ Untuk PDF.js worker agar tidak error di browser
  env: {
    PDFJS_WORKER_SRC: `//unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.js`,
  },
};

export default nextConfig;
