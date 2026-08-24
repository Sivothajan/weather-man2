import type { NextConfig } from 'next';

const isDocker = process.env.DOCKER === 'true';

const nextConfig: NextConfig = {
  agentRules: false,
  experimental: {
    globalNotFound: true,
  },
  output: isDocker ? 'standalone' : undefined,
};

export default nextConfig;
