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
        <h2 className="text-3xl font-bold">نتائج الاختبارات</h2>
      </div>

      {loading ? (
        <div className="text-center py-10">جاري تحميل النتائج...</div>
      ) : results.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4">المادة</th>
                <th className="px-6 py-4">الدرجة</th>
                <th className="px-6 py-4">التقدير</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map(res => (
                <tr key={res.id}>
                  <td className="px-6 py-4">{res.subject}</td>
                  <td className="px-6 py-4">{res.score} / {res.max_score}</td>
                  <td className="px-6 py-4 font-bold">{res.score >= 50 ? 'ناجح' : 'راسب'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">لا توجد نتائج معلنة حالياً</div>
      )}
    </div>
  )
}
