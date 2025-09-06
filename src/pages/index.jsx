import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { UploadInterface } from '@/components/UploadInterface';
import { LearningMap } from '@/components/LearningMap';
import { QuizInterface } from '@/components/QuizInterface';
import { FlashcardInterface } from '@/components/FlashcardInterface';

const Index = () => {
  const [activeSection, setActiveSection] = useState('documents');

  const renderMainContent = () => {
    switch (activeSection) {
      case 'documents':
      case 'learning-games':
      default:
        return <UploadInterface activeSection={activeSection} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-auto">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default Index;
