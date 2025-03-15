import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    fetch('/api/protected', {
      method: 'GET',
      headers: {
        'x-api-key':process.env.apiKey
      }
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error("Error:", error));
  }, []);

  return <h1>Check the console for API response</h1>;
}
