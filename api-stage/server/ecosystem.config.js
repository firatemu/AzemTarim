module.exports = {
  apps: [{
    name: 'api-stage',
    script: 'npm',
    args: 'run start:dev',
    cwd: '/var/www/api-stage/server',
    instances: 1,
    autorestart: true,
    watch: false, // NestJS kendi watch'ını kullanıyor
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3020
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3020,
      STAGING_DEFAULT_TENANT_ID: 'cmi5of04z0000ksb3g5eyu6ts'
    }
  }]
};
