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
      <section className="bg-white p-6 md:p-10 rounded-[2.5rem] border shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
        <div className="relative z-10 text-center md:text-right">
          <h1 className="text-2xl md:text-4xl font-black text-gray-800 leading-tight">
            {profile ? `مرحباً بك، ${profile.full_name.split(' ')[0]}` : 'مرحباً بك في معهد العباسية'}
          </h1>
          <p className="text-gray-500 mt-3 text-sm md:text-lg font-medium">نحن هنا لندعم رحلتك التعليمية بأفضل الأدوات الممكنة.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
          <Link to="/lectures" className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-center hover:bg-secondary transition-all shadow-lg shadow-primary/20">ابدأ المذاكرة</Link>
          <Link to="/schedules" className="bg-gray-50 text-gray-600 px-8 py-4 rounded-2xl font-black text-center hover:bg-gray-100 transition-all border border-gray-100">عرض الجدول</Link>
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
