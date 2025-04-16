  import jwt from 'jsonwebtoken';
  import cookie from 'cookie';  

  const JWT_SECRET = process.env.JWT_SECRET;

  export async function GET(request) {
    const vs_currency = "usd";
    const days = 30;

    const cookies = cookie.parse(request.headers.get('Cookie') || ''); 
    const token = cookies.token;

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("Decoded token:", decoded);

      const { searchParams } = new URL(request.url);
      const currency = searchParams.get("currency");

      if (!currency || typeof currency !== "string" || currency.trim() === "") {
        return new Response(
          JSON.stringify({ error: "Invalid request: 'currency' must be a valid string and existing currency!" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      console.log(currency);
      const currencyLower = currency.toLowerCase();
      console.log(currencyLower);
      const pricesRes = await fetch(
        `https://api.coingecko.com/api/v3/coins/${currencyLower}/market_chart?vs_currency=${vs_currency}&days=${days}&interval=daily`
      );

      if (!pricesRes.ok) {
        throw new Error("Failed to fetch data from CoinGecko");
      }

      const pricesData = await pricesRes.json();

      const processedPrices = pricesData.prices.reverse().map((entry) => {
        const timestamp = entry[0];
        const price = entry[1];

        const date = new Date(timestamp);
        const formattedDate = date.toISOString().split("T")[0];

        return {
          day: formattedDate,
          price: price
        };
      });

      console.log("Processed Prices:", processedPrices);

      return new Response(JSON.stringify({ prices: processedPrices }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      console.error("Error fetching currency data:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
