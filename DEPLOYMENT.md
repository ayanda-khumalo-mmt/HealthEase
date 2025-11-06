# HealthEase Deployment Guide

This guide provides instructions for deploying the HealthEase application to production.

## Prerequisites

- Node.js v14 or higher
- MongoDB v4.4 or higher
- A domain name with SSL certificate (for HTTPS)
- Server with at least 1GB RAM and 10GB storage

## Environment Setup

### 1. Server Configuration

#### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Install MongoDB
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 2. Application Setup

#### Clone Repository
```bash
git clone https://github.com/ayanda-khumalo-mmt/HealthEase.git
cd HealthEase
```

#### Install Dependencies
```bash
npm install --production
```

#### Configure Environment Variables
Create a `.env` file:
```bash
nano .env
```

Add the following configuration:
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/healthease

# Security Configuration
JWT_SECRET=your-very-secure-secret-key-minimum-32-characters-long

# Optional: MongoDB Authentication (Recommended)
# MONGODB_URI=mongodb://username:password@localhost:27017/healthease?authSource=admin
```

**Important**: Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. MongoDB Security Configuration

#### Enable Authentication
```bash
sudo mongo
```

In MongoDB shell:
```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password_here",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
exit
```

Edit MongoDB config:
```bash
sudo nano /etc/mongod.conf
```

Add:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

Update `.env` with authenticated connection string.

### 4. Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 5. SSL/TLS Certificate

Using Let's Encrypt with Certbot:
```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

### 6. Nginx Reverse Proxy Setup

#### Install Nginx
```bash
sudo apt-get install nginx
```

#### Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/healthease
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/healthease /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Start Application with PM2

```bash
# Start the application
pm2 start server.js --name healthease

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Monitor application
pm2 monit
```

## Initial Data Setup

### Create Admin User

You can create an admin user by registering through the API or directly in MongoDB:

Using MongoDB shell:
```bash
mongo healthease
```

```javascript
use healthease

// Create admin user (password will be hashed on login)
db.users.insertOne({
  email: "admin@healthease.com",
  password: "$2a$10$...", // Use bcrypt hash
  name: "System Administrator",
  role: "admin",
  createdAt: new Date()
})
```

Or use the registration endpoint with a temporary modification to allow admin registration.

## Monitoring and Logging

### PM2 Logs
```bash
# View logs
pm2 logs healthease

# View only error logs
pm2 logs healthease --err

# Clear logs
pm2 flush
```

### MongoDB Logs
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Backup Strategy

### Database Backup
Create a backup script:
```bash
nano /home/user/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/user/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db healthease --out $BACKUP_DIR/healthease_$DATE
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

Make executable and add to cron:
```bash
chmod +x /home/user/backup-db.sh
crontab -e
```

Add daily backup at 2 AM:
```
0 2 * * * /home/user/backup-db.sh
```

## Maintenance

### Update Application
```bash
cd /home/user/HealthEase
git pull origin main
npm install --production
pm2 restart healthease
```

### Update Dependencies
```bash
npm audit fix
npm update
```

### Renew SSL Certificate
Certbot auto-renewal should work automatically. Test with:
```bash
sudo certbot renew --dry-run
```

## Performance Optimization

### Enable Compression
Already handled by Nginx configuration above.

### MongoDB Indexes
Connect to MongoDB and create indexes:
```javascript
use healthease

// User indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })

// Appointment indexes
db.appointments.createIndex({ patient: 1 })
db.appointments.createIndex({ doctor: 1 })
db.appointments.createIndex({ date: 1 })
db.appointments.createIndex({ status: 1 })

// Medical records indexes
db.medicalrecords.createIndex({ patient: 1 })
db.medicalrecords.createIndex({ doctor: 1 })
db.medicalrecords.createIndex({ visitDate: -1 })
```

### PM2 Cluster Mode
For better performance on multi-core systems:
```bash
pm2 delete healthease
pm2 start server.js --name healthease -i max
```

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs healthease

# Check if port is in use
sudo netstat -tlnp | grep 3000

# Verify MongoDB is running
sudo systemctl status mongod
```

### Database connection issues
```bash
# Test MongoDB connection
mongo healthease --eval "db.stats()"

# Check MongoDB logs
sudo tail -100 /var/log/mongodb/mongod.log
```

### High memory usage
```bash
# Check memory usage
pm2 monit

# Restart if needed
pm2 restart healthease
```

## Health Checks

Create a health check endpoint (optional enhancement):
```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB authentication is enabled
- [ ] Firewall is configured
- [ ] SSL/TLS certificate is installed
- [ ] HTTPS is enforced
- [ ] Regular backups are configured
- [ ] Application logs are monitored
- [ ] Dependencies are kept up to date
- [ ] NODE_ENV is set to 'production'
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are active

## Support

For deployment issues, consult:
- Application logs: `pm2 logs healthease`
- MongoDB logs: `/var/log/mongodb/mongod.log`
- Nginx logs: `/var/log/nginx/error.log`
- System logs: `journalctl -xe`

## Scaling Considerations

For high-traffic scenarios:
1. Use PM2 cluster mode
2. Implement Redis for session management
3. Use MongoDB replica sets
4. Consider load balancing with multiple servers
5. Implement CDN for static assets
6. Add caching layer (Redis)

Last Updated: 2025-11-06
