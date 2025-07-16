@@ .. @@
 import axios from 'axios';

-const API_BASE_URL = '/api';
+const API_BASE_URL = 'http://localhost:8000/api';

 const api = axios.create({
   baseURL: API_BASE_URL,
+  withCredentials: true,
   headers: {
     'Content-Type': 'application/json',
   },
 });

 // Request interceptor
 api.interceptors.request.use(
-  (config) => {
+  async (config) => {
+    // Ajouter le token CSRF pour les requêtes POST/PUT/DELETE
+    if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
+      try {
+        const csrfResponse = await axios.get('http://localhost:8000/auth/csrf/', {
+          withCredentials: true
+        });
+        const csrfToken = csrfResponse.data.csrfToken;
+        config.headers['X-CSRFToken'] = csrfToken;
+      } catch (error) {
+        console.error('Error getting CSRF token:', error);
+      }
+    }
     return config;
   },
   (error) => {
@@ .. @@
 // Response interceptor
 api.interceptors.response.use(
   (response) => {
     return response;
   },
   (error) => {
-    console.error('API Error:', error);
+    if (error.response?.status === 401) {
+      // Rediriger vers la page de connexion si non authentifié
+      window.location.href = '/login';
+    }
     return Promise.reject(error);
   }
 );