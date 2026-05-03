import { fetchWithConfig } from '../utils/authHelper';

export const apiServices = {
    get_projects: async () => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('notion/get_projects', {
            method: 'POST',
            body: { user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    get_tasks: async () => {
        const response = await fetchWithConfig('notion/get_task', { method: 'POST' });
        return response;
    },
    add_project: async (projectData) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('notion/add_project', {
            method: 'POST',
            body: { ...projectData, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
      add_task: async (projectData) => {
        const response = await fetchWithConfig('notion/add_task', {
            method: 'POST',
            body: projectData,
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    add_staff: async (staffdata) => {
        console.log('service called', staffdata);
        
        const response = await fetchWithConfig('staff/add', {
            method: 'POST',
            body: staffdata,
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    get_staff: async () => {
        const response = await fetchWithConfig('staff/get', { method: 'POST' });
        return response.data;
    },
    get_project_status: async () => {
        const response = await fetchWithConfig('notion/get_project_status', { method: 'POST' });
        return response;
    },
    get_project_priority: async () => {
        const response = await fetchWithConfig('notion/get_project_priority', { method: 'POST' });
        return response;
    },
    get_project_by_id: async (id) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('notion/get_project_by_id', {
            method: 'POST',
            body: { id, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    delete_project: async (id) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('notion/delete_project', {
            method: 'POST',
            body: { id, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    get_profile: async () => {
        const response = await fetchWithConfig('authentication/profile', { method: 'GET' });
        return response;
    },
    update_profile: async (profile) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('authentication/profile', {
            method: 'PUT',
            body: { ...profile, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    update_password: async ({ current_password, new_password }) => {
        const response = await fetchWithConfig('authentication/profile/password', {
            method: 'PUT',
            body: { current_password, new_password },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    save_onboarding: async (onboarding) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('authentication/onboarding', {
            method: 'POST',
            body: { onboarding, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    get_my_projects: async () => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('notion/get_projects', {
            method: 'POST',
            body: { user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    generate_brand_guidelines: async ({ form, model }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('brand-guidelines/generate', {
            method: 'POST',
            body: { form, model, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    generate_rebranding: async ({ form, model }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('rebranding/generate', {
            method: 'POST',
            body: { form, model, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    generate_ecommerce_mockups: async ({ form, model }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('ecommerce-mockups/generate', {
            method: 'POST',
            body: { form, model, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    generate_logo_design: async ({ form, model, num_images }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('logo-design/generate', {
            method: 'POST',
            body: { form, model, num_images, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    upload_file: async (file, { projectId, projectName, category, serviceType } = {}) => {
        const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
        const userEmail = localStorage.getItem('user_email') || '';
        const formData = new FormData();
        formData.append('file', file);
        if (projectId) formData.append('project_id', String(projectId));
        if (projectName) formData.append('project_name', projectName);
        if (category) formData.append('category', category);
        if (serviceType) formData.append('service_type', serviceType);
        if (userEmail) formData.append('user_email', userEmail);

        const response = await fetch(`${API_URL}/files/upload`, {
            method: 'POST',
            body: formData,
            headers: userEmail ? { 'X-User-Email': userEmail } : undefined,
        });
        const text = await response.text();
        let parsed = null;
        if (text) {
            try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
        }
        if (!response.ok) {
            const msg = (parsed && (parsed.message || parsed.error || parsed.raw)) ||
                `HTTP error! status: ${response.status}`;
            throw new Error(msg);
        }
        return parsed;
    },
    list_files: async () => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const qs = userEmail ? `?user_email=${encodeURIComponent(userEmail)}` : '';
        const response = await fetchWithConfig(`files${qs}`, { method: 'GET' });
        return response;
    },
    delete_file: async (id) => {
        const response = await fetchWithConfig(`files/${id}`, { method: 'DELETE' });
        return response;
    },
};
