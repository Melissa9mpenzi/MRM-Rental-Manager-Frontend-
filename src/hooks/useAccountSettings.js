import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { usersApi } from "../api/usersApi";

export function useAccountSettings({ securityTabActive = false } = {}) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const qc = useQueryClient();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [nationalId, setNationalId] = useState(user?.national_id_number || "");
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [totpSetup, setTotpSetup] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setFullName(user?.full_name || "");
    setPhone(user?.phone || "");
    setNationalId(user?.national_id_number || "");
  }, [user?.full_name, user?.phone, user?.national_id_number]);

  const { data: totpStatus } = useQuery({
    queryKey: ["totp-status"],
    queryFn: () => usersApi.totpStatus(),
    enabled: securityTabActive,
  });
  const totpEnabled = totpStatus?.enabled === true;

  const profileMut = useMutation({
    mutationFn: () =>
      usersApi.putMe({
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        national_id_number: nationalId.trim() || undefined,
      }),
    onSuccess: (u) => {
      updateUser(u);
      toast.success("Profile saved.");
    },
    onError: () => toast.error("Could not save profile."),
  });

  const pwMut = useMutation({
    mutationFn: () => usersApi.changePassword(curPw, newPw),
    onSuccess: () => {
      toast.success("Password updated.");
      setCurPw("");
      setNewPw("");
    },
    onError: () => toast.error("Password update failed. Check your current password."),
  });

  const setupTotpMut = useMutation({
    mutationFn: () => usersApi.totpSetup(),
    onSuccess: (data) => {
      setTotpSetup(data);
      toast.success("Scan the QR code with your authenticator app.");
    },
    onError: () => toast.error("Could not start 2FA setup."),
  });

  const enableTotpMut = useMutation({
    mutationFn: () => usersApi.totpEnable(totpCode.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["totp-status"] });
      setTotpSetup(null);
      setTotpCode("");
      toast.success("Two-factor authentication enabled.");
    },
    onError: () => toast.error("Invalid code. Try again."),
  });

  const disableTotpMut = useMutation({
    mutationFn: () => usersApi.totpDisable(disableCode.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["totp-status"] });
      setDisableCode("");
      toast.success("Two-factor authentication disabled.");
    },
    onError: () => toast.error("Invalid code."),
  });

  const downloadExport = async () => {
    setExporting(true);
    try {
      const data = await usersApi.exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rentdirect-export-${user?.id || "me"}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded.");
    } catch {
      toast.error("Could not export your data.");
    } finally {
      setExporting(false);
    }
  };

  return {
    user,
    fullName,
    setFullName,
    phone,
    setPhone,
    nationalId,
    setNationalId,
    curPw,
    setCurPw,
    newPw,
    setNewPw,
    totpSetup,
    totpCode,
    setTotpCode,
    disableCode,
    setDisableCode,
    exporting,
    totpEnabled,
    profileMut,
    pwMut,
    setupTotpMut,
    enableTotpMut,
    disableTotpMut,
    downloadExport,
  };
}
