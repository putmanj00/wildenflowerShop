import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../../components/layout/Screen';
import BotanicalDivider from '../../components/BotanicalDivider';
import BotanicalHeader from '../../components/BotanicalHeader';
import { colors, fonts, fontSizes, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const VINE_ARROW = require('../../assets/images/icons/ui/vine-arrow-right.png');

interface MenuLinkProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
}

const MenuLink = ({ label, onPress, disabled, comingSoon }: MenuLinkProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.linkRow, disabled && styles.linkRowDisabled]}
    disabled={disabled}
    activeOpacity={0.7}
  >
    <View style={styles.linkTextContainer}>
      <Text style={[styles.linkText, disabled && styles.disabledText]}>{label}</Text>
      {comingSoon && <Text style={styles.comingSoonTag}>Coming soon</Text>}
    </View>
    <Image source={VINE_ARROW} style={styles.arrowIcon} resizeMode="contain" />
  </TouchableOpacity>
);

export default function MenuScreen() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  return (
    <Screen>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <BotanicalHeader variant="small" />

        <View style={styles.container}>
          <BotanicalDivider variant="fern-spiral" />

          <View style={styles.linkList}>
            <MenuLink label="Our Story" onPress={() => router.push('/about')} />
            <MenuLink label="Questions & Curiosities (FAQ)" onPress={() => router.push('/faq')} />
            <MenuLink label="Field Notes (Blog)" onPress={() => router.push('/blog')} />
            <MenuLink label="Contact Us" onPress={() => { }} />
          </View>

          <BotanicalDivider variant="fern-mushroom" />

          <View style={styles.linkList}>
            <Text style={styles.sectionTitle}>Your Account</Text>
            {isAuthenticated ? (
              <>
                <MenuLink label="Order History" onPress={() => router.push('/orders')} />
                <MenuLink label="Saved Items" disabled comingSoon />
                <MenuLink label="Sign Out" onPress={logout} />
              </>
            ) : (
              <MenuLink label="Sign In / Register" onPress={() => router.push('/login')} />
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  linkList: {
    marginVertical: spacing.lg,
    gap: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.h3,
    color: colors.sage,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkRowDisabled: {
    opacity: 0.7,
  },
  linkTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyLarge,
    color: colors.earth,
  },
  disabledText: {
    color: colors.sage,
  },
  arrowIcon: {
    width: 24,
    height: 24,
    tintColor: colors.earth,
  },
  comingSoonTag: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.parchment,
    backgroundColor: colors.sage,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
