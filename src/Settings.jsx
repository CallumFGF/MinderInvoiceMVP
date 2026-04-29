import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Settings({ session }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    provider_name: '',
    standard_hourly_rate: 0,
    charge_bank_holidays: false,
    bank_name: '',
    account_name: '',
    account_number: '',
    sort_code: ''
  })

  // Fetch settings when the page loads
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('provider_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (data) setSettings(data)
    setLoading(false)
  }

  // Save settings back to the database
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    const { error } = await supabase
      .from('provider_settings')
      .upsert({ 
        user_id: session.user.id,
        ...settings
      })

    if (error) {
      alert('Error saving settings: ' + error.message)
    } else {
      alert('Settings saved successfully!')
    }
    
    setSaving(false)
  }

  if (loading) {
    return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Provider Settings</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile & Rates Card */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <h3 className="card-title text-xl mb-2">Profile & Rates</h3>
            <fieldset className="fieldset">
              <label className="fieldset-label">Business / Provider Name</label>
              <input 
                type="text" 
                className="input w-full" 
                placeholder="e.g., Happy Days Childcare"
                value={settings.provider_name || ''} 
                onChange={e => setSettings({...settings, provider_name: e.target.value})} 
              />
              
              <label className="fieldset-label mt-4">Standard Hourly Rate (£)</label>
              <input 
                type="number" 
                step="0.01" 
                className="input w-full" 
                value={settings.standard_hourly_rate || 0} 
                onChange={e => setSettings({...settings, standard_hourly_rate: parseFloat(e.target.value)})} 
              />
            </fieldset>

            <div className="form-control mt-6 p-4 bg-base-200 rounded-box">
              <label className="label cursor-pointer flex justify-start gap-4">
                <input 
                  type="checkbox" 
                  className="toggle toggle-primary" 
                  checked={settings.charge_bank_holidays || false} 
                  onChange={e => setSettings({...settings, charge_bank_holidays: e.target.checked})} 
                />
                <span className="label-text font-medium text-lg">Charge for Bank Holidays?</span>
              </label>
            </div>
          </div>
        </div>

        {/* Bank Details Card */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <h3 className="card-title text-xl mb-2">Bank Details (For Invoices)</h3>
            <fieldset className="fieldset grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="fieldset-label">Bank Name</label>
                <input type="text" className="input w-full" value={settings.bank_name || ''} onChange={e => setSettings({...settings, bank_name: e.target.value})} />
              </div>
              <div>
                <label className="fieldset-label">Account Name</label>
                <input type="text" className="input w-full" value={settings.account_name || ''} onChange={e => setSettings({...settings, account_name: e.target.value})} />
              </div>
              <div>
                <label className="fieldset-label">Account Number</label>
                <input type="text" className="input w-full" value={settings.account_number || ''} onChange={e => setSettings({...settings, account_number: e.target.value})} />
              </div>
              <div>
                <label className="fieldset-label">Sort Code</label>
                <input type="text" className="input w-full" value={settings.sort_code || ''} onChange={e => setSettings({...settings, sort_code: e.target.value})} />
              </div>
            </fieldset>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full text-lg" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}