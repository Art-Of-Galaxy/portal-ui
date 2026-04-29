import { fetchWithConfig } from '../utils/authHelper';

export const apiServices = {
    get_projects: async () => {
        const response = await fetchWithConfig('notion/get_projects', { method: 'POST' });
        return response;
    },
    get_tasks: async () => {
        const response = await fetchWithConfig('notion/get_task', { method: 'POST' });
        return response;
    },
    add_project: async (projectData) => {
        const response = await fetchWithConfig('notion/add_project', {
            method: 'POST',
            body: projectData,
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
};