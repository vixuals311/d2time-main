import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth";
import { Eye, EyeOff, LogIn, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already logged in → redirect home
  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      toast.success("Welcome back!");
      navigate({ to: "/" });
    }
  };

  const fillDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    setEmail("admin@dossier.com");
    setPassword("password123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-12 relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute bottom-12 -left-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02]" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="font-serif text-xl font-semibold text-white tracking-tight">Dossier</span>
        </div>

        {/* Centre quote */}
        <div className="relative z-10">
          <p className="font-serif text-4xl font-semibold text-white leading-tight max-w-xs">
            Every briefing,<br />
            <span className="text-white/50">perfectly prepared.</span>
          </p>
          <p className="mt-6 text-sm text-white/40 leading-relaxed max-w-xs">
            The confidential executive scheduling tool built for Professional Assistants who demand precision.
          </p>
        </div>

        {/* Bottom credential hint */}
        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3 font-semibold">Test credentials</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Email</span>
              <span className="text-xs font-mono text-white/80">admin@dossier.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Password</span>
              <span className="text-xs font-mono text-white/80">password123</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-foreground flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-background" />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">Dossier</span>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-3xl font-semibold text-foreground tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access your confidential briefings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                className="w-full h-11 px-4 border border-border rounded-xl bg-card text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="w-full h-11 pl-4 pr-11 border border-border rounded-xl bg-card text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl px-4 py-3 font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </button>

            {/* Quick fill demo */}
            <button
              onClick={fillDemo}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2 underline underline-offset-2"
            >
              Fill demo credentials
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-muted-foreground/50">
            Dossier · Executive Briefings · Private Access
          </p>
        </div>
      </div>
    </div>
  );
}
