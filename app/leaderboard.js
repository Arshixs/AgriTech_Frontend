// app/leaderboard.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import useFarmerOnly from "../hooks/useFarmerOnly";
import { useAuth } from "../src/context/AuthContext";
import { API_BASE_URL } from "../secret";

const LEVEL_COLORS = { Bronze: "#CD7F32", Silver: "#A8A9AD", Gold: "#FFD700" };
const LEVEL_ICONS = {
  Bronze: "shield",
  Silver: "shield-half-full",
  Gold: "shield-star",
};

const RANK_STYLES = [
  {
    bg: "#FFF8E1",
    border: "#FFD700",
    num: "#F9A825",
    icon: "trophy",
    iconColor: "#FFD700",
  },
  {
    bg: "#F3F3F3",
    border: "#A8A9AD",
    num: "#757575",
    icon: "medal",
    iconColor: "#A8A9AD",
  },
  {
    bg: "#FBE9E7",
    border: "#CD7F32",
    num: "#BF360C",
    icon: "medal-outline",
    iconColor: "#CD7F32",
  },
];

export default function LeaderboardScreen() {
  const isFarmer = useFarmerOnly();
  const { user } = useAuth();
  const authToken = user?.token;
  const { t } = useTranslation();
  const router = useRouter();
  const { district } = useLocalSearchParams();

  const [data, setData] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!district) return;
      let cancelled = false;
      const load = async () => {
        try {
          setLoading(true);
          const res = await fetch(
            `${API_BASE_URL}/api/gamification/leaderboard?district=${encodeURIComponent(district)}`,
            { headers: { Authorization: `Bearer ${authToken}` } },
          );
          const json = await res.json();
          if (!cancelled && res.ok) {
            setData(json.leaderboard ?? []);
            setMyRank(json.myRank);
            setTotal(json.total ?? 0);
          }
        } catch (e) {
          console.error("[Leaderboard] fetch error:", e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      load();
      return () => {
        cancelled = true;
      };
    }, [authToken, district]),
  );

  if (!isFarmer) return null;

  const myFarmerId = user?._id ?? user?.id;

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#264653" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🏆 {t("Leaderboard")}</Text>
          <Text style={styles.headerSub}>
            {district} {t("District")} · {total} {t("farmers")}
          </Text>
        </View>
      </View>

      {/* My rank banner */}
      {myRank && !loading && (
        <View style={styles.myRankBanner}>
          <MaterialCommunityIcons
            name="account-star"
            size={20}
            color="#2A9D8F"
          />
          <Text style={styles.myRankText}>
            {t("Your rank in")} {district}:{" "}
            <Text style={styles.myRankNum}>#{myRank}</Text>
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2A9D8F" />
        </View>
      ) : data.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons
            name="podium-remove"
            size={56}
            color="#BDBDBD"
          />
          <Text style={styles.emptyTitle}>{t("No farmers found")}</Text>
          <Text style={styles.emptySub}>
            {t("Be the first from")} {district} {t("to earn points!")}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                setLoading(true);
                setData([]);
              }}
            />
          }
        >
          {/* Top 3 podium */}
          {data.length >= 3 && (
            <View style={styles.podium}>
              <PodiumBlock
                entry={data[1]}
                pos={2}
                myFarmerId={myFarmerId}
                t={t}
              />
              <PodiumBlock
                entry={data[0]}
                pos={1}
                myFarmerId={myFarmerId}
                t={t}
                tall
              />
              <PodiumBlock
                entry={data[2]}
                pos={3}
                myFarmerId={myFarmerId}
                t={t}
              />
            </View>
          )}

          {data.slice(data.length >= 3 ? 3 : 0).map((entry) => (
            <RankRow
              key={entry.farmerId}
              entry={entry}
              isMe={entry.farmerId?.toString() === myFarmerId?.toString()}
              t={t}
            />
          ))}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

// ── Podium block (top 3) ──────────────────────────────────────────────────────
function PodiumBlock({ entry, pos, myFarmerId, tall, t }) {
  const isMe = entry.farmerId?.toString() === myFarmerId?.toString();
  const rs = RANK_STYLES[pos - 1];

  return (
    <View style={[styles.podiumBlock, tall && styles.podiumBlockTall]}>
      <MaterialCommunityIcons name={rs.icon} size={28} color={rs.iconColor} />

      <View style={[styles.podiumAvatar, isMe && styles.podiumAvatarMe]}>
        <Text style={styles.podiumAvatarLetter}>
          {(entry.name || "?")[0].toUpperCase()}
        </Text>
      </View>

      <Text style={styles.podiumName} numberOfLines={1}>
        {isMe ? t("You") : entry.name || t("Farmer")}
      </Text>

      <View
        style={[
          styles.levelBadge,
          {
            backgroundColor: LEVEL_COLORS[entry.level] + "22",
            borderColor: LEVEL_COLORS[entry.level],
          },
        ]}
      >
        <MaterialCommunityIcons
          name={LEVEL_ICONS[entry.level]}
          size={12}
          color={LEVEL_COLORS[entry.level]}
        />
        <Text style={[styles.levelText, { color: LEVEL_COLORS[entry.level] }]}>
          {t(entry.level)}
        </Text>
      </View>

      <View
        style={[
          styles.podiumScore,
          { backgroundColor: rs.border + "22", borderColor: rs.border },
        ]}
      >
        <Text style={[styles.podiumScoreNum, { color: rs.num }]}>
          {entry.totalPoints}
        </Text>
        <Text style={styles.podiumScoreLbl}>{t("pts")}</Text>
      </View>
    </View>
  );
}

// ── Regular rank row (4th and below) ─────────────────────────────────────────
function RankRow({ entry, isMe, t }) {
  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={styles.rankNumWrap}>
        <Text style={[styles.rankNum, isMe && styles.rankNumMe]}>
          #{entry.rank}
        </Text>
      </View>

      <View style={[styles.rowAvatar, isMe && styles.rowAvatarMe]}>
        <Text style={styles.rowAvatarLetter}>
          {(entry.name || "?")[0].toUpperCase()}
        </Text>
      </View>

      <View style={styles.rowInfo}>
        <Text
          style={[styles.rowName, isMe && styles.rowNameMe]}
          numberOfLines={1}
        >
          {isMe ? t("You") : entry.name || t("Farmer")}
        </Text>
        <View style={styles.rowLevelRow}>
          <MaterialCommunityIcons
            name={LEVEL_ICONS[entry.level]}
            size={12}
            color={LEVEL_COLORS[entry.level]}
          />
          <Text style={[styles.rowLevel, { color: LEVEL_COLORS[entry.level] }]}>
            {t(entry.level)}
          </Text>
        </View>
      </View>

      <Text style={[styles.rowPoints, isMe && styles.rowPointsMe]}>
        {entry.totalPoints} {t("pts")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFF",
  },
  back: { marginRight: 4 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#264653" },
  headerSub: { fontSize: 12, color: "#888", marginTop: 2 },
  myRankBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8F5F3",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2A9D8F",
  },
  myRankText: { fontSize: 14, color: "#264653", fontWeight: "600" },
  myRankNum: { fontSize: 16, color: "#2A9D8F", fontWeight: "900" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingTop: 80,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#264653" },
  emptySub: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  scroll: { padding: 16, paddingBottom: 50 },
  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
    marginTop: 8,
  },
  podiumBlock: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    elevation: 3,
    gap: 6,
  },
  podiumBlockTall: { paddingVertical: 24, elevation: 5 },
  podiumAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5F3",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2A9D8F",
  },
  podiumAvatarMe: { borderColor: "#FFD700", backgroundColor: "#FFF8E1" },
  podiumAvatarLetter: { fontSize: 20, fontWeight: "800", color: "#264653" },
  podiumName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#264653",
    textAlign: "center",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  levelText: { fontSize: 10, fontWeight: "700" },
  podiumScore: {
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
  },
  podiumScoreNum: { fontSize: 18, fontWeight: "900" },
  podiumScoreLbl: { fontSize: 10, color: "#888" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  rowMe: {
    backgroundColor: "#E8F5F3",
    borderWidth: 1.5,
    borderColor: "#2A9D8F",
  },
  rankNumWrap: { width: 36, alignItems: "center" },
  rankNum: { fontSize: 16, fontWeight: "800", color: "#BDBDBD" },
  rankNumMe: { color: "#2A9D8F" },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  rowAvatarMe: { backgroundColor: "#2A9D8F" },
  rowAvatarLetter: { fontSize: 16, fontWeight: "800", color: "#264653" },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: "600", color: "#264653" },
  rowNameMe: { color: "#2A9D8F" },
  rowLevelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  rowLevel: { fontSize: 11, fontWeight: "600" },
  rowPoints: { fontSize: 16, fontWeight: "800", color: "#264653" },
  rowPointsMe: { color: "#2A9D8F" },
});
