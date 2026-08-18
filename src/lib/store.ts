import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addMinutes, isBefore, isAfter, parseISO, startOfDay } from 'date-fns';

export interface Contact {
  id: string;
  name: string;
  company?: string;
  title?: string;
}

export interface CustomCategory {
  id: string;
  label: string;
  color: string; // 'blue', 'green', 'purple', 'rose', 'amber', 'emerald', 'indigo'
}

export interface TimelineEvent {
  id: string;
  title: string;
  startTime: string; // ISO string
  durationMinutes: number;
  type: EventType | string;
  description?: string;
  location?: string;
  attendees?: string[];
  sharedWith?: string[];
  outcome?: string; // post-event notes
  priority?: 'urgent' | 'important' | 'normal'; // priority flag
}

export interface WorkingHours {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface Profile {
  name: string;
  position: string;
  company: string;
}

interface TimelineState {
  events: TimelineEvent[];
  selectedDate: string; // ISO date string (start of day)
  bufferMinutes: number;
  workingHours: WorkingHours;
  durationOptions: number[];
  profile: Profile;
  
  // Customization & Utilities
  brandingName: string;
  vipInitials: string;
  themeAccent: string; // 'charcoal' | 'navy' | 'emerald' | 'burgundy' | 'amber'
  customCategories: CustomCategory[];
  contacts: Contact[];
  confidentialMode: boolean;

  addEvent: (event: Omit<TimelineEvent, 'id'>) => boolean;
  addEventsBulk: (events: Omit<TimelineEvent, 'id'>[]) => boolean;
  updateEvent: (id: string, updates: Partial<TimelineEvent>, forceShift?: boolean) => boolean;
  removeEvent: (id: string) => void;
  setBufferMinutes: (minutes: number) => void;
  setEvents: (events: TimelineEvent[]) => void;
  setWorkingHours: (hours: WorkingHours) => void;
  setDurationOptions: (options: number[]) => void;
  setSelectedDate: (date: Date) => void;
  setProfile: (profile: Profile) => void;
  populateRandomData: () => void;

  // Customization & Utilities Setters
  setBrandingName: (name: string) => void;
  setVipInitials: (initials: string) => void;
  setThemeAccent: (accent: string) => void;
  setCustomCategories: (categories: CustomCategory[]) => void;
  setContacts: (contacts: Contact[]) => void;
  setConfidentialMode: (on: boolean) => void;
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set) => ({
      events: [],
      selectedDate: startOfDay(new Date()).toISOString(),
      bufferMinutes: 15,
      workingHours: { start: '09:00', end: '18:00' },
      durationOptions: [15, 30, 60, 120],
      profile: { name: '', position: '', company: '' },

      // Initializing customization & utilities
      brandingName: 'Executive Suite',
      vipInitials: 'VP',
      themeAccent: 'charcoal',
      customCategories: [],
      contacts: [],
      confidentialMode: false,

      addEvent: (event) => {
        let success = true;
        set((state) => {
          const newEvent = { ...event, id: crypto.randomUUID() };
          
          // Check for clashes INCLUDING buffer
          const hasClash = state.events.some((e) => {
            const eStart = parseISO(e.startTime);
            const eEnd = addMinutes(eStart, e.durationMinutes + state.bufferMinutes);
            
            const newStart = parseISO(newEvent.startTime);
            const newEnd = addMinutes(newStart, newEvent.durationMinutes + state.bufferMinutes);
            
            return isBefore(newStart, eEnd) && isAfter(newEnd, eStart);
          });

          if (hasClash) {
            success = false;
            return state;
          }
          return {
            events: [...state.events, newEvent].sort(
              (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            ),
          };
        });
        return success;
      },

      addEventsBulk: (eventsList) => {
        let success = true;
        set((state) => {
          const newEventsWithId = eventsList.map(e => ({ ...e, id: crypto.randomUUID() }));
          
          // Simple validation: check if any of the new events clash with each other or existing ones
          const allEventsCopy = [...state.events];
          
          for (const newEv of newEventsWithId) {
            const hasClash = allEventsCopy.some((e) => {
              const eStart = parseISO(e.startTime);
              const eEnd = addMinutes(eStart, e.durationMinutes + state.bufferMinutes);
              const newStart = parseISO(newEv.startTime);
              const newEnd = addMinutes(newStart, newEv.durationMinutes + state.bufferMinutes);
              return isBefore(newStart, eEnd) && isAfter(newEnd, eStart);
            });

            if (hasClash) {
              success = false;
              return state;
            }
            allEventsCopy.push(newEv);
          }

          return {
            events: allEventsCopy.sort(
              (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            ),
          };
        });
        return success;
      },
      updateEvent: (id, updates, forceShift = false) => {
        let success = true;
        set((state) => {
          const existing = state.events.find((e) => e.id === id);
          if (!existing) return state;
          const updated = { ...existing, ...updates };

          const otherEvents = state.events.filter((e) => e.id !== id);
          
          const hasClash = otherEvents.some((e) => {
            const eStart = parseISO(e.startTime);
            const eEnd = addMinutes(eStart, e.durationMinutes + state.bufferMinutes);
            const updatedStart = parseISO(updated.startTime);
            const updatedEnd = addMinutes(updatedStart, updated.durationMinutes + state.bufferMinutes);
            return isBefore(updatedStart, eEnd) && isAfter(updatedEnd, eStart);
          });

          if (hasClash && !forceShift) {
            success = false;
            return state;
          }

          if (hasClash && forceShift) {
            // Logic to shift subsequent events
            const sorted = [...state.events.map(e => e.id === id ? updated : e)].sort(
              (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );
            
            const index = sorted.findIndex(e => e.id === id);
            let currentTime = addMinutes(parseISO(updated.startTime), updated.durationMinutes + state.bufferMinutes);
            
            for (let i = index + 1; i < sorted.length; i++) {
              const currentEvent = sorted[i];
              if (!currentEvent) continue;
              
              const eventStart = parseISO(currentEvent.startTime);
              
              if (isBefore(eventStart, currentTime)) {
                sorted[i] = {
                  ...currentEvent,
                  startTime: currentTime.toISOString()
                } as TimelineEvent;
                currentTime = addMinutes(currentTime, currentEvent.durationMinutes + state.bufferMinutes);
              } else {
                break;
              }
            }

            return { events: sorted };
          }

          return {
            events: state.events.map((e) => (e.id === id ? updated : e)).sort(
              (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            ),
          };
        });
        return success;
      },

      removeEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),
      setBufferMinutes: (minutes) => set({ bufferMinutes: minutes }),
      setEvents: (events) => set({ events }),
      setWorkingHours: (hours) => set({ workingHours: hours }),
      setDurationOptions: (options) => set({ durationOptions: options }),
      setSelectedDate: (date) => set({ selectedDate: startOfDay(date).toISOString() }),
      setProfile: (profile: Profile) => set({ profile }),
      populateRandomData: () => {
        set((state) => {
          const newEvents = [...state.events];
          const titles = [
            'Breakfast Meeting', 'Client Review', 'Strategy Session', 'Lunch with Board', 
            'Site Visit', 'Interview: Tech Lead', 'Team Standup', 'Executive Briefing',
            'Project Alpha Sync', 'Investor Call', 'Design Review', 'Networking Mixer'
          ];
          const types: EventType[] = ['visit', 'meeting', 'guest', 'break'];
          const locations = ['Main Conference Room', 'Sky Lounge', 'Café 24', 'Virtual Zoom Room', 'Warehouse District', 'Lobby A'];
          const durations = [30, 60, 90, 120];

          // Generate for -1 to +7 days
          for (let d = -1; d <= 7; d++) {
            const date = new Date();
            date.setDate(date.getDate() + d);
            const dateString = startOfDay(date).toISOString();
            
            // Skip if this day already has events
            if (newEvents.some(e => startOfDay(parseISO(e.startTime)).toISOString() === dateString)) {
              continue;
            }

            const [startH, startM] = state.workingHours.start.split(':').map(val => Number(val) || 0);
            const [endH, endM] = state.workingHours.end.split(':').map(val => Number(val) || 0);
            
            let currentPointer = new Date(date);
            currentPointer.setHours(startH || 0, startM || 0, 0, 0);
            
            const endTimeLimit = new Date(date);
            endTimeLimit.setHours(endH || 0, endM || 0, 0, 0);

            // Add 3-5 events per day
            const numEvents = Math.floor(Math.random() * 3) + 3;
            
            for (let i = 0; i < numEvents; i++) {
              const duration = durations[Math.floor(Math.random() * durations.length)] ?? 60;
              const type = types[Math.floor(Math.random() * types.length)] ?? 'meeting';
              const title = titles[Math.floor(Math.random() * titles.length)] ?? 'Meeting';
              
              const potentialEnd = addMinutes(currentPointer, duration + state.bufferMinutes);
              if (potentialEnd.getTime() <= endTimeLimit.getTime()) {
                // Pick 1–3 random attendees from sample names
                const sampleAttendees = [
                  'Sarah Chen', 'James Whitfield', 'Nora Khalid', 'David Osei',
                  'Emily Roux', 'Marcus Bello', 'Priya Nair', 'Tom Lancaster'
                ];
                const shuffled = sampleAttendees.sort(() => 0.5 - Math.random());
                const attendees = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);

                const descriptions = [
                  `Discuss Q${Math.floor(Math.random() * 4) + 1} targets and pipeline review.`,
                  `Review design concepts and approve final direction.`,
                  `Prepare briefing materials and confirm logistics for upcoming trip.`,
                  `Key agenda: budget allocation, team structure, and OKR alignment.`,
                  `Introduce new strategic partners and sign preliminary MOU.`,
                  `Site inspection followed by team debrief and action items.`,
                ];

                const outcomes = d < 0 ? [
                  `Meeting concluded successfully. Follow-up email sent to all parties.`,
                  `Decision reached on budget. Legal to draft agreement by Friday.`,
                  `Deferred to next quarter pending board approval.`,
                  `Action items assigned. Next review in 2 weeks.`,
                  null,
                ] : [null];

                const priorities: Array<'urgent' | 'important' | 'normal'> = ['urgent', 'important', 'normal', 'normal'];
                const priority = title.includes('Board') || title.includes('Investor') || title.includes('Executive') 
                  ? 'urgent' 
                  : (title.includes('Client') || title.includes('Strategy') ? 'important' : priorities[Math.floor(Math.random() * priorities.length)]);

                newEvents.push({
                  id: crypto.randomUUID(),
                  title,
                  startTime: currentPointer.toISOString(),
                  durationMinutes: duration,
                  type,
                  location: locations[Math.floor(Math.random() * locations.length)] ?? 'Conference Room',
                  attendees,
                  description: descriptions[Math.floor(Math.random() * descriptions.length)],
                  outcome: outcomes[Math.floor(Math.random() * outcomes.length)] ?? undefined,
                  priority,
                });
                
                const gap = [0, 30, 60][Math.floor(Math.random() * 3)] ?? 0;
                currentPointer = addMinutes(currentPointer, duration + state.bufferMinutes + gap);
              }
            }
          }

          // Seed contacts registry
          const seedContacts: Contact[] = [
            { id: crypto.randomUUID(), name: 'Sarah Chen', title: 'Chief Strategy Officer', company: 'Apex Ventures' },
            { id: crypto.randomUUID(), name: 'James Whitfield', title: 'Managing Director', company: 'Whitfield & Associates' },
            { id: crypto.randomUUID(), name: 'Nora Khalid', title: 'Head of Legal', company: 'Meridian Group' },
            { id: crypto.randomUUID(), name: 'David Osei', title: 'Board Member', company: 'Osei Capital' },
            { id: crypto.randomUUID(), name: 'Emily Roux', title: 'Communications Lead', company: 'Roux Consulting' },
            { id: crypto.randomUUID(), name: 'Marcus Bello', title: 'CFO', company: 'Bello Industries' },
            { id: crypto.randomUUID(), name: 'Priya Nair', title: 'VP Product', company: 'NovaTech' },
            { id: crypto.randomUUID(), name: 'Tom Lancaster', title: 'Partner', company: 'Lancaster & Co' },
          ];

          // Seed custom categories
          const seedCategories: CustomCategory[] = [
            { id: crypto.randomUUID(), label: 'VIP', color: 'purple' },
            { id: crypto.randomUUID(), label: 'Media', color: 'rose' },
            { id: crypto.randomUUID(), label: 'Travel', color: 'amber' },
          ];

          return {
            events: newEvents.sort(
              (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            ),
            contacts: state.contacts.length === 0 ? seedContacts : state.contacts,
            customCategories: state.customCategories.length === 0 ? seedCategories : state.customCategories,
            brandingName: state.brandingName === 'Executive Suite' || state.brandingName === 'Office of the Chairman' ? 'Executive Dossier Office' : state.brandingName,
            vipInitials: state.vipInitials === 'VP' ? 'DS' : state.vipInitials,
            profile: state.profile.name === '' ? { name: 'Alexander Browne', position: 'Chairman & CEO', company: 'Browne Group' } : state.profile,
          };
        });
      },
      setBrandingName: (name) => set({ brandingName: name }),
      setVipInitials: (initials) => set({ vipInitials: initials }),
      setThemeAccent: (accent) => set({ themeAccent: accent }),
      setCustomCategories: (categories) => set({ customCategories: categories }),
      setContacts: (contactsList) => set({ contacts: contactsList }),
      setConfidentialMode: (on) => set({ confidentialMode: on }),

    }),
    {
      name: 'timeline-storage',
    }
  )
);
