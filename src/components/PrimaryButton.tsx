import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme/tokens";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
};

export function PrimaryButton({ label, onPress, disabled, loading, variant = "primary" }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondary,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={variant === "secondary" ? colors.inkNavy : colors.white} /> : null}
        <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 4,
    backgroundColor: colors.deepTeal,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    shadowColor: colors.inkNavy,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondary: {
    backgroundColor: "transparent",
    borderColor: colors.inkNavy,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.86,
  },
  label: {
    color: colors.white,
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
  },
  secondaryLabel: {
    color: colors.inkNavy,
  },
});
