from django.contrib import admin
from .models import Adherent, Cotisation, Soin

# Register your models here.

admin.site.register(Adherent)
admin.site.register(Cotisation)
admin.site.register(Soin)

