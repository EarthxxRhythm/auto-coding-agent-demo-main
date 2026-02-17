import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div classNametext"min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div classNametext"bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 classNametext"text-3xl font-bold text-center mb-6 text-gray-900">
          Sign Up
        </h1>
        <p classNametext"text-center text-gray-600 mb-8">
          Create your account to get started with Spring FES Video
        </p>
        <RegisterForm />
      </div>
    </div>
  )
}
