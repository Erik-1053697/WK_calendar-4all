<?php

namespace App\Http\Requests\PredictionGroup;

use Illuminate\Foundation\Http\FormRequest;

class StorePredictionGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:80'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Geef je voorspellersgroep een naam.',
            'name.min' => 'De groepsnaam moet minstens 2 tekens hebben.',
            'name.max' => 'De groepsnaam mag maximaal 80 tekens bevatten.',
        ];
    }
}
