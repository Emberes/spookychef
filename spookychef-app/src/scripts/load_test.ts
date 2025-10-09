import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/generate';
const NUM_REQUESTS = 15; // Between 10-20 local calls

const goldenPrompt = {
  ingredients: ['chicken', 'rice', 'broccoli'],
  diet: [],
  allergies: [],
  personaName: 'Chef Gordon Ramsay',
};

async function runLoadTest() {
  console.log(`Running load test with ${NUM_REQUESTS} requests to ${API_URL}`);
  const start = Date.now();

  const requests = Array.from({ length: NUM_REQUESTS }, async (_, i) => {
    const requestStart = Date.now();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goldenPrompt),
      });
      const requestEnd = Date.now();
      const duration = requestEnd - requestStart;

      if (!response.ok) {
        console.error(`Request ${i + 1} failed with status: ${response.status}`);
        return { status: 'failed', duration };
      }

      // Optionally parse and validate response if needed
      // const data = await response.json();
      // console.log(`Request ${i + 1} successful, recipe title: ${data.recipe.title}`);
      return { status: 'success', duration };
    } catch (error) {
      const requestEnd = Date.now();
      const duration = requestEnd - requestStart;
      console.error(`Request ${i + 1} failed:`, error);
      return { status: 'error', duration };
    }
  });

  const results = await Promise.all(requests);
  const end = Date.now();
  const totalDuration = end - start;

  const successfulRequests = results.filter(r => r.status === 'success').length;
  const failedRequests = results.filter(r => r.status !== 'success').length;
  const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / NUM_REQUESTS;

  console.log('\n--- Load Test Results ---');
  console.log(`Total requests: ${NUM_REQUESTS}`);
  console.log(`Successful: ${successfulRequests}`);
  console.log(`Failed: ${failedRequests}`);
  console.log(`Total duration: ${totalDuration} ms`);
  console.log(`Average request duration: ${averageDuration.toFixed(2)} ms`);
}

runLoadTest();
