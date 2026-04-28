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

export async function getPredictionGroups() {
  const response = await api.get('/prediction-groups');
  return response.data.data;
}

export async function getPredictionGroup(groupId) {
  const response = await api.get(`/prediction-groups/${groupId}`);
  return response.data.data;
}

export async function createPredictionGroup(name) {
  const response = await api.post('/prediction-groups', { name });
  return response.data.data;
}

export async function joinPredictionGroup(inviteCode) {
  const response = await api.post('/prediction-groups/join', { invite_code: inviteCode });
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

export async function saveTournamentWinnerPrediction(tournamentId, teamId) {
  const response = await api.put(`/tournaments/${tournamentId}/winner-prediction`, {
    team_id: Number(teamId),
  });

  return response.data;
}

export async function saveGroupWinnerPredictions(tournamentId, predictions) {
  const response = await api.put(`/tournaments/${tournamentId}/group-winner-predictions`, {
    predictions: predictions.map((prediction) => ({
      group_id: Number(prediction.group_id),
      team_id: Number(prediction.team_id),
    })),
  });

  return response.data;
}
