import { Link, Route, Routes } from 'react-router'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { SiteHeader } from './components/SiteHeader'
import { AdminPage } from './pages/AdminPage'
import { CatalogPage } from './pages/CatalogPage'
import { LoginPage } from './pages/LoginPage'
import { RecipeDetailPage } from './pages/RecipeDetailPage'
import { RecipeCreatePage, RecipeEditPage } from './pages/RecipeFormPage'
import './App.css'

function App() {
  return (
    <>
      <SiteHeader />

      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Everything nested here requires an admin session (see ProtectedRoute). */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/recipes/new" element={<RecipeCreatePage />} />
            <Route path="/admin/recipes/:id/edit" element={<RecipeEditPage />} />
          </Route>

          <Route
            path="*"
            element={
              <p className="message">
                Page not found. <Link to="/">Back to the catalog</Link>
              </p>
            }
          />
        </Routes>
      </main>
    </>
  )
}

export default App
