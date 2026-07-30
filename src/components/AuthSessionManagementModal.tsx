import React, { useState, useEffect } from "react";
import {
  UserSession,
  UserRole,
  DepartmentCategory,
  Employee,
  AccreditedTaskOption,
} from "../types";
import {
  loadAllUserSessions,
  saveAllUserSessions,
  getCurrentUserSession,
  saveCurrentUserSession,
  availableAccreditedTasks,
} from "../data/authStore";
import { IDCardScannerModal } from "./IDCardScannerModal";
import {
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Key,
  LogOut,
  UserPlus,
  ShieldAlert,
  Camera,
  Eye,
  EyeOff,
  Phone,
  Briefcase,
  Check,
  X,
  FileText,
  UserCheck,
  Clock,
  Sparkles,
} from "lucide-react";

interface AuthSessionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onUserSessionChanged: (newUser: UserSession) => void;
}

export const AuthSessionManagementModal: React.FC<AuthSessionManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserSessionChanged,
}) => {
  // Navigation tabs inside auth modal
  const [activeTab, setActiveTab] = useState<"switch_login" | "manage_users" | "register_agent">("switch_login");

  // All Sessions state
  const [sessions, setSessions] = useState<UserSession[]>(loadAllUserSessions());

  // Login form state
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forced Password Change Modal state (First login requirement)
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [pendingUserToChangePass, setPendingUserToChangePass] = useState<UserSession | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  // Agent Registration / Edition Form State
  const [regFullName, setRegFullName] = useState<string>("");
  const [regFirstNames, setRegFirstNames] = useState<string>("");
  const [regPhone, setRegPhone] = useState<string>("");
  const [regUsername, setRegUsername] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("agibrico1");
  const [regRole, setRegRole] = useState<UserRole>("EMPLOYE");
  const [regDept, setRegDept] = useState<DepartmentCategory>("Aviculture");
  const [regIdCardScanUrl, setRegIdCardScanUrl] = useState<string>("");
  const [regIdCardNumber, setRegIdCardNumber] = useState<string>("");
  const [regSelectedTasks, setRegSelectedTasks] = useState<string[]>([
    "DENSITE_CAMERA",
    "SAISIE_ELEVAGE",
  ]);

  // ID Card Scanner Modal state
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setSessions(loadAllUserSessions());
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Login Action
  const handlePerformLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const match = sessions.find(
      (u) =>
        (u.username.toLowerCase() === loginUsername.trim().toLowerCase() ||
          u.phone.replace(/\s+/g, "") === loginUsername.trim().replace(/\s+/g, "")) &&
        u.passwordPlainText === loginPassword
    );

    if (!match) {
      setLoginError("Identifiant ou mot de passe incorrect. Veuillez vérifier vos accès.");
      return;
    }

    if (match.status === "Inactif" || match.status === "Bloqué") {
      setLoginError("Cette session est actuellement désactivée ou bloquée par l'administration.");
      return;
    }

    if (match.status === "En attente validation Admin") {
      setLoginError(
        "Votre session est en attente de validation finale par l'Administrateur Général. Veuillez contacter le siège."
      );
      return;
    }

    // Check if First Login mandatory password change
    if (match.mustChangePasswordOnFirstLogin && !match.hasChangedPassword) {
      setPendingUserToChangePass(match);
      setIsChangingPassword(true);
      return;
    }

    // Successful login
    const updated = {
      ...match,
      lastLogin: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    saveCurrentUserSession(updated);
    onUserSessionChanged(updated);
    onClose();
  };

  // Handle First Connection Password Change Submit
  const handleSubmitPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);

    if (newPassword.length < 6) {
      setPasswordChangeError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    if (!pendingUserToChangePass) return;

    const updatedUser: UserSession = {
      ...pendingUserToChangePass,
      passwordPlainText: newPassword,
      mustChangePasswordOnFirstLogin: false,
      hasChangedPassword: true,
      lastLogin: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    // Update in session list
    const newAllSessions = sessions.map((s) => (s.id === updatedUser.id ? updatedUser : s));
    setSessions(newAllSessions);
    saveAllUserSessions(newAllSessions);

    saveCurrentUserSession(updatedUser);
    onUserSessionChanged(updatedUser);

    setIsChangingPassword(false);
    setPendingUserToChangePass(null);
    onClose();
  };

  // Admin activates Manager session directly
  const handleToggleManagerActivationByAdmin = (managerId: string) => {
    if (currentUser.role !== "ADMIN_GENERAL") {
      alert("Seul l'Administrateur Général peut activer directement la session d'un responsable.");
      return;
    }

    const updatedList = sessions.map((s) => {
      if (s.id === managerId) {
        const nextStatus = s.status === "Actif" ? "Inactif" : "Actif";
        return {
          ...s,
          status: nextStatus as UserSession["status"],
          isActivatedByAdmin: nextStatus === "Actif",
        };
      }
      return s;
    });

    setSessions(updatedList);
    saveAllUserSessions(updatedList);
  };

  // Manager activates Employee (Requests Admin Validation)
  const handleManagerRequestEmployeeActivation = (employeeId: string) => {
    const updatedList = sessions.map((s) => {
      if (s.id === employeeId) {
        return {
          ...s,
          isPendingAdminValidation: true,
          status: "En attente validation Admin" as UserSession["status"],
          activatedByManagerId: currentUser.id,
          activatedByManagerName: `${currentUser.fullName} (${currentUser.role === "RESPONSABLE_DEPT" ? "Resp. " + currentUser.department : currentUser.role})`,
        };
      }
      return s;
    });

    setSessions(updatedList);
    saveAllUserSessions(updatedList);
  };

  // Admin final validation for Employee Activation
  const handleAdminApproveEmployeeActivation = (employeeId: string) => {
    if (currentUser.role !== "ADMIN_GENERAL") {
      alert("Seul l'Administrateur Général possède l'accréditation finale de validation.");
      return;
    }

    const updatedList = sessions.map((s) => {
      if (s.id === employeeId) {
        return {
          ...s,
          isActivatedByAdmin: true,
          isPendingAdminValidation: false,
          status: "Actif" as UserSession["status"],
        };
      }
      return s;
    });

    setSessions(updatedList);
    saveAllUserSessions(updatedList);
  };

  // Register New Employee / Agent
  const handleRegisterNewAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regPhone.trim()) {
      alert("Veuillez renseigner le nom complet et le numéro de téléphone.");
      return;
    }

    const newId = `usr-custom-${Date.now()}`;
    const generatedUsername =
      regUsername.trim() ||
      `agent.${regFirstNames.toLowerCase().replace(/\s+/g, "") || Date.now().toString().slice(-4)}`;

    const isEmployeeRole = regRole === "EMPLOYE";
    const isManagerByManager = currentUser.role === "RESPONSABLE_DEPT" && isEmployeeRole;

    const newSession: UserSession = {
      id: newId,
      username: generatedUsername,
      passwordPlainText: regPassword || "agibrico1",
      fullName: regFullName,
      firstNames: regFirstNames,
      phone: regPhone,
      role: regRole,
      department: regDept,
      isActivatedByAdmin: currentUser.role === "ADMIN_GENERAL",
      isPendingAdminValidation: isManagerByManager,
      activatedByManagerName: isManagerByManager
        ? `${currentUser.fullName} (${currentUser.department})`
        : undefined,
      mustChangePasswordOnFirstLogin: true, // Forces password change on 1st login
      hasChangedPassword: false,
      idCardScanUrl: regIdCardScanUrl,
      idCardNumber: regIdCardNumber || `CNI-CI-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      accreditedTasks: regSelectedTasks,
      status: isManagerByManager
        ? "En attente validation Admin"
        : currentUser.role === "ADMIN_GENERAL"
        ? "Actif"
        : "Actif",
      notes: `Enregistré le ${new Date().toLocaleDateString("fr-FR")} par ${currentUser.fullName}`,
    };

    const newSessionsList = [...sessions, newSession];
    setSessions(newSessionsList);
    saveAllUserSessions(newSessionsList);

    alert(
      isManagerByManager
        ? `Employé ${regFullName} enregistré ! Transmis à l'Administrateur Général pour validation finale.`
        : `Nouvel agent ${regFullName} créé avec succès !`
    );

    // Reset registration form
    setRegFullName("");
    setRegFirstNames("");
    setRegPhone("");
    setRegUsername("");
    setRegIdCardScanUrl("");
    setRegIdCardNumber("");
    setActiveTab("manage_users");
  };

  const toggleTaskSelection = (taskCode: string) => {
    if (regSelectedTasks.includes(taskCode)) {
      setRegSelectedTasks(regSelectedTasks.filter((t) => t !== taskCode));
    } else {
      setRegSelectedTasks([...regSelectedTasks, taskCode]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 my-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <span>Authentification & Sessions Sécurisées RH</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold uppercase border border-amber-200">
                  Hiérarchie Accréditée
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Session actuelle : <strong>{currentUser.fullName}</strong> ({currentUser.role})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORCED FIRST CONNECT PASSWORD CHANGE DIALOG */}
        {isChangingPassword && pendingUserToChangePass ? (
          <div className="bg-amber-50 border-2 border-amber-400 p-5 rounded-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-900">
              <div className="p-2.5 bg-amber-200 rounded-xl">
                <Key className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase">
                  Changement de Mot de Passe Obligatoire (Première Connexion)
                </h4>
                <p className="text-xs text-amber-700">
                  Bienvenue <strong>{pendingUserToChangePass.fullName}</strong> ! Pour sécuriser votre session, veuillez définir votre nouveau mot de passe personnel.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitPasswordChange} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nouveau Mot de Passe Personnel :
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Confirmer le Nouveau Mot de Passe :
                </label>
                <input
                  type="password"
                  required
                  placeholder="Répétez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {passwordChangeError && (
                <div className="text-xs text-rose-600 font-bold p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
                  ⚠️ {passwordChangeError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer uppercase"
              >
                Enregistrer mon Nouveau Mot de Passe & Accéder
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Modal Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("switch_login")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "switch_login"
                    ? "bg-slate-900 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                🔑 Changer / Ouvrir une Session
              </button>

              <button
                onClick={() => setActiveTab("manage_users")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "manage_users"
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                👥 Activer & Valider les Accès ({sessions.length})
              </button>

              <button
                onClick={() => setActiveTab("register_agent")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "register_agent"
                    ? "bg-amber-500 text-slate-950 font-black shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 inline mr-1" />
                <span>Enregistrer un Nouvel Agent / CNI</span>
              </button>
            </div>

            {/* TAB 1: SWITCH LOGIN / AUTH FORM */}
            {activeTab === "switch_login" && (
              <div className="space-y-5">
                <form onSubmit={handlePerformLogin} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>Connexion par Mot de Passe de Session</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Identifiant / Nom d'Utilisateur ou Téléphone :
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: admin, resp.avic, emp.yao ou +225 07..."
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Mot de Passe :
                      </label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          required
                          placeholder="Entrez votre mot de passe"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 outline-none pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer uppercase flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Se Connecter à ma Session</span>
                  </button>
                </form>

                {/* Quick Sessions Switch Shortcuts for Demo / Testing */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500">
                    💡 Accès Rapide aux Sessions Pré-configurées (Démonstration) :
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sessions.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          setLoginUsername(user.username);
                          setLoginPassword(user.passwordPlainText || "agibrico1");
                        }}
                        className={`p-3 rounded-xl border text-left text-xs cursor-pointer transition-all flex items-center justify-between ${
                          currentUser.id === user.id
                            ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400"
                            : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div>
                          <div className="font-extrabold text-slate-900">{user.fullName}</div>
                          <div className="text-[10px] text-slate-500">
                            {user.role} • {user.department}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          {user.username}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MANAGE & ACTIVATE USERS HIERARCHY */}
            {activeTab === "manage_users" && (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed space-y-1">
                  <div className="font-extrabold flex items-center space-x-1 text-amber-950">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Règles d'Activation des Sessions :</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                    <li><strong>Administrateur Général :</strong> Peut activer directement la session des Responsables de Département.</li>
                    <li><strong>Responsable de Département :</strong> Peut activer la session d'un employé, qui nécessite une <em>validation supplémentaire de l'Administrateur Général</em>.</li>
                    <li><strong>Sécurité Première Connexion :</strong> Les nouveaux comptes doivent changer leur mot de passe par défaut lors du 1er accès.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  {sessions.map((user) => {
                    const isSelf = user.id === currentUser.id;
                    const isAdmin = currentUser.role === "ADMIN_GENERAL";
                    const isManager = currentUser.role === "RESPONSABLE_DEPT";

                    return (
                      <div
                        key={user.id}
                        className={`p-4 rounded-2xl border space-y-3 transition-all ${
                          user.status === "Actif"
                            ? "bg-white border-slate-200"
                            : user.status === "En attente validation Admin"
                            ? "bg-amber-50/80 border-amber-300"
                            : "bg-slate-50 border-slate-200 opacity-75"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-slate-900 text-sm">
                                {user.fullName}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  user.role === "ADMIN_GENERAL"
                                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                                    : user.role === "RESPONSABLE_DEPT"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-blue-100 text-blue-800 border border-blue-200"
                                }`}
                              >
                                {user.role}
                              </span>

                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${
                                  user.status === "Actif"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : user.status === "En attente validation Admin"
                                    ? "bg-amber-200 text-amber-950 animate-pulse"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {user.status}
                              </span>
                            </div>

                            <div className="text-xs text-slate-500 flex items-center space-x-3">
                              <span>Dept : <strong>{user.department}</strong></span>
                              <span>Tél : {user.phone}</span>
                              <span className="font-mono">ID : @{user.username}</span>
                            </div>
                          </div>

                          {/* Hierarchy Activation Action Buttons */}
                          <div className="flex items-center space-x-2">
                            {/* Admin activating Manager */}
                            {isAdmin && user.role === "RESPONSABLE_DEPT" && (
                              <button
                                onClick={() => handleToggleManagerActivationByAdmin(user.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                  user.status === "Actif"
                                    ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                    : "bg-emerald-600 text-white hover:bg-emerald-500"
                                }`}
                              >
                                {user.status === "Actif" ? "Désactiver Session" : "Activer Responsable"}
                              </button>
                            )}

                            {/* Manager activating Employee */}
                            {isManager && user.role === "EMPLOYE" && user.status !== "Actif" && (
                              <button
                                onClick={() => handleManagerRequestEmployeeActivation(user.id)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
                              >
                                Activer (Soumettre à l'Admin)
                              </button>
                            )}

                            {/* Admin Validating Employee requested by Manager */}
                            {isAdmin && user.isPendingAdminValidation && (
                              <button
                                onClick={() => handleAdminApproveEmployeeActivation(user.id)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow cursor-pointer animate-bounce flex items-center space-x-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>VALIDATION FINALE ADMIN</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Employee Details visible to Admin / Manager */}
                        {(isAdmin || isManager) && (
                          <div className="p-3 bg-slate-100/80 rounded-xl text-xs space-y-2 border border-slate-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                              <div>
                                🆔 <strong>N° Pièce Identité :</strong> {user.idCardNumber || "Non renseigné"}
                              </div>
                              <div>
                                🔒 <strong>Pass 1ère Connexion :</strong>{" "}
                                {user.hasChangedPassword ? (
                                  <span className="text-emerald-700 font-bold">✓ Modifié par l'agent</span>
                                ) : (
                                  <span className="text-amber-700 font-bold">⚠️ Défaut (Changement obligatoire requis)</span>
                                )}
                              </div>
                            </div>

                            {user.activatedByManagerName && (
                              <div className="text-[11px] text-amber-800 font-bold">
                                📩 Inscription initiée par : {user.activatedByManagerName}
                              </div>
                            )}

                            {/* Accredited Tasks Pills */}
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Tâches & Accréditations Défines ({user.accreditedTasks?.length || 0}) :
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {user.accreditedTasks && user.accreditedTasks.length > 0 ? (
                                  user.accreditedTasks.map((tCode) => {
                                    const tObj = availableAccreditedTasks.find((a) => a.code === tCode);
                                    return (
                                      <span
                                        key={tCode}
                                        className="text-[10px] px-2 py-0.5 bg-white border border-slate-300 font-bold rounded-md text-slate-800"
                                      >
                                        {tObj?.label || tCode}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">Aucune accréditation spécifique</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: REGISTER NEW AGENT WITH ID CARD SCANNER */}
            {activeTab === "register_agent" && (
              <form onSubmit={handleRegisterNewAgent} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <span>Informations Obligatoires d'Enregistrement l'Agent</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nom de Famille * :</label>
                      <input
                        type="text"
                        required
                        placeholder="ex: KOUASSI"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Prénoms * :</label>
                      <input
                        type="text"
                        required
                        placeholder="ex: Kouadio Jean-Baptiste"
                        value={regFirstNames}
                        onChange={(e) => setRegFirstNames(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Numéro de Téléphone * :</label>
                      <input
                        type="text"
                        required
                        placeholder="ex: +225 07 00 11 22 33"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Rôle Hiérarchique :</label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="EMPLOYE">Employé / Agent de Terrain</option>
                        {currentUser.role === "ADMIN_GENERAL" && (
                          <option value="RESPONSABLE_DEPT">Responsable de Département</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Département Affecté :</label>
                      <select
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value as DepartmentCategory)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="Aviculture">Aviculture</option>
                        <option value="Porciculture">Porciculture</option>
                        <option value="Maternité & Élevage">Maternité & Élevage</option>
                        <option value="Fabrique d'Aliments">Fabrique d'Aliments</option>
                        <option value="Hygiène & Sanitaire">Hygiène & Sanitaire</option>
                        <option value="Administration & Ventes">Administration & Ventes</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Identifiant de Connexion :</label>
                      <input
                        type="text"
                        placeholder="Automatique ou sur-mesure"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ID CARD SCANNER SESSION */}
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-amber-950 uppercase flex items-center space-x-2">
                        <Camera className="w-4 h-4 text-amber-600" />
                        <span>Session pour Scanner la Pièce d'Identité (CNI)</span>
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        Pointez la caméra du téléphone ou importez la photo de la pièce officielle.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsScanModalOpen(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all cursor-pointer flex items-center space-x-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Lancer le Scan Caméra</span>
                    </button>
                  </div>

                  {regIdCardScanUrl ? (
                    <div className="flex items-center space-x-3 p-2 bg-white rounded-xl border border-amber-300">
                      <img src={regIdCardScanUrl} alt="CNI" className="w-14 h-10 object-cover rounded border" />
                      <div className="text-xs">
                        <div className="font-extrabold text-emerald-800">✓ Pièce Scannée & Capturée</div>
                        <div className="text-[11px] text-slate-600 font-mono">N° {regIdCardNumber}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-800 italic">
                      Aucun scan enregistré pour l'instant. Cliquez sur "Lancer le Scan Caméra" ci-dessus.
                    </div>
                  )}
                </div>

                {/* ACCREDITATION & TASKS DEFINITION CHECKBOXES */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Définition des Accréditations & Tâches Autorisées :</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {availableAccreditedTasks.map((task) => {
                      const isChecked = regSelectedTasks.includes(task.code);
                      return (
                        <div
                          key={task.code}
                          onClick={() => toggleTaskSelection(task.code)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-2 ${
                            isChecked
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleTaskSelection(task.code)}
                            className="mt-0.5 accent-emerald-600 rounded cursor-pointer"
                          />
                          <div>
                            <div>{task.label}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{task.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs rounded-xl shadow-xl transition-all cursor-pointer uppercase flex items-center justify-center space-x-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Enregistrer l'Agent & Générer la Session</span>
                </button>
              </form>
            )}
          </>
        )}

        {/* Modal Scanner ID Card Modal */}
        <IDCardScannerModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          onScanComplete={(url, cardNum) => {
            setRegIdCardScanUrl(url);
            if (cardNum) setRegIdCardNumber(cardNum);
          }}
        />
      </div>
    </div>
  );
};
