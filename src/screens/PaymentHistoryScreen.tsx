import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getPayments } from "../api/client";
import { colors, fonts } from "../theme/tokens";
import type { Customer, Pagination, Payment } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { PrimaryButton } from "../components/PrimaryButton";

type Props = {
  customer: Customer;
  logout: () => void;
  goBack: () => void;
};

export function PaymentHistoryScreen({ customer, logout, goBack }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getPayments(customer.account_number, page)
      .then((body) => {
        setPayments(body.data);
        setPagination(body.pagination);
      })
      .catch((historyError) => setError(historyError instanceof Error ? historyError.message : "Unable to load history"))
      .finally(() => setLoading(false));
  }, [customer.account_number, page]);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.eyebrow}>PASSBOOK ENTRIES</Text>
          <Text onPress={logout} style={styles.logout}>Logout</Text>
        </View>
        <Text style={styles.title}>Payment History</Text>
        <View style={styles.accountPill}>
          <Text style={styles.account}>{customer.account_number}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>DATE</Text>
            <Text style={[styles.headerCell, styles.right]}>AMOUNT</Text>
            <Text style={[styles.headerCell, styles.right]}>STATUS</Text>
          </View>
          {loading ? <ActivityIndicator style={styles.loading} color={colors.inkNavy} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!loading && !payments.length ? <Text style={styles.empty}>No payments recorded yet.</Text> : null}
          {payments.map((payment) => (
            <View key={payment.id} style={styles.row}>
              <Text style={styles.cell}>{formatDate(payment.payment_date)}</Text>
              <Text style={[styles.cell, styles.amount]}>{formatCurrency(payment.payment_amount)}</Text>
              <View style={styles.statusWrap}>
                <View style={[styles.statusPill, statusStyle[payment.status]]}>
                  <View style={[styles.dot, payment.status === "FAILED" && styles.failed, payment.status === "PENDING" && styles.pending]} />
                  <Text style={styles.status}>{payment.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {pagination ? (
        <View style={styles.pagination}>
          <Pressable disabled={!pagination.hasPrevPage} onPress={() => setPage(page - 1)} style={styles.pageButton}>
            <Text style={[styles.pageText, !pagination.hasPrevPage && styles.disabled]}>Previous</Text>
          </Pressable>
          <Text style={styles.pageLabel}>Page {pagination.page} of {pagination.totalPages || 1}</Text>
          <Pressable disabled={!pagination.hasNextPage} onPress={() => setPage(page + 1)} style={styles.pageButton}>
            <Text style={[styles.pageText, !pagination.hasNextPage && styles.disabled]}>Next</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.footer}>
        <PrimaryButton label="Back" onPress={goBack} variant="secondary" />
      </View>
    </ScrollView>
  );
}

const statusStyle = StyleSheet.create({
  SUCCESS: {
    backgroundColor: colors.greenSoft,
  },
  PENDING: {
    backgroundColor: colors.amberSoft,
  },
  FAILED: {
    backgroundColor: colors.rustSoft,
  },
});

const styles = StyleSheet.create({
  screen: {
    gap: 12,
    padding: 20,
    paddingBottom: 28,
    backgroundColor: colors.paper,
    flexGrow: 1,
  },
  header: {
    gap: 8,
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
  logout: {
    color: colors.deepTeal,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
  },
  accountPill: {
    alignSelf: "flex-start",
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  account: {
    color: colors.slateInk,
    fontFamily: fonts.mono,
    fontSize: 14,
  },
  table: {
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.surface,
    minWidth: 340,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomColor: colors.hairline,
    borderBottomWidth: 1,
    padding: 12,
  },
  headerCell: {
    flex: 1,
    color: colors.slateMuted,
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: colors.hairline,
    borderBottomWidth: 1,
    padding: 12,
  },
  cell: {
    flex: 1,
    color: colors.slateInk,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  right: {
    textAlign: "right",
  },
  amount: {
    textAlign: "right",
  },
  statusWrap: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  statusPill: {
    minHeight: 26,
    borderRadius: 999,
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.ledgerGreen,
  },
  failed: {
    backgroundColor: colors.alertRust,
  },
  pending: {
    backgroundColor: colors.signalAmber,
  },
  status: {
    color: colors.slateInk,
    fontFamily: fonts.sans,
    fontSize: 12,
  },
  loading: {
    padding: 20,
  },
  empty: {
    padding: 14,
    color: colors.slateMuted,
    fontFamily: fonts.sans,
  },
  error: {
    padding: 14,
    color: colors.alertRust,
    fontFamily: fonts.sans,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageButton: {
    minHeight: 44,
    justifyContent: "center",
  },
  pageText: {
    color: colors.inkNavy,
    fontFamily: fonts.sansMedium,
  },
  disabled: {
    color: colors.slateMuted,
  },
  pageLabel: {
    color: colors.slateMuted,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  footer: {
    marginTop: "auto",
  },
});
