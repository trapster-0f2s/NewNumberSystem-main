const API_URL = process.env.REACT_APP_API_URL || "https://numbersystembackend.onrender.com";

export async function loginUser(credentials) {
  return fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  }).then((data) => data.json());
}

export async function registerUser(credentials) {
  return fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  }).then((data) => data.json());
}

