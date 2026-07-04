import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme/tokens";

type Row = {
  label: string;
  value: string;
  large?: boolean;
};

export function LedgerBlock({ rows }: { rows: Row[] }) {
  return (
    <View style={styles.block}>
      {rows.map((row, index) => (
        <View key={row.label} style={[styles.row, index === rows.length - 1 && styles.lastRow]}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={[styles.value, row.large && styles.largeValue]}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  row: {
    minHeight: 48,
    borderBottomColor: colors.hairline,
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    color: colors.slateMuted,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    flex: 1,
  },
  value: {
    color: colors.slateInk,
    fontFamily: fonts.mono,
    fontSize: 15,
    textAlign: "right",
    flex: 1,
  },
  largeValue: {
    fontFamily: fonts.monoMedium,
    fontSize: 21,
  },
});
