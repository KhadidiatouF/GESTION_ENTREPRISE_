import { 
  Building2, Users, DollarSign, TrendingUp, Bell, Settings, LogOut, Activity, ChevronDown, FileText, Crown 
} from 'lucide-react';
export const StatCard = ({ title, value, icon: Icon, iconBgColor, evolutionText, evolutionType, evolutionValue }) => {
  
  const EvolutionIcon = evolutionType === 'good' ? TrendingUp : TrendingUp; // Utilisez TrendingUp pour les deux, la couleur donne le contexte
  const evolutionColor = evolutionType === 'good' ? 'text-green-600' : evolutionType === 'bad' ? 'text-red-600' : 'text-gray-600';
  const evolutionIconColor = evolutionType === 'good' ? 'text-green-500' : evolutionType === 'bad' ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${evolutionIconColor.replace('500', '600')}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {evolutionValue && (
          <EvolutionIcon className={`w-4 h-4 ${evolutionIconColor} mr-1`} />
        )}
        <span className={evolutionColor}>{evolutionText}</span>
      </div>
    </div>
  );
};