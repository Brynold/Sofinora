import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Briefcase, Home, Car, CreditCard, LineChart, PlusCircle, MinusCircle, Trash2, BarChart2, Pencil, Check, X } from 'lucide-react';
import CalculatorLayout from '../components/CalculatorLayout';
import ActionableInsights from '../components/ActionableInsights';
import { Input, Button, Select } from '../components/CalculatorForm';
import FinancialChart, { ChartData } from '../components/FinancialChart';
import { useTheme } from '../context/ThemeContext';
import { formatCurrencyINR } from '../utils/finance';

interface Asset {
  id: string;
  name: string;
  value: number;
  category: 'cash' | 'investments' | 'property' | 'other';
}

interface Liability {
  id: string;
  name: string;
  value: number;
  category: 'mortgage' | 'loan' | 'credit' | 'other';
}

interface NetWorthHistory {
  date: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

const NetWorthTracker: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Reference to the Add button in the asset form - using element selection
  const assetButtonId = `asset-add-button-${Date.now()}`;
  
  // Default chart colors - used by FinancialChart component internally
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const defaultColors = [
    '#0ea5e9', '#64748b', '#0369a1', '#38bdf8', '#075985',
    '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#f43f5e',
  ];
  
  // Pre-defined color mapping - used by FinancialChart component internally
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const colorMapping: Record<string, string> = {
    'primary': isDark ? '#38bdf8' : '#0ea5e9', // Blue
    'emerald': isDark ? '#34d399' : '#10b981', // Green
    'rose': isDark ? '#fb7185' : '#f43f5e',    // Red
    'amber': isDark ? '#fbbf24' : '#f59e0b',   // Amber
    'purple': isDark ? '#a78bfa' : '#8b5cf6',  // Purple
    'pink': isDark ? '#f472b6' : '#ec4899',    // Pink
    'orange': isDark ? '#fb923c' : '#f97316',  // Orange
    'red': isDark ? '#ef4444' : '#dc2626',     // Red
    'blue': isDark ? '#60a5fa' : '#3b82f6',    // Blue
  };
  
  // Asset state
  const [assets, setAssets] = useState<Asset[]>([
    { id: '1', name: 'Savings Account', value: 100000, category: 'cash' },
    { id: '2', name: 'Investments', value: 200000, category: 'investments' },
    { id: '3', name: 'Primary Residence', value: 5000000, category: 'property' }
  ]);
  const [newAssetName, setNewAssetName] = useState<string>('');
  const [newAssetValue, setNewAssetValue] = useState<number>(0);
  const [newAssetCategory, setNewAssetCategory] = useState<Asset['category']>('cash');
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [assetDraft, setAssetDraft] = useState<Omit<Asset, 'id'> | null>(null);
  
  // Liability state
  const [liabilities, setLiabilities] = useState<Liability[]>([
    { id: '1', name: 'Home Loan', value: 3000000, category: 'mortgage' },
    { id: '2', name: 'Car Loan', value: 500000, category: 'loan' },
    { id: '3', name: 'Credit Card', value: 50000, category: 'credit' }
  ]);
  const [newLiabilityName, setNewLiabilityName] = useState<string>('');
  const [newLiabilityValue, setNewLiabilityValue] = useState<number>(0);
  const [newLiabilityCategory, setNewLiabilityCategory] = useState<Liability['category']>('loan');
  const [editingLiabilityId, setEditingLiabilityId] = useState<string | null>(null);
  const [liabilityDraft, setLiabilityDraft] = useState<Omit<Liability, 'id'> | null>(null);
  
  // Net worth history (simulated)
  const [netWorthHistory, setNetWorthHistory] = useState<NetWorthHistory[]>([
    { date: '6 months ago', assets: 5000000, liabilities: 4000000, netWorth: 1000000 },
    { date: '3 months ago', assets: 5200000, liabilities: 3900000, netWorth: 1300000 },
    { date: 'Now', assets: 0, liabilities: 0, netWorth: 0 }
  ]);
  
  // Calculated values
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [totalLiabilities, setTotalLiabilities] = useState<number>(0);
  const [netWorth, setNetWorth] = useState<number>(0);
  const [assetChartData, setAssetChartData] = useState<ChartData[]>([]);
  const [liabilityChartData, setLiabilityChartData] = useState<ChartData[]>([]);
  const [netWorthChartData, setNetWorthChartData] = useState<ChartData[]>([]);
  
  // Update chart data when net worth changes
  const updateChartData = useCallback((totalAssetValue: number, totalLiabilityValue: number, history: NetWorthHistory[]) => {
    // Asset breakdown chart
    const assetData: ChartData[] = [];
    const assetCategories: Record<string, number> = {
      cash: 0,
      investments: 0,
      property: 0,
      other: 0
    };
    
    assets.forEach(asset => {
      assetCategories[asset.category] += asset.value;
    });
    
    const categoryLabels: Record<string, string> = {
      cash: 'Cash & Equivalents',
      investments: 'Investments',
      property: 'Real Estate',
      other: 'Other Assets'
    };
    
    const categoryColors: Record<string, string> = {
      cash: 'primary',
      investments: 'emerald',
      property: 'amber',
      other: 'blue'
    };
    
    Object.entries(assetCategories).forEach(([category, value]) => {
      if (value > 0) {
        assetData.push({
          name: categoryLabels[category],
          value,
          color: categoryColors[category]
        });
      }
    });
    
    // Liability breakdown chart
    const liabilityData: ChartData[] = [];
    const liabilityCategories: Record<string, number> = {
      mortgage: 0,
      loan: 0,
      credit: 0,
      other: 0
    };
    
    liabilities.forEach(liability => {
      liabilityCategories[liability.category] += liability.value;
    });
    
    const liabilityCategoryLabels: Record<string, string> = {
      mortgage: 'Mortgage',
      loan: 'Loans',
      credit: 'Credit Cards',
      other: 'Other Debts'
    };
    
    const liabilityCategoryColors: Record<string, string> = {
      mortgage: 'rose',
      loan: 'orange',
      credit: 'red',
      other: 'purple'
    };
    
    Object.entries(liabilityCategories).forEach(([category, value]) => {
      if (value > 0) {
        liabilityData.push({
          name: liabilityCategoryLabels[category],
          value,
          color: liabilityCategoryColors[category]
        });
      }
    });
    
    // Net worth history chart - update to match the screenshot style
    const netWorthData: ChartData[] = history.map((record, index) => {
      // Use different colors for different time periods
      let color;
      if (index === history.length - 1) {
        color = 'primary'; // Current - blue
      } else {
        color = 'emerald'; // Past - green
      }
      
      return {
        name: record.date,
        value: record.netWorth,
        color: color
      };
    });
    
    setAssetChartData(assetData);
    setLiabilityChartData(liabilityData);
    setNetWorthChartData(netWorthData);
  }, [assets, liabilities]);
  
  // Calculate totals when assets or liabilities change
  useEffect(() => {
    const calculatedTotalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const calculatedTotalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
    const calculatedNetWorth = calculatedTotalAssets - calculatedTotalLiabilities;
    
    setTotalAssets(calculatedTotalAssets);
    setTotalLiabilities(calculatedTotalLiabilities);
    setNetWorth(calculatedNetWorth);

    setNetWorthHistory((previousHistory) => {
      const updatedHistory = [...previousHistory];
      updatedHistory[updatedHistory.length - 1] = {
        date: 'Now',
        assets: calculatedTotalAssets,
        liabilities: calculatedTotalLiabilities,
        netWorth: calculatedNetWorth
      };

      updateChartData(calculatedTotalAssets, calculatedTotalLiabilities, updatedHistory);
      return updatedHistory;
    });
  }, [assets, liabilities, updateChartData]);
  
  // Add new asset
  const addAsset = () => {
    if (newAssetName.trim() === '' || newAssetValue <= 0) return;
    
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      name: newAssetName,
      value: newAssetValue,
      category: newAssetCategory
    };
    
    setAssets([...assets, newAsset]);
    
    // Reset form
    setNewAssetName('');
    setNewAssetValue(0);
  };
  
  // Remove an asset
  const removeAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
    if (editingAssetId === id) {
      setEditingAssetId(null);
      setAssetDraft(null);
    }
  };

  const startEditingAsset = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setAssetDraft({ name: asset.name, value: asset.value, category: asset.category });
  };

  const cancelEditingAsset = () => {
    setEditingAssetId(null);
    setAssetDraft(null);
  };

  const saveAsset = () => {
    if (!editingAssetId || !assetDraft || assetDraft.name.trim() === '' || assetDraft.value <= 0) return;
    setAssets((current) => current.map((asset) => asset.id === editingAssetId
      ? { ...asset, ...assetDraft, name: assetDraft.name.trim() }
      : asset));
    cancelEditingAsset();
  };
  
  // Add new liability
  const addLiability = () => {
    if (newLiabilityName.trim() === '' || newLiabilityValue <= 0) return;
    
    const newLiability: Liability = {
      id: `liability-${Date.now()}`,
      name: newLiabilityName,
      value: newLiabilityValue,
      category: newLiabilityCategory
    };
    
    setLiabilities([...liabilities, newLiability]);
    
    // Reset form
    setNewLiabilityName('');
    setNewLiabilityValue(0);
  };
  
  // Remove a liability
  const removeLiability = (id: string) => {
    setLiabilities(liabilities.filter(liability => liability.id !== id));
    if (editingLiabilityId === id) {
      setEditingLiabilityId(null);
      setLiabilityDraft(null);
    }
  };

  const startEditingLiability = (liability: Liability) => {
    setEditingLiabilityId(liability.id);
    setLiabilityDraft({ name: liability.name, value: liability.value, category: liability.category });
  };

  const cancelEditingLiability = () => {
    setEditingLiabilityId(null);
    setLiabilityDraft(null);
  };

  const saveLiability = () => {
    if (!editingLiabilityId || !liabilityDraft || liabilityDraft.name.trim() === '' || liabilityDraft.value <= 0) return;
    setLiabilities((current) => current.map((liability) => liability.id === editingLiabilityId
      ? { ...liability, ...liabilityDraft, name: liabilityDraft.name.trim() }
      : liability));
    cancelEditingLiability();
  };
  
  // Get icon for asset category
  const getAssetIcon = (category: Asset['category']) => {
    switch (category) {
      case 'cash': return <DollarSign size={16} className="text-primary-500" />;
      case 'investments': return <Briefcase size={16} className="text-emerald-500" />;
      case 'property': return <Home size={16} className="text-amber-500" />;
      default: return <PlusCircle size={16} className="text-blue-500" />;
    }
  };
  
  // Get icon for liability category
  const getLiabilityIcon = (category: Liability['category']) => {
    switch (category) {
      case 'mortgage': return <Home size={16} className="text-rose-500" />;
      case 'loan': return <Car size={16} className="text-orange-500" />;
      case 'credit': return <CreditCard size={16} className="text-red-500" />;
      default: return <MinusCircle size={16} className="text-purple-500" />;
    }
  };

  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const assetCategoryLabels: Record<Asset['category'], string> = {
    cash: 'cash and equivalents',
    investments: 'investments',
    property: 'real estate',
    other: 'other assets',
  };
  const assetCategoryTotals = assets.reduce<Record<Asset['category'], number>>((totals, asset) => {
    totals[asset.category] += asset.value;
    return totals;
  }, {
    cash: 0,
    investments: 0,
    property: 0,
    other: 0,
  });
  const largestAssetCategory = Object.entries(assetCategoryTotals).sort((a, b) => b[1] - a[1])[0];
  const creditCardDebt = liabilities
    .filter((liability) => liability.category === 'credit')
    .reduce((sum, liability) => sum + liability.value, 0);
  const cashAssets = assets
    .filter((asset) => asset.category === 'cash')
    .reduce((sum, asset) => sum + asset.value, 0);
  const netWorthSummary = `Your current net worth is ${formatCurrencyINR(netWorth)} against total assets of ${formatCurrencyINR(totalAssets)} and total liabilities of ${formatCurrencyINR(totalLiabilities)}.`;
  const netWorthInsights = [
    {
      title: 'Leverage check',
      detail: totalAssets > 0
        ? `Liabilities are ${debtRatio.toFixed(1)}% of assets. Lower ratios usually mean more flexibility and less repayment pressure.`
        : 'Add asset values first so the tracker can benchmark leverage and financial resilience.',
      tone: debtRatio <= 35 ? 'positive' as const : debtRatio <= 60 ? 'neutral' as const : 'caution' as const,
    },
    {
      title: 'Largest driver',
      detail: largestAssetCategory && largestAssetCategory[1] > 0
        ? `${formatCurrencyINR(largestAssetCategory[1])} sits in ${assetCategoryLabels[largestAssetCategory[0] as Asset['category']]}, making it the biggest driver of your current net worth.`
        : 'No asset category is populated yet, so there is not enough data to identify the main driver.',
      tone: 'neutral' as const,
    },
    {
      title: 'Priority move',
      detail: creditCardDebt > 0
        ? `High-interest credit debt of ${formatCurrencyINR(creditCardDebt)} is usually the fastest place to improve net worth.`
        : cashAssets < totalLiabilities * 0.1
          ? `Liquid cash of ${formatCurrencyINR(cashAssets)} looks light relative to liabilities. Building a stronger cash buffer can improve resilience.`
          : 'Update this tracker every month or quarter so you can spot whether assets are rising faster than liabilities.',
      tone: 'action' as const,
    },
  ];
  const netWorthNextSteps = [
    { label: 'Review EMI burden', to: '/calculators/emi' },
    { label: 'Check emergency fund', to: '/calculators/emergency-fund' },
  ];
  
  return (
    <CalculatorLayout
      title="Net Worth Tracker"
      description="Track your assets, liabilities, and overall financial health with this comprehensive net worth calculator."
      icon={<LineChart size={24} />}
    >
      {/* Net Worth Summary Card - Top section */}
      <div className={`p-6 rounded-xl mb-8 bg-gradient-to-br ${
        isDark 
          ? 'from-gray-800 to-gray-900 border-gray-700' 
          : 'from-blue-50 to-blue-100/50 border-blue-100'
      } border shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Main Net Worth Value */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start">
            <h2 className="text-lg font-medium text-gray-400 dark:text-gray-300">Net Worth</h2>
            <div className="text-4xl md:text-5xl font-bold mt-2">
              <span className={netWorth >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}>
                ₹{netWorth.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center">
                <PlusCircle size={18} className="text-emerald-500 mr-2" />
                <span className="text-sm font-medium">Assets</span>
              </div>
              <p className="text-xl font-semibold mt-2 text-emerald-500 dark:text-emerald-400">
                ₹{totalAssets.toLocaleString('en-IN')}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center">
                <MinusCircle size={18} className="text-rose-500 mr-2" />
                <span className="text-sm font-medium">Liabilities</span>
              </div>
              <p className="text-xl font-semibold mt-2 text-rose-500 dark:text-rose-400">
                ₹{totalLiabilities.toLocaleString('en-IN')}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center">
                <LineChart size={18} className="text-primary-500 mr-2" />
                <span className="text-sm font-medium">Debt Ratio</span>
              </div>
              <p className="text-xl font-semibold mt-2">
                {totalAssets > 0 
                  ? `${debtRatio.toFixed(0)}%` 
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ActionableInsights
        title="What This Net Worth Says"
        summary={netWorthSummary}
        insights={netWorthInsights}
        nextSteps={netWorthNextSteps}
      />
      
      {/* Asset and Liability Management - First content section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Assets Section */}
        <div className="col-span-1 lg:col-span-6">
          <div className={`overflow-hidden rounded-[1.35rem] border ${
            isDark ? 'border-white/10 bg-slate-900/75' : 'border-slate-200 bg-white'
          } shadow-sm`}>
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-4 dark:border-white/10 sm:px-5">
              <h3 className="flex items-center font-semibold">
                <PlusCircle size={16} className="text-emerald-500 mr-2" />
                Assets
              </h3>
              <div className="text-sm font-bold tabular-nums text-emerald-500 dark:text-emerald-400">
                ₹{totalAssets.toLocaleString('en-IN')}
              </div>
            </div>
            
            {/* Add new asset form */}
            <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.035] sm:p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Add an asset</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(8rem,.7fr)_auto] md:items-start">
                <label className="min-w-0">
                  <span className="sr-only">New asset name</span>
                  <Input
                    type="text"
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    placeholder="Asset name"
                    className="w-full"
                  />
                </label>
                
                <label className="min-w-0">
                  <span className="sr-only">New asset value</span>
                  <Input
                    type="number"
                    amountInWords
                    value={newAssetValue}
                    onChange={(e) => setNewAssetValue(Number(e.target.value))}
                    placeholder="Value"
                    min={0}
                    className="w-full hide-number-arrows"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                  />
                </label>
                
                <label className="min-w-0">
                  <span className="sr-only">New asset category</span>
                  <Select
                    value={newAssetCategory}
                    onChange={(e) => setNewAssetCategory(e.target.value as Asset['category'])}
                  >
                    <option value="cash">Cash</option>
                    <option value="investments">Investments</option>
                    <option value="property">Property</option>
                    <option value="other">Other</option>
                  </Select>
                </label>
                
                <div>
                  <Button 
                    onClick={addAsset} 
                    className={`w-full px-5 md:w-auto ${newAssetName.trim() === '' || newAssetValue <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    id={assetButtonId}
                    disabled={newAssetName.trim() === '' || newAssetValue <= 0}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Asset list */}
            <div className="max-h-[28rem] overflow-y-auto p-0">
              {assets.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <PlusCircle size={24} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p>No assets added yet</p>
                  <p className="text-sm mt-1">Add your first asset using the form above</p>
                </div>
              ) : (
                assets.map(asset => editingAssetId === asset.id && assetDraft ? (
                  <div key={asset.id} className="border-b border-gray-100 bg-cyan-50/60 p-4 dark:border-white/10 dark:bg-cyan-400/5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">Asset name</span>
                        <Input aria-label="Asset name" type="text" value={assetDraft.name} onChange={(e) => setAssetDraft({ ...assetDraft, name: e.target.value })} />
                      </label>
                      <label>
                        <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">Current value</span>
                        <Input aria-label="Current value" type="number" prefix="₹" amountInWords value={assetDraft.value} min="1" onChange={(e) => setAssetDraft({ ...assetDraft, value: Number(e.target.value) })} />
                      </label>
                    </div>
                    <label className="mt-3 block">
                      <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">Category</span>
                      <Select value={assetDraft.category} onChange={(e) => setAssetDraft({ ...assetDraft, category: e.target.value as Asset['category'] })}>
                        <option value="cash">Cash</option><option value="investments">Investments</option><option value="property">Property</option><option value="other">Other</option>
                      </Select>
                    </label>
                    <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <button type="button" onClick={cancelEditingAsset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-600 dark:border-white/15 dark:text-slate-300"><X size={16} /> Cancel</button>
                      <button type="button" onClick={saveAsset} disabled={assetDraft.name.trim() === '' || assetDraft.value <= 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-white disabled:opacity-50"><Check size={16} /> Save changes</button>
                    </div>
                  </div>
                ) : (
                  <div key={asset.id} className={`flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between ${isDark ? 'border-white/10 hover:bg-white/[0.025]' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <div className="flex min-w-0 items-center">
                      <div className="mr-3 shrink-0 rounded-full bg-gray-100 p-2.5 dark:bg-gray-700">{getAssetIcon(asset.category)}</div>
                      <div className="min-w-0"><p className="truncate font-semibold">{asset.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{asset.category === 'cash' ? 'Cash & Equivalents' : asset.category === 'investments' ? 'Investments' : asset.category === 'property' ? 'Real Estate' : 'Other Assets'}</p></div>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <p className="mr-1 font-bold tabular-nums text-emerald-600 dark:text-emerald-400">₹{asset.value.toLocaleString('en-IN')}</p>
                      <button type="button" onClick={() => startEditingAsset(asset)} aria-label={`Edit ${asset.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-cyan-100 hover:text-cyan-700 dark:text-slate-400 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-200"><Pencil size={16} /></button>
                      <button type="button" onClick={() => removeAsset(asset.id)} aria-label={`Delete ${asset.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-rose-100 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Liabilities Section */}
        <div className="col-span-1 lg:col-span-6">
          <div className={`overflow-hidden rounded-[1.35rem] border ${
            isDark ? 'border-white/10 bg-slate-900/75' : 'border-slate-200 bg-white'
          } shadow-sm`}>
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-4 dark:border-white/10 sm:px-5">
              <h3 className="flex items-center font-semibold">
                <MinusCircle size={16} className="text-rose-500 mr-2" />
                Liabilities
              </h3>
              <div className="text-sm font-bold tabular-nums text-rose-500 dark:text-rose-400">
                ₹{totalLiabilities.toLocaleString('en-IN')}
              </div>
            </div>
            
            {/* Add new liability form */}
            <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.035] sm:p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Add a liability</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(8rem,.7fr)_auto] md:items-start">
                <label className="min-w-0">
                  <span className="sr-only">New liability name</span>
                  <Input
                    type="text"
                    value={newLiabilityName}
                    onChange={(e) => setNewLiabilityName(e.target.value)}
                    placeholder="Liability name"
                    className="w-full"
                  />
                </label>
                
                <label className="min-w-0">
                  <span className="sr-only">New liability value</span>
                  <Input
                    type="number"
                    amountInWords
                    value={newLiabilityValue}
                    onChange={(e) => setNewLiabilityValue(Number(e.target.value))}
                    placeholder="Value"
                    min={0}
                    className="w-full hide-number-arrows"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                  />
                </label>
                
                <label className="min-w-0">
                  <span className="sr-only">New liability category</span>
                  <Select
                    value={newLiabilityCategory}
                    onChange={(e) => setNewLiabilityCategory(e.target.value as Liability['category'])}
                  >
                    <option value="mortgage">Mortgage</option>
                    <option value="loan">Loans</option>
                    <option value="credit">Credit Cards</option>
                    <option value="other">Other</option>
                  </Select>
                </label>
                
                <div>
                  <Button 
                    onClick={addLiability} 
                    className={`w-full px-5 md:w-auto ${newLiabilityName.trim() === '' || newLiabilityValue <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    id="liability-add-button"
                    disabled={newLiabilityName.trim() === '' || newLiabilityValue <= 0}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Liability list */}
            <div className="max-h-[28rem] overflow-y-auto p-0">
              {liabilities.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <MinusCircle size={24} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p>No liabilities added yet</p>
                  <p className="text-sm mt-1">Add your first liability using the form above</p>
                </div>
              ) : (
                liabilities.map(liability => editingLiabilityId === liability.id && liabilityDraft ? (
                  <div key={liability.id} className="border-b border-gray-100 bg-cyan-50/60 p-4 dark:border-white/10 dark:bg-cyan-400/5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">Liability name</span>
                        <Input aria-label="Liability name" type="text" value={liabilityDraft.name} onChange={(e) => setLiabilityDraft({ ...liabilityDraft, name: e.target.value })} />
                      </label>
                      <label>
                        <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">Outstanding value</span>
                        <Input aria-label="Outstanding value" type="number" prefix="₹" amountInWords value={liabilityDraft.value} min="1" onChange={(e) => setLiabilityDraft({ ...liabilityDraft, value: Number(e.target.value) })} />
                      </label>
                    </div>
                    <label className="mt-3 block">
                      <span className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">Category</span>
                      <Select value={liabilityDraft.category} onChange={(e) => setLiabilityDraft({ ...liabilityDraft, category: e.target.value as Liability['category'] })}>
                        <option value="mortgage">Mortgage</option><option value="loan">Loans</option><option value="credit">Credit Cards</option><option value="other">Other</option>
                      </Select>
                    </label>
                    <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <button type="button" onClick={cancelEditingLiability} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-600 dark:border-white/15 dark:text-slate-300"><X size={16} /> Cancel</button>
                      <button type="button" onClick={saveLiability} disabled={liabilityDraft.name.trim() === '' || liabilityDraft.value <= 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-white disabled:opacity-50"><Check size={16} /> Save changes</button>
                    </div>
                  </div>
                ) : (
                  <div key={liability.id} className={`flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between ${isDark ? 'border-white/10 hover:bg-white/[0.025]' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <div className="flex min-w-0 items-center">
                      <div className="mr-3 shrink-0 rounded-full bg-gray-100 p-2.5 dark:bg-gray-700">{getLiabilityIcon(liability.category)}</div>
                      <div className="min-w-0"><p className="truncate font-semibold">{liability.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{liability.category === 'mortgage' ? 'Mortgage' : liability.category === 'loan' ? 'Loans' : liability.category === 'credit' ? 'Credit Cards' : 'Other Debts'}</p></div>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <p className="mr-1 font-bold tabular-nums text-rose-600 dark:text-rose-400">₹{liability.value.toLocaleString('en-IN')}</p>
                      <button type="button" onClick={() => startEditingLiability(liability)} aria-label={`Edit ${liability.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-cyan-100 hover:text-cyan-700 dark:text-slate-400 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-200"><Pencil size={16} /></button>
                      <button type="button" onClick={() => removeLiability(liability.id)} aria-label={`Delete ${liability.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-rose-100 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart Section - All graphs below the input forms */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Financial Overview</h2>
        
        {/* Net Worth History Chart */}
        {netWorthHistory.length > 0 && (
          <div className="mb-8">
            <div className={`rounded-xl border ${
              isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            } shadow-sm overflow-hidden`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-medium flex items-center">
                  <LineChart size={16} className="text-primary-500 mr-2" />
                  Net Worth Trend
                </h3>
                
                {/* Growth indicators */}
                {netWorthHistory.length >= 2 && (
                  <div className="flex items-center text-sm">
                    <span className="mr-3 text-gray-500 dark:text-gray-400">Growth:</span>
                    {(() => {
                      // Calculate growth between last two periods
                      const current = netWorthHistory[netWorthHistory.length - 1].netWorth;
                      const previous = netWorthHistory[netWorthHistory.length - 2].netWorth;
                      const growthPercent = previous > 0 
                        ? ((current - previous) / previous) * 100 
                        : 0;
                      
                      return (
                        <div className={`flex items-center font-medium ${
                          growthPercent >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                        }`}>
                          {growthPercent >= 0 
                            ? <PlusCircle size={12} className="mr-1" /> 
                            : <MinusCircle size={12} className="mr-1" />
                          }
                          {Math.abs(growthPercent).toFixed(1)}%
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="h-80">
                  <FinancialChart 
                    data={netWorthChartData}
                    title=""
                    type="bar"
                    noWrapper={true}
                    height={300}
                  />
                </div>
              </div>
              
              {/* Detailed growth metrics */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-3">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
                    <span className="text-sm">Current: <span className="font-medium">₹{netWorthHistory[netWorthHistory.length - 1].netWorth.toLocaleString('en-IN')}</span></span>
                  </div>
                  
                  {netWorthHistory.length >= 2 && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                      <span className="text-sm">Previous: <span className="font-medium">₹{netWorthHistory[netWorthHistory.length - 2].netWorth.toLocaleString('en-IN')}</span></span>
                    </div>
                  )}
                  
                  {netWorthHistory.length >= 2 && (
                    <div className="text-sm mt-2 sm:mt-0 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                      <span className="font-medium">
                        {(() => {
                          const current = netWorthHistory[netWorthHistory.length - 1].netWorth;
                          const previous = netWorthHistory[netWorthHistory.length - 2].netWorth;
                          const change = current - previous;
                          return (
                            <span className={change >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>
                              {change >= 0 ? '+' : ''}₹{Math.abs(change).toLocaleString('en-IN')}
                            </span>
                          );
                        })()}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">since last period</span>
                    </div>
                  )}
                </div>
                
                {/* Asset vs Liability comparison */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-gray-400 mb-1">Assets to Liabilities Ratio</span>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                        <div 
                          className="bg-primary-500 h-2.5 rounded-full" 
                          style={{ 
                            width: `${totalAssets > 0 
                              ? Math.min(100, (totalAssets / (totalAssets + totalLiabilities)) * 100) 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Assets: {totalAssets > 0 
                          ? `${Math.round((totalAssets / (totalAssets + totalLiabilities)) * 100)}%`
                          : '0%'}
                        </span>
                        <span>Liabilities: {totalLiabilities > 0 
                          ? `${Math.round((totalLiabilities / (totalAssets + totalLiabilities)) * 100)}%`
                          : '0%'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Debt-to-Asset Ratio</span>
                        <p className={`font-medium ${
                          totalAssets > 0 && (totalLiabilities / totalAssets) < 0.5 
                            ? 'text-emerald-500 dark:text-emerald-400' 
                            : totalAssets > 0 && (totalLiabilities / totalAssets) < 0.7
                              ? 'text-amber-500 dark:text-amber-400'
                              : 'text-rose-500 dark:text-rose-400'
                        }`}>
                          {totalAssets > 0 
                            ? `${((totalLiabilities / totalAssets) * 100).toFixed(1)}%` 
                            : 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Current Status</span>
                        <p className="font-medium">
                          {totalAssets > 0 && (totalLiabilities / totalAssets) < 0.5 
                            ? 'Excellent' 
                            : totalAssets > 0 && (totalLiabilities / totalAssets) < 0.7
                              ? 'Good'
                              : totalAssets > 0 && (totalLiabilities / totalAssets) < 1
                                ? 'Caution'
                                : 'Review Needed'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Composition Charts - Side by side */}
        {(assetChartData.length > 0 || liabilityChartData.length > 0) && (
          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
            {/* Asset Breakdown Chart */}
            {assetChartData.length > 0 && (
              <div>
                <div className={`h-full overflow-hidden rounded-[1.35rem] border ${
                  isDark ? 'border-white/10 bg-slate-900/75' : 'border-gray-200 bg-white'
                } shadow-sm`}>
                  <div className="flex min-h-[4.5rem] items-center justify-between gap-3 border-b border-gray-200 p-4 dark:border-white/10 sm:px-5">
                    <h3 className="flex min-w-0 items-center font-semibold">
                      <PlusCircle size={16} className="text-emerald-500 mr-2" />
                      Asset Composition
                    </h3>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-emerald-500 dark:text-emerald-400">
                      ₹{totalAssets.toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  <div className="flex min-h-[17rem] items-center justify-center px-3 py-4 sm:min-h-[22rem] sm:p-5">
                    <div className="w-full max-w-[32rem]" role="img" aria-label="Asset composition chart">
                      <FinancialChart 
                        data={assetChartData}
                        title=""
                        type="pie"
                        noWrapper={true}
                        height={310}
                        showLegend={false}
                        pieOuterRadius={118}
                        pieInnerRadius={76}
                        pieCenterLabel="Total assets"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/30 py-3 px-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col">
                      {assetChartData.map((item, index) => (
                        <div key={`asset-legend-${index}`} className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0 dark:border-gray-600">
                          <div className="flex min-w-0 items-center">
                            <div className="mr-2 h-3 w-3 shrink-0 rounded-full" 
                              style={{ 
                                backgroundColor: item.color && colorMapping[item.color] 
                                ? colorMapping[item.color] 
                                : defaultColors[index % defaultColors.length] 
                              }}></div>
                            <span className="truncate text-sm">{item.name}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                              ₹{item.value.toLocaleString('en-IN')}
                            </span>
                            <span className="font-medium text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
                              {totalAssets > 0 ? `${Math.round((item.value / totalAssets) * 100)}%` : '0%'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Asset allocation advice based on portfolio */}
                    {assetChartData.length > 0 && (
                      <div className="mt-3 pt-2 text-xs border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-start">
                          <div className="p-1 rounded-full bg-blue-50 dark:bg-blue-900/20 mr-2 mt-0.5">
                            <LineChart size={10} className="text-primary-500" />
                          </div>
                          <span className="text-gray-600 dark:text-gray-300">
                            {(() => {
                              // Simple asset allocation advice based on the breakdown
                              const cashPercentage = assetChartData.find(item => item.name === 'Cash & Equivalents')?.value || 0;
                              const cashRatio = totalAssets > 0 ? cashPercentage / totalAssets : 0;
                              const propertyPercentage = assetChartData.find(item => item.name === 'Real Estate')?.value || 0;
                              const propertyRatio = totalAssets > 0 ? propertyPercentage / totalAssets : 0;
                              
                              if (cashRatio > 0.5) {
                                return 'Consider investing some of your cash for potential growth';
                              } else if (propertyRatio > 0.8) {
                                return 'Your portfolio is heavily concentrated in real estate';
                              } else if (assetChartData.length === 1) {
                                return 'Consider diversifying your asset types for better risk management';
                              } else {
                                return 'Your asset allocation appears balanced';
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Liability Breakdown Chart */}
            {liabilityChartData.length > 0 && (
              <div>
                <div className={`h-full overflow-hidden rounded-[1.35rem] border ${
                  isDark ? 'border-white/10 bg-slate-900/75' : 'border-gray-200 bg-white'
                } shadow-sm`}>
                  <div className="flex min-h-[4.5rem] items-center justify-between gap-3 border-b border-gray-200 p-4 dark:border-white/10 sm:px-5">
                    <h3 className="flex min-w-0 items-center font-semibold">
                      <MinusCircle size={16} className="text-rose-500 mr-2" />
                      Liability Composition
                    </h3>
                    <span className="shrink-0 whitespace-nowrap text-sm font-bold tabular-nums text-rose-500 dark:text-rose-400">
                      ₹{totalLiabilities.toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  <div className="flex min-h-[17rem] items-center justify-center px-3 py-4 sm:min-h-[22rem] sm:p-5">
                    <div className="w-full max-w-[32rem]" role="img" aria-label="Liability composition chart">
                      <FinancialChart 
                        data={liabilityChartData}
                        title=""
                        type="pie"
                        noWrapper={true}
                        height={310}
                        showLegend={false}
                        pieOuterRadius={118}
                        pieInnerRadius={76}
                        pieCenterLabel="Total debt"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/30 py-3 px-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col">
                      {liabilityChartData.map((item, index) => (
                        <div key={`liability-legend-${index}`} className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0 dark:border-gray-600">
                          <div className="flex min-w-0 items-center">
                            <div className="w-3 h-3 shrink-0 rounded-full mr-2"
                              style={{
                                backgroundColor: item.color && colorMapping[item.color]
                                ? colorMapping[item.color]
                                : defaultColors[index % defaultColors.length]
                              }}></div>
                            <span className="text-sm truncate">{item.name}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                              ₹{item.value.toLocaleString('en-IN')}
                            </span>
                            <span className="font-medium text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
                              {totalLiabilities > 0 ? `${Math.round((item.value / totalLiabilities) * 100)}%` : '0%'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Add a detailed Financial Health Report section */}
        <div className="mt-8">
          <div className={`rounded-xl border ${
            isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          } shadow-sm overflow-hidden`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium flex items-center">
                <BarChart2 size={16} className="text-primary-500 mr-2" />
                Financial Health Assessment
              </h3>
            </div>
            
            <div className="p-5">
              {/* Key Financial Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Worth</p>
                  <p className={`text-lg font-semibold ${netWorth >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    ₹{netWorth.toLocaleString('en-IN')}
                  </p>
                  <div className="mt-2 flex items-center text-xs">
                    <div className={`h-1 w-full rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div className={`h-full ${netWorth > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{
                        width: `${Math.min(100, Math.max(0, (netWorth / (totalAssets || 1)) * 100))}%`
                      }}></div>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Debt to Asset Ratio</p>
                  <p className={`text-lg font-semibold ${
                    totalAssets > 0 && (totalLiabilities / totalAssets) < 0.5 
                      ? 'text-emerald-500 dark:text-emerald-400' 
                      : totalAssets > 0 && (totalLiabilities / totalAssets) < 0.7
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-rose-500 dark:text-rose-400'
                  }`}>
                    {totalAssets > 0 
                      ? `${((totalLiabilities / totalAssets) * 100).toFixed(1)}%` 
                      : 'N/A'}
                  </p>
                  {totalAssets > 0 && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {(totalLiabilities / totalAssets) < 0.3 
                        ? 'Excellent - Very low debt' 
                        : (totalLiabilities / totalAssets) < 0.5
                          ? 'Good - Healthy balance'
                          : (totalLiabilities / totalAssets) < 0.7
                            ? 'Average - Monitor debt levels'
                            : 'High - Consider debt reduction'}
                    </p>
                  )}
                </div>
                
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Worth Growth</p>
                  {netWorthHistory.length >= 2 ? (
                    <>
                      {(() => {
                        const current = netWorthHistory[netWorthHistory.length - 1].netWorth;
                        const previous = netWorthHistory[netWorthHistory.length - 2].netWorth;
                        const growthPercent = previous > 0 
                          ? ((current - previous) / previous) * 100 
                          : 0;
                          
                        return (
                          <p className={`text-lg font-semibold ${
                            growthPercent >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                          }`}>
                            {growthPercent >= 0 ? '+' : ''}{growthPercent.toFixed(1)}%
                          </p>
                        );
                      })()}
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Since last tracking period
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Not enough data</p>
                  )}
                </div>
                
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Asset Diversity</p>
                  <p className="text-lg font-semibold">
                    {(() => {
                      // Simple asset diversity score based on number of asset types and their distribution
                      const diversity = assetChartData.length;
                      let score;
                      
                      if (diversity === 0) return 'No assets';
                      if (diversity === 1) {
                        score = 'Low';
                      } else if (diversity === 2) {
                        score = 'Moderate';
                      } else {
                        score = 'Good';
                      }
                      
                      return score;
                    })()}
                  </p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {assetChartData.length} asset categories
                  </p>
                </div>
              </div>
              
              {/* Recommendations */}
              <div className={`mt-4 p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700/20' : 'border-blue-100 bg-blue-50'}`}>
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <LineChart size={14} className="text-primary-500 mr-2" />
                  Financial Insights
                </h4>
                
                <ul className="space-y-2 text-sm">
                  {/* Dynamic recommendations based on financial situation */}
                  {netWorth < 0 && (
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <MinusCircle size={12} className="text-rose-500" />
                      </div>
                      <span>Your net worth is negative. Focus on reducing high-interest debt and increasing income sources.</span>
                    </li>
                  )}
                  
                  {totalAssets > 0 && (liabilityChartData.find(item => item.name === 'Credit Cards')?.value || 0) > 0 && (
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <MinusCircle size={12} className="text-amber-500" />
                      </div>
                      <span>Credit card debt tends to have high interest rates. Consider prioritizing its repayment.</span>
                    </li>
                  )}
                  
                  {assetChartData.length === 1 && totalAssets > 0 && (
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <PlusCircle size={12} className="text-blue-500" />
                      </div>
                      <span>Your assets are concentrated in a single category. Consider diversifying to reduce risk.</span>
                    </li>
                  )}
                  
                  {(assetChartData.find(item => item.name === 'Cash & Equivalents')?.value || 0) > totalAssets * 0.5 && (
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <PlusCircle size={12} className="text-blue-500" />
                      </div>
                      <span>You have a high percentage of assets in cash. Consider investing some for potential growth.</span>
                    </li>
                  )}
                  
                  {totalAssets > 0 && totalLiabilities > 0 && (totalLiabilities / totalAssets) < 0.3 && (
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <PlusCircle size={12} className="text-emerald-500" />
                      </div>
                      <span>Your debt-to-asset ratio is healthy. This indicates good financial stability.</span>
                    </li>
                  )}
                  
                  {/* Fallback recommendation if none of the above apply */}
                  {!(netWorth < 0 || 
                     (totalAssets > 0 && (liabilityChartData.find(item => item.name === 'Credit Cards')?.value || 0) > 0) ||
                     (assetChartData.length === 1 && totalAssets > 0) ||
                     ((assetChartData.find(item => item.name === 'Cash & Equivalents')?.value || 0) > totalAssets * 0.5) ||
                     (totalAssets > 0 && totalLiabilities > 0 && (totalLiabilities / totalAssets) < 0.3)) && (
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <PlusCircle size={12} className="text-blue-500" />
                      </div>
                      <span>Regular tracking of your net worth helps identify trends and progress toward financial goals.</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Information Section */}
      <div className="mt-12 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">About Net Worth Tracking</h2>
        
        <div className="space-y-5">
          <p>
            <strong>Net Worth</strong> is one of the most comprehensive metrics of your financial health. It is calculated by subtracting your total liabilities (what you owe) from your total assets (what you own).
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-2">Why Track Your Net Worth:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provides a holistic view of your financial situation</li>
                <li>Helps measure progress toward financial goals</li>
                <li>Identifies areas where you can improve your financial health</li>
                <li>Gives context to your income and spending decisions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Tips for Healthy Net Worth Growth:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Pay down high-interest debt</strong> - This reduces your liabilities faster</li>
                <li><strong>Invest regularly</strong> - Build assets that appreciate over time</li>
                <li><strong>Minimize depreciation exposure</strong> - Be cautious with assets that lose value</li>
                <li><strong>Track regularly</strong> - Update your net worth calculation quarterly</li>
                <li><strong>Focus on the trend</strong> - Monthly fluctuations are normal, look at long-term patterns</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Key Financial Ratios:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Debt-to-Asset Ratio</strong> - Aim for below 50% for good financial health</li>
                <li><strong>Liquidity Ratio</strong> - Keep enough liquid assets to cover 3-6 months of expenses</li>
                <li><strong>Savings Rate</strong> - Try to save and invest at least 20% of your income</li>
                <li><strong>Investment Allocation</strong> - Diversify your assets across different categories</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Privacy Note:</strong> This calculator stores all your data locally in your browser. No financial information is transmitted over the internet or saved on external servers.
            </p>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
};

export default NetWorthTracker; 
