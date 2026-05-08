export async function fetchThingSpeakFeed({ channelId, apiKey }) {
  const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}`;
  const response = await fetch(url);
  return response.json();
}
