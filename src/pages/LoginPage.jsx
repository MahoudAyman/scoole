import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LogIn, Lock, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [nationalId, setNationalId] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // إذا كان هناك توكن، حاول الذهاب للرئيسية
    const token = localStorage.getItem('abbasid_session_token')
    if (token) navigate('/')
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    
    try {
      const { data, error: rpcError } = await supabase.rpc('authenticate_student', {
        p_id: nationalId,
        p_code: studentCode
      })

      if (rpcError) throw rpcError
      
      const result = data && data[0]

      if (!result || !result.r_success) {
        throw new Error('الرقم القومي أو كود الطالب غير صحيح')
      }

      // تخزين التوكن
      localStorage.setItem('abbasid_session_token', result.r_token)
      
      // توجيه للصفحة الرئيسية
      window.location.href = '/'
      
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-10">
          <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">دخول المنصة</h2>
          <p className="text-gray-500 mt-2 font-medium">معهد العباسية للحاسبات</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-shake">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">الرقم القومي</label>
            <input
              type="text"
              required
              maxLength="14"
              placeholder="14 رقم"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none text-center font-mono text-lg transition-all"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">كود الطالب</label>
            <input
              type="password"
              required
              placeholder="أدخل الكود الخاص بك"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none text-center text-lg transition-all"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-secondary hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={20} />
                دخول المنصة
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400 font-medium leading-relaxed">
          في حال فقدان الكود يرجى مراجعة <br /> قسم شؤون الطلاب بالمعهد
        </div>
      </div>
    </div>
  )
}
