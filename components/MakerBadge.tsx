/**
 * Wildenflower — MakerBadge
 * ==========================
 * A compact row displaying a maker's avatar and name/location.
 * Used inside ProductCard and on the Product Detail screen.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../constants/theme';
import { Maker } from '../types';

// ─── Props ───────────────────────────────────

interface MakerBadgeProps {
  maker: Maker;
  onPress?: () => void;
  /** Optional additional styles applied to the outer container. */
  style?: ViewStyle;
}

// ─── Component ───────────────────────────────

export const MakerBadge: React.FC<MakerBadgeProps> = ({ maker, onPress, style }) => {
  const content = (
    <View style={[styles.row, style]}>
      {/* Avatar */}
      <View style={styles.avatarCircle}>
        {/* ASSET: maker avatar — maker.avatar image uri, circular crop */}
        {/* Replace with: <Image source={{ uri: maker.avatar }} style={styles.avatarImage} /> */}
        <Text style={styles.avatarInitial}>
          {maker.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Name & Location */}
      <View style={styles.textStack}>
        <Text style={styles.name} numberOfLines={1}>
          {maker.name}
        </Text>
        {maker.location ? (
          <Text style={styles.location} numberOfLines={1}>
            {maker.location}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`View ${maker.name}'s profile`}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

// ─── Styles ──────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.parchmentDark,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Placeholder — swap out once real avatars exist:
  // avatarImage: { width: 32, height: 32, borderRadius: 16 },
  avatarInitial: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.inkBrown,
    lineHeight: 16,
  },
  textStack: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.bodySmall,
    color: colors.earth,
  },
  location: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySmall,
    color: colors.sage,
  },
});

export default MakerBadge;
