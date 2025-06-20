# AutoJobr Deployment Guide

This guide covers multiple deployment options for AutoJobr, from local development to production environments.

## 🚀 Quick Start Options

### 1. Local Development
```bash
# Clone and start development server
npm install
npm run dev
```

### 2. Docker (Recommended)
```bash
# Using Docker Compose
docker-compose up -d --build

# Or using Docker directly
docker build -t autojobr .
docker run -p 3000:80 autojobr
```

### 3. Virtual Machine Deployment
```bash
# Run the automated setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/autojobr/main/deployment/vm-setup.sh | bash
```

## 🛠️ Deployment Methods

### Docker Deployment

#### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

#### Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/autojobr.git
   cd autojobr
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and deploy**
   ```bash
   docker-compose up -d --build
   ```

4. **Access the application**
   - Web UI: http://localhost:3000
   - Health check: http://localhost:3000/health

### VM Deployment (Ubuntu/Debian)

#### Automated Setup
Use the provided script for quick deployment:
```bash
wget https://raw.githubusercontent.com/yourusername/autojobr/main/deployment/vm-setup.sh
chmod +x vm-setup.sh
./vm-setup.sh
```

#### Manual Setup

1. **Update system**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Install Docker Compose**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Deploy application**
   ```bash
   git clone https://github.com/yourusername/autojobr.git
   cd autojobr
   docker-compose up -d --build
   ```

5. **Setup reverse proxy (Nginx)**
   ```bash
   sudo apt install -y nginx
   sudo cp deployment/nginx-site.conf /etc/nginx/sites-available/autojobr
   sudo ln -s /etc/nginx/sites-available/autojobr /etc/nginx/sites-enabled/
   sudo systemctl reload nginx
   ```

### Cloud Deployment

#### AWS EC2
1. Launch Ubuntu 20.04 LTS instance
2. Configure security groups (ports 80, 443, 22)
3. Run the VM setup script
4. Configure domain and SSL (optional)

#### Google Cloud Platform
1. Create Compute Engine instance
2. Use Ubuntu 20.04 LTS image
3. Configure firewall rules
4. Run the VM setup script

#### DigitalOcean
1. Create Droplet with Ubuntu 20.04
2. Configure firewall
3. Run the VM setup script

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=production
PORT=3000
VITE_API_URL=https://your-domain.com/api

# Database (if using)
DATABASE_URL=postgresql://user:password@localhost:5432/autojobr

# Chrome Extension
EXTENSION_ID=your-extension-id
EXTENSION_SECRET=your-extension-secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Considerations

### SSL/TLS Setup
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration
```bash
# UFW setup
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check application status
curl http://localhost:3000/health

# Check Docker containers
docker-compose ps

# View logs
docker-compose logs -f
```

### Backups
```bash
# Database backup (if using PostgreSQL)
docker-compose exec postgres pg_dump -U autojobr autojobr > backup.sql

# Application data backup
tar -czf autojobr-backup.tar.gz ./data
```

### Updates
```bash
# Update application
git pull origin main
docker-compose down
docker-compose up -d --build
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Docker permission denied**
   ```bash
   sudo usermod -aG docker $USER
   # Logout and login again
   ```

3. **Nginx configuration error**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### Logs
```bash
# Application logs
docker-compose logs autojobr

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
journalctl -u nginx
journalctl -u docker
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Submit an issue on GitHub
4. Contact support at support@autojobr.com

## 🔄 Updates

To update your deployment:
1. Pull latest changes: `git pull origin main`
2. Rebuild containers: `docker-compose up -d --build`
3. Clear browser cache
4. Verify functionality

---

For more detailed documentation, visit: https://docs.autojobr.com