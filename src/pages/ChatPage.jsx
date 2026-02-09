import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Send, User } from 'lucide-react'

export default function ChatPage({ profile }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    const subscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, fetchMessages)
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchMessages() {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, students(full_name)')
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || !profile) return
    await supabase.from('chat_messages').insert([{
      student_id: profile.id,
      message: newMessage
    }])
    setNewMessage('')
  }

  if (!profile) return <div className="text-center py-20">يرجى تسجيل الدخول للمشاركة في الدردشة</div>

  return (
    <div className="max-w-4xl mx-auto h-[calc(100-200px)] flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border dark:border-gray-800">
      <div className="p-6 border-b dark:border-gray-800 bg-primary text-white flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Send size={20} /> ملتقى طلاب العباسية
        </h2>
        <span className="text-sm opacity-80">{messages.length} رسالة</span>
      </div>

      <div className="flex-grow p-6 overflow-y-auto space-y-4 min-h-[500px]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.student_id === profile.id ? 'items-start' : 'items-end'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.student_id === profile.id 
              ? 'bg-primary text-white rounded-br-none' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-none'
            }`}>
              <p className="text-xs font-bold mb-1 opacity-70">{msg.students?.full_name}</p>
              <p>{msg.message}</p>
            </div>
            <span className="text-[10px] text-gray-400 mt-1">
              {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex gap-2">
        <input
          type="text"
          className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
          placeholder="اكتب رسالتك هنا..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="bg-primary text-white p-4 rounded-2xl hover:bg-secondary transition-all shadow-lg shadow-blue-100">
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
