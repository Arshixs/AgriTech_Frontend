import React, { useState } from 'react';
import { View, Text } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { styles } from '../../src/styles/auth/RegistrationScreenStyles';
import { useAuth } from '../../src/context/AuthContext';

export default function RegistrationScreen() {
  const { signIn } = useAuth(); // Get the signIn function from context
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCompleteProfile = () => {
    if (!name || !location) return alert('Please fill in all details.');
    setLoading(true);
    // --- Mock API call to create user ---
    setTimeout(() => {
      // Mock user data. In real life, this comes from your API.
      const userData = { id: 1, name: name, location: location };
      
      // Call signIn to save the session and redirect to the app
      signIn(userData);
      
      // setLoading(false) is not needed since we are navigating away
    }, 1000);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Create Your Profile</Text>
        <Input label="Full Name" value={name} onChangeText={setName} />
        <Input label="Farm Location" value={location} onChangeText={setLocation} />
        <Button title="Complete Profile" onPress={handleCompleteProfile} loading={loading} />
      </View>
    </ScreenWrapper>
  );
}