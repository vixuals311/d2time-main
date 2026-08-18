import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTimelineStore, TimelineEvent } from "../lib/store";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import { parseISO, addMinutes } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface Props {
  event: TimelineEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEventModal({ event, open, onOpenChange }: Props) {
  const parseDateSafely = (timeVal: string | Date) => {
    if (timeVal instanceof Date) return timeVal;
    try {
      return parseISO(timeVal);
    } catch {
      return new Date(timeVal);
    }
  };

  const [formData, setFormData] = useState({
    title: event.title,
    startDate: parseDateSafely(event.startTime),
    durationMinutes: event.durationMinutes,
    location: event.location || "",
    attendees: event.attendees ? event.attendees.join(", ") : "",
    description: event.description || "",
    type: event.type,
  });
  const [showClashDialog, setShowClashDialog] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        title: event.title,
        startDate: parseDateSafely(event.startTime),
        durationMinutes: event.durationMinutes,
        location: event.location || "",
        attendees: event.attendees ? event.attendees.join(", ") : "",
        description: event.description || "",
        type: event.type,
      });
    }
  }, [open, event]);

  const { updateEvent, bufferMinutes, events, contacts, customCategories } = useTimelineStore();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e?: React.FormEvent, force = false) => {
    e?.preventDefault();
    
    // Manual check for clash to show dialog if not force
    if (!force) {
      const updatedStart = formData.startDate;
      const updatedEnd = addMinutes(updatedStart, formData.durationMinutes + bufferMinutes);
      
      const hasClash = events.filter(e => e.id !== event.id).some(e => {
        const eStart = parseISO(e.startTime);
        const eEnd = addMinutes(eStart, e.durationMinutes + bufferMinutes);
        return updatedStart < eEnd && updatedEnd > eStart;
      });
      
      if (hasClash) {
        setShowClashDialog(true);
        return;
      }
    }

    const attendeeList = formData.attendees
      ? formData.attendees.split(",").map(name => name.trim()).filter(Boolean)
      : [];

    const success = updateEvent(event.id, {
      title: formData.title,
      startTime: formData.startDate.toISOString(),
      durationMinutes: formData.durationMinutes,
      location: formData.location,
      attendees: attendeeList,
      description: formData.description,
      type: formData.type,
    }, force);

    if (success) {
      toast.success(force ? "Schedule shifted and updated" : "Event updated");
      onOpenChange(false);
      setShowClashDialog(false);
    } else {
      toast.error("Could not update event");
    }
  };

  const getAttendeeSuggestions = () => {
    const parts = formData.attendees.split(",");
    const typingName = parts[parts.length - 1]?.trim().toLowerCase();
    if (!typingName) return [];
    return contacts.filter(c => c.name.toLowerCase().includes(typingName));
  };

  const selectSuggestion = (name: string) => {
    const parts = formData.attendees.split(",");
    parts[parts.length - 1] = ` ${name}`;
    setFormData(prev => ({
      ...prev,
      attendees: parts.join(",").trim() + ", "
    }));
    setShowSuggestions(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={(e) => handleSubmit(e)}>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(d: Date | null) => d && setFormData((p) => ({ ...p, startDate: d }))}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-duration">Duration (min)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData((p) => ({ ...p, durationMinutes: Number(e.target.value) }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Event Type</Label>
                  <select
                    id="edit-type"
                    value={formData.type}
                    onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="visit">Visit</option>
                    <option value="guest">Guest</option>
                    <option value="break">Break</option>
                    <option value="unavailable">Unavailable</option>
                    {customCategories.map((cat) => (
                      <option key={cat.id} value={cat.label}>
                        {cat.label.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-2 relative">
                <Label htmlFor="edit-attendees">Attendees</Label>
                <Input
                  id="edit-attendees"
                  placeholder="Jane Doe, John Smith (comma-separated)"
                  value={formData.attendees}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, attendees: e.target.value }));
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && getAttendeeSuggestions().length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-16 bg-card border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto p-1 space-y-1">
                    {getAttendeeSuggestions().map(contact => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => selectSuggestion(contact.name)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-secondary rounded-lg transition-colors flex justify-between"
                      >
                        <span className="font-semibold">{contact.name}</span>
                        <span className="text-[10px] text-muted-foreground">{contact.company || ""}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Notes / Description</Label>
                <Input
                  id="edit-description"
                  placeholder="Key talking points..."
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#2D3748] px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-[#1A202C] transition-all"
              >
                Save Changes
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showClashDialog} onOpenChange={setShowClashDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time Clash Detected</AlertDialogTitle>
            <AlertDialogDescription>
              This change overlaps with the next event. Would you like to forcefully push all subsequent events forward to accommodate this change?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSubmit(undefined, true)}>
              Force Shift Events
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
