"use client";

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DayCard from '@/components/DayCard';
import Header from '@/components/Header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

export default function Home() {
  const { state, dispatch } = useAppContext();
  const [open, setOpen] = React.useState(false);
  const [newDayName, setNewDayName] = React.useState('');

  const handleAddDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDayName.trim()) {
      dispatch({
        type: 'ADD_DAY',
        payload: {
          name: newDayName.trim(),
          date: new Date().toISOString(),
        },
      });
      setNewDayName('');
      setOpen(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Header title="Days" />
      <div className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Day
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Day</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDay} className="space-y-4">
                <div>
                  <Label htmlFor="day-name">Day Name</Label>
                  <Input
                    id="day-name"
                    value={newDayName}
                    onChange={(e) => setNewDayName(e.target.value)}
                    placeholder={`e.g., ${format(new Date(), 'EEEE')}, Test Session 1`}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Day
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {state.days.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            <p>No days recorded yet.</p>
            <p>Click "Add Day" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {state.days.map((day) => (
              <DayCard key={day.id} day={day} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
