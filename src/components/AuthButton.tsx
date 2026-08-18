import React from "react";
import { User, LogOut, LogIn } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => navigate({ to: "/login" });

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    navigate({ to: "/login" });
  };

  if (loading) return <div className="h-9 w-9 animate-pulse bg-muted rounded-xl" />;

  if (!user) {
    return (
      <Button
        onClick={handleLogin}
        variant="outline"
        className="flex h-9 items-center gap-2 rounded-xl bg-card text-foreground shadow-sm border border-border hover:bg-accent transition-all px-4 font-medium"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-9 items-center gap-2 px-3 rounded-xl bg-card text-foreground shadow-sm border border-border hover:bg-accent transition-all"
          title={user.email}
        >
          <div className="h-6 w-6 rounded-lg bg-foreground text-background flex items-center justify-center text-[10px] font-bold flex-shrink-0">
            {user.initials}
          </div>
          <span className="hidden sm:inline text-xs font-semibold max-w-[100px] truncate">{user.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl border-border">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground/60 mt-1">{user.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive cursor-pointer rounded-lg"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
