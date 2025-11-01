# Currency Exchange Rate API

A Node.js backend service that provides real-time USD to ARS (Argentine Peso) or USD to BRL (Brazilian Real) exchange rates by scraping multiple sources and providing aggregated data through REST API endpoints.

## 🚀 Features

- **Real-time Data**: Scrapes quotes from 3 different sources
- **Smart Caching**: Caches data for 60 seconds to ensure fresh data without overloading sources
- **Multiple Endpoints**: `/quotes`, `/average`, and `/slippage` endpoints
- **SQL Database**: Stores historical quote data in SQLite
- **Auto-refresh**: Automatically refreshes cache every 60 seconds
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **Flexible Configuration**: Support for both ARS and BRL currencies

## 📋 Requirements

- Node.js 18+ 
- npm or yarn
- (Optional) Docker and Docker Compose

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Assignment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` to set your preferred currency:
   ```
   PORT=3000
   NODE_ENV=development
   CURRENCY=ARS  # or BRL
   CACHE_DURATION=60
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

The server will be running at `http://localhost:3000`

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Or build manually**
   ```bash
   docker build -t currency-exchange-api .
   docker run -p 3000:3000 -e CURRENCY=ARS currency-exchange-api
   ```

## 📡 API Endpoints

### 1. GET `/quotes`
Returns an array of USD quotes from all sources.

**Response:**
```json
{
  "success": true,
  "currency": "ARS",
  "count": 3,
  "data": [
    {
      "buy_price": 950.5,
      "sell_price": 970.5,
      "source": "https://www.ambito.com/contenidos/dolar.html"
    },
    {
      "buy_price": 955.0,
      "sell_price": 975.0,
      "source": "https://www.dolarhoy.com"
    },
    {
      "buy_price": 948.0,
      "sell_price": 968.0,
      "source": "https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB"
    }
  ],
  "cache": {
    "isValid": true,
    "timestamp": "2025-11-01T12:00:00.000Z",
    "age": 15,
    "quotesCount": 3
  }
}
```

### 2. GET `/average`
Returns the average buy and sell prices from all sources.

**Response:**
```json
{
  "success": true,
  "data": {
    "average_buy_price": 951.17,
    "average_sell_price": 971.17,
    "currency": "ARS",
    "timestamp": "2025-11-01T12:00:00.000Z"
  },
  "cache": {
    "isValid": true,
    "timestamp": "2025-11-01T12:00:00.000Z",
    "age": 20,
    "quotesCount": 3
  }
}
```

### 3. GET `/slippage`
Returns slippage percentage for each source compared to the average.

**Response:**
```json
{
  "success": true,
  "currency": "ARS",
  "count": 3,
  "data": [
    {
      "buy_price_slippage": -0.0007,
      "sell_price_slippage": -0.0007,
      "source": "https://www.ambito.com/contenidos/dolar.html",
      "buy_price": 950.5,
      "sell_price": 970.5
    },
    {
      "buy_price_slippage": 0.0040,
      "sell_price_slippage": 0.0040,
      "source": "https://www.dolarhoy.com",
      "buy_price": 955.0,
      "sell_price": 975.0
    },
    {
      "buy_price_slippage": -0.0033,
      "sell_price_slippage": -0.0033,
      "source": "https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB",
      "buy_price": 948.0,
      "sell_price": 968.0
    }
  ],
  "cache": {
    "isValid": true,
    "timestamp": "2025-11-01T12:00:00.000Z",
    "age": 25,
    "quotesCount": 3
  }
}
```

### 4. GET `/health`
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-01T12:00:00.000Z",
  "currency": "ARS",
  "cache": {
    "isValid": true,
    "timestamp": "2025-11-01T12:00:00.000Z",
    "age": 30,
    "quotesCount": 3
  }
}
```

### 5. POST `/refresh`
Force refresh the cache (fetch fresh quotes immediately).

**Response:**
```json
{
  "success": true,
  "message": "Cache refreshed successfully",
  "data": [...],
  "cache": {...}
}
```

## 🌍 Supported Currencies

### ARS (Argentine Peso)
Sources:
- https://www.ambito.com/contenidos/dolar.html
- https://www.dolarhoy.com
- https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB

### BRL (Brazilian Real)
Sources:
- https://wise.com/es/currency-converter/brl-to-usd-rate
- https://nubank.com.br/taxas-conversao/
- https://www.nomadglobal.com

## 🏗️ Project Structure

```
Assignment/
├── src/
│   ├── index.js              # Main server file
│   ├── routes/
│   │   └── api.js            # API route handlers
│   ├── services/
│   │   └── cache.js          # Cache service with 60s TTL
│   ├── scrapers/
│   │   ├── ars.js            # ARS scrapers
│   │   └── brl.js            # BRL scrapers
│   └── database/
│       ├── db.js             # Database connection and queries
│       └── init.js           # Database initialization script
├── data/                     # SQLite database files
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔧 Configuration

Environment variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `CURRENCY` | Currency to track (ARS or BRL) | `ARS` |
| `CACHE_DURATION` | Cache duration in seconds | `60` |

## 📊 Database

The application uses SQLite to store historical quote data. The database schema:

```sql
CREATE TABLE quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  buy_price REAL NOT NULL,
  sell_price REAL NOT NULL,
  currency TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Deployment

### Render.com
1. Create a new Web Service
2. Connect your GitHub repository
3. Set environment variables (CURRENCY, CACHE_DURATION)
4. Deploy!

### Heroku
```bash
heroku create your-app-name
heroku config:set CURRENCY=ARS
git push heroku main
```

### Railway.app
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### DigitalOcean App Platform
1. Create a new app from GitHub
2. Configure environment variables
3. Deploy

## 🧪 Testing

Test the endpoints using curl:

```bash
# Get all quotes
curl http://localhost:3000/quotes

# Get average
curl http://localhost:3000/average

# Get slippage
curl http://localhost:3000/slippage

# Health check
curl http://localhost:3000/health

# Force refresh
curl -X POST http://localhost:3000/refresh
```

Or use a tool like Postman or Insomnia.

## 📝 Notes

- **Cache**: Data is cached for 60 seconds to balance freshness with performance
- **Auto-refresh**: Cache automatically refreshes every 60 seconds
- **Error Handling**: If scraping fails, the API uses mock data to ensure availability
- **Web Scraping**: The scrapers use Cheerio for HTML parsing. If source websites change their structure, scrapers may need updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License

## 👤 Author

Your Name

## 🐛 Known Issues

- Web scraping is dependent on the structure of source websites
- Some sources may block automated requests
- Mock data is used as fallback when scraping fails

## 🔮 Future Enhancements

- [ ] Add more currency pairs
- [ ] Implement rate limiting
- [ ] Add authentication
- [ ] Create a frontend dashboard
- [ ] Add WebSocket support for real-time updates
- [ ] Implement more sophisticated error handling and retries
- [ ] Add unit and integration tests
- [ ] Add API documentation with Swagger/OpenAPI
