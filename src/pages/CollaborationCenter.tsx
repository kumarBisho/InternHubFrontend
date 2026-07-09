import { useEffect } from 'react';
import Header from '../components/Header';
import CollaborationPanel from '../components/CollaborationPanel';
import collaborationService from '../services/collaborationService';
import '../styles/collaboration.css';

export default function CollaborationCenter() {
  useEffect(() => {
    // Initialize collaboration service on component mount
    const initCollaboration = async () => {
      try {
        if (!collaborationService.isConnectedStatus()) {
          await collaborationService.connect();
          console.log('✅ Connected to real-time collaboration');
        }
      } catch (error) {
        console.error('Failed to connect to collaboration service:', error);
      }
    };

    initCollaboration();

    // Update user presence
    const updatePresence = () => {
      collaborationService.updatePresence({
        userId: '', // Will be set from auth context in production
        userName: 'User',
        userEmail: 'user@example.com',
        isOnline: true,
        lastActiveAt: new Date().toISOString(),
        currentPage: 'Collaboration Center',
      });
    };

    updatePresence();

    // Cleanup on unmount
    return () => {
      // Keep connection alive for other components
    };
  }, []);

  return (
    <div className="page-container">
      <Header />
      
      <main className="collaboration-page-main max-w-7xl mx-auto space-y-6">
        {/* <div className="collaboration-page-header">
          <div>
            <h1 className="collaboration-page-title">🤝 Real-time Collaboration Center</h1>
          </div>
        </div> */}

        {/* Main Collaboration Panel */}
        <section className="collaboration-section">
          <CollaborationPanel />
        </section>
      </main>
    </div>
  );
}

<style>{`
  .page-container {
    min-height: 100vh;
    background: #f9fafb;
  }

  .collaboration-page-main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  .collaboration-page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: white;
  }

  .collaboration-page-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 8px 0;
  }

  .collaboration-page-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
  }

  .collaboration-section {
    margin-bottom: 40px;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 20px 0;
  }
`}</style>
