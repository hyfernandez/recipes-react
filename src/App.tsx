import { Link, Route, Routes } from 'react-router'
import { CatalogPage } from './pages/CatalogPage'
import './App.css'

function App() {
  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand">
          Recipes
        </Link>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
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
