<?php

namespace App\Http\Requests\Prediction;

use Illuminate\Foundation\Http\FormRequest;

class SaveGroupWinnerPredictionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'predictions' => ['required', 'array', 'min:1'],
            'predictions.*.group_id' => ['required', 'integer', 'exists:groups,id'],
            'predictions.*.team_id' => ['required', 'integer', 'exists:teams,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'predictions.required' => 'Sla minstens één groepswinnaar op.',
            'predictions.array' => 'De groepswinnaars moeten als lijst worden verzonden.',
            'predictions.min' => 'Sla minstens één groepswinnaar op.',
            'predictions.*.group_id.required' => 'Elke groepsvoorspelling heeft een groep nodig.',
            'predictions.*.group_id.integer' => 'Een groep-id is ongeldig.',
            'predictions.*.group_id.exists' => 'Een gekozen groep bestaat niet.',
            'predictions.*.team_id.required' => 'Kies per groep een team.',
            'predictions.*.team_id.integer' => 'Een team-id is ongeldig.',
            'predictions.*.team_id.exists' => 'Een gekozen team bestaat niet.',
        ];
    }
}
