import { HelmetProvider } from 'react-helmet-async';
import { ErrorProvider } from './context/ErrorContext'
import ErrorBoundary from './components/ErrorBoundary'
import ErrorToastContainer from './components/ErrorToastContainer'
import AppRoutes from './routes/AppRoutes'
import './App.css'

function App() {
  return (
    <HelmetProvider>
      <ErrorProvider>
        <ErrorBoundary>
          <AppRoutes />
          <ErrorToastContainer />
        </ErrorBoundary>
      </ErrorProvider>
    </HelmetProvider>
  )
}

export default App
