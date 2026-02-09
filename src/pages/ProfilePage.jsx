import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Save } from 'lucide-react'

export default function ProfilePage({ session, profile, fetchProfile }) {
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('1')
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setDepartment(profile.department_id || '')
      setYear(profile.year || '1')
    }
  }, [profile])

  useEffect(() => {
    async function getDepartments() {
      const { data } = await supabase.from('departments').select('*')
      setDepartments(data || [])
    }
    getDepartments()
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: fullName,
        department_id: department || null,
        year: parseInt(year),
        updated_at: new Date()
      })
      if (error) throw error
      alert('تم تحديث الملف الشخصي بنجاح')
      fetchProfile(session.user.id)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!session) return <div className="text-center py-20 text-xl">يرجى تسجيل الدخول للوصول لهذه الصفحة</div>

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">الملف الشخصي</h2>
      
      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">القسم</label>
            <select
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">اختر القسم</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الفرقة الدراسية</label>
            <select
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {[1, 2, 3, 4].map(y => (
                <option key={y} value={y}>الفرقة {y}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-secondary flex items-center gap-2"
        >
          <Save size={20} />
          {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </form>
    </div>
  )
}
