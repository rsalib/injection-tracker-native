import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InputField } from '../ui/InputField.jsx';
import { Pressable } from '../ui/Pressable.jsx';
import { callGeminiChat } from '../../services/gemini.js';
import { colors, glass, input, type } from '../../theme.js';

export function AIAssistant({ meds, interactions, onRecheck }) {
  const actionableInteractions = (Array.isArray(interactions) ? interactions : []).filter(i => i.severity && !["none", "safe"].includes(i.severity.toLowerCase()));

  const GREETING = { role: "assistant", content: "Hi! I'm your AI health assistant powered by Gemini. I can answer questions about your protocols, calculations, and clinical data.\n\n⚠️ Always consult a licensed physician before changing your protocol." };
  const CHAT_KEY = "aiChatHistory";
  const MAX_STORED = 20;

  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(CHAT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [GREETING];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recheckLoading, setRecheckLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    try {
      const toStore = messages.slice(-MAX_STORED);
      localStorage.setItem(CHAT_KEY, JSON.stringify(toStore));
    } catch {}
  }, [messages]);

  const clearChat = () => {
    setMessages([GREETING]);
    try { localStorage.removeItem(CHAT_KEY); } catch {}
  };

  const medCtx = meds.length > 0 ? `Current medications: ${meds.map(m => `${m.name} ${m.dose}${m.unit}`).join(", ")}.` : "No medications tracked.";
  const intCtx = actionableInteractions.length > 0 ? `Known interactions: ${actionableInteractions.map(i => `${i.pair} (${i.severity})`).join(", ")}.` : "No known interactions.";

  const systemPrompt = `You are a knowledgeable AI health assistant specializing in peptide therapy, TRT, and injectable medications. ${medCtx} \n\nCRITICAL LOCAL DATA: ${intCtx}\nIf the user asks about their protocols or interactions, you MUST explicitly list the known interactions provided in the CRITICAL LOCAL DATA above before summarizing external research. Be conversational, concise, and always recommend consulting a physician for medical decisions. Do not use emojis in your responses.`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await callGeminiChat(newMsgs, systemPrompt, true);
      const assistantMsg = {
        role: "assistant",
        content: res.text,
        groundingMetadata: res.groundingMetadata
      };
      const updatedMsgs = [...newMsgs, assistantMsg];
      setMessages(updatedMsgs);
      localStorage.setItem(CHAT_KEY, JSON.stringify(updatedMsgs));
    } catch (e) {
      console.error("AI Assistant Error:", e);
      setMessages([...newMsgs, { role: "assistant", content: `[SYSTEM ERROR]: ${e.message}\nPlease check browser DevTools for details.` }]);
    }
    setLoading(false);
  };

  const runRecheck = async () => {
    setRecheckLoading(true);
    await onRecheck();
    setRecheckLoading(false);
  };

  const SUGGESTIONS = ["Benefits of BPC-157?", "Reconstitution storage?", "Best time for GH peptides?", "Explain interactions"];

  return (
    <View style={styles.container}>

      {messages.length > 1 && (
        <View style={styles.clearRow}>
          <Pressable onPress={clearChat} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>🗑️ CLEAR CHAT</Text>
          </Pressable>
        </View>
      )}

      {/* Chat window */}
      <View style={styles.chatWindow}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.msgRow, m.role === "user" && styles.msgRowUser]}>
            <View style={[
              styles.msgBubble,
              m.role === "user" ? styles.msgBubbleUser : styles.msgBubbleAssistant
            ]}>
              <Text style={styles.msgText}>{m.content}</Text>

              {m.groundingMetadata?.groundingChunks && m.groundingMetadata.groundingChunks.length > 0 && (
                <View style={styles.sourcesSection}>
                  <Text style={styles.sourcesLabel}>Sources Cited:</Text>
                  <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                    {m.groundingMetadata.groundingChunks.map((chunk, cIdx) => {
                      const url = chunk.web?.uri;
                      const title = chunk.web?.title || url;
                      if (!url) return null;
                      return (
                        <li key={cIdx} style={{ fontSize: 12 }}>
                          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: colors.blue, textDecoration: "none", fontWeight: 600 }}>
                            {title}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </View>
              )}
            </View>
          </View>
        ))}
        {loading && (
          <View style={styles.msgRow}>
            <View style={styles.loadingBubble}>
              <Text style={styles.loadingText}>Analyzing...</Text>
            </View>
          </View>
        )}
        <div ref={bottomRef} />
      </View>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <View style={styles.suggestions}>
          {SUGGESTIONS.map(q => (
            <Pressable key={q} onPress={() => setInput(q)} style={styles.suggestionBtn}>
              <Text style={styles.suggestionText}>{q}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <InputField id="field-aiassistant-8" name="field-aiassistant-8" nativeID="field-aiassistant-8"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          blurOnSubmit={false}
          style={styles.inputField}
          placeholder="Ask about your protocol..."
          placeholderTextColor={colors.textMuted}
        />
        <Pressable
          onPress={send}
          style={[styles.sendBtn, (loading || !input.trim()) && styles.sendBtnDisabled]}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22, color: colors.white }}>
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </Pressable>
      </View>
    </View>
  );
}

export default AIAssistant;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 16,
  },
  clearRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
  },
  clearBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 100,
    cursor: 'pointer',
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  chatWindow: {
    ...glass.card,
    borderRadius: 32,
    padding: 24,
    minHeight: 460,
    maxHeight: 500,
    overflowY: 'auto',
    flexDirection: 'column',
    gap: 16,
  },
  msgRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgBubble: {
    maxWidth: '85%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 15,
  },
  msgBubbleUser: {
    backgroundColor: colors.primary, // TODO: expo-linear-gradient(135deg, #0e7490, #0a84ff) for native
    borderRadius: 24,
    borderBottomRightRadius: 4,
    boxShadow: `0 4px 12px ${colors.blueMid}`,
  },
  msgBubbleAssistant: {
    backgroundColor: colors.surfaceMid,
    borderRadius: 24,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 4px 12px ${colors.shadowSoft}`,
  },
  msgText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    whiteSpace: 'pre-wrap',
  },
  sourcesSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  sourcesLabel: {
    ...type.formLabel,
    marginBottom: 8,
  },
  loadingBubble: {
    backgroundColor: colors.surfaceMid,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 8,
  },
  suggestionBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 100,
    cursor: 'pointer',
  },
  suggestionText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '800',
  },
  inputBar: {
    ...glass.card,
    borderRadius: 100,
    borderColor: colors.borderSubtle,
    boxShadow: `0 4px 24px ${colors.shadowHeavy}, inset 0 1px 0 ${colors.borderHighlight}`,
    flexDirection: 'row',
    gap: 12,
    padding: 8,
    alignItems: 'center',
  },
  inputField: {
    ...input.fieldChat,
  },
  sendBtn: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary, // TODO: expo-linear-gradient(135deg, #0e7490, #0a84ff) for native
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 16px ${colors.tealMid}, inset 0 1px 0 ${colors.borderHighlight}`,
    cursor: 'pointer',
  },
  sendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});
