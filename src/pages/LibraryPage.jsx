import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Library, Download, Search, FileText } from 'lucide-react'

export default function LibraryPage() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchBooks()
  }, [])

  async function fetchBooks() {
    const { data } = await supabase.from('library').select('*')
    setBooks(data || [])
  }

  const filteredBooks = books.filter(b => b.title.includes(search) || b.category.includes(search))

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">المكتبة الرقمية</h2>
        <div className="relative w-72">
          <Search className="absolute right-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="بحث عن كتاب..."
            className="w-full pr-10 py-2 border rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.map(book => (
          <div key={book.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border dark:border-gray-800 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-primary mb-4">
              <FileText size={32} />
            </div>
            <h3 className="font-bold text-lg mb-1">{book.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{book.category}</p>
            <a 
              href={book.file_url} 
              target="_blank" 
              className="mt-auto w-full flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-primary hover:text-white transition-all font-bold"
            >
              <Download size={18} /> تحميل الكتاب
            </a>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed dark:border-gray-800">
          <Library size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">لا توجد كتب مضافة في المكتبة حالياً</p>
        </div>
      )}
    </div>
  )
}
