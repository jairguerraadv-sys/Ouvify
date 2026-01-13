// Keep config simple; add Turbopack root to avoid monorepo warning
// Use a loose type to allow "turbopack" field without TS friction.
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
