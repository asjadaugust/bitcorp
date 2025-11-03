bitcorp_redis     | 1:C 03 Nov 2025 02:22:14.552 # WARNING Memory overcommit must be enabled! Without it, a background save or replication may fail under low memory condition. Being disabled, it can also cause failures without low memory condition, see https://github.com/jemalloc/jemalloc/issues/1328. To fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot or run the command 'sysctl vm.overcommit_memory=1' for this to take effect.
bitcorp_redis     | 1:C 03 Nov 2025 02:22:14.552 * oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
bitcorp_redis     | 1:C 03 Nov 2025 02:22:14.552 * Redis version=7.4.6, bits=64, commit=00000000, modified=0, pid=1, just started
bitcorp_redis     | 1:C 03 Nov 2025 02:22:14.552 * Configuration loaded
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.553 * monotonic clock: POSIX clock_gettime
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.553 * Running mode=standalone, port=6379.
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.554 # WARNING: The TCP backlog setting of 511 cannot be enforced because /proc/sys/net/core/somaxconn is set to the lower value of 128.
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.554 * Server initialized
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.554 * Reading RDB base file on AOF loading...
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.554 * Loading RDB produced by version 7.4.6
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.554 * RDB age 1047839 seconds
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.554 * RDB memory usage when created 0.90 Mb
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.554 * RDB is base AOF
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.554 * Done loading RDB, keys loaded: 0, keys expired: 0.
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.554 * DB loaded from base file appendonly.aof.1.base.rdb: 0.000 seconds
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.554 * DB loaded from append only file: 0.000 seconds
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.554 * Opening AOF incr file appendonly.aof.1.incr.aof on server start
bitcorp_redis     | 1:M 03 Nov 2025 02:22:14.554 * Ready to accept connections tcp
bitcorp_frontend  |    ▲ Next.js 15.3.5
bitcorp_frontend  |    - Local:        http://93463bf3e6c5:3000
bitcorp_frontend  |    - Network:      http://93463bf3e6c5:3000
bitcorp_frontend  | 
bitcorp_frontend  | 
bitcorp_frontend  |  ✓ Starting...
bitcorp_frontend  |  ✓ Ready in 530ms
bitcorp_nginx     | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
bitcorp_nginx     | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
bitcorp_nginx     | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
bitcorp_nginx     | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
bitcorp_nginx     | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
bitcorp_nginx     | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
bitcorp_nginx     | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
bitcorp_nginx     | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
bitcorp_nginx     | /docker-entrypoint.sh: Configuration complete; ready for start up
bitcorp_nginx     | 2025/11/03 02:22:49 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:14
bitcorp_nginx     | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:14
bitcorp_nginx     | 2025/11/03 02:22:49 [warn] 1#1: the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:15
bitcorp_nginx     | nginx: [warn] the "listen ... http2" directive is deprecated, use the "http2" directive instead in /etc/nginx/conf.d/default.conf:15
bitcorp_nginx     | 2025/11/03 02:22:49 [notice] 1#1: using the "epoll" event method
bitcorp_nginx     | 2025/11/03 02:22:49 [notice] 1#1: nginx/1.29.2
bitcorp_nginx     | 2025/11/03 02:22:49 [notice] 1#1: built by gcc 14.2.0 (Alpine 14.2.0) 
bitcorp_nginx     | 2025/11/03 02:22:49 [notice] 1#1: OS: Linux 4.4.302+
bitcorp_nginx     | 2025/11/03 02:22:49 [notice] 1#1: getrlimit(RLIMIT_NOFILE): 1048576:1048576
bitcorp_nginx     | 2025/11/03 02:22:49 [notice] 1#1: start worker processes
bitcorp_nginx     | 2025/11/03 02:22:49 [notice] 1#1: start worker process 30
bitcorp_nginx     | 2025/11/03 02:22:49 [notice] 1#1: start worker process 31
bitcorp_nginx     | 2025/11/03 02:22:49 [notice] 1#1: start worker process 32
bitcorp_nginx     | 2025/11/03 02:22:49 [notice] 1#1: start worker process 33
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:56 +0000] "GET /en/login HTTP/1.1" 200 6227 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/css/e906109f8674caa6.css HTTP/1.1" 200 161 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/webpack-a51c6e9c279026ee.js HTTP/1.1" 200 1716 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/main-app-5518523dddf30468.js HTTP/1.1" 200 241 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/4bd1b696-dca8d90335f953aa.js HTTP/1.1" 200 53413 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/1684-0a691df890e64bf6.js HTTP/1.1" 200 46771 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/9169-4d4d663ae52f7246.js HTTP/1.1" 200 5091 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/app/%5Blocale%5D/layout-361f4b51348ad4d4.js HTTP/1.1" 200 1885 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/9670-9bf9521126b73798.js HTTP/1.1" 200 3235 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/4062-18346f2a0e40ee56.js HTTP/1.1" 200 5134 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/2550-8cfd080c805963f2.js HTTP/1.1" 200 14341 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/3964-73ad583dc9d2015b.js HTTP/1.1" 200 8255 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/7740-c909df1939b937da.js HTTP/1.1" 200 3813 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/3768-f806d7403d801ed5.js HTTP/1.1" 200 8002 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/359-bfba29d8d2bc9c9b.js HTTP/1.1" 200 2041 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/3831-b6c0dcb9f55b7ecc.js HTTP/1.1" 200 1946 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/9744-81fd54b8b6ced8b7.js HTTP/1.1" 200 2884 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/app/%5Blocale%5D/login/page-000b12defea5eb95.js HTTP/1.1" 200 5160 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/9375-af04720b343e2db1.js HTTP/1.1" 200 26374 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/8470-d67f67a484176e8d.js HTTP/1.1" 200 3519 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/2057-ae9d50b8e0526139.js HTTP/1.1" 200 15850 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/1750-f4df5f1b87b52b9f.js HTTP/1.1" 200 23399 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /register?_rsc=1gpfi HTTP/1.1" 307 22 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /en/register HTTP/1.1" 200 5196 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/3923-3c6cec20325069b2.js HTTP/1.1" 200 3704 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:22:57 +0000] "GET /_next/static/chunks/app/%5Blocale%5D/register/page-e8b6ded3d64dee14.js HTTP/1.1" 200 1938 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:23:10 +0000] "POST /api/v1/auth/login HTTP/1.1" 404 53 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:23:19 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:23:24 +0000] "POST /api/v1/auth/login HTTP/1.1" 404 53 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:23:28 +0000] "POST /api/v1/auth/login HTTP/1.1" 404 53 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:23:41 +0000] "POST /api/v1/auth/login HTTP/1.1" 404 53 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:23:49 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:24:00 +0000] "POST /api/v1/auth/login HTTP/1.1" 404 53 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:24:20 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"
bitcorp_db        | 
bitcorp_db        | 
bitcorp_db        | PostgreSQL Database directory appears to contain a database; Skipping initialization
bitcorp_db        | 
bitcorp_db        | 
bitcorp_db        | 2025-11-03 02:22:15.459 UTC [1] LOG:  starting PostgreSQL 15.14 on x86_64-pc-linux-musl, compiled by gcc (Alpine 14.2.0) 14.2.0, 64-bit
bitcorp_db        | 2025-11-03 02:22:15.459 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
bitcorp_db        | 2025-11-03 02:22:15.459 UTC [1] LOG:  listening on IPv6 address "::", port 5432
bitcorp_db        | 2025-11-03 02:22:16.096 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
bitcorp_db        | 2025-11-03 02:22:16.398 UTC [29] LOG:  database system was shut down at 2025-11-03 02:13:48 UTC
bitcorp_db        | 2025-11-03 02:22:16.466 UTC [1] LOG:  database system is ready to accept connections
bitcorp_backend   | ✅ Settings initialized with manual CORS overrides
bitcorp_backend   | INFO:     Started server process [1]
bitcorp_backend   | INFO:     Waiting for application startup.
bitcorp_backend   | INFO:     Application startup complete.
bitcorp_backend   | INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
bitcorp_backend   | INFO:     192.168.64.4:35588 - "POST /api/v1/auth/login HTTP/1.1" 404 Not Found
bitcorp_backend   | INFO:     192.168.64.4:35614 - "POST /api/v1/auth/login HTTP/1.1" 404 Not Found
bitcorp_backend   | INFO:     192.168.64.4:35624 - "POST /api/v1/auth/login HTTP/1.1" 404 Not Found
bitcorp_backend   | INFO:     192.168.64.4:35646 - "POST /api/v1/auth/login HTTP/1.1" 404 Not Found
bitcorp_backend   | INFO:     192.168.64.4:35674 - "POST /api/v1/auth/login HTTP/1.1" 404 Not Found
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:24:50 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:25:20 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:25:51 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:26:21 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:26:52 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"
bitcorp_db        | 2025-11-03 02:27:16.492 UTC [27] LOG:  checkpoint starting: time
bitcorp_db        | 2025-11-03 02:27:17.164 UTC [27] LOG:  checkpoint complete: wrote 3 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.001 s, sync=0.085 s, total=0.673 s; sync files=2, longest=0.043 s, average=0.043 s; distance=0 kB, estimate=0 kB
bitcorp_backend   | INFO:     192.168.64.4:35976 - "POST /api/v1/auth/login HTTP/1.1" 404 Not Found
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:27:21 +0000] "POST /api/v1/auth/login HTTP/1.1" 404 53 "https://bitcorp.mohammadasjad.com/en/login" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:27:22 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:27:53 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"
bitcorp_backend   | INFO:     192.168.64.4:36052 - "POST /api/v1/auth/register HTTP/1.1" 404 Not Found
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:28:20 +0000] "POST /api/v1/auth/register HTTP/1.1" 404 53 "https://bitcorp.mohammadasjad.com/docs" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:28:23 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"
bitcorp_backend   | INFO:     192.168.64.4:36092 - "POST /api/v1/auth/login HTTP/1.1" 404 Not Found
bitcorp_nginx     | 192.168.64.1 - - [03/Nov/2025:02:28:47 +0000] "POST /api/v1/auth/login HTTP/1.1" 404 53 "https://bitcorp.mohammadasjad.com/docs" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" "84.31.78.240"
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:28:54 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:29:24 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"
bitcorp_nginx     | 127.0.0.1 - - [03/Nov/2025:02:29:55 +0000] "GET / HTTP/1.1" 301 169 "-" "Wget" "-"