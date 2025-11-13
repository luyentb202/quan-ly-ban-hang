
import { Home, ShoppingCart, Package, DollarSign, BarChart2, Users, User, FileText } from 'lucide-react';

export const NAV_LINKS = [
  { href: "/", label: "Tổng quan", icon: Home },
  { href: "/sales", label: "Bán hàng", icon: ShoppingCart },
  { href: "/products", label: "Sản phẩm", icon: Package },
  { href: "/inventory", label: "Kho hàng", icon: FileText },
  { href: "/finance", label: "Thu/Chi", icon: DollarSign },
  { href: "/reports", label: "Báo cáo", icon: BarChart2 },
  { href: "/customers", label: "Khách hàng", icon: Users },
  { href: "/employees", label: "Nhân viên", icon: User },
];
