import { createFileRoute } from "@tanstack/react-router";
import { Plus, Share2, Calendar as CalendarIcon, Settings as SettingsIcon, ChevronLeft, ChevronRight, CalendarDays, Moon, Sun, Users, EyeOff, Eye } from "lucide-react";
import { useTimelineStore } from "../lib/store";
import { format, addDays, parseISO, startOfDay } from "date-fns";
import { Timeline } from "../components/Timeline";
import { AddEventModal } from "../components/AddEventModal";
import { SharePanel } from "../components/SharePanel";
import { WeekStrip } from "../components/WeekStrip";
import { DailyBrief } from "../components/DailyBrief";
import { useReminders } from "../lib/useReminders";

import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { cn } from "../lib/utils";
import { useTheme } from "../lib/theme";
import { Link } from "@tanstack/react-router";
import { AuthButton } from "../components/AuthButton";


import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { selectedDate, setSelectedDate, brandingName, vipInitials, confidentialMode, setConfidentialMode } = useTimelineStore();
  const currentSelectedDate = parseISO(selectedDate);
  useReminders();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handlePrevDay = () => setSelectedDate(addDays(currentSelectedDate, -1));
  const handleNextDay = () => setSelectedDate(addDays(currentSelectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-12 md:py-16 font-sans selection:bg-accent relative">
      
      
      <div className="absolute top-6 right-4 md:top-10 md:right-12 flex items-center gap-2 md:gap-3 print:hidden z-10">
        <AuthButton />

        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-foreground shadow-sm border border-border hover:bg-accent transition-all"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
        <button
          onClick={() => setConfidentialMode(!confidentialMode)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl shadow-sm border transition-all",
            confidentialMode
              ? "bg-foreground text-background border-foreground"
              : "bg-card text-foreground border-border hover:bg-accent"
          )}
          title={confidentialMode ? 'Disable Confidential Mode' : 'Enable Confidential Mode (blur names)'}
        >
          {confidentialMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <Link 
          to="/contacts"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-foreground shadow-sm border border-border hover:bg-accent transition-all"
          title="Guest Registry"
        >
          <Users className="h-4 w-4" />
        </Link>
        <Link 
          to="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-foreground shadow-sm border border-border hover:bg-accent transition-all"
          title="Settings"
        >
          <SettingsIcon className="h-4 w-4" />
        </Link>
      </div>

      <header className="mx-auto max-w-4xl mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground tracking-tight text-gradient">
            {format(currentSelectedDate, "EEEE, MMMM do")}
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
            Dossier · Confidential Briefings
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 print:hidden w-full md:w-auto">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 px-3 border border-border rounded-xl bg-card text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary transition-all w-full md:w-40 shadow-sm"
          />
          <div className="flex items-center gap-2">
            <div className="flex-1 md:flex-none">
              <DailyBrief />
            </div>
            <div className="flex-1 md:flex-none">
              <SharePanel />
            </div>
            <div className="flex-1 md:flex-none">
              <AddEventModal />
            </div>
          </div>
        </div>

      </header>

      <main className="mx-auto max-w-4xl">
        <WeekStrip />
        <Timeline searchFilter={searchQuery} />
      </main>

      <footer className="mx-auto max-w-4xl mt-32 pb-12 pt-8 border-t border-border flex flex-col md:flex-row gap-6 justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] print:hidden">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span>Dossier &bull; Confidential &bull; &copy; 2026</span>
        </div>
        <div className="flex gap-8">
          <button className="hover:text-[#2D3748] transition-colors">Security</button>
          <button className="hover:text-[#2D3748] transition-colors">Terms</button>
          <button className="hover:text-[#2D3748] transition-colors">Support</button>
        </div>
      </footer>
    </div>
  );
}
