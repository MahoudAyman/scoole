import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Trophy, Award, Frown, Lock } from 'lucide-react'

export default function ResultsPage({ profile }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      if (!profile?.id) return
      const { data } = await supabase
        .from('results')
        .select('*')
        .eq('student_id', profile.id)
      setResults(data || [])
      setLoading(false)
    }
    fetchResults()
  }, [profile])

  if (!profile) return <div className="text-center py-20 text-xl font-bold">يرجى تسجيل الدخول لعرض النتائج</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="text-yellow-500" size={32} />
        <h2 className="text-3xl font-bold">نتائج الامتحانات</h2>
      </div>

      {loading ? (
        <div className="text-center py-20 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold">جاري تحميل النتائج...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map(res => (
            <div key={res.id} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between group hover:border-primary transition-all">
              <div className="space-y-1">
                <h4 className="font-black text-gray-800 text-lg">{res.subject}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                  <span>الدرجة: {res.score} من {res.max_score}</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl font-black text-sm ${
                res.score >= 50 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {res.score >= 50 ? 'ناجح' : 'راسب'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">لا توجد نتائج معلنة حالياً</div>
      )}
    </div>
  )
}
