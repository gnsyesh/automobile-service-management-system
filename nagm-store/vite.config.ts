import { defineConfig, loadEnv } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

export default defineConfig(({ mode }) => {
  // Strip UTF-8 BOM if present on any keys in process.env (e.g. from .env.local)
  for (const [key, value] of Object.entries(process.env)) {
    if (key.charCodeAt(0) === 0xfeff) {
      const cleanKey = key.slice(1);
      if (!process.env[cleanKey]) {
        process.env[cleanKey] = value;
      }
    }
  }

  const rawEnv = loadEnv(mode, process.cwd(), "");
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawEnv)) {
    const cleanKey = key.charCodeAt(0) === 0xfeff ? key.slice(1) : key;
    env[cleanKey] = value;
    if (!process.env[cleanKey]) {
      process.env[cleanKey] = value;
    }
  }

  const publicEnvDefines = Object.keys(env).reduce((acc, key) => {
    if (key.startsWith("NEXT_PUBLIC_")) {
      acc[`process.env.${key}`] = JSON.stringify(env[key]);
    }
    return acc;
  }, {} as Record<string, string>);

  return {
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],

    define: publicEnvDefines,

    plugins: [
      vinext({
        images: { optimizer: imagesOptimizer() },
      }),
      cloudflare({
        viteEnvironment: {
          name: "rsc",
          childEnvironments: ["ssr"],
        },
      }),
    ],

    build: {
      chunkSizeWarningLimit: 1000,
    },
  };
});