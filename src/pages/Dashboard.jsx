import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CreditCard, 
  Heart, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Calendar,
  Download,
  Plus,
  ArrowUpRight,
  Activity,
  Shield,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import Card from '../components/UI/Card';
import { adherentsAPI, cotisationsAPI, soinsAPI } from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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
  const [timeRange, setTimeRange] = useState('6m');
  const [searchTerm, setSearchTerm] = useState('');

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

      // Prepare enhanced chart data
      const monthlyData = {};
      const last6Months = Array.from({length: 6}, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      }).reverse();

      last6Months.forEach(month => {
        monthlyData[month] = { soins: 0, montant: 0 };
      });

      soins.forEach(soin => {
        const month = new Date(soin.date_soin).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        if (monthlyData[month]) {
          monthlyData[month].soins += 1;
          monthlyData[month].montant += parseFloat(soin.montant_dossier || 0);
        }
      });

      const chartDataArray = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        soins: data.soins,
        montant: data.montant
      }));

      setChartData(chartDataArray);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      title: 'Adhérents Actifs',
      value: stats.totalAdherents,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'from-violet-50 to-purple-50',
      iconBg: 'bg-gradient-to-r from-violet-500 to-purple-600'
    },
    {
      title: 'Cotisations',
      value: stats.totalCotisations,
      change: '+8%',
      changeType: 'positive',
      icon: Shield,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-gradient-to-r from-emerald-500 to-teal-600'
    },
    {
      title: 'Dossiers Soins',
      value: stats.totalSoins,
      change: '+15%',
      changeType: 'positive',
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      bgColor: 'from-rose-50 to-pink-50',
      iconBg: 'bg-gradient-to-r from-rose-500 to-pink-600'
    },
    {
      title: 'Taux d\'Approbation',
      value: stats.totalSoins > 0 ? Math.round((stats.soinsRecu / stats.totalSoins) * 100) : 0,
      suffix: '%',
      change: '+3%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'from-indigo-50 to-blue-50',
      iconBg: 'bg-gradient-to-r from-indigo-500 to-blue-600'
    }
  ];

  const pieData = [
    { name: 'Approuvés', value: stats.soinsRecu, color: '#10b981' },
    { name: 'Rejetés', value: stats.soinsRejet, color: '#ef4444' }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'soin',
      title: 'Nouveau dossier de soin',
      description: 'Dossier #12345 soumis par Ahmed Benali',
      time: '2 min',
      icon: Heart,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100'
    },
    {
      id: 2,
      type: 'adherent',
      title: 'Nouvel adhérent',
      description: 'Fatima El Mansouri a rejoint la mutuelle',
      time: '15 min',
      icon: Users,
      color: 'text-violet-600',
      bgColor: 'bg-violet-100'
    },
    {
      id: 3,
      type: 'cotisation',
      title: 'Cotisation mise à jour',
      description: 'Statut modifié pour Mohammed Alami',
      time: '1h',
      icon: Shield,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      id: 4,
      type: 'system',
      title: 'Rapport mensuel généré',
      description: 'Rapport de novembre 2024 disponible',
      time: '2h',
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  if (stats.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Chargement du tableau de bord...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Tableau de Bord
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Vue d'ensemble de votre système mutualiste
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-80 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>

            {/* Time Range Selector */}
            <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-sm">
              {['1m', '3m', '6m', '1a'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Download className="w-5 h-5" />
              <span>Exporter</span>
            </motion.button>
          </div>
        </motion.div>

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
                whileHover={{ y: -4, scale: 1.02 }}
                className="group"
              >
                <div className={`relative overflow-hidden bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-white/50`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-slate-600 text-sm font-medium mb-2">
                        {stat.title}
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <p className="text-3xl font-bold text-slate-800">
                          {stat.value.toLocaleString()}
                          {stat.suffix && <span className="text-2xl">{stat.suffix}</span>}
                        </p>
                        <span className={`text-sm font-medium flex items-center ${
                          stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`${stat.iconBg} p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Subtle background pattern */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Évolution des Soins
                  </h3>
                  <p className="text-slate-600 mt-1">
                    Tendance sur les 6 derniers mois
                  </p>
                </div>
                <div className="flex space-x-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Dossiers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">Montant</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSoins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="soins"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSoins)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-white/50 h-full">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                  Statut des Dossiers
                </h3>
                <p className="text-slate-600 mt-1">
                  Répartition actuelle
                </p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-6 mt-4">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Activité Récente
                  </h3>
                  <p className="text-slate-600 mt-1">
                    Dernières actions du système
                  </p>
                </div>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                  Voir tout
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50/50 transition-colors duration-200 group"
                    >
                      <div className={`${activity.bgColor} p-2 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800">
                          {activity.title}
                        </p>
                        <p className="text-slate-600 text-sm mt-1">
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{activity.time}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-white/50">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                  Actions Rapides
                </h3>
                <p className="text-slate-600 mt-1">
                  Raccourcis fréquents
                </p>
              </div>
              
              <div className="space-y-3">
                {[
                  { 
                    title: 'Nouvel Adhérent', 
                    icon: Users, 
                    color: 'from-violet-500 to-purple-600',
                    href: '/adherents'
                  },
                  { 
                    title: 'Dossier Soin', 
                    icon: Heart, 
                    color: 'from-rose-500 to-pink-600',
                    href: '/soins'
                  },
                  { 
                    title: 'Gérer Cotisations', 
                    icon: Shield, 
                    color: 'from-emerald-500 to-teal-600',
                    href: '/cotisations'
                  },
                  { 
                    title: 'Rapport Mensuel', 
                    icon: Activity, 
                    color: 'from-indigo-500 to-blue-600',
                    href: '#'
                  }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.title}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center space-x-4 p-4 bg-gradient-to-r ${action.color} text-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200`}
                    >
                      <div className="bg-white/20 p-2 rounded-xl">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{action.title}</span>
                      <ArrowUpRight className="w-4 h-4 ml-auto" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}