import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { styles } from '../../src/styles/auth/OTPScreenStyles';
import { useAuth } from "../../src/context/AuthContext";
import { API_BASE_URL } from "../../secret";
import { useTranslation } from 'react-i18next'; //

export default function OTPScreen() {
  const router = useRouter();
  const { t } = useTranslation(); //
  const { mobileNumber } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signInFarmer } = useAuth();

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return alert(t('farmer.auth.otp.err_invalid_len'));

    setLoading(true);

    try {
        const res = await fetch(`${API_BASE_URL}/api/farmer-auth/verify-otp`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone: `+91${mobileNumber}`,
                otp: otp,
            }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || t('farmer.auth.otp.err_invalid_otp'));
        }

        const data = await res.json();
        const { token, farmer } = data;
        let farmerData = { ...farmer, token };

        await signInFarmer(farmerData);

        if (data.isProfileComplete) {
            router.replace("/(tabs)"); 
        } else {
            router.replace("/(auth)/register"); 
        }

    } catch (err) {
        alert(err.message || t('farmer.auth.otp.err_verify_failed'));
    } finally {
        setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>{t('farmer.auth.otp.title')}</Text>
        <Text style={styles.subtitle}>
          {t('farmer.auth.otp.subtitle', { mobile: mobileNumber })}
        </Text>
        <Input
          label={t('farmer.auth.otp.label')}
          value={otp}
          onChangeText={setOtp}
          placeholder={t('farmer.auth.otp.placeholder')}
          keyboardType="number-pad"
        />
        <Button 
          title={t('farmer.auth.otp.button')} 
          onPress={handleVerifyOTP} 
          loading={loading} 
        />
      </View>
    </ScreenWrapper>
  );
}