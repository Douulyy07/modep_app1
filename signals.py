from django.db.models.signals import pre_save
from django.dispatch import receiver
from datetime import timedelta, date
from .models import Adherent, Cotisation, Soin

# ✅ Création de cotisation à l’ajout d’un adhérent
from django.db.models.signals import post_save

@receiver(post_save, sender=Adherent)
def create_cotisation_for_adherent(sender, instance, created, **kwargs):
    if created and instance.a_droit == 'ayant_droit':
        date_debut = instance.date_recrutement or date.today()
        date_fin = date_debut + timedelta(days=30)
        Cotisation.objects.create(
            adherent=instance,
            cin=instance.cin,
            cotisation='oui',
            date_debut=date_debut,
            date_fin=date_fin
        )

# ✅ Mise à jour de la cotisation si le droit change
@receiver(pre_save, sender=Adherent)
def update_cotisation_on_droit_change(sender, instance, **kwargs):
    if getattr(instance, '_disable_signal', False):
        return

    if not instance.pk:
        return

    try:
        old_instance = Adherent.objects.get(pk=instance.pk)
    except Adherent.DoesNotExist:
        return

    if old_instance.a_droit != instance.a_droit:
        try:
            cotisation = Cotisation.objects.get(adherent=instance)
            if instance.a_droit == 'ayant_droit':
                cotisation.cotisation = 'oui'
                cotisation.date_debut = date.today()
                cotisation.date_fin = date.today() + timedelta(days=30)
            else:
                cotisation.cotisation = 'non'
                cotisation.date_debut = None
                cotisation.date_fin = None
            cotisation._disable_signal = True
            cotisation.save()
        except Cotisation.DoesNotExist:
            pass

# ✅ Mise à jour du droit si la cotisation change
@receiver(pre_save, sender=Cotisation)
def update_droit_on_cotisation_change(sender, instance, **kwargs):
    if getattr(instance, '_disable_signal', False):
        return

    if not instance.pk:
        return

    try:
        old_instance = Cotisation.objects.get(pk=instance.pk)
    except Cotisation.DoesNotExist:
        return

    if old_instance.cotisation != instance.cotisation:
        adherent = instance.adherent
        adherent._disable_signal = True
        if instance.cotisation == 'oui':
            adherent.a_droit = 'ayant_droit'
        else:
            adherent.a_droit = 'sans_droit'
        adherent.save()



