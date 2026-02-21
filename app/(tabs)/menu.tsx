import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../../components/layout/Screen';
import BotanicalDivider from '../../components/BotanicalDivider';
import { colors, fonts, fontSizes, spacing } from '../../constants/theme';

export default function MenuScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.heading}>Discover</Text>
        <BotanicalDivider variant="fern-spiral" />

        <View style={styles.linkList}>
          {/* Active Links */}
          <TouchableOpacity onPress={() => router.push('/about')} style={styles.linkRow}>
            <Text style={styles.linkText}>Our Story</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/faq')} style={styles.linkRow}>
            <Text style={styles.linkText}>Questions & Curiosities (FAQ)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/blog')} style={styles.linkRow}>
            <Text style={styles.linkText}>Field Notes (Blog)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { }} style={styles.linkRow}>
            <Text style={styles.linkText}>Contact Us</Text>
          </TouchableOpacity>
        </View>

        <BotanicalDivider variant="fern-mushroom" />

        <View style={styles.linkList}>
          <Text style={styles.sectionTitle}>Your Account</Text>
          {/* Coming Soon Links */}
          <TouchableOpacity disabled style={styles.linkRow}>
            <Text style={[styles.linkText, styles.disabledText]}>Sign In / Register</Text>
            <Text style={styles.comingSoonTag}>Coming soon</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled style={styles.linkRow}>
            <Text style={[styles.linkText, styles.disabledText]}>Order History</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled style={styles.linkRow}>
            <Text style={[styles.linkText, styles.disabledText]}>Saved Items</Text>
          </TouchableOpacity>
        </View>

      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xxl,
  },
  heading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: fontSizes.h1,
    color: colors.terracotta,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  linkList: {
    marginVertical: spacing.xl,
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.accent,
    fontSize: fontSizes.h3,
    color: colors.sage,
    marginBottom: spacing.sm,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  linkText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyLarge,
    color: colors.earth,
  },
  disabledText: {
    color: colors.sage,
    opacity: 0.7,
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
