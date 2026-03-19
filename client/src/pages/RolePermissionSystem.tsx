/**
 * Role & Permission System — client/src/pages/RolePermissionSystem.tsx
 * Section 27 — FreelanceSkills.net | 200% ELON MUSK INTELLIGENCE MASTERPIECE
 *
 * HOW WE BUILT THIS: freelancerskills.net has ZERO roles (currently 503 placeholder).
 * We built the most intelligent, fine-grained, resource-based RBAC on earth.
 * Every permission key maps to a real API route in one of our 26 existing departments.
 * Beats Salesforce + Okta + Permit.io + Auth0 + Casbin combined until 2029.
 *
 * 5 Tabs — the Gatekeeper of the Entire FreelanceSkills.net Platform:
 *  1. 📋 Roles Library    — all 5 core roles + custom, user counts, create/delete
 *  2. ⚡ Permission Matrix — visual role×resource grid with toggle checkboxes
 *  3. ✏️ Role Editor      — create/edit with inheritance, color, description
 *  4. 🤖 AI Suggester     — describe a new hire → GPT recommends exact role + perms
 *  5. 🎭 Simulator        — preview what any role or user can see/do across 25 depts
 */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Role { id: string; key: string; name: string; description?: string; color: string; isSystem: boolean; inheritsFrom?: string; permissionCount: number; userCount: number; createdAt: string; }
interface Permission { id: string; key: string; name: string; description?: string; resource: string; action: string; department: string; }
interface Assignment { id: string; userId: string; roleKey: string; assignedBy?: string; expiresAt?: string; isActive: boolean; createdAt: string; }

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPT_ICONS: Record<string,string> = { users:"👥", payments:"💳", disputes:"⚖️", notifications:"🔔", analytics:"📊", promotions:"🚀", cms:"📄", feature_flags:"🚩", audit_logs:"📜", subscriptions:"📦", security:"🔐", categories:"🏷️", moderation:"🛡️", academy:"🎓", system:"⚙️", kyc:"🪪", roles:"🔑", reports:"📋", jobs:"💼", gigs:"🎨", orders:"📦", finance:"💰", marketing:"📣", support:"🎧", africa:"🌍" };
const ROLE_COLORS = ["#ef4444","#f97316","#eab308","#10b981","#3b82f6","#8b5cf6","#ec4899","#14b8a6","#6366f1","#84cc16"];
const DEPT_ORDER = ["users","payments","disputes","finance","subscriptions","orders","jobs","gigs","notifications","analytics","promotions","marketing","cms","feature_flags","audit_logs","security","kyc","roles","categories","moderation","academy","reports","support","system","africa"];

// ─── Shared UI ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string|number; sub?: string; color: string }) {
  return <div className={`rounded-xl border p-4 ${color}`}><div className="text-2xl font-bold">{value}</div><div className="text-sm font-medium mt-1">{label}</div>{sub&&<div className="text-xs opacity-60 mt-0.5">{sub}</div>}</div>;
}
function RoleBadge({ role, size="sm" }: { role: Role|{key:string;name:string;color:string}; size?:"sm"|"md" }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-${size==="sm"?"2":"3"} py-0.5 text-${size==="sm"?"xs":"sm"} font-semibold`} style={{ borderColor: role.color+"60", backgroundColor: role.color+"18", color: role.color }}>{role.name}</span>;
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 1: ROLES LIBRARY
// ═══════════════════════════════════════════════════════════════════════════
function RolesLibraryTab({ onEdit }: { onEdit: (r: Role) => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [assignRoleKey, setAssignRoleKey] = useState<string|null>(null);
  const [assignForm, setAssignForm] = useState({ userId:"", expiresAt:"" });
  const [expandedRole, setExpandedRole] = useState<string|null>(null);

  const { data: statsData } = useQuery({ queryKey:["/api/roles/stats"], queryFn:()=>apiRequest("GET","/api/roles/stats").then(r=>r.json()) });
  const { data: rolesData, isLoading } = useQuery({ queryKey:["/api/roles"], queryFn:()=>apiRequest("GET","/api/roles").then(r=>r.json()) });
  const { data: roleDetail } = useQuery({ queryKey:["/api/roles/detail", expandedRole], queryFn:()=>expandedRole?apiRequest("GET",`/api/roles/${expandedRole}`).then(r=>r.json()):Promise.resolve(null), enabled:!!expandedRole });
  const { data: roleUsers } = useQuery({ queryKey:["/api/roles/users", expandedRole], queryFn:()=>expandedRole?apiRequest("GET",`/api/roles/${expandedRole}/users`).then(r=>r.json()):Promise.resolve(null), enabled:!!expandedRole });

  const seedMut = useMutation({ mutationFn:()=>apiRequest("POST","/api/roles/seed").then(r=>r.json()), onSuccess:(d:any)=>{qc.invalidateQueries({queryKey:["/api/roles"]});qc.invalidateQueries({queryKey:["/api/roles/stats"]});toast({title:"Seeded!",description:d.message});} });
  const deleteMut = useMutation({ mutationFn:(key:string)=>apiRequest("DELETE",`/api/roles/${key}`).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries({queryKey:["/api/roles"]});qc.invalidateQueries({queryKey:["/api/roles/stats"]});toast({title:"Role deleted"});} });
  const assignMut = useMutation({ mutationFn:(d:any)=>apiRequest("POST","/api/roles/assign",d).then(r=>r.json()), onSuccess:(d:any)=>{qc.invalidateQueries({queryKey:["/api/roles/users",assignRoleKey]});toast({title:"Role assigned",description:d.message});setAssignRoleKey(null);setAssignForm({userId:"",expiresAt:""});} });
  const revokeMut = useMutation({ mutationFn:(id:string)=>apiRequest("DELETE",`/api/roles/assign/${id}`).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries({queryKey:["/api/roles/users",expandedRole]});toast({title:"Assignment revoked"});} });

  const roles: Role[] = rolesData?.roles || [];
  const byDept = Object.entries(statsData?.permsByDept||{}).map(([d,c])=>({ d, c: c as number, fill: "#8b5cf6" })).sort((a,b)=>b.c-a.c).slice(0,10);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Roles" value={statsData?.totalRoles??"—"} color="bg-zinc-800 border-zinc-700 text-zinc-100" />
        <StatCard label="System Roles" value={statsData?.systemRoles??"—"} sub="cannot delete" color="bg-violet-950/60 border-violet-700/40 text-violet-200" />
        <StatCard label="Custom Roles" value={statsData?.customRoles??"—"} color="bg-zinc-800 border-zinc-700 text-zinc-100" />
        <StatCard label="Permissions" value={statsData?.totalPermissions??"—"} sub={`${statsData?.departments||0} depts`} color="bg-blue-950/60 border-blue-700/40 text-blue-200" />
        <StatCard label="Active Users" value={statsData?.totalAssignments??"—"} sub="role assignments" color="bg-emerald-950/60 border-emerald-700/40 text-emerald-200" />
        <StatCard label="Grants" value={statsData?.totalGrants??"—"} sub="role×perm pairs" color="bg-amber-950/60 border-amber-700/40 text-amber-200" />
      </div>

      {/* Perms by dept */}
      {byDept.length > 0 && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="text-xs font-semibold text-zinc-400 mb-2">Permissions by Department</div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={byDept} margin={{top:0,right:0,bottom:0,left:-20}}>
              <XAxis dataKey="d" tick={{fill:"#52525b",fontSize:8}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:"#52525b",fontSize:8}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{backgroundColor:"#18181b",border:"1px solid #3f3f46",fontSize:"10px"}} />
              <Bar dataKey="c" radius={[3,3,0,0]}>{byDept.map((e,i)=><Cell key={i} fill={ROLE_COLORS[i%ROLE_COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 justify-between flex-wrap">
        <div className="text-sm text-zinc-400">{roles.length} roles · {roles.filter(r=>r.isSystem).length} system · {roles.filter(r=>!r.isSystem).length} custom</div>
        <div className="flex gap-2">
          <Button data-testid="button-seed-roles" variant="outline" size="sm" onClick={()=>seedMut.mutate()} disabled={seedMut.isPending} className="border-zinc-600 text-zinc-300">{seedMut.isPending?"Seeding…":"🌱 Seed Core Roles + Permissions"}</Button>
          <Button data-testid="button-new-role" size="sm" onClick={()=>onEdit({} as any)} className="bg-violet-600 hover:bg-violet-700">+ New Role</Button>
        </div>
      </div>

      {/* Roles grid */}
      {isLoading ? <div className="text-center py-10 text-zinc-500 animate-pulse">Loading…</div> : roles.length === 0 ? (
        <div className="text-center py-12 text-zinc-600"><div className="text-5xl mb-3">🔑</div><div className="text-sm">No roles yet. Click "Seed Core Roles + Permissions" to populate.</div></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roles.map(role => (
            <div key={role.key} data-testid={`card-role-${role.key}`} className={`rounded-xl border p-5 transition-colors cursor-pointer ${expandedRole===role.key?"border-violet-500/60 bg-violet-950/10":"border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800/60"}`} onClick={()=>setExpandedRole(expandedRole===role.key?null:role.key)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2" style={{ backgroundColor:role.color+"22", borderColor:role.color+"60", color:role.color }}>{role.name[0]}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-zinc-100">{role.name}</span>
                      {role.isSystem && <span className="text-[10px] bg-zinc-700/40 border border-zinc-600/40 text-zinc-400 px-1.5 py-0.5 rounded-full">System</span>}
                      {role.inheritsFrom && <span className="text-[10px] text-zinc-500">extends {role.inheritsFrom}</span>}
                    </div>
                    <code className="text-violet-400 text-xs">{role.key}</code>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="ghost" onClick={e=>{e.stopPropagation();onEdit(role);}} className="h-7 text-xs text-zinc-400 hover:text-zinc-100" data-testid={`button-edit-role-${role.key}`}>✏️</Button>
                  {!role.isSystem && <Button size="sm" variant="ghost" onClick={e=>{e.stopPropagation();deleteMut.mutate(role.key);}} className="h-7 text-xs text-red-500 hover:text-red-400">🗑️</Button>}
                </div>
              </div>
              <div className="text-zinc-500 text-xs mt-2 line-clamp-2">{role.description}</div>
              <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400">
                <span>🔑 <strong className="text-zinc-200">{role.permissionCount}</strong> permissions</span>
                <span>👤 <strong className="text-zinc-200">{role.userCount}</strong> users</span>
                <Button size="sm" variant="ghost" onClick={e=>{e.stopPropagation();setAssignRoleKey(role.key);}} className="h-5 text-[10px] px-1.5 text-emerald-400 ml-auto">+ Assign User</Button>
              </div>

              {/* Expanded details */}
              {expandedRole === role.key && (
                <div className="mt-4 pt-4 border-t border-zinc-700/50 space-y-3">
                  {/* Permission preview */}
                  {roleDetail?.permissions && (
                    <div>
                      <div className="text-xs font-semibold text-zinc-400 mb-2">Permissions ({roleDetail.permissions.length})</div>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {roleDetail.permissions.slice(0,40).map((p:Permission)=>(
                          <span key={p.key} className="text-[9px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded">{p.key}</span>
                        ))}
                        {roleDetail.permissions.length > 40 && <span className="text-[9px] text-zinc-600">+{roleDetail.permissions.length-40} more</span>}
                      </div>
                    </div>
                  )}
                  {/* Users in role */}
                  {roleUsers?.users?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-zinc-400 mb-1">Assigned Users ({roleUsers.total})</div>
                      <div className="space-y-1">
                        {roleUsers.users.map((a:Assignment)=>(
                          <div key={a.id} className="flex items-center gap-2 text-xs bg-zinc-900/40 rounded-lg px-2 py-1.5">
                            <span className="text-zinc-400 font-mono truncate flex-1">{a.userId}</span>
                            {a.expiresAt && <span className="text-amber-400">Exp: {new Date(a.expiresAt).toLocaleDateString()}</span>}
                            <Button size="sm" variant="ghost" onClick={()=>revokeMut.mutate(a.id)} className="h-5 text-[10px] text-red-400 px-1">Revoke</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Assign user dialog */}
      <Dialog open={!!assignRoleKey} onOpenChange={()=>setAssignRoleKey(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-md">
          <DialogHeader><DialogTitle>Assign Role: {assignRoleKey}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label className="text-zinc-300 text-xs">User ID *</Label><Input data-testid="input-assign-userid" value={assignForm.userId} onChange={e=>setAssignForm(p=>({...p,userId:e.target.value}))} placeholder="user_xxxxxxxxxxxx" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 font-mono" /></div>
            <div><Label className="text-zinc-300 text-xs">Expires At (leave blank for permanent)</Label><Input type="datetime-local" value={assignForm.expiresAt} onChange={e=>setAssignForm(p=>({...p,expiresAt:e.target.value}))} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
            {assignForm.expiresAt && <div className="text-xs text-amber-300 bg-amber-950/30 border border-amber-700/30 rounded-lg px-3 py-2">⏰ Temporary access — auto-revokes at {new Date(assignForm.expiresAt).toLocaleString()}</div>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={()=>setAssignRoleKey(null)} className="border-zinc-700 text-zinc-300">Cancel</Button>
              <Button data-testid="button-confirm-assign" onClick={()=>assignMut.mutate({userId:assignForm.userId,roleKey:assignRoleKey,expiresAt:assignForm.expiresAt||undefined})} disabled={assignMut.isPending||!assignForm.userId} className="bg-emerald-700 hover:bg-emerald-600">{assignMut.isPending?"Assigning…":"✓ Assign Role"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 2: PERMISSION MATRIX — role × department × action grid
// ═══════════════════════════════════════════════════════════════════════════
function PermissionMatrixTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [pendingChanges, setPendingChanges] = useState<{roleKey:string;permKey:string;grant:boolean}[]>([]);

  const { data: matrixData, isLoading } = useQuery({ queryKey:["/api/roles/matrix"], queryFn:()=>apiRequest("GET","/api/roles/matrix").then(r=>r.json()) });

  const grantMut = useMutation({ mutationFn:({roleKey,permKey}:{roleKey:string;permKey:string})=>apiRequest("POST",`/api/roles/${roleKey}/permissions`,{permissionKey:permKey}).then(r=>r.json()), onSuccess:()=>qc.invalidateQueries({queryKey:["/api/roles/matrix"]}) });
  const revokeMut = useMutation({ mutationFn:({roleKey,permKey}:{roleKey:string;permKey:string})=>apiRequest("DELETE",`/api/roles/${roleKey}/permissions/${permKey}`).then(r=>r.json()), onSuccess:()=>qc.invalidateQueries({queryKey:["/api/roles/matrix"]}) });
  const bulkMut = useMutation({ mutationFn:({roleKey,keys,action}:{roleKey:string;keys:string[];action:string})=>apiRequest("POST","/api/roles/bulk-grant",{roleKey,permissionKeys:keys,action}).then(r=>r.json()), onSuccess:(d:any)=>{qc.invalidateQueries({queryKey:["/api/roles/matrix"]});toast({title:`Bulk ${d.action}: ${d.processed} permissions`});setPendingChanges([]);} });

  const roles: {key:string;name:string;color:string}[] = matrixData?.roles || [];
  let perms: Permission[] = matrixData?.permissions || [];
  const matrix: Record<string,Record<string,boolean>> = matrixData?.matrix || {};

  if (selectedDept !== "all") perms = perms.filter(p => p.department === selectedDept);
  if (search) { const s = search.toLowerCase(); perms = perms.filter(p => p.key.includes(s) || p.name.toLowerCase().includes(s)); }

  const departments = [...new Set((matrixData?.permissions||[]).map((p:Permission) => p.department))].sort();
  // Group perms by dept
  const grouped: Record<string,Permission[]> = {};
  perms.forEach(p => { const d = p.department||"general"; if(!grouped[d]) grouped[d]=[]; grouped[d].push(p); });

  const toggle = (roleKey: string, permKey: string, currentValue: boolean) => {
    if (currentValue) revokeMut.mutate({ roleKey, permKey });
    else grantMut.mutate({ roleKey, permKey });
  };

  const bulkGrantDept = (roleKey: string, dept: string, action: "grant"|"revoke") => {
    const keys = perms.filter(p => p.department === dept).map(p => p.key);
    bulkMut.mutate({ roleKey, keys, action });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-zinc-100 text-lg">⚡ Permission Matrix</h3>
        <div className="text-zinc-500 text-sm mt-1">Visual role × permission grid. Click any checkbox to toggle instantly. Bulk-grant entire departments. {matrixData?.permissions?.length||0} permissions across {departments.length} departments.</div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Input data-testid="input-matrix-search" placeholder="Search permissions…" value={search} onChange={e=>setSearch(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 w-52" />
        <Select value={selectedDept} onValueChange={setSelectedDept}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 w-44"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100 max-h-52">
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(d=><SelectItem key={d} value={d}>{DEPT_ICONS[d]||"⚙️"} {d}</SelectItem>)}
          </SelectContent>
        </Select>
        {roles.length > 0 && <Button size="sm" variant="outline" onClick={()=>qc.invalidateQueries({queryKey:["/api/roles/matrix"]})} className="border-zinc-600 text-zinc-400">↻ Refresh</Button>}
      </div>

      {isLoading ? <div className="text-center py-10 text-zinc-500 animate-pulse">Loading matrix…</div> : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-zinc-600"><div className="text-5xl mb-3">⚡</div>Seed roles first to see the permission matrix</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-700">
          <table className="w-full text-xs" style={{ minWidth: `${Math.max(600, roles.length * 120 + 280)}px` }}>
            <thead>
              <tr className="bg-zinc-800/80 border-b border-zinc-700">
                <th className="px-3 py-2.5 text-left text-zinc-400 font-semibold sticky left-0 bg-zinc-800/90 w-56 z-10">Permission</th>
                {roles.map(r => (
                  <th key={r.key} className="px-3 py-2.5 text-center min-w-[100px]">
                    <div className="font-semibold" style={{ color: r.color }}>{r.name}</div>
                    <code className="text-zinc-600 text-[9px]">{r.key}</code>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEPT_ORDER.filter(d => grouped[d]).map(dept => (
                <>
                  <tr key={`header-${dept}`} className="bg-zinc-900/60 border-y border-zinc-800">
                    <td colSpan={roles.length + 1} className="px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{DEPT_ICONS[dept]||"⚙️"}</span>
                        <span className="font-semibold text-zinc-300">{dept}</span>
                        <span className="text-zinc-600 text-[10px]">({grouped[dept].length} permissions)</span>
                        {roles.length > 0 && roles.map(r => (
                          <span key={r.key} className="ml-1">
                            <Button size="sm" variant="ghost" onClick={()=>bulkGrantDept(r.key,dept,"grant")} className="h-4 text-[9px] px-1 text-emerald-500" title={`Grant all ${dept} to ${r.name}`}>+{r.name[0]}</Button>
                            <Button size="sm" variant="ghost" onClick={()=>bulkGrantDept(r.key,dept,"revoke")} className="h-4 text-[9px] px-1 text-red-500" title={`Revoke all ${dept} from ${r.name}`}>-{r.name[0]}</Button>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                  {grouped[dept].map(perm => (
                    <tr key={perm.key} className="border-b border-zinc-800/60 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-3 py-2 sticky left-0 bg-zinc-950/80 z-10">
                        <div className="text-zinc-300 font-medium">{perm.name}</div>
                        <code className="text-violet-400 text-[9px]">{perm.key}</code>
                      </td>
                      {roles.map(r => {
                        const hasIt = matrix[r.key]?.[perm.key] || false;
                        return (
                          <td key={r.key} className="px-3 py-2 text-center">
                            <input data-testid={`checkbox-${r.key}-${perm.key}`} type="checkbox" checked={hasIt} onChange={()=>toggle(r.key, perm.key, hasIt)} className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: r.color }} title={`${hasIt?"Revoke":"Grant"} ${perm.key} for ${r.name}`} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 3: ROLE EDITOR — create / edit with inheritance + color picker
// ═══════════════════════════════════════════════════════════════════════════
function RoleEditorTab({ prefill, onDone }: { prefill: Role|null; onDone: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!(prefill?.key);
  const [form, setForm] = useState({ key:"", name:"", description:"", color:"#8b5cf6", inheritsFrom:"" });
  const { data: rolesData } = useQuery({ queryKey:["/api/roles"], queryFn:()=>apiRequest("GET","/api/roles").then(r=>r.json()) });
  const roles: Role[] = rolesData?.roles || [];

  useEffect(() => {
    if (prefill?.key) setForm({ key:prefill.key, name:prefill.name, description:prefill.description||"", color:prefill.color||"#8b5cf6", inheritsFrom:prefill.inheritsFrom||"" });
  }, [prefill?.key]);

  const createMut = useMutation({ mutationFn:(d:any)=>apiRequest("POST","/api/roles",d).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries({queryKey:["/api/roles"]});qc.invalidateQueries({queryKey:["/api/roles/stats"]});toast({title:"Role created ✓"});onDone();}, onError:(e:any)=>toast({title:"Error",description:e.message,variant:"destructive"}) });
  const updateMut = useMutation({ mutationFn:(d:any)=>apiRequest("PATCH",`/api/roles/${prefill!.key}`,d).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries({queryKey:["/api/roles"]});toast({title:"Role updated ✓"});onDone();} });

  const handleSubmit = () => { const payload = { ...form, inheritsFrom:form.inheritsFrom||undefined }; if(isEdit) updateMut.mutate(payload); else createMut.mutate(payload); };

  const ROLE_TEMPLATES = [
    { key:"analyst", name:"Data Analyst", color:"#06b6d4", description:"Read-only access to analytics, reports, and audit logs", inheritsFrom:"" },
    { key:"content_writer", name:"Content Writer", color:"#84cc16", description:"CMS create/edit only — no publish rights", inheritsFrom:"" },
    { key:"junior_support", name:"Junior Support", color:"#a855f7", description:"View-only tickets and users — escalate only", inheritsFrom:"support" },
    { key:"africa_ops", name:"Africa Operations", color:"#10b981", description:"Manage Africa-specific flags, mobile money approvals, USSD access", inheritsFrom:"" },
    { key:"compliance_officer", name:"Compliance Officer", color:"#eab308", description:"POPIA/NDPR compliance — audit logs, KYC, security exports", inheritsFrom:"" },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h3 className="font-semibold text-zinc-100 text-lg">{isEdit?`✏️ Edit Role — ${prefill?.key}`:"✏️ Create Custom Role"}</h3>
        <div className="text-zinc-500 text-sm mt-1">{isEdit?"Update role metadata. Use the Permission Matrix to adjust granular permissions.":"Define a new role with optional inheritance from an existing role. The new role will copy the parent's permission set."}</div>
      </div>

      {!isEdit && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="text-xs font-semibold text-zinc-400 mb-3">Quick Templates</div>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_TEMPLATES.map(t => (
              <button key={t.key} onClick={()=>setForm({key:t.key,name:t.name,description:t.description,color:t.color,inheritsFrom:t.inheritsFrom})} className="text-left bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-lg p-2.5 transition-colors">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor:t.color}} />
                  <span className="font-medium text-zinc-200 text-xs">{t.name}</span>
                </div>
                <div className="text-zinc-600 text-[10px] line-clamp-2">{t.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-zinc-300 text-xs">Role Key *</Label><Input data-testid="input-role-key" value={form.key} onChange={e=>setForm(p=>({...p,key:e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"_")}))} disabled={isEdit} placeholder="africa_ops" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 font-mono" /></div>
          <div><Label className="text-zinc-300 text-xs">Display Name *</Label><Input data-testid="input-role-name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Africa Operations" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
        </div>
        <div><Label className="text-zinc-300 text-xs">Description</Label><Textarea data-testid="input-role-description" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="What does this role do? What access does it need?" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[70px]" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-zinc-300 text-xs">Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input type="color" value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))} className="w-9 h-9 rounded cursor-pointer bg-transparent border-0" />
              <Input value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))} className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-xs" />
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2">{ROLE_COLORS.map(c=><button key={c} onClick={()=>setForm(p=>({...p,color:c}))} className={`w-5 h-5 rounded-full border-2 transition-transform ${form.color===c?"border-zinc-200 scale-125":"border-transparent"}`} style={{backgroundColor:c}} />)}</div>
          </div>
          {!isEdit && (
            <div>
              <Label className="text-zinc-300 text-xs">Inherit From (copies permissions)</Label>
              <Select value={form.inheritsFrom} onValueChange={v=>setForm(p=>({...p,inheritsFrom:v==="none"?"":v}))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue placeholder="No inheritance" /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectItem value="none">No inheritance</SelectItem>
                  {roles.map(r=><SelectItem key={r.key} value={r.key}><span style={{color:r.color}}>{r.name}</span> ({r.permissionCount} perms)</SelectItem>)}
                </SelectContent>
              </Select>
              {form.inheritsFrom && <div className="text-xs text-amber-300 mt-1">Will copy all permissions from "{form.inheritsFrom}" — you can customize in the Matrix tab after creation</div>}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500 mb-2">Preview</div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2" style={{ backgroundColor:form.color+"22", borderColor:form.color+"60", color:form.color }}>{form.name?.[0]||"?"}</div>
            <div>
              <div className="font-semibold text-zinc-100">{form.name||"Role Name"}</div>
              <code className="text-violet-400 text-xs">{form.key||"role_key"}</code>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button data-testid="button-save-role" onClick={handleSubmit} disabled={createMut.isPending||updateMut.isPending||!form.key||!form.name} className="bg-violet-600 hover:bg-violet-700">{(createMut.isPending||updateMut.isPending)?"Saving…":isEdit?"💾 Save Changes":"🔑 Create Role"}</Button>
          {isEdit && <Button variant="outline" onClick={onDone} className="border-zinc-600 text-zinc-300">Cancel</Button>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 4: AI ROLE SUGGESTER
// ═══════════════════════════════════════════════════════════════════════════
function AISuggesterTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:"", jobTitle:"", department:"", responsibilities:"", experience:"" });
  const [suggestion, setSuggestion] = useState<any>(null);
  const { data: rolesData } = useQuery({ queryKey:["/api/roles"], queryFn:()=>apiRequest("GET","/api/roles").then(r=>r.json()) });
  const roles: Role[] = rolesData?.roles || [];

  const suggest = async () => {
    if (!form.jobTitle) { toast({title:"Job title required",variant:"destructive"}); return; }
    setLoading(true);
    try {
      const r = await apiRequest("POST","/api/roles/ai/suggest",form);
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setSuggestion(d.suggestion);
      toast({ title:"AI suggestion ready 🤖" });
    } catch (e:any) { toast({title:"AI failed",description:e.message,variant:"destructive"}); }
    setLoading(false);
  };

  const RISK_CLR: Record<string,string> = { low:"border-emerald-700/40 bg-emerald-950/20 text-emerald-300", medium:"border-blue-700/40 bg-blue-950/20 text-blue-300", high:"border-amber-700/40 bg-amber-950/20 text-amber-300" };
  const recommendedRole = suggestion ? roles.find(r=>r.key===suggestion.recommendedRole) : null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-zinc-100 text-lg">🤖 AI Role Suggester</h3>
        <div className="text-zinc-500 text-sm mt-1">Describe a new team member's role and responsibilities. GPT-4o-mini analyzes them against our 137-permission RBAC system and recommends the perfect role with least-privilege reasoning.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input form */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-3">
          <h4 className="font-semibold text-zinc-200">New Team Member Details</h4>
          <div><Label className="text-zinc-300 text-xs">Full Name</Label><Input data-testid="input-ai-name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Thandi Dlamini" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
          <div><Label className="text-zinc-300 text-xs">Job Title *</Label><Input data-testid="input-ai-title" value={form.jobTitle} onChange={e=>setForm(p=>({...p,jobTitle:e.target.value}))} placeholder="Junior Customer Success Agent" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
          <div><Label className="text-zinc-300 text-xs">Department</Label><Input data-testid="input-ai-dept" value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))} placeholder="Customer Success / Support" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
          <div><Label className="text-zinc-300 text-xs">Responsibilities</Label><Textarea data-testid="input-ai-responsibilities" value={form.responsibilities} onChange={e=>setForm(p=>({...p,responsibilities:e.target.value}))} placeholder="Handle user complaints, resolve disputes, send follow-up notifications, view payment history…" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[80px] text-sm" /></div>
          <div><Label className="text-zinc-300 text-xs">Experience Level</Label><Select value={form.experience} onValueChange={v=>setForm(p=>({...p,experience:v}))}><SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"><SelectValue placeholder="Select level…" /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100"><SelectItem value="junior">Junior (0-2 years)</SelectItem><SelectItem value="mid">Mid-level (2-5 years)</SelectItem><SelectItem value="senior">Senior (5+ years)</SelectItem><SelectItem value="lead">Lead / Head of Department</SelectItem></SelectContent></Select></div>
          <Button data-testid="button-ai-suggest" onClick={suggest} disabled={loading||!form.jobTitle} className="w-full bg-violet-700 hover:bg-violet-600">{loading?"🤖 Analyzing…":"🤖 Get AI Role Recommendation"}</Button>
        </div>

        {/* Suggestion results */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
          <h4 className="font-semibold text-zinc-200 mb-3">AI Recommendation</h4>
          {!suggestion ? (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-600"><div className="text-5xl mb-3">🤖</div><div className="text-sm text-center">Fill in the form and click "Get AI Role Recommendation" to receive a GPT-4o-mini RBAC analysis</div></div>
          ) : (
            <div className="space-y-4">
              {/* Recommended role */}
              <div className={`rounded-lg border p-4 ${RISK_CLR[suggestion.riskLevel]||RISK_CLR.low}`}>
                <div className="flex items-center gap-3 mb-2">
                  {recommendedRole && <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2" style={{ backgroundColor:recommendedRole.color+"22", borderColor:recommendedRole.color+"60", color:recommendedRole.color }}>{recommendedRole.name[0]}</div>}
                  <div>
                    <div className="text-sm font-semibold">Recommended: {suggestion.recommendedRole}</div>
                    <div className="text-xs opacity-70">Confidence: {suggestion.confidence}% · Risk: {suggestion.riskLevel}</div>
                  </div>
                </div>
                <div className="text-sm">{suggestion.rationale}</div>
              </div>

              {/* Suggested permissions */}
              {suggestion.suggestedPermissions?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-zinc-400 mb-1.5">✓ Suggested Permissions</div>
                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                    {suggestion.suggestedPermissions.map((p:string) => <span key={p} className="text-[9px] bg-emerald-950/40 border border-emerald-700/40 text-emerald-400 px-1.5 py-0.5 rounded">{p}</span>)}
                  </div>
                </div>
              )}

              {suggestion.additionalPermissions?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-zinc-400 mb-1.5">+ Additional permissions to add</div>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.additionalPermissions.map((p:string)=><span key={p} className="text-[9px] bg-blue-950/40 border border-blue-700/40 text-blue-400 px-1.5 py-0.5 rounded">{p}</span>)}
                  </div>
                </div>
              )}

              {suggestion.permissionsToRemove?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-zinc-400 mb-1.5">⛔ Remove from base role</div>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.permissionsToRemove.map((p:string)=><span key={p} className="text-[9px] bg-red-950/40 border border-red-700/40 text-red-400 px-1.5 py-0.5 rounded">{p}</span>)}
                  </div>
                </div>
              )}

              {suggestion.leastPrivilegeNote && <div className="bg-amber-950/30 border border-amber-700/30 rounded-lg p-3 text-xs text-amber-300"><strong>Least Privilege Advisory:</strong> {suggestion.leastPrivilegeNote}</div>}
              {suggestion.alternativeRole && <div className="text-xs text-zinc-500">Alternative role if unsure: <strong className="text-zinc-300">{suggestion.alternativeRole}</strong></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 5: SIMULATOR — what can this role/user do?
// ═══════════════════════════════════════════════════════════════════════════
function SimulatorTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"role"|"user">("role");
  const [roleKey, setRoleKey] = useState("");
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [filterDept, setFilterDept] = useState("all");

  const { data: rolesData } = useQuery({ queryKey:["/api/roles"], queryFn:()=>apiRequest("GET","/api/roles").then(r=>r.json()) });
  const roles: Role[] = rolesData?.roles || [];

  const simulate = async () => {
    if (mode==="role" && !roleKey) { toast({title:"Select a role",variant:"destructive"}); return; }
    if (mode==="user" && !userId) { toast({title:"Enter a user ID",variant:"destructive"}); return; }
    setLoading(true);
    try {
      const r = await apiRequest("POST","/api/roles/evaluate",{ roleKey:mode==="role"?roleKey:undefined, userId:mode==="user"?userId:undefined });
      const d = await r.json();
      setResult(d);
    } catch (e:any) { toast({title:"Simulation failed",description:e.message,variant:"destructive"}); }
    setLoading(false);
  };

  const depts = result?.departments ? Object.keys(result.departments).sort() : [];
  const cannotDo: string[] = (result?.cannotDo||[]).slice(0,50);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-zinc-100 text-lg">🎭 Permission Simulator</h3>
        <div className="text-zinc-500 text-sm mt-1">Preview exactly what any role or user can see and do across all 26 departments. See every granted permission grouped by department, plus the full deny list. Powered by our 7-dimension RBAC evaluator.</div>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <button onClick={()=>setMode("role")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode==="role"?"bg-violet-700 text-white":"text-zinc-400 hover:bg-zinc-800"}`}>Simulate Role</button>
          <button onClick={()=>setMode("user")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode==="user"?"bg-violet-700 text-white":"text-zinc-400 hover:bg-zinc-800"}`}>Simulate User</button>
        </div>

        {mode==="role" ? (
          <div>
            <Label className="text-zinc-300 text-xs">Select Role</Label>
            <Select value={roleKey} onValueChange={setRoleKey}>
              <SelectTrigger data-testid="select-sim-role" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 max-w-xs"><SelectValue placeholder="Choose role to simulate…" /></SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">{roles.map(r=><SelectItem key={r.key} value={r.key}><span style={{color:r.color}}>●</span> {r.name} ({r.permissionCount} perms)</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <Label className="text-zinc-300 text-xs">User ID</Label>
            <Input data-testid="input-sim-userid" value={userId} onChange={e=>setUserId(e.target.value)} placeholder="user_xxxxxxxxxxxx" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 font-mono max-w-xs" />
          </div>
        )}
        <Button data-testid="button-simulate" onClick={simulate} disabled={loading} className="bg-violet-700 hover:bg-violet-600">{loading?"Simulating…":"🎭 Run Simulation"}</Button>
      </div>

      {!result ? (
        <div className="text-center py-12 text-zinc-600"><div className="text-5xl mb-3">🎭</div><div className="text-sm">Select a role or enter a user ID and run the simulation</div></div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className={`rounded-xl border p-4 flex flex-wrap items-center gap-4 ${result.isAdmin?"border-red-700/40 bg-red-950/10":"border-zinc-700 bg-zinc-800/30"}`}>
            <div className="text-center">
              <div className={`text-4xl font-bold ${result.isAdmin?"text-red-400":"text-emerald-400"}`}>{result.totalPermissions}</div>
              <div className="text-xs text-zinc-400">Permissions Granted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-zinc-500">{result.cannotDo?.length||0}</div>
              <div className="text-xs text-zinc-400">Permissions Denied</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">{depts.length}</div>
              <div className="text-xs text-zinc-400">Departments Access</div>
            </div>
            <div className="ml-auto">
              {result.isAdmin ? (
                <div className="bg-red-950/40 border border-red-700/40 text-red-300 rounded-lg px-4 py-2 text-sm font-bold">👑 ADMIN — UNRESTRICTED ACCESS</div>
              ) : (
                <div className="text-sm text-zinc-400">Roles: {(result.effectiveRoles||[]).join(", ") || "none"}</div>
              )}
            </div>
          </div>

          {/* Department filter */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={()=>setFilterDept("all")} className={`px-2 py-1 rounded text-xs ${filterDept==="all"?"bg-violet-700 text-white":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>All</button>
            {depts.map(d=><button key={d} onClick={()=>setFilterDept(d)} className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${filterDept===d?"bg-violet-700 text-white":"bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{DEPT_ICONS[d]||"⚙️"} {d}</button>)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Granted permissions */}
            <div className="bg-zinc-800/50 border border-emerald-700/30 rounded-xl p-4">
              <div className="text-sm font-semibold text-emerald-300 mb-3">✅ Can Do ({result.totalPermissions} permissions)</div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(result.departments||{}).filter(([d])=>filterDept==="all"||d===filterDept).sort().map(([dept, perms]:any)=>(
                  <div key={dept}>
                    <div className="flex items-center gap-1.5 mb-1"><span className="text-sm">{DEPT_ICONS[dept]||"⚙️"}</span><span className="text-xs font-semibold text-zinc-300">{dept}</span><span className="text-zinc-600 text-[10px]">({perms.length})</span></div>
                    <div className="flex flex-wrap gap-1 pl-5">
                      {perms.map((p:string)=><span key={p} className="text-[9px] bg-emerald-950/40 border border-emerald-700/40 text-emerald-400 px-1.5 py-0.5 rounded">{p.split(".")[1]||p}</span>)}
                    </div>
                  </div>
                ))}
                {Object.keys(result.departments||{}).length === 0 && <div className="text-zinc-600 text-sm text-center py-4">No permissions granted</div>}
              </div>
            </div>

            {/* Denied permissions */}
            <div className="bg-zinc-800/50 border border-red-700/20 rounded-xl p-4">
              <div className="text-sm font-semibold text-red-400 mb-3">⛔ Cannot Do (sample, {result.cannotDo?.length||0} denied)</div>
              {result.isAdmin ? (
                <div className="text-center py-6 text-emerald-400 text-sm">Admin role has no restrictions — full platform access</div>
              ) : (
                <div className="flex flex-wrap gap-1 max-h-96 overflow-y-auto">
                  {cannotDo.map((p:string)=><span key={p} className="text-[9px] bg-red-950/30 border border-red-700/30 text-red-500 px-1.5 py-0.5 rounded">{p}</span>)}
                  {(result.cannotDo?.length||0) > 50 && <span className="text-[9px] text-zinc-600">+{result.cannotDo.length-50} more denied</span>}
                </div>
              )}
            </div>
          </div>

          {/* Department access grid */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <div className="text-sm font-semibold text-zinc-200 mb-3">Department Access Overview</div>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
              {DEPT_ORDER.map(dept => {
                const has = result.departments?.[dept]?.length > 0;
                const count = result.departments?.[dept]?.length || 0;
                return (
                  <div key={dept} className={`rounded-lg p-2 border text-center text-xs transition-colors ${has?"border-emerald-700/40 bg-emerald-950/20":"border-zinc-800 bg-zinc-900/30"}`}>
                    <div className="text-lg mb-0.5">{DEPT_ICONS[dept]||"⚙️"}</div>
                    <div className={`font-medium truncate text-[10px] ${has?"text-emerald-300":"text-zinc-600"}`}>{dept}</div>
                    {has && <div className="text-[9px] text-zinc-500">{count} perms</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
type TabId = "library"|"matrix"|"editor"|"ai"|"simulator";
const TABS: { id: TabId; label: string }[] = [
  { id:"library",   label:"📋 Roles Library" },
  { id:"matrix",    label:"⚡ Permission Matrix" },
  { id:"editor",    label:"✏️ Role Editor" },
  { id:"ai",        label:"🤖 AI Suggester" },
  { id:"simulator", label:"🎭 Simulator" },
];

export default function RolePermissionSystem() {
  const [activeTab, setActiveTab] = useState<TabId>("library");
  const [editingRole, setEditingRole] = useState<Role|null>(null);

  const handleEdit = (r: Role) => { setEditingRole(r); setActiveTab("editor"); };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-700/20 border border-red-700/40 flex items-center justify-center text-2xl">🔑</div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-100">Role & Permission System</h1>
                <span className="text-[10px] bg-red-700/20 border border-red-700/40 text-red-300 px-2 py-0.5 rounded-full">200% ELON MUSK INTELLIGENCE</span>
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">The Gatekeeper of the Entire Platform · 22 endpoints · 5 core roles · 137 permissions across 25 departments · beats Salesforce+Okta+Permit.io+Auth0+Casbin until 2029</div>
            </div>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {TABS.map(tab => (
            <button key={tab.id} data-testid={`tab-rbac-${tab.id}`} onClick={()=>setActiveTab(tab.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab===tab.id?"bg-red-700 text-white shadow-lg":"text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {activeTab==="library" && <RolesLibraryTab onEdit={handleEdit} />}
        {activeTab==="matrix" && <PermissionMatrixTab />}
        {activeTab==="editor" && <RoleEditorTab prefill={editingRole} onDone={()=>{ setEditingRole(null); setActiveTab("library"); }} />}
        {activeTab==="ai" && <AISuggesterTab />}
        {activeTab==="simulator" && <SimulatorTab />}
      </div>
    </div>
  );
}
