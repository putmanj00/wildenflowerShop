import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface AuthInputProps extends TextInputProps {
    label: string;
    error?: string;
    isPassword?: boolean;
}

export default function AuthInput({ label, error, isPassword, style, ...props }: AuthInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.label}>{label}</Text>
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                ]}
            >
                <TextInput
                    style={styles.input}
                    placeholderTextColor={colors.textSecondary}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={isPassword && !showPassword}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
        width: '100%',
    },
    label: {
        fontFamily: fonts.heading,
        fontSize: fontSizes.bodyLarge,
        color: colors.terracotta,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(34, 66, 41, 0.2)', // Light primary color
        borderRadius: 0, // Sharp corners for elegant feel
        paddingHorizontal: spacing.md,
        height: 50,
    },
    inputFocused: {
        borderColor: colors.terracotta,
        backgroundColor: '#FCFAF8', // Slightly warmer when focused
    },
    inputError: {
        borderColor: colors.error,
    },
    input: {
        flex: 1,
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyLarge,
        color: colors.text,
        height: '100%',
    },
    eyeIcon: {
        paddingLeft: spacing.sm,
    },
    errorText: {
        fontFamily: fonts.bodyItalic,
        fontSize: fontSizes.bodySmall,
        color: colors.error,
        marginTop: spacing.xs,
    },
});
