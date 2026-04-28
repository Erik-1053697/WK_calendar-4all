<?php

namespace App\Http\Requests\Prediction;

use Illuminate\Foundation\Http\FormRequest;

class SaveTournamentWinnerPredictionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'team_id' => ['required', 'integer', 'exists:teams,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'team_id.required' => 'Kies een team als eindwinnaar.',
            'team_id.integer' => 'De gekozen eindwinnaar is ongeldig.',
            'team_id.exists' => 'Het gekozen team bestaat niet.',
        ];
    }
}
