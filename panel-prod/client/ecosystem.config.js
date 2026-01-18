module.exports = {
  apps: [{
    name: 'panel-prod',
    script: 'node',
    args: '.next/standalone/server.js',
    cwd: '/var/www/panel-prod/client',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3011,
      HOST: '0.0.0.0'
    },
    error_file: '/root/.pm2/logs/panel-prod-error.log',
    out_file: '/root/.pm2/logs/panel-prod-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
