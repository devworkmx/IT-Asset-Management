import { Outlet, Link, Navigate, useLocation } from "react-router";
import { LayoutDashboard, Server, Plus, Ship, FileText, User } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "./ui/sidebar";
import { useAuth } from "../context/AuthContext";

export default function Root() {
  const location = useLocation();
  const { user, initializing, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  if (!initializing && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menú principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/") && location.pathname === "/"}
                  >
                    <Link to="/">
                      <LayoutDashboard className="size-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/assets")}>
                    <Link to="/assets">
                      <Server className="size-4" />
                      <span>Activos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/reports")}>
                    <Link to="/reports">
                      <FileText className="size-4" />
                      <span>Reportes</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/add-asset")}>
                    <Link to="/add-asset">
                      <Plus className="size-4" />
                      <span>Agregar Activo</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/profile")}>
                    <Link to="/profile">
                      <User className="size-4" />
                      <span>Perfil</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="mr-2" />
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Ship className="size-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-slate-900">
                      IT Asset Management
                    </h1>
                    <p className="text-xs text-slate-500">
                      Panel de administración de activos
                    </p>
                  </div>
                </div>

                {user && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="text-right">
                      <p className="font-medium text-slate-900">
                        {user.user_metadata?.full_name || "Administrador"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {user.email} · Rol: Admin
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={signOut}
                      className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}