// Base URL for your API
const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

const apiCall = async (method, url, data) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            // Add any other headers you may need here
        },
    };
    // console.log(data);

    // Only include body if there's data to send
    if (data) {
        options.body = JSON.stringify(data);
    }
    try {
        // const separator = url.includes('?') ? '&' : '?';
        const response = await fetch(`${API_URL}${url}`, options);

        if (!response.ok) {
            // throw new Error(`HTTP error! status: ${response.status}`);
            console.log(response.status);

        }
        return await response.json(); // Return the response data
    } catch (error) {
        console.error(`API call error: ${error}`);
        throw error; // Re-throw the error for handling in the component
    }
};

// Common functions for different HTTP methods
export const apiGet = (url, data) => apiCall('GET', url, data);
export const apiPost = (url, data) => apiCall('POST', url, data);
export const apiListPost = (url, data) => apiCall('POST', url, data);
export const apiPut = (url, data) => apiCall('PUT', url, data);
export const apiDelete = (url) => apiCall('DELETE', url);


export const imageUpload = async (data) => {

    const formData = new FormData();
    formData.append('objectType', 'user');
    formData.append('type', 'image');
    // formData.append('objectId', data.objectId);
    formData.append('mediaType', 'image');
    formData.append('storage', 'local');
    formData.append('file', data.file);

    // return;
    const response = await fetch(`${API_URL}/media`, {
        method: 'POST',
        body: formData,
    });


    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
    }

    return response.json();
};