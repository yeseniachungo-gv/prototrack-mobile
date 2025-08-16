"use client";

import React from 'react';
import { Day } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { MoreVertical, Edit, Copy, Trash2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppContext } from '@/contexts/AppContext';
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
} from './ui/alert-dialog';
import Link from 'next/link';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';

interface DayCardProps {
  day: Day;
}

export default function DayCard({ day }: DayCardProps) {
  const { dispatch } = useAppContext();
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(day.name);
  const { toast } = useToast();

  const handleDelete = () => {
    dispatch({ type: 'DELETE_DAY', payload: { dayId: day.id } });
    toast({ title: 'Day Deleted', description: `"${day.name}" has been removed.` });
  };

  const handleClone = () => {
    dispatch({ type: 'CLONE_DAY', payload: { dayId: day.id } });
     toast({ title: 'Day Cloned', description: `A copy of "${day.name}" has been created.` });
  };
  
  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if(name.trim() === day.name || !name.trim()) {
        setIsEditing(false);
        setName(day.name);
        return;
    }
    dispatch({ type: 'UPDATE_DAY', payload: { ...day, name: name.trim() } });
    toast({ title: 'Day Renamed', description: `Day name updated to "${name.trim()}".` });
    setIsEditing(false);
  }

  return (
    <Card className="transition-all hover:shadow-md">
       <CardHeader className="flex flex-row items-center justify-between pb-2">
        {isEditing ? (
            <form onSubmit={handleRename} className="w-full">
                <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleRename}
                    autoFocus
                    className="text-lg font-semibold"
                />
            </form>
        ) : (
             <CardTitle className="text-xl">{day.name}</CardTitle>
        )}
       
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/day/${day.id}`}>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleClone}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Clone</span>
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the day "{day.name}" and all its associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Created on {format(new Date(day.date), 'MMMM d, yyyy')}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {day.functions.length} function(s) recorded.
        </p>
      </CardContent>
    </Card>
  );
}
