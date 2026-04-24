<?php

use App\Http\Controllers\Api\AdminMatchController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\MatchController;
use App\Http\Controllers\Api\OverviewController;
use App\Http\Controllers\Api\PredictionDashboardController;
use App\Http\Controllers\Api\PredictionController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/matches', [MatchController::class, 'index']);
Route::get('/overview', OverviewController::class);
Route::get('/schedule', [MatchController::class, 'schedule']);
Route::get('/groups/standings', [GroupController::class, 'standings']);
Route::get('/leaderboard', LeaderboardController::class);
Route::get('/matches/{match}', [MatchController::class, 'show']);
Route::get('/matches/{match}/predictions', [MatchController::class, 'predictions']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/matches/{match}/my-prediction', [PredictionController::class, 'myPrediction']);
    Route::post('/matches/{match}/prediction', [PredictionController::class, 'store']);
    Route::put('/matches/{match}/prediction', [PredictionController::class, 'update']);
    Route::post('/matches/{match}/prediction/lock', [PredictionController::class, 'lock']);
    Route::get('/predictions/dashboard', PredictionDashboardController::class);

    Route::prefix('admin')->group(function (): void {
        Route::put('/matches/{match}/lock', [AdminMatchController::class, 'lock']);
        Route::put('/matches/{match}/unlock', [AdminMatchController::class, 'unlock']);
    });
});
