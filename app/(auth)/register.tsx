import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSizes, spacing } from '../../constants/theme';
import AuthInput from '../../components/forms/AuthInput';
import Button from '../../components/PrimaryButton';
import Screen from '../../components/layout/Screen';
import BotanicalHeader from '../../components/BotanicalHeader';
import { createCustomer, loginCustomer } from '../../lib/shopify-auth';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
    const router = useRouter();
    const { refreshCustomer } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [apiError, setApiError] = useState('');

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!firstName.trim()) newErrors.firstName = 'First name is required';
        if (!lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Valid email is required';
        }
        if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setIsLoading(true);
        setApiError('');

        const response = await createCustomer({ firstName, lastName, email, password });

        if (response.customerUserErrors && response.customerUserErrors.length > 0) {
            setApiError(response.customerUserErrors[0].message);
            setIsLoading(false);
            return;
        }

        if (!response.customer) {
            setApiError('Unable to create account. Please try again.');
            setIsLoading(false);
            return;
        }

        // Customer created successfully! Now log them in.
        const loginResponse = await loginCustomer(email, password);

        if (!loginResponse.customerAccessToken || loginResponse.customerUserErrors?.length > 0) {
            // Very rare edgecase: created but login failed. Send to login screen.
            setApiError('Account created successfully. Please log in.');
            setIsLoading(false);
            return;
        }

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

                    <Text style={styles.title}>Join Our Grove</Text>
                    <Text style={styles.subtitle}>
                        Create an account to save your favorite artisan treasures and track your orders.
                    </Text>

                    {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

                    <View style={styles.form}>
                        <AuthInput
                            label="First Name"
                            placeholder="Jane"
                            value={firstName}
                            onChangeText={(text) => { setFirstName(text); setErrors({ ...errors, firstName: '' }); }}
                            error={errors.firstName}
                            autoCapitalize="words"
                        />

                        <AuthInput
                            label="Last Name"
                            placeholder="Doe"
                            value={lastName}
                            onChangeText={(text) => { setLastName(text); setErrors({ ...errors, lastName: '' }); }}
                            error={errors.lastName}
                            autoCapitalize="words"
                        />

                        <AuthInput
                            label="Email Address"
                            placeholder="jane@example.com"
                            value={email}
                            onChangeText={(text) => { setEmail(text); setErrors({ ...errors, email: '' }); }}
                            error={errors.email}
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

                        <AuthInput
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={(text) => { setConfirmPassword(text); setErrors({ ...errors, confirmPassword: '' }); }}
                            error={errors.confirmPassword}
                            isPassword
                        />

                        <View style={styles.buttonContainer}>
                            {isLoading ? (
                                <ActivityIndicator color={colors.terracotta} />
                            ) : (
                                <Button label="Create Account" onPress={handleRegister} variant="terracotta" />
                            )}
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already part of the grove?</Text>
                        <Button
                            label="Sign In"
                            onPress={() => router.push('/login')}
                            variant="terracotta"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: spacing.lg,
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
        backgroundColor: 'rgba(215, 60, 48, 0.1)', // Light error bg
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.error,
    },
    form: {
        width: '100%',
    },
    buttonContainer: {
        marginTop: spacing.md,
        alignItems: 'center',
    },
    footer: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: fonts.body,
        fontSize: fontSizes.body,
        color: colors.textSecondary,
    },
});
