module.exports = {
  apps: [{
    name: 'panel-stage',
    script: 'npx',
    args: 'next dev --webpack',
    cwd: '/var/www/panel-stage/client',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'staging',
      PORT: 3010
    },
    error_file: '/root/.pm2/logs/panel-stage-error.log',
    out_file: '/root/.pm2/logs/panel-stage-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
