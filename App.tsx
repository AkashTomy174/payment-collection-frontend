import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  useFonts as usePlexSans,
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from "@expo-google-fonts/ibm-plex-sans";
import {
  useFonts as usePlexMono,
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from "@expo-google-fonts/ibm-plex-mono";
import { useState } from "react";
import { colors, fonts } from "./src/theme/tokens";
import type { AuthUser, Customer } from "./src/types";
import { setAuthToken } from "./src/api/client";
import { AuthScreen } from "./src/screens/AuthScreen";
import { LoanDetailsScreen } from "./src/screens/LoanDetailsScreen";
import { MakePaymentScreen } from "./src/screens/MakePaymentScreen";
import { PaymentHistoryScreen } from "./src/screens/PaymentHistoryScreen";

type Screen = "loan" | "payment" | "history";

export default function App() {
  const [sansLoaded] = usePlexSans({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
  });
  const [monoLoaded] = usePlexMono({
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });
  const [screen, setScreen] = useState<Screen>("loan");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  if (!sansLoaded || !monoLoaded) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user || !customer) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <AuthScreen
          onAuthenticated={(session) => {
            setUser(session.user);
            setCustomer(session.customer);
            setScreen("loan");
          }}
        />
      </SafeAreaView>
    );
  }

  function logout() {
    setAuthToken("");
    setUser(null);
    setCustomer(null);
    setScreen("loan");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {screen === "loan" ? (
        <LoanDetailsScreen
          customer={customer}
          setCustomer={setCustomer}
          user={user}
          logout={logout}
          goPayment={() => customer && setScreen("payment")}
          goHistory={() => customer && setScreen("history")}
        />
      ) : null}
      {screen === "payment" && customer ? (
        <MakePaymentScreen customer={customer} setCustomer={setCustomer} goBack={() => setScreen("loan")} />
      ) : null}
      {screen === "history" && customer ? <PaymentHistoryScreen customer={customer} goBack={() => setScreen("loan")} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
  },
  loadingText: {
    color: colors.slateMuted,
    fontFamily: fonts.sans,
  },
});
