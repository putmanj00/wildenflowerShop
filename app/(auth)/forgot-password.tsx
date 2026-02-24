import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSizes, spacing } from '../../constants/theme';
import AuthInput from '../../components/forms/AuthInput';
import Button from '../../components/PrimaryButton';
import Screen from '../../components/layout/Screen';
import BotanicalHeader from '../../components/BotanicalHeader';
import { recoverCustomer } from '../../lib/shopify-auth';

export default function ForgotPasswordScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');

    const validate = () => {
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Valid email is required');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleRecover = async () => {
        if (!validate()) return;

        setIsLoading(true);
        setError('');

        const response = await recoverCustomer(email);

        if (response.customerUserErrors && response.customerUserErrors.length > 0) {
            setError(response.customerUserErrors[0].message);
            setIsLoading(false);
            return;
        }

        // Success state
        setIsLoading(false);
        setIsSuccess(true);
    };

    return (
        <Screen>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <BotanicalHeader variant="small" />

                    <Text style={styles.title}>Forgot Password</Text>

                    {isSuccess ? (
                        <View style={styles.successContainer}>
                            <Text style={styles.subtitle}>
                                If an account exists with that email, a password reset link will be sent. Please check your inbox.
                            </Text>
                            <View style={styles.buttonContainer}>
                                <Button label="Back to Login" onPress={() => router.replace('/login')} variant="terracotta" />
                            </View>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.subtitle}>
                                Enter your email address and we'll send you a link to reset your password.
                            </Text>

                            {error ? <Text style={styles.apiError}>{error}</Text> : null}

                            <View style={styles.form}>
                                <AuthInput
                                    label="Email Address"
                                    placeholder="jane@example.com"
                                    value={email}
                                    onChangeText={(text) => { setEmail(text); setEmailError(''); }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    error={emailError}
                                />

                                <View style={styles.buttonContainer}>
                                    {isLoading ? (
                                        <ActivityIndicator color={colors.terracotta} />
                                    ) : (
                                        <Button label="Reset Password" onPress={handleRecover} variant="terracotta" />
                                    )}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.loginLink}
                                onPress={() => router.replace('/login')}
                            >
                                <Text style={styles.loginLinkText}>Back to Login</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.xxl,
        paddingHorizontal: spacing.lg,
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
    },
    title: {
        fontFamily: fonts.heading,
        fontSize: fontSizes.h2,
        color: colors.terracotta,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: fontSizes.bodyLarge,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    successContainer: {
        alignItems: 'center',
    },
    apiError: {
        fontFamily: fonts.bodyItalic,
        fontSize: fontSizes.body,
        color: colors.error,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    form: {
        width: '100%',
    },
    buttonContainer: {
        marginTop: spacing.md,
        alignItems: 'center',
        alignSelf: 'center',
    },
    loginLink: {
        marginTop: spacing.xl,
        alignSelf: 'center',
    },
    loginLinkText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.body,
        color: colors.terracotta,
        textDecorationLine: 'underline',
    },
});
