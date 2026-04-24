import { api } from './api';

export async function getOverview() {
  const response = await api.get('/overview');
  return response.data.data;
}

export async function getMatches() {
  const response = await api.get('/matches');
  return response.data.data;
}

export async function getGroups() {
  const response = await api.get('/groups/standings');
  return response.data.data;
}

export async function getLeaderboard() {
  const response = await api.get('/leaderboard');
  return response.data.data;
}

export async function getPredictionDashboard() {
  const response = await api.get('/predictions/dashboard');
  return response.data.data;
}

export async function savePrediction(matchId, payload, hasPrediction) {
  const endpoint = `/matches/${matchId}/prediction`;
  const response = hasPrediction
    ? await api.put(endpoint, payload)
    : await api.post(endpoint, payload);

  return response.data.data;
}

export async function lockPrediction(matchId) {
  const response = await api.post(`/matches/${matchId}/prediction/lock`);
  return response.data.data;
}
