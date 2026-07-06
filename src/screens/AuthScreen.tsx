import Constants from "expo-constants";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { login, register, setAuthToken } from "../api/client";
import { PrimaryButton } from "../components/PrimaryButton";
import { UnderlinedInput } from "../components/UnderlinedInput";
import { colors, fonts } from "../theme/tokens";
import type { AuthSession } from "../types";

type Props = {
  onAuthenticated: (session: AuthSession) => void;
};

type Mode = "login" | "register";

export function AuthScreen({ onAuthenticated }: Props) {
  const buildId = (Constants.expoConfig?.extra as { buildId?: string } | undefined)?.buildId ?? "local";
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("Demo Customer");
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [accountNumber, setAccountNumber] = useState("AC10293847");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const session =
        mode === "login"
          ? await login({ email, password })
          : await register({ name, email, password, accountNumber });

      setAuthToken(session.token);
      onAuthenticated(session);
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : "Authentication failed";
      setError(message);
      Alert.alert(mode === "login" ? "Login failed" : "Registration failed", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SECURE ACCESS</Text>
        <Text style={styles.title}>Loan Portal</Text>
        <Text style={styles.subtitle}>Sign in to view your linked loan account and make EMI payments.</Text>
      </View>

      <View style={styles.panel}>
        <View style={styles.tabs}>
          <Pressable onPress={() => setMode("login")} style={[styles.tab, mode === "login" && styles.activeTab]}>
            <Text style={[styles.tabText, mode === "login" && styles.activeTabText]}>Login</Text>
          </Pressable>
          <Pressable onPress={() => setMode("register")} style={[styles.tab, mode === "register" && styles.activeTab]}>
            <Text style={[styles.tabText, mode === "register" && styles.activeTabText]}>Register</Text>
          </Pressable>
        </View>

        {mode === "register" ? (
          <UnderlinedInput label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
        ) : null}
        <UnderlinedInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <UnderlinedInput label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
        {mode === "register" ? (
          <UnderlinedInput label="Loan account number" value={accountNumber} onChangeText={setAccountNumber} mono />
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton label={mode === "login" ? "Login" : "Create account"} onPress={submit} loading={loading} />
      </View>

      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>Demo login</Text>
        <Text style={styles.demoText}>demo@example.com / password123</Text>
        <Text style={styles.demoTitle}>Admin login</Text>
        <Text style={styles.demoText}>admin@example.com / password123</Text>
        <Text style={styles.demoTitle}>Build id</Text>
        <Text style={styles.demoText}>{buildId}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    gap: 18,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.paper,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: colors.slateMuted,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  title: {
    color: colors.inkNavy,
    fontFamily: fonts.sansSemiBold,
    fontSize: 30,
  },
  subtitle: {
    color: colors.slateMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  panel: {
    gap: 14,
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.surface,
    padding: 16,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 4,
  },
  activeTab: {
    borderColor: colors.deepTeal,
    backgroundColor: colors.tealSoft,
  },
  tabText: {
    color: colors.slateMuted,
    fontFamily: fonts.sansMedium,
  },
  activeTabText: {
    color: colors.deepTeal,
  },
  error: {
    color: colors.alertRust,
    fontFamily: fonts.sans,
    fontSize: 13,
    textAlign: "center",
  },
  demoBox: {
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.surfaceMuted,
    padding: 12,
    gap: 2,
  },
  demoTitle: {
    color: colors.slateInk,
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
  },
  demoText: {
    color: colors.slateMuted,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
});
