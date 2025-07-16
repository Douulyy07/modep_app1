@@ .. @@
 INSTALLED_APPS = [
     'django.contrib.admin',
     'django.contrib.auth',
     'django.contrib.contenttypes',
     'django.contrib.sessions',
     'django.contrib.messages',
     'django.contrib.staticfiles',
     'rest_framework',
     'api',
     'django_filters',
     'rest_framework_simplejwt.token_blacklist',
+    'corsheaders',
+    'authentication',
 ]

 MIDDLEWARE = [
+    'corsheaders.middleware.CorsMiddleware',
     'django.middleware.security.SecurityMiddleware',
     'django.contrib.sessions.middleware.SessionMiddleware',
     'django.middleware.common.CommonMiddleware',
     'django.middleware.csrf.CsrfViewMiddleware',
     'django.contrib.auth.middleware.AuthenticationMiddleware',
     'django.contrib.messages.middleware.MessageMiddleware',
     'django.middleware.clickjacking.XFrameOptionsMiddleware',
-    'corsheaders.middleware.CorsMiddleware',
 ]

@@ .. @@
-INSTALLED_APPS += ['corsheaders']
-
-MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware'] + MIDDLEWARE
-
-CORS_ALLOW_ALL_ORIGINS = True  # Pour le développement
+# CORS Configuration
+CORS_ALLOW_CREDENTIALS = True
+CORS_ALLOWED_ORIGINS = [
+    "http://localhost:5173",
+    "http://127.0.0.1:5173",
+]

+# CSRF Configuration
+CSRF_TRUSTED_ORIGINS = [
+    "http://localhost:5173",
+    "http://127.0.0.1:5173",
+]
+
+# Session Configuration
+SESSION_COOKIE_AGE = 86400  # 24 heures
+SESSION_COOKIE_HTTPONLY = True
+SESSION_COOKIE_SAMESITE = 'Lax'

 REST_FRAMEWORK = {
     'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
-    
+    'DEFAULT_AUTHENTICATION_CLASSES': [
+        'rest_framework.authentication.SessionAuthentication',
+    ],
+    'DEFAULT_PERMISSION_CLASSES': [
+        'rest_framework.permissions.IsAuthenticated',
+    ],
 }