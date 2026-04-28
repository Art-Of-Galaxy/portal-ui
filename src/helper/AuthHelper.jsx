// src/helpers/AuthHelper.jsx
import axios from "axios";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

/**
 * Verify a JWT with the backend.
 * @param {string} token  The access token to verify.
 * @returns {Promise<{ valid: boolean, data?: any, error?: any }>}
 */
export async function verifyToken(token) {
  try {
    // Note: we’re sending the token in the body directly,
    // adjust if your API expects a different shape or header.
    const resp = await axios.post(
      `${API_URL}/authentication/authenticate`,
      { token }
    );

    // assume API responds { status: true } when valid
    if (resp.data?.status) {
      return { valid: true, data: resp.data };
    } else {
      return { valid: false, data: resp.data };
    }
  } catch (error) {
    console.error("AuthHelper.verifyToken error:", error);
    return { valid: false, error };
  }
}
