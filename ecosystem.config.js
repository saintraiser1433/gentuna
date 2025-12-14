module.exports = {
    apps: [
      {
        name: "nextjs-app",
        script: "node_modules/next/dist/bin/next",
        args: "start -p 3000",
        cwd: "./",
        instances: 1,
        exec_mode: "fork",
        watch: false,
        autorestart: true,
        max_memory_restart: "500M",
        env: {
          NODE_ENV: "production"
        },
        error_file: "logs/error.log",
        out_file: "logs/output.log",
        log_date_format: "YYYY-MM-DD HH:mm:ss"
      }
    ]
  };
  