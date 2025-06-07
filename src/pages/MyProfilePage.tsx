
import React, { useEffect, useState } from 'react';
import { useMyProfileScraping, MyProfileData } from '@/hooks/use-my-profile-scraping';
import AddMyProfileForm from '@/components/my-profile/AddMyProfileForm';
import MyProfileCard from '@/components/my-profile/MyProfileCard';
import MyProfileVideoGrid from '@/components/my-profile/MyProfileVideoGrid';
import { User, Target } from 'lucide-react';

const MyProfilePage: React.FC = () => {
  const { profiles, fetchProfiles, deleteProfile } = useMyProfileScraping();
  const [selectedProfile, setSelectedProfile] = useState<MyProfileData | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleProfileAdded = () => {
    fetchProfiles();
  };

  const handleViewVideos = (profile: MyProfileData) => {
    setSelectedProfile(profile);
  };

  const handleBackToList = () => {
    setSelectedProfile(null);
    fetchProfiles(); // Refresh data when going back
  };

  if (selectedProfile) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <MyProfileVideoGrid 
          profile={selectedProfile} 
          onBack={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-8 w-8 text-flow-electric" />
          <h1 className="text-3xl font-bold">Mi Perfil de Instagram</h1>
        </div>
        <p className="text-muted-foreground">
          Analiza tu propio contenido para mejorar tu estrategia y rendimiento
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <AddMyProfileForm onProfileAdded={handleProfileAdded} />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">¿Cómo funciona?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Agrega tu username de Instagram</li>
              <li>• Extraemos automáticamente tus últimos reels y datos del perfil</li>
              <li>• Analiza qué contenido funciona mejor</li>
              <li>• Obtén insights para mejorar tu estrategia</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Mis Perfiles ({profiles.length})
        </h2>
      </div>

      {profiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <MyProfileCard
              key={profile.id}
              profile={profile}
              onDelete={deleteProfile}
              onViewVideos={handleViewVideos}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay perfiles</h3>
          <p className="text-gray-500">Agrega tu perfil de Instagram para comenzar el análisis</p>
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;
