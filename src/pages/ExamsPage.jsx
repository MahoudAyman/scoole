import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Timer, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react'

export default function ExamsPage({ profile }) {
  const [exams, setExams] = useState([])
  const [currentExam, setCurrentExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (profile) fetchExams()
  }, [profile])

  async function fetchExams() {
    const { data } = await supabase
      .from('exams')
      .select('*, questions(*)')
      .eq('department_id', profile.department_id)
      .eq('year', profile.year)
    setExams(data || [])
  }

  const handleSubmit = async () => {
    let totalScore = 0
    currentExam.questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_option) totalScore++
    })
    
    const finalScore = Math.round((totalScore / currentExam.questions.length) * 100)
    setScore(finalScore)
    setSubmitted(true)

    await supabase.from('exam_submissions').insert([{
      exam_id: currentExam.id,
      student_id: profile.id,
      score: finalScore
    }])
  }

  if (!profile) return <div className="text-center py-20 font-black text-slate-500 uppercase tracking-widest">Access Restricted - Please Login</div>

  return (
    <div className="space-y-10" dir="rtl">
      {!currentExam ? (
        <>
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-black text-white">الاختبارات الذكية</h2>
            <p className="text-slate-500 font-bold">تحدى نفسك وقيم مستواك الدراسي بانتظام</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(exam => (
              <div key={exam.id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:border-blue-500/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <Timer size={28} />
                  </div>
                  <span className="bg-slate-800 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase">{exam.duration_minutes} MIN</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{exam.title}</h3>
                <p className="text-slate-500 text-sm mb-8 font-medium">{exam.subject} • {exam.questions.length} سؤال</p>
                <button 
                  onClick={() => setCurrentExam(exam)}
                  className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle size={20} /> ابدأ الاختبار
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-between bg-slate-900/80 p-6 rounded-3xl border border-white/5 backdrop-blur-xl sticky top-4 z-10">
            <h3 className="text-xl font-bold">{currentExam.title}</h3>
            {!submitted && (
              <button 
                onClick={handleSubmit}
                className="bg-blue-600 px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-500 shadow-xl shadow-blue-900/20"
              >
                إنهاء وإرسال
              </button>
            )}
          </div>

          {!submitted ? (
            <div className="space-y-6 pb-20">
              {currentExam.questions.map((q, qIdx) => (
                <div key={q.id} className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5">
                  <p className="text-lg font-bold mb-6 text-white flex gap-4">
                    <span className="text-blue-500">#{qIdx + 1}</span>
                    {q.question_text}
                  </p>
                  <div className="grid gap-3">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => setAnswers({...answers, [qIdx]: oIdx})}
                        className={`w-full p-5 rounded-2xl text-right font-bold transition-all border ${
                          answers[qIdx] === oIdx 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                          : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/40 rounded-[3rem] border border-white/5 space-y-6">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${score >= 50 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {score >= 50 ? <CheckCircle2 size={48} /> : <AlertCircle size={48} />}
              </div>
              <h2 className="text-5xl font-black">{score}%</h2>
              <p className="text-slate-500 font-bold">{score >= 50 ? 'عمل رائع! لقد اجتزت الاختبار بنجاح' : 'للأسف لم تجتز الاختبار، حاول مرة أخرى'}</p>
              <button 
                onClick={() => { setCurrentExam(null); setSubmitted(false); setAnswers({}); }}
                className="bg-white text-black px-10 py-4 rounded-2xl font-black mt-8"
              >
                العودة للاختبارات
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
