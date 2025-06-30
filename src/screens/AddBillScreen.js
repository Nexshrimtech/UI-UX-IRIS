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

const AddBillScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    billName: '',
    amount: '',
    dueDate: '',
    category: '',
    paymentFrequency: 'one-time',
    repeatFrequency: 'monthly',
    endDate: '',
    reminderEnabled: true,
    reminderTime: '1-day',
    reminderMessage: '',
    notes: '',
  });

  const categories = [
    { id: 'utilities', name: 'Utilities', icon: 'bulb', color: '#3b82f6' },
    { id: 'creditcard', name: 'Credit Card', icon: 'card', color: '#ef4444' },
    { id: 'subscription', name: 'Subscription', icon: 'refresh', color: '#10b981' },
    { id: 'insurance', name: 'Insurance', icon: 'shield-checkmark', color: '#f59e0b' },
    { id: 'rent', name: 'Rent', icon: 'home', color: '#8b5cf6' },
    { id: 'other', name: 'Other', icon: 'ellipsis-horizontal', color: '#6b7280' },
  ];

  const reminderOptions = [
    { id: 'same-day', name: 'Same day' },
    { id: '1-day', name: '1 day before' },
    { id: '3-days', name: '3 days before' },
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.billName || !formData.amount || !formData.dueDate || !formData.category) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      await apiService.createBill(formData);
      Alert.alert(
        'Success',
        'Bill added successfully!',
        [
          { text: 'Add Another', onPress: () => resetForm() },
          { text: 'Go to Home', onPress: () => navigation.navigate('Main') },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add bill. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      billName: '',
      amount: '',
      dueDate: '',
      category: '',
      paymentFrequency: 'one-time',
      repeatFrequency: 'monthly',
      endDate: '',
      reminderEnabled: true,
      reminderTime: '1-day',
      reminderMessage: '',
      notes: '',
    });
  };

  const CategorySelector = () => (
    <View style={styles.categoryContainer}>
      <Text style={styles.label}>
        Category <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              formData.category === category.id && styles.categoryItemSelected
            ]}
            onPress={() => updateFormData('category', category.id)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: category.color + '33' }]}>
              <Ionicons name={category.icon} size={24} color={category.color} />
            </View>
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const FrequencySelector = () => (
    <GradientCard>
      <Text style={styles.label}>Payment Frequency</Text>
      <View style={styles.frequencyToggle}>
        <TouchableOpacity
          style={[
            styles.frequencyButton,
            formData.paymentFrequency === 'one-time' && styles.frequencyButtonActive
          ]}
          onPress={() => updateFormData('paymentFrequency', 'one-time')}
        >
          <Text style={[
            styles.frequencyButtonText,
            formData.paymentFrequency === 'one-time' && styles.frequencyButtonTextActive
          ]}>
            One-time
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.frequencyButton,
            formData.paymentFrequency === 'recurring' && styles.frequencyButtonActive
          ]}
          onPress={() => updateFormData('paymentFrequency', 'recurring')}
        >
          <Text style={[
            styles.frequencyButtonText,
            formData.paymentFrequency === 'recurring' && styles.frequencyButtonTextActive
          ]}>
            Recurring
          </Text>
        </TouchableOpacity>
      </View>

      {formData.paymentFrequency === 'recurring' && (
        <View style={styles.recurringOptions}>
          <Text style={styles.label}>Repeat Every</Text>
          <View style={styles.repeatOptions}>
            {['weekly', 'monthly', 'yearly'].map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.repeatButton,
                  formData.repeatFrequency === freq && styles.repeatButtonActive
                ]}
                onPress={() => updateFormData('repeatFrequency', freq)}
              >
                <Text style={[
                  styles.repeatButtonText,
                  formData.repeatFrequency === freq && styles.repeatButtonTextActive
                ]}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <CustomInput
            label="End Date (Optional)"
            value={formData.endDate}
            onChangeText={(value) => updateFormData('endDate', value)}
            placeholder="Select end date"
            icon="calendar"
          />
        </View>
      )}
    </GradientCard>
  );

  const ReminderSettings = () => (
    <GradientCard>
      <View style={styles.reminderHeader}>
        <Text style={styles.label}>Set Reminder</Text>
        <Switch
          value={formData.reminderEnabled}
          onValueChange={(value) => updateFormData('reminderEnabled', value)}
          trackColor={{ false: '#6b7280', true: '#5046e5' }}
          thumbColor="#ffffff"
        />
      </View>

      {formData.reminderEnabled && (
        <View style={styles.reminderOptions}>
          <Text style={styles.label}>Remind Me</Text>
          <View style={styles.reminderButtons}>
            {reminderOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.reminderButton,
                  formData.reminderTime === option.id && styles.reminderButtonActive
                ]}
                onPress={() => updateFormData('reminderTime', option.id)}
              >
                <Text style={[
                  styles.reminderButtonText,
                  formData.reminderTime === option.id && styles.reminderButtonTextActive
                ]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <CustomInput
            label="Custom Message (Optional)"
            value={formData.reminderMessage}
            onChangeText={(value) => updateFormData('reminderMessage', value)}
            placeholder="Time to pay your bill!"
            icon="chatbubble"
          />
        </View>
      )}
    </GradientCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <GradientCard>
          <CustomInput
            label="Bill Name"
            value={formData.billName}
            onChangeText={(value) => updateFormData('billName', value)}
            placeholder="Enter bill name"
            icon="document-text"
            required
          />
        </GradientCard>

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

        <CategorySelector />
        <FrequencySelector />
        <ReminderSettings />

        <GradientCard>
          <CustomInput
            label="Notes (Optional)"
            value={formData.notes}
            onChangeText={(value) => updateFormData('notes', value)}
            placeholder="Add any additional details here..."
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
            title="Save Bill"
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
  categoryContainer: {
    marginVertical: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2a2a5a',
    marginVertical: 4,
  },
  categoryItemSelected: {
    backgroundColor: '#5046e533',
    borderWidth: 1,
    borderColor: '#5046e5',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
  frequencyToggle: {
    flexDirection: 'row',
    backgroundColor: '#2a2a5a',
    borderRadius: 24,
    padding: 4,
    marginBottom: 16,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#5046e5',
  },
  frequencyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  frequencyButtonTextActive: {
    color: '#ffffff',
  },
  recurringOptions: {
    marginTop: 16,
  },
  repeatOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  repeatButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a5a',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  repeatButtonActive: {
    backgroundColor: '#5046e5',
  },
  repeatButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  repeatButtonTextActive: {
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
  reminderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reminderButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a5a',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  reminderButtonActive: {
    backgroundColor: '#5046e5',
  },
  reminderButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  reminderButtonTextActive: {
    color: '#ffffff',
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

export default AddBillScreen;