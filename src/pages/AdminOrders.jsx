
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  RefreshCw,
  Search,
  ShoppingBag,
  Eye,
  X,
  Package
} from 'lucide-react'

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Completed',
  'Cancelled'
]

export default function AdminOrders() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const { data: { user }, error: authError } =
      await supabase.auth.getUser()

    if (authError || !user) {
      navigate('/admin')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      await supabase.auth.signOut()
      navigate('/admin')
      return
    }

    fetchOrders()
  }

  async function fetchOrders() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          quantity,
          unit_price
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setOrders(data || [])
    }

    setLoading(false)
  }

  async function updateOrderStatus(orderId, newStatus) {
    setUpdatingId(orderId)
    setError('')
    setMessage('')

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      setError(error.message)
    } else {
      setMessage('Order status updated successfully!')

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      )

      setSelectedOrder(prev =>
        prev?.id === orderId
          ? { ...prev, status: newStatus }
          : prev
      )
    }

    setUpdatingId(null)
  }

  function formatDate(date) {
    return new Date(date).toLocaleString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredOrders = orders.filter(order => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      (order.order_number || '').toLowerCase().includes(searchText) ||
      (order.customer_name || '').toLowerCase().includes(searchText) ||
      (order.customer_phone || '').toLowerCase().includes(searchText) ||
      (order.customer_email || '').toLowerCase().includes(searchText)

    const matchesStatus =
      statusFilter === 'All' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusColor = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-blue-100 text-blue-800',
    Processing: 'bg-purple-100 text-purple-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800'
  }

  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'Pending').length
  const completedOrders = orders.filter(o => o.status === 'Completed').length

  return (
    <div className="admin-content admin-orders-page min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          Dashboard overview
        </button>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Orders Management
            </h1>
            <p className="mt-2 text-gray-500">
              View customer orders and manage order statuses.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 hover:bg-gray-100"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Total Orders</p>
            <h2 className="mt-2 text-3xl font-bold">{totalOrders}</h2>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Pending Orders</p>
            <h2 className="mt-2 text-3xl font-bold text-yellow-600">
              {pendingOrders}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">Completed Orders</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {completedOrders}
            </h2>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-3.5 text-gray-400"
              size={18}
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search order number, customer name or phone..."
              className="w-full rounded-lg border bg-white py-3 pl-10 pr-4"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border bg-white px-4 py-3"
          >
            <option value="All">All Statuses</option>
            {ORDER_STATUSES.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          {loading ? (
            <p className="p-10 text-center text-gray-500">
              Loading orders...
            </p>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag
                size={42}
                className="mx-auto mb-3 text-gray-300"
              />
              <p className="font-medium text-gray-600">
                No orders found.
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Customer orders will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-gray-100 text-sm text-gray-600">
                  <tr>
                    <th className="p-4">Order Number</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-t">
                      <td className="p-4 font-semibold">
                        {order.order_number}
                      </td>

                      <td className="p-4">
                        <p className="font-medium">
                          {order.customer_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customer_phone}
                        </p>
                      </td>

                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </td>

                      <td className="p-4 font-semibold">
                        LKR {Number(order.total_amount).toLocaleString('en-LK')}
                      </td>

                      <td className="p-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusColor[order.status] || 'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedOrder.order_number}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg p-2 hover:bg-gray-100"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Customer Information */}
              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold">Customer Information</h3>

                <p className="mb-2 text-sm">
                  <strong>Name:</strong> {selectedOrder.customer_name}
                </p>

                <p className="mb-2 text-sm">
                  <strong>Phone:</strong> {selectedOrder.customer_phone}
                </p>

                <p className="text-sm">
                  <strong>Email:</strong> {selectedOrder.customer_email || 'Not provided'}
                </p>

                <p className="mt-2 text-sm">
                  <strong>Order Date:</strong> {formatDate(selectedOrder.created_at)}
                </p>
              </div>

              {/* Ordered Items */}
              <h3 className="mb-3 font-semibold">Ordered Items</h3>

              <div className="mb-6 divide-y rounded-lg border">
                {(selectedOrder.order_items || []).length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">
                    No order items found.
                  </p>
                ) : (
                  selectedOrder.order_items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-4"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="font-semibold">
                        LKR {(Number(item.unit_price) * Number(item.quantity)).toLocaleString('en-LK')}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mb-6 text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold">
                  LKR {Number(selectedOrder.total_amount).toLocaleString('en-LK')}
                </p>
              </div>

              {/* Update Status */}
              <div className="border-t pt-5">
                <label className="mb-2 block font-semibold">
                  Update Order Status
                </label>

                <select
                  value={selectedOrder.status}
                  disabled={updatingId === selectedOrder.id}
                  onChange={e => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="w-full rounded-lg border bg-white p-3"
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {updatingId === selectedOrder.id && (
                  <p className="mt-2 text-sm text-gray-500">
                    Updating status...
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="mt-5 w-full rounded-lg border py-3 hover:bg-gray-50"
              >
                Close
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
