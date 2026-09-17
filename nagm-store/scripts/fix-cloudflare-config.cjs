const fs = require("fs");

const path = "dist/server/wrangler.json";

const config = JSON.parse(fs.readFileSync(path, "utf8"));

config.name = "negm-store";

config.observability = {
  enabled: true,
  logs: {
    enabled: true,
    head_sampling_rate: 1,
    invocation_logs: true,
    persist: true
  },
  traces: {
    enabled: false
  }
};

fs.writeFileSync(path, JSON.stringify(config, null, 2) + "\n");

console.log("Cloudflare Wrangler config updated:");
console.log("- Worker name: negm-store");
console.log("- Observability logs: enabled");
