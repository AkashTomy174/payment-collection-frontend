import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme/tokens";

export function PaymentStamp({ date }: { date: string }) {
  return (
    <View style={styles.stamp} accessible accessibilityLabel={`Paid on ${date}`}>
      <Text style={styles.top}>PAID</Text>
      <Text style={styles.check}>{"\u2713"}</Text>
      <Text style={styles.date}>{date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    width: 142,
    height: 142,
    borderRadius: 71,
    borderWidth: 2,
    borderColor: colors.inkNavy,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-6deg" }],
    alignSelf: "center",
    marginVertical: 20,
  },
  top: {
    color: colors.inkNavy,
    fontFamily: fonts.monoMedium,
    fontSize: 22,
    letterSpacing: 0.6,
  },
  check: {
    color: colors.inkNavy,
    fontFamily: fonts.sansSemiBold,
    fontSize: 34,
    lineHeight: 42,
  },
  date: {
    color: colors.inkNavy,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
});
