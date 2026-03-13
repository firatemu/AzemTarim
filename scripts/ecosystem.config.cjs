module.exports = {
  apps: [{
    name: 'otomuhasebe-landing',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3006',
    cwd: '/var/www/otomuhasebe-landing',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3006,
    },
    error_file: '/var/log/otomuhasebe/landing/error.log',
    out_file: '/var/log/otomuhasebe/landing/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};

