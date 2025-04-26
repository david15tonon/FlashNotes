import Logo from '@/assets/Logo.svg'
import useAuth from '@/hooks/useAuth'
import { Container, Field, Fieldset, Image, Text } from '@chakra-ui/react'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { Body_login_login_access_token as AccessToken } from '../../client'
import { DefaultButton } from '../../components/commonUI/Button'
import { DefaultInput } from '../../components/commonUI/Input'

// Définition d'emailPattern
const emailPattern = /^\S+@\S+\.\S+$/

export const Route = createFileRoute('/_publicLayout/login')({
  component: Login,
  beforeLoad: async () => {
    const isGuest = localStorage.getItem('guest_mode') === 'true'
    const isLoggedIn = Boolean(localStorage.getItem('access_token')) || isGuest
    if (isLoggedIn) {
      throw redirect({
        to: '/collections',
      })
    }
  },
})

function Login() {
  const { t } = useTranslation()
  const { loginMutation, error, resetError } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return

    resetError()

    try {
      await loginMutation.mutateAsync(data)
    } catch {
      // error is handled by useAuth hook
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
      <Link to="/" style={{ display: 'flex', justifyContent: 'center' }}>
        <Image
          src={Logo}
          alt="Logo"
          height="auto"
          maxW="2xs"
          alignSelf="center"
          mb={4}
          cursor="pointer"
        />
      </Link>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Fieldset.Root maxW="sm">
          <Fieldset.Content>
            <Field.Root>
              <Field.Label>{t('general.words.email')}</Field.Label>
              <DefaultInput
                type="email"
                placeholder={t('general.words.email')}
                {...register('username', {
                  required: t('general.errors.usernameIsRequired'),
                  pattern: {
                    value: emailPattern,
                    message: t('general.errors.invalidEmail'),
                  },
                })}
              />
              {errors.username && (
                <Text color="red.500" fontSize="sm">
                  {errors.username.message}
                </Text>
              )}
              <Field.Root>
                <Field.Label>{t('general.words.password')}</Field.Label>
                <DefaultInput
                  type="password"
                  placeholder={t('general.words.password')}
                  {...register('password', {
                    required: t('general.errors.passwordIsRequired'),
                  })}
                />
                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </Field.Root>
            </Field.Root>
          </Fieldset.Content>
          <DefaultButton type="submit" loading={isSubmitting} color="fg.primary">
            {t('general.actions.login')}
          </DefaultButton>
        </Fieldset.Root>
      </form>
      <Text color="fg.primary" mt={2}>
        <Link
          to="/password-reset-request"
          style={{ color: '#007bff', textDecoration: 'underline' }}
        >
          {t('general.actions.forgotPassword')}
        </Link>
      </Text>
    </Container>
  )
}
