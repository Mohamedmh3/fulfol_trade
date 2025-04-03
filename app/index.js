import { useState, useEffect } from 'react';

export default function Home() {
  const [currency, setCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [prices, setPrices] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // Add a state to check if it's client-side

  useEffect(() => {
    setIsClient(true); // Make sure we're running in the browser
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the price data for the selected currency and amount
      const response = await fetch('/api/currency', {
        method: 'POST',
        body: JSON.stringify({ currency, amount }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.prices) {
        setPrices(data.prices);

        // Send the prices and trade amount to OpenAI
        const aiResponse = await fetch('/api/openai', {
          method: 'POST',
          body: JSON.stringify({ currency, prices: data.prices, trade_amount: amount }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const aiData = await aiResponse.json();
        setAnalysis(aiData.analysis);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setLoading(false);
  };

  if (!isClient) {
    // Return null or loading state while server-side rendering
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Crypto Trading Assistant</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Currency:
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="Enter currency"
            required
          />
        </label>
        <br />
        <label>
          Amount:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>

      {analysis && (
        <div>
          <h2>Market Analysis</h2>
          <pre>{analysis}</pre>
        </div>
      )}

      {prices.length > 0 && (
        <div>
          <h2>Prices Over Last 30 Days</h2>
          <ul>
            {prices.map((priceData, index) => (
              <li key={index}>
                Date: {priceData.day} - Price: ${priceData.price.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
