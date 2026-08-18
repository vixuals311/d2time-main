import { createFileRoute } from "@tanstack/react-router";
import { useTimelineStore } from "../lib/store";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { X, Plus, Sparkles, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { 
    bufferMinutes, 
    setBufferMinutes, 
    workingHours, 
    setWorkingHours,
    durationOptions,
    setDurationOptions,
    profile,
    setProfile,
    populateRandomData,

    brandingName,
    setBrandingName,
    vipInitials,
    setVipInitials,
    themeAccent,
    setThemeAccent,
    customCategories,
    setCustomCategories,
    contacts,
    setContacts
  } = useTimelineStore();

  const [localBuffer, setLocalBuffer] = useState(bufferMinutes);
  const [localWorkingHours, setLocalWorkingHours] = useState(workingHours);
  const [localDurations, setLocalDurations] = useState(durationOptions);
  const [localProfile, setLocalProfile] = useState(profile);
  const [newDuration, setNewDuration] = useState("");

  // Customization local states
  const [localBrandingName, setLocalBrandingName] = useState(brandingName);
  const [localVipInitials, setLocalVipInitials] = useState(vipInitials);
  const [localThemeAccent, setLocalThemeAccent] = useState(themeAccent);
  
  // Contacts states
  const [newContactName, setNewContactName] = useState("");
  const [newContactCompany, setNewContactCompany] = useState("");
  const [newContactTitle, setNewContactTitle] = useState("");
  const [localContacts, setLocalContacts] = useState(contacts);

  // Custom Category states
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("blue");
  const [localCategories, setLocalCategories] = useState(customCategories);

  const hasChanges = 
    localBuffer !== bufferMinutes || 
    localWorkingHours.start !== workingHours.start || 
    localWorkingHours.end !== workingHours.end || 
    JSON.stringify([...localDurations].sort()) !== JSON.stringify([...durationOptions].sort()) ||
    localProfile.name !== profile.name ||
    localProfile.position !== profile.position ||
    localProfile.company !== profile.company ||
    localBrandingName !== brandingName ||
    localVipInitials !== vipInitials ||
    localThemeAccent !== themeAccent ||
    JSON.stringify(localContacts) !== JSON.stringify(contacts) ||
    JSON.stringify(localCategories) !== JSON.stringify(customCategories);

  const handleSave = () => {
    if (!hasChanges) return;
    setBufferMinutes(localBuffer);
    setWorkingHours(localWorkingHours);
    setDurationOptions([...localDurations].sort((a, b) => a - b));
    setProfile(localProfile);
    setBrandingName(localBrandingName);
    setVipInitials(localVipInitials);
    setThemeAccent(localThemeAccent);
    setContacts(localContacts);
    setCustomCategories(localCategories);
    toast.success("Settings saved successfully");
  };

  const addDuration = () => {
    const val = parseInt(newDuration);
    if (isNaN(val) || val <= 0) {
      toast.error("Enter a valid duration in minutes");
      return;
    }
    if (localDurations.includes(val)) {
      toast.error("Duration already exists");
      return;
    }
    setLocalDurations([...localDurations, val]);
    setNewDuration("");
  };

  const removeDuration = (val: number) => {
    setLocalDurations(localDurations.filter(d => d !== val));
  };

  const addContact = () => {
    if (!newContactName.trim()) {
      toast.error("Contact name is required");
      return;
    }
    const contact = {
      id: crypto.randomUUID(),
      name: newContactName.trim(),
      company: newContactCompany.trim() || undefined,
      title: newContactTitle.trim() || undefined
    };
    setLocalContacts([...localContacts, contact]);
    setNewContactName("");
    setNewContactCompany("");
    setNewContactTitle("");
  };

  const removeContact = (id: string) => {
    setLocalContacts(localContacts.filter(c => c.id !== id));
  };

  const addCategory = () => {
    if (!newCategoryLabel.trim()) {
      toast.error("Category name is required");
      return;
    }
    const newCat = {
      id: crypto.randomUUID(),
      label: newCategoryLabel.trim().toLowerCase(),
      color: newCategoryColor
    };
    setLocalCategories([...localCategories, newCat]);
    setNewCategoryLabel("");
  };

  const removeCategory = (id: string) => {
    setLocalCategories(localCategories.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-12 md:py-16 font-sans">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-accent rounded-xl transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-serif font-medium text-foreground tracking-tight">Settings</h1>
          </div>
          <button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </header>

        <div className="space-y-8 pb-20">
          <section className="space-y-4">
            <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">High-Profile Individual Profile</Label>
            <div className="grid gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
              <div className="grid gap-1.5">
                <Label htmlFor="profile-name" className="text-xs">Full Name</Label>
                <Input
                  id="profile-name"
                  value={localProfile.name}
                  onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                  placeholder="e.g. Elon Musk"
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="profile-position" className="text-xs">Position</Label>
                  <Input
                    id="profile-position"
                    value={localProfile.position}
                    onChange={(e) => setLocalProfile({ ...localProfile, position: e.target.value })}
                    placeholder="e.g. CEO"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="profile-company" className="text-xs">Company</Label>
                  <Input
                    id="profile-company"
                    value={localProfile.company}
                    onChange={(e) => setLocalProfile({ ...localProfile, company: e.target.value })}
                    placeholder="e.g. Tesla"
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Custom Branding & Appearance</Label>
            <div className="grid gap-6 bg-card p-6 rounded-3xl border border-border shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="branding-name" className="text-xs">App Header Nickname</Label>
                  <Input
                    id="branding-name"
                    value={localBrandingName}
                    onChange={(e) => setLocalBrandingName(e.target.value)}
                    placeholder="e.g. Office of the CEO"
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="vip-initials" className="text-xs">VIP Initials Logo</Label>
                  <Input
                    id="vip-initials"
                    maxLength={3}
                    value={localVipInitials}
                    onChange={(e) => setLocalVipInitials(e.target.value.toUpperCase())}
                    placeholder="e.g. EM"
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs">Theme Accent Color</Label>
                <div className="flex gap-3">
                  {[
                    { id: 'charcoal', name: 'Charcoal', class: 'bg-[#2D3748]' },
                    { id: 'navy', name: 'Navy', class: 'bg-blue-800' },
                    { id: 'emerald', name: 'Emerald', class: 'bg-emerald-600' },
                    { id: 'burgundy', name: 'Burgundy', class: 'bg-red-800' },
                    { id: 'amber', name: 'Amber', class: 'bg-amber-600' }
                  ].map((accent) => (
                    <button
                      key={accent.id}
                      onClick={() => setLocalThemeAccent(accent.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${localThemeAccent === accent.id ? 'border-primary ring-2 ring-primary/20 bg-secondary' : 'border-border bg-transparent'}`}
                    >
                      <div className={`h-6 w-6 rounded-full ${accent.class}`} />
                      <span className="text-[10px] font-medium">{accent.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Custom Event Categories</Label>
            <div className="grid gap-6 bg-card p-6 rounded-3xl border border-border shadow-sm">
              <div className="flex flex-wrap gap-2">
                {localCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-1.5 bg-secondary border border-border px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider">
                    <span className={`h-2.5 w-2.5 rounded-full bg-${cat.color}-500`} />
                    <span>{cat.label}</span>
                    <button 
                      onClick={() => removeCategory(cat.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Category label (e.g. press)"
                  value={newCategoryLabel}
                  onChange={(e) => setNewCategoryLabel(e.target.value)}
                  className="h-10 rounded-xl"
                />
                <select
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="rose">Rose</option>
                  <option value="amber">Amber</option>
                  <option value="emerald">Emerald</option>
                  <option value="indigo">Indigo</option>
                </select>
                <button 
                  onClick={addCategory}
                  className="flex items-center justify-center bg-primary text-primary-foreground px-4 h-10 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Guest Registry (Contact Book)</Label>
            <div className="grid gap-6 bg-card p-6 rounded-3xl border border-border shadow-sm">
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {localContacts.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-4">No guests registered yet.</p>
                ) : (
                  localContacts.map((contact) => (
                    <div key={contact.id} className="flex justify-between items-center p-2.5 rounded-xl border border-border bg-background">
                      <div>
                        <p className="text-sm font-semibold">{contact.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {contact.title ? contact.title : ""} {contact.company ? `@ ${contact.company}` : ""}
                        </p>
                      </div>
                      <button 
                        onClick={() => removeContact(contact.id)}
                        className="p-1 text-muted-foreground hover:text-destructive rounded-lg hover:bg-secondary transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Guest Full Name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="h-10 rounded-xl"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Title / Designation"
                    value={newContactTitle}
                    onChange={(e) => setNewContactTitle(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                  <Input
                    placeholder="Company"
                    value={newContactCompany}
                    onChange={(e) => setNewContactCompany(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <button 
                  onClick={addContact}
                  className="w-full flex items-center justify-center bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Save Guest to Registry
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">Schedule Configuration</Label>
            <div className="grid gap-6 bg-card p-6 rounded-3xl border border-border shadow-sm">
              <div className="grid gap-2">
                <Label htmlFor="buffer" className="text-sm font-medium">Default Buffer (minutes)</Label>
                <Input
                  id="buffer"
                  type="number"
                  min="0"
                  step="5"
                  value={localBuffer}
                  onChange={(e) => setLocalBuffer(Number(e.target.value))}
                  className="h-10 rounded-xl"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dayStart" className="text-sm font-medium">Day Start Time</Label>
                  <Input
                    id="dayStart"
                    type="time"
                    value={localWorkingHours.start}
                    onChange={(e) => setLocalWorkingHours({ ...localWorkingHours, start: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dayEnd" className="text-sm font-medium">Day End Time</Label>
                  <Input
                    id="dayEnd"
                    type="time"
                    value={localWorkingHours.end}
                    onChange={(e) => setLocalWorkingHours({ ...localWorkingHours, end: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Ready Durations (presets)</Label>
                <div className="flex flex-wrap gap-2">
                  {localDurations.map((d) => (
                    <div key={d} className="flex items-center gap-1 bg-secondary border border-border px-3 py-1.5 rounded-xl text-sm group">
                      <span>{d >= 60 ? `${d/60}h` : `${d}m`}</span>
                      <button 
                        onClick={() => removeDuration(d)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add minutes (e.g. 45)"
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                  <button 
                    onClick={addDuration}
                    className="flex items-center justify-center bg-primary text-primary-foreground w-10 h-10 rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
          
          <section className="space-y-4">
            <Label className="text-sm font-semibold text-foreground uppercase tracking-wider">System & Debug</Label>
            <div className="grid gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
              <button
                onClick={() => {
                  populateRandomData();
                  toast.success("Random data generated for 1 day ago to 7 days in future");
                }}
                className="w-full flex items-center justify-center gap-2 bg-secondary border border-border text-foreground py-3 rounded-xl text-sm font-medium hover:bg-accent transition-all"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                Populate Random Data
              </button>
              <p className="text-xs text-muted-foreground leading-relaxed italic text-center">
                * Changes only apply after clicking Save. Buffers are automatically added between events when reordering.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
