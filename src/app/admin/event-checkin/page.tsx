'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  QrCode, ScanLine, Camera, CameraOff, Search, Check, X,
  AlertCircle, Ticket, User, Calendar, MapPin, Clock, Phone,
  RefreshCw, ArrowRightLeft
} from 'lucide-react'
import apiRequest from '@/lib/api'
import { isSuperAdmin, hasPermission } from '@/lib/adminPermissions'
import toast from 'react-hot-toast'

interface CameraInfo {
  id: string
  label: string
}

interface CheckinResult {
  id: number
  booking_number: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  quantity: number
  payment_status: string
  booking_status: string
  event_id: number
  event_name: string
  event_date: string
  start_time: string
  end_time?: string
  ticket_type: string
  outlet_name?: string
  checked_in: boolean
  checked_in_at?: string
}

const fmtDate = (d?: string) => {
  if (!d) return '—'
  return new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const fmtTime = (t?: string) => {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${String(displayHour).padStart(2, '0')}:${m} ${ampm}`
}

const playBeep = () => {
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch (e) {
    // ignore audio errors
  }
}

export default function EventCheckinPage() {
  const router = useRouter()
  const scannerDivId = 'qr-scanner'
  const scannerRef = useRef<any>(null)

  const [hasAccess] = useState(() => isSuperAdmin() || hasPermission('event_bookings', 'edit'))
  const [cameras, setCameras] = useState<CameraInfo[]>([])
  const [activeCamera, setActiveCamera] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [result, setResult] = useState<CheckinResult | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [recent, setRecent] = useState<CheckinResult[]>([])
  const [scannerReady, setScannerReady] = useState(false)

  // Initialize scanner object only on client
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const mod: any = await import('html5-qrcode')
        if (!mounted) return
        const Html5Qrcode = mod.Html5Qrcode
        scannerRef.current = new Html5Qrcode(scannerDivId)
        setScannerReady(true)
      } catch (e: any) {
        setError('Failed to load QR scanner library.')
      }
    })()

    return () => {
      mounted = false
      stopScanner().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopScanner = async () => {
    if (!scannerRef.current) return
    try {
      await scannerRef.current.stop()
    } catch (e) {
      // may throw if not scanning
    }
    setIsScanning(false)
  }

  const startScanner = async (cameraId?: string) => {
    if (!scannerRef.current) return
    setError(null)
    try {
      const mod: any = await import('html5-qrcode')
      let list = cameras
      if (!list.length) {
        list = (await mod.Html5Qrcode.getCameras()) || []
        setCameras(list)
      }
      if (!list.length) {
        setError('No cameras found.')
        return
      }

      const back = list.find((c: CameraInfo) => /back|rear|environment/i.test(c.label))
      const selected = cameraId || activeCamera || back?.id || list[0].id
      setActiveCamera(selected)

      await scannerRef.current.start(
        selected,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (text: string) => handleScan(text),
        () => {}
      )
      setIsScanning(true)
    } catch (e: any) {
      const msg = e?.message || String(e)
      if (e?.name === 'NotAllowedError' || /permission/i.test(msg) || /denied/i.test(msg)) {
        setError('Camera permission denied. Please allow camera access or use manual booking search.')
      } else {
        setError(msg || 'Could not start camera.')
      }
      setIsScanning(false)
    }
  }

  const switchCamera = async () => {
    if (cameras.length <= 1) return
    const idx = cameras.findIndex((c) => c.id === activeCamera)
    const next = cameras[(idx + 1) % cameras.length]
    if (isScanning) {
      await stopScanner()
      await startScanner(next.id)
    } else {
      setActiveCamera(next.id)
    }
  }

  const handleScan = async (text: string) => {
    if (loading) return
    await stopScanner()
    await lookup(text)
  }

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualInput.trim() || loading) return
    await stopScanner()
    await lookup(manualInput.trim())
  }

  const lookup = async (qrData: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiRequest('/admin/event-checkin/lookup', {
        method: 'POST',
        body: JSON.stringify({ qr_data: qrData }),
      })
      const json = await res.json()
      if (json.success) {
        setResult(json.data)
        if (json.already_checked_in) {
          toast(json.message, { icon: 'ℹ️' })
        }
      } else {
        setError(json.message)
        if (json.data) setResult(json.data)
        else setResult(null)
      }
    } catch (err: any) {
      const msg = err?.message || 'Lookup failed'
      setError(msg)
      setResult(null)
      if (msg.includes('permission')) {
        toast.error('You do not have permission to check in event tickets.')
      }
    } finally {
      setLoading(false)
    }
  }

  const confirmCheckin = async () => {
    if (!result) return
    setLoading(true)
    try {
      const res = await apiRequest('/admin/event-checkin/confirm', {
        method: 'POST',
        body: JSON.stringify({ booking_id: result.id }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message)
        playBeep()
        const updated: CheckinResult = {
          ...result,
          booking_status: 'checked_in',
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        }
        setResult(updated)
        setRecent((prev) => [updated, ...prev].slice(0, 10))
      } else {
        toast.error(json.message || 'Check-in failed')
      }
    } catch (err: any) {
      const msg = err?.message || 'Check-in failed'
      toast.error(msg)
      if (msg.includes('permission')) {
        toast.error('You do not have permission to check in event tickets.')
      }
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }

  const resetAndScan = async () => {
    setResult(null)
    setError(null)
    setConfirmOpen(false)
    await startScanner()
  }

  const renderStatus = () => {
    if (!result) return null
    if (result.booking_status === 'checked_in' || result.checked_in) {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
          <Check className="h-4 w-4" /> Already checked in
        </div>
      )
    }
    if (result.booking_status === 'cancelled') {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">
          <AlertCircle className="h-4 w-4" /> Booking cancelled
        </div>
      )
    }
    if (result.payment_status !== 'paid') {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">
          <AlertCircle className="h-4 w-4" /> Payment not completed
        </div>
      )
    }
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
        <Check className="h-4 w-4" /> Valid Ticket
      </div>
    )
  }

  const canConfirm = result && result.payment_status === 'paid' && result.booking_status === 'confirmed'

  if (!hasAccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="max-w-md text-gray-600">You do not have permission to check in event tickets.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Event QR Check-in</h1>
          <p className="text-sm text-gray-500">Scan ticket QR codes or search by booking number to check in guests.</p>
        </div>
        {result && (
          <button
            onClick={resetAndScan}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3D1F0D] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#5a2c16]"
          >
            <RefreshCw className="h-4 w-4" /> Scan Next Ticket
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left — Scanner & Manual Search */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanLine className="h-5 w-5 text-[#C9943A]" />
                <h2 className="font-bold text-gray-900">Scan Event Ticket QR</h2>
              </div>
              <div className="flex items-center gap-2">
                {cameras.length > 1 && (
                  <button
                    onClick={switchCamera}
                    disabled={!scannerReady || loading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" /> Switch Camera
                  </button>
                )}
                <button
                  onClick={() => (isScanning ? stopScanner() : startScanner())}
                  disabled={!scannerReady || loading}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white ${
                    isScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-[#3D1F0D] hover:bg-[#5a2c16]'
                  } disabled:opacity-50`}
                >
                  {isScanning ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                  {isScanning ? 'Stop Scanner' : 'Start Scanner'}
                </button>
              </div>
            </div>

            <div
              id={scannerDivId}
              className={`relative flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 md:aspect-video md:max-w-full ${
                isScanning ? 'border-[#C9943A] bg-black' : ''
              }`}
            >
              {!isScanning && (
                <div className="flex flex-col items-center gap-3 p-6 text-center text-gray-500">
                  <QrCode className="h-12 w-12 opacity-30" />
                  <p>Place the ticket QR code inside the scanner box.</p>
                  <p className="text-xs">Click Start Scanner to enable camera.</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="mb-1 flex items-center gap-2 font-bold">
                  <AlertCircle className="h-4 w-4" /> {error.includes('permission') ? 'Camera permission denied' : 'Scanner error'}
                </div>
                {error}
              </div>
            )}
          </div>

          {/* Manual Search */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
              <Search className="h-5 w-5 text-[#C9943A]" /> Manual Booking Search
            </h2>
            <form onSubmit={handleManualSearch} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter booking number"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-[#C9943A] focus:ring-2"
              />
              <button
                type="submit"
                disabled={!manualInput.trim() || loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3D1F0D] px-6 py-3 text-sm font-bold text-white hover:bg-[#5a2c16] disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search Ticket'}
              </button>
            </form>
          </div>
        </div>

        {/* Right — Result & Recent */}
        <div className="space-y-6">
          {/* Result Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
              <Ticket className="h-5 w-5 text-[#C9943A]" /> Booking Result
            </h2>

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 py-12 text-center text-gray-500">
                <QrCode className="mb-3 h-10 w-10 opacity-30" />
                <p>Scan a ticket or enter a booking number to see details.</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 py-12 text-center text-gray-500">
                <RefreshCw className="mb-3 h-8 w-8 animate-spin text-[#C9943A]" />
                <p>Looking up booking...</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {renderStatus()}
                  <span className="text-xs font-medium text-gray-400">{result.booking_number}</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <User className="h-3.5 w-3.5" /> Customer
                    </div>
                    <div className="font-semibold text-gray-900">{result.customer_name}</div>
                    {result.customer_phone && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="h-3 w-3" /> {result.customer_phone}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <Calendar className="h-3.5 w-3.5" /> Event
                    </div>
                    <div className="font-semibold text-gray-900">{result.event_name}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {fmtDate(result.event_date)} · {fmtTime(result.start_time)}
                      {result.end_time ? ` - ${fmtTime(result.end_time)}` : ''}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <MapPin className="h-3.5 w-3.5" /> Outlet
                    </div>
                    <div className="font-semibold text-gray-900">{result.outlet_name || 'Big Bean Cafe'}</div>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <Ticket className="h-3.5 w-3.5" /> Ticket
                    </div>
                    <div className="font-semibold text-gray-900">
                      {result.ticket_type} × {result.quantity}
                    </div>
                    <div className="mt-1 text-xs capitalize text-gray-500">Payment: {result.payment_status}</div>
                  </div>
                </div>

                {result.checked_in && result.checked_in_at && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                    <div className="flex items-center gap-2 font-semibold">
                      <Clock className="h-4 w-4" /> Checked in at
                    </div>
                    <div className="mt-1 text-xs">
                      {new Date(result.checked_in_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                )}

                {canConfirm && (
                  <button
                    onClick={() => setConfirmOpen(true)}
                    disabled={loading}
                    className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Confirm Check-in
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Recent Check-ins */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
              <Check className="h-5 w-5 text-[#C9943A]" /> Recent Check-ins
            </h2>
            {recent.length === 0 ? (
              <p className="text-sm text-gray-500">No check-ins in this session yet.</p>
            ) : (
              <ul className="space-y-3">
                {recent.map((r, idx) => (
                  <li key={`${r.id}-${idx}`} className="flex items-start justify-between rounded-xl bg-gray-50 p-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{r.booking_number}</div>
                      <div className="text-xs text-gray-500">{r.customer_name} · {r.event_name}</div>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      {r.checked_in_at
                        ? new Date(r.checked_in_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                        : 'Just now'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmOpen && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-gray-900">Confirm Check-in</h3>
            <p className="mb-6 text-sm text-gray-600">
              Are you sure you want to check in <span className="font-semibold text-gray-900">{result.customer_name}</span> for booking{' '}
              <span className="font-mono text-gray-900">{result.booking_number}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmCheckin}
                disabled={loading}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Checking in...' : 'Confirm Check-in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
