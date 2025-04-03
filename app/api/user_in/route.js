export async function POST(request) {
    try {

        const body = await request.json().catch(() => null);
        
        if (!body) {
            return new Response(JSON.stringify({ error: "Invalid JSON format" }), { 
                status: 400, 
                headers: { "Content-Type": "application/json" } 
            });
        }

        const { currency, amount } = body;


        if (!currency || !amount) {
            return new Response(JSON.stringify({ error: "Currency and amount are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        console.log("Received transaction data:", {
            currency,
            amount,
            timestamp: new Date().toISOString()
        });

        return new Response(JSON.stringify({
            message: "Transaction data received successfully",
            data: { currency, amount }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error processing request:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
