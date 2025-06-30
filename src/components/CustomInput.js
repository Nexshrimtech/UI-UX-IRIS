import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomInput = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  icon, 
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  style,
  required = false
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
          }
        </Text>
      )}
      <View style={styles.inputContainer}>
        {icon && (
          <Ionicons name={icon} size={20} color="#9ca3af" style={styles.icon} />
        )}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  required: {
    color: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a5a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
});

export default CustomInput;