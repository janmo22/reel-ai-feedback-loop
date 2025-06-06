
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader, Plus, UserPlus } from 'lucide-react';
import { useCompetitorScraping } from '@/hooks/use-competitor-scraping';

interface AddCompetitorFormProps {
  onCompetitorAdded: () => void;
}

const AddCompetitorForm: React.FC<AddCompetitorFormProps> = ({ onCompetitorAdded }) => {
  const [username, setUsername] = useState('');
  const { isLoading, scrapeCompetitor } = useCompetitorScraping();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) return;

    const result = await scrapeCompetitor(username.trim());
    
    if (result) {
      setUsername('');
      onCompetitorAdded();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Agregar Competidor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username de Instagram</Label>
            <Input
              id="username"
              type="text"
              placeholder="@usuario o usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Introduce el username de Instagram del competidor que quieres analizar
            </p>
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !username.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Extrayendo datos...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Competidor
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddCompetitorForm;
