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

const AddUtilityScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    utilityType: '',
    providerName: '',
    accountNumber: '',
    billingAmount: '',
    dueDate: '',
    frequency: 'monthly',
    reminderEnabled: true,
    reminderDays: '3',
    notificationMethods: {
      app: true,
      email: true,
      sms: false,
    },
    autopayEnabled: false,
    notes: '',
  });

  const utilityTypes = [
    { id: 'electricity', name: 'Electricity', icon: 'flash', color: '#f59e0b' },
    { id: 'water', name: 'Water', icon: 'water', color: '#3b82f6' },
    { id: 'gas', name: 'Gas', icon: 'flame', color: '#ef4444' },
    { id: 'internet', name: 'Internet', icon: 'wifi', color: '#8b5cf6' },
    { id: 'cable', name: 'Cable TV', icon: 'tv', color: '#10b981' },
    { id: 'phone', name: 'Phone', icon: 'call', color: '#f97316' },
  ];

  const frequencies = [
    { id: 'monthly', name: 'Monthly' },
    { id: 'quarterly', name: 'Quarterly' },
    { id: 'yearly', name: 'Yearly' },
  ];

  const reminderDaysOptions = [
    { id: '1', name: '1 day before' },
    { id: '3', name: '3 days before' },
    { id: '5', name: '5 days before' },
    { id: '7', name: '7 days before' },
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNotificationMethod = (method, value) => {
    setFormData(prev => ({
      ...prev,
      notificationMethods: {
        ...prev.notificationMethods,
        [method]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!formData.utilityType || !formData.providerName || !formData.accountNumber || !formData.billingAmount || !formData.dueDate) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      await apiService.createUtility(formData);
      Alert.alert(
        'Success',
        'Utility added successfully!',
        [
          { text: 'Add Another', onPress: () => resetForm() },
          { text: 'Go to Home', onPress: () => navigation.navigate('Main') },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add utility. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      utilityType: '',
      providerName: '',
      accountNumber: '',
      billingAmount: '',
      dueDate: '',
      frequency: 'monthly',
      reminderEnabled: true,
      reminderDays: '3',
      notificationMethods: {
        app: true,
        email: true,
        sms: false,
      },
      autopayEnabled: false,
      notes: '',
    });
  };

  const UtilityTypeSelector = () => (
    <GradientCard>
      <Text style={styles.label}>
        Utility Type <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.utilityTypesGrid}>
        {utilityTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.utilityTypeItem,
              formData.utilityType === type.id && styles.utilityTypeItemSelected
            ]}
            onPress={() => updateFormData('utilityType', type.id)}
          >
            <View style={[styles.utilityTypeIcon, { backgroundColor: type.color + '33' }]}>
              <Ionicons name={type.icon} size={24} color={type.color} />
            </View>
            <Text style={styles.utilityTypeText}>{type.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </GradientCard>
  );

  const FrequencySelector = () => (
    <GradientCard>
      <Text style={styles.label}>
        Payment Frequency <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.frequencyContainer}>
        {frequencies.map((freq) => (
          <TouchableOpacity
            key={freq.id}
            style={[
              styles.frequencyButton,
              formData.frequency === freq.id && styles.frequencyButtonActive
            ]}
            onPress={() => updateFormData('frequency', freq.id)}
          >
            <View style={[
              styles.radioButton,
              formData.frequency === freq.id && styles.radioButtonActive
            ]}>
              {formData.frequency === freq.id && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
            <Text style={styles.frequencyText}>{freq.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </GradientCard>
  );

  const ReminderSettings = () => (
    <GradientCard>
      <View style={styles.reminderHeader}>
        <Text style={styles.label}>Enable Reminders</Text>
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
            {reminderDaysOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.reminderDayButton,
                  formData.reminderDays === option.id && styles.reminderDayButtonActive
                ]}
                onPress={() => updateFormData('reminderDays', option.id)}
              >
                <Text style={[
                  styles.reminderDayText,
                  formData.reminderDays === option.id && styles.reminderDayTextActive
                ]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Notification Method</Text>
          <View style={styles.notificationMethods}>
            {Object.keys(formData.notificationMethods).map((method) => (
              <TouchableOpacity
                key={method}
                style={styles.notificationMethod}
                onPress={() => updateNotificationMethod(method, !formData.notificationMethods[method])}
              >
                <View style={[
                  styles.checkbox,
                  formData.notificationMethods[method] && styles.checkboxActive
                ]}>
                  {formData.notificationMethods[method] && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </View>
                <Text style={styles.notificationMethodText}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </GradientCard>
  );

  const AutoPaySettings = () => (
    <GradientCard>
      <View style={styles.autopayHeader}>
        <View>
          <Text style={styles.label}>Enable Auto-pay</Text>
          <Text style={styles.autopaySubtext}>Automatically pay this bill when due</Text>
        </View>
        <Switch
          value={formData.autopayEnabled}
          onValueChange={(value) => updateFormData('autopayEnabled', value)}
          trackColor={{ false: '#6b7280', true: '#5046e5' }}
          thumbColor="#ffffff"
        />
      </View>
    </GradientCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <UtilityTypeSelector />

        <GradientCard>
          <CustomInput
            label="Provider Name"
            value={formData.providerName}
            onChangeText={(value) => updateFormData('providerName', value)}
            placeholder="Enter provider name"
            icon="business"
            required
          />
        </GradientCard>

        <GradientCard>
          <CustomInput
            label="Account Number"
            value={formData.accountNumber}
            onChangeText={(value) => updateFormData('accountNumber', value)}
            placeholder="Enter account number"
            icon="document-text"
            required
          />
        </GradientCard>

        <GradientCard>
          <CustomInput
            label="Billing Amount"
            value={formData.billingAmount}
            onChangeText={(value) => updateFormData('billingAmount', value)}
            placeholder="0.00"
            icon="cash"
            keyboardType="numeric"
            required
          />
          <Text style={styles.amountSubtext}>Enter the amount in Indian Rupees (₹)</Text>
        </GradientCard>

        <GradientCard>
          <CustomInput
            label="Due Date"
            value={formData.dueDate}
            onChangeText={(value) => updateFormData('dueDate', value)}
            placeholder="Select due date"
            icon="calendar"
            required
          />
        </GradientCard>

        <FrequencySelector />
        <ReminderSettings />
        <AutoPaySettings />

        <GradientCard>
          <CustomInput
            label="Notes (Optional)"
            value={formData.notes}
            onChangeText={(value) => updateFormData('notes', value)}
            placeholder="Add any additional information"
            multiline
            numberOfLines={3}
          />
        </GradientCard>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.cancelButton}
          />
          <CustomButton
            title="Save"
            onPress={handleSubmit}
            style={styles.saveButton}
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
  utilityTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  utilityTypeItem: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2a2a5a',
    marginVertical: 4,
  },
  utilityTypeItemSelected: {
    backgroundColor: '#5046e533',
    borderWidth: 1,
    borderColor: '#5046e5',
  },
  utilityTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  utilityTypeText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  frequencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6b7280',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioButtonActive: {
    borderColor: '#5046e5',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5046e5',
  },
  frequencyText: {
    color: '#ffffff',
    fontSize: 14,
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
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  reminderDayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a5a',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  reminderDayButtonActive: {
    backgroundColor: '#5046e5',
  },
  reminderDayText: {
    color: '#ffffff',
    fontSize: 12,
  },
  reminderDayTextActive: {
    color: '#ffffff',
  },
  notificationMethods: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  notificationMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#6b7280',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: '#5046e5',
    borderColor: '#5046e5',
  },
  notificationMethodText: {
    color: '#ffffff',
    fontSize: 14,
  },
  autopayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autopaySubtext: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  amountSubtext: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default AddUtilityScreen;