// import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import {
//   Dimensions,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   ActivityIndicator,
// } from "react-native";
// import Button from "../../src/components/common/Button";
// import ScreenWrapper from "../../src/components/common/ScreenWrapper";
// import { useAuth } from "../../src/context/AuthContext";
// import {API_BASE_URL} from "../../secret"

// const { width, height } = Dimensions.get("window");

// export default function MyFarmScreen() {
//   const { user } = useAuth();
//   const authToken = user.token;
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [selectedField, setSelectedField] = useState(null);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [fields, setFields] = useState([]);
//   const [newField, setNewField] = useState({
//     name: "",
//     area: "",
//     crop: "",
//     soilType: "",
//   });
//   const [farmStats, setFarmStats] = useState({
//     totalArea: 0,
//     activeFields: 0,
//     totalFields: 0,
//     avgHealth: null,
//   });
//   const [isAddingField, setIsAddingField] = useState(false);


//   const fetchData = async () => {
//     if (!authToken) return;
//     setLoading(true);

//     try {
//       const headers = { "Authorization": `Bearer ${authToken}` };

//       // 1. Fetch Fields
//       const fieldsRes = await fetch(`${API_BASE_URL}/api/farm/fields`, { headers });
//       if (fieldsRes.ok) {
//         const fieldsData = await fieldsRes.json();
//         setFields(fieldsData.fields || []);
//       } else {
//         throw new Error("Failed to fetch fields");
//       }
      
//       // 2. Fetch Stats
//       const statsRes = await fetch(`${API_BASE_URL}/api/farm/stats`, { headers });
//       if (statsRes.ok) {
//         const statsData = await statsRes.json();
//         setFarmStats({
//           totalArea: parseFloat(statsData.totalArea),
//           activeFields: statsData.activeFields,
//           totalFields: statsData.totalFields,
//           avgHealth: statsData.avgHealth,
//         });
//       } else {
//         console.error("Failed to fetch stats");
//       }

//     } catch (error) {
//       console.error("Farm Fetch Error:", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (authToken) {
//       fetchData();
//     }
//   }, [authToken]);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Growing":
//         return "#2A9D8F";
//       case "Preparing":
//         return "#F4A261";
//       case "Harvesting":
//         return "#E9C46A";
//       case "Fallow":
//         return "#888";
//       default:
//         return "#666";
//     }
//   };

//   const getHealthColor = (health) => {
//     if (!health) return "#888";
//     if (health >= 80) return "#2A9D8F";
//     if (health >= 60) return "#F4A261";
//     return "#E76F51";
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "Not planted";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
//   };

//   const calculateDaysToHarvest = (harvestDate) => {
//     if (!harvestDate) return null;
//     const today = new Date();
//     const harvest = new Date(harvestDate);
//     const diff = Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
//     return diff > 0 ? diff : 0;
//   };

//   const totalArea = fields.reduce((sum, field) => sum + field.area, 0);
//   const activeFields = fields.filter((f) => f.status === "Growing").length;
//   const avgHealth = Math.round(
//     fields.filter((f) => f.health).reduce((sum, f) => sum + f.health, 0) /
//       fields.filter((f) => f.health).length
//   );

//   const handleAddField = async () => {
//     if (!newField.name || !newField.area || !newField.crop) {
//       alert("Please fill all fields");
//       return;
//     }

//     setIsAddingField(true);

//     try {
//       const res = await fetch(`${API_BASE_URL}/api/farm/fields`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${authToken}`
//         },
//         body: JSON.stringify({
//           name: newField.name,
//           area: parseFloat(newField.area),
//           crop: newField.crop,
//           soilType: newField.soilType || 'Unknown',
//           // Mock coordinates for map visualization
//           coordinates: { 
//             lat: 25.3176 + Math.random() * 0.01,
//             lng: 82.9739 + Math.random() * 0.01,
//           }, 
//         }),
//       });

//       if (res.ok) {
//         const responseData = await res.json();
        
//         // Add the new field to the local state, giving it a color for the map
//         const colorOptions = ["#2A9D8F", "#F4A261", "#E76F51", "#606C38"];
//         const newFieldWithColor = {
//           ...responseData.field,
//           color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
//         };
        
//         setFields((prevFields) => [...prevFields, newFieldWithColor]);
//         setNewField({ name: "", area: "", crop: "", soilType: "" });
//         setShowAddModal(false);
//         fetchData(); // Refresh stats after adding field
//       } else {
//         const errorText = await res.text();
//         console.error("API Error adding field:", errorText);
//       }
//     } catch (err) {
//       console.error("Network Error adding field:", err.message);
//     } finally {
//       setIsAddingField(false);
//     }
//   }; 
//   const renderMap = () => (
//     <View style={styles.mapContainer}>
//       {/* Map Header */}
//       <View style={styles.mapHeader}>
//         <MaterialCommunityIcons
//           name="map-marker-radius"
//           size={20}
//           color="#2A9D8F"
//         />
//         <Text style={styles.mapTitle}>Farm Location: Varanasi, UP</Text>
//       </View>

//       {/* Simple Map Representation */}
//       <View style={styles.mapView}>
//         <View style={styles.mapGrid}>
//           {/* Grid lines for visual effect */}
//           {[...Array(5)].map((_, i) => (
//             <View
//               key={`h-${i}`}
//               style={[styles.gridLineH, { top: `${i * 25}%` }]}
//             />
//           ))}
//           {[...Array(5)].map((_, i) => (
//             <View
//               key={`v-${i}`}
//               style={[styles.gridLineV, { left: `${i * 25}%` }]}
//             />
//           ))}

//           {/* Field Markers */}
//           {fields.map((field, index) => (
//             <TouchableOpacity
//               key={field._id}
//               style={[
//                 styles.fieldMarker,
//                 {
//                   backgroundColor: field.color,
//                   left: `${20 + index * 20}%`,
//                   top: `${30 + (index % 2) * 30}%`,
//                 },
//               ]}
//               onPress={() =>
//                 setSelectedField(field.id === selectedField ? null : field.id)
//               }
//             >
//               <Text style={styles.markerText}>
//                 {field.name[field.name.length - 1]}
//               </Text>
//               {selectedField === field.id && (
//                 <View style={styles.markerLabel}>
//                   <Text style={styles.markerLabelText}>{field.name}</Text>
//                   <Text style={styles.markerLabelSubtext}>
//                     {field.area} acres
//                   </Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           ))}

//           {/* Farm Center Marker */}
//           <View style={styles.centerMarker}>
//             <MaterialCommunityIcons name="home" size={24} color="#264653" />
//           </View>
//         </View>

//         {/* Map Controls */}
//         <View style={styles.mapControls}>
//           <TouchableOpacity style={styles.mapButton}>
//             <MaterialCommunityIcons name="plus" size={20} color="#264653" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.mapButton}>
//             <MaterialCommunityIcons name="minus" size={20} color="#264653" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.mapButton}>
//             <MaterialCommunityIcons
//               name="crosshairs-gps"
//               size={20}
//               color="#264653"
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Map Legend */}
//         <View style={styles.mapLegend}>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendDot, { backgroundColor: "#2A9D8F" }]} />
//             <Text style={styles.legendText}>Growing</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendDot, { backgroundColor: "#F4A261" }]} />
//             <Text style={styles.legendText}>Preparing</Text>
//           </View>
//         </View>
//       </View>

//       {/* Map Footer Info */}
//       <View style={styles.mapFooter}>
//         <Text style={styles.mapFooterText}>
//           Tap on field markers to see details • Total area:{" "}
//           {totalArea.toFixed(1)} acres
//         </Text>
//       </View>
//     </View>
//   );

//   const renderFieldCard = (field) => {
//     const daysToHarvest = calculateDaysToHarvest(field.expectedHarvest);

//     return (
//       <TouchableOpacity
//         key={field.id}
//         style={styles.fieldCard}
//         // onPress={() => router.push(`/field-details?id=${field.id}`)}
//         activeOpacity={1}
//       >
//         {/* Field Header */}
//         <View style={styles.fieldHeader}>
//           <View style={styles.fieldTitleRow}>
//             <View
//               style={[
//                 styles.fieldColorIndicator,
//                 { backgroundColor: field.color },
//               ]}
//             />
//             <View style={styles.fieldTitleContainer}>
//               <Text style={styles.fieldName}>{field.name}</Text>
//               <Text style={styles.fieldArea}>
//                 {field.area} acres • {field.soilType}
//               </Text>
//             </View>
//           </View>
//           <View
//             style={[
//               styles.statusBadge,
//               { backgroundColor: getStatusColor(field.status) },
//             ]}
//           >
//             <Text style={styles.statusText}>{field.status}</Text>
//           </View>
//         </View>

//         {/* Crop Info */}
//         <View style={styles.cropSection}>
//           <View style={styles.cropIconContainer}>
//             <MaterialCommunityIcons name="sprout" size={20} color="#2A9D8F" />
//           </View>
//           <View style={styles.cropInfo}>
//             <Text style={styles.cropLabel}>Current Crop</Text>
//             <Text style={styles.cropName}>{field.crop}</Text>
//           </View>
//           {field.health && (
//             <View style={styles.healthContainer}>
//               <MaterialCommunityIcons
//                 name="heart-pulse"
//                 size={18}
//                 color={getHealthColor(field.health)}
//               />
//               <Text
//                 style={[
//                   styles.healthText,
//                   { color: getHealthColor(field.health) },
//                 ]}
//               >
//                 {field.health}%
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* Field Details Grid */}
//         <View style={styles.detailsGrid}>
//           <View style={styles.detailItem}>
//             <MaterialCommunityIcons
//               name="calendar-check"
//               size={16}
//               color="#666"
//             />
//             <Text style={styles.detailText}>
//               Planted: {formatDate(field.plantedDate)}
//             </Text>
//           </View>
//           <View style={styles.detailItem}>
//             <MaterialCommunityIcons name="water" size={16} color="#666" />
//             <Text style={styles.detailText}>{field.irrigation}</Text>
//           </View>
//         </View>

//         {/* Harvest Countdown */}
//         {daysToHarvest !== null && (
//           <View style={styles.harvestSection}>
//             <MaterialCommunityIcons
//               name="timer-sand"
//               size={18}
//               color="#F4A261"
//             />
//             <Text style={styles.harvestText}>
//               {daysToHarvest} days until harvest (
//               {formatDate(field.expectedHarvest)})
//             </Text>
//           </View>
//         )}

//         {/* Quick Actions */}
//         <View style={styles.quickActions}>
//           <TouchableOpacity style={styles.actionButton}>
//             <MaterialCommunityIcons
//               name="water-outline"
//               size={18}
//               color="#2A9D8F"
//             />
//             <Text style={styles.actionText}>Irrigate</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.actionButton}>
//             <MaterialCommunityIcons
//               name="chart-line"
//               size={18}
//               color="#2A9D8F"
//             />
//             <Text style={styles.actionText}>Monitor</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.actionButton}>
//             <MaterialCommunityIcons
//               name="notebook-outline"
//               size={18}
//               color="#2A9D8F"
//             />
//             <Text style={styles.actionText}>Logs</Text>
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   if (!authToken || loading) {
//     return (
//       <ScreenWrapper>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#2A9D8F" />
//           <Text style={{ marginTop: 10, color: '#666' }}>Loading Farm Data...</Text>
//         </View>
//       </ScreenWrapper>
//     );
//   }

//   return (
//     <ScreenWrapper>
//       <ScrollView style={styles.scrollView}>
//         <View style={styles.container}>
//           <Text style={styles.header}>My Farm</Text>

//           {/* Summary Stats */}
//           <View style={styles.statsContainer}>
//             <View style={styles.statCard}>
//               <MaterialCommunityIcons
//                 name="land-fields"
//                 size={24}
//                 color="#2A9D8F"
//               />
//               <Text style={styles.statValue}>{totalArea.toFixed(1)}</Text>
//               <Text style={styles.statLabel}>Total Acres</Text>
//             </View>
//             <View style={styles.statCard}>
//               <MaterialCommunityIcons name="sprout" size={24} color="#606C38" />
//               <Text style={styles.statValue}>
//                 {activeFields}/{fields.length}
//               </Text>
//               <Text style={styles.statLabel}>Active Fields</Text>
//             </View>
//             <View style={styles.statCard}>
//               <MaterialCommunityIcons
//                 name="heart-pulse"
//                 size={24}
//                 color="#E76F51"
//               />
//               <Text style={styles.statValue}>{avgHealth}%</Text>
//               <Text style={styles.statLabel}>Avg Health</Text>
//             </View>
//           </View>

//           {/* Map Section */}
//           {renderMap()}

//           {/* Fields List */}
//           <View style={styles.fieldsSection}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>My Fields</Text>
//               <TouchableOpacity
//                 style={styles.addButton}
//                 onPress={() => setShowAddModal(true)}
//               >
//                 <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
//                 <Text style={styles.addButtonText}>Add Field</Text>
//               </TouchableOpacity>
//             </View>

//             {fields.map((field) => renderFieldCard(field))}
//           </View>

//           {/* Farm Insights */}
//           <View style={styles.insightsCard}>
//             <MaterialCommunityIcons
//               name="lightbulb"
//               size={24}
//               color="#F4A261"
//             />
//             <Text style={styles.insightsTitle}>Farm Insights</Text>
//             <Text style={styles.insightText}>
//               • Field A is performing excellently with 92% health score
//             </Text>
//             <Text style={styles.insightText}>
//               • Consider rotating crops in Field B after current season
//             </Text>
//             <Text style={styles.insightText}>
//               • 3 fields ready for harvest in next 60 days
//             </Text>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Add Field Modal */}
//       <Modal
//         visible={showAddModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowAddModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Add New Field</Text>
//               <TouchableOpacity onPress={() => setShowAddModal(false)}>
//                 <FontAwesome name="times" size={24} color="#666" />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.modalBody}>
//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Field Name</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={newField.name}
//                   onChangeText={(text) =>
//                     setNewField({ ...newField, name: text })
//                   }
//                   placeholder="e.g., Field E"
//                   placeholderTextColor="#888"
//                 />
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Area (acres)</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={newField.area}
//                   onChangeText={(text) =>
//                     setNewField({ ...newField, area: text })
//                   }
//                   placeholder="e.g., 5.5"
//                   keyboardType="decimal-pad"
//                   placeholderTextColor="#888"
//                 />
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Crop Type</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={newField.crop}
//                   onChangeText={(text) =>
//                     setNewField({ ...newField, crop: text })
//                   }
//                   placeholder="e.g., Rice"
//                   placeholderTextColor="#888"
//                 />
//               </View>

//               <Button title="Add Field" onPress={handleAddField} />
//               <TouchableOpacity
//                 style={styles.cancelButton}
//                 onPress={() => setShowAddModal(false)}
//               >
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   scrollView: {
//     flex: 1,
//   },
//   container: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   header: {
//     fontSize: 32,
//     fontWeight: "bold",
//     color: "#264653",
//     marginTop: 20,
//     marginBottom: 20,
//   },
//   statsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 24,
//   },
//   statCard: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: 16,
//     alignItems: "center",
//     marginHorizontal: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   statValue: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#264653",
//     marginTop: 8,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 4,
//   },
//   mapContainer: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 24,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   mapHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   mapTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#264653",
//     marginLeft: 8,
//   },
//   mapView: {
//     height: 300,
//     backgroundColor: "#F0F4F3",
//     borderRadius: 12,
//     overflow: "hidden",
//     position: "relative",
//   },
//   mapGrid: {
//     flex: 1,
//     position: "relative",
//   },
//   gridLineH: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     height: 1,
//     backgroundColor: "#D0E8E4",
//   },
//   gridLineV: {
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     width: 1,
//     backgroundColor: "#D0E8E4",
//   },
//   fieldMarker: {
//     position: "absolute",
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   markerText: {
//     color: "#FFFFFF",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   markerLabel: {
//     position: "absolute",
//     top: -40,
//     backgroundColor: "#FFFFFF",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 2,
//     minWidth: 80,
//   },
//   markerLabelText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#264653",
//   },
//   markerLabelSubtext: {
//     fontSize: 10,
//     color: "#666",
//   },
//   centerMarker: {
//     position: "absolute",
//     left: "50%",
//     top: "50%",
//     marginLeft: -20,
//     marginTop: -20,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#FFFFFF",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#2A9D8F",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   mapControls: {
//     position: "absolute",
//     right: 12,
//     top: 12,
//   },
//   mapButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 8,
//     backgroundColor: "#FFFFFF",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   mapLegend: {
//     position: "absolute",
//     bottom: 12,
//     left: 12,
//     backgroundColor: "#FFFFFF",
//     padding: 10,
//     borderRadius: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   legendItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   legendDot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginRight: 6,
//   },
//   legendText: {
//     fontSize: 11,
//     color: "#666",
//   },
//   mapFooter: {
//     marginTop: 12,
//     alignItems: "center",
//   },
//   mapFooterText: {
//     fontSize: 12,
//     color: "#888",
//     textAlign: "center",
//   },
//   fieldsSection: {
//     marginBottom: 24,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#264653",
//   },
//   addButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2A9D8F",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   addButtonText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "600",
//     marginLeft: 6,
//   },
//   fieldCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   fieldHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 16,
//   },
//   fieldTitleRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   fieldColorIndicator: {
//     width: 4,
//     height: 40,
//     borderRadius: 2,
//     marginRight: 12,
//   },
//   fieldTitleContainer: {
//     flex: 1,
//   },
//   fieldName: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#264653",
//   },
//   fieldArea: {
//     fontSize: 14,
//     color: "#666",
//     marginTop: 2,
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   statusText: {
//     color: "#FFFFFF",
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   cropSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F8F9FA",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   cropIconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 8,
//     backgroundColor: "#E8F5F3",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   cropInfo: {
//     flex: 1,
//   },
//   cropLabel: {
//     fontSize: 12,
//     color: "#666",
//   },
//   cropName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#264653",
//     marginTop: 2,
//   },
//   healthContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   healthText: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginLeft: 6,
//   },
//   detailsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginBottom: 12,
//   },
//   detailItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 20,
//     marginBottom: 8,
//   },
//   detailText: {
//     fontSize: 13,
//     color: "#666",
//     marginLeft: 6,
//   },
//   harvestSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFF8F0",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   harvestText: {
//     fontSize: 13,
//     color: "#666",
//     marginLeft: 8,
//     flex: 1,
//   },
//   quickActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: "#E8E8E8",
//   },
//   actionButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//   },
//   actionText: {
//     fontSize: 13,
//     color: "#2A9D8F",
//     fontWeight: "600",
//     marginLeft: 6,
//   },
//   insightsCard: {
//     backgroundColor: "#FFF8F0",
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 20,
//   },
//   insightsTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#264653",
//     marginTop: 8,
//     marginBottom: 12,
//   },
//   insightText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 22,
//     marginBottom: 6,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContent: {
//     backgroundColor: "#FFFFFF",
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingTop: 20,
//     maxHeight: height * 0.8,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E8E8E8",
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#264653",
//   },
//   modalBody: {
//     padding: 20,
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     fontSize: 16,
//     color: "#333",
//     marginBottom: 8,
//     fontWeight: "500",
//   },
//   input: {
//     backgroundColor: "#F8F9FA",
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#DDD",
//     fontSize: 16,
//     color: "#333",
//   },
//   cancelButton: {
//     paddingVertical: 15,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     color: "#666",
//     fontWeight: "600",
//   },
// });

// app/(tabs)/farm.js - UPDATED WITH CROP SELECTION & HARVEST

import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import Button from "../../src/components/common/Button";
import ScreenWrapper from "../../src/components/common/ScreenWrapper";
import { useAuth } from "../../src/context/AuthContext";
import { API_BASE_URL } from "../../secret";

export default function MyFarmScreen() {
  const { user } = useAuth();
  const authToken = user?.token;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]); // Available crops
  const [selectedField, setSelectedField] = useState(null);
  
  // Modals
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showUpdateCropModal, setShowUpdateCropModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  
  // Forms
  const [newField, setNewField] = useState({
    name: "",
    area: "",
    soilType: "",
  });
  
  const [selectedCropId, setSelectedCropId] = useState("");
  const [harvestData, setHarvestData] = useState({
    quantity: "",
    unit: "quintal",
    storageLocation: "",
    notes: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authToken) {
      fetchData();
    }
  }, [authToken]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      
      // Fetch fields (now with cropId populated)
      const fieldsRes = await fetch(`${API_BASE_URL}/api/farm/fields`, { headers });
      if (fieldsRes.ok) {
        const data = await fieldsRes.json();
        setFields(data.fields || []);
      }
      
      // Fetch available crops from master
      const cropsRes = await fetch(`${API_BASE_URL}/api/crops/crops`, { headers });
      if (cropsRes.ok) {
        const data = await cropsRes.json();
        setCrops(data.crops || []);
      }
      console.log(crops);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async () => {
    if (!newField.name || !newField.area) {
      Alert.alert("Validation", "Please fill all required fields");
      return;
    }


    setIsSubmitting(true);
    try {
      console.log("Adding new field");
      const res = await fetch(`${API_BASE_URL}/api/farm/fields`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: newField.name,
          area: parseFloat(newField.area),
          soilType: newField.soilType || "Unknown",
          coordinates: {
            lat: 25.3176 + Math.random() * 0.01,
            lng: 82.9739 + Math.random() * 0.01,
          },
        }),
      });

      if (res.ok) {
        Alert.alert("Success", "Field added successfully");
        setNewField({ name: "", area: "", soilType: "" });
        setShowAddFieldModal(false);
        fetchData();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add field");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectCropForField = (field) => {
    setSelectedField(field);
    setSelectedCropId(field.cropId?._id || "");
    setShowUpdateCropModal(true);
  };

  const handleUpdateFieldCrop = async () => {
    if (!selectedCropId) {
      Alert.alert("Validation", "Please select a crop");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/farm/fields/${selectedField._id}/crop`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          cropId: selectedCropId,
          plantedDate: new Date(),
          expectedHarvest: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // +120 days
        }),
      });

      if (res.ok) {
        Alert.alert("Success", "Crop planted successfully");
        setShowUpdateCropModal(false);
        fetchData();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update crop");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenHarvestModal = (field) => {
    if (!field.cropId) {
      Alert.alert("Error", "No crop planted in this field");
      return;
    }
    setSelectedField(field);
    setHarvestData({
      quantity: "",
      unit: "quintal",
      storageLocation: "",
      notes: "",
    });
    setShowHarvestModal(true);
  };

  const handleHarvestCrop = async () => {
    if (!harvestData.quantity) {
      Alert.alert("Validation", "Please enter harvest quantity");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/crop-output/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fieldId: selectedField._id,
          quantity: parseFloat(harvestData.quantity),
          unit: harvestData.unit,
          storageLocation: harvestData.storageLocation,
          notes: harvestData.notes,
        }),
      });

      if (res.ok) {
        Alert.alert("Success", "Crop harvested and recorded successfully! Field is now fallow.");
        setShowHarvestModal(false);
        fetchData();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to record harvest");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Growing": return "#2A9D8F";
      case "Preparing": return "#F4A261";
      case "Harvesting": return "#E9C46A";
      case "Fallow": return "#888";
      default: return "#666";
    }
  };

  const renderFieldCard = (field) => (
    <View key={field._id} style={styles.fieldCard}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldTitleRow}>
          <View style={[styles.fieldColorIndicator, { backgroundColor: field.color || "#2A9D8F" }]} />
          <View style={styles.fieldTitleContainer}>
            <Text style={styles.fieldName}>{field.name}</Text>
            <Text style={styles.fieldArea}>{field.area} acres • {field.soilType}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(field.status) }]}>
          <Text style={styles.statusText}>{field.status}</Text>
        </View>
      </View>

      {field.cropId ? (
        <View style={styles.cropSection}>
          <View style={styles.cropIconContainer}>
            <MaterialCommunityIcons name={field.cropId.icon || "sprout"} size={20} color="#2A9D8F" />
          </View>
          <View style={styles.cropInfo}>
            <Text style={styles.cropLabel}>Current Crop</Text>
            <Text style={styles.cropName}>{field.cropId.cropName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.changeCropButton}
            onPress={() => handleSelectCropForField(field)}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#2A9D8F" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.noCropSection}
          onPress={() => handleSelectCropForField(field)}
        >
          <MaterialCommunityIcons name="plus-circle" size={24} color="#2A9D8F" />
          <Text style={styles.noCropText}>Plant a Crop</Text>
        </TouchableOpacity>
      )}

      {field.cropId && field.status === "Growing" && (
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleOpenHarvestModal(field)}
          >
            <MaterialCommunityIcons name="grass" size={18} color="#2A9D8F" />
            <Text style={styles.actionText}>Harvest</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2A9D8F" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.header}>My Farm</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="land-fields" size={24} color="#2A9D8F" />
              <Text style={styles.statValue}>{fields.reduce((sum, f) => sum + f.area, 0).toFixed(1)}</Text>
              <Text style={styles.statLabel}>Total Acres</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="sprout" size={24} color="#606C38" />
              <Text style={styles.statValue}>{fields.filter(f => f.status === "Growing").length}/{fields.length}</Text>
              <Text style={styles.statLabel}>Active Fields</Text>
            </View>
          </View>

          {/* Fields */}
          <View style={styles.fieldsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Fields</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowAddFieldModal(true)}>
                <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                <Text style={styles.addButtonText}>Add Field</Text>
              </TouchableOpacity>
            </View>

            {fields.map(renderFieldCard)}
          </View>
        </View>
      </ScrollView>

      {/* Add Field Modal */}
      <Modal visible={showAddFieldModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Field</Text>
              <TouchableOpacity onPress={() => setShowAddFieldModal(false)}>
                <FontAwesome name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Field Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newField.name}
                  onChangeText={(text) => setNewField({ ...newField, name: text })}
                  placeholder="e.g., North Field"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Area (acres) *</Text>
                <TextInput
                  style={styles.input}
                  value={newField.area}
                  onChangeText={(text) => setNewField({ ...newField, area: text })}
                  keyboardType="decimal-pad"
                  placeholder="e.g., 5.5"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Soil Type</Text>
                <TextInput
                  style={styles.input}
                  value={newField.soilType}
                  onChangeText={(text) => setNewField({ ...newField, soilType: text })}
                  placeholder="e.g., Loamy"
                />
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={handleAddField} disabled={isSubmitting}>
                <Text style={styles.submitButtonText}>{isSubmitting ? "Adding..." : "Add Field"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Crop Modal */}
      <Modal visible={showUpdateCropModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Crop for {selectedField?.name}</Text>
              <TouchableOpacity onPress={() => setShowUpdateCropModal(false)}>
                <FontAwesome name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Choose a Crop *</Text>
              {crops.map((crop) => (
                <TouchableOpacity
                  key={crop._id}
                  style={[styles.cropOption, selectedCropId === crop._id && styles.cropOptionSelected]}
                  onPress={() => setSelectedCropId(crop._id)}
                >
                  <MaterialCommunityIcons name={crop.icon || "sprout"} size={24} color={selectedCropId === crop._id ? "#FFF" : "#2A9D8F"} />
                  <View style={styles.cropOptionInfo}>
                    <Text style={[styles.cropOptionName, selectedCropId === crop._id && styles.cropOptionNameSelected]}>{crop.cropName}</Text>
                    <Text style={[styles.cropOptionDetails, selectedCropId === crop._id && styles.cropOptionDetailsSelected]}>
                      {crop.season} • {crop.duration} • {crop.waterRequirement} Water
                    </Text>
                  </View>
                  {selectedCropId === crop._id && <FontAwesome name="check-circle" size={20} color="#FFF" />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.submitButton} onPress={handleUpdateFieldCrop} disabled={isSubmitting}>
                <Text style={styles.submitButtonText}>{isSubmitting ? "Planting..." : "Plant Crop"}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Harvest Modal */}
      <Modal visible={showHarvestModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Harvest {selectedField?.cropId?.cropName}</Text>
              <TouchableOpacity onPress={() => setShowHarvestModal(false)}>
                <FontAwesome name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity Harvested *</Text>
                <TextInput
                  style={styles.input}
                  value={harvestData.quantity}
                  onChangeText={(text) => setHarvestData({ ...harvestData, quantity: text })}
                  keyboardType="decimal-pad"
                  placeholder="e.g., 50"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Unit</Text>
                <View style={styles.unitRow}>
                  {["kg", "quintal", "ton"].map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[styles.unitButton, harvestData.unit === unit && styles.unitButtonSelected]}
                      onPress={() => setHarvestData({ ...harvestData, unit })}
                    >
                      <Text style={[styles.unitButtonText, harvestData.unit === unit && styles.unitButtonTextSelected]}>{unit}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Storage Location</Text>
                <TextInput
                  style={styles.input}
                  value={harvestData.storageLocation}
                  onChangeText={(text) => setHarvestData({ ...harvestData, storageLocation: text })}
                  placeholder="e.g., Warehouse A"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={harvestData.notes}
                  onChangeText={(text) => setHarvestData({ ...harvestData, notes: text })}
                  placeholder="Any additional notes..."
                  multiline
                  numberOfLines={3}
                />
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={handleHarvestCrop} disabled={isSubmitting}>
                <Text style={styles.submitButtonText}>{isSubmitting ? "Recording..." : "Record Harvest"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 32, fontWeight: "bold", color: "#264653", marginTop: 20, marginBottom: 20 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: "#FFF", borderRadius: 12, padding: 16, alignItems: "center", marginHorizontal: 4, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#264653", marginTop: 8 },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  fieldsSection: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#264653" },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#2A9D8F", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: "#FFF", fontSize: 14, fontWeight: "600", marginLeft: 6 },
  fieldCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
  fieldHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  fieldTitleRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  fieldColorIndicator: { width: 4, height: 40, borderRadius: 2, marginRight: 12 },
  fieldTitleContainer: { flex: 1 },
  fieldName: { fontSize: 20, fontWeight: "bold", color: "#264653" },
  fieldArea: { fontSize: 14, color: "#666", marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  cropSection: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F9FA", padding: 12, borderRadius: 12, marginBottom: 12 },
  cropIconContainer: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#E8F5F3", justifyContent: "center", alignItems: "center", marginRight: 12 },
  cropInfo: { flex: 1 },
  cropLabel: { fontSize: 12, color: "#666" },
  cropName: { fontSize: 16, fontWeight: "600", color: "#264653", marginTop: 2 },
  changeCropButton: { padding: 8 },
  noCropSection: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#F0F8F7", padding: 16, borderRadius: 12, marginBottom: 12 },
  noCropText: { fontSize: 16, color: "#2A9D8F", fontWeight: "600", marginLeft: 8 },
  quickActions: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E8E8E8" },
  actionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  actionText: { fontSize: 13, color: "#2A9D8F", fontWeight: "600", marginLeft: 6 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#264653" },
  modalBody: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: { backgroundColor: "#F8F9FA", borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  cropOption: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8F9FA", padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: "#E0E0E0" },
  cropOptionSelected: { backgroundColor: "#2A9D8F", borderColor: "#2A9D8F" },
  cropOptionInfo: { flex: 1, marginLeft: 12 },
  cropOptionName: { fontSize: 16, fontWeight: "600", color: "#264653" },
  cropOptionNameSelected: { color: "#FFF" },
  cropOptionDetails: { fontSize: 12, color: "#666", marginTop: 4 },
  cropOptionDetailsSelected: { color: "#E8F5F3" },
  unitRow: { flexDirection: "row", gap: 12 },
  unitButton: { flex: 1, backgroundColor: "#F8F9FA", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#E0E0E0", alignItems: "center" },
  unitButtonSelected: { backgroundColor: "#2A9D8F", borderColor: "#2A9D8F" },
  unitButtonText: { fontSize: 14, color: "#666" },
  unitButtonTextSelected: { color: "#FFF", fontWeight: "600" },
  submitButton: { backgroundColor: "#2A9D8F", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 10 },
  submitButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});