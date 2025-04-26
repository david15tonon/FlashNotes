import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

export const PasswordResetRequest: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>()
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onSubmit = async (data: { email: string }) => {
    setErrorMessage(null) // Réinitialise les messages d'erreur
    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.detail || 'An error occurred while requesting a password reset.')
      }
    } catch (error) {
      console.error('Error requesting password reset:', error)
      setErrorMessage('An unexpected error occurred. Please try again later.')
    }
  }

  return (
    <div>
      <h1>Request Password Reset</h1>
      {success ? (
        <p>A link to reset your password has been sent to your email.</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>
          {errorMessage && <p className="error">{errorMessage}</p>}
          <button type="submit">Request Password Reset</button>
        </form>
      )}
    </div>
  )
}