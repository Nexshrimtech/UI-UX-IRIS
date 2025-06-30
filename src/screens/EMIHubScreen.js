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

const EMIHubScreen = ({ navigation }) => {
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEMIs();
  }, []);

  const loadEMIs = async () => {
    try {
      const data = await apiService.getEMIs();
      setEmis(data);
    } catch (error) {
      console.error('Error loading EMIs:', error);
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

  const handlePayEMI = (emi) => {
    Alert.alert(
      'Pay EMI',
      `Pay ${formatCurrency(emi.amount)} for ${emi.loanName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: () => processPayment(emi) },
      ]
    );
  };

  const processPayment = async (emi) => {
    try {
      await apiService.payEMI(emi.id);
      Alert.alert('Success', 'EMI payment processed successfully!');
      loadEMIs(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  };

  const EMICard = ({ emi }) => {
    const daysUntilDue = getDaysUntilDue(emi.nextDueDate);
    const statusColor = getStatusColor(daysUntilDue);
    const statusText = getStatusText(daysUntilDue);

    return (
      <GradientCard style={styles.emiCard}>
        <View style={styles.emiHeader}>
          <View style={styles.emiInfo}>
            <Text style={styles.emiTitle}>{emi.loanName}</Text>
            <Text style={styles.emiBank}>{emi.bankName}</Text>
          </View>
          <View style={styles.emiAmount}>
            <Text style={styles.emiAmountText}>{formatCurrency(emi.amount)}</Text>
            <Text style={[styles.emiStatus, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.emiDetails}>
          <View style={styles.emiDetailItem}>
            <Text style={styles.emiDetailLabel}>Principal</Text>
            <Text style={styles.emiDetailValue}>{formatCurrency(emi.principalAmount)}</Text>
          </View>
          <View style={styles.emiDetailItem}>
            <Text style={styles.emiDetailLabel}>Interest Rate</Text>
            <Text style={styles.emiDetailValue}>{emi.interestRate}%</Text>
          </View>
          <View style={styles.emiDetailItem}>
            <Text style={styles.emiDetailLabel}>Remaining</Text>
            <Text style={styles.emiDetailValue}>{emi.remainingTenure} months</Text>
          </View>
        </View>

        <View style={styles.emiActions}>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => handlePayEMI(emi)}
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
    const totalEMIs = emis.length;
    const totalMonthlyAmount = emis.reduce((sum, emi) => sum + emi.amount, 0);
    const overdueEMIs = emis.filter(emi => getDaysUntilDue(emi.nextDueDate) < 0).length;

    return (
      <GradientCard style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>EMI Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalEMIs}</Text>
            <Text style={styles.summaryLabel}>Active EMIs</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatCurrency(totalMonthlyAmount)}</Text>
            <Text style={styles.summaryLabel}>Monthly Total</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: overdueEMIs > 0 ? '#ef4444' : '#10b981' }]}>
              {overdueEMIs}
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
          <Text style={styles.loadingText}>Loading EMIs...</Text>
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
            <Text style={styles.sectionTitle}>Your EMIs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddEMI')}>
              <Text style={styles.addButton}>Add EMI</Text>
            </TouchableOpacity>
          </View>

          {emis.length === 0 ? (
            <GradientCard style={styles.emptyState}>
              <View style={styles.emptyStateContent}>
                <Ionicons name="card-outline" size={48} color="#6b7280" />
                <Text style={styles.emptyStateTitle}>No EMIs Found</Text>
                <Text style={styles.emptyStateText}>
                  You haven't added any EMIs yet. Add your first EMI to start tracking payments.
                </Text>
                <CustomButton
                  title="Add Your First EMI"
                  onPress={() => navigation.navigate('AddEMI')}
                  style={styles.emptyStateButton}
                />
              </View>
            </GradientCard>
          ) : (
            emis.map((emi) => (
              <EMICard key={emi.id} emi={emi} />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('LoanApplication')}
            >
              <GradientCard style={styles.quickActionContent}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="document-text" size={24} color="#3b82f6" />
                </View>
                <Text style={styles.quickActionTitle}>Apply for Loan</Text>
                <Text style={styles.quickActionSubtitle}>Get pre-approved loans</Text>
              </GradientCard>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => Alert.alert('EMI Calculator', 'Calculator feature coming soon!')}
            >
              <GradientCard style={styles.quickActionContent}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="calculator" size={24} color="#10b981" />
                </View>
                <Text style={styles.quickActionTitle}>EMI Calculator</Text>
                <Text style={styles.quickActionSubtitle}>Calculate your EMI</Text>
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
  emiCard: {
    marginVertical: 4,
  },
  emiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  emiInfo: {
    flex: 1,
  },
  emiTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emiBank: {
    color: '#9ca3af',
    fontSize: 14,
  },
  emiAmount: {
    alignItems: 'flex-end',
  },
  emiAmountText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emiStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  emiDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ffffff33',
  },
  emiDetailItem: {
    alignItems: 'center',
  },
  emiDetailLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  emiDetailValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  emiActions: {
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

export default EMIHubScreen;