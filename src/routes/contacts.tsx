import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTimelineStore, Contact } from "../lib/store";
import { toast } from "sonner";
import { UserPlus, Trash2, Search, ArrowLeft, User, Building2, Briefcase, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/contacts")({
  component: ContactsPage,
});

function ContactsPage() {
  const { contacts, setContacts } = useTimelineStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState({ name: "", company: "", title: "", phone: "", email: "" });

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditingContact(null);
    setForm({ name: "", company: "", title: "", phone: "", email: "" });
    setShowForm(true);
  };

  const openEdit = (c: Contact) => {
    setEditingContact(c);
    setForm({ name: c.name, company: c.company || "", title: c.title || "", phone: (c as any).phone || "", email: (c as any).email || "" });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (editingContact) {
      setContacts(contacts.map(c => c.id === editingContact.id ? { ...c, ...form } : c));
      toast.success("Contact updated");
    } else {
      setContacts([...contacts, { id: crypto.randomUUID(), ...form }]);
      toast.success("Contact added");
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Remove this contact from your registry?")) {
      setContacts(contacts.filter(c => c.id !== id));
      toast.info("Contact removed");
    }
  };

  const initials = (name: string) =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  ];
  const colorFor = (id: string) => colors[id.charCodeAt(0) % colors.length];

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-12 md:py-10 font-sans">
      {/* Header */}
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-accent transition-all text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-semibold text-foreground tracking-tight">
                Guest Registry
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                {contacts.length} Contacts
              </p>
            </div>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Add Contact
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, company, or title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 border border-border rounded-2xl bg-card text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>

        {/* Contact List */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <User className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground font-medium">
              {search ? "No contacts match your search" : "No contacts yet"}
            </p>
            {!search && (
              <button
                onClick={openNew}
                className="mt-4 text-xs text-primary font-semibold hover:underline"
              >
                Add your first contact →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(contact => (
              <button
                key={contact.id}
                onClick={() => openEdit(contact)}
                className="text-left flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${colorFor(contact.id)}`}>
                  {initials(contact.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{contact.name}</p>
                  {contact.title && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{contact.title}</p>
                  )}
                  {contact.company && (
                    <p className="text-[11px] text-muted-foreground/70 truncate">{contact.company}</p>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(contact.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-serif font-semibold text-foreground mb-5">
              {editingContact ? "Edit Contact" : "New Contact"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    autoFocus
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="John Smith"
                    className="w-full h-10 pl-10 pr-4 border border-border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Title / Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="CEO, Partner, Advisor..."
                    className="w-full h-10 pl-10 pr-4 border border-border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Company / Organisation</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                    placeholder="Acme Corp"
                    className="w-full h-10 pl-10 pr-4 border border-border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 (555) 000"
                      className="w-full h-10 pl-10 pr-3 border border-border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="john@acme.com"
                      className="w-full h-10 pl-10 pr-3 border border-border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
              >
                {editingContact ? "Save Changes" : "Add Contact"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
