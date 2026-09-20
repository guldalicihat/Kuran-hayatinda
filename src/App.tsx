import { Navigate, Route, Routes } from 'react-router-dom'
import TabBar from './components/TabBar'
import SurahList from './pages/SurahList'
import SurahPage from './pages/SurahPage'
import AyahPage from './pages/AyahPage'
import CommunityPage from './pages/CommunityPage'
import AskPage from './pages/AskPage'
import FavoritesPage from './pages/FavoritesPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <div className="mx-auto max-w-[560px] md:max-w-[700px] lg:max-w-[860px] min-h-screen relative">
      <Routes>
        <Route path="/" element={<SurahList />} />
        <Route path="/sure/:n" element={<SurahPage />} />
        <Route path="/sure/:n/:a" element={<AyahPage />} />
        <Route path="/ara" element={<Navigate to="/sor" replace />} />
        <Route path="/topluluk" element={<CommunityPage />} />
        <Route path="/sor" element={<AskPage />} />
        <Route path="/favorilerim" element={<FavoritesPage />} />
        <Route path="/ayarlar" element={<SettingsPage />} />
      </Routes>
      <TabBar />
    </div>
  )
}
