import Layout from "../../components/Layout/Layout"
import AuthContainer from "../../components/Authentication/AuthContainer"

const Login = () => {
  return (
    <Layout>
      <div className="login">
        <AuthContainer
            method="login"
            route="/auth/signin"
          />
      </div>
    </Layout>
  )
}

export default Login
