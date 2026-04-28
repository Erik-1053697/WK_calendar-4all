<?php

namespace App\Http\Requests\PredictionGroup;

use Illuminate\Foundation\Http\FormRequest;

class JoinPredictionGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'invite_code' => ['required', 'string', 'min:4', 'max:16'],
        ];
    }

    public function messages(): array
    {
        return [
            'invite_code.required' => 'Vul een uitnodigingscode in.',
            'invite_code.min' => 'De uitnodigingscode is te kort.',
            'invite_code.max' => 'De uitnodigingscode is te lang.',
        ];
    }
}
