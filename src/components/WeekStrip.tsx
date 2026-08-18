import { format, startOfWeek, addDays, isSameDay, parseISO, subWeeks, addWeeks } from "date-fns";
import { useTimelineStore } from "../lib/store";
import { cn } from "../lib/utils";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

export function WeekStrip() {
  const { selectedDate, setSelectedDate, events, brandingName, vipInitials } = useTimelineStore();
  const currentSelectedDate = parseISO(selectedDate);
  const startOfCurrentWeek = startOfWeek(currentSelectedDate, { weekStartsOn: 1 }); // Start week on Monday

  // Generate 7 days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

  // Count events for each day to render density indicators
  const getEventCountForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter(e => {
      const eDateStr = format(parseISO(e.startTime), "yyyy-MM-dd");
      return eDateStr === dateStr;
    }).length;
  };

  const handlePrevWeek = () => {
    setSelectedDate(subWeeks(currentSelectedDate, 1));
  };

  const handleNextWeek = () => {
    setSelectedDate(addWeeks(currentSelectedDate, 1));
  };

  return (
    <div className="w-full bg-card border border-border rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-sm mb-6 print:hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 px-1">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-md shadow-primary/10">
            {vipInitials || "VP"}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block leading-none mb-1">
              {brandingName || "Executive Suite"}
            </span>
            <span className="text-[11px] font-bold text-foreground/80">
              {format(currentSelectedDate, "MMMM yyyy")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center border border-border rounded-lg bg-card overflow-hidden shadow-sm mr-1">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-accent text-muted-foreground transition-colors border-r border-border"
              title="Previous Week"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-accent text-muted-foreground transition-colors"
              title="Next Week"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-foreground hover:bg-accent rounded-lg border border-border transition-colors flex items-center gap-1.5"
              >
                <CalendarDays className="h-3 w-3" />
                Pick Date
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={currentSelectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <button 
            onClick={() => setSelectedDate(new Date())}
            className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-secondary text-primary hover:bg-accent border border-transparent transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, currentSelectedDate);
          const isToday = isSameDay(day, new Date());
          const eventCount = getEventCountForDay(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex flex-col items-center justify-between py-2 rounded-xl transition-all duration-300 group relative",
                isSelected 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" 
                  : isToday
                    ? "bg-accent/40 text-primary border border-primary/20 hover:bg-accent"
                    : "hover:bg-accent/50 text-foreground"
              )}
            >
              <span className="text-[8px] font-bold uppercase tracking-wider opacity-60">
                {format(day, "eee")}
              </span>
              <span className="text-xs font-semibold tracking-tight mt-0.5">
                {format(day, "d")}
              </span>
              
              {/* Event count indicators */}
              <div className="flex gap-0.5 justify-center h-1 mt-1 w-full">
                {eventCount > 0 && (
                  <span className={cn(
                    "h-1 w-1 rounded-full",
                    isSelected ? "bg-primary-foreground" : "bg-primary"
                  )} />
                )}
                {eventCount > 2 && (
                  <span className={cn(
                    "h-1 w-1 rounded-full",
                    isSelected ? "bg-primary-foreground" : "bg-primary"
                  )} />
                )}
                {eventCount > 4 && (
                  <span className={cn(
                    "h-1 w-1 rounded-full",
                    isSelected ? "bg-primary-foreground animate-pulse" : "bg-primary animate-pulse"
                  )} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
