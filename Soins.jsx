import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Download, User, FileText } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Modal from '../components/UI/Modal';
import Alert from '../components/UI/Alert';
import { soinsAPI, adherentsAPI } from '../services/api';

export default function Soins() {
  const [soins, setSoins] = useState([]);
  const [adherents, setAdherents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    num_recu: '',
    nom: '',
    prenom: '',
    nax: '',
    statut_dossier: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSoin, setSelectedSoin] = useState(null);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    nax: '',
    num_recu: '',
    date_soin: '',
    date_fin_soin: '',
    montant_dossier: '',
    statut_dossier: '',
    type_beneficier: 'Adherent'
  });
  const [adherentTrouve, setAdherentTrouve] = useState(null);

  useEffect(() => {
    fetchSoins();
    fetchAdherents();
  }, []);

  useEffect(() => {
    if (formData.nax && adherents.length > 0) {
      const match = adherents.find(a => a.nax === formData.nax);
      setAdherentTrouve(match || null);
    } else {
      setAdherentTrouve(null);
    }
  }, [formData.nax, adherents]);

  const fetchSoins = async (filters = {}) => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.num_recu) params['num_recu'] = filters.num_recu;
      if (filters.nom) params['adherent__nom'] = filters.nom;
      if (filters.prenom) params['adherent__prenom'] = filters.prenom;
      if (filters.nax) params['adherent__nax'] = filters.nax;
      if (filters.statut_dossier) params['statut_dossier'] = filters.statut_dossier;

      const response = await soinsAPI.getAll(params);
      setSoins(response.data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Erreur lors du chargement des soins'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdherents = async () => {
    try {
      const response = await adherentsAPI.getAll();
      setAdherents(response.data);
    } catch (error) {
      console.error('Error fetching adherents:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const activeFilters = Object.entries(searchFilters)
      .filter(([_, value]) => value.trim() !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value.trim() }), {});
    
    fetchSoins(activeFilters);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      nax: '',
      num_recu: '',
      date_soin: '',
      date_fin_soin: '',
      montant_dossier: '',
      statut_dossier: '',
      type_beneficier: 'Adherent'
    });
    setAdherentTrouve(null);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const adherent = adherents.find(a => a.nax === formData.nax);
  if (!adherent) {
    setAlert({
      type: 'error',
      message: 'Aucun adhérent trouvé avec ce NAX'
    });
    return;
  }

  // Vérification du droit ici (supposons que adherent.a_droit contient "ayant_droit" ou "sans_droit")
  if (adherent.a_droit !== 'ayant_droit') {
    setAlert({
      type: 'error',
      message: "L'adhérent n'a pas le droit de créer un dossier de soin."
    });
    return;
  }

  try {
    const dataToSend = {
      ...formData,
      adherent_id: adherent.id
    };
    delete dataToSend.nax;

    const response = await soinsAPI.create(dataToSend);
    setAlert({
      type: 'success',
      message: 'Dossier soin ajouté avec succès'
    });

    // Ouvre le reçu PDF
    const soinId = response.data.id;
    window.open(`http://127.0.0.1:8000/recu/${soinId}/`, '_blank');

    setShowAddModal(false);
    resetForm();
    fetchSoins();
  } catch (error) {
    setAlert({
      type: 'error',
      message: "Erreur lors de l'ajout du dossier"
    });
  }
};


  const handleEdit = (soin) => {
    setSelectedSoin(soin);
    setFormData({
      nax: soin.adherent.nax,
      num_recu: soin.num_recu,
      date_soin: soin.date_soin,
      date_fin_soin: soin.date_fin_soin,
      montant_dossier: soin.montant_dossier,
      statut_dossier: soin.statut_dossier,
      type_beneficier: soin.type_beneficier || 'Adherent'
    });
    setShowEditModal(true);
  };

const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    const dataToSend = {
      ...formData,
      adherent_id: selectedSoin.adherent.id
    };
    delete dataToSend.nax;

    await soinsAPI.update(selectedSoin.id, dataToSend);

    setAlert({
      type: 'success',
      message: 'Dossier mis à jour avec succès'
    });

    // Téléchargement automatique du reçu après mise à jour
    window.open(`http://127.0.0.1:8000/recu/${selectedSoin.id}/`, '_blank');

    setShowEditModal(false);
    fetchSoins();
  } catch (error) {
    setAlert({
      type: 'error',
      message: 'Erreur lors de la mise à jour'
    });
  }
};


  const statutOptions = [
    { value: '', label: 'statut' },
    { value: 'recu', label: 'Reçu' },
    { value: 'rejet', label: 'Rejeté' }
  ];

  const statutFormOptions = [
    { value: '', label: 'Sélectionner statut' },
    { value: 'recu', label: 'Reçu' },
    { value: 'rejet', label: 'Rejeté' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Soins</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez les dossiers de soins des adhérents
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          
          Ajouter Dossier
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
          Rechercher des dossiers de soins
        </h3>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Input
            name="num_recu"
            placeholder="Numéro reçu"
            maxLength={8}
            value={searchFilters.num_recu}
            onChange={handleSearchInputChange}
          />
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
            name="nax"
            placeholder="NAX"
            maxLength={6}
            value={searchFilters.nax}
            onChange={handleSearchInputChange}
          />
          <Select
            name="statut_dossier"
            options={statutOptions}
            value={searchFilters.statut_dossier}
            onChange={handleSearchInputChange}
          />
          <Button type="submit">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </Card>

      {/* Soins List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Liste des Dossiers de Soins ({soins.length})
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
                    NAX / Reçu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Période Soin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {soins.map((soin) => (
                  <motion.tr
                    key={soin.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {soin.adherent?.prenom} {soin.adherent?.nom}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {soin.type_beneficier}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        NAX: {soin.adherent?.nax}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Reçu: {soin.num_recu}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        Du: {new Date(soin.date_soin).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Au: {new Date(soin.date_fin_soin).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {parseFloat(soin.montant_dossier).toLocaleString('fr-FR')} MAD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        soin.statut_dossier === 'recu'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {soin.statut_dossier === 'recu' ? 'Reçu' : 'Rejeté'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(soin)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`http://127.0.0.1:8000/recu/${soin.id}/`, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {soins.length === 0 && !loading && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Aucun dossier de soin trouvé</p>
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
        title="Ajouter un Dossier de Soin"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="NAX de l'adhérent"
            name="nax"
            placeholder="Entrer le NAX"
            maxLength={6}
            value={formData.nax}
            onChange={handleInputChange}
            required
          />
          
{adherentTrouve && (
  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
    <div className="flex items-center space-x-2">
      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
        {adherentTrouve.prenom} {adherentTrouve.nom} trouvé(e)
      </span>
      <span
        className={`text-sm font-medium ml-4 px-2 py-1 rounded-lg ${
          adherentTrouve.a_droit === 'ayant_droit'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-200'
            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-200'
        }`}
      >
        {adherentTrouve.a_droit === 'ayant_droit' ? 'Ayant droit' : 'Sans droit'}
      </span>
    </div>
  </div>
)}


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Numéro reçu"
              name="num_recu"
              placeholder="Numéro reçu"
              maxLength={8}
              value={formData.num_recu}
              onChange={handleInputChange}
              required
            />
            <Select
              label="Statut du dossier"
              name="statut_dossier"
              options={statutFormOptions}
              value={formData.statut_dossier}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Date de soin"
              name="date_soin"
              type="date"
              value={formData.date_soin}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Date fin soin"
              name="date_fin_soin"
              type="date"
              value={formData.date_fin_soin}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Montant du dossier"
              name="montant_dossier"
              type="number"
              step="0.01"
              placeholder="Montant"
              value={formData.montant_dossier}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Type bénéficiaire"
              name="type_beneficier"
              value={formData.type_beneficier}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
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
              Ajouter le dossier
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier le Dossier de Soin"
        size="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {selectedSoin?.adherent?.prenom} {selectedSoin?.adherent?.nom} (NAX: {selectedSoin?.adherent?.nax})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Numéro reçu"
              name="num_recu"
              placeholder="Numéro reçu"
              maxLength={8}
              value={formData.num_recu}
              onChange={handleInputChange}
              required
            />
            <Select
              label="Statut du dossier"
              name="statut_dossier"
              options={statutFormOptions}
              value={formData.statut_dossier}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Date de soin"
              name="date_soin"
              type="date"
              value={formData.date_soin}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Date fin soin"
              name="date_fin_soin"
              type="date"
              value={formData.date_fin_soin}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Montant du dossier"
              name="montant_dossier"
              type="number"
              step="0.01"
              placeholder="Montant"
              value={formData.montant_dossier}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Type bénéficiaire"
              name="type_beneficier"
              value={formData.type_beneficier}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
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
      </Modal>
    </div>
  );
}