import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { getCustomer } from "../api/client";
import { LedgerBlock } from "../components/LedgerBlock";
import { PrimaryButton } from "../components/PrimaryButton";
import { UnderlinedInput } from "../components/UnderlinedInput";
import { colors, fonts } from "../theme/tokens";
import type { AuthUser, Customer } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

type Props = {
  customer: Customer | null;
  setCustomer: (customer: Customer) => void;
  user: AuthUser;
  logout: () => void;
  goPayment: () => void;
  goHistory: () => void;
};

export function LoanDetailsScreen({ customer, setCustomer, user, logout, goPayment, goHistory }: Props) {
  const [accountNumber, setAccountNumber] = useState(customer?.account_number ?? "AC10293847");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup() {
    setLoading(true);
    setError("");
    try {
      setCustomer(await getCustomer(accountNumber.trim()));
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Unable to load account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.eyebrow}>LOAN SUMMARY</Text>
          <Text onPress={logout} style={styles.logout}>Logout</Text>
        </View>
        <Text style={styles.title}>Payment Collection</Text>
        <Text style={styles.subtitle}>Signed in as {user.name}. Review your current EMI and collect payment from one place.</Text>
      </View>

      <View style={styles.lookupPanel}>
        <UnderlinedInput label="Account number" value={accountNumber} onChangeText={setAccountNumber} mono />
        <PrimaryButton label="Search account" onPress={lookup} loading={loading} variant="secondary" />
      </View>
      {loading ? <ActivityIndicator color={colors.inkNavy} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {customer ? (
        <>
          <View style={styles.duePanel}>
            <Text style={styles.dueLabel}>EMI due now</Text>
            <Text style={styles.dueValue}>{formatCurrency(customer.emi_due)}</Text>
            <Text style={styles.dueMeta}>{customer.tenure_months} month tenure - {customer.interest_rate}% interest</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Payments left</Text>
                <Text style={styles.summaryValue}>{customer.payments_left}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total to be paid</Text>
                <Text style={styles.summaryValue}>{formatCurrency(customer.total_amount_to_be_paid)}</Text>
              </View>
            </View>
          </View>
          <LedgerBlock
            rows={[
              { label: "Account number", value: customer.account_number },
              { label: "Issue date", value: formatDate(customer.issue_date) },
              { label: "Interest rate", value: `${customer.interest_rate}%` },
              { label: "Tenure", value: `${customer.tenure_months} months` },
              { label: "Paid installments", value: `${customer.paid_installments}` },
              { label: "Payments left", value: `${customer.payments_left}` },
              { label: "Total to be paid", value: formatCurrency(customer.total_amount_to_be_paid), large: true },
              { label: "EMI due", value: formatCurrency(customer.emi_due), large: true },
            ]}
          />
          <View style={styles.actions}>
            <PrimaryButton label="Pay EMI" onPress={goPayment} />
            <PrimaryButton label="View history" onPress={goHistory} variant="secondary" />
          </View>
        </>
      ) : (
        <View style={styles.emptyPanel}>
          <Text style={styles.emptyTitle}>Ready for lookup</Text>
          <Text style={styles.muted}>Enter an account number to view loan details and payment options.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 16,
    padding: 20,
    paddingBottom: 28,
    backgroundColor: colors.paper,
    flexGrow: 1,
  },
  header: {
    gap: 6,
  },
  headerTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontSize: 26,
  },
  subtitle: {
    color: colors.slateMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  logout: {
    color: colors.deepTeal,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
  },
  lookupPanel: {
    gap: 12,
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.surface,
    padding: 16,
  },
  duePanel: {
    borderColor: colors.deepTeal,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.tealSoft,
    padding: 16,
    gap: 4,
  },
  dueLabel: {
    color: colors.deepTeal,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  dueValue: {
    color: colors.inkNavy,
    fontFamily: fonts.monoMedium,
    fontSize: 30,
  },
  dueMeta: {
    color: colors.slateMuted,
    fontFamily: fonts.sans,
    fontSize: 13,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  summaryItem: {
    flex: 1,
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: colors.surface,
    padding: 10,
    gap: 3,
  },
  summaryLabel: {
    color: colors.slateMuted,
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  summaryValue: {
    color: colors.inkNavy,
    fontFamily: fonts.monoMedium,
    fontSize: 17,
  },
  actions: {
    gap: 10,
    marginTop: "auto",
  },
  muted: {
    color: colors.slateMuted,
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 21,
  },
  emptyPanel: {
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.surfaceMuted,
    padding: 16,
    gap: 4,
  },
  emptyTitle: {
    color: colors.slateInk,
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
  },
  error: {
    color: colors.alertRust,
    fontFamily: fonts.sans,
    fontSize: 13,
  },
});
