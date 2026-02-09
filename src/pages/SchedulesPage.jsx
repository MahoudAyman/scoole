import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Calendar as CalendarIcon, Clock, MapPin, Lock } from 'lucide-react'

export default function SchedulesPage({ profile }) {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSchedules() {
      if (!profile) return
      
      let query = supabase.from('schedules').select('*')
      
      if (profile.role !== 'admin') {
        query = query.eq('department_id', profile.department_id).eq('year', profile.year)
      }

      const { data } = await query.order('day')
      setSchedules(data || [])
      setLoading(false)
    }
    fetchSchedules()
  }, [profile])

  if (!profile) {
    return (
      <div className="text-center py-20">
        <Lock size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold">الجدول الدراسي متاح فقط للطلاب المسجلين</h2>
      </div>
    )
  }

  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">الجدول الدراسي</h2>

      {loading ? (
        <div className="text-center py-10">جاري التحميل...</div>
      ) : (
        <div className="space-y-8">
          {days.map(day => {
            const dayLectures = schedules.filter(s => s.day === day)
            if (dayLectures.length === 0) return null

            return (
              <div key={day} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-secondary text-white px-6 py-3 font-bold flex items-center gap-2">
                  <CalendarIcon size={20} />
                  {day}
                </div>
                <div className="divide-y">
                  {dayLectures.map(item => (
                    <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-bold text-primary">{item.subject}</h4>
                        <div className="flex items-center gap-4 mt-2 text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {item.start_time} - {item.end_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={16} />
                            {item.room || 'قاعة غير محددة'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {schedules.length === 0 && (
            <div className="bg-white p-10 rounded-xl text-center text-gray-500">
              لا يوجد جدول معلن حالياً لقسمك وفرقتك
            </div>
          )}
        </div>
      )}
    </div>
  )
}
