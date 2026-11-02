
import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  const phone = '94707937390'

  const message = encodeURIComponent(
    'Hello Aradhana Invitation! I would like to make an inquiry.'
  )

  const whatsappUrl = `https://wa.me/${phone}?text=${message}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-110 hover:bg-green-600"
    >
      <MessageCircle size={30} />
    </a>
  )
}
