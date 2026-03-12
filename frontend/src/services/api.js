export const predictHeartRisk = async (data) => {
    try {
        const response = await fetch('http://127.0.0.1:8000/predict/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Ensure numerical values are parsed correctly
            body: JSON.stringify(
                Object.fromEntries(
                    Object.entries(data).map(([key, value]) => [key, Number(value)])
                )
            ),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Prediction API Error:", error);
        throw error;
    }
};
