# Currency Exchange Rate API

Node.js backend that provides USD to ARS/BRL exchange rates from 3 sources with caching and aggregation.

## Quick Start

```bash
npm install
npm run init-db
npm start
```

Server runs at `http://localhost:3000`

## Configuration

Edit `.env` file:
```
CURRENCY=ARS  # or BRL
CACHE_DURATION=60
```

## API Endpoints

### GET `/quotes`
Returns array of USD quotes from 3 sources.

Response structure:
```json
{
  "buy_price": 950.5,
  "sell_price": 970.5,
  "source": "https://..."
}
```

### GET `/average`
Returns average buy and sell prices.

Response structure:
```json
{
  "average_buy_price": 951.17,
  "average_sell_price": 971.17
}
```

### GET `/slippage`
Returns slippage percentage vs average for each source.

Response structure:
```json
{
  "buy_price_slippage": -0.0007,
  "sell_price_slippage": -0.0007,
  "source": "https://..."
}
```

## Data Sources

**ARS:** Ambito.com, DolarHoy.com, Cronista.com  
**BRL:** Wise.com, Nubank, Nomad Global

## Tech Stack

- Node.js + Express
- SQLite
- Axios + Cheerio (web scraping)
- 60s caching with auto-refresh
