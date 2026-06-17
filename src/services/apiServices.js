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
    // Returns the rendered HTML doc as a string. The frontend wraps it in
    // a blob URL so the iframe preview and the download anchor both work
    // regardless of whether S3 was configured at generation time.
    brand_guidelines_render_doc: async ({ spec, slug, brand_name, as_download = false }) => {
        const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const userEmail = localStorage.getItem('user_email');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        if (userEmail) headers['X-User-Email'] = userEmail;
        const res = await fetch(`${API_URL}/brand-guidelines/render-doc`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ spec, slug, brand_name, as_download }),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `HTTP ${res.status}`);
        }
        return res.text();
    },
    // Returns the zip as a Blob. Caller is responsible for triggering the
    // browser download (createObjectURL + <a download>).
    brand_guidelines_zip: async ({ spec, brand_name, zip_name, docs, images }) => {
        const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const userEmail = localStorage.getItem('user_email');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        if (userEmail) headers['X-User-Email'] = userEmail;
        const res = await fetch(`${API_URL}/brand-guidelines/zip`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ spec, brand_name, zip_name, docs, images }),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `HTTP ${res.status}`);
        }
        return res.blob();
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
    generate_printing_design: async ({ form, model }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('printing-design/generate', {
            method: 'POST',
            body: { form, model, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    // ---------- Social Media Studio ----------
    social_media_generate: async ({ brief, model }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        return fetchWithConfig('social-media/generate', {
            method: 'POST',
            body: { brief, model, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
    },
    social_media_save: async (payload) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        return fetchWithConfig('social-media/save', {
            method: 'POST',
            body: { ...payload, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
    },
    social_media_publish_now: async ({ id }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        return fetchWithConfig(`social-media/${id}/publish`, {
            method: 'POST',
            body: { user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
    },
    social_media_library: async ({ filter = 'all' } = {}) => {
        const userEmail = localStorage.getItem('user_email') || '';
        const qs = new URLSearchParams();
        qs.set('filter', filter);
        if (userEmail) qs.set('user_email', userEmail);
        return fetchWithConfig(`social-media/library?${qs.toString()}`, { method: 'GET' });
    },
    social_media_stats: async () => {
        const userEmail = localStorage.getItem('user_email') || '';
        const qs = userEmail ? `?user_email=${encodeURIComponent(userEmail)}` : '';
        return fetchWithConfig(`social-media/stats${qs}`, { method: 'GET' });
    },

    // ---------- Social platform connections (Meta + Google) ----------
    social_connections_list: async () => {
        const userEmail = localStorage.getItem('user_email') || '';
        const qs = userEmail ? `?user_email=${encodeURIComponent(userEmail)}` : '';
        return fetchWithConfig(`social-connections${qs}`, { method: 'GET' });
    },
    social_connections_start: async ({ platform }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        return fetchWithConfig(`social-connections/start/${platform}`, {
            method: 'POST',
            body: { user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
    },
    social_connections_disconnect: async ({ id }) => {
        const userEmail = localStorage.getItem('user_email') || '';
        const qs = userEmail ? `?user_email=${encodeURIComponent(userEmail)}` : '';
        return fetchWithConfig(`social-connections/${id}${qs}`, { method: 'DELETE' });
    },

    generate_packaging_design: async ({ form, model }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('packaging-design/generate', {
            method: 'POST',
            body: { form, model, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },
    generate_ugc_ad: async ({ form }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const response = await fetchWithConfig('ugc-ads/generate', {
            method: 'POST',
            body: { form, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    },

    // ---------- AI Strategist (conversational intake) ----------
    strategist_start: async ({ service }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        return fetchWithConfig('strategist/sessions', {
            method: 'POST',
            body: { service, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
    },
    strategist_get: async (id) => fetchWithConfig(`strategist/sessions/${id}`, { method: 'GET' }),
    strategist_list: async ({ service } = {}) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const qs = new URLSearchParams();
        if (service) qs.set('service', service);
        if (userEmail) qs.set('user_email', userEmail);
        const suffix = qs.toString() ? `?${qs.toString()}` : '';
        return fetchWithConfig(`strategist/sessions${suffix}`, { method: 'GET' });
    },
    strategist_turn: async ({ session_id, message, model }) => fetchWithConfig(
        `strategist/sessions/${session_id}/turn`,
        {
            method: 'POST',
            body: { message, model },
            headers: { 'Content-Type': 'application/json' },
        }
    ),
    strategist_complete: async ({ session_id, project_id }) => fetchWithConfig(
        `strategist/sessions/${session_id}/complete`,
        {
            method: 'POST',
            body: { project_id },
            headers: { 'Content-Type': 'application/json' },
        }
    ),
    strategist_delete: async ({ session_id }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const qs = userEmail ? `?user_email=${encodeURIComponent(userEmail)}` : '';
        return fetchWithConfig(`strategist/sessions/${session_id}${qs}`, {
            method: 'DELETE',
        });
    },

    // ---------- Quiz drafts (Fill it out yourself) ----------
    quiz_draft_start: async ({ service }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        return fetchWithConfig('quiz-drafts', {
            method: 'POST',
            body: { service, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
    },
    quiz_draft_get: async (id) => fetchWithConfig(`quiz-drafts/${id}`, { method: 'GET' }),
    quiz_draft_patch: async ({ id, step, brief }) => fetchWithConfig(`quiz-drafts/${id}`, {
        method: 'PATCH',
        body: { step, brief },
        headers: { 'Content-Type': 'application/json' },
    }),
    quiz_draft_complete: async ({ id, project_id }) => fetchWithConfig(`quiz-drafts/${id}/complete`, {
        method: 'POST',
        body: { project_id },
        headers: { 'Content-Type': 'application/json' },
    }),

    // ---------- Revision requests on generated deliverables ----------
    create_revision: async ({ project_id, service_type, concept_index, notes }) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        return fetchWithConfig('revisions', {
            method: 'POST',
            body: { project_id, service_type, concept_index, notes, user_email: userEmail },
            headers: { 'Content-Type': 'application/json' },
        });
    },

    // ---------- Usage / credits ----------
    usage_summary: async ({ sinceDays = 30 } = {}) => {
        const userEmail = localStorage.getItem('user_email') || undefined;
        const qs = new URLSearchParams();
        qs.set('since_days', String(sinceDays));
        if (userEmail) qs.set('user_email', userEmail);
        return fetchWithConfig(`usage/summary?${qs.toString()}`, { method: 'GET' });
    },

    upload_file: async (file, { projectId, projectName, category, serviceType } = {}) => {
        // Try the presigned-upload flow first: ask the backend for a short-lived
        // S3 PUT URL, upload the bytes directly to S3, then confirm. This
        // bypasses Vercel's ~4.5 MB serverless body limit which is what makes
        // PSD / hi-res photo uploads fail with "Failed to fetch".
        try {
            const presign = await fetchWithConfig('files/presigned-upload', {
                method: 'POST',
                body: { filename: file.name, content_type: file.type || '' },
                headers: { 'Content-Type': 'application/json' },
            });
            if (presign?.success && presign?.upload_url) {
                const putRes = await fetch(presign.upload_url, {
                    method: 'PUT',
                    headers: { 'Content-Type': presign.content_type || file.type || 'application/octet-stream' },
                    body: file,
                });
                if (!putRes.ok) {
                    throw new Error(`S3 upload failed (HTTP ${putRes.status})`);
                }
                const confirmed = await fetchWithConfig('files/confirm-upload', {
                    method: 'POST',
                    body: {
                        public_url: presign.public_url,
                        file_name: file.name,
                        size_bytes: file.size,
                        mime_type: presign.content_type,
                        project_id: projectId || undefined,
                        project_name: projectName,
                        category,
                        service_type: serviceType,
                    },
                    headers: { 'Content-Type': 'application/json' },
                });
                return confirmed;
            }
        } catch (err) {
            // 503 means S3 isn't configured (local dev). Fall through to the
            // multipart endpoint. Any other error: surface it.
            if (err?.status && err.status !== 503) {
                throw err;
            }
        }

        // Multipart fallback (works locally without S3).
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
    presigned_download: async ({ url, filename }) => {
        const response = await fetchWithConfig('files/presigned-download', {
            method: 'POST',
            body: { url, filename },
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
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
