// ... existing code ...
export const fetchBanks = functions.https.onCall(async (data, context) => {
  try {
    const response = await axios.get('https://api.paystack.co/bank?country=ghana', { // Added country query parameter
      headers: {
        Authorization: `Bearer ${functions.config().paystack.secret_key}`,
      },
    });
// ... existing code ...