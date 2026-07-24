'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Instagram, RefreshCw, Trash2, AlertCircle, CheckCircle, Info, ExternalLink } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface InstagramMedia {
  id: number
  instagram_id: string
  caption: string | null
  media_type: string | null
  media_url: string | null
  thumbnail_url: string | null
  permalink: string | null
  timestamp: string | null
  status: string
  is_featured: number
}

export default function AdminInstagramMedia() {
  const [items, setItems] = useState<InstagramMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const res = await apiRequest('/instagram-media', {})
      const data = await res.json()
      if (data.success) setItems(data.data || [])
    } catch { }
    finally { setLoading(false) }
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await apiRequest('/instagram-media/sync', {
        method: 'POST',})
      const data = await res.json()
      setSyncMsg({
        type: data.success ? 'success' : 'info',
        text: data.message || (data.success ? 'Sync completed.' : 'Sync not available.')
      })
      if (data.success) fetchItems()
    } catch {
      setSyncMsg({ type: 'error', text: 'Network error during sync.' })
    }
    finally { setSyncing(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this local Instagram media record?')) return
    try {
      await apiRequest(`/instagram-media/${id}`, {
        method: 'DELETE',})
      fetchItems()
    } catch { }
  }

  const handleStatusToggle = async (id: number, current: string) => {
    try {
      const newStatus = current === 'active' ? 'inactive' : 'active'
      await apiRequest(`/instagram-media/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })
      fetchItems()
    } catch { }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instagram Media Sync</h1>
          <p className="text-gray-500 text-sm mt-1">Automatic Instagram Graph API feed — future feature</p>
        </div>
        <button onClick={handleSync} disabled={syncing}
          className="flex items-center gap-2 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 text-sm">
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Sync message */}
      {syncMsg && (
        <div className={`mb-6 flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
          syncMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
          syncMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
          'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          {syncMsg.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
           syncMsg.type === 'error' ? <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
           <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          {syncMsg.text}
        </div>
      )}

      {/* Status card */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
            <Instagram className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-amber-800 text-lg mb-1">Automatic Instagram Sync — Not Yet Enabled</h2>
            <p className="text-amber-700 text-sm mb-4">
              Automatic Instagram feed sync is prepared but not enabled yet.
              Add your Meta Developer credentials to <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> to activate.
            </p>
            <div className="bg-amber-100 rounded-xl p-4 font-mono text-xs space-y-1 text-amber-900">
              <p><span className="text-amber-500">INSTAGRAM_SYNC_ENABLED</span>=<span className="text-green-700">true</span></p>
              <p><span className="text-amber-500">INSTAGRAM_ACCESS_TOKEN</span>=<span className="text-gray-500">your-long-lived-token</span></p>
              <p><span className="text-amber-500">INSTAGRAM_IG_USER_ID</span>=<span className="text-gray-500">your-ig-user-id</span></p>
              <p><span className="text-amber-500">INSTAGRAM_GRAPH_API_VERSION</span>=<span className="text-blue-700">v20.0</span></p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="https://developers.facebook.com/docs/instagram-basic-display-api" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2">
                <ExternalLink className="w-3.5 h-3.5" /> Meta Developer Docs
              </a>
              <a href="https://www.instagram.com/bigbeancafe.in/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2">
                <Instagram className="w-3.5 h-3.5" /> @bigbeancafe.in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Manual gallery link */}
      <div className="bg-white border border-[#E6C7A8] rounded-2xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800">Add Instagram Reels Manually</p>
          <p className="text-sm text-gray-500 mt-0.5">
            You can add Instagram reel/post URLs manually from the Gallery Items admin until automatic sync is ready.
          </p>
        </div>
        <Link href="/admin/gallery"
          className="flex items-center gap-2 bg-gradient-to-r from-[#3D1F0D] to-[#8B4A2F] text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm flex-shrink-0">
          Go to Gallery Items
        </Link>
      </div>

      {/* Synced items table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Instagram className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No automatic Instagram media synced yet.</p>
          <p className="text-sm text-gray-400 mt-1">Add Instagram reel links manually in Gallery for now.</p>
          <Link href="/admin/gallery" className="mt-4 inline-block text-[#C9943A] font-semibold hover:underline text-sm">
            Go to Gallery Admin →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="font-semibold text-gray-700">{items.length} synced item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Preview</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Caption</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Type</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {item.thumbnail_url || item.media_url ? (
                      <img src={(item.thumbnail_url || item.media_url)!} alt=""
                        className="w-14 h-10 object-cover rounded-lg" />
                    ) : (
                      <div className="w-14 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #f09433,#dc2743,#bc1888)' }}>
                        <Instagram className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="truncate text-gray-700">{item.caption || '—'}</p>
                    {item.permalink && (
                      <a href={item.permalink} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-pink-500 hover:underline">View on Instagram</a>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 capitalize">{item.media_type || '—'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleStatusToggle(item.id, item.status)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${item.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {item.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <button onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
