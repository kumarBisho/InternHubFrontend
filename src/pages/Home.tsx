import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../hooks/usePageTitle';
import authService from '../services/authService';
import Header from '../components/Header';
import Projects from './Projects';
import Manager from './Manager';

export default function Home() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  if (!user) {
    navigate('/login');
    return null;
  }

  // Handle different role formats (string or number)
  const userRole = String(user.role).toLowerCase();

  return (
    <>
      <SEOHead
        title="Dashboard - InternHub"
        description="Your InternHub dashboard for managing internships and projects"
        keywords={['dashboard', 'internship', 'management']}
      />
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />

        {/* Role-specific content */}
        <div className="flex-1">
          {(userRole === '2' || userRole === 'manager') ? (
            <Manager />
          ) : (
            <Projects />
          )}
        </div>
      </div>
    </>
  );
}
