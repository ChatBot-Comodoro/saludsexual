module.exports = {
  apps: [
    {
      name: 'health-chatbot-app',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      cwd: '/path/to/your/app',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      watch: false,
      restart_delay: 3000,
      env: {
        NODE_ENV: 'production',
        PORT: 3010
      }
    }
  ]
};
