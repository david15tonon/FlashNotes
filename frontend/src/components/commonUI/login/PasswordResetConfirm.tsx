import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

export const PasswordResetConfirm: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const { register, handleSubmit, formState: { errors } } = useForm<{ newPassword: string }>()
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onSubmit = async (data: { newPassword: string }) => {
    setErrorMessage(null) // Réinitialise les messages d'erreur
    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, token }),
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.detail || 'An error occurred while resetting the password.')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      setErrorMessage('An unexpected error occurred. Please try again later.')
    }
  }

  return (
    <div>
      <h1>Reset Password</h1>
      {success ? (
        <p>Your password has been reset successfully. You can now log in.</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              placeholder="Enter your new password"
              {...register('newPassword', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />
            {errors.newPassword && <p className="error">{errors.newPassword.message}</p>}
          </div>
          {errorMessage && <p className="error">{errorMessage}</p>}
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  )
}