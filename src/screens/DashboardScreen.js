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
import { LinearGradient } from 'expo-linear-gradient';
import GradientCard from '../components/GradientCard';
import { apiService } from '../services/apiService';

const DashboardScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({
    totalDues: 0,
    upcomingPayments: [],
    categories: {
      creditCards: 0,
      emis: 0,
      subscriptions: 0,
      insurance: 0,
      utilities: 0,
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await apiService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const QuickActionButton = ({ icon, title, onPress, color = '#5046e5' }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}33` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  const CategoryCard = ({ icon, title, count, color, onPress }) => (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
      <GradientCard style={styles.categoryCardContent}>
        <View style={[styles.categoryIcon, { backgroundColor: `${color}33` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.categoryCount}>{count} Active</Text>
      </GradientCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.greeting}>Hi,</Text>
              <Text style={styles.userName}>Abhishek</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="chatbubble-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="notifications-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="settings-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <GradientCard style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Upcoming Dues</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(dashboardData.totalDues)}</Text>
          <View style={styles.balanceFooter}>
            <Text style={styles.balanceSubtext}>Due within next 30 days</Text>
            <TouchableOpacity>
              <Text style={styles.viewDetailsText}>
                View Details <Ionicons name="chevron-forward" size={12} />
              </Text>
            </TouchableOpacity>
          </View>
        </GradientCard>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickActionButton
            icon="add"
            title="Add Bill"
            onPress={() => navigation.navigate('AddBill')}
          />
          <QuickActionButton
            icon="card"
            title="Pay Now"
            onPress={() => navigation.navigate('MobileRecharge')}
          />
          <QuickActionButton
            icon="swap-horizontal"
            title="Transfer"
            onPress={() => Alert.alert('Transfer', 'Transfer feature coming soon!')}
          />
        </View>

        {/* Upcoming Payments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Payments</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {dashboardData.upcomingPayments.map((payment, index) => (
            <GradientCard key={index} style={styles.paymentCard}>
              <View style={styles.paymentCardContent}>
                <View style={styles.paymentLeft}>
                  <View style={[styles.paymentIcon, { backgroundColor: payment.color + '33' }]}>
                    <Ionicons name={payment.icon} size={20} color={payment.color} />
                  </View>
                  <View>
                    <Text style={styles.paymentTitle}>{payment.title}</Text>
                    <Text style={styles.paymentDue}>Due in {payment.daysLeft} days</Text>
                  </View>
                </View>
                <View style={styles.paymentRight}>
                  <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                  <TouchableOpacity>
                    <Text style={styles.payButton}>Pay</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GradientCard>
          ))}
        </View>

        {/* Category Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Payments</Text>
          <View style={styles.categoriesGrid}>
            <CategoryCard
              icon="card"
              title="Credit Cards"
              count={dashboardData.categories.creditCards}
              color="#ef4444"
              onPress={() => Alert.alert('Credit Cards', 'Feature coming soon!')}
            />
            <CategoryCard
              icon="cash"
              title="EMIs"
              count={dashboardData.categories.emis}
              color="#3b82f6"
              onPress={() => navigation.navigate('EMIHub')}
            />
            <CategoryCard
              icon="refresh"
              title="Subscriptions"
              count={dashboardData.categories.subscriptions}
              color="#10b981"
              onPress={() => navigation.navigate('SubscriptionHub')}
            />
            <CategoryCard
              icon="shield-checkmark"
              title="Insurance"
              count={dashboardData.categories.insurance}
              color="#f59e0b"
              onPress={() => Alert.alert('Insurance', 'Feature coming soon!')}
            />
            <CategoryCard
              icon="bulb"
              title="Utilities"
              count={dashboardData.categories.utilities}
              color="#8b5cf6"
              onPress={() => navigation.navigate('UtilityHub')}
            />
            <CategoryCard
              icon="pie-chart"
              title="Analytics"
              count="View"
              color="#ec4899"
              onPress={() => Alert.alert('Analytics', 'Feature coming soon!')}
            />
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => showAddModal()}
      >
        <LinearGradient
          colors={['#5046e5', '#8a7bff']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );

  function showAddModal() {
    Alert.alert(
      'Add New',
      'What would you like to add?',
      [
        { text: 'Bill', onPress: () => navigation.navigate('AddBill') },
        { text: 'EMI', onPress: () => navigation.navigate('AddEMI') },
        { text: 'Subscription', onPress: () => navigation.navigate('AddSubscription') },
        { text: 'Utility', onPress: () => navigation.navigate('AddUtility') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff33',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  greeting: {
    color: '#d1d5db',
    fontSize: 12,
  },
  userName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a5a',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  balanceCard: {
    marginVertical: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  balanceLabel: {
    color: '#d1d5db',
    fontSize: 14,
  },
  premiumBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  premiumText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '600',
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceSubtext: {
    color: '#9ca3af',
    fontSize: 12,
  },
  viewDetailsText: {
    color: '#5046e5',
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 12,
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
  viewAllText: {
    color: '#5046e5',
    fontSize: 12,
  },
  paymentCard: {
    marginVertical: 4,
  },
  paymentCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentDue: {
    color: '#9ca3af',
    fontSize: 12,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  payButton: {
    color: '#5046e5',
    fontSize: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    marginVertical: 4,
  },
  categoryCardContent: {
    alignItems: 'center',
    padding: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    color: '#5046e5',
    fontSize: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DashboardScreen;