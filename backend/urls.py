@@ .. @@
 urlpatterns = [
     path('admin/', admin.site.urls),
+    path('auth/', include('authentication.urls')),
     path('api/', include('api.urls')),  # accès via /api/adherents/ etc.
     path('', include('api.urls')),      # accès direct à /recu/<id>/
-    
-    
 ]