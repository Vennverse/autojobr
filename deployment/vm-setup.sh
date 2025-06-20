#!/bin/bash

# AutoJobr VM Deployment Script
# This script sets up AutoJobr on a fresh Ubuntu/Debian VM

set -e

echo "🚀 Starting AutoJobr VM deployment..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "📦 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install -y git

# Clone repository (replace with your actual repo URL)
echo "📥 Cloning AutoJobr repository..."
git clone https://github.com/yourusername/autojobr.git
cd autojobr

# Create environment file
echo "⚙️ Setting up environment..."
cat > .env << EOF
NODE_ENV=production
PORT=3000
VITE_API_URL=http://localhost:3000/api
EOF

# Build and start services
echo "🏗️ Building and starting AutoJobr..."
docker-compose up -d --build

# Install Nginx for reverse proxy (optional)
echo "🌐 Setting up Nginx reverse proxy..."
sudo apt install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/autojobr << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/autojobr /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Enable services to start on boot
sudo systemctl enable nginx
sudo systemctl enable docker

echo "✅ AutoJobr deployment completed!"
echo "🌐 Your application is available at: http://$(curl -s ifconfig.me)"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Restart services: docker-compose restart"
echo "  - Update application: git pull && docker-compose up -d --build"
echo ""
echo "🔧 Configuration files:"
echo "  - Application: ~/autojobr"
echo "  - Nginx: /etc/nginx/sites-available/autojobr"
echo "  - Environment: ~/autojobr/.env"