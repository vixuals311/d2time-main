import { useState } from "react";
import { Plus } from "lucide-react";
import { parse, format, isBefore, isAfter, startOfMinute, addMinutes, parseISO, startOfDay } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useTimelineStore, EventType } from "../lib/store";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import { cn } from "@/lib/utils";

export function AddEventModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { 
    events: allEvents, 
    addEvent, 
    addEventsBulk,
    bufferMinutes, 
    workingHours, 
    durationOptions, 
    selectedDate,
    contacts,
    customCategories
  } = useTimelineStore();
  const events = allEvents.filter(e => startOfDay(parseISO(e.startTime)).toISOString() === selectedDate);

  const initialDate = () => {
    const now = new Date();
    const currentSelected = parseISO(selectedDate);
    if (startOfDay(currentSelected) > startOfDay(now)) {
      return parse(`${format(currentSelected, "yyyy-MM-dd")} ${workingHours.start}`, "yyyy-MM-dd HH:mm", new Date());
    }
    return startOfMinute(now);
  };

  const [formData, setFormData] = useState<{
    title: string;
    startDate: Date;
    durationMinutes: number;
    type: string;
    location: string;
    description: string;
    attendees: string;
    recurrence: "none" | "daily" | "weekly";
    priority: 'urgent' | 'important' | 'normal';
  }>({
    title: "",
    startDate: initialDate(),
    durationMinutes: 30,
    type: "meeting",
    location: "",
    description: "",
    attendees: "",
    recurrence: "none",
    priority: "normal",
  });

  const [showSuggestions, setShowSuggestions] = useState(false);

  const TEMPLATES = [
    { label: "Board Meeting", type: "meeting", duration: 120, location: "Boardroom", description: "Quarterly board review and strategic alignment.", priority: "urgent" as const },
    { label: "Site Visit", type: "visit", duration: 90, location: "Site Office", description: "Inspect site progress and meet the project team.", priority: "important" as const },
    { label: "Investor Call", type: "meeting", duration: 60, location: "Virtual Zoom", description: "Update investors on KPIs and pipeline.", priority: "urgent" as const },
    { label: "Standup", type: "meeting", duration: 15, location: "Conference Room A", description: "Daily team standup.", priority: "normal" as const },
    { label: "VIP Guest", type: "guest", duration: 60, location: "Lobby A", description: "Welcome VIP guest and escort to meeting room.", priority: "urgent" as const },
    { label: "Lunch Break", type: "break", duration: 60, location: "Café 24", description: "", priority: "normal" as const },
  ];

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      title: t.label,
      type: t.type,
      durationMinutes: t.duration,
      location: t.location,
      description: t.description,
      priority: t.priority,
    }));
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setFormData(prev => ({ 
        ...prev, 
        startDate: initialDate(),
        title: "",
        description: "",
        attendees: "",
        location: "",
        recurrence: "none"
      }));
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Please enter a title");
      return;
    }

    const eventStart = formData.startDate;
    const eventEnd = new Date(eventStart.getTime() + formData.durationMinutes * 60000);
    
    const baseDate = format(eventStart, "yyyy-MM-dd");
    const dayStart = parse(`${baseDate} ${workingHours.start}`, "yyyy-MM-dd HH:mm", new Date());
    const dayEnd = parse(`${baseDate} ${workingHours.end}`, "yyyy-MM-dd HH:mm", new Date());

    if (eventStart < dayStart || eventEnd > dayEnd) {
      toast.error(`Event must be within working hours (${workingHours.start} - ${workingHours.end})`);
      return;
    }

    const isEventDateTodayOrPast = startOfDay(eventStart).getTime() <= startOfDay(new Date()).getTime();
    if (isEventDateTodayOrPast && isBefore(eventStart, startOfMinute(new Date()))) {
      toast.error("Cannot schedule events in the past");
      return;
    }

    const attendeeList = formData.attendees
      ? formData.attendees.split(",").map(name => name.trim()).filter(Boolean)
      : [];

    const baseEventData = {
      title: formData.title,
      durationMinutes: Number(formData.durationMinutes),
      type: formData.type,
      location: formData.location,
      description: formData.description,
      attendees: attendeeList,
      priority: formData.priority,
    };

    let success = false;

    if (formData.recurrence === "none") {
      success = addEvent({
        ...baseEventData,
        startTime: eventStart.toISOString(),
      });
    } else {
      // Handle recurring generation bulk additions (4 occurrences)
      const recurrenceEvents = [];
      for (let i = 0; i < 4; i++) {
        const occurrencesOffset = formData.recurrence === "daily" ? i : i * 7;
        const offsetDate = addDays(eventStart, occurrencesOffset);
        recurrenceEvents.push({
          ...baseEventData,
          startTime: offsetDate.toISOString(),
        });
      }
      success = addEventsBulk(recurrenceEvents);
    }

    if (success) {
      toast.success(formData.recurrence === "none" ? "Event added to timeline" : `Recurring event created (4 occurrences)`);
      setOpen(false);
      setFormData({
        title: "",
        startDate: new Date(),
        durationMinutes: 30,
        type: "meeting",
        location: "",
        description: "",
        attendees: "",
        recurrence: "none",
        priority: "normal",
      });
    } else {
      toast.error("Time clash detected in one or more slots! Please choose a different time.");
    }
  };

  const filterPassedTime = (time: Date) => {
    const baseDate = format(formData.startDate, "yyyy-MM-dd");
    const dayStart = parse(`${baseDate} ${workingHours.start}`, "yyyy-MM-dd HH:mm", new Date());
    const dayEnd = parse(`${baseDate} ${workingHours.end}`, "yyyy-MM-dd HH:mm", new Date());
    const now = new Date();
    
    const isWithinWorkingHours = (isAfter(time, dayStart) || time.getTime() === dayStart.getTime()) && 
                                (isBefore(time, dayEnd) || time.getTime() === dayEnd.getTime());
    
    const isEventDateTodayOrPast = startOfDay(formData.startDate).getTime() <= startOfDay(now).getTime();
    const isFuture = !isEventDateTodayOrPast || isAfter(time, startOfMinute(now)) || time.getTime() === startOfMinute(now).getTime();

    const hasClash = events.some((e) => {
      const eStart = parseISO(e.startTime);
      const eEndWithBuffer = addMinutes(eStart, e.durationMinutes + bufferMinutes);
      return (isAfter(time, eStart) || time.getTime() === eStart.getTime()) && isBefore(time, eEndWithBuffer);
    });

    return isWithinWorkingHours && isFuture && !hasClash;
  };

  const getAvailableDuration = (duration: number) => {
    const eventStart = formData.startDate;
    const eventEnd = new Date(eventStart.getTime() + (duration + bufferMinutes) * 60000);
    
    const hasClash = events.some((e) => {
      const eStart = parseISO(e.startTime);
      const eEndWithBuffer = addMinutes(eStart, e.durationMinutes + bufferMinutes);
      return isBefore(eventStart, eEndWithBuffer) && isAfter(eventEnd, eStart);
    });

    if (hasClash) return false;

    const nextEvent = events.find(e => isAfter(parseISO(e.startTime), eventStart));
    if (nextEvent) {
      const nextStart = parseISO(nextEvent.startTime);
      if (isAfter(eventEnd, nextStart)) return false;
    }

    const baseDate = format(eventStart, "yyyy-MM-dd");
    const dayEnd = parse(`${baseDate} ${workingHours.end}`, "yyyy-MM-dd HH:mm", new Date());
    if (isAfter(eventEnd, dayEnd)) return false;

    return true;
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    
    setFormData(prev => {
      const newDuration = getAvailableDuration(prev.durationMinutes) ? prev.durationMinutes : 15;
      return { ...prev, startDate: date, durationMinutes: newDuration };
    });
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger !== undefined ? (
          trigger
        ) : (
          <button className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-[#2D3748] px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-[#1A202C] transition-all">
            <Plus className="h-4 w-4" /> <span className="md:inline">Add Event</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Templates */}
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Templates</label>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATES.map(t => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="px-3 py-1 rounded-lg text-xs font-medium border border-border bg-card hover:bg-accent transition-all"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="Meeting with CEO..."
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <div className="relative">
                  <DatePicker
                    selected={formData.startDate}
                    onChange={handleDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    filterTime={filterPassedTime}
                    minDate={new Date()}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  * Only future hours between {workingHours.start} and {workingHours.end} are selectable.
                </p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Duration</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {durationOptions.map((opt) => {
                    const isAvailable = getAvailableDuration(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setFormData(prev => ({ ...prev, durationMinutes: opt }))}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-medium border transition-all",
                          formData.durationMinutes === opt 
                            ? "bg-[#2D3748] text-white border-[#2D3748]" 
                            : isAvailable
                              ? "bg-white text-[#4A5568] border-[#EDF2F7] hover:bg-[#F7FAFC]"
                              : "bg-[#F7FAFC] text-[#CBD5E0] border-[#EDF2F7] cursor-not-allowed opacity-50"
                        )}
                      >
                        {opt >= 60 ? `${opt/60}h` : `${opt}m`}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        durationMinutes: Number(e.target.value),
                      }))
                    }
                    className="h-9 w-24 rounded-xl"
                  />
                  <span className="text-xs text-muted-foreground">custom min</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Main Hall"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Event Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v: string) =>
                    setFormData((prev) => ({ ...prev, type: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="visit">Visit</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                    {customCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.label}>
                        {cat.label.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="recurrence">Recurrence</Label>
                <Select
                  value={formData.recurrence}
                  onValueChange={(v: "none" | "daily" | "weekly") =>
                    setFormData((prev) => ({ ...prev, recurrence: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="daily">Daily (Next 4 days)</SelectItem>
                    <SelectItem value="weekly">Weekly (Next 4 weeks)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Priority</Label>
                <div className="flex gap-1.5">
                  {(['normal', 'important', 'urgent'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                      className={cn(
                        "flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold border capitalize transition-all",
                        formData.priority === p
                          ? p === 'urgent' ? 'bg-red-500 text-white border-red-500'
                            : p === 'important' ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-foreground text-background border-foreground'
                          : 'bg-card text-muted-foreground border-border hover:bg-accent'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-2 relative">
              <Label htmlFor="attendees">Attendees</Label>
              <Input
                id="attendees"
                placeholder="Jane Doe, John Smith (comma-separated)"
                value={formData.attendees}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, attendees: e.target.value }));
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
              <Label htmlFor="description">Notes / Description</Label>
              <Input
                id="description"
                placeholder="Key talking points..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <p className="text-xs text-muted-foreground italic">
              * A {bufferMinutes}m buffer will be visually added after this event.
            </p>
          </div>
          <DialogFooter>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#2D3748] px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-[#1A202C] transition-all"
            >
              Add to Schedule
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
