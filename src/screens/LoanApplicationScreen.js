import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Slider,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import GradientCard from '../components/GradientCard';
import { apiService } from '../services/apiService';

const LoanApplicationScreen = ({ navigation }) => {
  const [selectedLoanType, setSelectedLoanType] = useState('personal');
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanTenure, setLoanTenure] = useState(36);
  const [personalDetails, setPersonalDetails] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    mobile: '',
    address: '',
  });
  const [employmentDetails, setEmploymentDetails] = useState({
    employmentType: '',
    companyName: '',
    monthlyIncome: '',
    workExperience: '',
  });
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });
  const [eligibilityData, setEligibilityData] = useState({
    monthlyIncome: '',
    existingEMIs: '',
    creditScore: '',
  });

  const loanTypes = [
    { id: 'personal', name: 'Personal Loan', interest: 10.5, icon: 'person', color: '#6366f1' },
    { id: 'home', name: 'Home Loan', interest: 8.5, icon: 'home', color: '#3b82f6' },
    { id: 'vehicle', name: 'Vehicle Loan', interest: 9.5, icon: 'car', color: '#10b981' },
    { id: 'education', name: 'Education Loan', interest: 7.5, icon: 'school', color: '#f59e0b' },
  ];

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatTenure = (months) => {
    if (months < 12) {
      return `${months} months`;
    } else if (months % 12 === 0) {
      return `${months / 12} years`;
    } else {
      return `${Math.floor(months / 12)} years ${months % 12} months`;
    }
  };

  const calculateEMI = () => {
    const selectedType = loanTypes.find(type => type.id === selectedLoanType);
    const monthlyRate = selectedType.interest / 12 / 100;
    const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTenure) / (Math.pow(1 + monthlyRate, loanTenure) - 1);
    return Math.round(emi);
  };

  const calculateTotalAmount = () => {
    return calculateEMI() * loanTenure;
  };

  const calculateTotalInterest = () => {
    return calculateTotalAmount() - loanAmount;
  };

  const checkEligibility = () => {
    const income = parseFloat(eligibilityData.monthlyIncome.replace(/,/g, ''));
    const emis = parseFloat(eligibilityData.existingEMIs.replace(/,/g, '') || 0);
    const score = eligibilityData.creditScore;

    if (!income || !score) {
      Alert.alert('Error', 'Please fill all eligibility fields');
      return;
    }

    const availableIncome = income - emis;
    let maxLoan = 0;
    let isEligible = false;

    if (score === 'excellent') {
      maxLoan = availableIncome * 60;
      isEligible = availableIncome > 30000;
    } else if (score === 'good') {
      maxLoan = availableIncome * 48;
      isEligible = availableIncome > 40000;
    } else if (score === 'fair') {
      maxLoan = availableIncome * 36;
      isEligible = availableIncome > 50000;
    } else {
      maxLoan = availableIncome * 24;
      isEligible = availableIncome > 60000;
    }

    maxLoan = Math.floor(maxLoan / 10000) * 10000;

    Alert.alert(
      isEligible ? 'Eligible!' : 'Not Eligible',
      isEligible 
        ? `You are eligible for a loan up to ${formatCurrency(maxLoan)}`
        : 'Based on your details, you may not qualify for the requested loan amount.',
      [{ text: 'OK' }]
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!personalDetails.firstName || !personalDetails.lastName || !personalDetails.email || !personalDetails.mobile) {
      Alert.alert('Error', 'Please fill all required personal details');
      return;
    }

    if (!employmentDetails.employmentType || !employmentDetails.companyName || !employmentDetails.monthlyIncome) {
      Alert.alert('Error', 'Please fill all required employment details');
      return;
    }

    if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
      Alert.alert('Error', 'Please fill all required bank details');
      return;
    }

    try {
      const applicationData = {
        loanType: selectedLoanType,
        loanAmount,
        loanTenure,
        personalDetails,
        employmentDetails,
        bankDetails,
        emi: calculateEMI(),
        totalAmount: calculateTotalAmount(),
        totalInterest: calculateTotalInterest(),
      };

      await apiService.submitLoanApplication(applicationData);

      Alert.alert(
        'Application Submitted!',
        'Your loan application has been successfully submitted. We\'ll review your application and get back to you soon.\n\nApplication Reference ID: LOAN-29062025-7854',
        [
          { text: 'Track Application', onPress: () => Alert.alert('Tracking', 'Tracking feature coming soon!') },
          { text: 'Back to Home', onPress: () => navigation.navigate('Main') },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    }
  };

  const LoanTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Loan Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.loanTypesScroll}>
        {loanTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.loanTypeCard,
              selectedLoanType === type.id && styles.loanTypeCardSelected
            ]}
            onPress={() => setSelectedLoanType(type.id)}
          >
            <View style={[styles.loanTypeIcon, { backgroundColor: type.color + '33' }]}>
              <Ionicons name={type.icon} size={24} color={type.color} />
            </View>
            <Text style={styles.loanTypeName}>{type.name}</Text>
            <Text style={styles.loanTypeInterest}>{type.interest}% interest</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const LoanCalculator = () => {
    const selectedType = loanTypes.find(type => type.id === selectedLoanType);
    
    return (
      <GradientCard>
        <Text style={styles.sectionTitle}>Loan Calculator</Text>
        
        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Loan Amount</Text>
            <Text style={styles.sliderValue}>{formatCurrency(loanAmount)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={10000}
            maximumValue={5000000}
            step={10000}
            value={loanAmount}
            onValueChange={setLoanAmount}
            minimumTrackTintColor="#5046e5"
            maximumTrackTintColor="#ffffff33"
            thumbStyle={styles.sliderThumb}
          />
          <View style={styles.sliderRange}>
            <Text style={styles.sliderRangeText}>₹10,000</Text>
            <Text style={styles.sliderRangeText}>₹50,00,000</Text>
          </View>
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Loan Tenure</Text>
            <Text style={styles.sliderValue}>{formatTenure(loanTenure)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={6}
            maximumValue={60}
            step={6}
            value={loanTenure}
            onValueChange={setLoanTenure}
            minimumTrackTintColor="#5046e5"
            maximumTrackTintColor="#ffffff33"
            thumbStyle={styles.sliderThumb}
          />
          <View style={styles.sliderRange}>
            <Text style={styles.sliderRangeText}>6 months</Text>
            <Text style={styles.sliderRangeText}>5 years</Text>
          </View>
        </View>

        <View style={styles.calculatorResults}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Monthly EMI</Text>
            <Text style={styles.resultValue}>{formatCurrency(calculateEMI())}</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Interest Rate</Text>
            <Text style={styles.resultValue}>{selectedType.interest}%</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Total Amount</Text>
            <Text style={styles.resultValue}>{formatCurrency(calculateTotalAmount())}</Text>
          </View>
        </View>
      </GradientCard>
    );
  };

  const EligibilityChecker = () => (
    <GradientCard>
      <Text style={styles.sectionTitle}>Check Eligibility</Text>
      
      <CustomInput
        label="Monthly Income"
        value={eligibilityData.monthlyIncome}
        onChangeText={(value) => setEligibilityData(prev => ({ ...prev, monthlyIncome: value }))}
        placeholder="Enter your monthly income"
        icon="cash"
        keyboardType="numeric"
      />

      <CustomInput
        label="Existing EMIs (if any)"
        value={eligibilityData.existingEMIs}
        onChangeText={(value) => setEligibilityData(prev => ({ ...prev, existingEMIs: value }))}
        placeholder="Enter your existing EMIs"
        icon="cash"
        keyboardType="numeric"
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Credit Score</Text>
        <View style={styles.creditScoreContainer}>
          {[
            { id: 'excellent', name: 'Excellent (750+)' },
            { id: 'good', name: 'Good (700-749)' },
            { id: 'fair', name: 'Fair (650-699)' },
            { id: 'poor', name: 'Poor (below 650)' },
          ].map((score) => (
            <TouchableOpacity
              key={score.id}
              style={[
                styles.creditScoreButton,
                eligibilityData.creditScore === score.id && styles.creditScoreButtonActive
              ]}
              onPress={() => setEligibilityData(prev => ({ ...prev, creditScore: score.id }))}
            >
              <Text style={[
                styles.creditScoreText,
                eligibilityData.creditScore === score.id && styles.creditScoreTextActive
              ]}>
                {score.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <CustomButton
        title="Check Eligibility"
        onPress={checkEligibility}
        style={styles.eligibilityButton}
      />
    </GradientCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LoanTypeSelector />
        <LoanCalculator />
        <EligibilityChecker />

        {/* Personal Details */}
        <GradientCard>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.row}>
            <CustomInput
              label="First Name"
              value={personalDetails.firstName}
              onChangeText={(value) => setPersonalDetails(prev => ({ ...prev, firstName: value }))}
              placeholder="Enter first name"
              style={styles.halfInput}
              required
            />
            <CustomInput
              label="Last Name"
              value={personalDetails.lastName}
              onChangeText={(value) => setPersonalDetails(prev => ({ ...prev, lastName: value }))}
              placeholder="Enter last name"
              style={styles.halfInput}
              required
            />
          </View>
          <CustomInput
            label="Date of Birth"
            value={personalDetails.dateOfBirth}
            onChangeText={(value) => setPersonalDetails(prev => ({ ...prev, dateOfBirth: value }))}
            placeholder="Select date of birth"
            icon="calendar"
          />
          <CustomInput
            label="Email Address"
            value={personalDetails.email}
            onChangeText={(value) => setPersonalDetails(prev => ({ ...prev, email: value }))}
            placeholder="Enter your email"
            icon="mail"
            keyboardType="email-address"
            required
          />
          <CustomInput
            label="Mobile Number"
            value={personalDetails.mobile}
            onChangeText={(value) => setPersonalDetails(prev => ({ ...prev, mobile: value }))}
            placeholder="Enter your mobile number"
            icon="call"
            keyboardType="phone-pad"
            required
          />
          <CustomInput
            label="Residential Address"
            value={personalDetails.address}
            onChangeText={(value) => setPersonalDetails(prev => ({ ...prev, address: value }))}
            placeholder="Enter your complete address"
            multiline
            numberOfLines={3}
          />
        </GradientCard>

        {/* Employment Details */}
        <GradientCard>
          <Text style={styles.sectionTitle}>Employment Details</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Employment Type</Text>
            <View style={styles.employmentTypeContainer}>
              {[
                { id: 'salaried', name: 'Salaried' },
                { id: 'self-employed', name: 'Self-Employed' },
                { id: 'business-owner', name: 'Business Owner' },
                { id: 'freelancer', name: 'Freelancer' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.employmentTypeButton,
                    employmentDetails.employmentType === type.id && styles.employmentTypeButtonActive
                  ]}
                  onPress={() => setEmploymentDetails(prev => ({ ...prev, employmentType: type.id }))}
                >
                  <Text style={[
                    styles.employmentTypeText,
                    employmentDetails.employmentType === type.id && styles.employmentTypeTextActive
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <CustomInput
            label="Company/Business Name"
            value={employmentDetails.companyName}
            onChangeText={(value) => setEmploymentDetails(prev => ({ ...prev, companyName: value }))}
            placeholder="Enter company name"
            required
          />
          <View style={styles.row}>
            <CustomInput
              label="Monthly Income"
              value={employmentDetails.monthlyIncome}
              onChangeText={(value) => setEmploymentDetails(prev => ({ ...prev, monthlyIncome: value }))}
              placeholder="Enter amount"
              icon="cash"
              keyboardType="numeric"
              style={styles.halfInput}
              required
            />
            <CustomInput
              label="Work Experience"
              value={employmentDetails.workExperience}
              onChangeText={(value) => setEmploymentDetails(prev => ({ ...prev, workExperience: value }))}
              placeholder="Years"
              keyboardType="numeric"
              style={styles.halfInput}
            />
          </View>
        </GradientCard>

        {/* Bank Details */}
        <GradientCard>
          <Text style={styles.sectionTitle}>Bank Details</Text>
          <CustomInput
            label="Bank Name"
            value={bankDetails.bankName}
            onChangeText={(value) => setBankDetails(prev => ({ ...prev, bankName: value }))}
            placeholder="Enter bank name"
            required
          />
          <CustomInput
            label="Account Number"
            value={bankDetails.accountNumber}
            onChangeText={(value) => setBankDetails(prev => ({ ...prev, accountNumber: value }))}
            placeholder="Enter account number"
            keyboardType="numeric"
            required
          />
          <CustomInput
            label="IFSC Code"
            value={bankDetails.ifscCode}
            onChangeText={(value) => setBankDetails(prev => ({ ...prev, ifscCode: value }))}
            placeholder="Enter IFSC code"
            required
          />
        </GradientCard>

        {/* Loan Summary */}
        <GradientCard style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Loan Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Loan Type</Text>
            <Text style={styles.summaryValue}>{loanTypes.find(type => type.id === selectedLoanType)?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Loan Amount</Text>
            <Text style={styles.summaryValue}>{formatCurrency(loanAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Loan Tenure</Text>
            <Text style={styles.summaryValue}>{formatTenure(loanTenure)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Interest Rate</Text>
            <Text style={styles.summaryValue}>{loanTypes.find(type => type.id === selectedLoanType)?.interest}%</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Processing Fee</Text>
            <Text style={styles.summaryValue}>₹5,000</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monthly EMI</Text>
            <Text style={styles.summaryValue}>{formatCurrency(calculateEMI())}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Interest</Text>
            <Text style={styles.summaryValue}>{formatCurrency(calculateTotalInterest())}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Repayment</Text>
            <Text style={styles.summaryValue}>{formatCurrency(calculateTotalAmount())}</Text>
          </View>
        </GradientCard>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Submit Application"
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
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  loanTypesScroll: {
    marginBottom: 8,
  },
  loanTypeCard: {
    width: 140,
    backgroundColor: '#2a2a5a',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
  },
  loanTypeCardSelected: {
    backgroundColor: '#5046e533',
    borderWidth: 1,
    borderColor: '#5046e5',
  },
  loanTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loanTypeName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  loanTypeInterest: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    color: '#d1d5db',
    fontSize: 14,
  },
  sliderValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#5046e5',
    width: 20,
    height: 20,
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderRangeText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  calculatorResults: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  resultItem: {
    flex: 1,
    backgroundColor: '#2a2a5a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  resultLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  resultValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginVertical: 8,
  },
  label: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  creditScoreContainer: {
    marginTop: 8,
  },
  creditScoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a5a',
    borderRadius: 8,
    marginBottom: 8,
  },
  creditScoreButtonActive: {
    backgroundColor: '#5046e5',
  },
  creditScoreText: {
    color: '#ffffff',
    fontSize: 14,
  },
  creditScoreTextActive: {
    color: '#ffffff',
  },
  eligibilityButton: {
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  employmentTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  employmentTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a5a',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  employmentTypeButtonActive: {
    backgroundColor: '#5046e5',
  },
  employmentTypeText: {
    color: '#ffffff',
    fontSize: 14,
  },
  employmentTypeTextActive: {
    color: '#ffffff',
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#5046e533',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#d1d5db',
    fontSize: 14,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#ffffff33',
    marginVertical: 8,
  },
  buttonContainer: {
    marginVertical: 24,
  },
});

export default LoanApplicationScreen;