import { useEffect, useState } from "react";
import { ActivityIndicator, BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getAdminCustomers, getPayments } from "../api/client";
import { PrimaryButton } from "../components/PrimaryButton";
import { UnderlinedInput } from "../components/UnderlinedInput";
import { colors, fonts } from "../theme/tokens";
import type { AuthUser, Customer, Pagination, Payment } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

type SortField = "account_number" | "issue_date" | "emi_due";
type SortOrder = "asc" | "desc";

type Props = {
  user: AuthUser;
  logout: () => void;
};

export function AdminDashboardScreen({ user, logout }: Props) {
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortField>("account_number");
  const [order, setOrder] = useState<SortOrder>("asc");
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAccountNumber, setSelectedAccountNumber] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [historyPagination, setHistoryPagination] = useState<Pagination | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const selectedCustomer = customers.find((customer) => customer.account_number === selectedAccountNumber) ?? null;

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (selectedAccountNumber) {
        setSelectedAccountNumber("");
        return true;
      }

      if (searchQuery) {
        setSearchDraft("");
        setSearchQuery("");
        setPage(1);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [searchQuery, selectedAccountNumber]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getAdminCustomers({
      page,
      limit: 8,
      sort,
      order,
      accountNumber: searchQuery,
    })
      .then((body) => {
        if (cancelled) return;
        setCustomers(body.data);
        setPagination(body.pagination);
      })
      .catch((customersError) => {
        if (cancelled) return;
        setError(customersError instanceof Error ? customersError.message : "Unable to load loans");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [order, page, searchQuery, sort]);

  useEffect(() => {
    if (!customers.length) {
      if (selectedAccountNumber) {
        setSelectedAccountNumber("");
      }
      return;
    }

    if (!selectedAccountNumber || !customers.some((customer) => customer.account_number === selectedAccountNumber)) {
      setSelectedAccountNumber(customers[0].account_number);
    }
  }, [customers, selectedAccountNumber]);

  useEffect(() => {
    setHistoryPage(1);
  }, [selectedAccountNumber]);

  useEffect(() => {
    if (!selectedCustomer) {
      setPayments([]);
      setHistoryPagination(null);
      setHistoryError("");
      return;
    }

    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError("");

    getPayments(selectedCustomer.account_number, historyPage)
      .then((body) => {
        if (cancelled) return;
        setPayments(body.data);
        setHistoryPagination(body.pagination);
      })
      .catch((historyLoadError) => {
        if (cancelled) return;
        setHistoryError(historyLoadError instanceof Error ? historyLoadError.message : "Unable to load payment history");
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [historyPage, selectedCustomer]);

  function applySearch() {
    setPage(1);
    setSelectedAccountNumber("");
    setSearchQuery(searchDraft.trim());
  }

  function clearSearch() {
    setSearchDraft("");
    setSearchQuery("");
    setPage(1);
    setSelectedAccountNumber("");
  }

  function changeSort(nextSort: SortField) {
    setPage(1);
    setSelectedAccountNumber("");
    setSort(nextSort);
  }

  function toggleOrder() {
    setPage(1);
    setSelectedAccountNumber("");
    setOrder((current) => (current === "asc" ? "desc" : "asc"));
  }

  function selectCustomer(accountNumber: string) {
    setSelectedAccountNumber(accountNumber);
  }

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.eyebrow}>ADMIN LEDGER</Text>
          <Text onPress={logout} style={styles.logout}>
            Logout
          </Text>
        </View>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>
          Signed in as {user.name}. Search, sort, and inspect every loan with payment history in one place.
        </Text>
      </View>

      <View style={styles.panel}>
        <UnderlinedInput
          label="Search account number"
          value={searchDraft}
          onChangeText={setSearchDraft}
          placeholder="AC1029"
          mono
        />
        <View style={styles.actionRow}>
          <PrimaryButton label="Search" onPress={applySearch} />
          <PrimaryButton label="Clear" onPress={clearSearch} variant="secondary" />
        </View>
        <View style={styles.filters}>
          <SortChip label="Account" active={sort === "account_number"} onPress={() => changeSort("account_number")} />
          <SortChip label="Issue date" active={sort === "issue_date"} onPress={() => changeSort("issue_date")} />
          <SortChip label="EMI" active={sort === "emi_due"} onPress={() => changeSort("emi_due")} />
          <SortChip label={order === "asc" ? "Asc" : "Desc"} active onPress={toggleOrder} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Loans: {pagination?.totalCount ?? 0}</Text>
          <Text style={styles.metaText}>
            Page {pagination?.page ?? 1} of {pagination?.totalPages || 1}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Loan List</Text>
          <Text style={styles.sectionHint}>Tap any loan to inspect its payment history.</Text>
        </View>

        {loading ? <ActivityIndicator color={colors.inkNavy} style={styles.loading} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !customers.length ? <Text style={styles.empty}>No matching loans found.</Text> : null}

        <View style={styles.loanList}>
          {customers.map((customer) => {
            const selected = customer.account_number === selectedAccountNumber;

            return (
              <Pressable
                key={customer.id}
                onPress={() => selectCustomer(customer.account_number)}
                style={({ pressed }) => [styles.loanCard, selected && styles.loanCardActive, pressed && styles.loanCardPressed]}
              >
                <View style={styles.loanCardTop}>
                  <Text style={styles.loanAccount}>{customer.account_number}</Text>
                  <Text style={styles.loanAmount}>{formatCurrency(customer.emi_due)}</Text>
                </View>
                <Text style={styles.loanMeta}>
                  Issued {formatDate(customer.issue_date)} - {customer.interest_rate}% interest
                </Text>
                <View style={styles.loanStats}>
                  <StatPill label="Paid" value={`${customer.paid_installments}`} />
                  <StatPill label="Left" value={`${customer.payments_left}`} />
                  <StatPill label="Total" value={formatCurrency(customer.total_amount_to_be_paid)} />
                </View>
              </Pressable>
            );
          })}
        </View>

        {pagination ? (
          <View style={styles.pagination}>
            <PrimaryButton
              label="Previous"
              onPress={() => setPage(page - 1)}
              disabled={!pagination.hasPrevPage}
              variant="secondary"
            />
            <Text style={styles.pageLabel}>
              {pagination.page} / {pagination.totalPages || 1}
            </Text>
            <PrimaryButton label="Next" onPress={() => setPage(page + 1)} disabled={!pagination.hasNextPage} variant="secondary" />
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Loan Detail</Text>
            <Text style={styles.sectionHint}>History appears here for the selected account.</Text>
          </View>
          {selectedCustomer ? (
            <PrimaryButton label="Back to list" onPress={() => setSelectedAccountNumber("")} variant="secondary" />
          ) : null}
        </View>

        {selectedCustomer ? (
          <>
            <View style={styles.detailCard}>
              <View style={styles.detailGrid}>
                <DetailRow label="Account" value={selectedCustomer.account_number} mono />
                <DetailRow label="Issue date" value={formatDate(selectedCustomer.issue_date)} />
                <DetailRow label="Interest" value={`${selectedCustomer.interest_rate}%`} />
                <DetailRow label="Tenure" value={`${selectedCustomer.tenure_months} months`} />
                <DetailRow label="EMI due" value={formatCurrency(selectedCustomer.emi_due)} />
                <DetailRow label="Left" value={`${selectedCustomer.payments_left}`} />
                <DetailRow label="Paid" value={`${selectedCustomer.paid_installments}`} />
                <DetailRow label="Remaining total" value={formatCurrency(selectedCustomer.total_amount_to_be_paid)} />
              </View>
            </View>

            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Payment History</Text>
              <Text style={styles.sectionHint}>
                Page {historyPagination?.page ?? 1} of {historyPagination?.totalPages || 1}
              </Text>
            </View>

            {historyLoading ? <ActivityIndicator color={colors.inkNavy} style={styles.loading} /> : null}
            {historyError ? <Text style={styles.error}>{historyError}</Text> : null}
            {!historyLoading && !payments.length ? <Text style={styles.empty}>No payments recorded for this loan.</Text> : null}

            <View style={styles.historyList}>
              {payments.map((payment) => (
                <View key={payment.id} style={styles.historyRow}>
                  <View>
                    <Text style={styles.historyDate}>{formatDate(payment.payment_date)}</Text>
                    <Text style={styles.historyReference}>{payment.transaction_reference}</Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyAmount}>{formatCurrency(payment.payment_amount)}</Text>
                    <Text style={styles.historyStatus}>{payment.status}</Text>
                  </View>
                </View>
              ))}
            </View>

            {historyPagination ? (
              <View style={styles.pagination}>
                <PrimaryButton
                  label="Previous"
                  onPress={() => setHistoryPage(historyPage - 1)}
                  disabled={!historyPagination.hasPrevPage}
                  variant="secondary"
                />
                <Text style={styles.pageLabel}>
                  {historyPagination.page} / {historyPagination.totalPages || 1}
                </Text>
                <PrimaryButton
                  label="Next"
                  onPress={() => setHistoryPage(historyPage + 1)}
                  disabled={!historyPagination.hasNextPage}
                  variant="secondary"
                />
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Pick a loan above</Text>
            <Text style={styles.empty}>Use the list to load payment history and loan details.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

type SortChipProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

function SortChip({ label, active = false, onPress }: SortChipProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.chipPressed]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
  mono?: boolean;
};

function DetailRow({ label, value, mono }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, mono && styles.detailValueMono]}>{value}</Text>
    </View>
  );
}

type StatPillProps = {
  label: string;
  value: string;
};

function StatPill({ label, value }: StatPillProps) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
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
  logout: {
    color: colors.deepTeal,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
  },
  title: {
    color: colors.inkNavy,
    fontFamily: fonts.sansSemiBold,
    fontSize: 28,
  },
  subtitle: {
    color: colors.slateMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  panel: {
    gap: 12,
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.surface,
    padding: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderColor: colors.hairline,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.deepTeal,
    backgroundColor: colors.tealSoft,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    color: colors.slateMuted,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
  },
  chipTextActive: {
    color: colors.deepTeal,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metaText: {
    color: colors.slateMuted,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },
  sectionTitle: {
    color: colors.inkNavy,
    fontFamily: fonts.sansSemiBold,
    fontSize: 18,
  },
  sectionHint: {
    color: colors.slateMuted,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  loading: {
    paddingVertical: 12,
  },
  error: {
    color: colors.alertRust,
    fontFamily: fonts.sans,
    fontSize: 13,
  },
  empty: {
    color: colors.slateMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
  },
  emptyState: {
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.surfaceMuted,
    padding: 16,
    gap: 6,
  },
  emptyTitle: {
    color: colors.slateInk,
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
  },
  loanList: {
    gap: 10,
  },
  loanCard: {
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 8,
  },
  loanCardActive: {
    borderColor: colors.deepTeal,
    backgroundColor: colors.tealSoft,
  },
  loanCardPressed: {
    opacity: 0.9,
  },
  loanCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  loanAccount: {
    color: colors.inkNavy,
    fontFamily: fonts.monoMedium,
    fontSize: 15,
  },
  loanAmount: {
    color: colors.inkNavy,
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
  },
  loanMeta: {
    color: colors.slateMuted,
    fontFamily: fonts.sans,
    fontSize: 13,
  },
  loanStats: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  statPill: {
    minWidth: 92,
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  statLabel: {
    color: colors.slateMuted,
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  statValue: {
    color: colors.slateInk,
    fontFamily: fonts.monoMedium,
    fontSize: 13,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pageLabel: {
    color: colors.slateMuted,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  detailCard: {
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.surface,
    padding: 14,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  detailRow: {
    width: "48%",
    gap: 2,
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: colors.surfaceMuted,
    padding: 10,
  },
  detailLabel: {
    color: colors.slateMuted,
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  detailValue: {
    color: colors.slateInk,
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
  },
  detailValueMono: {
    fontFamily: fonts.monoMedium,
  },
  historyList: {
    gap: 8,
  },
  historyRow: {
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: colors.surface,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  historyDate: {
    color: colors.slateInk,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
  },
  historyReference: {
    color: colors.slateMuted,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginTop: 2,
  },
  historyRight: {
    alignItems: "flex-end",
  },
  historyAmount: {
    color: colors.inkNavy,
    fontFamily: fonts.monoMedium,
    fontSize: 14,
  },
  historyStatus: {
    color: colors.deepTeal,
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    marginTop: 2,
  },
});
