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

const UtilityHubScreen = ({ navigation }) => {
  const [utilities, setUtilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUtilities();
  }, []);

  const loadUtilities = async () => {
    try {
      const data = await apiService.getUtilities();
      setUtilities(data);
    } catch (error) {
      console.error('Error loading utilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUtilityIcon = (type) => {
    const icons = {
      electricity: 'flash',
      water: 'water',
      gas: 'flame',
      internet: 'wifi',
      cable: 'tv',
      phone: 'call',
    };
    return icons[type] || 'bulb';
  };

  const getUtilityColor = (type) => {
    const colors = {
      electricity: '#f59e0b',
      water: '#3b82f6',
      gas: '#ef4444',
      internet: '#8b5cf6',
      cable: '#10b981',
      phone: '#f97316',
    };
    return colors[type] || '#6b7280';
  };

  const getStatusColor = (daysUntilDue) => {
    if (daysUntilDue < 0) return '#ef4444'; // Overdue - red
    if (daysUntilDue <= 3) return '#f59e0b'; // Due soon - yellow
    return '#10b981'; // On time - green
  };

  const getStatusText = (daysUntilDue) => {
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} days overdue`;
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `Due in ${daysUntilDue} days`;
  };

  const handlePayUtility = (utility) => {
    Alert.alert(
      'Pay Utility Bill',
      `Pay ${formatCurrency(utility.amount)} for ${utility.providerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: () => processPayment(utility) },
      ]
    );
  };

  const processPayment = async (utility) => {
    try {
      await apiService.payUtility(utility.id);
      Alert.alert('Success', 'Utility bill payment processed successfully!');
      loadUtilities(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  };

  const UtilityCard = ({ utility }) => {
    const daysUntilDue = getDaysUntilDue(utility.dueDate);
    const utilityIcon = getUtilityIcon(utility.type);
    const utilityColor = getUtilityColor(utility.type);
    const statusColor = getStatusColor(daysUntilDue);
    const statusText = getStatusText(daysUntilDue);

    return (
      <GradientCard style={styles.utilityCard}>
        <View style={styles.utilityHeader}>
          <View style={styles.utilityInfo}>
            <View style={[styles.utilityIcon, { backgroundColor: utilityColor + '33' }]}>
              <Ionicons name={utilityIcon} size={24} color={utilityColor} />
            </View>
            <View style={styles.utilityDetails}>
              <Text style={styles.utilityProvider}>{utility.providerName}</Text>
              <Text style={styles.utilityType}>{utility.type.charAt(0).toUpperCase() + utility.type.slice(1)}</Text>
              <Text style={styles.utilityAccount}>Account: {utility.accountNumber}</Text>
            </View>
          </View>
          <View style={styles.utilityAmount}>
            <Text style={styles.utilityAmountText}>{formatCurrency(utility.amount)}</Text>
            <Text style={[styles.utilityStatus, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.utilityMeta}>
          <View style={styles.utilityMetaItem}>
            <Text style={styles.utilityMetaLabel}>Frequency</Text>
            <Text style={styles.utilityMetaValue}>{utility.frequency}</Text>
          </View>
          <View style={styles.utilityMetaItem}>
            <Text style={styles.utilityMetaLabel}>Auto-pay</Text>
            <Text style={[
              styles.utilityMetaValue,
              { color: utility.autopayEnabled ? '#10b981' : '#ef4444' }
            ]}>
              {utility.autopayEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <View style={styles.utilityMetaItem}>
            <Text style={styles.utilityMetaLabel}>Reminder</Text>
            <Text style={[
              styles.utilityMetaValue,
              { color: utility.reminderEnabled ? '#10b981' : '#ef4444' }
            ]}>
              {utility.reminderEnabled ? 'On' : 'Off'}
            </Text>
          </View>
        </View>

        <View style={styles.utilityActions}>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => handlePayUtility(utility)}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </GradientCard>
    );
  };

  const SummaryCard = () => {
    const totalUtilities = utilities.length;
    const totalMonthlyAmount = utilities.reduce((sum, utility) => {
      if (utility.frequency === 'monthly') return sum + utility.amount;
      if (utility.frequency === 'quarterly') return sum + (utility.amount / 3);
      if (utility.frequency === 'yearly') return sum + (utility.amount / 12);
      return sum;
    }, 0);
    const overdueUtilities = utilities.filter(utility => getDaysUntilDue(utility.dueDate) < 0).length;

    return (
      <GradientCard style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Utility Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalUtilities}</Text>
            <Text style={styles.summaryLabel}>Total Bills</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatCurrency(totalMonthlyAmount)}</Text>
            <Text style={styles.summaryLabel}>Monthly Avg</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: overdueUtilities > 0 ? '#ef4444' : '#10b981' }]}>
              {overdueUtilities}
            </Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </View>
        </View>
      </GradientCard>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading utilities...</Text>
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
            <Text style={styles.sectionTitle}>Your Utilities</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddUtility')}>
              <Text style={styles.addButton}>Add Utility</Text>
            </TouchableOpacity>
          </View>

          {utilities.length === 0 ? (
            <GradientCard style={styles.emptyState}>
              <View style={styles.emptyStateContent}>
                <Ionicons name="bulb-outline" size={48} color="#6b7280" />
                <Text style={styles.emptyStateTitle}>No Utilities Found</Text>
                <Text style={styles.emptyStateText}>
                  You haven't added any utility bills yet. Add your first utility to start tracking payments.
                </Text>
                <CustomButton
                  title="Add Your First Utility"
                  onPress={() => navigation.navigate('AddUtility')}
                  style={styles.emptyStateButton}
                />
              </View>
            </GradientCard>
          ) : (
            utilities.map((utility) => (
              <UtilityCard key={utility.id} utility={utility} />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Bill Reminder', 'Reminder feature coming soon!')}
            >
              <GradientCard style={styles.quickActionContent}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="notifications" size={24} color="#f59e0b" />
                </View>
                <Text style={styles.quickActionTitle}>Set Reminders</Text>
                <Text style={styles.quickActionSubtitle}>Never miss a payment</Text>
              </GradientCard>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Auto-pay', 'Auto-pay feature coming soon!')}
            >
              <GradientCard style={styles.quickActionContent}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="refresh" size={24} color="#10b981" />
                </View>
                <Text style={styles.quickActionTitle}>Setup Auto-pay</Text>
                <Text style={styles.quickActionSubtitle}>Automate payments</Text>
              </GradientCard>
            </TouchableOpacity>
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
  utilityCard: {
    marginVertical: 4,
  },
  utilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  utilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  utilityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  utilityDetails: {
    flex: 1,
  },
  utilityProvider: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  utilityType: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  utilityAccount: {
    color: '#9ca3af',
    fontSize: 12,
  },
  utilityAmount: {
    alignItems: 'flex-end',
  },
  utilityAmountText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  utilityStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  utilityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ffffff33',
  },
  utilityMetaItem: {
    alignItems: 'center',
  },
  utilityMetaLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  utilityMetaValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  utilityActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payButton: {
    flex: 1,
    backgroundColor: '#5046e5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6b7280',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  detailsButtonText: {
    color: '#ffffff',
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default UtilityHubScreen;