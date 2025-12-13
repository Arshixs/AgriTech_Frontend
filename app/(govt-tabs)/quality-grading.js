// // File: app/(govt-tabs)/quality-grading.js

// import React, { useState, useEffect } from "react";
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
// } from "react-native";
// import ScreenWrapper from "../../src/components/common/ScreenWrapper";
// import Button from "../../src/components/common/Button";
// import { useAuth } from "../../src/context/AuthContext";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { API_BASE_URL } from "../../secret";

// export default function QualityGradingScreen() {
//   const { user } = useAuth();
//   const authToken = user?.token;

//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("pending"); // pending, my-requests
//   const [pendingRequests, setPendingRequests] = useState([]);
//   const [myRequests, setMyRequests] = useState([]);
//   const [searchLotId, setSearchLotId] = useState("");
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [showGradingModal, setShowGradingModal] = useState(false);
//   const [showSearchModal, setShowSearchModal] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   // Grading form state
//   const [gradingForm, setGradingForm] = useState({
//     grade: "",
//     moisture: "",
//     foreignMatter: "",
//     damagedGrains: "",
//     discoloredGrains: "",
//     weevilDamage: "",
//     otherDefects: "",
//     gradingNotes: "",
//     rejectionReason: "",
//   });

//   useEffect(() => {
//     if (authToken) {
//       fetchData();
//     }
//   }, [authToken, activeTab]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const headers = { Authorization: `Bearer ${authToken}` };

//       if (activeTab === "pending") {
//         const res = await fetch(`${API_BASE_URL}/api/quality/govt/pending`, {
//           headers,
//         });
//         if (res.ok) {
//           const data = await res.json();
//           setPendingRequests(data.requests || []);
//         }
//       } else {
//         const res = await fetch(
//           `${API_BASE_URL}/api/quality/govt/my-requests`,
//           {
//             headers,
//           }
//         );
//         if (res.ok) {
//           const data = await res.json();
//           setMyRequests(data.requests || []);
//         }
//       }
//     } catch (error) {
//       console.error("Fetch Error:", error);
//       Alert.alert("Error", "Failed to load data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearchLot = async () => {
//     if (!searchLotId.trim()) {
//       Alert.alert("Validation", "Please enter a Lot ID");
//       return;
//     }

//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/api/quality/govt/search/${searchLotId.trim()}`,
//         {
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );

//       if (res.ok) {
//         const data = await res.json();
//         setSelectedRequest(data.request);
//         setShowSearchModal(false);
//         setShowGradingModal(true);
//       } else {
//         const error = await res.json();
//         Alert.alert("Not Found", error.message || "Request not found");
//       }
//     } catch (error) {
//       console.error("Search Error:", error);
//       Alert.alert("Error", "Failed to search");
//     }
//   };

//   const handleAssignToMe = async (requestId) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/quality/govt/assign`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${authToken}`,
//         },
//         body: JSON.stringify({ requestId }),
//       });

//       if (res.ok) {
//         Alert.alert("Success", "Inspection assigned to you");
//         fetchData();
//       } else {
//         const error = await res.json();
//         Alert.alert("Error", error.message || "Failed to assign");
//       }
//     } catch (error) {
//       console.error("Assign Error:", error);
//       Alert.alert("Error", "Network error");
//     }
//   };

//   const handleOpenGrading = (request) => {
//     setSelectedRequest(request);
//     setGradingForm({
//       grade: "",
//       moisture: "",
//       foreignMatter: "",
//       damagedGrains: "",
//       discoloredGrains: "",
//       weevilDamage: "",
//       otherDefects: "",
//       gradingNotes: "",
//       rejectionReason: "",
//     });
//     setShowGradingModal(true);
//   };

//   const handleSubmitGrading = async () => {
//     if (!gradingForm.grade) {
//       Alert.alert("Validation", "Please select a grade");
//       return;
//     }

//     if (gradingForm.grade === "Rejected" && !gradingForm.rejectionReason) {
//       Alert.alert("Validation", "Please provide a rejection reason");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const payload = {
//         grade: gradingForm.grade,
//         qualityParams: {
//           moisture: parseFloat(gradingForm.moisture) || null,
//           foreignMatter: parseFloat(gradingForm.foreignMatter) || null,
//           damagedGrains: parseFloat(gradingForm.damagedGrains) || null,
//           discoloredGrains: parseFloat(gradingForm.discoloredGrains) || null,
//           weevilDamage: parseFloat(gradingForm.weevilDamage) || null,
//           otherDefects: gradingForm.otherDefects || null,
//         },
//         gradingNotes: gradingForm.gradingNotes,
//         rejectionReason: gradingForm.rejectionReason,
//         inspectionDate: new Date().toISOString(),
//       };

//       const res = await fetch(
//         `${API_BASE_URL}/api/quality/govt/grade/${selectedRequest._id}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${authToken}`,
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (res.ok) {
//         Alert.alert("Success", "Grading submitted successfully");
//         setShowGradingModal(false);
//         setSelectedRequest(null);
//         fetchData();
//       } else {
//         const error = await res.json();
//         Alert.alert("Error", error.message || "Failed to submit grading");
//       }
//     } catch (error) {
//       console.error("Submit Grading Error:", error);
//       Alert.alert("Error", "Network error");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "approved":
//         return "#2A9D8F";
//       case "rejected":
//         return "#E76F51";
//       case "in-progress":
//         return "#F4A261";
//       default:
//         return "#888";
//     }
//   };

//   const renderRequestCard = (request, showActions = true) => (
//     <View key={request._id} style={styles.requestCard}>
//       <View style={styles.cardHeader}>
//         <View style={styles.cardTitle}>
//           <MaterialCommunityIcons name="sprout" size={24} color="#606C38" />
//           <View style={styles.titleText}>
//             <Text style={styles.cropName}>{request.cropName}</Text>
//             <Text style={styles.farmerName}>
//               Farmer: {request.farmerId?.name || "Unknown"}
//             </Text>
//           </View>
//         </View>
//         <View
//           style={[
//             styles.statusBadge,
//             { backgroundColor: getStatusColor(request.status) },
//           ]}
//         >
//           <Text style={styles.statusText}>
//             {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.cardDetails}>
//         <View style={styles.detailRow}>
//           <MaterialCommunityIcons name="weight" size={16} color="#666" />
//           <Text style={styles.detailText}>
//             {request.quantity} {request.unit}
//           </Text>
//         </View>
//         <View style={styles.detailRow}>
//           <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
//           <Text style={styles.detailText}>
//             {request.fieldId?.name || "Unknown Field"}
//           </Text>
//         </View>
//         <View style={styles.detailRow}>
//           <MaterialCommunityIcons name="calendar" size={16} color="#666" />
//           <Text style={styles.detailText}>
//             {new Date(request.harvestDate).toLocaleDateString()}
//           </Text>
//         </View>
//       </View>

//       {request.grade && (
//         <View style={styles.gradeInfo}>
//           <Text style={styles.gradeLabel}>Grade: {request.grade}</Text>
//           {request.certificateNumber && (
//             <Text style={styles.certNumber}>
//               Cert: {request.certificateNumber}
//             </Text>
//           )}
//         </View>
//       )}

//       <View style={styles.cardFooter}>
//         <Text style={styles.lotId}>Lot ID: {request._id.slice(-8)}</Text>
//         {showActions && request.status === "pending" && (
//           <TouchableOpacity
//             style={styles.assignButton}
//             onPress={() => handleAssignToMe(request._id)}
//           >
//             <Text style={styles.assignButtonText}>Assign to Me</Text>
//           </TouchableOpacity>
//         )}
//         {showActions && request.status === "in-progress" && !request.grade && (
//           <TouchableOpacity
//             style={styles.gradeButton}
//             onPress={() => handleOpenGrading(request)}
//           >
//             <Text style={styles.gradeButtonText}>Grade Now</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <ScreenWrapper>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#606C38" />
//           <Text style={styles.loadingText}>Loading...</Text>
//         </View>
//       </ScreenWrapper>
//     );
//   }

//   const currentRequests =
//     activeTab === "pending" ? pendingRequests : myRequests;

//   return (
//     <ScreenWrapper>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Quality Grading</Text>
//         <TouchableOpacity
//           style={styles.searchButton}
//           onPress={() => setShowSearchModal(true)}
//         >
//           <MaterialCommunityIcons name="magnify" size={24} color="#606C38" />
//         </TouchableOpacity>
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabs}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === "pending" && styles.tabActive]}
//           onPress={() => setActiveTab("pending")}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               activeTab === "pending" && styles.tabTextActive,
//             ]}
//           >
//             Pending ({pendingRequests.length})
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === "my-requests" && styles.tabActive]}
//           onPress={() => setActiveTab("my-requests")}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               activeTab === "my-requests" && styles.tabTextActive,
//             ]}
//           >
//             My Inspections ({myRequests.length})
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.container}>
//         {currentRequests.length === 0 ? (
//           <View style={styles.emptyState}>
//             <MaterialCommunityIcons
//               name="clipboard-check-outline"
//               size={64}
//               color="#CCC"
//             />
//             <Text style={styles.emptyText}>No requests found</Text>
//           </View>
//         ) : (
//           currentRequests.map((request) => renderRequestCard(request))
//         )}
//       </ScrollView>

//       {/* Search Modal */}
//       <Modal
//         visible={showSearchModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowSearchModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.searchModalContent}>
//             <Text style={styles.modalTitle}>Search by Lot ID</Text>
//             <TextInput
//               style={styles.searchInput}
//               value={searchLotId}
//               onChangeText={setSearchLotId}
//               placeholder="Enter Lot ID"
//               autoCapitalize="none"
//             />
//             <View style={styles.searchActions}>
//               <TouchableOpacity
//                 style={styles.cancelButton}
//                 onPress={() => setShowSearchModal(false)}
//               >
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.searchActionButton}
//                 onPress={handleSearchLot}
//               >
//                 <Text style={styles.searchActionButtonText}>Search</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Grading Modal */}
//       <Modal
//         visible={showGradingModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowGradingModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Quality Grading</Text>
//               <TouchableOpacity onPress={() => setShowGradingModal(false)}>
//                 <MaterialCommunityIcons name="close" size={24} color="#666" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={styles.modalBody}>
//               {selectedRequest && (
//                 <>
//                   {/* Request Info */}
//                   <View style={styles.requestInfo}>
//                     <Text style={styles.infoTitle}>Request Details</Text>
//                     <Text style={styles.infoText}>
//                       Crop: {selectedRequest.cropName}
//                     </Text>
//                     <Text style={styles.infoText}>
//                       Quantity: {selectedRequest.quantity}{" "}
//                       {selectedRequest.unit}
//                     </Text>
//                     <Text style={styles.infoText}>
//                       Farmer: {selectedRequest.farmerId?.name || "N/A"}
//                     </Text>
//                     <Text style={styles.infoText}>
//                       Phone: {selectedRequest.farmerId?.phone || "N/A"}
//                     </Text>
//                   </View>

//                   {/* Grade Selection */}
//                   <View style={styles.inputGroup}>
//                     <Text style={styles.inputLabel}>Select Grade *</Text>
//                     <View style={styles.gradeOptions}>
//                       {["FAQ", "A", "B", "C", "Rejected"].map((grade) => (
//                         <TouchableOpacity
//                           key={grade}
//                           style={[
//                             styles.gradeOption,
//                             gradingForm.grade === grade &&
//                               styles.gradeOptionSelected,
//                           ]}
//                           onPress={() =>
//                             setGradingForm({ ...gradingForm, grade })
//                           }
//                         >
//                           <Text
//                             style={[
//                               styles.gradeOptionText,
//                               gradingForm.grade === grade &&
//                                 styles.gradeOptionTextSelected,
//                             ]}
//                           >
//                             {grade}
//                           </Text>
//                         </TouchableOpacity>
//                       ))}
//                     </View>
//                   </View>

//                   {/* Quality Parameters */}
//                   <Text style={styles.sectionTitle}>
//                     Quality Parameters (%)
//                   </Text>
//                   <View style={styles.paramRow}>
//                     <View style={styles.paramInput}>
//                       <Text style={styles.paramLabel}>Moisture</Text>
//                       <TextInput
//                         style={styles.paramField}
//                         value={gradingForm.moisture}
//                         onChangeText={(text) =>
//                           setGradingForm({ ...gradingForm, moisture: text })
//                         }
//                         keyboardType="decimal-pad"
//                         placeholder="0.0"
//                       />
//                     </View>
//                     <View style={styles.paramInput}>
//                       <Text style={styles.paramLabel}>Foreign Matter</Text>
//                       <TextInput
//                         style={styles.paramField}
//                         value={gradingForm.foreignMatter}
//                         onChangeText={(text) =>
//                           setGradingForm({
//                             ...gradingForm,
//                             foreignMatter: text,
//                           })
//                         }
//                         keyboardType="decimal-pad"
//                         placeholder="0.0"
//                       />
//                     </View>
//                   </View>

//                   <View style={styles.paramRow}>
//                     <View style={styles.paramInput}>
//                       <Text style={styles.paramLabel}>Damaged Grains</Text>
//                       <TextInput
//                         style={styles.paramField}
//                         value={gradingForm.damagedGrains}
//                         onChangeText={(text) =>
//                           setGradingForm({
//                             ...gradingForm,
//                             damagedGrains: text,
//                           })
//                         }
//                         keyboardType="decimal-pad"
//                         placeholder="0.0"
//                       />
//                     </View>
//                     <View style={styles.paramInput}>
//                       <Text style={styles.paramLabel}>Discolored</Text>
//                       <TextInput
//                         style={styles.paramField}
//                         value={gradingForm.discoloredGrains}
//                         onChangeText={(text) =>
//                           setGradingForm({
//                             ...gradingForm,
//                             discoloredGrains: text,
//                           })
//                         }
//                         keyboardType="decimal-pad"
//                         placeholder="0.0"
//                       />
//                     </View>
//                   </View>

//                   <View style={styles.inputGroup}>
//                     <Text style={styles.inputLabel}>Weevil Damage (%)</Text>
//                     <TextInput
//                       style={styles.input}
//                       value={gradingForm.weevilDamage}
//                       onChangeText={(text) =>
//                         setGradingForm({ ...gradingForm, weevilDamage: text })
//                       }
//                       keyboardType="decimal-pad"
//                       placeholder="0.0"
//                     />
//                   </View>

//                   <View style={styles.inputGroup}>
//                     <Text style={styles.inputLabel}>Other Defects</Text>
//                     <TextInput
//                       style={[styles.input, styles.textArea]}
//                       value={gradingForm.otherDefects}
//                       onChangeText={(text) =>
//                         setGradingForm({ ...gradingForm, otherDefects: text })
//                       }
//                       placeholder="Describe any other defects..."
//                       multiline
//                       numberOfLines={3}
//                     />
//                   </View>

//                   <View style={styles.inputGroup}>
//                     <Text style={styles.inputLabel}>Grading Notes</Text>
//                     <TextInput
//                       style={[styles.input, styles.textArea]}
//                       value={gradingForm.gradingNotes}
//                       onChangeText={(text) =>
//                         setGradingForm({ ...gradingForm, gradingNotes: text })
//                       }
//                       placeholder="Additional notes..."
//                       multiline
//                       numberOfLines={3}
//                     />
//                   </View>

//                   {gradingForm.grade === "Rejected" && (
//                     <View style={styles.inputGroup}>
//                       <Text style={styles.inputLabel}>Rejection Reason *</Text>
//                       <TextInput
//                         style={[styles.input, styles.textArea]}
//                         value={gradingForm.rejectionReason}
//                         onChangeText={(text) =>
//                           setGradingForm({
//                             ...gradingForm,
//                             rejectionReason: text,
//                           })
//                         }
//                         placeholder="Explain why the crop is being rejected..."
//                         multiline
//                         numberOfLines={3}
//                       />
//                     </View>
//                   )}

//                   <Button
//                     title={submitting ? "Submitting..." : "Submit Grading"}
//                     onPress={handleSubmitGrading}
//                     loading={submitting}
//                     style={{ marginTop: 20, marginBottom: 40 }}
//                   />
//                 </>
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </ScreenWrapper>
//   );
// }


// app/(govt-tabs)/quality-grading.js - UPDATED WITH LAB INFORMATION

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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../secret";

export default function QualityGradingScreen() {
  const { user } = useAuth();
  const authToken = user?.token;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [searchLotId, setSearchLotId] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Grading form state (UPDATED with lab fields)
  const [gradingForm, setGradingForm] = useState({
    grade: "",
    moisture: "",
    foreignMatter: "",
    damagedGrains: "",
    discoloredGrains: "",
    weevilDamage: "",
    otherDefects: "",
    gradingNotes: "",
    rejectionReason: "",
    // NEW LAB FIELDS
    labName: "",
    labLocation: "",
    labCertificationNumber: "",
  });

  useEffect(() => {
    if (authToken) {
      fetchData();
    }
  }, [authToken, activeTab]);

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
          setPendingRequests(data.requests || []);
           //console.log(data.requests);
        }
      // } else {
        const res2 = await fetch(
          `${API_BASE_URL}/api/quality/govt/my-requests`,
          { headers }
        );
        if (res2.ok) {
          const data = await res2.json();
          setMyRequests(data.requests || []);
        }
    //  }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchLot = async () => {
    if (!searchLotId.trim()) {
      Alert.alert("Validation", "Please enter a Lot ID");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/quality/govt/search/${searchLotId.trim()}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        console.log(data.request);
        setSelectedRequest(data.request);
        setShowSearchModal(false);
        setShowGradingModal(true);
      } else {
        const error = await res.json();
        Alert.alert("Not Found", error.message || "Request not found");
      }
    } catch (error) {
      console.error("Search Error:", error);
      Alert.alert("Error", "Failed to search");
    }
  };

  const handleAssignToMe = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/quality/govt/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        Alert.alert("Success", "Inspection assigned to you");
        fetchData();
      } else {
        const error = await res.json();
        Alert.alert("Error", error.message || "Failed to assign");
      }
    } catch (error) {
      console.error("Assign Error:", error);
      Alert.alert("Error", "Network error");
    }
  };

  const handleOpenGrading = (request) => {
    setSelectedRequest(request);
    console.log("THE REQUEST",request);
    setGradingForm({
      grade: "",
      moisture: "",
      foreignMatter: "",
      damagedGrains: "",
      discoloredGrains: "",
      weevilDamage: "",
      otherDefects: "",
      gradingNotes: "",
      rejectionReason: "",
      labName: "",
      labLocation: "",
      labCertificationNumber: "",
    });
    setShowGradingModal(true);
  };

  const handleSubmitGrading = async () => {
    // Validation
    console.log(selectedRequest);
    if (!gradingForm.grade) {
      Alert.alert("Validation", "Please select a grade");
      return;
    }

    if (gradingForm.grade === "Rejected" && !gradingForm.rejectionReason) {
      Alert.alert("Validation", "Please provide a rejection reason");
      return;
    }

    // Lab information validation
    if (!gradingForm.labName || !gradingForm.labLocation) {
      Alert.alert("Validation", "Please provide lab information");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        grade: gradingForm.grade,
        qualityParams: {
          moisture: parseFloat(gradingForm.moisture) || null,
          foreignMatter: parseFloat(gradingForm.foreignMatter) || null,
          damagedGrains: parseFloat(gradingForm.damagedGrains) || null,
          discoloredGrains: parseFloat(gradingForm.discoloredGrains) || null,
          weevilDamage: parseFloat(gradingForm.weevilDamage) || null,
          otherDefects: gradingForm.otherDefects || null,
        },
        gradingNotes: gradingForm.gradingNotes,
        rejectionReason: gradingForm.rejectionReason,
        // NEW LAB FIELDS
        labName: gradingForm.labName,
        labLocation: gradingForm.labLocation,
        labCertificationNumber: gradingForm.labCertificationNumber,
      };

      const res = await fetch(
        `${API_BASE_URL}/api/quality/govt/grade/${selectedRequest._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        Alert.alert("Success", "Grading submitted successfully");
        setShowGradingModal(false);
        setSelectedRequest(null);
        fetchData();
      } else {
        const error = await res.json();
        Alert.alert("Error", error.message || "Failed to submit grading");
      }
    } catch (error) {
      console.error("Submit Grading Error:", error);
      Alert.alert("Error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "#2A9D8F";
      case "rejected": return "#E76F51";
      case "in-progress": return "#F4A261";
      default: return "#888";
    }
  };

  const renderRequestCard = (request, showActions = true) => (
    <View key={request._id} style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <MaterialCommunityIcons name="sprout" size={24} color="#606C38" />
          <View style={styles.titleText}>
            <Text style={styles.cropName}>{request.cropId?.cropName}</Text>
            <Text style={styles.farmerName}>
              Farmer: {request.farmerId?.name || "Unknown"}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(request.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="weight" size={16} color="#666" />
          <Text style={styles.detailText}>
            {request.quantity} {request.unit}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
          <Text style={styles.detailText}>
            {request.fieldId?.name || "Unknown Field"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(request.harvestDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {request.grade && (
        <View style={styles.gradeInfo}>
          <Text style={styles.gradeLabel}>Grade: {request.grade}</Text>
          {request.certificateNumber && (
            <Text style={styles.certNumber}>
              Cert: {request.certificateNumber}
            </Text>
          )}
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.lotId}>Lot ID: {request._id.slice(-8)}</Text>
        {showActions && request.status === "pending" && (
          <TouchableOpacity
            style={styles.assignButton}
            onPress={() => handleAssignToMe(request._id)}
          >
            <Text style={styles.assignButtonText}>Assign to Me</Text>
          </TouchableOpacity>
        )}
        {showActions && request.status === "in-progress" && !request.grade && (
          <TouchableOpacity
            style={styles.gradeButton}
            onPress={() => handleOpenGrading(request)}
          >
            <Text style={styles.gradeButtonText}>Grade Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#606C38" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const currentRequests =
    activeTab === "pending" ? pendingRequests : myRequests;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quality Grading</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSearchModal(true)}
        >
          <MaterialCommunityIcons name="magnify" size={24} color="#606C38" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.tabActive]}
          onPress={() => setActiveTab("pending")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.tabTextActive,
            ]}
          >
            Pending ({pendingRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "my-requests" && styles.tabActive]}
          onPress={() => setActiveTab("my-requests")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "my-requests" && styles.tabTextActive,
            ]}
          >
            My Inspections ({myRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {currentRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="clipboard-check-outline"
              size={64}
              color="#CCC"
            />
            <Text style={styles.emptyText}>No requests found</Text>
          </View>
        ) : (
          currentRequests.map((request) => renderRequestCard(request))
        )}
      </ScrollView>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.searchModalContent}>
            <Text style={styles.modalTitle}>Search by Lot ID</Text>
            <TextInput
              style={styles.searchInput}
              value={searchLotId}
              onChangeText={setSearchLotId}
              placeholder="Enter Lot ID"
              autoCapitalize="none"
            />
            <View style={styles.searchActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowSearchModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.searchActionButton}
                onPress={handleSearchLot}
              >
                <Text style={styles.searchActionButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Grading Modal */}
      <Modal
        visible={showGradingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGradingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quality Grading</Text>
              <TouchableOpacity onPress={() => setShowGradingModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedRequest && (
                <>
                  {/* Request Info */}
                  <View style={styles.requestInfo}>
                    <Text style={styles.infoTitle}>Request Details</Text>
                    <Text style={styles.infoText}>
                      Crop: {selectedRequest.cropId?.cropName}
                    </Text>
                    <Text style={styles.infoText}>
                      Quantity: {selectedRequest.quantity}{" "}
                      {selectedRequest.unit}
                    </Text>
                    <Text style={styles.infoText}>
                      Field: {selectedRequest.fieldId?.name}
                    </Text>
                    <Text style={styles.infoText}>
                      Farmer: {selectedRequest.farmerId?.name || "N/A"}
                    </Text>
                    <Text style={styles.infoText}>
                      Phone: {selectedRequest.farmerId?.phone || "N/A"}
                    </Text>
                  </View>

                  {/* LAB INFORMATION SECTION (NEW) */}
                  <Text style={styles.sectionTitle}>Lab Information *</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Lab Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={gradingForm.labName}
                      onChangeText={(text) =>
                        setGradingForm({ ...gradingForm, labName: text })
                      }
                      placeholder="e.g., Central Agri Lab Varanasi"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Lab Location *</Text>
                    <TextInput
                      style={styles.input}
                      value={gradingForm.labLocation}
                      onChangeText={(text) =>
                        setGradingForm({ ...gradingForm, labLocation: text })
                      }
                      placeholder="e.g., Varanasi, UP"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Lab Certification Number</Text>
                    <TextInput
                      style={styles.input}
                      value={gradingForm.labCertificationNumber}
                      onChangeText={(text) =>
                        setGradingForm({
                          ...gradingForm,
                          labCertificationNumber: text,
                        })
                      }
                      placeholder="e.g., NABL/LAB-2024-001"
                    />
                  </View>

                  {/* Grade Selection */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Select Grade *</Text>
                    <View style={styles.gradeOptions}>
                      {["FAQ", "A", "B", "C", "Rejected"].map((grade) => (
                        <TouchableOpacity
                          key={grade}
                          style={[
                            styles.gradeOption,
                            gradingForm.grade === grade &&
                              styles.gradeOptionSelected,
                          ]}
                          onPress={() =>
                            setGradingForm({ ...gradingForm, grade })
                          }
                        >
                          <Text
                            style={[
                              styles.gradeOptionText,
                              gradingForm.grade === grade &&
                                styles.gradeOptionTextSelected,
                            ]}
                          >
                            {grade}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Quality Parameters */}
                  <Text style={styles.sectionTitle}>
                    Quality Parameters (%)
                  </Text>
                  <View style={styles.paramRow}>
                    <View style={styles.paramInput}>
                      <Text style={styles.paramLabel}>Moisture</Text>
                      <TextInput
                        style={styles.paramField}
                        value={gradingForm.moisture}
                        onChangeText={(text) =>
                          setGradingForm({ ...gradingForm, moisture: text })
                        }
                        keyboardType="decimal-pad"
                        placeholder="0.0"
                      />
                    </View>
                    <View style={styles.paramInput}>
                      <Text style={styles.paramLabel}>Foreign Matter</Text>
                      <TextInput
                        style={styles.paramField}
                        value={gradingForm.foreignMatter}
                        onChangeText={(text) =>
                          setGradingForm({
                            ...gradingForm,
                            foreignMatter: text,
                          })
                        }
                        keyboardType="decimal-pad"
                        placeholder="0.0"
                      />
                    </View>
                  </View>

                  <View style={styles.paramRow}>
                    <View style={styles.paramInput}>
                      <Text style={styles.paramLabel}>Damaged Grains</Text>
                      <TextInput
                        style={styles.paramField}
                        value={gradingForm.damagedGrains}
                        onChangeText={(text) =>
                          setGradingForm({
                            ...gradingForm,
                            damagedGrains: text,
                          })
                        }
                        keyboardType="decimal-pad"
                        placeholder="0.0"
                      />
                    </View>
                    <View style={styles.paramInput}>
                      <Text style={styles.paramLabel}>Discolored</Text>
                      <TextInput
                        style={styles.paramField}
                        value={gradingForm.discoloredGrains}
                        onChangeText={(text) =>
                          setGradingForm({
                            ...gradingForm,
                            discoloredGrains: text,
                          })
                        }
                        keyboardType="decimal-pad"
                        placeholder="0.0"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Weevil Damage (%)</Text>
                    <TextInput
                      style={styles.input}
                      value={gradingForm.weevilDamage}
                      onChangeText={(text) =>
                        setGradingForm({ ...gradingForm, weevilDamage: text })
                      }
                      keyboardType="decimal-pad"
                      placeholder="0.0"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Other Defects</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={gradingForm.otherDefects}
                      onChangeText={(text) =>
                        setGradingForm({ ...gradingForm, otherDefects: text })
                      }
                      placeholder="Describe any other defects..."
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Grading Notes</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={gradingForm.gradingNotes}
                      onChangeText={(text) =>
                        setGradingForm({ ...gradingForm, gradingNotes: text })
                      }
                      placeholder="Additional notes..."
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  {gradingForm.grade === "Rejected" && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Rejection Reason *</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={gradingForm.rejectionReason}
                        onChangeText={(text) =>
                          setGradingForm({
                            ...gradingForm,
                            rejectionReason: text,
                          })
                        }
                        placeholder="Explain why the crop is being rejected..."
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  )}

                  <Button
                    title={submitting ? "Submitting..." : "Submit Grading"}
                    onPress={handleSubmitGrading}
                    loading={submitting}
                    style={{ marginTop: 20, marginBottom: 40 }}
                  />
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#264653",
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F2E6",
    justifyContent: "center",
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: "#606C38",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#606C38",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  requestCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleText: {
    marginLeft: 12,
  },
  cropName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#264653",
  },
  farmerName: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  cardDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  gradeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginBottom: 8,
  },
  gradeLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2A9D8F",
  },
  certNumber: {
    fontSize: 12,
    color: "#666",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lotId: {
    fontSize: 12,
    color: "#888",
    fontFamily: "monospace",
  },
  assignButton: {
    backgroundColor: "#606C38",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  assignButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  gradeButton: {
    backgroundColor: "#2A9D8F",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  gradeButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    width: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  searchActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  searchActionButton: {
    flex: 1,
    backgroundColor: "#606C38",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  searchActionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    width: "95%",
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalBody: {
    padding: 20,
  },
  requestInfo: {
    backgroundColor: "#F0F2E6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  gradeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gradeOption: {
    flex: 1,
    minWidth: 60,
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  gradeOptionSelected: {
    backgroundColor: "#606C38",
    borderColor: "#606C38",
  },
  gradeOptionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  gradeOptionTextSelected: {
    color: "#FFF",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#264653",
    marginBottom: 12,
  },
  paramRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  paramInput: {
    flex: 1,
  },
  paramLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  paramField: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
});