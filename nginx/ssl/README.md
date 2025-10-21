# SSL Certificates Directory

Place your SSL certificates here:

- `cert.pem` - SSL certificate
- `key.pem` - Private key

## For Synology NAS:

You can use Synology's built-in SSL certificates or generate self-signed certificates:

### Option 1: Use Synology Certificates (Recommended)

```bash
# Copy from Synology SSL directory
sudo cp /usr/syno/etc/certificate/_archive/<your-cert-id>/cert.pem ./cert.pem
sudo cp /usr/syno/etc/certificate/_archive/<your-cert-id>/privkey.pem ./key.pem
```

### Option 2: Generate Self-Signed Certificate (Development Only)

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=bitcorp.mohammadasjad.com"
```

### Option 3: Let's Encrypt (Production)

Use Synology's built-in Let's Encrypt integration in DSM:
1. Go to Control Panel > Security > Certificate
2. Add a new certificate for bitcorp.mohammadasjad.com
3. Copy the certificates from `/usr/syno/etc/certificate/_archive/<cert-id>/`

## Note

For testing without SSL, you can comment out the HTTPS server block in `nginx.conf` and use HTTP only.
