import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Video, FileText, Lock, Search, Filter } from 'lucide-react'

export default function LecturesPage({ profile }) {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchLectures() {
      if (!profile) return
      
      const { data } = await supabase
        .from('lectures')
        .select('*')
        .eq('department_id', profile.department_id)
        .eq('year', profile.year)
        .order('created_at', { ascending: false })
      
      setLectures(data || [])
      setLoading(false)
    }
    fetchLectures()
  }, [profile])

  const filteredLectures = lectures.filter(l => 
    l.title.includes(search) || l.description?.includes(search)
  )

  if (!profile) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border shadow-sm max-w-2xl mx-auto">
        <Lock size={64} className="mx-auto text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800">المحتوى محمي</h2>
        <p className="text-gray-500 mt-2 px-6">يرجى تسجيل الدخول للوصول إلى المحاضرات والمواد العلمية الخاصة بقسمك.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">المحاضرات الدراسية</h2>
          <p className="text-gray-500 mt-1">تصفح جميع المواد العلمية المسجلة لك</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="بحث في المحاضرات..."
            className="w-full pr-10 py-2.5 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold">جاري تحميل المحتوى...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLectures.map(lecture => (
            <div key={lecture.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {lecture.video_url ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/0 transition-all">
                    <Video size={48} className="text-primary opacity-50 group-hover:scale-110 transition-transform" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <FileText size={48} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary">
                  {new Date(lecture.created_at).toLocaleDateString('ar-EG')}
                </div>
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                  {lecture.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                  {lecture.description || 'لا يوجد وصف متاح لهذه المحاضرة.'}
                </p>
                
                <div className="flex gap-3">
                  {lecture.video_url && (
                    <a 
                      href={lecture.video_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:bg-secondary transition-all shadow-lg shadow-blue-100"
                    >
                      <Video size={18} /> مشاهدة
                    </a>
                  )}
                  {lecture.file_url && (
                    <a 
                      href={lecture.file_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                      <FileText size={18} /> تحميل PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredLectures.length === 0 && (
            <div className="md:col-span-3 text-center py-20 text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">لم يتم العثور على أي محاضرات تطابق بحثك.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
