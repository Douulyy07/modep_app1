from datetime import timedelta
from django.template.loader import render_to_string
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Adherent, Cotisation, Soin
from .serializers import AdherentSerializer, CotisationSerializer, SoinSerializer
from .cotisation_filters import CotisationFilter
from .utils import generer_carte_mutuelle_pdf
from weasyprint import HTML
from django.http import HttpResponse, Http404
# Create your views here.

from django.utils import timezone
from dateutil.relativedelta import relativedelta
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import Adherent, Cotisation
from .serializers import AdherentSerializer
from .utils import generer_carte_mutuelle_pdf
from django.shortcuts import get_object_or_404

class AdherentViewSet(viewsets.ModelViewSet):
    queryset = Adherent.objects.all()
    serializer_class = AdherentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nom', 'prenom', 'cin', 'statut', 'a_droit', 'nax']

    def perform_create(self, serializer):
        adherent = serializer.save()

        generer_carte_mutuelle_pdf(adherent)

        # Supprimer les cotisations existantes si jamais
        Cotisation.objects.filter(cin=adherent.cin).delete()

        if adherent.a_droit == 'ayant_droit':
            # Créer cotisation active avec dates
            date_debut = timezone.now().date()
            Cotisation.objects.create(
                adherent=adherent,
                cin=adherent.cin,
                cotisation='oui',
                date_debut=date_debut,
                # date_fin sera calculée automatiquement dans save()
            )
        else:
            # Créer cotisation inactive sans dates
            Cotisation.objects.create(
                adherent=adherent,
                cin=adherent.cin,
                cotisation='non',
                date_debut=None,
                date_fin=None
            )

    def perform_update(self, serializer):
        adherent = self.get_object()
        old_a_droit = adherent.a_droit
        adherent = serializer.save()
        new_a_droit = adherent.a_droit

        cotisation_qs = Cotisation.objects.filter(cin=adherent.cin)
        cotisation = cotisation_qs.first() if cotisation_qs.exists() else None

        if old_a_droit != new_a_droit:
            if new_a_droit == 'ayant_droit':
                if not cotisation:
                    date_debut = timezone.now().date()
                    Cotisation.objects.create(
                        adherent=adherent,
                        cin=adherent.cin,
                        cotisation='oui',
                        date_debut=date_debut,
                    )
                else:
                    cotisation.cotisation = 'oui'
                    cotisation.date_debut = timezone.now().date()
                    cotisation.save()
            else:  # new_a_droit == 'sans_droit'
                if cotisation:
                    cotisation.cotisation = 'non'
                    cotisation.date_debut = None
                    cotisation.date_fin = None
                    cotisation.save()

                    
class CotisationViewSet(viewsets.ModelViewSet):
    queryset = Cotisation.objects.all()
    serializer_class = CotisationSerializer

    def get_queryset(self):
        queryset = Cotisation.objects.all()

        cin = self.request.query_params.get('cin')
        nax = self.request.query_params.get('nax')
        cotisation = self.request.query_params.get('cotisation')

        if cin:
            queryset = queryset.filter(adherent__cin__icontains=cin)

        if nax:
            try:
                queryset = queryset.filter(adherent__id=int(nax))
            except ValueError:
                pass  # au cas où nax n'est pas un entier

        if cotisation in ['oui', 'non']:
            queryset = queryset.filter(cotisation=cotisation)

        return queryset
        

from .utils import generer_recu_pdf  # Assure-toi d’avoir cette fonction dans utils.py

class SoinViewSet(viewsets.ModelViewSet):
    queryset = Soin.objects.all()
    serializer_class = SoinSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'adherent__cin': ['exact'],
        'adherent__nom': ['icontains'],
        'adherent__prenom': ['icontains'],
        'adherent__nax': ['exact'],
        'num_recu': ['icontains'],
        'statut_dossier': ['exact'],
    }

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        soin = serializer.save()
        headers = self.get_success_headers(serializer.data)

        # ✅ Génération PDF après création
        generer_recu_pdf(soin)

        return Response(
            {'message': 'Soin ajouté avec succès', 'id': soin.id},
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        soin = serializer.save()

        # ✅ Génération PDF après modification
        generer_recu_pdf(soin)

        return Response(
            {'message': 'Soin mis à jour avec succès', 'id': soin.id},
            status=status.HTTP_200_OK
        )

def recu_pdf(request, soin_id):
    soin = get_object_or_404(Soin, id=soin_id)

    html_string = render_to_string('recu_template.html', {'soin': soin})
    html = HTML(string=html_string)
    pdf = html.write_pdf()

    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="recu_{soin.num_recu}.pdf"'  # ✅ download automatique
    return response








