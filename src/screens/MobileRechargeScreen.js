import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import GradientCard from '../components/GradientCard';
import { apiService } from '../services/apiService';

const MobileRechargeScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    mobileNumber: '',
    operator: '',
    rechargeType: 'prepaid',
    selectedPlan: null,
    customAmount: '',
    paymentMethod: '',
  });

  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);

  const operators = [
    { id: 'airtel', name: 'Airtel', color: '#ef4444', icon: 'radio' },
    { id: 'jio', name: 'Jio', color: '#3b82f6', icon: 'radio' },
    { id: 'vi', name: 'Vi', color: '#8b5cf6', icon: 'radio' },
    { id: 'bsnl', name: 'BSNL', color: '#10b981', icon: 'radio' },
    { id: 'tata', name: 'Tata Play', color: '#f59e0b', icon: 'radio' },
    { id: 'mtnl', name: 'MTNL', color: '#f97316', icon: 'radio' },
  ];

  const plans = [
    {
      id: 1,
      amount: 239,
      validity: '28 days',
      benefits: '1.5GB/day + Unlimited Calls',
      extras: 'Free Disney+ Hotstar Mobile',
    },
    {
      id: 2,
      amount: 479,
      validity: '56 days',
      benefits: '1.5GB/day + Unlimited Calls',
      extras: 'Free Amazon Prime Video Mobile',
    },
    {
      id: 3,
      amount: 719,
      validity: '84 days',
      benefits: '2GB/day + Unlimited Calls',
      extras: 'Free Netflix Mobile + Disney+ Hotstar',
    },
  ];

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      subtitle: 'Visa, Mastercard, RuPay',
      icon: 'card',
      color: '#6366f1',
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      subtitle: 'All major banks',
      icon: 'business',
      color: '#3b82f6',
    },
    {
      id: 'upi',
      name: 'UPI',
      subtitle: 'Google Pay, PhonePe, Paytm',
      icon: 'qr-code',
      color: '#10b981',
    },
    {
      id: 'wallet',
      name: 'Wallet',
      subtitle: 'IrisPay Balance: ₹12,458.90',
      icon: 'wallet',
      color: '#8b5cf6',
    },
  ];

  const contacts = [
    { name: 'Aditya Sharma', number: '9876543210', color: '#3b82f6' },
    { name: 'Priya Patel', number: '8765432109', color: '#8b5cf6' },
    { name: 'Rahul Gupta', number: '7654321098', color: '#10b981' },
    { name: 'Neha Verma', number: '9876123450', color: '#ef4444' },
    { name: 'Vikram Singh', number: '8123456789', color: '#f59e0b' },
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleProceed = () => {
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!formData.operator) {
      Alert.alert('Error', 'Please select an operator');
      return;
    }

    if (!formData.selectedPlan && !formData.customAmount) {
      Alert.alert('Error', 'Please select a plan or enter a custom amount');
      return;
    }

    if (!formData.paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    const amount = formData.selectedPlan ? formData.selectedPlan.amount : parseFloat(formData.customAmount);
    
    Alert.alert(
      'Confirm Recharge',
      `Mobile: ${formData.mobileNumber}\nOperator: ${formData.operator}\nAmount: ${formatCurrency(amount)}\n\nProceed with payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: handlePayment },
      ]
    );
  };

  const handlePayment = async () => {
    try {
      const rechargeData = {
        ...formData,
        amount: formData.selectedPlan ? formData.selectedPlan.amount : parseFloat(formData.customAmount),
      };
      
      await apiService.processRecharge(rechargeData);
      
      Alert.alert(
        'Recharge Successful!',
        `Your recharge of ${formatCurrency(rechargeData.amount)} for ${formData.mobileNumber} has been completed successfully.\n\nTransaction ID: IRIS123456789`,
        [
          { text: 'Done', onPress: () => navigation.navigate('Main') },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Recharge failed. Please try again.');
    }
  };

  const OperatorSelector = () => (
    <GradientCard>
      <Text style={styles.label}>Select Operator</Text>
      <View style={styles.operatorsGrid}>
        {operators.map((operator) => (
          <TouchableOpacity
            key={operator.id}
            style={[
              styles.operatorItem,
              formData.operator === operator.id && styles.operatorItemSelected
            ]}
            onPress={() => updateFormData('operator', operator.id)}
          >
            <View style={[styles.operatorIcon, { backgroundColor: operator.color + '33' }]}>
              <Ionicons name={operator.icon} size={24} color={operator.color} />
            </View>
            <Text style={styles.operatorText}>{operator.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </GradientCard>
  );

  const RechargeTypeToggle = () => (
    <GradientCard>
      <View style={styles.rechargeTypeToggle}>
        <TouchableOpacity
          style={[
            styles.rechargeTypeButton,
            formData.rechargeType === 'prepaid' && styles.rechargeTypeButtonActive
          ]}
          onPress={() => updateFormData('rechargeType', 'prepaid')}
        >
          <Text style={[
            styles.rechargeTypeText,
            formData.rechargeType === 'prepaid' && styles.rechargeTypeTextActive
          ]}>
            Prepaid
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.rechargeTypeButton,
            formData.rechargeType === 'postpaid' && styles.rechargeTypeButtonActive
          ]}
          onPress={() => updateFormData('rechargeType', 'postpaid')}
        >
          <Text style={[
            styles.rechargeTypeText,
            formData.rechargeType === 'postpaid' && styles.rechargeTypeTextActive
          ]}>
            Postpaid
          </Text>
        </TouchableOpacity>
      </View>
    </GradientCard>
  );

  const PlansSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended Plans</Text>
        <TouchableOpacity onPress={() => setShowPlansModal(true)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {plans.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={[
            styles.planCard,
            formData.selectedPlan?.id === plan.id && styles.planCardSelected
          ]}
          onPress={() => {
            updateFormData('selectedPlan', plan);
            updateFormData('customAmount', '');
          }}
        >
          <GradientCard style={styles.planCardContent}>
            <View style={styles.planHeader}>
              <Text style={styles.planAmount}>{formatCurrency(plan.amount)}</Text>
              <Text style={styles.planValidity}>Validity: {plan.validity}</Text>
            </View>
            <Text style={styles.planBenefits}>{plan.benefits}</Text>
            <Text style={styles.planExtras}>{plan.extras}</Text>
          </GradientCard>
        </TouchableOpacity>
      ))}

      <GradientCard>
        <Text style={styles.label}>Enter Custom Amount</Text>
        <CustomInput
          value={formData.customAmount}
          onChangeText={(value) => {
            updateFormData('customAmount', value);
            updateFormData('selectedPlan', null);
          }}
          placeholder="Enter amount"
          icon="cash"
          keyboardType="numeric"
        />
      </GradientCard>
    </View>
  );

  const PaymentMethodSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentMethodCard,
            formData.paymentMethod === method.id && styles.paymentMethodCardSelected
          ]}
          onPress={() => updateFormData('paymentMethod', method.id)}
        >
          <GradientCard style={styles.paymentMethodContent}>
            <View style={styles.paymentMethodLeft}>
              <View style={[
                styles.radioButton,
                formData.paymentMethod === method.id && styles.radioButtonActive
              ]}>
                {formData.paymentMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <View style={[styles.paymentMethodIcon, { backgroundColor: method.color + '33' }]}>
                <Ionicons name={method.icon} size={20} color={method.color} />
              </View>
              <View>
                <Text style={styles.paymentMethodName}>{method.name}</Text>
                <Text style={styles.paymentMethodSubtitle}>{method.subtitle}</Text>
              </View>
            </View>
          </GradientCard>
        </TouchableOpacity>
      ))}
    </View>
  );

  const ContactsModal = () => (
    <Modal
      visible={showContactsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowContactsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Contact</Text>
            <TouchableOpacity onPress={() => setShowContactsModal(false)}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.contactsList}>
            {contacts.map((contact, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactItem}
                onPress={() => {
                  updateFormData('mobileNumber', contact.number);
                  setShowContactsModal(false);
                }}
              >
                <View style={[styles.contactAvatar, { backgroundColor: contact.color + '33' }]}>
                  <Ionicons name="person" size={20} color={contact.color} />
                </View>
                <View>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Mobile Number Input */}
        <GradientCard>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.mobileInputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+91</Text>
              <Ionicons name="chevron-down" size={16} color="#ffffff" />
            </View>
            <View style={styles.mobileInputWrapper}>
              <CustomInput
                value={formData.mobileNumber}
                onChangeText={(value) => updateFormData('mobileNumber', value)}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.mobileInput}
              />
              <TouchableOpacity 
                style={styles.contactsButton}
                onPress={() => setShowContactsModal(true)}
              >
                <Ionicons name="people" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        </GradientCard>

        <OperatorSelector />
        <RechargeTypeToggle />

        {formData.rechargeType === 'prepaid' ? (
          <PlansSection />
        ) : (
          <GradientCard>
            <Text style={styles.label}>Postpaid Bill</Text>
            <View style={styles.billDetails}>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Bill Amount</Text>
                <Text style={styles.billAmount}>₹849.00</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Due Date</Text>
                <Text style={styles.billValue}>July 10, 2025</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Bill Period</Text>
                <Text style={styles.billValue}>June 01 - June 30, 2025</Text>
              </View>
            </View>
          </GradientCard>
        )}

        <PaymentMethodSelector />

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Proceed to Recharge"
            onPress={handleProceed}
          />
        </View>
      </ScrollView>

      <ContactsModal />
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
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a5a',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  countryCodeText: {
    color: '#ffffff',
    fontSize: 14,
    marginRight: 4,
  },
  mobileInputWrapper: {
    flex: 1,
    position: 'relative',
  },
  mobileInput: {
    marginVertical: 0,
  },
  contactsButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  operatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  operatorItem: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2a2a5a',
    marginVertical: 4,
  },
  operatorItemSelected: {
    backgroundColor: '#5046e533',
    borderWidth: 1,
    borderColor: '#5046e5',
  },
  operatorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  operatorText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
  rechargeTypeToggle: {
    flexDirection: 'row',
    backgroundColor: '#2a2a5a',
    borderRadius: 24,
    padding: 4,
  },
  rechargeTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  rechargeTypeButtonActive: {
    backgroundColor: '#5046e5',
  },
  rechargeTypeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  rechargeTypeTextActive: {
    color: '#ffffff',
  },
  section: {
    marginVertical: 8,
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
  planCard: {
    marginVertical: 4,
  },
  planCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  planCardContent: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planAmount: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  planValidity: {
    color: '#9ca3af',
    fontSize: 12,
  },
  planBenefits: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 4,
  },
  planExtras: {
    color: '#9ca3af',
    fontSize: 12,
  },
  paymentMethodCard: {
    marginVertical: 4,
  },
  paymentMethodCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  paymentMethodContent: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentMethodLeft: {
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
    marginRight: 12,
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
  paymentMethodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentMethodName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentMethodSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
  },
  billDetails: {
    marginTop: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  billAmount: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  billValue: {
    color: '#ffffff',
    fontSize: 14,
  },
  buttonContainer: {
    marginVertical: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a3a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  contactsList: {
    maxHeight: 300,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  contactNumber: {
    color: '#9ca3af',
    fontSize: 12,
  },
});

export default MobileRechargeScreen;