import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { makePayment } from "../api/client";
import { LedgerBlock } from "../components/LedgerBlock";
import { PaymentStamp } from "../components/PaymentStamp";
import { PrimaryButton } from "../components/PrimaryButton";
import { UnderlinedInput } from "../components/UnderlinedInput";
import { colors, fonts } from "../theme/tokens";
import type { Customer, Payment } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

type Props = {
  customer: Customer;
  setCustomer: (customer: Customer) => void;
  logout: () => void;
  goBack: () => void;
};

export function MakePaymentScreen({ customer, setCustomer, logout, goBack }: Props) {
  const [amount, setAmount] = useState(customer.emi_due);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid EMI amount before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const recordedPayment = await makePayment(customer.account_number, numericAmount);
      const paymentsLeft = Math.max(customer.payments_left - 1, 0);

      setPayment(recordedPayment);
      setCustomer({
        ...customer,
        paid_installments: customer.paid_installments + 1,
        payments_left: paymentsLeft,
        total_amount_to_be_paid: String(paymentsLeft * Number(customer.emi_due)),
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Payment failed. Your account has not been charged.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.eyebrow}>PAYING-IN SLIP</Text>
          <Text onPress={logout} style={styles.logout}>Logout</Text>
        </View>
        <Text style={styles.title}>Make Payment</Text>
        <Text style={styles.subtitle}>Confirm the EMI amount before submitting the collection entry.</Text>
      </View>

      <View style={styles.paymentCard}>
        <Text style={styles.cardLabel}>Collecting for</Text>
        <Text style={styles.account}>{customer.account_number}</Text>
        <Text style={styles.amount}>{formatCurrency(customer.emi_due)}</Text>
      </View>

      {payment ? (
        <View style={styles.confirmation}>
          <PaymentStamp date={formatDate(payment.payment_date)} />
          <LedgerBlock
            rows={[
              { label: "Reference", value: payment.transaction_reference },
              { label: "Amount", value: formatCurrency(payment.payment_amount), large: true },
              { label: "Payments left", value: `${Math.max(customer.payments_left - 1, 0)}` },
              { label: "Remaining total", value: formatCurrency(Math.max(customer.payments_left - 1, 0) * Number(customer.emi_due)) },
              { label: "Status", value: payment.status },
            ]}
          />
          <PrimaryButton label="Back to loan" onPress={goBack} />
        </View>
      ) : (
        <>
          <UnderlinedInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" mono />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <PrimaryButton label={submitting ? "Submitting..." : "Submit payment"} onPress={submit} loading={submitting} />
            <PrimaryButton label="Back" onPress={goBack} variant="secondary" />
          </View>
        </>
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
  paymentCard: {
    borderColor: colors.deepTeal,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.tealSoft,
    padding: 16,
    gap: 4,
  },
  cardLabel: {
    color: colors.deepTeal,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  account: {
    color: colors.slateInk,
    fontFamily: fonts.mono,
    fontSize: 14,
  },
  amount: {
    color: colors.inkNavy,
    fontFamily: fonts.monoMedium,
    fontSize: 30,
  },
  confirmation: {
    gap: 16,
  },
  actions: {
    marginTop: "auto",
    gap: 10,
  },
  error: {
    color: colors.alertRust,
    fontFamily: fonts.sans,
    fontSize: 13,
  },
});
