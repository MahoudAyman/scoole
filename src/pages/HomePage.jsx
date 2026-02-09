import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Newspaper, BookOpen, Calendar, Trophy, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HomePage({ profile }) {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNews() {
      const { data } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
      setNews(data || [])
      setLoading(false)
    }
    fetchNews()
  }, [])

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section className="bg-white p-8 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {profile ? `مرحباً بك، ${profile.full_name}` : 'مرحباً بك في معهد العباسية'}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">نحن هنا لندعم رحلتك التعليمية بأفضل الأدوات الممكنة.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/lectures" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary transition-all">ابدأ المذاكرة</Link>
          <Link to="/schedules" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">عرض الجدول</Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest News */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Newspaper className="text-primary" size={24} /> آخر الأخبار والإعلانات
          </h2>
          <div className="space-y-4">
            {news.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border hover:border-primary transition-all cursor-default group">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors">{item.title}</h3>
                  <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
                <p className="text-gray-600 mt-2 line-clamp-2 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">وصول سريع</h2>
          <div className="bg-white rounded-2xl border overflow-hidden">
            <Link to="/lectures" className="flex items-center justify-between p-4 hover:bg-gray-50 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><BookOpen size={20} /></div>
                <span className="font-bold">المحاضرات</span>
              </div>
              <ChevronLeft size={18} className="text-gray-400" />
            </Link>
            <Link to="/schedules" className="flex items-center justify-between p-4 hover:bg-gray-50 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-lg text-green-600"><Calendar size={20} /></div>
                <span className="font-bold">الجدول الدراسي</span>
              </div>
              <ChevronLeft size={18} className="text-gray-400" />
            </Link>
            <Link to="/results" className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600"><Trophy size={20} /></div>
                <span className="font-bold">النتائج</span>
              </div>
              <ChevronLeft size={18} className="text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
