
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Search, Package, Loader2, CheckCircle, Clock } from 'lucide-react'

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState(null)
  const [trackedPhone, setTrackedPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refreshError, setRefreshError] = useState('')

  useEffect(() => {
    if (!order?.order_number || !trackedPhone) return undefined

    let active = true
    let timeoutId

    async function refreshOrderStatus() {
      const { data, error: refreshFailure } = await supabase.rpc(
        'track_customer_order',
        {
          p_order_number: order.order_number,
          p_customer_phone: trackedPhone,
        }
      )

      if (!active) return

      if (refreshFailure) {
        console.error('Unable to refresh tracked order:', refreshFailure)
        setRefreshError('Order status could not be refreshed. Retrying...')
      } else if (data) {
        setOrder(data)
        setRefreshError('')
      } else {
        setRefreshError('Order status could not be refreshed. Retrying...')
      }

      timeoutId = window.setTimeout(refreshOrderStatus, 5000)
    }

    timeoutId = window.setTimeout(refreshOrderStatus, 5000)

    return () => {
      active = false
      window.clearTimeout(timeoutId)
    }
  }, [order?.order_number, trackedPhone])

  async function handleTrack(e) {
    e.preventDefault()

    setLoading(true)
    setError('')
    setRefreshError('')
    setOrder(null)
    setTrackedPhone('')

    const { data, error } = await supabase.rpc(
      'track_customer_order',
      {
        p_order_number: orderNumber.trim(),
        p_customer_phone: phone.trim()
      }
    )

    setLoading(false)

    if (error) {
      console.error(error)
      setError('Unable to track your order. Please try again.')
      return
    }

    if (!data) {
      setError('Order not found. Please check your tracking number and phone number.')
      return
    }

    setOrder(data)
    setTrackedPhone(phone.trim())
  }

  const statuses = [
    'Pending',
    'Confirmed',
    'Processing',
    'Completed'
  ]

  const currentStatus = order
    ? statuses.indexOf(order.status)
    : -1

  const isCancelled = order?.status === 'Cancelled'

  return (
    <div className="min-h-screen bg-[#fffaf7] px-5 py-16">
      <div className="mx-auto max-w-2xl">

        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <Package size={48} className="text-rose-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-800">
            Track Your Order
          </h1>

          <p className="mt-3 text-gray-500">
            Enter your tracking number and phone number to check your order status.
          </p>
        </div>

        <form
          onSubmit={handleTrack}
          className="space-y-4 rounded-2xl bg-white p-7 shadow-sm"
        >
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Tracking Number
            </label>

            <input
              type="text"
              required
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              placeholder="Example: AR-A82F91C4D210"
              className="w-full rounded-lg border p-3 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Phone Number
            </label>

            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter the phone number used for the order"
              className="w-full rounded-lg border p-3 outline-none focus:border-rose-500"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 py-3 font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Search size={20} />
                Track Order
              </>
            )}
          </button>
        </form>

        {order && (
          <div className="mt-8 rounded-2xl bg-white p-7 shadow-sm">

            <div className="border-b pb-5">
              <p className="text-sm text-gray-500">
                Tracking Number
              </p>

              <h2 className="mt-1 break-all text-2xl font-bold text-rose-600">
                {order.order_number}
              </h2>

              <p className="mt-3 text-sm text-gray-500">
                Order Date: {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            <div className="py-6">
              <h3 className="mb-5 text-xl font-bold text-gray-800">
                Order Status
              </h3>
              {refreshError && (
                <p className="mb-4 text-sm text-amber-700" role="status">
                  {refreshError}
                </p>
              )}

              {isCancelled ? (
                <div className="rounded-xl bg-red-50 p-5 text-center">
                  <p className="text-lg font-bold text-red-600">
                    Order Cancelled
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Please contact us for more information.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {statuses.map((status, index) => {
                    const completed = index <= currentStatus

                    return (
                      <div key={status} className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            completed
                              ? 'bg-rose-600 text-white'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {completed ? (
                            <CheckCircle size={19} />
                          ) : (
                            <Clock size={19} />
                          )}
                        </div>

                        <div>
                          <p className={`font-semibold ${
                            completed ? 'text-rose-600' : 'text-gray-400'
                          }`}>
                            {status}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="mb-4 text-xl font-bold text-gray-800">
                Order Items
              </h3>

              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between gap-4 border-b py-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.product_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    LKR {(Number(item.unit_price) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}

              <div className="mt-5 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-rose-600">
                  LKR {Number(order.total_amount).toLocaleString()}
                </span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
