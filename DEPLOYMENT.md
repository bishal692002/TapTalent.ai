# Deployment Guide

This guide covers various deployment options for the Currency Exchange API.

## Table of Contents
- [Render.com (Recommended)](#rendercom)
- [Railway.app](#railwayapp)
- [Heroku](#heroku)
- [DigitalOcean App Platform](#digitalocean-app-platform)
- [Docker Deployment](#docker-deployment)
- [VPS Deployment](#vps-deployment)

---

## Render.com

Render offers free tier with auto-deploy from GitHub.

### Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create a Render account** at https://render.com

3. **Create a new Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: currency-exchange-api
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

4. **Set Environment Variables**
   - `NODE_ENV` = `production`
   - `CURRENCY` = `ARS` (or `BRL`)
   - `CACHE_DURATION` = `60`

5. **Deploy!**
   - Click "Create Web Service"
   - Your app will be live at `https://your-app-name.onrender.com`

---

## Railway.app

Railway offers simple deployment with automatic SSL.

### Steps:

1. **Create account** at https://railway.app

2. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository

3. **Configure**
   - Railway auto-detects Node.js
   - Add environment variables:
     - `CURRENCY` = `ARS`
     - `CACHE_DURATION` = `60`

4. **Deploy**
   - Automatic deployment on push
   - Get public URL from settings

---

## Heroku

### Prerequisites:
- Heroku CLI installed
- Heroku account

### Steps:

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create app**
   ```bash
   heroku create your-currency-api
   ```

3. **Set environment variables**
   ```bash
   heroku config:set CURRENCY=ARS
   heroku config:set CACHE_DURATION=60
   heroku config:set NODE_ENV=production
   ```

4. **Create Procfile**
   ```bash
   echo "web: npm start" > Procfile
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Open app**
   ```bash
   heroku open
   ```

---

## DigitalOcean App Platform

### Steps:

1. **Create account** at https://www.digitalocean.com

2. **Create App**
   - Go to App Platform
   - Click "Create App"
   - Connect GitHub repository

3. **Configure**
   - Select repository and branch
   - App Platform detects Node.js
   - Set environment variables:
     - `CURRENCY` = `ARS`
     - `CACHE_DURATION` = `60`

4. **Review and Deploy**
   - Choose plan (Basic $5/month or free trial)
   - Click "Create Resources"

---

## Docker Deployment

### Using Docker Compose (Recommended):

1. **Build and run**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop**
   ```bash
   docker-compose down
   ```

### Using Docker directly:

1. **Build image**
   ```bash
   docker build -t currency-api .
   ```

2. **Run container**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e CURRENCY=ARS \
     -e CACHE_DURATION=60 \
     --name currency-api \
     currency-api
   ```

3. **View logs**
   ```bash
   docker logs -f currency-api
   ```

---

## VPS Deployment

For Ubuntu/Debian servers (e.g., AWS EC2, DigitalOcean Droplet, Linode).

### Steps:

1. **SSH into server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install Git**
   ```bash
   sudo apt-get install git
   ```

4. **Clone repository**
   ```bash
   git clone <your-repo-url>
   cd Assignment
   ```

5. **Install dependencies**
   ```bash
   npm install
   ```

6. **Create .env file**
   ```bash
   nano .env
   ```
   Add:
   ```
   PORT=3000
   NODE_ENV=production
   CURRENCY=ARS
   CACHE_DURATION=60
   ```

7. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

8. **Start application**
   ```bash
   pm2 start src/index.js --name currency-api
   pm2 save
   pm2 startup
   ```

9. **Setup Nginx reverse proxy** (optional but recommended)
   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/currency-api
   ```
   
   Add:
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

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/currency-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Setup SSL with Let's Encrypt** (optional)
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

## Environment Variables

All deployment platforms require these environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `CURRENCY` | Yes | `ARS` | Currency to track (ARS or BRL) |
| `CACHE_DURATION` | No | `60` | Cache duration in seconds |

---

## Post-Deployment Testing

After deployment, test your API:

```bash
# Replace YOUR_URL with your deployment URL
export API_URL="https://your-app.onrender.com"

# Test health
curl $API_URL/health

# Test quotes
curl $API_URL/quotes

# Test average
curl $API_URL/average

# Test slippage
curl $API_URL/slippage
```

---

## Monitoring

### Render.com
- View logs in dashboard
- Monitor resource usage

### Heroku
```bash
heroku logs --tail
```

### Railway
- View logs in dashboard
- Set up log drains

### VPS with PM2
```bash
pm2 logs currency-api
pm2 monit
```

---

## Troubleshooting

### Application won't start
- Check logs for errors
- Verify environment variables are set
- Ensure database can be created (write permissions)

### Scraping errors (403, timeouts)
- This is expected! Websites block automated requests
- The app uses mock data as fallback
- Consider using official APIs if available

### High memory usage
- Check for memory leaks
- Limit cache size
- Consider using Redis for caching

---

## Free Tier Limitations

| Platform | Free Tier |
|----------|-----------|
| **Render** | 750 hours/month, sleeps after 15 min inactivity |
| **Railway** | $5 free credit/month |
| **Heroku** | 1000 dyno hours/month (deprecated) |
| **DigitalOcean** | $200 credit for 60 days |

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Database initialized
- [ ] Logs monitored
- [ ] Error handling tested
- [ ] API endpoints tested
- [ ] Documentation updated
- [ ] SSL certificate configured (for custom domains)
- [ ] Monitoring/alerting setup

---

## Support

For issues or questions:
1. Check the logs first
2. Review the main README.md
3. Open an issue on GitHub
