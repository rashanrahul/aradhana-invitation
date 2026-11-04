
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Star, MessageSquare, ShieldCheck } from 'lucide-react'

export default function CustomerFeedbackSection() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadFeedback() {
      const { data, error } = await supabase
        .from('customer_feedback')
        .select('id, customer_name, rating, message, created_at')
        .eq('status', 'Approved')
        .not('order_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(6)

      if (mounted) {
        if (!error) setFeedbacks(data || [])
        setLoading(false)
      }
    }

    loadFeedback()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return null
  if (feedbacks.length === 0) return null

  return (
    <section className="customer-feedback-section bg-[#fffaf7] px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <MessageSquare
            size={35}
            className="mx-auto mb-3 text-[#76534b]"
          />

          <h2 className="text-3xl font-serif text-[#76534b]">
            Customer Experiences
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            Real experiences shared by our customers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {feedbacks.map((feedback) => (
            <article
              key={feedback.id}
              className="rounded-2xl border border-[#eaded8] bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    fill={star <= feedback.rating ? '#eab308' : 'none'}
                    color={star <= feedback.rating ? '#eab308' : '#d1d5db'}
                  />
                ))}
              </div>

              <p className="min-h-20 text-sm leading-7 text-gray-600">
                "{feedback.message}"
              </p>

              <div className="mt-5 border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-[#76534b]">
                  {feedback.customer_name}
                </h3>

                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green-700">
                  <ShieldCheck size={15} />
                  Verified Customer
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  {new Date(feedback.created_at).toLocaleDateString()}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
