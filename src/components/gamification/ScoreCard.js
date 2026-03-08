// src/components/gamification/ScoreCard.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

const LEVEL_CONFIG = {
  Bronze: {
    color: "#CD7F32",
    bg: "#FFF8F0",
    icon: "shield",
    next: "Silver",
    max: 499,
  },
  Silver: {
    color: "#A8A9AD",
    bg: "#F5F5F5",
    icon: "shield-half-full",
    next: "Gold",
    max: 1499,
  },
  Gold: {
    color: "#FFD700",
    bg: "#FFFDE7",
    icon: "shield-star",
    next: null,
    max: null,
  },
};

export default function ScoreCard({
  totalPoints = 0,
  level = "Bronze",
  pointsToNext,
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.Bronze;
  const levelMin = level === "Bronze" ? 0 : level === "Silver" ? 500 : 1500;
  const levelMax = cfg.max ?? totalPoints;
  const progress = cfg.max
    ? Math.min(
        ((totalPoints - levelMin) / (levelMax - levelMin + 1)) * 100,
        100,
      )
    : 100;

  return (
    <View
      style={[styles.card, { backgroundColor: cfg.bg, borderColor: cfg.color }]}
    >
      {/* Level badge + points */}
      <View style={styles.row}>
        <View style={[styles.levelBadge, { backgroundColor: cfg.color }]}>
          <MaterialCommunityIcons name={cfg.icon} size={18} color="#FFF" />
          <Text style={styles.levelText}>{t(level)}</Text>
        </View>

        <View style={styles.pointsBlock}>
          <Text style={[styles.pointsNumber, { color: cfg.color }]}>
            {totalPoints}
          </Text>
          <Text style={styles.pointsLabel}>{t("points")}</Text>
        </View>
      </View>

      {/* Progress bar toward next level */}
      {cfg.next && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: cfg.color },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {pointsToNext} {t("pts to")} {t(cfg.next)}
          </Text>
        </View>
      )}
      {!cfg.next && (
        <Text style={[styles.maxLevel, { color: cfg.color }]}>
          {t("🏆 Maximum Level Reached!")}
        </Text>
      )}

      {/* Rewards teaser */}
      <TouchableOpacity
        style={[styles.rewardTeaser, { borderColor: cfg.color + "55" }]}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="gift-outline"
          size={16}
          color={cfg.color}
        />
        <Text style={[styles.rewardText, { color: cfg.color }]}>
          {t("Coming soon: Redeem your points for rewards")}
        </Text>
        <MaterialCommunityIcons
          name="lock-outline"
          size={14}
          color={cfg.color + "99"}
        />
      </TouchableOpacity>

      {/* View history */}
      <TouchableOpacity
        onPress={() => router.push("/achievements")}
        style={styles.historyLink}
      >
        <Text style={styles.historyText}>{t("View badges & history")} →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  levelText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  pointsBlock: { alignItems: "flex-end" },
  pointsNumber: { fontSize: 28, fontWeight: "800" },
  pointsLabel: { fontSize: 12, color: "#888", marginTop: -4 },
  progressSection: { marginBottom: 12 },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressLabel: { fontSize: 11, color: "#888", textAlign: "right" },
  maxLevel: { textAlign: "center", fontWeight: "700", marginBottom: 12 },
  rewardTeaser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  rewardText: { flex: 1, fontSize: 12, fontWeight: "500" },
  historyLink: { alignItems: "center", paddingTop: 4 },
  historyText: { fontSize: 12, color: "#2A9D8F" },
});
