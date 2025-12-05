import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
// Assuming styles and API_BASE_URL paths are correct
import { styles } from '../../src/styles/auth/RegistrationScreenStyles'; 
import { useAuth } from '../../src/context/AuthContext';
import {API_BASE_URL} from "../../secret"

export default function RegistrationScreen() {
    const { signInFarmer, user } = useAuth();
    const router = useRouter();
    const authToken = user?.token;
    
    // State variables aligned with backend requirements
    const [name, setName] = useState('');
    const [address, setAddress] = useState(''); // Mapped from previous 'location'
    const [adharNumber, setAdharNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCompleteProfile = async () => {

        // Basic validation matching backend needs
        if (!name || !address || !adharNumber) {
            // Use a custom modal/toast instead of alert in production RN apps
            console.error('Please fill in all details.'); 
            return;
        }

        setLoading(true);

        try {
          // console.log(authToken);
            const res = await fetch(`${API_BASE_URL}/api/farmer-auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Authorization header is REQUIRED as this is a protected route
                    "Authorization": `Bearer ${authToken}`, 
                },
                body: JSON.stringify({
                    name: name,
                    address: address, 
                    adharNumber: adharNumber,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Server error completing profile.');
            }

            const data = await res.json();
            
            // Call signIn to save the session with the new, complete user data
            // The data.farmer object returned by the backend is the new user data
            signInFarmer(data.farmer); 
            
            // Redirect to the main application dashboard
            router.replace('/home'); 

        } catch (err) {
            console.error('Registration API Error:', err.message);
            // In a real app, show a descriptive error to the user
            setLoading(false); 
        }
        // Note: setLoading(false) is not needed on success because router.replace navigates away
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Text style={styles.title}>Create Your Profile</Text>
                
                <Input 
                    label="Full Name" 
                    value={name} 
                    onChangeText={setName} 
                    placeholder="Your official name"
                />
                
                <Input 
                    label="Adhar Number" 
                    value={adharNumber} 
                    onChangeText={setAdharNumber} 
                    keyboardType="number-pad"
                    placeholder="12-digit Adhar number"
                />

                <Input 
                    label="Farm Address/Location" 
                    value={address} 
                    onChangeText={setAddress} 
                    placeholder="City, District, State"
                />
                
                <Button 
                    title="Complete Profile" 
                    onPress={handleCompleteProfile} 
                    loading={loading} 
                />
            </View>
        </ScreenWrapper>
    );
}