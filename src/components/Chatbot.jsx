
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageCircle,
  X,
  Bot,
  ExternalLink,
  Trash2
} from 'lucide-react'

const questionKeywords = [
  {
    id: 'forgot',
    keywords: ['forgot', 'lost', 'අමතක', 'නැතිවෙලා', 'නැතිවුණා']
  },
  {
    id: 'track',
    keywords: ['track', 'tracking', 'order status', 'where is my order', 'ඇණවුම track', 'තත්ත්වය', 'පරීක්ෂා']
  },
  {
    id: 'prices',
    keywords: ['price', 'prices', 'cost', 'package', 'packages', 'මිල', 'ගණන්', 'පැකේජ']
  },
  {
    id: 'order',
    keywords: ['how to order', 'place an order', 'ordering', 'buy', 'order කරන', 'ඇණවුමක් දා', 'මිලදී']
  },
  {
    id: 'wedding',
    keywords: ['wedding', 'marriage', 'විවාහ', 'මංගල']
  },
  {
    id: 'birthday',
    keywords: ['birthday', 'උපන්දිනය', 'උපන්දින']
  },
  {
    id: 'engagement',
    keywords: ['engagement', 'විවාහ ගිවිස', 'ගිවිස ගැනීම']
  },
  {
    id: 'corporate',
    keywords: ['corporate', 'business', 'company', 'office', 'ආයතනික', 'ව්‍යාපාරික']
  },
  {
    id: 'special',
    keywords: ['special event', 'other event', 'anniversary', 'විශේෂ අවස්ථා', 'සංවත්සර']
  },
  {
    id: 'feedback',
    keywords: ['feedback', 'review', 'experience', 'අදහස්', 'ප්‍රතිචාර']
  },
  {
    id: 'contact',
    keywords: ['contact', 'whatsapp', 'support', 'සම්බන්ධ', 'උදව්', 'සහාය']
  }
]

export default function Chatbot() {
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState('en')
  const [draft, setDraft] = useState('')

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! 👋 Welcome to Aradhana Invitation. How can I help you today?'
    }
  ])

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    })
  }, [messages])

  // Chatbot questions and answers
  const content = {
    en: {
      welcome:
        'Hello! 👋 Welcome to Aradhana Invitation. How can I help you today?',

      questions: [
        {
          id: 'wedding',
          label: 'Wedding Invitations',
          answer:
            '💍 We offer beautiful and elegant wedding invitation designs. Browse our Wedding collection and choose your favourite design.',
          link: '/products',
          linkLabel: 'Explore Invitations →'
        },
        {
          id: 'birthday',
          label: 'Birthday Invitations',
          answer:
            '🎂 Explore our creative birthday invitation designs for all ages. Make your special day memorable with Aradhana Invitation.',
          link: '/products',
          linkLabel: 'Explore Invitations →'
        },
        {
          id: 'engagement',
          label: 'Engagement Invitations',
          answer:
            '❤️ Discover our beautiful engagement invitation collections for your special celebration.',
          link: '/products',
          linkLabel: 'Explore Invitations →'
        },
        {
          id: 'corporate',
          label: 'Corporate Invitations',
          answer:
            '🏢 We offer professional invitation designs for corporate events, business functions and grand openings.',
          link: '/products',
          linkLabel: 'Explore Invitations →'
        },
        {
          id: 'special',
          label: 'Special Event Invitations',
          answer:
            '✨ Discover creative invitation designs for your special occasions and memorable celebrations.',
          link: '/products',
          linkLabel: 'Explore Invitations →'
        },
        {
          id: 'prices',
          label: 'Prices & Packages',
          answer:
            '💰 Our prices depend on the selected invitation design and package. Contact us through WhatsApp for more details.'
        },
        {
          id: 'order',
          label: 'How to Order?',
          answer:
            '🛍️ Choose your favourite invitation, add it to your cart and submit your order. Online payment is not required.'
        },
        {
          id: 'track',
          label: 'Track My Order',
          answer:
            '📦 You can check your order status using your tracking number and phone number on our Track Your Order page.',
          link: '/track-order',
          linkLabel: 'Track Your Order →'
        },

        {
  id: 'feedback',
  label: 'Customer Feedback',
  answer:
    '⭐ We value your feedback! Please share your experience with Aradhana Invitation.',
  link: '/feedback',
  linkLabel: 'Give Feedback →'
},

{
  id: 'forgot',
  label: 'Forgot Tracking / Phone Number?',
  answer:
    'No worries! 😊 If you have forgotten your tracking number or registered phone number, please contact our support team through WhatsApp. We will help you.',
},

        {
          id: 'contact',
          label: 'Contact WhatsApp',
          answer:
            '💬 You can contact our team directly through WhatsApp. We are happy to help you!'
        }
      ]
    },

    si: {
      welcome:
        'ආයුබෝවන්! 👋 Aradhana Invitation වෙත සාදරයෙන් පිළිගනිමු. ඔබට අපගෙන් ලබාගැනීමට අවශ්‍ය සහාය කුමක්ද?',

      questions: [
        {
          id: 'wedding',
          label: 'විවාහ ආරාධනා',
          answer:
            '💍 ඔබගේ විවාහ උත්සවය සඳහා අලංකාර Wedding Invitation Designs අප සතුව තිබෙනවා. අපගේ Designs බලන්න.',
          link: '/products',
          linkLabel: 'Invitations බලන්න →'
        },
        {
          id: 'birthday',
          label: 'උපන්දින ආරාධනා',
          answer:
            '🎂 ඔබගේ උපන්දිනයට ගැළපෙන ලස්සන සහ නිර්මාණශීලී Birthday Invitation Designs අපෙන් ලබාගන්න පුළුවන්.',
          link: '/products',
          linkLabel: 'Invitations බලන්න →'
        },
        {
          id: 'engagement',
          label: 'විවාහ ගිවිස ගැනීමේ ආරාධනා',
          answer:
            '❤️ ඔබගේ Engagement උත්සවය සඳහා විශේෂ සහ ආකර්ෂණීය Invitation Designs අප සතුව තිබෙනවා.',
          link: '/products',
          linkLabel: 'Invitations බලන්න →'
        },
        {
          id: 'corporate',
          label: 'ආයතනික ආරාධනා',
          answer:
            '🏢 Corporate Events, Business Functions සහ Grand Opening සඳහා Professional Invitation Designs අපෙන් ලබාගන්න පුළුවන්.',
          link: '/products',
          linkLabel: 'Invitations බලන්න →'
        },
        {
          id: 'special',
          label: 'විශේෂ සිදුවීම් ආරාධනා',
          answer:
            '✨ ඔබගේ විශේෂ අවස්ථා සඳහා අලංකාර සහ නිර්මාණශීලී Invitation Designs අප සතුව තිබෙනවා.',
          link: '/products',
          linkLabel: 'Invitations බලන්න →'
        },
        {
          id: 'prices',
          label: 'මිල ගණන් සහ පැකේජ',
          answer:
            '💰 Invitation එකේ Design එක සහ Package එක අනුව මිල වෙනස් වෙනවා. වැඩි විස්තර සඳහා WhatsApp හරහා අපව සම්බන්ධ කරගන්න.'
        },
        {
          id: 'order',
          label: 'ඇණවුමක් දාන්නේ කොහොමද?',
          answer:
            '🛍️ ඔබ කැමති Invitation එක තෝරා Cart එකට එකතු කර Order එක Submit කරන්න. Online Payment අවශ්‍ය නැහැ.'
        },
        {
          id: 'track',
          label: 'ඇණවුම Track කරන්න',
          answer:
            '📦 ඔබගේ Tracking Number සහ Phone Number භාවිතයෙන් Website එකේ Track Your Order Page එකෙන් Order එක පරීක්ෂා කරන්න පුළුවන්.',
          link: '/track-order',
          linkLabel: 'Track Your Order →'
        },


        {
  id: 'feedback',
  label: 'පාරිභෝගික අදහස්',
  answer:
    '⭐ Aradhana Invitation සමඟ ඔබගේ අත්දැකීම අපට කියන්න. ඔබගේ වටිනා අදහස් අපට ඉතා වැදගත්!',
  link: '/feedback',
  linkLabel: 'Feedback ලබාදෙන්න →'
},

{
  id: 'forgot',
  label: 'Tracking / Phone Number අමතකද?',
  answer:
    'කණගාටු වෙන්න එපා! 😊 ඔබගේ Tracking Number එක හෝ Order එකට ලබාදුන් Phone Number එක අමතක නම් අපගේ WhatsApp Support එක හරහා අපව සම්බන්ධ කරගන්න. අපි ඔබට සහාය වෙන්නම්.',
},

        {
          id: 'contact',
          label: 'WhatsApp සම්බන්ධතාව',
          answer:
            '💬 අපගේ කණ්ඩායම සමඟ සෘජුවම WhatsApp හරහා සම්බන්ධ විය හැකියි.'
        }
      ]
    }
  }

  const currentContent = content[language]

  // Send question and answer
  const sendMessage = (question, userText = question.label) => {
    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: userText
      },
      {
        sender: 'bot',
        text: question.answer,
        link: question.link,
        linkLabel: question.linkLabel
      }
    ])

    // Open WhatsApp for contact questions
    if (question.id === 'contact' || question.id === 'forgot') {
  const message = question.id === 'forgot'
    ? 'Hello Aradhana Invitation, I forgot my tracking number or registered phone number. Can you help me?'
    : 'Hello Aradhana Invitation, I need help.'

  window.open(
    `https://wa.me/94707937390?text=${encodeURIComponent(message)}`,
    '_blank',
    'noopener,noreferrer'
  )
}
  }

  const submitQuestion = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    const normalizedText = text.toLocaleLowerCase()
    const matchedRule = questionKeywords.find(({ keywords }) =>
      keywords.some(keyword => normalizedText.includes(keyword.toLocaleLowerCase()))
    )
    const matchedQuestion = currentContent.questions.find(
      question => question.id === matchedRule?.id
    )

    setDraft('')
    if (matchedQuestion) {
      sendMessage(matchedQuestion, text)
      return
    }

    setMessages(prev => [
      ...prev,
      { sender: 'user', text },
      {
        sender: 'bot',
        text: language === 'si'
          ? 'කණගාටුයි, ඒ ගැන මට තවම නිශ්චිත පිළිතුරක් නැහැ. පහත ඇති මාතෘකාවක් තෝරන්න, නැත්නම් WhatsApp හරහා අපව සම්බන්ධ කරගන්න.'
          : "Sorry, I don't have a specific answer for that yet. Choose a topic below or contact us through WhatsApp."
      }
    ])
  }

  // WhatsApp support
  const whatsappUrl =
    'https://wa.me/94707937390?text=' +
    encodeURIComponent(
      'Hello Aradhana Invitation, I need help.'
    )

  // Clear chat
  const clearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: currentContent.welcome
      }
    ])
  }

  // Change language
  const changeLanguage = (lang) => {
    setLanguage(lang)

    setMessages([
      {
        sender: 'bot',
        text: content[lang].welcome
      }
    ])
  }

  return (
    <>
      {/* Chatbot Floating Button */}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-pink-600 text-white p-4 rounded-full shadow-xl hover:bg-pink-700 transition-all duration-300 hover:scale-110"
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <X size={26} />
        ) : (
          <MessageCircle size={28} />
        )}
      </button>

      {/* Chatbot Window */}

      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 flex max-h-[calc(100dvh-112px)] w-[340px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-2xl">

          {/* Header */}

          <div className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-pink-600 to-rose-500 p-4 text-white">

            <div className="bg-white/20 p-2 rounded-full">
              <Bot size={26} />
            </div>

            <div>
              <h3 className="font-bold">
                Aradhana Assistant
              </h3>

              <p className="text-xs text-pink-100">
                Online • Here to help
              </p>
            </div>

            <button
              onClick={clearChat}
              className="ml-auto p-2 hover:bg-white/20 rounded-full"
              title="Clear chat"
            >
              <Trash2 size={18} />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full"
              aria-label="Close chatbot"
            >
              <X size={22} />
            </button>

          </div>

          {/* Messages */}

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-pink-50 p-3">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl text-sm max-w-[90%] whitespace-pre-wrap ${
                  msg.sender === 'bot'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'bg-pink-600 text-white ml-auto'
                }`}
              >

                {msg.text}

                {msg.link && (
                  <button
                    onClick={() => {
                      navigate(msg.link)
                      setIsOpen(false)
                    }}
                    className="mt-3 block w-full rounded-lg bg-pink-600 text-white p-2 text-xs font-semibold hover:bg-pink-700 transition"
                  >
                    {msg.linkLabel}
                  </button>
                )}

              </div>
            ))}

            <div ref={messagesEndRef} />

          </div>

          {/* Language Selection */}

          <div className="shrink-0 space-y-3 bg-white p-3">

          <form onSubmit={submitQuestion} className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={event => setDraft(event.target.value)}
              placeholder={language === 'si' ? 'ඔබගේ ප්‍රශ්නය ලියන්න...' : 'Type your question...'}
              aria-label={language === 'si' ? 'ඔබගේ ප්‍රශ්නය' : 'Your question'}
              className="min-w-0 flex-1 rounded-lg border border-pink-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="rounded-lg bg-pink-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {language === 'si' ? 'යවන්න' : 'Send'}
            </button>
          </form>

            <div className="flex gap-2">

              <button
                onClick={() => changeLanguage('en')}
                className={`text-xs px-4 py-2 rounded-full transition ${
                  language === 'en'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                English
              </button>

              <button
                onClick={() => changeLanguage('si')}
                className={`text-xs px-4 py-2 rounded-full transition ${
                  language === 'si'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                සිංහල
              </button>

            </div>

            {/* Predefined Questions */}

            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">

              {currentContent.questions.map(question => (
                <button
                  key={question.id}
                  onClick={() => sendMessage(question)}
                  className="block w-full text-left text-xs border border-pink-200 rounded-lg p-2.5 text-gray-700 hover:bg-pink-50 hover:border-pink-400 transition"
                >
                  {question.label}
                </button>
              ))}

            </div>

            {/* WhatsApp Support */}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg p-2.5 text-sm font-medium hover:bg-green-700 transition"
            >
              <ExternalLink size={16} />
              WhatsApp Support
            </a>

          </div>

        </div>
      )}
    </>
  )
}
