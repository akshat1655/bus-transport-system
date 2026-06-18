import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [success, setSuccess] = useState(false);
  
  // Settings Form State
  const [enterpriseName, setEnterpriseName] = useState('Rajni Bus Service');
  const [supportEmail, setSupportEmail] = useState('akshatjain1655@gmail.com');
  const [enableDynamicPricing, setEnableDynamicPricing] = useState(true);
  const [pricingMultiplierHalf, setPricingMultiplierHalf] = useState(1.2);
  const [pricingMultiplierFull, setPricingMultiplierFull] = useState(1.4);
  const [otpProvider, setOtpProvider] = useState('MOCK_CONSOLE');
  const [smsGatewayKey, setSmsGatewayKey] = useState('********-****-****-****-************');

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="p-8 space-y-8 select-none max-w-4xl">
      
      {/* 1. Header Banner */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-brand-500" />
          <span>System Settings</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure global operational limits, SMS OTP gateways, and pricing calculations.</p>
      </div>

      {success && (
        <div className="p-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Enterprise system rules updated successfully! Changes applied immediately.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-dark-border">
            <Shield className="w-5 h-5 text-brand-500" />
            <span>Enterprise Profile</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                required
                value={enterpriseName}
                onChange={e => setEnterpriseName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Ops Support Email</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Pricing Engine Rules */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-dark-border">
            <Database className="w-5 h-5 text-brand-500" />
            <span>Pricing Engine Ratios</span>
          </h2>

          <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-dark-border/40">
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">Automated Occupancy Surge Pricing</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Scale ticket prices dynamically based on live trip occupancy rates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableDynamicPricing}
                onChange={e => setEnableDynamicPricing(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-850 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          {enableDynamicPricing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy &gt; 50% Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  value={pricingMultiplierHalf}
                  onChange={e => setPricingMultiplierHalf(parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy &gt; 80% Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  value={pricingMultiplierFull}
                  onChange={e => setPricingMultiplierFull(parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* SMS Gateways / Verification Providers */}
        <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-dark-border">
            <Bell className="w-5 h-5 text-brand-500" />
            <span>OTP SMS Verification Gateway</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Gateway Provider</label>
              <select
                value={otpProvider}
                onChange={e => setOtpProvider(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
              >
                <option value="MOCK_CONSOLE">Mock Service (Writes OTP to console logs)</option>
                <option value="TWILIO">Twilio SMS gateway</option>
                <option value="FIREBASE_AUTH">Firebase Auth Provider</option>
              </select>
            </div>
            <div className="space-y-1.5 font-mono">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Gateway API Key</label>
              <input
                type="password"
                value={smsGatewayKey}
                onChange={e => setSmsGatewayKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-md transition-colors text-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings Changes</span>
          </button>
        </div>

      </form>
    </div>
  );
}
