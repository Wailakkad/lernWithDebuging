// components/icons.tsx
import { 
  HelpCircle, 
  Settings, 
  Sparkles, 
  Zap, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  BookText, 
  AlertCircle,
  Lightbulb, // For Icons.tip
  Loader2,   // For Icons.loader
  Code2,     // For Icons.code
  Dumbbell,
  Cpu,       // For Icons.exercise (optional)
  LayoutDashboard // For Icons.dashboard
} from "lucide-react";

export const Icons = {
  // Existing icons
  help: HelpCircle,
  settings: Settings,
  debug: Zap,
  spinner: Sparkles,
  check: Check,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  copy: Copy,
  code: Code2,
  analysis: BookText,
  error: AlertCircle,
  logo: Cpu,
  
  // NEW ICONS
  tip: Lightbulb,         // Used in Tips section
  loader: Loader2,        // Used in loading state
  solution: Sparkles,     // Reused Sparkles for solution
  exercise: Dumbbell,     // Optional: For exercises tab
  dashboard: LayoutDashboard, // New Dashboard icon
  dot: () => (            // Custom dot icon
    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
      <circle cx="4" cy="4" r="4" />
    </svg>
  )
};