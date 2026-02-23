import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSizes, spacing } from '../../constants/theme';
import AuthInput from '../../components/forms/AuthInput';
import Button from '../../components/PrimaryButton';
import Screen from '../../components/layout/Screen';
import BotanicalHeader from '../../components/BotanicalHeader';
import { loginCustomer } from '../../lib/shopify-auth';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { refreshCustomer } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [apiError, setApiError] = useState('');

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Valid email is required';
        }
        if (!password) newErrors.password = 'Password is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setIsLoading(true);
        setApiError('');

        const response = await loginCustomer(email, password);

        if (response.customerUserErrors && response.customerUserErrors.length > 0) {
            setApiError(response.customerUserErrors[0].message);
            setIsLoading(false);
            return;
        }

        if (!response.customerAccessToken) {
            setApiError('Incorrect email or password.');
            setIsLoading(false);
            return;
        }

        // Success! Update global state and redirect
        await refreshCustomer();
        router.replace('/(tabs)/menu'); // Back to main app menu
    };

    return (
        <Screen>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <BotanicalHeader variant="small" />

                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>
                        Sign in to access your saved items and track recent orders.
                    </Text>

                    {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

                    <View style={styles.form}>
                        <AuthInput
                            label="Email Address"
                            placeholder="jane@example.com"
                            value={email}
                            onChangeText={(text) => { setEmail(text); setErrors({ ...errors, email: '' }); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <AuthInput
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={(text) => { setPassword(text); setErrors({ ...errors, password: '' }); }}
                            error={errors.password}
                            isPassword
                        />

                        <View style={styles.buttonContainer}>
                            {isLoading ? (
                                <ActivityIndicator color={colors.terracotta} />
                            ) : (
                                <Button label="Sign In" onPress={handleLogin} variant="terracotta" />
                            )}
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>New to Wildenflower?</Text>
                        <Button
                            label="Create an Account"
                            onPress={() => router.replace('/register')}
                            variant="gold"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.xxl,
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
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
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
    },
    footer: {
        marginTop: spacing.xxl,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.body,
        color: colors.textSecondary,
    },
});
