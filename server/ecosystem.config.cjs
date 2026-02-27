module.exports = {
  apps: [{
    name: "landscape-api",
    script: "dist/index.js",
    cwd: "/home/collin/landscape-game/server",
    exec_mode: "fork",
    node_args: "--env-file=.env",
    env: {
      NODE_ENV: "production",
      PORT: 3004,
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: "500M",
  }],
};
