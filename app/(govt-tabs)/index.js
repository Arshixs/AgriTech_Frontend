// File: app/(govt-tabs)/index.js

import React, {useState,useEffect} from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../src/components/common/ScreenWrapper';
import { useAuth } from '../../src/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from "../../secret";
export default function GovtDashboard() {
  const { user } = useAuth();
  const [pendingRequests,setPendingRequests]=useState(0);
  const[myRequests,setMyRequests]=useState(0);
   const authToken = user?.token;
  
    const [loading, setLoading] = useState(true);
  const router = useRouter();

  // const stats = [
  //   { label: 'Pending Gradings', value: '142', icon: 'check-decagram', color: '#F4A261' },
  //   { label: 'MSP Violations', value: '8', icon: 'shield-check', color: '#E76F51' },
  //   { label: 'Total Audits', value: '1,280', icon: 'clipboard-list', color: '#457B9D' },
  // ];

   useEffect(() => {
      if (authToken) {
        fetchData();
      }
    }, [authToken]);
  
    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${authToken}` };
  
       // if (activeTab === "pending") {
          const res = await fetch(`${API_BASE_URL}/api/quality/govt/pending`, {
            headers,
          });
          if (res.ok) {
            const data = await res.json();
            setPendingRequests(data.requests.length || 0);
             //console.log(data.requests);
          }
        // } else {
          const res2 = await fetch(
            `${API_BASE_URL}/api/quality/govt/my-requests`,
            { headers }
          );
          if (res2.ok) {
            const data = await res2.json();
            setMyRequests(data.requests.length || 0);
          }
      //  }
      } catch (error) {
        console.error("Fetch Error:", error);
        //Alert.alert("Error", "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

  const quickActions = [
    {
      title: 'Approve Quality',
      icon: 'check-decagram',
      route: '/(govt-tabs)/quality-grading',
    },
    {
      title: 'Enforce MSP',
      icon: 'shield-check',
      route: '/(govt-tabs)/msp-compliance',
    },
    // {
    //   title: 'View Reports',
    //   icon: 'chart-bar',
    //   route: '/(govt-tabs)/logistics-reports',
    // },
    {
      title: 'Manage Profile',
      icon: 'account-cog',
      route: '/(govt-tabs)/profile',
    },
  ];

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome,</Text>
              <Text style={styles.userName}>{user?.name || "Officer"}</Text>
              <Text style={styles.department}>
                {user?.department || "Govt. of India"}
              </Text>
            </View>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="bank" size={50} color="#606C38" />
            </View>
          </View>

          {/* Stats Cards */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsContainer}>
            {/* {stats.map((stat, index) => (
              <View key={index} style={[styles.statCard, {borderColor: stat.color}]}>
                <MaterialCommunityIcons
                  name={stat.icon}
                  size={32}
                  color={stat.color}
                />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))} */}
            <View style={[styles.statCard, { borderColor: "#F4A261" }]}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={32}
                color={"#F4A261"}
              />
              <Text style={styles.statValue}>{pendingRequests}</Text>
              <Text style={styles.statLabel}>Pending Gradings</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.title}
                style={styles.actionCard}
                onPress={() => router.push(action.route)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={action.icon}
                  size={36}
                  color="#606C38"
                />
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#264653',
    marginTop: 4,
  },
  department: {
    fontSize: 14,
    color: '#606C38',
    marginTop: 4,
    fontWeight: '600',
  },
  logoContainer: {
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#264653',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center'
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
    textAlign: 'center',
    marginTop: 12,
  },
});