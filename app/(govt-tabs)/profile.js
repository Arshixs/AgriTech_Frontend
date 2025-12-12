// // // File: app/(govt-tabs)/profile.js

// // import React from 'react';
// // import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// // import ScreenWrapper from '../../src/components/common/ScreenWrapper';
// // import Button from '../../src/components/common/Button';
// // import { useAuth } from '../../src/context/AuthContext';
// // import { useRouter } from 'expo-router';
// // import { MaterialCommunityIcons } from '@expo/vector-icons';

// // export default function GovtProfileScreen() {
// //   const { user, signOut } = useAuth();
// //   const router = useRouter();

// //   // The signOut function from AuthContext will handle the redirect
// //   const handleSignOut = () => {
// //     signOut();
// //   };

// //   return (
// //     <ScreenWrapper style={styles.wrapper}>
// //       <View style={styles.header}>
// //         <Text style={styles.headerTitle}>Profile & Settings</Text>
// //       </View>

// //       <ScrollView>
// //         <View style={styles.container}>
// //           {/* Profile Info Card */}
// //           <View style={styles.profileCard}>
// //             <View style={styles.profileHeader}>
// //               <View style={styles.avatar}>
// //                 <MaterialCommunityIcons name="bank" size={40} color="#606C38" />
// //               </View>
// //               <View style={styles.profileInfo}>
// //                 <Text style={styles.profileName}>
// //                   {user?.name || 'Govt. Officer'}
// //                 </Text>
// //                 <Text style={styles.profileEmail}>
// //                   {user?.email || 'officer@agri.gov.in'}
// //                 </Text>
// //               </View>
// //             </View>
// //             <View style={styles.infoRow}>
// //               <Text style={styles.infoLabel}>Department:</Text>
// //               <Text style={styles.infoValue}>{user?.department || 'N/A'}</Text>
// //             </View>
// //             <TouchableOpacity style={styles.editButton}>
// //               <Text style={styles.editButtonText}>Edit Profile</Text>
// //               <MaterialCommunityIcons name="pencil" size={14} color="#606C38" />
// //             </TouchableOpacity>
// //           </View>

// //           {/* Settings Section */}
// //           {/* <Text style={styles.sectionTitle}>Account</Text>
// //           <View style={styles.menuContainer}> */}
// //             {/* <TouchableOpacity style={styles.menuItem}>
// //               <MaterialCommunityIcons name="shield-account" size={24} color="#457B9D" />
// //               <Text style={styles.menuItemText}>Change Password</Text>
// //               <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
// //             </TouchableOpacity> */}
// //             {/* <TouchableOpacity style={styles.menuItem}>
// //               <MaterialCommunityIcons name="bell" size={24} color="#F4A261" />
// //               <Text style={styles.menuItemText}>Notification Settings</Text>
// //               <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
// //             </TouchableOpacity> */}
// //             {/* <TouchableOpacity style={styles.menuItem}>
// //               <MaterialCommunityIcons name="help-circle" size={24} color="#2A9D8F" />
// //               <Text style={styles.menuItemText}>Help & Support</Text>
// //               <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
// //             </TouchableOpacity> */}
// //           {/* </View> */}

// //           {/* Sign Out */}
// //           <View style={styles.signOutContainer}>
// //             <Button 
// //               title="Sign Out" 
// //               onPress={handleSignOut}
// //               style={{backgroundColor: '#E76F51'}} // Use a distinct color for sign out
// //             />
// //           </View>

// //         </View>
// //       </ScrollView>
// //     </ScreenWrapper>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   wrapper: {
// //     backgroundColor: '#F8F9FA',
// //   },
// //   header: {
// //     paddingHorizontal: 20,
// //     paddingTop: 40,
// //     paddingBottom: 16,
// //     backgroundColor: '#FFF',
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#E0E0E0',
// //   },
// //   headerTitle: {
// //     fontSize: 28,
// //     fontWeight: 'bold',
// //     color: '#264653',
// //   },
// //   container: {
// //     padding: 20,
// //   },
// //   profileCard: {
// //     backgroundColor: '#FFFFFF',
// //     borderRadius: 16,
// //     padding: 20,
// //     marginBottom: 24,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 3,
// //   },
// //   profileHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 20,
// //   },
// //   avatar: {
// //     width: 60,
// //     height: 60,
// //     borderRadius: 30,
// //     backgroundColor: '#F0F2E6', // Light green-brown
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   profileInfo: {
// //     marginLeft: 16,
// //     flex: 1,
// //   },
// //   profileName: {
// //     fontSize: 22,
// //     fontWeight: 'bold',
// //     color: '#264653',
// //   },
// //   profileEmail: {
// //     fontSize: 16,
// //     color: '#666',
// //     marginTop: 4,
// //   },
// //   infoRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingVertical: 12,
// //     borderTopWidth: 1,
// //     borderTopColor: '#F0F0F0',
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#F0F0F0',
// //   },
// //   infoLabel: {
// //     fontSize: 14,
// //     color: '#666',
// //   },
// //   infoValue: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: '#264653',
// //     marginLeft: 8,
// //   },
// //   editButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     paddingTop: 16,
// //   },
// //   editButtonText: {
// //     fontSize: 15,
// //     fontWeight: '600',
// //     color: '#606C38',
// //     marginRight: 6,
// //   },
// //   sectionTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#264653',
// //     marginBottom: 12,
// //   },
// //   menuContainer: {
// //     backgroundColor: '#FFFFFF',
// //     borderRadius: 12,
// //     overflow: 'hidden',
// //     marginBottom: 24,
// //     elevation: 1,
// //   },
// //   menuItem: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingVertical: 18,
// //     paddingHorizontal: 16,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#F0F0F0',
// //   },
// //   menuItemText: {
// //     flex: 1,
// //     marginLeft: 16,
// //     fontSize: 16,
// //     color: '#264653',
// //   },
// //   signOutContainer: {
// //     marginTop: 16,
// //     marginBottom: 40,
// //   },
// // });
// // File: app/(govt-tabs)/profile.js

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   TextInput,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import ScreenWrapper from '../../src/components/common/ScreenWrapper';
// import Button from '../../src/components/common/Button';
// import { useAuth } from '../../src/context/AuthContext';
// import { useRouter } from 'expo-router';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { API_BASE_URL } from '../../secret';
// const API_BASE = API_BASE_URL; // replace with your API base

// export default function GovtProfileScreen() {
//   const { user, signOut, setUser } = useAuth(); // adapt if your context uses a different API
//   const router = useRouter();

//   // Local copy of user fields (so we can update UI immediately after save)
//   const [localUser, setLocalUser] = useState(user || {});
//   const [editVisible, setEditVisible] = useState(false);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     const response = await axios.post(`${API_URL}/api/govt/auth/profile`, {
        
//       });
//     setLocalUser(user || {});
//   }, [user]);

//   const handleSignOut = () => {
//     signOut();
//   };

//   const openEdit = () => {
//     setEditVisible(true);
//   };

//   const closeEdit = () => {
//     setEditVisible(false);
//   };

//   return (
//     <ScreenWrapper style={styles.wrapper}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Profile & Settings</Text>
//       </View>

//       <ScrollView>
//         <View style={styles.container}>
//           {/* Profile Info Card */}
//           <View style={styles.profileCard}>
//             <View style={styles.profileHeader}>
//               <View style={styles.avatar}>
//                 <MaterialCommunityIcons name="bank" size={40} color="#606C38" />
//               </View>
//               <View style={styles.profileInfo}>
//                 <Text style={styles.profileName}>
//                   {localUser?.name || 'Govt. Officer'}
//                 </Text>
//                 <Text style={styles.profileEmail}>
//                   {localUser?.email || 'officer@agri.gov.in'}
//                 </Text>
//               </View>
//             </View>

//             {/* Details */}
//             <View style={styles.details}>
//               {/* <DetailRow label="Employee ID" value={localUser?.employeeId || 'N/A'} /> */}
//               <DetailRow label="Department" value={localUser?.department || 'N/A'} />
//               <DetailRow label="Designation" value={localUser?.designation || 'N/A'} />
//               <DetailRow label="Phone" value={localUser?.phone || 'N/A'} />
//               <DetailRow label="Home Address" value={localUser?.homeAddress || 'N/A'} />
//               <DetailRow label="Marital Status" value={localUser?.maritalStatus || 'N/A'} />
//               <DetailRow label="Account Number" value={localUser?.accountNumber || 'N/A'} />
//               <DetailRow label="IFSC Code" value={localUser?.IFSCCode || 'N/A'} />
//             </View>

//             <TouchableOpacity style={styles.editButton} onPress={openEdit}>
//               <Text style={styles.editButtonText}>Edit Profile</Text>
//               <MaterialCommunityIcons name="pencil" size={14} color="#606C38" />
//             </TouchableOpacity>
//           </View>

//           {/* Sign Out */}
//           <View style={styles.signOutContainer}>
//             <Button
//               title="Sign Out"
//               onPress={handleSignOut}
//               style={{ backgroundColor: '#E76F51' }}
//             />
//           </View>
//         </View>
//       </ScrollView>

//       {/* Edit Modal */}
//       <EditProfileModal
//         visible={editVisible}
//         onClose={closeEdit}
//         user={localUser}
//         onSaved={(updated) => {
//           // Update local UI immediately
//           setLocalUser((prev) => ({ ...prev, ...updated }));
//           // If auth context provides setUser, update it too
//           if (typeof setUser === 'function') setUser((prev) => ({ ...prev, ...updated }));
//         }}
//       />
//     </ScreenWrapper>
//   );
// }

// function DetailRow({ label, value }) {
//   return (
//     <View style={styles.infoRow}>
//       <Text style={styles.infoLabel}>{label}:</Text>
//       <Text style={styles.infoValue}>{value}</Text>
//     </View>
//   );
// }

// function EditProfileModal({ visible, onClose, user, onSaved }) {
//   const [form, setForm] = useState({});
//   const [loading, setLoading] = useState(false);
//   const { user: authUser } = useAuth(); // used for token

//   useEffect(() => {
//     console.log("user: ",user);
//     setForm({
//       name: user?.name || '',
//       email: user?.email || '',
//       employeeId: user?.id || '',
//       phone: user?.phone || '',
//       homeAddress: user?.homeAddress || '',
//       maritalStatus: user?.maritalStatus || '',
//       accountNumber: user?.accountNumber || '',
//       IFSCCode: user?.IFSCCode || '',
//     });
//   }, [user, visible]);

//   const updateField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

//   const handleSave = async () => {
//     // Basic client-side validation
//     if (!form.name || !form.email) {
//       Alert.alert('Validation', 'Name and email are required.');
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log(authUser);
//       // Adapt header token name to your auth scheme (access/Authorization)
//       const token =
//         authUser?.accessToken || authUser?.token || authUser?.access || authUser?.jwt;

//       const resp = await fetch(`${API_BASE}/api/govt/auth/update-profile`, {
//         method: 'POST', // backend route expected
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify(form),
//       });

//       const data = await resp.json();
//       if (!resp.ok) {
//         const msg = data?.message || 'Failed to update profile';
//         Alert.alert('Update failed', msg);
//         setLoading(false);
//         return;
//       }

//       // success: return updated employee (depends on backend response)
//       const updated = data?.employee || data?.user || form;
//       onSaved(updated);
//       onClose();
//     } catch (err) {
//       console.error('EditProfileModal save error', err);
//       Alert.alert('Error', 'Unable to update profile. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
//       <View style={styles.modalBackdrop}>
//         <View style={styles.modalContent}>
//           <ScrollView keyboardShouldPersistTaps="handled">
//             <Text style={styles.modalTitle}>Edit Profile</Text>

//             <LabelInput label="Full name" value={form.name} onChangeText={(v) => updateField('name', v)} />
//             <LabelInput label="Email" value={form.email} onChangeText={(v) => updateField('email', v)} keyboardType="email-address" />
          
           
          
//             <LabelInput label="Phone" value={form.phone} onChangeText={(v) => updateField('phone', v)} keyboardType="phone-pad" />
//             <LabelInput label="Home Address" value={form.homeAddress} onChangeText={(v) => updateField('homeAddress', v)} multiline />
//             <LabelInput label="Marital Status" value={form.maritalStatus} onChangeText={(v) => updateField('maritalStatus', v)} />
//             <LabelInput label="Account Number" value={form.accountNumber} onChangeText={(v) => updateField('accountNumber', v)} keyboardType="number-pad" />
//             <LabelInput label="IFSC Code" value={form.IFSCCode} onChangeText={(v) => updateField('IFSCCode', v)} />

//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
//               {/* <Button title="Cancel" onPress={onClose} style={{ flex: 1, marginRight: 8 }} /> */}
//               <Button
//                 title={loading ? 'Saving...' : 'Save'}
//                 onPress={handleSave}
//                 disabled={loading}
//                 style={{ flex: 1, marginLeft: 8 }}
//               />
//             </View>

//             {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// function LabelInput({ label, value, onChangeText, keyboardType = 'default', multiline = false }) {
//   return (
//     <View style={{ marginBottom: 12 }}>
//       <Text style={{ fontSize: 13, color: '#333', marginBottom: 6 }}>{label}</Text>
//       <TextInput
//         value={value}
//         onChangeText={onChangeText}
//         style={styles.input}
//         keyboardType={keyboardType}
//         multiline={multiline}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     backgroundColor: '#F8F9FA',
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 40,
//     paddingBottom: 16,
//     backgroundColor: '#FFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E0E0E0',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#264653',
//   },
//   container: {
//     padding: 20,
//   },
//   profileCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   profileHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: '#F0F2E6',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   profileInfo: {
//     marginLeft: 16,
//     flex: 1,
//   },
//   profileName: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#264653',
//   },
//   profileEmail: {
//     fontSize: 16,
//     color: '#666',
//     marginTop: 4,
//   },
//   details: {
//     marginTop: 6,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//   },
//   infoLabel: {
//     fontSize: 14,
//     color: '#666',
//     width: 140,
//   },
//   infoValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#264653',
//     marginLeft: 8,
//     flex: 1,
//   },
//   editButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingTop: 16,
//   },
//   editButtonText: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#606C38',
//     marginRight: 6,
//   },
//   signOutContainer: {
//     marginTop: 16,
//     marginBottom: 40,
//   },

//   // Modal styles
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.35)',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     padding: 16,
//     maxHeight: '90%',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 12,
//     color: '#264653',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#E6E6E6',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     backgroundColor: '#FAFAFA',
//   },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import Button from "../../src/components/common/Button";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../secret";
const API_BASE = API_BASE_URL;

export default function GovtProfileScreen() {
  const { user, signOut, setUser } = useAuth();
  const router = useRouter();

  const [localUser, setLocalUser] = useState(user || {});
  const [editVisible, setEditVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch profile data from backend
  const fetchProfile = async () => {
    try {
      const token =
        user?.accessToken || user?.token || user?.access || user?.jwt;

      if (!token) {
        Alert.alert("Error", "No authentication token found");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/govt/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch profile");
      }

      const profileData = data?.employee || data?.user || {};
      setLocalUser(profileData);

      // Update auth context with latest profile data
      if (typeof setUser === "function") {
        setUser((prev) => ({ ...prev, ...profileData }));
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      Alert.alert("Error", "Unable to load profile. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSignOut = () => {
    signOut();
  };

  const openEdit = () => {
    setEditVisible(true);
  };

  const closeEdit = () => {
    setEditVisible(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  if (loading) {
    return (
      <ScreenWrapper style={styles.wrapper}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#606C38" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color={refreshing ? "#ccc" : "#606C38"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.container}>
          {/* Profile Info Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <MaterialCommunityIcons name="bank" size={40} color="#606C38" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {localUser?.name || "Govt. Officer"}
                </Text>
                <Text style={styles.profileEmail}>
                  {localUser?.email || localUser?.phone || "N/A"}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.details}>
              {localUser?.employeeId && (
                <DetailRow label="Employee ID" value={localUser.employeeId} />
              )}
              <DetailRow
                label="Department"
                value={localUser?.department || "N/A"}
              />
              <DetailRow
                label="Designation"
                value={localUser?.designation || "MSP Compliance"}
              />
              <DetailRow label="Phone" value={localUser?.phone || "N/A"} />
              {localUser?.homeAddress && (
                <DetailRow label="Home Address" value={localUser.homeAddress} />
              )}
              {localUser?.maritalStatus && (
                <DetailRow
                  label="Marital Status"
                  value={localUser.maritalStatus}
                />
              )}
              {localUser?.accountNumber && (
                <DetailRow
                  label="Account Number"
                  value={localUser.accountNumber}
                />
              )}
              {localUser?.IFSCCode && (
                <DetailRow label="IFSC Code" value={localUser.IFSCCode} />
              )}
            </View>

            <TouchableOpacity style={styles.editButton} onPress={openEdit}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
              <MaterialCommunityIcons name="pencil" size={14} color="#606C38" />
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <View style={styles.signOutContainer}>
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              style={{ backgroundColor: "#E76F51" }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <EditProfileModal
        visible={editVisible}
        onClose={closeEdit}
        user={localUser}
        onSaved={(updated) => {
          setLocalUser((prev) => ({ ...prev, ...updated }));
          if (typeof setUser === "function") {
            setUser((prev) => ({ ...prev, ...updated }));
          }
          // Optionally refetch to ensure sync
          fetchProfile();
        }}
      />
    </ScreenWrapper>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function EditProfileModal({ visible, onClose, user, onSaved }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const { user: authUser } = useAuth();

  useEffect(() => {
    // Initialize only editable fields
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      homeAddress: user?.homeAddress || "",
      maritalStatus: user?.maritalStatus || "",
      accountNumber: user?.accountNumber || "",
      IFSCCode: user?.IFSCCode || "",
      employeeId: user?.employeeId || "",
    });
  }, [user, visible]);

  const updateField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    // Basic client-side validation
    if (!form.name) {
      Alert.alert("Validation", "Name is required.");
      return;
    }

    // Email validation if provided
    if (form.email && form.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        Alert.alert("Validation", "Please enter a valid email address.");
        return;
      }
    }

    setLoading(true);
    try {
      const token =
        authUser?.accessToken ||
        authUser?.token ||
        authUser?.access ||
        authUser?.jwt;

      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        setLoading(false);
        return;
      }

      // Only send fields that have values (filter out empty strings)
      const payload = {};
      Object.keys(form).forEach((key) => {
        if (form[key] && form[key].toString().trim() !== "") {
          payload[key] = form[key].toString().trim();
        }
      });

      console.log("Sending payload:", payload);

      const resp = await fetch(`${API_BASE}/api/govt/auth/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok) {
        const msg = data?.message || "Failed to update profile";
        Alert.alert("Update Failed", msg);
        setLoading(false);
        return;
      }

      // Success
      const updated = data?.employee || data?.user || payload;
      Alert.alert("Success", "Profile updated successfully!");
      onSaved(updated);
      onClose();
    } catch (err) {
      console.error("EditProfileModal save error", err);
      Alert.alert(
        "Error",
        "Unable to update profile. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Read-only info banner */}
            <View style={styles.infoBanner}>
              <MaterialCommunityIcons
                name="information"
                size={16}
                color="#606C38"
              />
              <Text style={styles.infoBannerText}>
                Department and Designation are managed by administration
              </Text>
            </View>

            {/* Editable fields */}
            <LabelInput
              label="Full Name *"
              value={form.name}
              onChangeText={(v) => updateField("name", v)}
              placeholder="Enter your full name"
            />
            <LabelInput
              label="Email"
              value={form.email}
              onChangeText={(v) => updateField("email", v)}
              keyboardType="email-address"
              placeholder="your.email@example.com"
              autoCapitalize="none"
            />
            {/* <LabelInput
              label="Employee ID"
              value={form.employeeId}
              onChangeText={(v) => updateField("employeeId", v)}
              placeholder="Enter employee ID"
            /> */}
            <LabelInput
              label="Phone"
              value={form.phone}
              onChangeText={(v) => updateField("phone", v)}
              keyboardType="phone-pad"
              placeholder="Enter phone number"
              editable={false}
            />
            <LabelInput
              label="Home Address"
              value={form.homeAddress}
              onChangeText={(v) => updateField("homeAddress", v)}
              multiline
              placeholder="Enter your home address"
            />
            <LabelInput
              label="Marital Status"
              value={form.maritalStatus}
              onChangeText={(v) => updateField("maritalStatus", v)}
              placeholder="e.g., Single, Married"
            />
            <LabelInput
              label="Account Number"
              value={form.accountNumber}
              onChangeText={(v) => updateField("accountNumber", v)}
              keyboardType="number-pad"
              placeholder="Enter bank account number"
            />
            <LabelInput
              label="IFSC Code"
              value={form.IFSCCode}
              onChangeText={(v) => updateField("IFSCCode", v)}
              placeholder="e.g., SBIN0001234"
              autoCapitalize="characters"
            />

            <View style={styles.buttonContainer}>
              {/* <Button
                title="Cancel"
                onPress={onClose}
                style={styles.cancelButton}
              /> */}
              <Button
                title={loading ? "Saving..." : "Save Changes"}
                onPress={handleSave}
                disabled={loading}
                style={styles.saveButton}
              />
            </View>

            {loading && (
              <ActivityIndicator style={{ marginTop: 12 }} color="#606C38" />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function LabelInput({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  multiline = false,
  placeholder = "",
  autoCapitalize = "sentences",
  editable = true,
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          !editable && styles.inputDisabled,
        ]}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor="#999"
        autoCapitalize={autoCapitalize}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  container: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0F2E6",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#264653",
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  details: {
    marginTop: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    width: 140,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#264653",
    marginLeft: 8,
    flex: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#606C38",
    marginRight: 6,
  },
  signOutContainer: {
    marginTop: 16,
    marginBottom: 40,
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#264653",
  },
  closeButton: {
    padding: 4,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2E6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoBannerText: {
    fontSize: 12,
    color: "#606C38",
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FAFAFA",
    fontSize: 15,
    color: "#264653",
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputDisabled: {
    backgroundColor: "#F0F0F0",
    color: "#999",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
  },
  saveButton: {
    flex: 1,
  },
});