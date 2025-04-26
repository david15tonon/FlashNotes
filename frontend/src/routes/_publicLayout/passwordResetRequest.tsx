import { Container, Field, Fieldset, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { DefaultButton } from '../../components/commonUI/Button'
import { DefaultInput } from '../../components/commonUI/Input'

function PasswordResetRequest() {
  const { t } = useTranslation()
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>()

  const onSubmit = async (data: { email: string }) => {
    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        setSuccess(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container
      h="100dvh"
      maxW="sm"
      alignItems="stretch"
      justifyContent="center"
      gap={4}
      centerContent
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Fieldset.Root maxW="sm">
          <Fieldset.Content>
            <Field.Root>
              <Field.Label>{t('general.words.email')}</Field.Label>
              <DefaultInput
                type="email"
                placeholder={t('general.words.email')}
                {...register('email', {
                  required: t('general.errors.emailIsRequired'),
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: t('general.errors.invalidEmail'),
                  },
                })}
              />
              {errors.email && (
                <Text color="red.500" fontSize="sm">
                  {errors.email.message}
                </Text>
              )}
            </Field.Root>
          </Fieldset.Content>
          <DefaultButton type="submit" loading={isSubmitting}>
            {t('general.actions.requestPasswordReset')}
          </DefaultButton>
        </Fieldset.Root>
      </form>
      {success && (
        <Text color="green.500" mt={2}>
          {t('general.messages.passwordResetEmailSent')}
        </Text>
      )}
    </Container>
  )
}

export default PasswordResetRequest
