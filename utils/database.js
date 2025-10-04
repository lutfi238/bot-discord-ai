// In-memory storage for conversation history
// This replaces SQLite to avoid compilation issues on hosting platforms

const conversationStorage = new Map();

/**
 * Gets the conversation history for a channel.
 * @param {string} channelId
 * @returns {Array<Object> | null}
 */
function getConversation(channelId) {
  return conversationStorage.get(channelId) || null;
}

/**
 * Sets the conversation history for a channel.
 * @param {string} channelId
 * @param {Array<Object>} history
 */
function setConversation(channelId, history) {
  conversationStorage.set(channelId, history);
}

/**
 * Deletes the conversation history for a channel.
 * @param {string} channelId
 */
function deleteConversation(channelId) {
  conversationStorage.delete(channelId);
}

/**
 * Loads all conversations into a Map.
 * @returns {Map<string, Array<Object>>}
 */
function loadAllConversations() {
    return new Map(conversationStorage);
}

module.exports = {
  getConversation,
  setConversation,
  deleteConversation,
  loadAllConversations,
};