"use client";

import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { KeyRound, Trash2 } from 'lucide-react';

// A simple mock for theme toggling
const useTheme = () => {
    const [theme, setTheme] = React.useState('light');
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        setTheme(newTheme);
    }
    
    React.useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');
    }, [])
    
    return { theme, toggleTheme };
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const handleClearData = () => {
    localStorage.removeItem('protoTrackState');
    toast({
      title: 'Data Cleared',
      description: 'All local application data has been removed. Please refresh the page.',
    });
  };
  
  const handleComingSoon = () => {
      toast({ title: "Feature Coming Soon!", description: "This setting is not yet available." });
  }

  return (
    <div className="p-4 md:p-6">
      <Header title="Settings" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-base">
                Dark Mode
              </Label>
              <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Profiles</CardTitle>
             <CardDescription>Multi-user profiles with optional PINs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleComingSoon} className="w-full">Manage Profiles</Button>
             <div className="mt-4">
                <Label htmlFor="admin-pin">Admin Area</Label>
                <div className="flex items-center gap-2 mt-1">
                    <Input id="admin-pin" type="password" placeholder="Enter admin PIN" />
                    <Button variant="secondary" size="icon"><KeyRound className="h-4 w-4" /></Button>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" /> Clear All Local Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all days, functions, and records from your device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData} className="bg-destructive hover:bg-destructive/90">
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
