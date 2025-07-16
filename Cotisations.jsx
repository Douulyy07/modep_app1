import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Edit, Save, X } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Alert from '../components/UI/Alert';
import { cotisationsAPI } from '../services/api';

export default function Cotisations() {
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    nom: '',
    prenom: '',
    cin: '',
    cotisation: ''
  });
  const [alert, setAlert] = useState(null);

  // id de la cotisation en modification + nouvelle valeur temporaire
  const [editingId, setEditingId] = useState(null);
  const [newCotisationValue, setNewCotisationValue] = useState('');

  useEffect(() => {
    fetchCotisations();
  }, []);

  const fetchCotisations = async (filters = {}) => {
    try {
      setLoading(true);
      const params = {};
      if (filters.nom) params['adherent__nom'] = filters.nom;
      if (filters.prenom) params['adherent__prenom'] = filters.prenom;
      if (filters.cin) params['cin'] = filters.cin;
      if (filters.cotisation) params['cotisation'] = filters.cotisation;

      const response = await cotisationsAPI.getAll(params);
      setCotisations(response.data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Erreur lors du chargement des cotisations'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const activeFilters = Object.entries(searchFilters)
      .filter(([_, value]) => value.trim() !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value.trim() }), {});
    fetchCotisations(activeFilters);
  };

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  // Autorise modification uniquement si date_debut est null ou > 30 jours
  const canModify = (dateDebutStr) => {
    if (!dateDebutStr) return true;
    const dateDebut = new Date(dateDebutStr);
    const now = new Date();
    const diffMs = now - dateDebut;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 30;
  };

  // Ouvrir édition pour une cotisation
  const startEditing = (cotisation) => {
    if (!canModify(cotisation.date_debut)) {
      setAlert({
        type: 'error',
        message: 'Modification possible uniquement après 1 mois de la date de début.'
      });
      return;
    }
    setEditingId(cotisation.id);
    setNewCotisationValue(cotisation.cotisation);
  };

  // Annuler édition
  const cancelEditing = () => {
    setEditingId(null);
    setNewCotisationValue('');
  };

  // Sauvegarder modification
  const saveModification = async (id) => {
    try {
      const updateData = {
        cotisation: newCotisationValue,
        a_droit: newCotisationValue === 'oui' ? 'ayant_droit' : 'sans_droit',
        date_debut: newCotisationValue === 'oui' ? new Date().toISOString().slice(0, 10) : null,
        date_fin: newCotisationValue === 'oui' ? null : null // backend gère la date_fin si besoin
      };
      await cotisationsAPI.patch(id, updateData);
      setAlert({
        type: 'success',
        message: 'Cotisation mise à jour avec succès'
      });
      setEditingId(null);
      setNewCotisationValue('');
      fetchCotisations();
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Erreur lors de la mise à jour de la cotisation'
      });
    }
  };

  const cotisationOptions = [
    { value: 'oui', label: 'Oui' },
    { value: 'non', label: 'Non' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestion des Cotisations
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez les cotisations des adhérents
        </p>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Rechercher des cotisations
        </h3>
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <Input
            name="nom"
            placeholder="Nom"
            value={searchFilters.nom}
            onChange={handleSearchInputChange}
          />
          <Input
            name="prenom"
            placeholder="Prénom"
            value={searchFilters.prenom}
            onChange={handleSearchInputChange}
          />
          <Input
            name="cin"
            placeholder="CIN"
            maxLength={10}
            value={searchFilters.cin}
            onChange={handleSearchInputChange}
          />
          <Select
            name="cotisation"
            options={[{ value: '', label: 'Tous' }, ...cotisationOptions]}
            value={searchFilters.cotisation}
            onChange={handleSearchInputChange}
          />
          <Button type="submit">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </Card>

      {/* Cotisations List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Liste des Cotisations ({cotisations.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Adhérent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    CIN / NAX
                  </th>
                  {/* RIB supprimé */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date Recrutement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Droit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cotisation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {cotisations.map((cotisation) => {
                  const isEditing = editingId === cotisation.id;
                  return (
                    <motion.tr
                      key={cotisation.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        isEditing
                          ? 'shadow-lg bg-white dark:bg-gray-900 transition-shadow duration-300'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {cotisation.prenom} {cotisation.nom}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          CIN: {cotisation.cin}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          NAX: {cotisation.nax}
                        </div>
                      </td>
                      {/* RIB supprimé */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {cotisation.date_recrutement
                          ? new Date(cotisation.date_recrutement).toLocaleDateString(
                              'fr-FR'
                            )
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            cotisation.a_droit === 'ayant_droit'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}
                        >
                          {cotisation.a_droit === 'ayant_droit'
                            ? 'Ayant droit'
                            : 'Sans droit'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          Du:{' '}
                          {cotisation.date_debut
                            ? new Date(cotisation.date_debut).toLocaleDateString(
                                'fr-FR'
                              )
                            : '-'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Au:{' '}
                          {cotisation.date_fin
                            ? new Date(cotisation.date_fin).toLocaleDateString(
                                'fr-FR'
                              )
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* Affichage normal ou modal */}
                        {!isEditing ? (
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                cotisation.cotisation === 'oui'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}
                            >
                              {cotisation.cotisation === 'oui' ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {cotisation.cotisation === 'oui' ? 'Oui' : 'Non'}
                            </span>
                            {canModify(cotisation.date_debut) && (
                              <button
                                onClick={() => {
                                  setEditingId(cotisation.id);
                                  setNewCotisationValue(cotisation.cotisation);
                                }}
                                className="p-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                aria-label="Modifier cotisation"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : null}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {cotisations.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Aucune cotisation trouvée</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modal de modification */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Modifier la cotisation
            </h2>

            <select
              value={newCotisationValue}
              onChange={(e) => setNewCotisationValue(e.target.value)}
              className="w-full px-4 py-2 mb-4 border rounded-md text-sm font-medium dark:bg-gray-800 dark:text-white dark:border-gray-600"
            >
              {cotisationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => saveModification(editingId)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-1" />
                Sauvegarder
              </button>
              <button
                onClick={cancelEditing}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
