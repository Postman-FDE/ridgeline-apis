/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Keep the sandbox's demo-only folders out of the build output.
  outputFileTracingExcludes: { '*': ['./sdks/**', './demo/**', './passport/**', './postman/**', './docs/**'] },
};

export default nextConfig;
