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

const AddEMIScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    loanName: '',
    principalAmount: '',
    interestRate: '',
    tenure: '',
    emiAmount: '',
    paymentDate: '',
    bankDetails: '',
    reminderEnabled: true,
    reminderDays: '3',
    notificationMethods: {
      email: true,
      sms: true,
      push: true,
    },
  });

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

  const calculateEMI = () => {
    const principal = parseFloat(formData.principalAmount);
    const rate = parseFloat(formData.interestRate) / 12 / 100;
    const tenure = parseInt(formData.tenure);

    if (!principal || !rate || !tenure) {
      Alert.alert('Error', 'Please fill all required fields for EMI calculation');
      return;
    }

    const emi = principal * rate * Math.pow(1 + rate, tenure) / (Math.pow(1 + rate, tenure) - 1);
    updateFormData('emiAmount', emi.toFixed(2));
  };

  const handleSubmit = async () => {
    if (!formData.loanName || !formData.principalAmount || !formData.tenure || !formData.emiAmount || !formData.paymentDate || !formData.bankDetails) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      await apiService.createEMI(formData);
      Alert.alert(
        'Success',
        'EMI added successfully!',
        [
          { text: 'Go to Dashboard', onPress: () => navigation.navigate('Main') },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add EMI. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <GradientCard>
          <CustomInput
            label="Loan/Purchase Name"
            value={formData.loanName}
            onChangeText={(value) => updateFormData('loanName', value)}
            placeholder="e.g. Home Loan, Car Loan, Phone Purchase"
            required
          />
        </GradientCard>

        <GradientCard>
          <CustomInput
            label="Principal Amount"
            value={formData.principalAmount}
            onChangeText={(value) => updateFormData('principalAmount', value)}
            placeholder="Enter amount"
            icon="cash"
            keyboardType="numeric"
            required
          />
        </GradientCard>

        <GradientCard>
          <CustomInput
            label="Interest Rate (p.a.)"
            value={formData.interestRate}
            onChangeText={(value) => updateFormData('interestRate', value)}
            placeholder="e.g. 8.5"
            keyboardType="numeric"
          />
        </GradientCard>

        <GradientCard>
          <CustomInput
            label="Tenure"
            value={formData.tenure}
            onChangeText={(value) => updateFormData('tenure', value)}
            placeholder="Number of months"
            keyboardType="numeric"
            required
          />
        </GradientCard>

        <GradientCard>
          <View style={styles.emiContainer}>
            <View style={styles.emiHeader}>
              <Text style={styles.label}>
                EMI Amount <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity onPress={calculateEMI}>
                <Text style={styles.calculateButton}>Calculate</Text>
              </TouchableOpacity>
            </View>
            <CustomInput
              value={formData.emiAmount}
              onChangeText={(value) => updateFormData('emiAmount', value)}
              placeholder="Monthly payment amount"
              icon="cash"
              keyboardType="numeric"
              required
            />
          </View>
        </GradientCard>

        <GradientCard>
          <CustomInput
            label="Payment Date"
            value={formData.paymentDate}
            onChangeText={(value) => updateFormData('paymentDate', value)}
            placeholder="Select payment date"
            icon="calendar"
            required
          />
        </GradientCard>

        <GradientCard>
          <CustomInput
            label="Bank/Lender Details"
            value={formData.bankDetails}
            onChangeText={(value) => updateFormData('bankDetails', value)}
            placeholder="e.g. HDFC Bank, SBI, Bajaj Finserv"
            required
          />
        </GradientCard>

        <GradientCard>
          <View style={styles.reminderHeader}>
            <Text style={styles.label}>Payment Reminders</Text>
            <Switch
              value={formData.reminderEnabled}
              onValueChange={(value) => updateFormData('reminderEnabled', value)}
              trackColor={{ false: '#6b7280', true: '#5046e5' }}
              thumbColor="#ffffff"
            />
          </View>

          {formData.reminderEnabled && (
            <View style={styles.reminderOptions}>
              <Text style={styles.label}>Remind me</Text>
              <View style={styles.reminderDaysContainer}>
                {['1', '3', '5', '7'].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.reminderDayButton,
                      formData.reminderDays === days && styles.reminderDayButtonActive
                    ]}
                    onPress={() => updateFormData('reminderDays', days)}
                  >
                    <Text style={[
                      styles.reminderDayText,
                      formData.reminderDays === days && styles.reminderDayTextActive
                    ]}>
                      {days} day{days !== '1' ? 's' : ''} before
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Notification Method</Text>
              <View style={styles.notificationMethods}>
                <TouchableOpacity
                  style={styles.notificationMethod}
                  onPress={() => updateNotificationMethod('email', !formData.notificationMethods.email)}
                >
                  <View style={[
                    styles.checkbox,
                    formData.notificationMethods.email && styles.checkboxActive
                  ]}>
                    {formData.notificationMethods.email && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </View>
                  <Text style={styles.notificationMethodText}>Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.notificationMethod}
                  onPress={() => updateNotificationMethod('sms', !formData.notificationMethods.sms)}
                >
                  <View style={[
                    styles.checkbox,
                    formData.notificationMethods.sms && styles.checkboxActive
                  ]}>
                    {formData.notificationMethods.sms && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </View>
                  <Text style={styles.notificationMethodText}>SMS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.notificationMethod}
                  onPress={() => updateNotificationMethod('push', !formData.notificationMethods.push)}
                >
                  <View style={[
                    styles.checkbox,
                    formData.notificationMethods.push && styles.checkboxActive
                  ]}>
                    {formData.notificationMethods.push && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </View>
                  <Text style={styles.notificationMethodText}>Push</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </GradientCard>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Save EMI"
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
  emiContainer: {
    marginVertical: 8,
  },
  emiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculateButton: {
    color: '#5046e5',
    fontSize: 12,
    fontWeight: '500',
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
  buttonContainer: {
    marginVertical: 24,
  },
});

export default AddEMIScreen;