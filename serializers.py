from rest_framework import serializers
from .models import Adherent, Cotisation, Soin
from django.conf import settings

class AdherentSerializer(serializers.ModelSerializer):
    nax = serializers.SerializerMethodField()

    class Meta:
        model = Adherent
        fields = '__all__'  # ou liste personnalisée, assure-toi d'inclure 'nax'
        
    def get_nax(self, obj):
        return str(obj.id).zfill(6) if obj.id else None
    def get_carte_pdf_url(self, obj):
        # Suppose que ta carte s'appelle 'carte_{id}.pdf'
        return settings.MEDIA_URL + f'cartes/carte_{obj.id}.pdf'
    

class CotisationSerializer(serializers.ModelSerializer):
    adherent_id = serializers.IntegerField(source='adherent.id', read_only=True)
    nom = serializers.CharField(source='adherent.nom', read_only=True)
    prenom = serializers.CharField(source='adherent.prenom', read_only=True)
    cin = serializers.CharField(read_only=True)  # ✅ ici on évite le source et on le garde simple
    nax = serializers.SerializerMethodField()
    rib = serializers.CharField(source='adherent.rib', read_only=True)
    date_recrutement = serializers.DateField(source='adherent.date_recrutement', read_only=True)
    a_droit = serializers.CharField(source='adherent.a_droit', read_only=True)

    class Meta:
        model = Cotisation
        fields = [
            'id', 'nom', 'prenom', 'cin', 'nax', 'rib',
            'date_recrutement', 'a_droit', 'cotisation',
            'date_debut', 'date_fin', 'adherent_id'
        ]
        extra_kwargs = {
            'cotisation': {'required': False},  # ✅ Permet PATCH partiel
            'date_debut': {'required': False},
            'date_fin': {'required': False},
        }

    def get_nax(self, obj):
        if obj.adherent and obj.adherent.id:
            return str(obj.adherent.id).zfill(6)
        return None

class SoinSerializer(serializers.ModelSerializer):
    adherent = AdherentSerializer(read_only=True)
    adherent_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Soin
        fields = [
            'id', 'adherent', 'adherent_id',
            'num_recu', 'statut_dossier', 'montant_dossier',
            'type_beneficier', 'date_soin', 'date_fin_soin'
        ]
    


