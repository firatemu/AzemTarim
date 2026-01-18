module.exports = {
    apps: [
        {
            name: "panel-prod",
            cwd: "/var/www/panel-prod/client",
            script: "npm",
            args: "run start",
            env: {
                NODE_ENV: "production",
                SKIP_ENV_VALIDATION: "true",
                PORT: "3011"
            },
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            max_memory_restart: "500M",
            error_file: "/var/log/otomuhasebe/panel-prod/error.log",
            out_file: "/var/log/otomuhasebe/panel-prod/out.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            time: true,
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 3011,
            shutdown_with_message: true
        }
    ]
};
