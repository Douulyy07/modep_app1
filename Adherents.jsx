import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Eye, Download } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Modal from '../components/UI/Modal';
import Alert from '../components/UI/Alert';
import { adherentsAPI } from '../services/api';

export default function Adherents() {
  const [adherents, setAdherents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    nom: '',
    prenom: '',
    cin: '',
    nax: '',
    statut: '',
    a_droit: ''
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdherent, setSelectedAdherent] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    cin: '',
    numero_tel: '',
    rib: '',
    ville: '',
    date_naissance: '',
    sexe: '',
    adresse: '',
    organisme_employeur: '',
    section_cotisation: '',
    date_recrutement: '',
    salaire: '',
    statut: '',
    a_droit: ''
  });

  useEffect(() => {
    fetchAdherents();
  }, []);

  const fetchAdherents = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await adherentsAPI.getAll(filters);
      setAdherents(response.data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Erreur lors du chargement des adhérents'
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
    
    fetchAdherents(activeFilters);
  };

  const handleInputChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    if (name === 'organisme_employeur') {
      return {
        ...prev,
        organisme_employeur: value,
        section_cotisation: value // synchroniser automatiquement
      };
    }

    return {
      ...prev,
      [name]: value
    };
  });
};


  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      cin: '',
      numero_tel: '',
      rib: '',
      ville: '',
      date_naissance: '',
      sexe: '',
      adresse: '',
      organisme_employeur: '',
      section_cotisation: '',
      date_recrutement: '',
      salaire: '',
      statut: '',
      a_droit: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adherentsAPI.create(formData);
      setAlert({
        type: 'success',
        message: 'Adhérent ajouté avec succès'
      });
      
      // Open PDF card
      const newId = response.data.id;
      window.open(`http://localhost:8000/media/cartes/carte_${newId}.pdf`, '_blank');
      
      setShowAddModal(false);
      resetForm();
      fetchAdherents();
    } catch (error) {
      const errorMessage = error.response?.data 
        ? Object.entries(error.response.data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join(' | ')
        : 'Erreur lors de l\'ajout de l\'adhérent';
      
      setAlert({
        type: 'error',
        message: errorMessage
      });
    }
  };

  const handleEdit = (adherent) => {
    setSelectedAdherent(adherent);
    setFormData({ ...adherent });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await adherentsAPI.update(selectedAdherent.id, formData);
      setAlert({
        type: 'success',
        message: 'Adhérent mis à jour avec succès'
      });
      setShowEditModal(false);
      fetchAdherents();
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Erreur lors de la mise à jour'
      });
    }
  };

  const sexeOptions = [
    { value: '', label: 'Sélectionner sexe' },
    { value: 'homme', label: 'Homme' },
    { value: 'femme', label: 'Femme' }
  ];

  const statutOptions = [
    { value: '', label: 'Sélectionner statut' },
    { value: 'actif', label: 'Actif' },
    { value: 'retraite', label: 'Retraité' }
  ];

  const droitOptions = [
    { value: '', label: 'Sélectionner droit' },
    { value: 'ayant_droit', label: 'Ayant droit' },
    { value: 'sans_droit', label: 'Sans droit' }
  ];

  const organismeOptions = [
    { value: '', label: 'Sélectionner organisme' },
    { value: 'anp', label: 'ANP' },
    { value: 'marsa_maroc', label: 'Marsa Maroc' },
     { value: 'modep', label: 'Modep' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Adhérents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez les adhérents de votre mutuelle
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          
          Ajouter un Adhérent
        </Button>
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
          Rechercher un adhérent
        </h3>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          <Input
            name="nax"
            placeholder="NAX"
            maxLength={6}
            value={searchFilters.nax}
            onChange={handleSearchInputChange}
          />
          <Select
            name="statut"
            options={statutOptions}
            value={searchFilters.statut}
            onChange={handleSearchInputChange}
          />
          <Button type="submit">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </Card>

      {/* Adherents List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Liste des Adhérents ({adherents.length})
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Droit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {adherents.map((adherent) => (
                  <motion.tr
                    key={adherent.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {adherent.prenom} {adherent.nom}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {adherent.ville}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        CIN: {adherent.cin}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        NAX: {adherent.nax}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        adherent.statut === 'actif' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {adherent.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        adherent.a_droit === 'ayant_droit'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {adherent.a_droit === 'ayant_droit' ? 'Ayant droit' : 'Sans droit'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(adherent)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`http://localhost:8000/media/cartes/carte_${adherent.id}.pdf`, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {adherents.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Aucun adhérent trouvé</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          title="Ajouter un Adhérent"
          size="lg"
        >
          <div className="max-h-[80vh] overflow-y-auto px-2">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Prénom"
            name="prenom"
            value={formData.prenom}
            onChange={handleInputChange}
            required
          />
          <Input
            label="CIN"
            name="cin"
            maxLength={10}
            value={formData.cin}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Téléphone"
            name="numero_tel"
            value={formData.numero_tel}
            onChange={handleInputChange}
          />
          <Input
            label="RIB"
            name="rib"
            value={formData.rib}
            onChange={handleInputChange}
          />
          <Input
            label="Ville"
            name="ville"
            value={formData.ville}
            onChange={handleInputChange}
          />
          <Input
            label="Date de naissance"
            name="date_naissance"
            type="date"
            value={formData.date_naissance}
            onChange={handleInputChange}
          />
          <Select
            label="Sexe"
            name="sexe"
            options={sexeOptions}
            value={formData.sexe}
            onChange={handleInputChange}
          />
          <Select
            label="Statut"
            name="statut"
            options={statutOptions}
            value={formData.statut}
            onChange={handleInputChange}
          />
          <Select
            label="Droit"
            name="a_droit"
            options={droitOptions}
            value={formData.a_droit}
            onChange={handleInputChange}
            required
          />
          <Select
            label="Organisme employeur"
            name="organisme_employeur"
            options={organismeOptions}
            value={formData.organisme_employeur}
            onChange={handleInputChange}
          />
          <Select
            label="Section cotisation"
            name="section_cotisation"
            options={organismeOptions}
            value={formData.section_cotisation}
            onChange={handleInputChange}
          />
          <Input
            label="Date de recrutement"
            name="date_recrutement"
            type="date"
            value={formData.date_recrutement}
            onChange={handleInputChange}
          />
          <Input
            label="Salaire"
            name="salaire"
            type="number"
            step="0.01"
            value={formData.salaire}
            onChange={handleInputChange}
          />
          <div className="md:col-span-2">
            <Input
              label="Adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button type="submit">
              Ajouter l'adhérent
            </Button>
          </div>
        </form>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier l'Adhérent"
        size="lg"
      >
        <div className="max-h-[80vh] overflow-y-auto px-2">
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Prénom"
            name="prenom"
            value={formData.prenom}
            onChange={handleInputChange}
            required
          />
          <Input
            label="CIN"
            name="cin"
            maxLength={10}
            value={formData.cin}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Téléphone"
            name="numero_tel"
            value={formData.numero_tel}
            onChange={handleInputChange}
          />
          <Input
            label="RIB"
            name="rib"
            value={formData.rib}
            onChange={handleInputChange}
          />
          <Input
            label="Ville"
            name="ville"
            value={formData.ville}
            onChange={handleInputChange}
          />
          <Input
            label="Date de naissance"
            name="date_naissance"
            type="date"
            value={formData.date_naissance}
            onChange={handleInputChange}
          />
          <Select
            label="Sexe"
            name="sexe"
            options={sexeOptions}
            value={formData.sexe}
            onChange={handleInputChange}
          />
          <Select
            label="Statut"
            name="statut"
            options={statutOptions}
            value={formData.statut}
            onChange={handleInputChange}
          />
          <Select
            label="Organisme employeur"
            name="organisme_employeur"
            options={organismeOptions}
            value={formData.organisme_employeur}
            onChange={handleInputChange}
          />
          <Select
            label="Section cotisation"
            name="section_cotisation"
            options={organismeOptions}
            value={formData.section_cotisation}
            onChange={handleInputChange}
          />
          <Input
            label="Date de recrutement"
            name="date_recrutement"
            type="date"
            value={formData.date_recrutement}
            onChange={handleInputChange}
          />
          <Input
            label="Salaire"
            name="salaire"
            type="number"
            step="0.01"
            value={formData.salaire}
            onChange={handleInputChange}
          />
          <div className="md:col-span-2">
            <Input
              label="Adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
            />
          </div>
          <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              Mettre à jour
            </Button>
          </div>
        </form>
        </div>
      </Modal>
    </div>
  );
}