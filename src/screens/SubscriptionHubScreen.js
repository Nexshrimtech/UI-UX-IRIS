import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientCard from '../components/GradientCard';
import CustomButton from '../components/CustomButton';
import { apiService } from '../services/apiService';

const SubscriptionHubScreen = ({ navigation }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const data = await apiService.getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getDaysUntilRenewal = (renewalDate) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProviderIcon = (provider) => {
    const icons = {
      netflix: 'tv',
      spotify: 'musical-notes',
      microsoft: 'desktop',
      amazon: 'storefront',
      apple: 'logo-apple',
      youtube: 'logo-youtube',
      telegram: 'send',
      discord: 'chatbubbles',
    };
    return icons[provider] || 'apps';
  };

  const getProviderColor = (provider) => {
    const colors = {
      netflix: '#E50914',
      spotify: '#1DB954',
      microsoft: '#00A4EF',
      amazon: '#FF9900',
      apple: '#A2AAAD',
      youtube: '#FF0000',
      telegram: '#0088CC',
      discord: '#5865F2',
    };
    return colors[provider] || '#6b7280';
  };

  const handleCancelSubscription = (subscription) => {
    Alert.alert(
      'Cancel Subscription',
      `Are you sure you want to cancel ${subscription.name}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', onPress: () => cancelSubscription(subscription) },
      ]
    );
  };

  const cancelSubscription = async (subscription) => {
    try {
      await apiService.cancelSubscription(subscription.id);
      Alert.alert('Success', 'Subscription cancelled successfully!');
      loadSubscriptions(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
    }
  };

  const SubscriptionCard = ({ subscription }) => {
    const daysUntilRenewal = getDaysUntilRenewal(subscription.nextRenewalDate);
    const providerIcon = getProviderIcon(subscription.provider);
    const providerColor = getProviderColor(subscription.provider);

    return (
      <GradientCard style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <View style={styles.subscriptionInfo}>
            <View style={[styles.providerIcon, { backgroundColor: providerColor }]}>
              <Ionicons name={providerIcon} size={24} color="#ffffff" />
            </View>
            <View style={styles.subscriptionDetails}>
              <Text style={styles.subscriptionName}>{subscription.name}</Text>
              <Text style={styles.subscriptionProvider}>{subscription.provider}</Text>
            </View>
          </View>
          <View style={styles.subscriptionAmount}>
            <Text style={styles.subscriptionAmountText}>{formatCurrency(subscription.amount)}</Text>
            <Text style={styles.subscriptionCycle}>/{subscription.billingCycle}</Text>
          </View>
        </View>

        <View style={styles.subscriptionMeta}>
          <View style={styles.subscriptionMetaItem}>
            <Text style={styles.subscriptionMetaLabel}>Next Renewal</Text>
            <Text style={styles.subscriptionMetaValue}>
              {daysUntilRenewal === 0 ? 'Today' : 
               daysUntilRenewal === 1 ? 'Tomorrow' : 
               `${daysUntilRenewal} days`}
            </Text>
          </View>
          <View style={styles.subscriptionMetaItem}>
            <Text style={styles.subscriptionMetaLabel}>Category</Text>
            <Text style={styles.subscriptionMetaValue}>{subscription.category}</Text>
          </View>
          <View style={styles.subscriptionMetaItem}>
            <Text style={styles.subscriptionMetaLabel}>Status</Text>
            <Text style={[
              styles.subscriptionMetaValue,
              { color: subscription.status === 'active' ? '#10b981' : '#ef4444' }
            ]}>
              {subscription.status}
            </Text>
          </View>
        </View>

        <View style={styles.subscriptionActions}>
          <TouchableOpacity style={styles.manageButton}>
            <Text style={styles.manageButtonText}>Manage</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelSubscription(subscription)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </GradientCard>
    );
  };

  const SummaryCard = () => {
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
    const monthlyTotal = subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => {
        if (sub.billingCycle === 'monthly') return sum + sub.amount;
        if (sub.billingCycle === 'yearly') return sum + (sub.amount / 12);
        return sum;
      }, 0);

    return (
      <GradientCard style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Subscription Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalSubscriptions}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{activeSubscriptions}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatCurrency(monthlyTotal)}</Text>
            <Text style={styles.summaryLabel}>Monthly Cost</Text>
          </View>
        </View>
      </GradientCard>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading subscriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <SummaryCard />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Subscriptions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddSubscription')}>
              <Text style={styles.addButton}>Add New</Text>
            </TouchableOpacity>
          </View>

          {subscriptions.length === 0 ? (
            <GradientCard style={styles.emptyState}>
              <View style={styles.emptyStateContent}>
                <Ionicons name="refresh-outline" size={48} color="#6b7280" />
                <Text style={styles.emptyStateTitle}>No Subscriptions Found</Text>
                <Text style={styles.emptyStateText}>
                  You haven't added any subscriptions yet. Add your first subscription to start tracking renewals.
                </Text>
                <CustomButton
                  title="Add Your First Subscription"
                  onPress={() => navigation.navigate('AddSubscription')}
                  style={styles.emptyStateButton}
                />
              </View>
            </GradientCard>
          ) : (
            subscriptions.map((subscription) => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          <View style={styles.popularServices}>
            {[
              { name: 'Netflix', provider: 'netflix', price: 649 },
              { name: 'Spotify', provider: 'spotify', price: 119 },
              { name: 'Amazon Prime', provider: 'amazon', price: 1499 },
              { name: 'YouTube Premium', provider: 'youtube', price: 129 },
            ].map((service, index) => (
              <TouchableOpacity
                key={index}
                style={styles.popularServiceCard}
                onPress={() => navigation.navigate('AddSubscription')}
              >
                <GradientCard style={styles.popularServiceContent}>
                  <View style={[
                    styles.popularServiceIcon,
                    { backgroundColor: getProviderColor(service.provider) }
                  ]}>
                    <Ionicons name={getProviderIcon(service.provider)} size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.popularServiceName}>{service.name}</Text>
                  <Text style={styles.popularServicePrice}>From {formatCurrency(service.price)}</Text>
                </GradientCard>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a3a',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  summaryCard: {
    marginVertical: 8,
  },
  summaryTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    color: '#5046e5',
    fontSize: 14,
    fontWeight: '500',
  },
  subscriptionCard: {
    marginVertical: 4,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subscriptionDetails: {
    flex: 1,
  },
  subscriptionName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subscriptionProvider: {
    color: '#9ca3af',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  subscriptionAmount: {
    alignItems: 'flex-end',
  },
  subscriptionAmountText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subscriptionCycle: {
    color: '#9ca3af',
    fontSize: 12,
  },
  subscriptionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ffffff33',
  },
  subscriptionMetaItem: {
    alignItems: 'center',
  },
  subscriptionMetaLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  subscriptionMetaValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  subscriptionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  manageButton: {
    flex: 1,
    backgroundColor: '#5046e5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  manageButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    paddingVertical: 32,
  },
  emptyStateContent: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
  },
  popularServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  popularServiceCard: {
    width: '48%',
    marginVertical: 4,
  },
  popularServiceContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  popularServiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  popularServiceName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  popularServicePrice: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default SubscriptionHubScreen;