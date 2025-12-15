module.exports = {
  apps: [
    {
      name: "lucky-draw-system",
      script: "./start-server.js",
      interpreter: "node",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true,
      max_memory_restart: "500M",
      min_uptime: "10s",
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DATABASE_URL: "file:./prisma/dev.db"
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        DATABASE_URL: "file:./prisma/dev.db"
      },
      // Logging
      error_file: "./logs/error.log",
      out_file: "./logs/output.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // Advanced options
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Auto restart on file changes (disabled for production)
      ignore_watch: ["node_modules", ".next", "logs", "*.log", "prisma/dev.db"]
    }
  ]
};
  