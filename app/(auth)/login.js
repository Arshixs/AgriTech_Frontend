import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { styles } from '../../src/styles/auth/LoginScreenStyles';
import { API_BASE_URL } from "../../secret";
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

   const handleSendOTP = async () => {
    if (mobileNumber.length !== 10) return alert(t('farmer.auth.login.err_invalid_phone'));
    setLoading(true);
    try {
    const res = await fetch(`${API_BASE_URL}/api/farmer-auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: `+91${mobileNumber}`, 
        role: "farmer"
      }),
    });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || t('farmer.auth.login.err_server'));
      }
      const data = await res.json();
      // navigate to OTP screen (adjust if your backend returns different payload)
      router.push({ pathname: '/(auth)/otp', params: { mobileNumber } });
    } catch (err) {
      alert(err.message || t('farmer.auth.login.err_send_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>{t('farmer.auth.login.title')}</Text>
        <Input
          label={t('farmer.auth.login.label')}
          value={mobileNumber}
          onChangeText={setMobileNumber}
          placeholder={t('farmer.auth.login.placeholder')}
          keyboardType="phone-pad"
        />
        <Button title={t('farmer.auth.login.button')} onPress={handleSendOTP} loading={loading} />
      </View>
    </ScreenWrapper>
  );
}