
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Upload, 
  History, 
  Settings, 
  Target,
  Users,
  User,
  ChevronDown,
  ChevronRight,
  Video,
  Search,
  PenTool,
  FileVideo,
  Play
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { 
    name: 'Zona del Creador', 
    icon: PenTool,
    subItems: [
      { name: 'Estrategia de contenido', href: '/strategy', icon: Target },
      { name: 'Videos', href: '/videos', icon: FileVideo },
      { name: 'Subir Video', href: '/upload', icon: Upload },
      { name: 'Historial', href: '/history', icon: History },
    ]
  },
  { 
    name: 'Zona de Investigar', 
    icon: Search,
    subItems: [
      { name: 'Competencia', href: '/competitors', icon: Users },
      { name: 'Mi Perfil', href: '/my-profile', icon: User },
    ]
  },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['Zona del Creador']);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <img
            className="h-8 w-auto"
            src="/lovable-uploads/3c9a72c2-c7cb-434b-a53c-191e56b8a161.png"
            alt="FLOW"
          />
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={cn(
                        'group flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon
                          className="mr-3 flex-shrink-0 h-5 w-5"
                          aria-hidden="true"
                        />
                        {item.name}
                      </div>
                      {expandedItems.includes(item.name) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedItems.includes(item.name) && (
                      <div className="ml-8 space-y-1">
                        {item.subItems.map((subItem) => (
                          <NavLink
                            key={subItem.name}
                            to={subItem.href}
                            className={({ isActive }) =>
                              cn(
                                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                                isActive
                                  ? 'bg-flow-blue text-white'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              )
                            }
                          >
                            <subItem.icon
                              className="mr-3 flex-shrink-0 h-4 w-4"
                              aria-hidden="true"
                            />
                            {subItem.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-flow-blue text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )
                    }
                  >
                    <item.icon
                      className="mr-3 flex-shrink-0 h-5 w-5"
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
