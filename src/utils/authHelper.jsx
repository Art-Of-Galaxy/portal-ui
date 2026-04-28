export const fetchWithConfig = async (endpoints, { method, headers, body } = {}) => {
    const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
    const verb = (method || 'GET').toUpperCase();
    const finalHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    };

    const init = { method: verb, headers: finalHeaders };
    if (body !== undefined && verb !== 'GET' && verb !== 'HEAD') {
        init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}/${endpoints}`, init);

        // Try to parse the body even on errors so we can surface server messages.
        let parsed = null;
        const text = await response.text();
        if (text) {
            try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
        }

        if (!response.ok) {
            const msg =
                (parsed && (parsed.message || parsed.error || parsed.raw)) ||
                `HTTP error! status: ${response.status}`;
            const err = new Error(msg);
            err.status = response.status;
            err.body = parsed;
            throw err;
        }

        return parsed;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}