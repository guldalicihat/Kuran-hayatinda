import { Route, Routes } from 'react-router-dom'
import TabBar from './components/TabBar'
import SurahList from './pages/SurahList'
import SurahPage from './pages/SurahPage'
import AyahPage from './pages/AyahPage'
import SearchPage from './pages/SearchPage'
import TagsPage from './pages/TagsPage'
import NotesPage from './pages/NotesPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <div className="mx-auto max-w-[560px] min-h-screen relative">
      <Routes>
        <Route path="/" element={<SurahList />} />
        <Route path="/sure/:n" element={<SurahPage />} />
        <Route path="/sure/:n/:a" element={<AyahPage />} />
        <Route path="/ara" element={<SearchPage />} />
        <Route path="/etiketler" element={<TagsPage />} />
        <Route path="/notlar" element={<NotesPage />} />
        <Route path="/ayarlar" element={<SettingsPage />} />
      </Routes>
      <TabBar />
    </div>
  )
}
