from django.template.loader import render_to_string
from weasyprint import HTML
import os
from django.conf import settings

def generer_carte_mutuelle_pdf(adherent):
    context = {
        'nom': adherent.nom,
        'prenom': adherent.prenom,
        'cin': adherent.cin,
        'nax': adherent.nax,
        'date_recu': adherent.date_recrutement.strftime('%d/%m/%Y'),
    }

    html_string = render_to_string('carte_mutuelle.html', context)
    output_path = os.path.join(settings.MEDIA_ROOT, 'cartes', f'carte_{adherent.id}.pdf')

    HTML(string=html_string).write_pdf(output_path)
    return output_path

from django.template.loader import render_to_string
from weasyprint import HTML
import os

def generer_recu_pdf(soin):
    html_string = render_to_string('recu_template.html', {'soin': soin})
    html = HTML(string=html_string)
    
    dossier = 'recu_pdfs'
    os.makedirs(dossier, exist_ok=True)

    chemin_pdf = os.path.join(dossier, f"recu_{soin.num_recu}.pdf")
    html.write_pdf(target=chemin_pdf)

    # Optionnel : tu peux stocker le chemin dans le modèle si besoin
    return chemin_pdf
