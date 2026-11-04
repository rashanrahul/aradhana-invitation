
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Star, MessageSquare, Send } from 'lucide-react'
import BrandFooter from '../components/BrandFooter'

export default function FeedbackPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const submitFeedback = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const { data, error } = await supabase.rpc(
      'submit_verified_feedback',
      {
        p_order_number: orderNumber.trim(),
        p_customer_phone: phone.trim(),
        p_rating: rating,
        p_message: message.trim(),
      }
    )

    setLoading(false)

    if (error) {
      setResult({
        success: false,
        message: 'Something went wrong. Please try again.',
      })
      return
    }

    setResult(data)

    if (data?.success) {
      setOrderNumber('')
      setPhone('')
      setRating(5)
      setMessage('')
    }
  }

  return (
    <div className="feedback-page min-h-screen">
      <div className="feedback-page-inner mx-auto max-w-5xl px-5">
        <header className="catalog-topbar">
          <Link to="/" className="catalog-brand" aria-label="Aradhana Invitation home">
            <span className="catalog-brand-logo-frame">
              <img src="/logo.png" alt="" className="catalog-brand-logo" />
            </span>
            <span className="catalog-brand-wordmark">
              <strong>ARADHANA</strong>
              <small>INVITATION</small>
            </span>
          </Link>
          <nav className="catalog-topbar-links" aria-label="Customer navigation">
            <Link to="/" className="catalog-topbar-link">Home</Link>
            <Link to="/products" className="catalog-topbar-link">Shop invitations</Link>
            <Link to="/track-order" className="catalog-topbar-link">Track an order</Link>
          </nav>
        </header>

        <main className="feedback-layout">
          <section className="feedback-intro">
            <p className="feedback-eyebrow">A note from you means a lot</p>
            <h1 className="catalog-heading">Share your experience</h1>
            <p>
              We love hearing how your invitation helped make a special moment
              feel even more memorable. Use your order details to leave a verified review.
            </p>
            <div className="feedback-decoration" aria-hidden="true">
              <span>✦</span>
              <span>Made for your moments</span>
              <span>✦</span>
            </div>
          </section>

          <div className="feedback-card">
          <div className="mb-6 text-center">
          <MessageSquare
            size={40}
            className="mx-auto mb-3 text-[#76534b]"
          />
          <h2 className="text-2xl font-serif text-[#76534b]">
            Your review
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Your feedback is reviewed before appearing on our homepage.
          </p>
        </div>

        <form onSubmit={submitFeedback} className="space-y-5">
          <div>
            <label htmlFor="feedback-order-number" className="mb-2 block text-sm font-medium">
              Order Tracking Number
            </label>
            <input
              id="feedback-order-number"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Example: AR-XXXXXXXXXXXX"
              required
              className="w-full rounded-lg border p-3 outline-none focus:border-[#76534b]"
            />
          </div>

          <div>
            <label htmlFor="feedback-phone" className="mb-2 block text-sm font-medium">
              Order Phone Number
            </label>
            <input
              id="feedback-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your order phone number"
              required
              className="w-full rounded-lg border p-3 outline-none focus:border-[#76534b]"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium">
              Your Rating
            </label>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} out of 5`}
                  aria-pressed={star === rating}
                >
                  <Star
                    size={32}
                    fill={star <= rating ? '#eab308' : 'none'}
                    color={star <= rating ? '#eab308' : '#9ca3af'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="feedback-message" className="mb-2 block text-sm font-medium">
              Your Feedback
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write about your experience..."
              rows={5}
              minLength={5}
              maxLength={1000}
              required
              className="w-full rounded-lg border p-3 outline-none focus:border-[#76534b]"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {message.length}/1000
            </p>
          </div>

          {result && (
            <div
              className={`rounded-lg p-3 text-sm ${
                result.success
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
              role={result.success ? 'status' : 'alert'}
            >
              {result.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#76534b] py-3 font-medium text-white hover:bg-[#604139] disabled:opacity-50"
          >
            <Send size={18} />
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
        </main>
      </div>
      <BrandFooter />
    </div>
  )
}
