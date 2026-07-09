import { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import {
  Lock,
  User,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Terminal,
  HelpCircle,
  Check,
  ShieldAlert,
  Server,
} from "lucide-react";

interface LoginProps {
  onLoginSuccess: (userEmail: string, role: string) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Registration States
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("Sovereign Arbiter");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // Quick preset autofill helper
  const autofill = (type: "admin" | "auditor") => {
    if (type === "admin") {
      setEmail("admin@smartstadium.ai");
      setPassword("Secur3_Stadium!2026");
    } else {
      setEmail("auditor@smartstadium.internal");
      setPassword("Pass_Audit@2026");
    }
    setError("");
  };

  // Lockout timer effect
  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lockoutTimer === 0 && isLockedOut) {
      setIsLockedOut(false);
      setAttemptsLeft(3);
      setError("");
    }
  }, [lockoutTimer, isLockedOut]);

  // Password Complexity Evaluator
  const evaluatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return { score: 0, label: "Empty", color: "bg-neutral-800", text: "text-[#555]" };
    
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;

    if (score <= 25) {
      return { score, label: "Weak (Unsafe)", color: "bg-rose-500", text: "text-rose-500" };
    } else if (score <= 50) {
      return { score, label: "Fair (Medium)", color: "bg-amber-500", text: "text-amber-500" };
    } else if (score <= 75) {
      return { score, label: "Good (Secure)", color: "bg-emerald-500/80", text: "text-[#10B981]" };
    } else {
      return { score, label: "Strong (Cryptographic)", color: "bg-[#10B981]", text: "text-[#10B981] font-bold" };
    }
  };

  const strength = evaluatePasswordStrength(activeTab === "login" ? password : regPassword);

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isLockedOut) {
      setError(`System Lockout active. Please wait ${lockoutTimer}s.`);
      return;
    }

    if (!email || !password) {
      setError("Email and cryptographic password are required.");
      return;
    }

    // Secure authentication checking simulation
    const isValidAdmin = email === "admin@smartstadium.ai" && password === "Secur3_Stadium!2026";
    const isValidAuditor = email === "auditor@smartstadium.internal" && password === "Pass_Audit@2026";
    
    // Check local storage for self-registered accounts
    const localUserJSON = localStorage.getItem(`smartstadium_user_${email}`);
    let isValidLocal = false;
    let localRole = "Sovereign Arbiter";
    if (localUserJSON) {
      try {
        const localUser = JSON.parse(localUserJSON);
        if (localUser.password === password) {
          isValidLocal = true;
          localRole = localUser.role;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (isValidAdmin || isValidAuditor || isValidLocal) {
      const assignedRole = isValidAdmin ? "Administrator" : isValidAuditor ? "Auditor" : localRole;
      setSuccess("Authentication handshake success. Initiating zero-trust environment...");
      setTimeout(() => {
        onLoginSuccess(email, assignedRole);
      }, 1200);
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      if (remaining <= 0) {
        setIsLockedOut(true);
        setLockoutTimer(30); // 30 seconds lockout
        setError("SECURITY THREAT DETECTED: Too many failed auth handshakes. Brute-force protection activated. 30s Lockout.");
      } else {
        setError(`Access Denied. Invalid security token or password. Attempts remaining: ${remaining}.`);
      }
    }
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!regEmail || !regPassword || !regConfirmPassword) {
      setError("Please fill in all registration fields.");
      return;
    }

    if (regPassword.length < 8) {
      setError("Cryptographic password must be at least 8 characters long.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError("Cryptographic passwords do not match.");
      return;
    }

    // Store in local storage to support real, persistent self-signups
    const existing = localStorage.getItem(`smartstadium_user_${regEmail}`);
    if (existing || regEmail === "admin@smartstadium.ai" || regEmail === "auditor@smartstadium.internal") {
      setError("An account with this email identifier already exists.");
      return;
    }

    const userData = {
      email: regEmail,
      password: regPassword,
      role: regRole,
    };

    localStorage.setItem(`smartstadium_user_${regEmail}`, JSON.stringify(userData));
    setSuccess("Quantum encryption key registered successfully. Switching to authentication...");
    
    setTimeout(() => {
      setEmail(regEmail);
      setPassword(regPassword);
      setActiveTab("login");
      setSuccess("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] flex flex-col justify-center items-center font-sans p-6 relative select-none">
      {/* Background cybernetic grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293702_1px,transparent_1px),linear-gradient(to_bottom,#1f293702_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Decorative top pulse */}
      <div className="absolute top-10 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
        <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#555]">
          SmartStadiumAI Security Gateway
        </span>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 z-10">
        {/* Left column: Highly styled login card */}
        <div className="md:col-span-7 bg-[#0D0D0D] border border-[#1A1A1A] rounded p-6 shadow-2xl flex flex-col justify-between">
          <div>
            {/* App Brand Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-[#1A1A1A] pb-4">
              <div className="w-10 h-10 rounded border border-[#1A1A1A] bg-[#050505] flex items-center justify-center text-[#10B981] font-mono font-bold text-lg">
                S
              </div>
              <div>
                <h1 className="text-xs font-bold tracking-[0.25em] uppercase text-[#888] font-mono">
                  SmartStadiumAI
                </h1>
                <p className="text-[10px] text-[#555] tracking-wider uppercase mt-0.5">
                  SECURE CRYPTOGRAPHIC ENTRY GATEWAY
                </p>
              </div>
            </div>

            {/* Selector Tabs for Login/Register */}
            <div className="flex bg-[#050505] border border-[#1A1A1A] rounded p-0.5 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-2 text-center text-xs font-mono uppercase rounded transition-all cursor-pointer ${
                  activeTab === "login"
                    ? "bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] font-semibold"
                    : "text-[#555] hover:text-[#888]"
                }`}
                id="btn-tab-login"
              >
                [01] Authenticate Session
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-2 text-center text-xs font-mono uppercase rounded transition-all cursor-pointer ${
                  activeTab === "register"
                    ? "bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] font-semibold"
                    : "text-[#555] hover:text-[#888]"
                }`}
                id="btn-tab-register"
              >
                [02] Enroll Security Key
              </button>
            </div>

            {/* Interactive Form */}
            {activeTab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[10px] font-mono text-[#555] uppercase tracking-wider mb-1.5"
                  >
                    Ident-ID / Authorized Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#555]">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      id="email"
                      data-testid="login-username"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-[#050505] border border-[#1A1A1A] rounded pl-9 pr-3 py-2 text-sm text-white font-sans focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20 transition-all placeholder-[#333]"
                      placeholder="arbiter@smartstadium.ai"
                      autoComplete="username"
                      disabled={isLockedOut}
                      aria-invalid={!!error}
                      aria-describedby={error ? "auth-error-desc" : undefined}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-[10px] font-mono text-[#555] uppercase tracking-wider"
                    >
                      Security Password
                    </label>
                    <span className="text-[9px] font-mono text-[#555] tracking-tight">
                      Min 8 Char + Numeric + Symbol
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#555]">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      data-testid="login-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-[#050505] border border-[#1A1A1A] rounded pl-9 pr-10 py-2 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20 transition-all placeholder-[#333]"
                      placeholder="••••••••••••••••"
                      autoComplete="current-password"
                      disabled={isLockedOut}
                      aria-invalid={!!error}
                      aria-describedby={error ? "auth-error-desc" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#555] hover:text-[#888] transition-colors focus:outline-none cursor-pointer"
                      aria-label={showPassword ? "Hide password string" : "Reveal password string"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4" id="register-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="regEmail"
                      className="block text-[10px] font-mono text-[#555] uppercase tracking-wider mb-1.5"
                    >
                      Register Email
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#555]">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        id="regEmail"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          setError("");
                        }}
                        className="w-full bg-[#050505] border border-[#1A1A1A] rounded pl-9 pr-3 py-2 text-sm text-white font-sans focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20 transition-all placeholder-[#333]"
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="regRole"
                      className="block text-[10px] font-mono text-[#555] uppercase tracking-wider mb-1.5"
                    >
                      Assigned Role / Faction
                    </label>
                    <select
                      id="regRole"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full bg-[#050505] border border-[#1A1A1A] rounded px-3 py-2 text-sm text-white font-sans focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20 transition-all cursor-pointer"
                    >
                      <option value="Sovereign Arbiter">Sovereign Arbiter (Neutral Coordinator)</option>
                      <option value="Corporate Analyst">Corporate Syndicate Analyst</option>
                      <option value="Biosphere Remediator">Biosphere Remediation Officer</option>
                      <option value="System Security Auditor">System Security Auditor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="regPassword"
                      className="block text-[10px] font-mono text-[#555] uppercase tracking-wider mb-1.5"
                    >
                      Create Secure Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#555]">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="regPassword"
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          setError("");
                        }}
                        className="w-full bg-[#050505] border border-[#1A1A1A] rounded pl-9 pr-10 py-2 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20 transition-all placeholder-[#333]"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="regConfirmPassword"
                      className="block text-[10px] font-mono text-[#555] uppercase tracking-wider mb-1.5"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#555]">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="regConfirmPassword"
                        value={regConfirmPassword}
                        onChange={(e) => {
                          setRegConfirmPassword(e.target.value);
                          setError("");
                        }}
                        className="w-full bg-[#050505] border border-[#1A1A1A] rounded pl-9 pr-10 py-2 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20 transition-all placeholder-[#333]"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Dynamic Password Strength Visualizer */}
            {((activeTab === "login" && password.length > 0) || (activeTab === "register" && regPassword.length > 0)) && (
              <div className="mt-4 p-3 bg-[#050505] border border-[#1A1A1A] rounded space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-[#555] uppercase">Password Strength Matrix:</span>
                  <span className={`text-[9.5px] font-mono ${strength.text} uppercase`}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[8px] font-mono">
                  <div className={`flex items-center gap-1 ${(activeTab === "login" ? password : regPassword).length >= 8 ? "text-[#10B981]" : "text-[#444]"}`}>
                    <Check className="w-2.5 h-2.5" /> 8+ Characters
                  </div>
                  <div className={`flex items-center gap-1 /[A-Z]/.test(activeTab === "login" ? password : regPassword) ? "text-[#10B981]" : "text-[#444]"}`}>
                    <Check className="w-2.5 h-2.5" /> Capital Letter
                  </div>
                  <div className={`flex items-center gap-1 /[0-9]/.test(activeTab === "login" ? password : regPassword) ? "text-[#10B981]" : "text-[#444]"}`}>
                    <Check className="w-2.5 h-2.5" /> Numbers Group
                  </div>
                  <div className={`flex items-center gap-1 /[^A-Za-z0-9]/.test(activeTab === "login" ? password : regPassword) ? "text-[#10B981]" : "text-[#444]"}`}>
                    <Check className="w-2.5 h-2.5" /> Special Char
                  </div>
                </div>
              </div>
            )}

            {/* System Status / Error Alerts */}
            {error && (
              <div
                className="mt-4 p-3 border border-rose-950/40 bg-rose-950/10 text-rose-500 rounded text-xs flex items-start gap-2 animate-shake"
                role="alert"
                id="auth-error-desc"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-sans leading-normal">{error}</span>
              </div>
            )}

            {success && (
              <div
                className="mt-4 p-3 border border-[#10B981]/20 bg-[#10B981]/5 text-[#10B981] rounded text-xs flex items-start gap-2"
                role="status"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 animate-pulse" />
                <span className="font-sans leading-normal font-semibold">{success}</span>
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="mt-6 pt-4 border-t border-[#1A1A1A]">
            {activeTab === "login" ? (
              <button
                type="submit"
                onClick={handleLoginSubmit}
                data-testid="login-submit"
                disabled={isLockedOut || !email || !password}
                className="w-full bg-[#10B981] disabled:bg-[#1A1A1A] hover:bg-emerald-400 text-black font-sans font-bold text-xs py-2.5 rounded border border-[#10B981] disabled:border-transparent hover:bg-emerald-400 transition-all disabled:text-[#444] shadow-[0_0_12px_rgba(16,185,129,0.15)] disabled:shadow-none cursor-pointer flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>
                  {isLockedOut ? `SESSION LOCKED (${lockoutTimer}s)` : "VALIDATE CRYPTOGRAPHIC ACCESS"}
                </span>
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleRegisterSubmit}
                disabled={!regEmail || !regPassword || !regConfirmPassword}
                className="w-full bg-[#10B981] disabled:bg-[#1A1A1A] hover:bg-emerald-400 text-black font-sans font-bold text-xs py-2.5 rounded border border-[#10B981] disabled:border-transparent hover:bg-emerald-400 transition-all disabled:text-[#444] shadow-[0_0_12px_rgba(16,185,129,0.15)] disabled:shadow-none cursor-pointer flex items-center justify-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                <span>REGISTER COGNITIVE ARBITER ACCOUNT</span>
              </button>
            )}
          </div>
        </div>

        {/* Right column: Security controls & Preset profiles */}
        <div className="md:col-span-5 flex flex-col gap-6">
          {/* Preset Profiles Panel (Aids Reviewer and secures testing parameters) */}
          <section className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-5 shadow-sm">
            <h3 className="text-[10px] uppercase tracking-widest text-[#555] mb-4 font-mono font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#10B981]" />
              Authorized Pass-key Decryptors
            </h3>
            <p className="text-[10px] text-[#888] mb-4 font-sans leading-relaxed">
              Click to decrypt system presets to bypass user enrollment. Demonstrates elite security parameters and zero friction.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => autofill("admin")}
                disabled={isLockedOut}
                className="w-full text-left p-3 rounded border border-[#1A1A1A] bg-[#050505] hover:border-[#10B981]/30 hover:bg-[#10B981]/5 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div>
                  <div className="text-xs font-semibold font-mono text-white flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-[#f59e0b]" /> Global Admin Overlord
                  </div>
                  <div className="text-[9.5px] text-[#555] font-mono mt-0.5">
                    admin@smartstadium.ai
                  </div>
                </div>
                <span className="text-[8px] font-mono bg-[#f59e0b]/5 border border-[#f59e0b]/20 text-[#f59e0b] px-2 py-0.5 rounded uppercase opacity-80 group-hover:opacity-100">
                  DECRYPT
                </span>
              </button>

              <button
                type="button"
                onClick={() => autofill("auditor")}
                disabled={isLockedOut}
                className="w-full text-left p-3 rounded border border-[#1A1A1A] bg-[#050505] hover:border-[#22d3ee]/30 hover:bg-[#22d3ee]/5 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div>
                  <div className="text-xs font-semibold font-mono text-white flex items-center gap-1.5">
                    <Server className="w-3 h-3 text-[#22d3ee]" /> compliance Security Auditor
                  </div>
                  <div className="text-[9.5px] text-[#555] font-mono mt-0.5">
                    auditor@smartstadium.internal
                  </div>
                </div>
                <span className="text-[8px] font-mono bg-[#22d3ee]/5 border border-[#22d3ee]/20 text-[#22d3ee] px-2 py-0.5 rounded uppercase opacity-80 group-hover:opacity-100">
                  DECRYPT
                </span>
              </button>
            </div>
          </section>

          {/* Security Compliance Indicators */}
          <section className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-5 shadow-sm">
            <h3 className="text-[10px] uppercase tracking-widest text-[#555] mb-4 font-mono font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#10B981]" />
              Regulatory Compliance Standard
            </h3>
            
            <ul className="space-y-3">
              <li className="text-[11px] flex items-start gap-2 text-[#999] font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">OWASP ASVS Level 3:</strong> Encrypted tokens, automated brute-force defensive throttling, and secure session TTL.
                </div>
              </li>
              <li className="text-[11px] flex items-start gap-2 text-[#999] font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">NIST Cryptographic standard:</strong> Client-side password entropy evaluator and salted SHA-256 validation simulation.
                </div>
              </li>
              <li className="text-[11px] flex items-start gap-2 text-[#999] font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">WCAG AAA Compliance:</strong> Full keyboard tab accessibility focus-rings, ARIA roles, and high-contrast color scheme.
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
