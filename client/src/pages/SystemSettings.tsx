/**
 * SYSTEM SETTINGS & NOTIFICATIONS CENTRE — /admin/settings
 * FreelanceSkills.net Production Control Panel
 *
 * FINAL LAYER: Maintenance mode, commission control, email/SMS config, notification templates,
 * API documentation, system health monitoring, and one-click exports.
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { io } from "socket.io-client";

interface Settings {
  maintenance: boolean;
  maintenanceMessage: string;
  commissionBPS: number;
  referralBonusPercent: number;
  escrowAutoReleaseHours: number;
  darkMode: boolean;
  payfast: { merchantId: string; enabled: boolean; testMode: boolean };
  email: { provider: string; enabled: boolean };
  sms: { provider: string; enabled: boolean };
  notifications: { enablePush: boolean; enableEmail: boolean; enableSMS: boolean };
  academy: { contentModerationEnabled: boolean; autoPublishCourses: boolean };
}

interface NotifTemplate {
  name: string;
  subject: string;
  emailBody: string;
  smsBody: string;
  enabled: boolean;
}

interface SystemHealth {
  status: string;
  uptime: number;
  memory: Record<string, string>;
  socketIO: { engine: string; connectedClients: number };
  database: string;
  services: Record<string, string>;
}

type Tab = "overview" | "notifications" | "integrations" | "api" | "health" | "docs";

function fmtBytes(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(0) + "MB";
}

function fmtUptime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

export default function SystemSettings() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [maintenanceForm, setMaintenanceForm] = useState({ enabled: false, message: "" });
  const [testNotifForm, setTestNotifForm] = useState({ templateId: "job_posted", recipient: "", channel: "email" });
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    const socket = io({ path: "/socket.io", transports: ["websocket", "polling"] });
    socket.on("system_broadcast", (d: any) => {
      toast({ title: `${d.icon} ${d.title}`, description: d.message });
    });
    return () => { socket.disconnect(); };
  }, []);

  const { data } = useQuery({
    queryKey: ["/api/system-settings"],
    queryFn: () => fetch("/api/system-settings", { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });

  const { data: healthData } = useQuery({
    queryKey: ["/api/system-settings/health"],
    queryFn: () => fetch("/api/system-settings/health", { credentials: "include" }).then(r => r.json()),
    refetchInterval: 10000,
  });

  const settings: Settings = data?.settings || {};
  const templates: Record<string, NotifTemplate> = data?.templates || {};
  const health: SystemHealth = healthData || {};

  const updateSettingsMut = useMutation({
    mutationFn: (updates: Partial<Settings>) => 
      fetch("/api/system-settings", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) })
        .then(r => r.json()),
    onSuccess: () => { toast({ title: "Settings saved ✅" }); qc.invalidateQueries({ queryKey: ["/api/system-settings"] }); },
  });

  const testNotifMut = useMutation({
    mutationFn: () =>
      fetch("/api/system-settings/notifications/send-test", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testNotifForm),
      }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Test notification sent ✅" }); setTestNotifForm(f => ({ ...f, recipient: "" })); },
  });

  const broadcastMut = useMutation({
    mutationFn: (msg: { title: string; message: string; audience: "admins" | "all" }) =>
      fetch("/api/system-settings/broadcast", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      }).then(r => r.json()),
    onSuccess: () => toast({ title: "Broadcast sent 📢" }),
  });

  const exportBackup = () => {
    fetch("/api/system-settings/backup", { credentials: "include" })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `FSN-Backup-${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "System backup exported ✅" });
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/admin")} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">⚙️ SYSTEM SETTINGS & CONTROL PANEL</h1>
            <p className="text-[10px] text-gray-500">Platform configuration · Notifications · Integrations · API docs · Health monitoring</p>
          </div>
          <button onClick={exportBackup}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "#6b7280" }}>
            📥 Export Backup
          </button>
        </div>

        {/* Tab nav */}
        <div className="max-w-screen-2xl mx-auto flex border-t border-gray-100 overflow-x-auto">
          {[
            { key: "overview", label: "📊 Overview & Settings" },
            { key: "notifications", label: "🔔 Notifications Centre" },
            { key: "integrations", label: "🔗 Integrations" },
            { key: "api", label: "📡 API Documentation" },
            { key: "health", label: "💚 System Health" },
            { key: "docs", label: "📖 Deployment Guide" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as Tab)}
              className={`px-5 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${activeTab === t.key ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">

        {/* ═════════════════════════════════════════════════════════════
            TAB 1: OVERVIEW & SETTINGS
        ═════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Maintenance mode */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">🚨 Maintenance Mode</h3>
              <div className="flex items-center gap-4">
                <input type="checkbox" id="maintenance" checked={maintenanceForm.enabled}
                  onChange={e => setMaintenanceForm(f => ({ ...f, enabled: e.target.checked }))} />
                <label htmlFor="maintenance" className="text-sm text-gray-700">Enable maintenance mode (all users see message)</label>
                <button onClick={() => updateSettingsMut.mutate({ maintenance: maintenanceForm.enabled })}
                  className="ml-auto px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "#ef4444" }}>
                  Apply
                </button>
              </div>
              <input type="text" value={maintenanceForm.message} onChange={e => setMaintenanceForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Brief maintenance message (e.g. 'Database migration in progress. Back in 30 mins.')"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>

            {/* Platform settings grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Platform Commission", key: "commissionBPS", type: "number", value: settings.commissionBPS, help: "Basis points (1000 = 10%)" },
                { label: "Referral Bonus %", key: "referralBonusPercent", type: "number", value: settings.referralBonusPercent, help: "Percentage of job value" },
                { label: "Escrow Auto-Release (hours)", key: "escrowAutoReleaseHours", type: "number", value: settings.escrowAutoReleaseHours, help: "For low-risk transactions" },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                  <label className="text-xs text-gray-500">{item.label}</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input type={item.type} value={item.value} onChange={e => {
                      const val = item.type === "number" ? Number(e.target.value) : e.target.value;
                      updateSettingsMut.mutate({ [item.key]: val });
                    }}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold" />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">{item.help}</div>
                </div>
              ))}
            </div>

            {/* Feature toggles */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">🎛️ Feature Toggles</h3>
              <div className="space-y-3">
                {[
                  { label: "Enable Push Notifications", key: "enablePush", current: settings.notifications?.enablePush },
                  { label: "Enable Email Notifications", key: "enableEmail", current: settings.notifications?.enableEmail },
                  { label: "Enable SMS Notifications", key: "enableSMS", current: settings.notifications?.enableSMS },
                  { label: "Academy Content Moderation", key: "contentModerationEnabled", current: settings.academy?.contentModerationEnabled },
                  { label: "Dark Mode Available", key: "darkMode", current: settings.darkMode },
                ].map((t, i) => (
                  <label key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={t.current} onChange={e => {
                      const updates: any = {};
                      if (t.key === "enablePush" || t.key === "enableEmail" || t.key === "enableSMS") {
                        updates.notifications = { ...settings.notifications, [t.key]: e.target.checked };
                      } else if (t.key === "contentModerationEnabled") {
                        updates.academy = { ...settings.academy, [t.key]: e.target.checked };
                      } else {
                        updates[t.key] = e.target.checked;
                      }
                      updateSettingsMut.mutate(updates);
                    }} className="w-5 h-5" />
                    <span className="text-sm text-gray-700">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            TAB 2: NOTIFICATIONS CENTRE
        ═════════════════════════════════════════════════════════════ */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            {/* Test notification sender */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">🧪 Send Test Notification</h3>
              <div className="grid grid-cols-3 gap-4">
                <select value={testNotifForm.templateId} onChange={e => setTestNotifForm(f => ({ ...f, templateId: e.target.value }))}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  {Object.entries(templates).map(([k, v]) => (
                    <option key={k} value={k}>{v.name}</option>
                  ))}
                </select>
                <input type="email" value={testNotifForm.recipient} onChange={e => setTestNotifForm(f => ({ ...f, recipient: e.target.value }))}
                  placeholder="recipient@example.com" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
                <select value={testNotifForm.channel} onChange={e => setTestNotifForm(f => ({ ...f, channel: e.target.value }))}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  <option value="email">📧 Email</option>
                  <option value="sms">📱 SMS</option>
                  <option value="push">🔔 Push</option>
                </select>
              </div>
              <button onClick={() => testNotifMut.mutate()} disabled={!testNotifForm.recipient || testNotifMut.isPending}
                className="w-full py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: "#6366f1" }}>
                {testNotifMut.isPending ? "Sending…" : "Send Test"}
              </button>
            </div>

            {/* Broadcast to all */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">📢 Global Broadcast</h3>
              <p className="text-xs text-gray-500">Send system-wide message to all users or admins only</p>
              <div className="space-y-3">
                <input type="text" placeholder="Broadcast title" defaultValue="⚡ Platform Update"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" id="bcast-title" />
                <textarea placeholder="Broadcast message (e.g., 'New feature released: AI Resume Builder')" rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none" id="bcast-msg" />
                <div className="flex gap-3">
                  <button onClick={() => broadcastMut.mutate({
                    title: (document.getElementById("bcast-title") as HTMLInputElement).value,
                    message: (document.getElementById("bcast-msg") as HTMLTextAreaElement).value,
                    audience: "admins",
                  })}
                    className="flex-1 py-2 rounded-lg text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50">
                    Send to Admins
                  </button>
                  <button onClick={() => broadcastMut.mutate({
                    title: (document.getElementById("bcast-title") as HTMLInputElement).value,
                    message: (document.getElementById("bcast-msg") as HTMLTextAreaElement).value,
                    audience: "all",
                  })}
                    className="flex-1 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "#ef4444" }}>
                    Send to All Users
                  </button>
                </div>
              </div>
            </div>

            {/* Notification templates */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">📧 Notification Templates</h3>
              <div className="space-y-4">
                {Object.entries(templates).map(([id, template]) => (
                  <div key={id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">{template.name}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Subject: {template.subject}</div>
                      </div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={template.enabled} className="w-4 h-4" />
                        <span className="text-xs text-gray-600">Enabled</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <div className="font-bold text-gray-600">📧 Email</div>
                        <div className="text-gray-500 mt-1">{template.emailBody.slice(0, 80)}…</div>
                      </div>
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <div className="font-bold text-gray-600">📱 SMS</div>
                        <div className="text-gray-500 mt-1">{template.smsBody.slice(0, 80)}…</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            TAB 3: INTEGRATIONS
        ═════════════════════════════════════════════════════════════ */}
        {activeTab === "integrations" && (
          <div className="space-y-6">
            {[
              { name: "PayFast", icon: "💳", status: settings.payfast?.enabled, config: "Merchant ID: 34092651" },
              { name: "Resend (Email)", icon: "📧", status: settings.email?.enabled, config: "API Key: ***REDACTED***" },
              { name: "Twilio (SMS)", icon: "📱", status: settings.sms?.enabled, config: "Account SID: ***REDACTED***" },
            ].map((int, i) => (
              <div key={i} className={`rounded-2xl border p-6 ${int.status ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{int.icon}</span>
                    <div>
                      <div className="font-bold text-gray-900">{int.name}</div>
                      <div className="text-xs text-gray-500">{int.config}</div>
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full ${int.status ? "bg-emerald-200 text-emerald-800" : "bg-red-200 text-red-800"}`}>
                    {int.status ? "✅ Connected" : "❌ Disconnected"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            TAB 4: API DOCUMENTATION
        ═════════════════════════════════════════════════════════════ */}
        {activeTab === "api" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">📡 API Documentation</h3>
              <p className="text-xs text-gray-500 mb-4">Full OpenAPI 3.0 specification available for external developers & partners</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "📚 Full Swagger UI", path: "/api/docs", icon: "📖" },
                  { label: "🔐 Authentication", path: "#auth", icon: "🔑" },
                  { label: "💳 Payments API", path: "#payments", icon: "💰" },
                  { label: "👥 Freelancers API", path: "#freelancers", icon: "🧑‍💻" },
                  { label: "🎓 Academy API", path: "#academy", icon: "📚" },
                  { label: "📊 Analytics API", path: "#analytics", icon: "📈" },
                ].map((api, i) => (
                  <button key={i} onClick={() => window.open(api.path)}
                    className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-left transition-colors">
                    <div className="text-xl mb-1">{api.icon}</div>
                    <div className="text-sm font-semibold text-gray-900">{api.label}</div>
                    <div className="text-xs text-gray-400">{api.path}</div>
                  </button>
                ))}
              </div>

              {/* Example API endpoints */}
              <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 font-mono text-xs space-y-2">
                <div className="font-bold text-gray-800">Available Endpoints:</div>
                <div className="text-gray-600">POST /api/auth/login</div>
                <div className="text-gray-600">GET /api/academy-admin/stats</div>
                <div className="text-gray-600">POST /api/payments/transactions/:id/release</div>
                <div className="text-gray-600">GET /api/analytics/dashboard</div>
                <div className="text-gray-600">+ 40+ more endpoints</div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            TAB 5: SYSTEM HEALTH
        ═════════════════════════════════════════════════════════════ */}
        {activeTab === "health" && (
          <div className="space-y-6">
            {health.status && (
              <>
                {/* Status cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Uptime", value: fmtUptime(health.uptime || 0), color: "#1DBF73" },
                    { label: "Heap Used", value: health.memory?.heapUsed || "—", color: "#3b82f6" },
                    { label: "Connected Clients", value: String(health.socketIO?.connectedClients || 0), color: "#f59e0b" },
                    { label: "Database", value: health.database, color: "#8b5cf6" },
                  ].map((m, i) => (
                    <div key={i} className="rounded-xl p-4 border border-gray-200 bg-white text-center">
                      <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Services status */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">🛠️ Services Status</h3>
                  <div className="space-y-2">
                    {health.services && Object.entries(health.services).map(([name, status]) => (
                      <div key={name} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                        <span className="text-sm text-gray-700 capitalize">{name}</span>
                        <span className={`text-xs font-bold ${status === "Connected" ? "text-emerald-600" : "text-red-600"}`}>
                          {status === "Connected" ? "✅" : "❌"} {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            TAB 6: DEPLOYMENT GUIDE
        ═════════════════════════════════════════════════════════════ */}
        {activeTab === "docs" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">📖 Production Deployment Guide</h3>
              <p className="text-xs text-gray-500">Read the complete README.md in your repo for detailed deployment instructions</p>
              {[
                { title: "🚀 Quick Start (Development)", steps: ["npm install", "npm run dev", "Open http://localhost:5173"] },
                { title: "🌐 Deploy to Render (Backend)", steps: ["Connect GitHub repo", "Set NODE_ENV=production", "Configure MongoDB Atlas", "Run npm run build"] },
                { title: "⚡ Deploy to Vercel (Frontend)", steps: ["npx vercel", "Set API_URL env var", "Connect to backend", "Deploy"] },
                { title: "📊 Monitoring & Scaling", steps: ["Use PM2: pm2 start app.js", "Monitor Socket.io connections", "Setup Redis for cache", "Database sharding ready"] },
              ].map((section, i) => (
                <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="font-bold text-gray-900 mb-2">{section.title}</div>
                  <ol className="text-xs text-gray-600 space-y-1">
                    {section.steps.map((step, j) => (
                      <li key={j}>{j + 1}. {step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
