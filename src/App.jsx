import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Trophy, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react'

// Pages
import HomePage from './pages/HomePage'
import LecturesPage from './pages/LecturesPage'
import SchedulesPage from './pages/SchedulesPage'
import ResultsPage from './pages/ResultsPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    const token = localStorage.getItem('abbasid_session_token')
    if (!token) { 
      setLoading(false); 
      return; 
    }
    
    try {
      const { data, error } = await supabase.rpc('verify_session', { p_token: token })
      
      if (error) {
        console.error('Session verification error:', error)
        localStorage.removeItem('abbasid_session_token')
      } else if (data && data.length > 0) {
        const res = data[0]
        setProfile({
          id: res.r_id,
          full_name: res.r_name,
          role: res.r_role,
          is_admin: res.r_admin,
          department_id: res.r_dept,
          year: res.r_year
        })
      } else {
        // Token invalid or expired
        localStorage.removeItem('abbasid_session_token')
      }
    } catch (err) { 
      console.error('System error:', err) 
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('abbasid_session_token')
    setProfile(null)
    navigate('/login')
  }

  if (loading) return <div className="h-screen flex items-center justify-center text-primary font-bold">جاري تحميل المنصة...</div>

  const NavLink = ({ to, icon: Icon, children }) => {
    const active = location.pathname === to
    return (
      <Link 
        to={to} 
        onClick={() => setIsMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          active ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Icon size={20} />
        <span className="font-bold">{children}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white border-l hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <BookOpen size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">منصة العباسية</h1>
        </div>

        <nav className="space-y-1 flex-grow">
          <NavLink to="/" icon={Home}>الرئيسية</NavLink>
          <NavLink to="/lectures" icon={BookOpen}>المحاضرات</NavLink>
          <NavLink to="/schedules" icon={Calendar}>الجدول الدراسي</NavLink>
          <NavLink to="/results" icon={Trophy}>النتائج</NavLink>
        </nav>

        <div className="mt-auto border-t pt-4">
          {profile ? (
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-bold text-gray-800 truncate">{profile.full_name}</p>
                <p className="text-xs text-gray-500 mt-1">طالب بمعهد العباسية</p>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 p-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all">
                <LogOut size={18} /> خروج
              </button>
            </div>
          ) : (
            <Link to="/login" className="w-full bg-primary text-white py-3 rounded-xl font-bold block text-center">دخول</Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between lg:justify-end sticky top-0 z-30">
          <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 bg-gray-100 rounded-lg"><Menu /></button>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
              {profile ? profile.full_name[0] : '?'}
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8 max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<HomePage profile={profile} />} />
            <Route path="/lectures" element={<LecturesPage profile={profile} />} />
            <Route path="/schedules" element={<SchedulesPage profile={profile} />} />
            <Route path="/results" element={<ResultsPage profile={profile} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage profile={profile} />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-64 bg-white p-6 shadow-xl animate-slide-left">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg">القائمة</span>
              <button onClick={() => setIsMenuOpen(false)}><X /></button>
            </div>
            <nav className="space-y-2">
              <NavLink to="/" icon={Home}>الرئيسية</NavLink>
              <NavLink to="/lectures" icon={BookOpen}>المحاضرات</NavLink>
              <NavLink to="/schedules" icon={Calendar}>الجدول</NavLink>
              <NavLink to="/results" icon={Trophy}>النتائج</NavLink>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
