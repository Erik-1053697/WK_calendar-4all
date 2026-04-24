<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vul je naam in.',
            'name.max' => 'Je naam mag maximaal 255 tekens bevatten.',
            'email.required' => 'Vul je e-mailadres in.',
            'email.email' => 'Vul een geldig e-mailadres in.',
            'email.unique' => 'Er bestaat al een account met dit e-mailadres.',
            'password.required' => 'Vul een wachtwoord in.',
            'password.confirmed' => 'De wachtwoorden komen niet overeen.',
            'password.min' => 'Je wachtwoord moet minimaal 8 tekens bevatten.',
            'password.letters' => 'Je wachtwoord moet minimaal één letter bevatten.',
            'password.numbers' => 'Je wachtwoord moet minimaal één cijfer bevatten.',
        ];
    }
}
