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

    public function messages(): array
    {
        return [
            'predicted_home_score.required' => 'Vul een score voor het thuisspelende team in.',
            'predicted_home_score.integer' => 'De score van het thuisspelende team moet een heel getal zijn.',
            'predicted_home_score.min' => 'De score van het thuisspelende team mag niet negatief zijn.',
            'predicted_away_score.required' => 'Vul een score voor het uitspelende team in.',
            'predicted_away_score.integer' => 'De score van het uitspelende team moet een heel getal zijn.',
            'predicted_away_score.min' => 'De score van het uitspelende team mag niet negatief zijn.',
        ];
    }
}
