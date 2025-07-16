import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CreditCard, Heart, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../components/UI/Card';
import { adherentsAPI, cotisationsAPI, soinsAPI } from '../services/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAdherents: 0,
    totalCotisations: 0,
    totalSoins: 0,
    soinsRecu: 0,
    soinsRejet: 0,
    loading: true
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [adherentsRes, cotisationsRes, soinsRes] = await Promise.all([
        adherentsAPI.getAll(),
        cotisationsAPI.getAll(),
        soinsAPI.getAll()
      ]);

      const adherents = adherentsRes.data;
      const cotisations = cotisationsRes.data;
      const soins = soinsRes.data;

      const soinsRecu = soins.filter(s => s.statut_dossier === 'recu').length;
      const soinsRejet = soins.filter(s => s.statut_dossier === 'rejet').length;

      setStats({
        totalAdherents: adherents.length,
        totalCotisations: cotisations.length,
        totalSoins: soins.length,
        soinsRecu,
        soinsRejet,
        loading: false
      });

      // Prepare chart data
      const monthlyData = {};
      soins.forEach(soin => {
        const month = new Date(soin.date_soin).toLocaleDateString('fr-FR', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });

      const chartDataArray = Object.entries(monthlyData).map(([month, count]) => ({
        month,
        soins: count
      }));

      setChartData(chartDataArray);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      title: 'Total Adhérents',
      value: stats.totalAdherents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Total Cotisations',
      value: stats.totalCotisations,
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Total Soins',
      value: stats.totalSoins,
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Dossiers Reçus',
      value: stats.soinsRecu,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20'
    }
  ];

  const pieData = [
    { name: 'Dossiers Reçus', value: stats.soinsRecu },
    { name: 'Dossiers Rejetés', value: stats.soinsRejet }
  ];

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Vue d'ensemble de votre système de gestion mutualiste
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Évolution des Soins par Mois
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="soins" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Statut des Dossiers de Soins
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Activité Récente
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Nouveau dossier de soin ajouté
            </span>
            <span className="text-xs text-gray-500 ml-auto">Il y a 2 heures</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Nouvel adhérent enregistré
            </span>
            <span className="text-xs text-gray-500 ml-auto">Il y a 4 heures</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Cotisation mise à jour
            </span>
            <span className="text-xs text-gray-500 ml-auto">Il y a 6 heures</span>
          </div>
        </div>
      </Card>
    </div>
  );
}