// app/quiz-attempt.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWrapper from "../src/components/common/ScreenWrapper";
import useFarmerOnly from "../hooks/useFarmerOnly";
import Button from "../src/components/common/Button";
import { useAuth } from "../src/context/AuthContext";
import { API_BASE_URL } from "../secret";

export default function QuizAttemptScreen() {
  const isFarmer = useFarmerOnly();
  const { user } = useAuth();
  const authToken = user?.token;
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const router = useRouter();
  const { id, title } = useLocalSearchParams();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!authToken || !id) return;
    fetchQuiz();
  }, [authToken, id, lang]);

  if (!isFarmer) return null;

  const fetchQuiz = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/gamification/quizzes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Accept-Language": lang,
          },
        },
      );
      const json = await res.json();
      if (res.ok) {
        setQuiz(json.quiz);
      } else {
        Alert.alert(t("Error"), json.message || t("Failed to load quiz"));
        router.back();
      }
    } catch (e) {
      Alert.alert(t("Error"), t("Network error loading quiz"));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIdx, optIdx) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      Alert.alert(
        t("Incomplete"),
        t("Please answer all questions before submitting."),
      );
      return;
    }
    const answersArray = quiz.questions.map((_, i) => answers[i]);
    try {
      setSubmitting(true);
      const res = await fetch(
        `${API_BASE_URL}/api/gamification/quizzes/${id}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            "Accept-Language": lang,
          },
          body: JSON.stringify({ answers: answersArray }),
        },
      );
      const json = await res.json();
      if (res.ok) {
        setResult(json);
      } else {
        Alert.alert(t("Error"), json.message || t("Submission failed"));
      }
    } catch (e) {
      Alert.alert(t("Error"), t("Network error submitting quiz"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2A9D8F" />
        </View>
      </ScreenWrapper>
    );
  }

  // ── Result screen ─────────────────────────────────────────────────────────────
  if (result) {
    return (
      <ScreenWrapper>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <View
            style={[
              styles.resultCard,
              result.passed ? styles.resultPass : styles.resultFail,
            ]}
          >
            <MaterialCommunityIcons
              name={
                result.perfect
                  ? "trophy"
                  : result.passed
                    ? "check-circle"
                    : "close-circle"
              }
              size={56}
              color={result.passed ? "#4CAF50" : "#E76F51"}
            />
            <Text style={styles.resultScore}>{result.score}%</Text>
            <Text style={styles.resultLabel}>
              {result.perfect
                ? t("🏆 Perfect Score!")
                : result.passed
                  ? t("✅ Passed!")
                  : t("❌ Not passed")}
            </Text>
            <Text style={styles.resultSub}>
              {result.correct}/{result.total} {t("correct")} · {t("Passing")}:{" "}
              {result.passingScore}%
            </Text>
            {result.pointsAwarded > 0 && (
              <View style={styles.pointsEarned}>
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.pointsEarnedText}>
                  +{result.pointsAwarded} {t("points earned!")}
                </Text>
              </View>
            )}
            {result.badgeAwarded && (
              <View style={styles.badgeEarned}>
                <MaterialCommunityIcons
                  name="trophy"
                  size={16}
                  color="#FFD700"
                />
                <Text style={styles.badgeEarnedText}>
                  {t("Knowledge Champion badge unlocked!")}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.breakdownTitle}>{t("Answer Breakdown")}</Text>
          {result.breakdown.map((item, i) => (
            <View
              key={i}
              style={[
                styles.breakdownItem,
                item.isCorrect ? styles.bCorrect : styles.bWrong,
              ]}
            >
              <View style={styles.bHeader}>
                <MaterialCommunityIcons
                  name={item.isCorrect ? "check-circle" : "close-circle"}
                  size={18}
                  color={item.isCorrect ? "#4CAF50" : "#E76F51"}
                />
                <Text style={styles.bQ} numberOfLines={3}>
                  {item.question}
                </Text>
              </View>
              <Text style={styles.bYour}>
                {t("Your answer")}: {item.yourAnswer}
              </Text>
              {!item.isCorrect && (
                <Text style={styles.bCorrectAns}>
                  {t("Correct")}: {item.correctAnswer}
                </Text>
              )}
              {item.explanation && (
                <Text style={styles.bExplain}>💡 {item.explanation}</Text>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.replace("/quizzes")}
          >
            <Text style={styles.doneBtnText}>{t("Back to Quizzes")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenWrapper>
    );
  }

  // ── Quiz attempt screen ───────────────────────────────────────────────────────
  const answered = Object.keys(answers).length;
  const total = quiz?.questions?.length ?? 0;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#264653" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerProgress}>
            {answered}/{total} {t("answered")}
          </Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: total > 0 ? `${(answered / total) * 100}%` : "0%" },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {quiz?.questions?.map((q, qIdx) => (
          <View key={qIdx} style={styles.questionBlock}>
            <Text style={styles.qLabel}>Q{qIdx + 1}</Text>
            <Text style={styles.qText}>{q.question}</Text>
            {q.options.map((opt, oIdx) => {
              const selected = answers[qIdx] === oIdx;
              return (
                <TouchableOpacity
                  key={oIdx}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => handleSelect(qIdx, oIdx)}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.optionDot,
                      selected && styles.optionDotSelected,
                    ]}
                  >
                    {selected && <View style={styles.optionDotInner} />}
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <Button
          title={submitting ? t("Submitting...") : t("Submit Quiz")}
          onPress={handleSubmit}
          disabled={submitting || answered < total}
          style={[
            styles.submitBtn,
            answered < total && styles.submitBtnDisabled,
          ]}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#FFF",
  },
  back: { marginRight: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#264653" },
  headerProgress: { fontSize: 12, color: "#888" },
  progressBar: { height: 4, backgroundColor: "#E0E0E0" },
  progressFill: { height: "100%", backgroundColor: "#2A9D8F" },
  scroll: { padding: 16, paddingBottom: 40 },
  questionBlock: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  qLabel: { fontSize: 11, color: "#888", fontWeight: "700", marginBottom: 4 },
  qText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#264653",
    marginBottom: 14,
    lineHeight: 22,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  optionSelected: { borderColor: "#2A9D8F", backgroundColor: "#F0FAF9" },
  optionDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#BDBDBD",
    justifyContent: "center",
    alignItems: "center",
  },
  optionDotSelected: { borderColor: "#2A9D8F" },
  optionDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2A9D8F",
  },
  optionText: { flex: 1, fontSize: 14, color: "#444" },
  optionTextSelected: { color: "#264653", fontWeight: "600" },
  submitBtn: { marginTop: 8, borderRadius: 14 },
  submitBtnDisabled: { opacity: 0.5 },
  resultScroll: { padding: 20, paddingBottom: 50 },
  resultCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginBottom: 24,
    elevation: 3,
  },
  resultPass: { backgroundColor: "#E8F5E9" },
  resultFail: { backgroundColor: "#FBE9E7" },
  resultScore: {
    fontSize: 52,
    fontWeight: "900",
    color: "#264653",
    marginTop: 8,
  },
  resultLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: "#264653",
    marginTop: 4,
  },
  resultSub: { fontSize: 13, color: "#666", marginTop: 6 },
  pointsEarned: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  pointsEarnedText: { color: "#F57F17", fontWeight: "700" },
  badgeEarned: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  badgeEarnedText: { color: "#F57F17", fontWeight: "700" },
  breakdownTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#264653",
    marginBottom: 12,
  },
  breakdownItem: { borderRadius: 12, padding: 14, marginBottom: 10 },
  bCorrect: { backgroundColor: "#F1F8E9" },
  bWrong: { backgroundColor: "#FBE9E7" },
  bHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  bQ: { flex: 1, fontSize: 13, fontWeight: "600", color: "#264653" },
  bYour: { fontSize: 12, color: "#555", marginBottom: 2 },
  bCorrectAns: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 4,
  },
  bExplain: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    lineHeight: 17,
  },
  doneBtn: {
    backgroundColor: "#2A9D8F",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  doneBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
