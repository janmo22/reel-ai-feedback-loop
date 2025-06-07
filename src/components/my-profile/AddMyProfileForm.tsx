
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Plus } from 'lucide-react';
import { useMyProfileScraping } from '@/hooks/use-my-profile-scraping';

interface AddMyProfileFormProps {
  onProfileAdded: () => void;
}

const AddMyProfileForm: React.FC<AddMyProfileFormProps> = ({ onProfileAdded }) => {
  const [username, setUsername] = useState('');
  const { scrapeProfile, isLoading } = useMyProfileScraping();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) return;

    const result = await scrapeProfile(username.trim());
    if (result) {
      setUsername('');
      onProfileAdded();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-green-500" />
          Agregar Mi Perfil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username de Instagram</Label>
            <Input
              id="username"
              type="text"
              placeholder="Ej: tu_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Introduce tu username sin el símbolo @
            </p>
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !username.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Extrayendo datos...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Perfil
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddMyProfileForm;
