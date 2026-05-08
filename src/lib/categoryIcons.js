import {
  Briefcase, Code2, TrendingUp, Building2, Gift,
  Home, ShoppingCart, UtensilsCrossed, Car, Clapperboard,
  ShoppingBag, Zap, Pill, BookOpen, Plane, CircleDollarSign
} from 'lucide-react'

// Single source of truth for category → icon mapping
export const CATEGORY_ICONS = {
  Salary:        Briefcase,
  Freelance:     Code2,
  Investment:    TrendingUp,
  Business:      Building2,
  Gift:          Gift,
  Rent:          Home,
  Groceries:     ShoppingCart,
  Food:          UtensilsCrossed,
  Transport:     Car,
  Entertainment: Clapperboard,
  Shopping:      ShoppingBag,
  Utilities:     Zap,
  Healthcare:    Pill,
  Education:     BookOpen,
  Travel:        Plane,
  Other:         CircleDollarSign,
}
