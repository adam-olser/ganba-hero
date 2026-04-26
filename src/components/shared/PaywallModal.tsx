import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Pressable, ActivityIndicator, Alert } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { Card, Text, Heading2, Body, Caption, Button } from './index';
import { colors, spacing, borderRadius } from '@/theme';
import { getOfferings, purchasePackage, restorePurchases } from '@/services/paywall';
import { analyticsService } from '@/services/analytics';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaywallModal({ visible, onClose, onSuccess }: PaywallModalProps) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!visible) return;
    analyticsService.logSubscriptionEvent('view_paywall');
    getOfferings().then(pkgs => {
      setPackages(pkgs);
      setLoading(false);
    });
  }, [visible]);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(true);
    const result = await purchasePackage(pkg);
    setPurchasing(false);

    if (result.success && result.isPremium) {
      analyticsService.logSubscriptionEvent('subscribe');
      onSuccess();
    } else if (result.error) {
      Alert.alert('Purchase Failed', result.error);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const isPremium = await restorePurchases();
    setPurchasing(false);
    if (isPremium) {
      onSuccess();
    } else {
      Alert.alert('No Purchases Found', 'No active subscriptions were found for your account.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <Card variant="elevated" style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.emoji}>🌟</Text>
              <Heading2 style={styles.title}>Unlock All Levels</Heading2>
              <Body color="textSecondary" align="center">
                Get full access to N4, N3, N2, and N1 vocabulary and grammar.
              </Body>
            </View>

            <View style={styles.features}>
              {['N5–N1 vocabulary (5,000+ words)', 'All grammar patterns', 'Unlimited daily cards', 'Priority support'].map(f => (
                <View key={f} style={styles.featureRow}>
                  <Text color="success">✓</Text>
                  <Caption color="textSecondary">{f}</Caption>
                </View>
              ))}
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : packages.length === 0 ? (
              <Caption align="center" color="textMuted">
                Pricing unavailable. Check back soon.
              </Caption>
            ) : (
              <View style={styles.packages}>
                {packages.map(pkg => (
                  <Button
                    key={pkg.identifier}
                    title={`${pkg.product.title} — ${pkg.product.priceString}`}
                    variant="primary"
                    size="large"
                    fullWidth
                    loading={purchasing}
                    onPress={() => handlePurchase(pkg)}
                  />
                ))}
              </View>
            )}

            <Pressable onPress={handleRestore} style={styles.restoreButton} disabled={purchasing}>
              <Caption color="textMuted" align="center">Restore Purchases</Caption>
            </Pressable>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
  },
  card: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    textAlign: 'center',
  },
  features: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loader: {
    paddingVertical: spacing.xl,
  },
  packages: {
    gap: spacing.md,
  },
  restoreButton: {
    paddingVertical: spacing.sm,
  },
});

export default PaywallModal;
