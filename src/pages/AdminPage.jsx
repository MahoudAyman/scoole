import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Users, 
  BookOpen, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  FileText
} from 'lucide-react'

export default function AdminPage({ profile }) {
  const [activeTab, setActiveTab] = useState('students')
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [departments, setDepartments] = useState([])

  // Forms
  const [newLecture, setNewLecture] = useState({ title: '', department_id: '', year: 1, video_url: '' })
  const [newResult, setNewResult] = useState({ student_id: '', subject: '', score: '', max_score: 100, semester: 1 })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  async function fetchData() {
    setLoading(true)
    const { data: depts } = await supabase.from('departments').select('*')
    setDepartments(depts || [])

    if (activeTab === 'students') {
      const { data } = await supabase.from('students').select('*, departments(name)')
      setStudents(data || [])
    }
    setLoading(false)
  }

  const handleAddLecture = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('lectures').insert([newLecture])
    if (!error) {
      alert('تمت إضافة المحاضرة')
      setNewLecture({ title: '', department_id: '', year: 1, video_url: '' })
    }
  }

  const filteredStudents = students.filter(s => 
    s.full_name.includes(search) || s.national_id.includes(search)
  )

  if (!profile?.is_admin) return <div className="text-center py-20 font-bold text-red-600">غير مسموح لك بالدخول</div>

  return (
    <div className="max-w-6xl mx-auto space-y-8" dir="rtl">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <TrendingUp className="text-primary" /> لوحة تحكم الإدارة
      </h2>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border w-fit overflow-x-auto">
        {[
          { id: 'students', label: 'الطلاب', icon: Users },
          { id: 'lectures', label: 'المحاضرات', icon: BookOpen },
          { id: 'results', label: 'رصد الدرجات', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        {activeTab === 'students' && (
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="بحث بالاسم أو الرقم القومي..."
                  className="w-full pr-10 py-2 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                  <tr>
                    <th className="p-4 border-b">الاسم</th>
                    <th className="p-4 border-b">الرقم القومي</th>
                    <th className="p-4 border-b">القسم</th>
                    <th className="p-4 border-b">الفرقة</th>
                    <th className="p-4 border-b">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold">{student.full_name}</td>
                      <td className="p-4 font-mono">{student.national_id}</td>
                      <td className="p-4">{student.departments?.name}</td>
                      <td className="p-4 text-center">{student.year}</td>
                      <td className="p-4 text-center">
                        {student.is_active ? 
                          <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1 w-fit mx-auto"><CheckCircle size={14}/> نشط</span> : 
                          <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full flex items-center gap-1 w-fit mx-auto"><XCircle size={14}/> معطل</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'lectures' && (
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6">إضافة محاضرة جديدة</h3>
            <form onSubmit={handleAddLecture} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold">العنوان</label>
                <input
                  required
                  className="w-full p-3 border rounded-xl"
                  value={newLecture.title}
                  onChange={e => setNewLecture({...newLecture, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">القسم</label>
                <select
                  required
                  className="w-full p-3 border rounded-xl"
                  value={newLecture.department_id}
                  onChange={e => setNewLecture({...newLecture, department_id: e.target.value})}
                >
                  <option value="">اختر القسم</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">الفرقة</label>
                <select
                  className="w-full p-3 border rounded-xl"
                  value={newLecture.year}
                  onChange={e => setNewLecture({...newLecture, year: e.target.value})}
                >
                  {[1,2,3,4].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">رابط الفيديو (YouTube)</label>
                <input
                  className="w-full p-3 border rounded-xl"
                  value={newLecture.video_url}
                  onChange={e => setNewLecture({...newLecture, video_url: e.target.value})}
                />
              </div>
              <button className="md:col-span-2 bg-primary text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary transition-all">
                <Plus size={20} /> حفظ المحاضرة
              </button>
            </form>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6">رصد درجات الطلاب</h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const { error } = await supabase.from('results').insert([newResult])
              if (!error) alert('تم رصد الدرجة بنجاح')
            }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold">رقم الطالب (القومي)</label>
                <input
                  required
                  placeholder="300XXXXXXXXXXX"
                  className="w-full p-3 border rounded-xl"
                  onChange={async (e) => {
                    const { data } = await supabase.from('students').select('id').eq('national_id', e.target.value).single()
                    if (data) setNewResult({...newResult, student_id: data.id})
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">المادة</label>
                <input
                  required
                  className="w-full p-3 border rounded-xl"
                  value={newResult.subject}
                  onChange={e => setNewResult({...newResult, subject: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">الدرجة</label>
                <input
                  required
                  type="number"
                  className="w-full p-3 border rounded-xl"
                  value={newResult.score}
                  onChange={e => setNewResult({...newResult, score: e.target.value})}
                />
              </div>
              <button className="md:col-span-3 bg-primary text-white p-4 rounded-xl font-bold hover:bg-secondary shadow-lg">
                تأكيد الرصد
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
