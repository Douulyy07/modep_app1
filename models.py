from django.db import models
from datetime import timedelta
from dateutil.relativedelta import relativedelta  # pour gérer les mois
# Create your models here.

class Adherent(models.Model):
    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('retraite', 'Retraité'),
    ]
    TYPE_ADHERENT_CHOICES = [
        ('ayant_droit', 'Ayant droit'),
        ('sans_droit', 'Sans droit'),
    ]
    SEXE_CHOICES = [
        ('homme', 'Homme'),
        ('femme', 'Femme'),
    ]

    ORGANISME_CHOICES = [
        ('anp', 'ANP'),
        ('marsa_maroc', 'Marsa Maroc'),
        ('modep', 'Modep'),
    ]
    nax = models.CharField(max_length=6, unique=True, blank=True, null=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)

    date_naissance = models.DateField()
    cin = models.CharField(max_length=10, unique=True)
    sexe = models.CharField(max_length=10, choices=SEXE_CHOICES)
    date_recrutement = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20,choices=STATUT_CHOICES)
    a_droit = models.CharField(max_length=20, choices=TYPE_ADHERENT_CHOICES)
    numero_tel = models.CharField(max_length=15)
    rib = models.CharField(max_length=24)
    ville = models.CharField(max_length=100)
    adresse = models.TextField()
    salaire = models.DecimalField(max_digits=10, decimal_places=2)
    organisme_employeur = models.CharField(max_length=20, choices=ORGANISME_CHOICES)
    section_cotisation = models.CharField(max_length=20, choices=ORGANISME_CHOICES)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # Sauvegarde d'abord pour avoir un id attribué
        if not self.nax:
            self.nax = str(self.id).zfill(6)
            super().save(update_fields=['nax']) 

    def __str__(self):
        return f" {self.id:06d} {self.prenom} {self.nom} ({self.cin})"



class Cotisation(models.Model):
    COTISATION_CHOICES = [
        ('oui', 'Oui'),
        ('non', 'Non'),
    ]

    adherent = models.ForeignKey('Adherent', on_delete=models.CASCADE, related_name="cotisations")
    cotisation = models.CharField(max_length=20, choices=COTISATION_CHOICES)
    cin = models.CharField(max_length=10,unique=True)
    date_debut = models.DateField(null=True, blank=True)
    date_fin = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.date_debut:
            # date_fin = date_debut + 1 mois
            self.date_fin = self.date_debut + relativedelta(months=+1)
        else:
            self.date_fin = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.adherent.nom} - {self.adherent.prenom} - {self.cotisation}"




class Soin(models.Model):
    STATUTD_CHOICES=[
        ('recu','RECU'),
        ('rejet','REJET'),
    ]
    adherent = models.ForeignKey(Adherent, on_delete=models.CASCADE, related_name="soins")
    num_recu = models.CharField(max_length=50)
    statut_dossier = models.CharField(max_length=20, choices=STATUTD_CHOICES)
    montant_dossier = models.DecimalField(max_digits=10, decimal_places=2)
    type_beneficier=models.CharField(max_length=100,default='Adherent')
    date_soin = models.DateField()
    date_fin_soin = models.DateField()
    

    def __str__(self):
        return f"{self.adherent.nom} {self.adherent.prenom} - {self.date_soin}"
