@@ .. @@
 from rest_framework import viewsets, status
 from rest_framework.response import Response
 from django_filters.rest_framework import DjangoFilterBackend
+from rest_framework.permissions import IsAuthenticated

 from .models import Adherent, Cotisation, Soin
 from .serializers import AdherentSerializer, CotisationSerializer, SoinSerializer
@@ .. @@
 class AdherentViewSet(viewsets.ModelViewSet):
     queryset = Adherent.objects.all()
     serializer_class = AdherentSerializer
+    permission_classes = [IsAuthenticated]
     filter_backends = [DjangoFilterBackend]
     filterset_fields = ['nom', 'prenom', 'cin', 'statut', 'a_droit', 'nax']

@@ .. @@
 class CotisationViewSet(viewsets.ModelViewSet):
     queryset = Cotisation.objects.all()
     serializer_class = CotisationSerializer
+    permission_classes = [IsAuthenticated]

@@ .. @@
 class SoinViewSet(viewsets.ModelViewSet):
     queryset = Soin.objects.all()
     serializer_class = SoinSerializer
+    permission_classes = [IsAuthenticated]
     filter_backends = [DjangoFilterBackend]
     filterset_fields = {