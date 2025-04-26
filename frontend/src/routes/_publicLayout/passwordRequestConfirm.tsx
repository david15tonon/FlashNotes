
import { Container, Field, Fieldset, Text } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { DefaultButton } from '../../components/commonUI/Button'
import { DefaultInput } from '../../components/commonUI/Input'


function PasswordResetConfirm() {
  const { t } = useTranslation()
  const { token } = useParams<{ token: string }>()
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ newPassword: string }>()

  const onSubmit = async (data: { newPassword: string }) => {
    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, token }),
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
              <Field.Label>{t('general.words.newPassword')}</Field.Label>
              <DefaultInput
                type="password"
                placeholder={t('general.words.newPassword')}
                {...register('newPassword', {
                  required: t('general.errors.passwordIsRequired'),
                  minLength: {
                    value: 8,
                    message: t('general.errors.passwordTooShort'),
                  },
                })}
              />
              {errors.newPassword && (
                <Text color="red.500" fontSize="sm">
                  {errors.newPassword.message}
                </Text>
              )}
            </Field.Root>
          </Fieldset.Content>
          <DefaultButton type="submit" loading={isSubmitting}>
            {t('general.actions.resetPassword')}
          </DefaultButton>
        </Fieldset.Root>
      </form>
      {success && (
        <Text color="green.500" mt={2}>
          {t('general.messages.passwordResetSuccess')}
        </Text>
      )}
    </Container>
  )
}

export default PasswordResetConfirm