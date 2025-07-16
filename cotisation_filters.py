# api/cotisation_filters.py
import django_filters
from .models import Cotisation

class CotisationFilter(django_filters.FilterSet):
    nax = django_filters.CharFilter(method='filter_by_nax')
    cin = django_filters.CharFilter(field_name='adherent__cin', lookup_expr='icontains')
    cotisation = django_filters.CharFilter(field_name='cotisation', lookup_expr='iexact')

    class Meta:
        model = Cotisation
        fields = ['nax', 'cin', 'cotisation']

    def filter_by_nax(self, queryset, name, value):
        try:
            int_id = int(value)
            return queryset.filter(adherent__id=int_id)
        except:
            return queryset.none()
