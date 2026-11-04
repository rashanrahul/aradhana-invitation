
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Star, Check, X, Trash2, MessageSquare, RefreshCw } from 'lucide-react'

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchFeedbacks() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('customer_feedback')
      .select('id, order_id, customer_name, rating, message, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setFeedbacks(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchFeedbacks()

    const channel = supabase
      .channel('admin-customer-feedback')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer_feedback' },
        fetchFeedbacks
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from('customer_feedback')
      .update({ status })
      .eq('id', id)

    if (error) {
      alert(`Unable to update feedback: ${error.message}`)
      return
    }

    await fetchFeedbacks()
  }

  async function deleteFeedback(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this feedback?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('customer_feedback')
      .delete()
      .eq('id', id)

    if (error) {
      alert(`Unable to delete feedback: ${error.message}`)
      return
    }

    await fetchFeedbacks()
  }

  const filteredFeedbacks =
    filter === 'All'
      ? feedbacks
      : feedbacks.filter(
          (feedback) => feedback.status === filter
        )

  const counts = {
    All: feedbacks.length,
    Pending: feedbacks.filter((f) => f.status === 'Pending').length,
    Approved: feedbacks.filter((f) => f.status === 'Approved').length,
    Rejected: feedbacks.filter((f) => f.status === 'Rejected').length,
  }

  return (
    <div className="admin-content admin-feedback-page space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#76534b]">
            Customer Feedback
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage customer feedback.
          </p>
        </div>

        <button
          onClick={fetchFeedbacks}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-xl border p-4 text-left ${
              filter === status
                ? 'border-[#76534b] bg-[#76534b] text-white'
                : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            <p className="text-sm">{status}</p>
            <p className="mt-1 text-2xl font-semibold">
              {counts[status]}
            </p>
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-gray-500">
          Loading feedback...
        </p>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <MessageSquare
            size={35}
            className="mx-auto mb-3 text-gray-400"
          />
          <p className="text-gray-500">No feedback found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {feedback.customer_name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(feedback.created_at).toLocaleString()}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {feedback.order_id
                      ? 'Order verified'
                      : 'Legacy feedback - not verified'}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    feedback.status === 'Approved'
                      ? 'bg-green-100 text-green-700'
                      : feedback.status === 'Rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {feedback.status}
                </span>
              </div>

              <div className="my-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    fill={star <= feedback.rating ? '#eab308' : 'none'}
                    color={star <= feedback.rating ? '#eab308' : '#d1d5db'}
                  />
                ))}
              </div>

              <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                {feedback.message}
              </p>

              <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                {feedback.status !== 'Approved' && (
                  <button
                    onClick={() => updateStatus(feedback.id, 'Approved')}
                    disabled={!feedback.order_id}
                    title={
                      !feedback.order_id
                        ? 'Legacy feedback cannot be approved as verified'
                        : 'Approve feedback'
                    }
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                )}

                {feedback.status !== 'Rejected' && (
                  <button
                    onClick={() => updateStatus(feedback.id, 'Rejected')}
                    className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm text-white hover:bg-orange-600"
                  >
                    <X size={16} />
                    Reject
                  </button>
                )}

                <button
                  onClick={() => deleteFeedback(feedback.id)}
                  className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
