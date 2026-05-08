const BASE_URL = "https://api.naimiris.local";

export async function get(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  return response.json();
}

export async function post(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  return response.json();
}
