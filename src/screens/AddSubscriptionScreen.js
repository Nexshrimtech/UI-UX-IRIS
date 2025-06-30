import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import GradientCard from '../components/GradientCard';
import { apiService } from '../services/apiService';

const AddSubscriptionScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    subscriptionName: '',
    provider: '',
    amount: '',
    billingCycle: 'monthly',
    customCycle: { number: 1, period: 'months' },
    startDate: '',
    category: '',
    paymentMethod: '',
    reminderEnabled: true,
    reminderDays: 3,
    notificationTypes: {
      push: true,
      email: false,
      sms: false,
    },
  });

  const providers = [
    { id: 'netflix', name: 'Netflix', color: '#E50914', icon: 'tv' },
    { id: 'spotify', name: 'Spotify', color: '#1DB954', icon: 'musical-notes' },
    { id: 'microsoft', name: 'Microsoft', color: '#00A4EF', icon: 'desktop' },
    { id: 'amazon', name: 'Amazon', color: '#FF9900', icon: 'storefront' },
    { id: 'apple', name: 'Apple', color: '#A2AAAD', icon: 'logo-apple' },
    { id: 'youtube', name: 'YouTube', color: '#FF0000', icon: 'logo-youtube' },
    { id: 'telegram', name: 'Telegram', color: '#0088CC', icon: 'send' },
    { id: 'discord', name: 'Discord', color: '#5865F2', icon: 'chatbubbles' },
  ];

  const categories = [
    'Entertainment',
    'Software',
    'Utilities',
    'Streaming',
    'Gaming',
    'Education',
    'Other',
  ];

  const paymentMethods = [
    'HDFC Credit Card (...4582)',
    'SBI Debit Card (...1234)',
    'ICICI Credit Card (...7890)',
    'Paytm Wallet',
    'Google Pay',
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNotificationType = (type, value) => {
    setFormData(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!formData.subscriptionName || !formData.amount || !formData.startDate || !formData.category || !formData.paymentMethod) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      await apiService.createSubscription(formData);
      Alert.alert(
        'Success',
        'Subscription added successfully!',
        [
          { text: 'Go to Home', onPress: () => navigation.navigate('Main') },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add subscription. Please try again.');
    }
  };

  const ProviderSelector = () => (
    <View style={styles.providerContainer}>
      <Text style={styles.label}>Provider</Text>
      <View style={styles.providersGrid}>
        {providers.map((provider) => (
          <TouchableOpacity
            key={provider.id}
            style={[
              styles.providerItem,
              formData.provider === provider.id && styles.providerItemSelected
            ]}
            onPress={() => {
              updateFormData('provider', provider.id);
              if (!formData.subscriptionName) {
                updateFormData('subscriptionName', provider.name);
              }
            }}
          >
            <View style={[styles.providerIcon, { backgroundColor: provider.color }]}>
              <Ionicons name={provider.icon} size={20} color="#ffffff" />
            </View>
            <Text style={styles.providerText}>{provider.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const BillingCycleSelector = () => (
    <GradientCard>
      <Text style={styles.label}>Billing Cycle</Text>
      <View style={styles.billingCycleGrid}>
        {['monthly', 'yearly', 'custom'].map((cycle) => (
          <TouchableOpacity
            key={cycle}
            style={[
              styles.billingCycleButton,
              formData.billingCycle === cycle && styles.billingCycleButtonActive
            ]}
            onPress={() => updateFormData('billingCycle', cycle)}
          >
            <Text style={[
              styles.billingCycleText,
              formData.billingCycle === cycle && styles.billingCycleTextActive
            ]}>
              {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {formData.billingCycle === 'custom' && (
        <View style={styles.customCycleContainer}>
          <Text style={styles.label}>Every</Text>
          <View style={styles.customCycleRow}>
            <CustomInput
              value={formData.customCycle.number.toString()}
              onChangeText={(value) => updateFormData('customCycle', { ...formData.customCycle, number: parseInt(value) || 1 })}
              keyboardType="numeric"
              style={styles.customCycleNumber}
            />
            <View style={styles.customCyclePeriod}>
              {['days', 'weeks', 'months', 'years'].map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    formData.customCycle.period === period && styles.periodButtonActive
                  ]}
                  onPress={() => updateFormData('customCycle', { ...formData.customCycle, period })}
                >
                  <Text style={[
                    styles.periodButtonText,
                    formData.customCycle.period === period && styles.periodButtonTextActive
                  ]}>
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </GradientCard>
  );

  const ReminderSettings = () => (
    <GradientCard>
      <View style={styles.reminderHeader}>
        <Text style={styles.label}>Payment Reminder</Text>
        <Switch
          value={formData.reminderEnabled}
          onValueChange={(value) => updateFormData('reminderEnabled', value)}
          trackColor={{ false: '#6b7280', true: '#5046e5' }}
          thumbColor="#ffffff"
        />
      </View>

      {formData.reminderEnabled && (
        <View style={styles.reminderOptions}>
          <Text style={styles.label}>Remind me before</Text>
          <View style={styles.reminderDaysContainer}>
            <CustomInput
              value={formData.reminderDays.toString()}
              onChangeText={(value) => updateFormData('reminderDays', parseInt(value) || 1)}
              keyboardType="numeric"
              style={styles.reminderDaysInput}
            />
            <Text style={styles.reminderDaysText}>days</Text>
          </View>

          <Text style={styles.label}>Notification type</Text>
          <View style={styles.notificationTypesGrid}>
            {Object.keys(formData.notificationTypes).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.notificationTypeButton,
                  formData.notificationTypes[type] && styles.notificationTypeButtonActive
                ]}
                onPress={() => updateNotificationType(type, !formData.notificationTypes[type])}
              >
                <Text style={[
                  styles.notificationTypeText,
                  formData.notificationTypes[type] && styles.notificationTypeTextActive
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </GradientCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <GradientCard>
          <CustomInput
            label="Subscription Name"
            value={formData.subscriptionName}
            onChangeText={(value) => updateFormData('subscriptionName', value)}
            placeholder="Enter subscription name"
            required
          />
        </GradientCard>

        <ProviderSelector />

        <GradientCard>
          <CustomInput
            label="Amount"
            value={formData.amount}
            onChangeText={(value) => updateFormData('amount', value)}
            placeholder="0.00"
            icon="cash"
            keyboardType="numeric"
            required
          />
        </GradientCard>

        <BillingCycleSelector />

        <GradientCard>
          <CustomInput
            label="Start Date"
            value={formData.startDate}
            onChangeText={(value) => updateFormData('startDate', value)}
            placeholder="Select start date"
            icon="calendar"
            required
          />
        </GradientCard>

        <GradientCard>
          <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  formData.category === category && styles.categoryButtonActive
                ]}
                onPress={() => updateFormData('category', category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  formData.category === category && styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GradientCard>

        <GradientCard>
          <Text style={styles.label}>Payment Method <Text style={styles.required}>*</Text></Text>
          <View style={styles.paymentMethodContainer}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentMethodButton,
                  formData.paymentMethod === method && styles.paymentMethodButtonActive
                ]}
                onPress={() => updateFormData('paymentMethod', method)}
              >
                <Text style={[
                  styles.paymentMethodText,
                  formData.paymentMethod === method && styles.paymentMethodTextActive
                ]}>
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GradientCard>

        <ReminderSettings />

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Save Subscription"
            onPress={handleSubmit}
          />
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
  label: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  providerContainer: {
    marginVertical: 8,
  },
  providersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  providerItem: {
    width: '22%',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#2a2a5a',
    marginVertical: 4,
  },
  providerItemSelected: {
    borderWidth: 2,
    borderColor: '#5046e5',
  },
  providerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  providerText: {
    color: '#ffffff',
    fontSize: 10,
    textAlign: 'center',
  },
  billingCycleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  billingCycleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#2a2a5a',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  billingCycleButtonActive: {
    backgroundColor: '#5046e5',
  },
  billingCycleText: {
    color: '#ffffff',
    fontSize: 14,
  },
  billingCycleTextActive: {
    color: '#ffffff',
  },
  customCycleContainer: {
    marginTop: 16,
  },
  customCycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customCycleNumber: {
    width: 80,
    marginRight: 16,
  },
  customCyclePeriod: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a5a',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#5046e5',
  },
  periodButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a5a',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#5046e5',
  },
  categoryButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  paymentMethodContainer: {
    marginTop: 8,
  },
  paymentMethodButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a5a',
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentMethodButtonActive: {
    backgroundColor: '#5046e5',
  },
  paymentMethodText: {
    color: '#ffffff',
    fontSize: 14,
  },
  paymentMethodTextActive: {
    color: '#ffffff',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderOptions: {
    marginTop: 16,
  },
  reminderDaysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderDaysInput: {
    width: 80,
    marginRight: 8,
  },
  reminderDaysText: {
    color: '#ffffff',
    fontSize: 14,
  },
  notificationTypesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#2a2a5a',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  notificationTypeButtonActive: {
    backgroundColor: '#5046e5',
  },
  notificationTypeText: {
    color: '#ffffff',
    fontSize: 12,
  },
  notificationTypeTextActive: {
    color: '#ffffff',
  },
  buttonContainer: {
    marginVertical: 24,
  },
});

export default AddSubscriptionScreen;