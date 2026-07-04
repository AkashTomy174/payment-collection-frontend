import { useState } from "react";
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts } from "../theme/tokens";

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  mono?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export function UnderlinedInput({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
  mono,
  secureTextEntry,
  autoCapitalize = "characters",
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.slateMuted}
        style={[styles.input, focused && styles.focusedInput, mono && styles.monoInput]}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  label: {
    color: colors.slateMuted,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  input: {
    minHeight: 44,
    borderBottomColor: colors.hairline,
    borderBottomWidth: 1,
    color: colors.slateInk,
    fontFamily: fonts.sans,
    fontSize: 16,
    paddingVertical: 8,
  },
  focusedInput: {
    borderBottomColor: colors.deepTeal,
  },
  monoInput: {
    fontFamily: fonts.mono,
  },
});
