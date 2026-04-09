<?php

namespace App\Http\Requests\Prediction;

use Illuminate\Foundation\Http\FormRequest;

class StorePredictionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'predicted_home_score' => ['required', 'integer', 'min:0'],
            'predicted_away_score' => ['required', 'integer', 'min:0'],
        ];
    }
}
